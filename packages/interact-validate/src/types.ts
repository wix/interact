export const RETRIGGER_TYPES = ['repeat', 'alternate', 'state'];

export type Severity = 'error' | 'warning' | 'info';

export type Path = (string | number)[];

export type SemanticIssue = {
  code: 'custom';
  path: Path;
  message: string;
  params: { domainCode: string };
  severity?: Severity;
};

export type ValidationError = {
  code: string;
  message: string;
  path: Path;
  severity: Severity;
  hint?: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export type ValidateOptions = {
  strict?: boolean;
  max?: number;
  severityOverrides?: Record<string, Severity | 'off'>;
};

export type AnyEffect = {
  key?: string;
  effectId?: string;
  selector?: string;
  listContainer?: string;
  listItemSelector?: string;
  triggerType?: string;
  stateAction?: string;
  fill?: string;
  delay?: number;
  namedEffect?: { type?: string; range?: unknown; [k: string]: unknown };
  keyframeEffect?: { name?: string; keyframes?: Array<Record<string, unknown>> };
  transition?: { styleProperties?: unknown[] };
  transitionProperties?: unknown[];
  rangeStart?: { offset?: { value?: number; unit?: string } };
  rangeEnd?: { offset?: { value?: number; unit?: string } };
  conditions?: string[];
};

export type AnySequence = {
  triggerType?: string;
  sequenceId?: string;
  effects?: AnyEffect[];
  conditions?: string[];
};

export type AnyInteraction = {
  key?: string;
  trigger?: string;
  selector?: string;
  listContainer?: string;
  listItemSelector?: string;
  params?: { hitArea?: string; axis?: string; inset?: string; effectId?: string };
  effects?: AnyEffect[];
  sequences?: AnySequence[];
  conditions?: string[];
};

export type AnyCondition = {
  type: string;
  predicate: string;
};

export type AnyConfig = {
  effects?: Record<string, AnyEffect>;
  sequences?: Record<string, AnySequence>;
  conditions?: Record<string, AnyCondition>;
  interactions: AnyInteraction[];
};

export type Visitors = {
  onInteraction?: (path: Path, interaction: AnyInteraction) => void;
  // `owner` is the parent interaction (carrying trigger/key/selector/params), or
  // `undefined` for top-level registry effects/sequences whose trigger context is
  // unknown until their reference site. Trigger-aware checks skip `owner === undefined`.
  onEffect: (path: Path, effect: AnyEffect, isTopLevel: boolean, owner?: AnyInteraction) => void;
  onSequence: (
    path: Path,
    sequence: AnySequence,
    isTopLevel: boolean,
    owner?: AnyInteraction,
  ) => void;
};
