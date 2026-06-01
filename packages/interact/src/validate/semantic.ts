import { RULES } from './rules';
import type { ValidationContext } from './context';
import type { Severity, ValidationError } from './errors';

export function validateSemantic(
  ctx: ValidationContext,
  severityOverrides: Record<string, Severity | 'off'> = {},
): ValidationError[] {
  const out: ValidationError[] = [];
  for (const rule of RULES) {
    const override = severityOverrides[rule.code];
    if (override === 'off') continue;
    const errs = rule.run(ctx);
    if (!errs.length) continue;
    const severity = override ?? rule.defaultSeverity;
    for (const e of errs) out.push({ ...e, severity });
  }
  return out;
}
