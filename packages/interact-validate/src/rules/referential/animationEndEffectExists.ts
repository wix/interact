import { referenceRule } from '../_factory';

// effectIdReferences entries whose path contains 'params' come exclusively from
// animationEnd interactions (context.ts adds them at [...base, 'params', 'effectId']).
export const animationEndEffectExists = referenceRule({
  code: 'ANIMATION_END_EFFECT_NOT_FOUND',
  severity: 'error',
  refs: (ctx) => ctx.effectIdReferences.filter((ref) => ref.path.includes('params')),
  has: (ctx, ref) => ctx.effectIds.has(ref.effectId),
  message: (ref) =>
    `animationEnd interaction references effect "${ref.effectId}" which is not defined.`,
  hint: 'Define the effect in interact.effects or fix the params.effectId.',
});
