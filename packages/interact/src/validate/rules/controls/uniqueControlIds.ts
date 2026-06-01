import type { Rule } from '..';
import type { ValidationError } from '../../errors';

export const uniqueControlIds: Rule = {
  code: 'DUPLICATE_CONTROL_ID',
  defaultSeverity: 'error',
  run: (ctx) => {
    const seen = new Set<string>();
    const errors: ValidationError[] = [];
    ctx.controls.forEach((control, ci) => {
      if (seen.has(control.id)) {
        errors.push({
          code: 'DUPLICATE_CONTROL_ID' as const,
          severity: 'error' as const,
          path: ['controls', ci, 'id'],
          message: `Duplicate control id "${control.id}".`,
        });
      }
      seen.add(control.id);
    });
    return errors;
  },
};
