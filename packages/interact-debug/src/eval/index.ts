import type { EvalScenario, EvalResult, EvalReport, SingleRunResult, ScoreStats } from './types';
import type { ScoreReport } from '../types';
import { generate } from './claudeClient';
import { buildSystemPrompt, buildUserPrompt } from './promptBuilder';
import { extractArtifact } from './artifactExtractor';
import { validateAll } from '../validate';
import { scoreArtifact } from '../score';

export type { EvalScenario, EvalResult, EvalReport, SingleRunResult } from './types';
export { scenarios } from './scenarios';
export { buildSystemPrompt, buildSystemPromptFromFiles } from './promptBuilder';

export type EvalOptions = {
  onResult?: (result: EvalResult) => void;
  onRun?: (scenario: EvalScenario, runIndex: number, run: SingleRunResult) => void;
  systemPrompt?: string;
  runsPerScenario?: number;
  /** Playwright browser launcher — if provided, runtime scoring is enabled */
  launchBrowser?: () => Promise<RuntimeBrowser>;
};

export type RuntimeBrowser = {
  newPage: () => Promise<RuntimePage>;
  close: () => Promise<void>;
};

export type RuntimePage = {
  goto: (url: string) => Promise<void>;
  close: () => Promise<void>;
  waitForTimeout: (ms: number) => Promise<void>;
  /** The raw Playwright Page object for runtime scorers */
  raw: unknown;
};

/**
 * Run the full evaluation pipeline for a set of scenarios.
 * For each scenario: generate artifact via Claude CLI (N times), parse,
 * validate, score (static + runtime), and average across runs.
 */
export async function runEvaluation(
  scenarioList: EvalScenario[],
  options?: EvalOptions,
): Promise<EvalReport> {
  const systemPrompt = options?.systemPrompt ?? (await buildSystemPrompt());
  const runsPerScenario = options?.runsPerScenario ?? 3;
  const results: EvalResult[] = [];

  let runtimeServe: typeof import('../playwright/fixtureServer').serveArtifact | undefined;
  let runtimeScore: typeof import('../playwright/aggregate').scoreRuntime | undefined;

  if (options?.launchBrowser) {
    try {
      const { serveArtifact } = await import('../playwright/fixtureServer');
      const { scoreRuntime } = await import('../playwright/aggregate');
      runtimeServe = serveArtifact;
      runtimeScore = scoreRuntime;
    } catch {
      // Playwright not available — runtime scoring disabled
    }
  }

  for (const scenario of scenarioList) {
    const scenarioStart = Date.now();
    const runs: SingleRunResult[] = [];

    for (let runIdx = 0; runIdx < runsPerScenario; runIdx++) {
      const run = await executeSingleRun(
        scenario,
        systemPrompt,
        runtimeServe,
        runtimeScore,
        options,
      );
      runs.push(run);
      options?.onRun?.(scenario, runIdx, run);
    }

    const result = aggregateRuns(scenario, runs, Date.now() - scenarioStart);
    results.push(result);
    options?.onResult?.(result);
  }

  return buildReport(results, runsPerScenario);
}

async function executeSingleRun(
  scenario: EvalScenario,
  systemPrompt: string,
  runtimeServe?: typeof import('../playwright/fixtureServer').serveArtifact,
  runtimeScore?: typeof import('../playwright/aggregate').scoreRuntime,
  options?: EvalOptions,
): Promise<SingleRunResult> {
  const start = Date.now();
  try {
    const userPrompt = buildUserPrompt(scenario);
    const rawOutput = await generate(systemPrompt, userPrompt);
    const extracted = await extractArtifact(rawOutput);

    if ('error' in extracted) {
      return { success: false, rawOutput, error: extracted.error, durationMs: Date.now() - start };
    }

    const validation = validateAll(extracted.artifact);
    let scores = scoreArtifact(extracted.artifact, undefined, validation);

    if (runtimeServe && runtimeScore && options?.launchBrowser) {
      try {
        const runtimeScores = await runRuntimeScoring(
          extracted.artifact,
          runtimeServe,
          runtimeScore,
          options.launchBrowser,
        );
        if (runtimeScores) {
          scores = mergeScoreReports(scores, runtimeScores);
        }
      } catch {
        // Runtime scoring failed — keep static-only scores
      }
    }

    return {
      success: true,
      rawOutput,
      artifact: extracted.artifact,
      validation,
      scores,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}

async function runRuntimeScoring(
  artifact: import('../types').InteractArtifact,
  serveArtifact: typeof import('../playwright/fixtureServer').serveArtifact,
  scoreRuntime: typeof import('../playwright/aggregate').scoreRuntime,
  launchBrowser: () => Promise<RuntimeBrowser>,
): Promise<ScoreReport | null> {
  const { url, cleanup } = await serveArtifact(artifact);
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    try {
      await page.goto(url);
      await page.waitForTimeout(1500);
      return await scoreRuntime(page.raw as any, artifact);
    } finally {
      await page.close();
    }
  } finally {
    await browser.close();
    await cleanup();
  }
}

function mergeScoreReports(staticReport: ScoreReport, runtimeReport: ScoreReport): ScoreReport {
  const allDimensions = [...staticReport.dimensions, ...runtimeReport.dimensions];
  let totalWeight = 0;
  let weightedSum = 0;
  for (const dim of allDimensions) {
    weightedSum += dim.score * dim.weight;
    totalWeight += dim.weight;
  }
  return {
    aggregate: totalWeight > 0 ? weightedSum / totalWeight : 0,
    dimensions: allDimensions,
  };
}

function aggregateRuns(
  scenario: EvalScenario,
  runs: SingleRunResult[],
  totalDurationMs: number,
): EvalResult {
  const successfulRuns = runs.filter((r) => r.success);
  const successRate = runs.length > 0 ? successfulRuns.length / runs.length : 0;

  if (successfulRuns.length === 0) {
    const lastError = runs[runs.length - 1]?.error;
    return {
      scenario,
      success: false,
      error: lastError,
      durationMs: totalDurationMs,
      runs,
      successRate,
    };
  }

  const scoredRuns = successfulRuns.filter((r) => r.scores);
  const aggregates = scoredRuns.map((r) => r.scores!.aggregate);

  let meanScores: ScoreReport | undefined;
  let scoreStats: ScoreStats | undefined;

  if (aggregates.length > 0) {
    const mean = aggregates.reduce((a, b) => a + b, 0) / aggregates.length;
    const min = Math.min(...aggregates);
    const max = Math.max(...aggregates);
    const variance = aggregates.reduce((sum, v) => sum + (v - mean) ** 2, 0) / aggregates.length;
    const stddev = Math.sqrt(variance);

    scoreStats = { mean, min, max, stddev };
    meanScores = averageScoreReports(scoredRuns.map((r) => r.scores!));
  }

  // Pick the validation from the best-scoring run
  const bestRun = scoredRuns.reduce(
    (best, r) => (r.scores!.aggregate > (best.scores?.aggregate ?? -1) ? r : best),
    scoredRuns[0],
  );

  return {
    scenario,
    success: true,
    scores: meanScores,
    validation: bestRun.validation,
    durationMs: totalDurationMs,
    runs,
    scoreStats,
    successRate,
  };
}

function averageScoreReports(reports: ScoreReport[]): ScoreReport {
  if (reports.length === 0) return { aggregate: 0, dimensions: [] };
  if (reports.length === 1) return reports[0];

  const dimNames = new Set<string>();
  for (const r of reports) {
    for (const d of r.dimensions) dimNames.add(d.dimension);
  }

  const avgDimensions = [...dimNames]
    .map((name) => {
      const matching = reports
        .map((r) => r.dimensions.find((d) => d.dimension === name))
        .filter(Boolean) as import('../types').ScoreResult[];

      if (matching.length === 0) return null;

      const avgScore = matching.reduce((s, d) => s + d.score, 0) / matching.length;
      return {
        dimension: name,
        score: avgScore,
        weight: matching[0].weight,
        details: `Mean of ${matching.length} runs`,
      };
    })
    .filter(Boolean) as import('../types').ScoreResult[];

  let totalWeight = 0;
  let weightedSum = 0;
  for (const dim of avgDimensions) {
    weightedSum += dim.score * dim.weight;
    totalWeight += dim.weight;
  }

  return {
    aggregate: totalWeight > 0 ? weightedSum / totalWeight : 0,
    dimensions: avgDimensions,
  };
}

function buildReport(results: EvalResult[], runsPerScenario: number): EvalReport {
  const generated = results.filter((r) => r.success).length;
  const valid = results.filter((r) => r.validation?.valid).length;
  const aggregates = results.filter((r) => r.scores).map((r) => r.scores!.aggregate);
  const averageAggregate =
    aggregates.length > 0 ? aggregates.reduce((a, b) => a + b, 0) / aggregates.length : 0;

  return {
    timestamp: new Date().toISOString(),
    runsPerScenario,
    results,
    summary: {
      total: results.length,
      generated,
      valid,
      averageAggregate,
      totalErrors: results.reduce((sum, r) => sum + (r.validation?.errors.length ?? 0), 0),
      totalWarnings: results.reduce((sum, r) => sum + (r.validation?.warnings.length ?? 0), 0),
    },
  };
}

/**
 * Format an evaluation report as a human-readable console table.
 */
export function formatReport(report: EvalReport): string {
  const lines: string[] = [];
  lines.push(`=== Interact Rules Evaluation (${report.runsPerScenario} runs/scenario) ===`);
  lines.push('');

  const header = [
    'Scenario'.padEnd(25),
    'Rate'.padEnd(6),
    'Valid'.padEnd(7),
    'Err'.padEnd(5),
    'Warn'.padEnd(6),
    'Aggr'.padEnd(7),
    'Std'.padEnd(6),
    'Cmplx'.padEnd(7),
    'Wght'.padEnd(7),
    'A11y'.padEnd(7),
    'Cohr'.padEnd(7),
    'BstPr'.padEnd(7),
    'Valid'.padEnd(7),
  ].join('  ');
  lines.push(header);
  lines.push('-'.repeat(header.length));

  for (const r of report.results) {
    if (!r.success) {
      lines.push(
        `${r.scenario.id.padEnd(25)}  ${fmtRate(r.successRate)}  FAIL   ${(r.error ?? 'generation failed').slice(0, 55)}`,
      );
      continue;
    }

    const v = r.validation;
    const s = r.scores;
    const dims = s ? Object.fromEntries(s.dimensions.map((d) => [d.dimension, d.score])) : {};

    lines.push(
      [
        r.scenario.id.padEnd(25),
        fmtRate(r.successRate).padEnd(6),
        (v?.valid ? 'pass' : 'FAIL').padEnd(7),
        String(v?.errors.length ?? '-').padEnd(5),
        String(v?.warnings.length ?? '-').padEnd(6),
        (s?.aggregate.toFixed(2) ?? '-').padEnd(7),
        (r.scoreStats?.stddev.toFixed(2) ?? '-').padEnd(6),
        (dims.complexity?.toFixed(2) ?? '-').padEnd(7),
        (dims.weight?.toFixed(2) ?? '-').padEnd(7),
        (dims.a11y?.toFixed(2) ?? '-').padEnd(7),
        (dims.coherence?.toFixed(2) ?? '-').padEnd(7),
        (dims.bestPractices?.toFixed(2) ?? '-').padEnd(7),
        (dims.validation?.toFixed(2) ?? '-').padEnd(7),
      ].join('  '),
    );
  }

  lines.push('-'.repeat(header.length));
  const s = report.summary;
  lines.push(
    `OVERALL: ${s.generated}/${s.total} generated, ${s.valid}/${s.total} valid, avg score: ${s.averageAggregate.toFixed(2)}, errors: ${s.totalErrors}, warnings: ${s.totalWarnings}`,
  );
  lines.push('');

  return lines.join('\n');
}

function fmtRate(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}
