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

/**
 * Structured HTML metadata extracted from the DOM.
 * Reliable when provided directly or extracted via JSDOM/browser APIs.
 */
export type HtmlMetadata = {
  /** All data-interact-key values found in HTML */
  keys: string[];
  /** data-interact-initial flag per key */
  initials: Record<string, boolean>;
  /** <interact-element> instances with key and whether they have a child */
  interactElements: { key: string; hasChild: boolean }[];
};

/**
 * Structured JS setup metadata.
 * Each field is `undefined` when the check could not be performed
 * (e.g. no JS source available, or runtime mode where direct inspection
 * is preferred). Validators skip checks for undefined fields.
 */
export type SetupMetadata = {
  hasGenerate?: boolean;
  hasDestroy?: boolean;
  hasA11yTriggers?: boolean;
  hasRegisterEffects?: boolean;
  /** false if registerEffects is called AFTER Interact.create */
  registerBeforeCreate?: boolean;
  /** false if Interact.setup is called AFTER Interact.create */
  setupBeforeCreate?: boolean;
};

export type InteractArtifact = {
  config: InteractConfig;
  sourceType: 'separated' | 'mixed' | 'url' | 'directory' | 'runtime';

  /** Structured HTML metadata — validators consume this, not raw HTML */
  htmlMeta?: HtmlMetadata;
  /** Structured JS setup metadata — validators consume this, not raw JS */
  setupMeta?: SetupMetadata;
  registeredEffects?: string[];
  framework?: FrameworkType;

  /**
   * 'high' when metadata was provided directly or extracted at runtime;
   * 'parsed' when derived from best-effort string parsing.
   */
  confidence: 'high' | 'parsed';

  /** Raw source strings for debugging/display. NOT consumed by validators. */
  raw?: { html?: string; css?: string; js?: string };
};

export type ArtifactInput =
  | {
      type: 'separated';
      config: InteractConfig;
      html?: string;
      css?: string;
      js?: string;
      /** Pre-parsed metadata — takes precedence over raw string parsing */
      htmlMeta?: HtmlMetadata;
      setupMeta?: SetupMetadata;
      registeredEffects?: string[];
      framework?: FrameworkType;
    }
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
