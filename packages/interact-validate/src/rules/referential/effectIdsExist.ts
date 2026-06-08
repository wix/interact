import type { Rule } from '..';
import type { ValidationError } from '../../errors';

export const effectIdsExist: Rule = {
  code: 'EFFECT_ID_NOT_FOUND',
  defaultSeverity: 'error',
  run: (ctx): ValidationError[] =>
    ctx.effectIdReferences
      .filter((ref) => !ctx.effectIds.has(ref.effectId))
      .map((ref) =>
        ref.fromAnimationEnd
          ? {
              code: 'ANIMATION_END_EFFECT_NOT_FOUND',
              severity: 'error',
              path: ref.path,
              message: `animationEnd interaction references effect "${ref.effectId}" which is not defined.`,
              hint: 'Define the effect in interact.effects or fix the params.effectId.',
            }
          : {
              code: 'EFFECT_ID_NOT_FOUND',
              severity: 'error',
              path: ref.path,
              message: `Effect "${ref.effectId}" is referenced but not defined in interact.effects.`,
              hint: 'Add an entry to interact.effects or fix the reference.',
            },
      ),
};
