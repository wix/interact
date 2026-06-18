import type { InteractConfig } from '@wix/interact';
import {
  InteractValidationError,
  type ValidationResult,
  type ValidationError,
  type Severity,
  type ValidateOptions,
} from './errors';
import { validateStructural } from './structural';

export { InteractValidationError };
export type { Severity, ValidationError, ValidationResult, ValidateOptions } from './errors';

// Zod schemas and sub-schemas for host-project schema composition
export {
  InteractConfigSchema,
  Interaction,
  TriggerType,
  ViewEnterParams,
  PointerMoveParams,
  AnimationEndParams,
  TriggerParams,
  Effect,
  EffectRef,
  EffectSource,
  TimeEffect,
  NamedEffect,
  SequenceConfig,
  SequenceConfigRef,
  Keyframe,
  LengthPercentage,
  RangeOffset,
  Condition,
} from './schema';
export type {
  InteractConfig,
  ConditionDef,
  SequenceOptionsConfig,
  InteractionDef,
  InteractionTrigger,
} from './schema';

// Error codes that belong to a rule category (used by severityOverrides).
const RULE_CODE_MAP: Record<string, string> = {
  UNUSED_EFFECT: 'UNUSED_DEFINITION',
  UNUSED_SEQUENCE: 'UNUSED_DEFINITION',
  UNUSED_CONDITION: 'UNUSED_DEFINITION',
  DUPLICATE_KEYFRAME_NAME: 'UNIQUE_DEFINITION_IDS',
  INVALID_MEDIA_QUERY: 'VALID_MEDIA_QUERIES',
};

function finalize(errors: ValidationError[], options: ValidateOptions = {}): ValidationResult {
  const { strict = false, max, severityOverrides = {} } = options;

  let result = errors
    .filter((e) => {
      const ruleCode = RULE_CODE_MAP[e.code];
      return !ruleCode || severityOverrides[ruleCode] !== 'off';
    })
    .map((e) => {
      const ruleCode = RULE_CODE_MAP[e.code];
      if (ruleCode) {
        const override = severityOverrides[ruleCode];
        if (override && override !== 'off') {
          return { ...e, severity: override as Severity };
        }
      }
      return e;
    });

  if (strict) {
    result = result.map((e) => ({ ...e, severity: 'error' as const }));
  }

  result.sort((a, b) => {
    const pa = a.path.join('\0');
    const pb = b.path.join('\0');
    return pa < pb ? -1 : pa > pb ? 1 : 0;
  });

  if (max !== undefined) {
    result = result.slice(0, max);
  }

  return {
    valid: result.every((e) => e.severity !== 'error'),
    errors: result,
  };
}

export function validateInteractConfig(
  input: unknown,
  options?: ValidateOptions,
): ValidationResult {
  const { ok, parsed, errors } = validateStructural(input);

  if (ok && parsed) {
    const rawWarnings: any[] = (parsed as any).warnings ?? [];
    const warnings: ValidationError[] = rawWarnings.map((w) => ({
      code: w?.params?.domainCode ?? 'SCHEMA_INVALID',
      message: w?.message ?? '',
      path: (w?.path ?? []) as (string | number)[],
      severity: 'warning' as const,
    }));
    return finalize([...errors, ...warnings], options);
  }

  return finalize(errors, options);
}

export function assertValidInteractConfig(input: unknown): asserts input is InteractConfig {
  const result = validateInteractConfig(input);
  if (!result.valid) {
    throw new InteractValidationError(result.errors);
  }
}
