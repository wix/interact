import type { Severity, ValidationError, ValidateOptions, ValidationResult } from './types';

export class InteractValidationError extends Error {
  readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(`Interact config validation failed with ${errors.length} issue(s).`);
    this.name = 'InteractValidationError';
    this.errors = errors;
  }
}

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
  RECOMMENDED_FILL_BACKWARDS: 'RECOMMENDED_FILL',
  POINTER_AXIS_IGNORED: 'POINTER_AXIS',
  INVALID_CSS_PROPERTY_NAME: 'CSS_PROPERTY_NAME',
  INVALID_INSET: 'VIEW_INSET',
};

export function finalize(
  errors: ValidationError[],
  options: ValidateOptions = {},
): ValidationResult {
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
    const minLength = Math.min(a.path.length, b.path.length);
    let i = 0;
    while (i < minLength) {
      if (a.path[i] < b.path[i]) return -1;
      if (a.path[i] > b.path[i]) return 1;
      i++;
    }
    return a.path.length < b.path.length ? -1 : a.path.length > b.path.length ? 1 : 0;
  });

  if (max !== undefined) {
    result = result.slice(0, max);
  }

  return {
    valid: result.every((e) => e.severity !== 'error'),
    errors: result,
  };
}
