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
      } else if (entry.name.endsWith('.md')) {
        const key = prefix
          ? `${prefix}/${basename(entry.name, '.md')}`
          : basename(entry.name, '.md');
        const raw = readFileSync(join(dir, entry.name), 'utf8');
        this.store.set(key, this._parseSections(raw));
      }
    }
  }

  _parseSections(raw) {
    const sections = new Map();
    let current = null;
    let buf = [];

    for (const line of raw.split('\n')) {
      const m = line.match(/^<!--\s+#(\S+)\s+-->$/);
      if (m) {
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

  get(path, section = 'default', params = {}) {
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
    } catch {}
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
