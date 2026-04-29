import type {
  ValidationResult,
  ValidationEntry,
  Scope,
  TriggerType,
  InteractConfig,
} from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const TRIGGER_TYPES: TriggerType[] = [
  'hover',
  'click',
  'viewEnter',
  'pageVisible',
  'animationEnd',
  'viewProgress',
  'pointerMove',
  'activate',
  'interest',
];

export const TRIGGER_TYPE_VALUES = ['once', 'repeat', 'alternate', 'state'] as const;
export const FILL_VALUES = ['none', 'forwards', 'backwards', 'both'] as const;
export const CONDITION_TYPES = ['media', 'container', 'selector'] as const;
export const RANGE_NAMES = [
  'entry',
  'exit',
  'contain',
  'cover',
  'entry-crossing',
  'exit-crossing',
] as const;
export const STATE_ACTIONS = ['add', 'remove', 'toggle', 'clear'] as const;
export const SCRUB_TRANSITION_EASINGS = [
  'linear',
  'hardBackOut',
  'easeOut',
  'elastic',
  'bounce',
] as const;

/** Triggers that support time-based animation effects (duration + effectProperty). */
export const TIME_TRIGGERS = new Set<TriggerType>([
  'viewEnter',
  'hover',
  'click',
  'pageVisible',
  'animationEnd',
  'activate',
  'interest',
]);

/** Triggers that support scroll/pointer-driven scrub effects. */
export const SCRUB_TRIGGERS = new Set<TriggerType>(['viewProgress', 'pointerMove']);

/** Triggers that support state effects (transition/transitionProperties). */
export const STATE_TRIGGERS = new Set<TriggerType>(['hover', 'click', 'activate', 'interest']);

/** Triggers that REQUIRE params to be present. */
export const TRIGGERS_REQUIRING_PARAMS = new Set<TriggerType>(['animationEnd']);

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

/** Plain object (not null, not array). */
export function isRecord(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

// ---------------------------------------------------------------------------
// Entry builders
// ---------------------------------------------------------------------------

export function error(path: (string | number)[], rule: string, message: string): ValidationEntry {
  return { severity: 'error', path, rule, message };
}

export function warning(path: (string | number)[], rule: string, message: string): ValidationEntry {
  return { severity: 'warning', path, rule, message };
}

export type ValidationEntryBuilder = (
  path: (string | number)[],
  rule: string,
  message: string,
) => ValidationEntry;

export function makeEntry(severity: 'error' | 'warning' | 'info'): ValidationEntryBuilder {
  return (path, rule, message) => ({ severity, path, rule, message });
}

// ---------------------------------------------------------------------------
// Result builder
// ---------------------------------------------------------------------------

export function toResult(entries: ValidationEntry[]): ValidationResult {
  return {
    valid: entries.every((e) => e.severity !== 'error'),
    errors: entries.filter((e) => e.severity === 'error'),
    warnings: entries.filter((e) => e.severity === 'warning'),
    infos: entries.filter((e) => e.severity === 'info'),
  };
}

// ---------------------------------------------------------------------------
// Scope filtering
// ---------------------------------------------------------------------------

export function isInScope(
  interaction: { key: string; trigger: string },
  index: number,
  scope: Scope | undefined,
): boolean {
  if (!scope) return true;
  if (scope.interactionIndex !== undefined && scope.interactionIndex !== index) return false;
  if (scope.key && interaction.key !== scope.key) return false;
  if (scope.trigger && interaction.trigger !== scope.trigger) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Effect / sequence resolution
// ---------------------------------------------------------------------------

export function resolveEffect(
  inline: Record<string, unknown>,
  globalEffects: Record<string, Record<string, unknown>>,
): Record<string, unknown> {
  const effectId = inline.effectId;
  if (typeof effectId !== 'string') return inline;
  const base = globalEffects[effectId];
  if (!base) return inline;
  return { ...base, ...inline };
}

export function resolveSequence(
  raw: Record<string, unknown>,
  globalSequences: Record<string, Record<string, unknown>>,
): Record<string, unknown> {
  if (typeof raw.sequenceId !== 'string') return raw;
  const base = globalSequences[raw.sequenceId];
  if (!base) return raw;
  return { ...base, ...raw };
}

// ---------------------------------------------------------------------------
// Global map builders
// ---------------------------------------------------------------------------

export type GlobalMaps = {
  globalEffects: Record<string, Record<string, unknown>>;
  globalConditions: Record<string, Record<string, unknown>>;
  globalSequences: Record<string, Record<string, unknown>>;
};

export function buildGlobalMaps(config: InteractConfig): GlobalMaps {
  const globalEffects: Record<string, Record<string, unknown>> = {};
  if (config.effects) {
    for (const [id, eff] of Object.entries(config.effects)) {
      if (isRecord(eff)) globalEffects[id] = eff as Record<string, unknown>;
    }
  }

  const globalConditions: Record<string, Record<string, unknown>> = {};
  if (config.conditions) {
    for (const [id, cond] of Object.entries(config.conditions)) {
      if (isRecord(cond)) globalConditions[id] = cond as Record<string, unknown>;
    }
  }

  const globalSequences: Record<string, Record<string, unknown>> = {};
  if (config.sequences) {
    for (const [id, seq] of Object.entries(config.sequences)) {
      if (isRecord(seq)) globalSequences[id] = seq as Record<string, unknown>;
    }
  }

  return { globalEffects, globalConditions, globalSequences };
}
