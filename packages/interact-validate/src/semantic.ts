import { RULES } from './rules';
import type { ValidationContext } from './context';
import type { Severity, ValidationError } from './errors';

export function validateSemantic(
  ctx: ValidationContext,
  severityOverrides: Record<string, Severity | 'off'> = {},
): { errors: ValidationError[]; hasNaturalError: boolean } {
  const out: ValidationError[] = [];
  let hasNaturalError = false;
  for (const rule of RULES) {
    const override = severityOverrides[rule.code];
    if (override === 'off') continue;
    const errs = rule.run(ctx);
    if (!errs.length) continue;
    if (rule.defaultSeverity === 'error') hasNaturalError = true;
    const severity = override ?? rule.defaultSeverity;
    for (const e of errs) out.push({ ...e, severity });
  }
  return { errors: out, hasNaturalError };
}
