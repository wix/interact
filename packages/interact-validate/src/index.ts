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
  // Rule-derived semantic checks (see packages/interact/rules/*.md).
  SAME_ELEMENT_RETRIGGER: 'SAME_ELEMENT_RETRIGGER',
  HIT_AREA_SHIFT: 'HIT_AREA_SHIFT',
  SCROLL_PRESET_MISSING_RANGE: 'SCROLL_RANGE',
  SCROLL_PRESET_BAD_RANGE: 'SCROLL_RANGE',
  ANIMATION_END_SELF_REFERENCE: 'ANIMATION_END_GRAPH',
  ANIMATION_END_CYCLE: 'ANIMATION_END_GRAPH',
  LIST_ITEM_SELECTOR_WITHOUT_CONTAINER: 'ELEMENT_SELECTION',
  REDUNDANT_SELECTOR_WITH_LIST_ITEM: 'ELEMENT_SELECTION',
  EMPTY_STYLE_PROPERTIES: 'STATE_EFFECT',
  STATE_REMOVE_WITHOUT_EFFECT_ID: 'STATE_EFFECT',
  RECOMMENDED_FILL_BOTH: 'RECOMMENDED_FILL',
  POINTER_AXIS_IGNORED: 'POINTER_AXIS',
  RANGE_OFFSET_OUT_OF_RANGE: 'RANGE_OFFSET',
  KEYFRAME_PROP_NOT_CAMEL_CASE: 'KEYFRAME_STYLE',
  INVALID_INSET: 'VIEW_INSET',
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
