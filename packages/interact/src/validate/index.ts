import type { InteractConfig } from '../types/config';
import { buildContext } from './context';
import {
  InteractValidationError,
  type Severity,
  type ValidationError,
  type ValidationResult,
} from './errors';
import { validateSemantic } from './semantic';
import { validateStructural } from './structural';

export { InteractValidationError };
export type { Severity, ValidationError, ValidationResult } from './errors';

export { RULES, type Rule } from './rules';

// Zod schemas and sub-schemas for host-project schema composition
export {
  InteractConfigSchema,
  Interaction,
  TriggerType,
  ViewEnterParams,
  PointerMoveParams,
  AnimationEndParams,
  TriggerParams,
  SerializableEffect,
  SerializableEffectRef,
  SerializableEffectSource,
  SerializableTimeEffect,
  EffectBase,
  NamedEffect,
  SCRUB_FIELDS,
  STATE_FIELDS,
  TIME_FIELDS,
  SerializableSequenceConfig,
  SerializableSequenceConfigRef,
  Keyframe,
  LengthPercentage,
  RangeOffset,
  Condition,
  MediaCondition,
} from './schema';
export type {
  InteractConfig,
  ConditionDef,
  SequenceOptionsConfig,
  SequenceConfig,
  SequenceConfigRef,
  InteractionDef,
  InteractionTrigger,
  Effect,
  EffectRef,
} from './schema';

export type ValidateOptions = {
  strict?: boolean;
  severityOverrides?: Record<string, Severity | 'off'>;
  max?: number;
};

function comparePath(a: (string | number)[], b: (string | number)[]): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i]!;
    const bv = b[i]!;
    if (av === bv) continue;
    if (typeof av === 'number' && typeof bv === 'number') return av - bv;
    return String(av) < String(bv) ? -1 : 1;
  }
  return a.length - b.length;
}

function finalize(errors: ValidationError[], opts: ValidateOptions): ValidationResult {
  let next = errors;
  if (opts.strict) {
    next = next.map((e) => (e.severity === 'warning' ? { ...e, severity: 'error' } : e));
  }
  next = [...next].sort((a, b) => comparePath(a.path, b.path));
  if (opts.max !== undefined && next.length > opts.max) {
    next = next.slice(0, opts.max);
  }
  const valid = !next.some((e) => e.severity === 'error');
  return { valid, errors: next };
}

export function validateInteractConfig(
  input: unknown,
  options: ValidateOptions = {},
): ValidationResult {
  const layer1 = validateStructural(input);
  if (!layer1.ok || !layer1.parsed) {
    return finalize(layer1.errors, options);
  }
  const ctx = buildContext(layer1.parsed);
  const layer2 = validateSemantic(ctx, options.severityOverrides);
  return finalize(layer2, options);
}

export function assertValidInteractConfig(
  input: unknown,
  options: ValidateOptions = {},
): asserts input is InteractConfig {
  const result = validateInteractConfig(input, options);
  if (!result.valid) {
    throw new InteractValidationError(result.errors);
  }
}
