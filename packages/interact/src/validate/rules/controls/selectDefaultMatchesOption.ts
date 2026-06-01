import type { Rule } from '..';
import type { ValidationError } from '../../errors';

export const selectDefaultMatchesOption: Rule = {
  code: 'SELECT_DEFAULT_NOT_IN_OPTIONS',
  defaultSeverity: 'error',
  run: (ctx) => {
    const errors: ValidationError[] = [];
    ctx.controls.forEach((control, ci) => {
      if (control.type !== 'select') return;
      const options = control.constraints?.options ?? [];
      if (!options.some((o) => o.value === control.defaultValue)) {
        errors.push({
          code: 'SELECT_DEFAULT_NOT_IN_OPTIONS' as const,
          severity: 'error' as const,
          path: ['controls', ci, 'defaultValue'],
          message: `Select control "${control.id}" defaultValue ${JSON.stringify(control.defaultValue)} does not match any option.`,
        });
      }
    });
    return errors;
  },
};
