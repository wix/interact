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

export class ExperienceValidationError extends Error {
  readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(`Experience validation failed with ${errors.length} issue(s).`);
    this.name = 'ExperienceValidationError';
    this.errors = errors;
  }
}
