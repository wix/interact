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
