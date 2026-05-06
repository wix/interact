#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Fragments } from '../_content/lib/fragments.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const CONTENT_DIR = join(PKG_ROOT, '_content');
const OUTPUT_DIR = join(PKG_ROOT, 'rules');

// ---------------------------------------------------------------------------
// 1. Load data modules
// ---------------------------------------------------------------------------

const { triggers } = await import(join(CONTENT_DIR, 'data', 'triggers.mjs'));
const { effects } = await import(join(CONTENT_DIR, 'data', 'effects.mjs'));
const { meta } = await import(join(CONTENT_DIR, 'data', 'meta.mjs'));

const metaParams = {
  installCommand: meta.installCommand,
  webEntry: meta.entryPoints.web,
  reactEntry: meta.entryPoints.react,
  vanillaEntry: meta.entryPoints.vanilla,
  presetsPackage: meta.presetsPackage,
};

const data = { triggers, effects, meta, metaParams };

// ---------------------------------------------------------------------------
// 2. Load fragments
// ---------------------------------------------------------------------------

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
      if (!trigger) throw new Error(`Trigger "${name}" not found in data/triggers.mjs`);
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
      const existingLines = existing.split('\n');
      const contentLines = content.split('\n');
      for (let i = 0; i < Math.max(existingLines.length, contentLines.length); i++) {
        if (existingLines[i] !== contentLines[i]) {
          console.error(`    first diff at line ${i + 1}:`);
          if (existingLines[i] !== undefined) console.error(`    - ${existingLines[i]}`);
          if (contentLines[i] !== undefined) console.error(`    + ${contentLines[i]}`);
          break;
        }
      }
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
