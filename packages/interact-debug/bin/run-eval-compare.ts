#!/usr/bin/env npx tsx
/**
 * Runs the evaluation three times with different levels of rules context:
 *   1. no-rules:   Base prompt only (no @wix/interact documentation)
 *   2. partial:    Only the core overview rule (full-lean.md)
 *   3. full-rules: All 7 rule files (the default)
 *
 * Writes a comparison JSON and prints a side-by-side table.
 */
import {
  runEvaluation,
  formatReport,
  scenarios,
  buildSystemPromptFromFiles,
  buildSystemPrompt,
} from '../src/eval';
import type { EvalReport } from '../src/eval';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BARE_PROMPT = `You are an expert web developer. Generate a complete, single-file HTML document that implements the requested animation scenario.

Requirements:
- Output ONLY the HTML document. No explanations, no markdown fences, no commentary.
- The HTML must be a complete document (<!DOCTYPE html>, <html>, <head>, <body>).
- All CSS goes inside a <style> tag in <head>.
- All JavaScript goes inside a <script type="module"> tag at the end of <body>.`;

type Variant = { name: string; systemPrompt: string };

async function main() {
  const variants: Variant[] = [
    { name: 'no-rules', systemPrompt: BARE_PROMPT },
    { name: 'partial', systemPrompt: await buildSystemPromptFromFiles(['full-lean.md']) },
    { name: 'full-rules', systemPrompt: await buildSystemPrompt() },
  ];

  const reports: Record<string, EvalReport> = {};
  const startTime = Date.now();

  for (const variant of variants) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(
      `  Running variant: ${variant.name} (prompt size: ${(variant.systemPrompt.length / 1024).toFixed(1)}KB)`,
    );
    console.log(`${'='.repeat(60)}\n`);

    const report = await runEvaluation(scenarios, {
      systemPrompt: variant.systemPrompt,
      onResult: (result) => {
        const status = result.success
          ? `score=${result.scores?.aggregate.toFixed(2)}, valid=${result.validation?.valid}, errs=${result.validation?.errors.length}`
          : `FAILED: ${result.error?.slice(0, 80)}`;
        console.log(
          `  [${result.scenario.id}] ${status} (${(result.durationMs / 1000).toFixed(0)}s)`,
        );
      },
    });

    reports[variant.name] = report;
    console.log('\n' + formatReport(report));
  }

  // Print comparison table
  console.log('\n' + '='.repeat(80));
  console.log('  COMPARISON SUMMARY');
  console.log('='.repeat(80) + '\n');

  const header = [
    'Metric'.padEnd(25),
    'no-rules'.padEnd(12),
    'partial'.padEnd(12),
    'full-rules'.padEnd(12),
  ].join('');
  console.log(header);
  console.log('-'.repeat(header.length));

  const metrics: [string, (r: EvalReport) => string][] = [
    ['Generated', (r) => `${r.summary.generated}/${r.summary.total}`],
    ['Valid', (r) => `${r.summary.valid}/${r.summary.total}`],
    ['Avg aggregate', (r) => r.summary.averageAggregate.toFixed(3)],
    ['Total errors', (r) => String(r.summary.totalErrors)],
    ['Total warnings', (r) => String(r.summary.totalWarnings)],
  ];

  // Per-dimension averages
  const dimensions = ['complexity', 'weight', 'a11y', 'coherence', 'bestPractices', 'validation'];
  for (const dim of dimensions) {
    metrics.push([
      `Avg ${dim}`,
      (r) => {
        const scores = r.results
          .filter((x) => x.scores)
          .map((x) => x.scores!.dimensions.find((d) => d.dimension === dim)?.score ?? 0);
        return scores.length > 0
          ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(3)
          : '-';
      },
    ]);
  }

  for (const [name, fn] of metrics) {
    console.log(
      [
        name.padEnd(25),
        fn(reports['no-rules']).padEnd(12),
        fn(reports['partial']).padEnd(12),
        fn(reports['full-rules']).padEnd(12),
      ].join(''),
    );
  }

  console.log(`\nTotal time: ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} minutes`);

  // Write comparison JSON
  const outPath = resolve(__dirname, '..', 'eval-comparison.json');
  const output: Record<string, unknown> = {};
  for (const v of variants) {
    const r = reports[v.name];
    output[v.name] = {
      promptSizeKB: +(v.systemPrompt.length / 1024).toFixed(1),
      summary: r.summary,
      perScenario: r.results.map((x) => ({
        scenario: x.scenario.id,
        success: x.success,
        aggregate: x.scores?.aggregate,
        valid: x.validation?.valid,
        errors: x.validation?.errors.length,
        warnings: x.validation?.warnings.length,
      })),
    };
  }
  await writeFile(outPath, JSON.stringify(output, null, 2));
  console.log(`\nComparison written to ${outPath}`);
}

main().catch((err) => {
  console.error('Eval comparison failed:', err);
  process.exit(1);
});
