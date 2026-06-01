import type { Path, ValidationContext } from '../context';
import type { Severity, ValidationError } from '../errors';

export function referenceRule<T extends { path: Path }>(opts: {
  code: string;
  severity: Severity;
  refs: (ctx: ValidationContext) => T[];
  has: (ctx: ValidationContext, ref: T) => boolean;
  message: (ref: T) => string;
  hint?: string;
}) {
  return {
    code: opts.code,
    defaultSeverity: opts.severity,
    run: (ctx: ValidationContext): ValidationError[] =>
      opts
        .refs(ctx)
        .filter((ref) => !opts.has(ctx, ref))
        .map((ref) => ({
          code: opts.code,
          severity: opts.severity,
          path: ref.path,
          message: opts.message(ref),
          ...(opts.hint !== undefined ? { hint: opts.hint } : {}),
        })),
  };
}
