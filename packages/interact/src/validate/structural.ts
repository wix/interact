import type { ZodIssue } from 'zod';
import { ExperienceSchema, type Experience } from '../schema';
import type { ValidationError } from './errors';

function mapZodCode(issue: ZodIssue): string {
  switch (issue.code) {
    case 'invalid_type':
      return 'SCHEMA_INVALID_TYPE';
    case 'unrecognized_keys':
      return 'SCHEMA_UNRECOGNIZED_KEYS';
    case 'invalid_union':
      return 'SCHEMA_INVALID_UNION';
    case 'invalid_value':
      return 'SCHEMA_INVALID_LITERAL';
    default:
      return 'SCHEMA_INVALID';
  }
}

export function validateStructural(input: unknown): {
  ok: boolean;
  parsed?: Experience;
  errors: ValidationError[];
} {
  const result = ExperienceSchema.safeParse(input);
  if (result.success) {
    return { ok: true, parsed: result.data, errors: [] };
  }
  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    code: mapZodCode(issue),
    message: issue.message,
    path: [...issue.path] as (string | number)[],
    severity: 'error',
  }));
  return { ok: false, errors };
}
