#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const CONTENT_DIR = join(PKG_ROOT, '_content');
const OUTPUT_DIR = join(PKG_ROOT, 'rules');

// ---------------------------------------------------------------------------
// 1. Load YAML data
// ---------------------------------------------------------------------------

function loadYaml(name) {
  const raw = readFileSync(join(CONTENT_DIR, 'data', name), 'utf8');
  return yaml.load(raw);
}

const triggersData = loadYaml('triggers.yaml');
const effectsData = loadYaml('effects.yaml');
const metaData = loadYaml('meta.yaml');

const data = {
  triggers: triggersData.triggers,
  effects: effectsData,
  meta: metaData,
};

// ---------------------------------------------------------------------------
// 1b. Validate YAML schema
// ---------------------------------------------------------------------------

const TRIGGER_SCHEMA = {
  'event-trigger-rule.mjs': [
    'a11yAlias',
    'a11yNote',
    'hasReversed',
    'hasEffectId',
    'triggerTypeDescriptions',
    'stateActionDescriptions',
  ],
  'viewenter-rule.mjs': ['params', 'pitfalls', 'triggerTypeDescriptions'],
  'viewprogress-rule.mjs': ['params', 'pitfalls'],
  'pointermove-rule.mjs': ['params', 'pitfalls'],
};

const FIELD_VALIDATORS = {
  pitfalls(arr, trigger) {
    if (!Array.isArray(arr))
      throw new Error(`triggers.yaml: trigger "${trigger.name}".pitfalls must be an array`);
    for (const p of arr) {
      if (!p.id)
        throw new Error(
          `triggers.yaml: trigger "${trigger.name}" has a pitfall entry missing "id"`,
        );
    }
  },
  params(arr, trigger) {
    if (!Array.isArray(arr))
      throw new Error(`triggers.yaml: trigger "${trigger.name}".params must be an array`);
    for (const p of arr) {
      if (!p.name)
        throw new Error(
          `triggers.yaml: trigger "${trigger.name}" has a param entry missing "name"`,
        );
    }
  },
  hasReversed(val, trigger) {
    if (typeof val !== 'boolean')
      throw new Error(`triggers.yaml: trigger "${trigger.name}".hasReversed must be a boolean`);
  },
  hasEffectId(val, trigger) {
    if (typeof val !== 'boolean')
      throw new Error(`triggers.yaml: trigger "${trigger.name}".hasEffectId must be a boolean`);
  },
  triggerTypeDescriptions(obj, trigger) {
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val !== 'object' || !val.full)
        throw new Error(
          `triggers.yaml: trigger "${trigger.name}".triggerTypeDescriptions.${key} must be an object with a "full" key`,
        );
    }
  },
};

for (const trigger of data.triggers) {
  const required = TRIGGER_SCHEMA[trigger.template];
  if (!required) continue;
  for (const field of required) {
    if (trigger[field] === undefined) {
      throw new Error(
        `triggers.yaml: trigger "${trigger.name}" is missing required field "${field}" (needed by ${trigger.template})`,
      );
    }
    FIELD_VALIDATORS[field]?.(trigger[field], trigger);
  }
}

// ---------------------------------------------------------------------------
// 2. Load fragments  —  parse <!-- #section --> markers
// ---------------------------------------------------------------------------

class Fragments {
  constructor(dir) {
    this.store = new Map();
    this._loadDir(dir, '');
  }

  _loadDir(dir, prefix) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        this._loadDir(join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.name.endsWith('.md') && entry.name !== 'README.md') {
        const key = prefix
          ? `${prefix}/${basename(entry.name, '.md')}`
          : basename(entry.name, '.md');
        const raw = readFileSync(join(dir, entry.name), 'utf8');
        this.store.set(key, this._parseSections(raw, key));
      }
    }
  }

  _parseSections(raw, filePath) {
    const sections = new Map();
    let current = null;
    let buf = [];

    for (const line of raw.split('\n')) {
      const m = line.match(/^<!--\s+#(\S+)\s+-->$/);
      if (m) {
        if (current === null && buf.join('\n').trim()) {
          throw new Error(
            `Fragment "${filePath}" has content before the first <!-- #section --> marker. Add a marker or remove the content.`,
          );
        }
        if (current !== null) {
          sections.set(current, buf.join('\n').trim());
        }
        current = m[1];
        buf = [];
      } else {
        buf.push(line);
      }
    }
    if (current !== null) {
      sections.set(current, buf.join('\n').trim());
    }
    return sections;
  }

  get(path, sectionOrParams = 'default', params = {}) {
    let section;
    if (typeof sectionOrParams === 'object') {
      section = 'default';
      params = sectionOrParams;
    } else {
      section = sectionOrParams;
    }
    const sectionMap = this.store.get(path);
    if (!sectionMap) {
      throw new Error(`Fragment not found: ${path}`);
    }
    let content = sectionMap.get(section);
    if (content === undefined) {
      throw new Error(
        `Section "${section}" not found in fragment "${path}". Available: ${[...sectionMap.keys()].join(', ')}`,
      );
    }
    for (const [key, val] of Object.entries(params)) {
      content = content.replaceAll(`{{${key}}}`, val);
    }
    const unreplaced = content.match(/\{\{[^}]+\}\}/g);
    if (unreplaced) {
      throw new Error(
        `Unreplaced placeholders in fragment "${path}#${section}": ${unreplaced.join(', ')}`,
      );
    }
    return content;
  }
}

const fragments = new Fragments(join(CONTENT_DIR, 'fragments'));

// ---------------------------------------------------------------------------
// 3. Import templates and render via manifest
// ---------------------------------------------------------------------------

const manifest = [
  {
    template: 'event-trigger-rule.mjs',
    triggers: ['click', 'hover'],
    output: (name) => `${name}.md`,
  },
  { template: 'viewenter-rule.mjs', triggers: ['viewEnter'], output: () => 'viewenter.md' },
  {
    template: 'viewprogress-rule.mjs',
    triggers: ['viewProgress'],
    output: () => 'viewprogress.md',
  },
  { template: 'pointermove-rule.mjs', triggers: ['pointerMove'], output: () => 'pointermove.md' },
  { template: 'full-lean.mjs', triggers: null, output: () => 'full-lean.md' },
  { template: 'integration.mjs', triggers: null, output: () => 'integration.md' },
];

const outputs = [];

for (const entry of manifest) {
  const mod = await import(join(CONTENT_DIR, 'templates', entry.template));
  if (entry.triggers) {
    for (const name of entry.triggers) {
      const trigger = data.triggers.find((t) => t.name === name);
      if (!trigger) throw new Error(`Trigger "${name}" not found in triggers.yaml`);
      outputs.push({
        file: entry.output(name),
        content: mod.render({ ...data, trigger }, fragments),
      });
    }
  } else {
    outputs.push({ file: entry.output(), content: mod.render(data, fragments) });
  }
}

// ---------------------------------------------------------------------------
// 4. Write or check outputs
// ---------------------------------------------------------------------------

const checkMode = process.argv.includes('--check');

mkdirSync(OUTPUT_DIR, { recursive: true });

let stale = 0;
for (const { file, content } of outputs) {
  const outPath = join(OUTPUT_DIR, file);
  if (checkMode) {
    let existing = '';
    try {
      existing = readFileSync(outPath, 'utf8');
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
    if (existing !== content) {
      console.error(`  ✗ ${relative(PKG_ROOT, outPath)} is stale`);
      stale++;
    } else {
      console.log(`  ✓ ${relative(PKG_ROOT, outPath)} is up to date`);
    }
  } else {
    writeFileSync(outPath, content, 'utf8');
    console.log(`  ✓ ${relative(PKG_ROOT, outPath)}`);
  }
}

if (checkMode && stale > 0) {
  console.error(`\n${stale} file(s) are stale. Run \`yarn build:rules\` to regenerate.`);
  process.exit(1);
} else if (checkMode) {
  console.log(`\nAll ${outputs.length} rule files are up to date.`);
} else {
  console.log(`\nGenerated ${outputs.length} rule files.`);
}
