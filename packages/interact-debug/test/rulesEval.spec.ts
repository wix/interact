import { describe, it, afterAll } from 'vitest';
import { runEvaluation, formatReport, scenarios } from '../src/eval';
import type { EvalReport } from '../src/eval';

const RESULTS_FILE = 'eval-results.json';

describe('Rules Evaluation', () => {
  let report: EvalReport;

  it(
    'runs all scenarios through LLM generation + scoring',
    async () => {
      report = await runEvaluation(scenarios, {
        onResult: (result) => {
          const status = result.success
            ? `score=${result.scores?.aggregate.toFixed(2)}, valid=${result.validation?.valid}`
            : `FAILED: ${result.error?.slice(0, 80)}`;
          console.log(`  [${result.scenario.id}] ${status} (${result.durationMs}ms)`);
        },
      });

      console.log('\n' + formatReport(report));
    },
    20 * 60 * 1000,
  ); // 20 minutes total for 8 LLM calls (~2 min each)

  afterAll(async () => {
    if (!report) return;

    // Write results JSON for tracking over time
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const outPath = path.resolve(__dirname, '..', RESULTS_FILE);

    // Strip raw LLM output to keep the file manageable
    const slimResults = report.results.map((r) => ({
      scenario: r.scenario.id,
      success: r.success,
      error: r.error,
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
            dimensions: r.scores.dimensions.map((d) => ({
              dimension: d.dimension,
              score: d.score,
            })),
          }
        : undefined,
      durationMs: r.durationMs,
    }));

    const output = {
      timestamp: report.timestamp,
      summary: report.summary,
      results: slimResults,
    };

    await fs.writeFile(outPath, JSON.stringify(output, null, 2));
    console.log(`Results written to ${outPath}`);
  });
});
