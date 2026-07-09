import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Interact, generate } from '../../../packages/interact/dist/es/index.js';
import * as presets from '../../../packages/motion-presets/dist/es/motion-presets.js';
import {
  landingPageConfig,
  examplesPageConfig,
  viewEnterDemoConfig,
} from '../assets/critical-css-configs.mjs';

Interact.registerEffects(presets);

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../assets/css');

mkdirSync(outDir, { recursive: true });

const outputs = [
  { name: 'critical-interact-landing.css', config: landingPageConfig },
  { name: 'critical-interact-examples.css', config: examplesPageConfig },
  { name: 'critical-interact-view-enter.css', config: viewEnterDemoConfig },
];

for (const { name, config } of outputs) {
  const css = generate(config, true);
  writeFileSync(join(outDir, name), css);
  console.log(`Wrote ${name}`);
}
