#!/usr/bin/env npx tsx
import { runEvaluation, formatReport, scenarios } from '../src/eval';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const RESULTS_FILE = resolve(__dirname, '..', 'eval-results.json');
const RUNS_PER_SCENARIO = 3;

async function main() {
  console.log(
    `Starting evaluation of ${scenarios.length} scenarios (${RUNS_PER_SCENARIO} runs each)...\n`,
  );
  const startTime = Date.now();

  const rawDir = resolve(__dirname, '..', 'eval-raw-output');
  await mkdir(rawDir, { recursive: true });

  const report = await runEvaluation(scenarios, {
    runsPerScenario: RUNS_PER_SCENARIO,
    onRun: async (scenario, runIdx, run) => {
      const status = run.success
        ? `score=${run.scores?.aggregate.toFixed(2)}, valid=${run.validation?.valid}, errs=${run.validation?.errors.length}`
        : `FAILED: ${run.error?.slice(0, 80)}`;
      console.log(
        `  [${scenario.id}] run ${runIdx + 1}/${RUNS_PER_SCENARIO}: ${status} (${(run.durationMs / 1000).toFixed(0)}s)`,
      );

      if (run.rawOutput) {
        await writeFile(resolve(rawDir, `${scenario.id}-run${runIdx}.html`), run.rawOutput).catch(
          () => {},
        );
      }
    },
    onResult: (result) => {
      const stats = result.scoreStats;
      const status = result.success
        ? `mean=${stats?.mean.toFixed(2)}, std=${stats?.stddev.toFixed(2)}, rate=${(result.successRate * 100).toFixed(0)}%`
        : `ALL FAILED`;
      console.log(`  => [${result.scenario.id}] ${status}\n`);
    },
  });

  console.log('\n' + formatReport(report));
  console.log(`Total time: ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} minutes`);

  const slimResults = report.results.map((r) => ({
    scenario: r.scenario.id,
    success: r.success,
    successRate: r.successRate,
    error: r.error,
    scoreStats: r.scoreStats,
    validation: r.validation
      ? {
          valid: r.validation.valid,
          errors: r.validation.errors.length,
          warnings: r.validation.warnings.length,
          infos: r.validation.infos.length,
        }
      : undefined,
    scores: r.scores
      ? {
          aggregate: r.scores.aggregate,
          dimensions: r.scores.dimensions.map((d) => ({ dimension: d.dimension, score: d.score })),
        }
      : undefined,
    durationMs: r.durationMs,
    runs: r.runs.map((run) => ({
      success: run.success,
      aggregate: run.scores?.aggregate,
      valid: run.validation?.valid,
      errors: run.validation?.errors.length,
      durationMs: run.durationMs,
    })),
  }));

  const output = {
    timestamp: report.timestamp,
    runsPerScenario: report.runsPerScenario,
    summary: report.summary,
    results: slimResults,
  };

  await writeFile(RESULTS_FILE, JSON.stringify(output, null, 2));
  console.log(`\nResults written to ${RESULTS_FILE}`);
}

main().catch((err) => {
  console.error('Eval failed:', err);
  process.exit(1);
});
