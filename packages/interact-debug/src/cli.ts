#!/usr/bin/env node

import { parseArtifact } from './artifact';
import { validateAll, validateConfig } from './validate';
import { scoreArtifact } from './score';
import type { ArtifactInput, ValidationResult, ScoreReport } from './types';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printUsage();
    process.exit(0);
  }

  const flags = parseFlags(args.slice(1));
  const source = flags.positional[0];
  const jsonOutput = flags.json;
  const scope = buildScope(flags);

  try {
    switch (command) {
      case 'validate':
        await handleValidate(source, flags, scope, jsonOutput);
        break;

      case 'validate-config':
        await handleValidateConfig(source, scope, jsonOutput);
        break;

      case 'score':
        await handleScore(source, flags, scope, jsonOutput);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (jsonOutput) {
      console.log(JSON.stringify({ error: message }));
    } else {
      console.error(`Error: ${message}`);
    }
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Command handlers
// ---------------------------------------------------------------------------

async function handleValidate(
  source: string | undefined,
  flags: ParsedFlags,
  scope: { key?: string; interactionIndex?: number; effectId?: string } | undefined,
  jsonOutput: boolean,
) {
  const input = await resolveInput(source, flags);
  const artifact = await parseArtifact(input);
  const result = validateAll(artifact, scope);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printValidation(result);
  }

  process.exit(result.valid ? 0 : 1);
}

async function handleValidateConfig(
  source: string | undefined,
  scope: { key?: string; interactionIndex?: number; effectId?: string } | undefined,
  jsonOutput: boolean,
) {
  if (!source) {
    throw new Error('validate-config requires a config JSON file path');
  }

  const fs = await import('node:fs/promises');
  const content = await fs.readFile(source, { encoding: 'utf-8' });
  const config = JSON.parse(content);
  const result = validateConfig(config, scope);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printValidation(result);
  }

  process.exit(result.valid ? 0 : 1);
}

async function handleScore(
  source: string | undefined,
  flags: ParsedFlags,
  scope: { key?: string; interactionIndex?: number; effectId?: string } | undefined,
  jsonOutput: boolean,
) {
  const input = await resolveInput(source, flags);
  const artifact = await parseArtifact(input);
  const report = scoreArtifact(artifact, scope);

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printScore(report);
  }
}

// ---------------------------------------------------------------------------
// Input resolution
// ---------------------------------------------------------------------------

async function resolveInput(
  source: string | undefined,
  flags: ParsedFlags,
): Promise<ArtifactInput> {
  if (flags.stdin) {
    const content = await readStdin();
    return { type: 'mixed', source: content };
  }

  if (!source) {
    throw new Error('No source provided. Pass a file path, directory, or URL.');
  }

  if (source.startsWith('http://') || source.startsWith('https://')) {
    return { type: 'url', url: source };
  }

  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const resolved = path.resolve(source);
  const stat = await fs.stat(resolved);

  if (stat.isDirectory()) {
    return { type: 'directory', path: resolved };
  }

  const ext = path.extname(resolved).toLowerCase();
  const content = await fs.readFile(resolved, { encoding: 'utf-8' });

  if (ext === '.json') {
    const config = JSON.parse(content);
    return { type: 'separated', config };
  }

  return { type: 'mixed', source: content };
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => chunks.push(String(chunk)));
    process.stdin.on('end', () => resolve(chunks.join('')));
    process.stdin.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Flag parsing
// ---------------------------------------------------------------------------

type ParsedFlags = {
  positional: string[];
  key?: string;
  interaction?: number;
  effect?: string;
  json: boolean;
  stdin: boolean;
};

function parseFlags(args: string[]): ParsedFlags {
  const result: ParsedFlags = { positional: [], json: false, stdin: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--json':
        result.json = true;
        break;
      case '--stdin':
        result.stdin = true;
        break;
      case '--key':
        result.key = args[++i];
        break;
      case '--interaction':
        result.interaction = parseInt(args[++i], 10);
        break;
      case '--effect':
        result.effect = args[++i];
        break;
      default:
        if (!arg.startsWith('-')) {
          result.positional.push(arg);
        }
        break;
    }
  }

  return result;
}

function buildScope(flags: ParsedFlags) {
  if (!flags.key && flags.interaction === undefined && !flags.effect) return undefined;
  return {
    key: flags.key,
    interactionIndex: flags.interaction,
    effectId: flags.effect,
  };
}

// ---------------------------------------------------------------------------
// Output formatting
// ---------------------------------------------------------------------------

function printValidation(result: ValidationResult) {
  if (result.valid) {
    console.log('✓ Validation passed');
  } else {
    console.log('✗ Validation failed');
  }

  if (result.errors.length > 0) {
    console.log(`\n  Errors (${result.errors.length}):`);
    for (const e of result.errors) {
      console.log(`    ✗ [${e.rule}] ${e.message}`);
      if (e.path.length > 0) console.log(`      at ${e.path.join('.')}`);
    }
  }

  if (result.warnings.length > 0) {
    console.log(`\n  Warnings (${result.warnings.length}):`);
    for (const w of result.warnings) {
      console.log(`    ⚠ [${w.rule}] ${w.message}`);
      if (w.path.length > 0) console.log(`      at ${w.path.join('.')}`);
    }
  }

  if (result.infos.length > 0) {
    console.log(`\n  Info (${result.infos.length}):`);
    for (const info of result.infos) {
      console.log(`    ℹ [${info.rule}] ${info.message}`);
    }
  }
}

function printScore(report: ScoreReport) {
  console.log(`Aggregate score: ${(report.aggregate * 100).toFixed(1)}%\n`);

  for (const dim of report.dimensions) {
    const pct = (dim.score * 100).toFixed(1);
    const bar = scoreBar(dim.score);
    console.log(`  ${dim.dimension.padEnd(20)} ${bar} ${pct}%  (weight: ${dim.weight})`);
    if (dim.subscores) {
      for (const sub of dim.subscores) {
        const subPct = (sub.score * 100).toFixed(1);
        console.log(`    └ ${sub.dimension.padEnd(28)} ${subPct}%  ${sub.details}`);
      }
    }
  }
}

function scoreBar(score: number): string {
  const filled = Math.round(score * 20);
  return '█'.repeat(filled) + '░'.repeat(20 - filled);
}

function printUsage() {
  console.log(`
@wix/interact-debug — Validate and score Interact implementations

Usage:
  interact-debug validate <source>          Validate a full artifact
  interact-debug validate-config <file>     Validate a config JSON only
  interact-debug score <source>             Score a full artifact

Source types:
  ./directory/           Directory with HTML + JS + config files
  ./file.html            Single HTML file (mixed blob)
  ./config.json          Config-only JSON file
  https://example.com    Live URL

Options:
  --key <key>            Scope to a specific data-interact-key
  --interaction <n>      Scope to interaction at index n
  --effect <id>          Scope to a specific effectId
  --json                 Output results as JSON
  --stdin                Read source from stdin (treated as mixed blob)
`);
}

main();
