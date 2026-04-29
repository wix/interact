import type { InteractArtifact, ValidationResult, ScoreReport } from '../types';

export type EvalScenario = {
  id: string;
  name: string;
  prompt: string;
};

export type SingleRunResult = {
  success: boolean;
  rawOutput?: string;
  artifact?: InteractArtifact;
  validation?: ValidationResult;
  scores?: ScoreReport;
  error?: string;
  durationMs: number;
};

export type ScoreStats = {
  mean: number;
  min: number;
  max: number;
  stddev: number;
};

export type EvalResult = {
  scenario: EvalScenario;
  success: boolean;
  /** Aggregated scores (mean across runs) */
  scores?: ScoreReport;
  /** Aggregated validation (from best run) */
  validation?: ValidationResult;
  error?: string;
  durationMs: number;
  /** Per-run details */
  runs: SingleRunResult[];
  /** Stats across successful runs */
  scoreStats?: ScoreStats;
  successRate: number;
};

export type EvalReport = {
  timestamp: string;
  runsPerScenario: number;
  results: EvalResult[];
  summary: {
    total: number;
    generated: number;
    valid: number;
    averageAggregate: number;
    totalErrors: number;
    totalWarnings: number;
  };
};
