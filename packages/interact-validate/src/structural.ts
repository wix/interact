import type { ZodIssue } from 'zod';
import { InteractConfigSchema } from './schema';
import type { InteractConfig } from '@wix/interact';
import type { ValidationError } from './errors';

// Map Zod issue codes → domain error codes.
// Custom issues carry their domain code in `params.domainCode`.
// `too_small` / `too_big` are mapped by the last path segment.
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
    case 'too_small': {
      const field = issue.path[issue.path.length - 1];
      const map: Record<string, string> = {
        duration: 'NEGATIVE_DURATION',
        delay: 'NEGATIVE_DELAY',
        iterations: 'NEGATIVE_ITERATIONS',
        offset: 'NEGATIVE_OFFSET',
        threshold: 'THRESHOLD_OUT_OF_RANGE',
      };
      return map[field as string] ?? 'SCHEMA_TOO_SMALL';
    }
    case 'too_big': {
      const field = issue.path[issue.path.length - 1];
      return field === 'threshold' ? 'THRESHOLD_OUT_OF_RANGE' : 'SCHEMA_INVALID';
    }
    case 'custom':
      return (issue as any).params?.domainCode ?? 'SCHEMA_INVALID';
    default:
      return 'SCHEMA_INVALID';
  }
}

export function validateStructural(input: unknown): {
  ok: boolean;
  parsed?: InteractConfig;
  errors: ValidationError[];
} {
  const result = InteractConfigSchema.safeParse(input);

  if (result.success) {
    const parsed = result.data as unknown as InteractConfig;
    return { ok: true, parsed, errors: [] };
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    code: mapZodCode(issue),
    message: issue.message,
    path: [...issue.path] as (string | number)[],
    severity: 'error',
  }));
  return { ok: false, errors };
}
