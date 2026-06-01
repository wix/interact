import type { Rule } from '..';
import type { ValidationError } from '../../errors';

export const selectMapCoverage: Rule = {
  code: 'MAP_MISSING_OPTION_ENTRY',
  defaultSeverity: 'error',
  run: (ctx) => {
    const errors: ValidationError[] = [];
    ctx.controls.forEach((control, ci) => {
      if (control.type !== 'select') return;
      const options = control.constraints?.options ?? [];
      control.bindings.forEach((binding, bi) => {
        if (binding.transform?.type !== 'map') return;
        const entries = binding.transform.entries;
        for (const option of options) {
          if (!(String(option.value) in entries)) {
            errors.push({
              code: 'MAP_MISSING_OPTION_ENTRY' as const,
              severity: 'error' as const,
              path: ['controls', ci, 'bindings', bi, 'transform', 'entries'],
              message: `Map transform for control "${control.id}" is missing an entry for option ${JSON.stringify(option.value)}.`,
            });
          }
        }
      });
    });
    return errors;
  },
};
