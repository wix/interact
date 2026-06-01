import type { Rule } from '..';
import type { ValidationError } from '../../errors';

export const rangeDefaultWithinBounds: Rule = {
  code: 'RANGE_DEFAULT_OUT_OF_BOUNDS',
  defaultSeverity: 'error',
  run: (ctx) => {
    const errors: ValidationError[] = [];
    ctx.controls.forEach((control, ci) => {
      if (control.type !== 'range') return;
      const { min, max } = control.constraints ?? {};
      const value = control.defaultValue;
      if (typeof value !== 'number') return;
      if (min !== undefined && value < min) {
        errors.push({
          code: 'RANGE_DEFAULT_OUT_OF_BOUNDS' as const,
          severity: 'error' as const,
          path: ['controls', ci, 'defaultValue'],
          message: `Range control "${control.id}" defaultValue ${value} is below min ${min}.`,
        });
      } else if (max !== undefined && value > max) {
        errors.push({
          code: 'RANGE_DEFAULT_OUT_OF_BOUNDS' as const,
          severity: 'error' as const,
          path: ['controls', ci, 'defaultValue'],
          message: `Range control "${control.id}" defaultValue ${value} is above max ${max}.`,
        });
      }
    });
    return errors;
  },
};
