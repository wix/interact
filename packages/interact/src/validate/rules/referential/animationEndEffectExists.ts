import type { Rule } from '..';
import type { ValidationError } from '../../errors';

export const animationEndEffectExists: Rule = {
  code: 'ANIMATION_END_EFFECT_NOT_FOUND',
  defaultSeverity: 'error',
  run: (ctx) => {
    const errors: ValidationError[] = [];
    for (const { path, interaction } of ctx.interactions) {
      if (interaction.trigger !== 'animationEnd' || !interaction.params) continue;
      const effectId = (interaction.params as { effectId: string }).effectId;
      if (!ctx.effectIds.has(effectId)) {
        errors.push({
          code: 'ANIMATION_END_EFFECT_NOT_FOUND',
          severity: 'error' as const,
          path: [...path, 'params', 'effectId'],
          message: `animationEnd interaction references effect "${effectId}" which is not defined.`,
          hint: 'Define the effect in interact.effects or fix the params.effectId.',
        });
      }
    }
    return errors;
  },
};
