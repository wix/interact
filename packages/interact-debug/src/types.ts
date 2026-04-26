import type {
  InteractConfig,
  Interaction,
  Condition,
  SequenceConfig,
  TriggerType,
  Effect,
  EffectRef,
  TimeEffect,
  ScrubEffect,
  StateEffect,
  TimeAnimationTriggerType,
  ViewEnterParams,
  PointerMoveParams,
  AnimationEndParams,
  TriggerParams,
  RangeOffset,
} from '@wix/interact';

export type {
  InteractConfig,
  Interaction,
  Condition,
  SequenceConfig,
  TriggerType,
  Effect,
  EffectRef,
  TimeEffect,
  ScrubEffect,
  StateEffect,
  TimeAnimationTriggerType,
  ViewEnterParams,
  PointerMoveParams,
  AnimationEndParams,
  TriggerParams,
  RangeOffset,
};

// ---------------------------------------------------------------------------
// Artifact
// ---------------------------------------------------------------------------

export type FrameworkType = 'web' | 'react' | 'vanilla';

export type InteractArtifact = {
  config: InteractConfig;
  /** HTML structure stripped of scripts/styles */
  html: string;
  /** All CSS (inline <style> + linked + generate() output) */
  css?: string;
  /** All JS (inline <script> + linked setup code) */
  js?: string;
  framework?: FrameworkType;
  registeredEffects?: string[];
  sourceType: 'separated' | 'mixed' | 'url' | 'directory' | 'runtime';
};

export type ArtifactInput =
  | { type: 'separated'; config: InteractConfig; html: string; css?: string; js?: string }
  | { type: 'mixed'; source: string }
  | { type: 'url'; url: string }
  | { type: 'directory'; path: string };

// ---------------------------------------------------------------------------
// Scope
// ---------------------------------------------------------------------------

export type Scope = {
  key?: string;
  interactionIndex?: number;
  effectId?: string;
  trigger?: TriggerType;
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type ValidationSeverity = 'error' | 'warning' | 'info';

export type ValidationEntry = {
  severity: ValidationSeverity;
  message: string;
  /** JSONPath-style location, e.g. ['interactions', 0, 'effects', 1, 'duration'] */
  path: (string | number)[];
  rule: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationEntry[];
  warnings: ValidationEntry[];
  infos: ValidationEntry[];
};

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export type ScoreResult = {
  dimension: string;
  score: number;
  weight: number;
  details: string;
  subscores?: ScoreResult[];
};

export type ScoreReport = {
  aggregate: number;
  dimensions: ScoreResult[];
};

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogCategory =
  | 'config'
  | 'handler'
  | 'lifecycle'
  | 'dom'
  | 'animation'
  | 'sequence'
  | 'condition';

export type LogEntry = {
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  key?: string;
  trigger?: TriggerType;
  effectId?: string;
  message: string;
  data?: unknown;
};
