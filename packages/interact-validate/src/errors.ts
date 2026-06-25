export type Severity = 'error' | 'warning';

export type ValidationError = {
  code: string;
  message: string;
  path: (string | number)[];
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
