import type { Rule } from '..';
import type { ValidationError } from '../../errors';

export const conditionPredicateRequired: Rule = {
  code: 'CONDITION_PREDICATE_REQUIRED',
  defaultSeverity: 'error',
  run: (ctx): ValidationError[] => {
    const errors: ValidationError[] = [];
    for (const [id, condition] of Object.entries(ctx.config.conditions ?? {})) {
      if (!condition.predicate) {
        errors.push({
          code: 'CONDITION_PREDICATE_REQUIRED',
          severity: 'error',
          path: ['conditions', id, 'predicate'],
          message: `Condition "${id}" of type "${condition.type}" requires a "predicate".`,
          hint: `Add a ${condition.type === 'media' ? 'CSS media query' : 'container query'} as the predicate.`,
        });
      }
    }
    return errors;
  },
};
