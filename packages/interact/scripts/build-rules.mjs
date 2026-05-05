#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, basename, extname, relative } from 'node:path';
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
      throw new Error(`Section "${section}" not found in fragment "${path}". Available: ${[...sectionMap.keys()].join(', ')}`);
    }
    for (const [key, val] of Object.entries(params)) {
      content = content.replaceAll(`{{${key}}}`, val);
    }
    return content;
  }
}

const fragments = new Fragments(join(CONTENT_DIR, 'fragments'));

// ---------------------------------------------------------------------------
// 3. Import templates and render
// ---------------------------------------------------------------------------

const outputs = [];

// Event trigger rules: click.md and hover.md
const eventTemplate = await import(join(CONTENT_DIR, 'templates', 'event-trigger-rule.mjs'));
for (const triggerName of ['click', 'hover']) {
  const trigger = data.triggers.find(t => t.name === triggerName);
  if (!trigger) throw new Error(`Trigger "${triggerName}" not found in triggers.yaml`);
  const md = eventTemplate.render(trigger, data, fragments);
  outputs.push({ file: `${triggerName}.md`, content: md });
}

// viewenter.md
const viewenterTemplate = await import(join(CONTENT_DIR, 'templates', 'viewenter-rule.mjs'));
const viewEnterTrigger = data.triggers.find(t => t.name === 'viewEnter');
outputs.push({
  file: 'viewenter.md',
  content: viewenterTemplate.render(viewEnterTrigger, data, fragments),
});

// viewprogress.md
const viewprogressTemplate = await import(join(CONTENT_DIR, 'templates', 'viewprogress-rule.mjs'));
const viewProgressTrigger = data.triggers.find(t => t.name === 'viewProgress');
outputs.push({
  file: 'viewprogress.md',
  content: viewprogressTemplate.render(viewProgressTrigger, data, fragments),
});

// pointermove.md
const pointermoveTemplate = await import(join(CONTENT_DIR, 'templates', 'pointermove-rule.mjs'));
const pointerMoveTrigger = data.triggers.find(t => t.name === 'pointerMove');
outputs.push({
  file: 'pointermove.md',
  content: pointermoveTemplate.render(pointerMoveTrigger, data, fragments),
});

// full-lean.md
const fullLeanTemplate = await import(join(CONTENT_DIR, 'templates', 'full-lean.mjs'));
outputs.push({
  file: 'full-lean.md',
  content: fullLeanTemplate.render(data.triggers, data, fragments),
});

// integration.md
const integrationTemplate = await import(join(CONTENT_DIR, 'templates', 'integration.mjs'));
outputs.push({
  file: 'integration.md',
  content: integrationTemplate.render(data.triggers, data, fragments),
});

// ---------------------------------------------------------------------------
// 4. Write outputs
// ---------------------------------------------------------------------------

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const { file, content } of outputs) {
  const outPath = join(OUTPUT_DIR, file);
  writeFileSync(outPath, content, 'utf8');
  console.log(`  ✓ ${relative(PKG_ROOT, outPath)}`);
}

console.log(`\nGenerated ${outputs.length} rule files.`);
