import type { Rule } from '..';
import type { ValidationError } from '../../errors';
import { SCRUB_FIELDS, STATE_FIELDS, TIME_FIELDS } from '../../schema/effects';

// viewProgress and pointerMove are scrub triggers; all others are discrete (time-based).
const SCRUB_TRIGGERS = new Set(['viewProgress', 'pointerMove']);

export const triggerEffectCompatible: Rule = {
  code: 'TRIGGER_EFFECT_INCOMPATIBLE',
  defaultSeverity: 'warning',
  run: (ctx): ValidationError[] => {
    const errors: ValidationError[] = [];

    for (const { trigger, effect, path } of ctx.triggerEffectTuples) {
      const e = effect as Record<string, unknown>;
      const isScrub = SCRUB_TRIGGERS.has(trigger);

      if (isScrub) {
        for (const field of TIME_FIELDS) {
          if (e[field] !== undefined) {
            errors.push({
              code: 'TRIGGER_EFFECT_INCOMPATIBLE',
              severity: 'warning',
              path: [...path, field],
              message: `"${field}" is a time-effect field and is incompatible with the "${trigger}" scrub trigger.`,
              hint: 'Use scrub fields (rangeStart, rangeEnd, etc.) for viewProgress and pointerMove triggers.',
            });
          }
        }
        for (const field of STATE_FIELDS) {
          if (e[field] !== undefined) {
            errors.push({
              code: 'TRIGGER_EFFECT_INCOMPATIBLE',
              severity: 'warning',
              path: [...path, field],
              message: `"${field}" is a state-effect field and is incompatible with the "${trigger}" scrub trigger.`,
            });
          }
        }
      } else {
        for (const field of SCRUB_FIELDS) {
          if (e[field] !== undefined) {
            errors.push({
              code: 'TRIGGER_EFFECT_INCOMPATIBLE',
              severity: 'warning',
              path: [...path, field],
              message: `"${field}" is a scrub-effect field and is incompatible with the "${trigger}" trigger.`,
              hint: 'Scrub fields (rangeStart, rangeEnd, etc.) are only valid on viewProgress and pointerMove triggers.',
            });
          }
        }
      }
    }

    return errors;
  },
};
