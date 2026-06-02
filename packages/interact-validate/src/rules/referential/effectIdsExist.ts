import { referenceRule } from '../_factory';

export const effectIdsExist = referenceRule({
  code: 'EFFECT_ID_NOT_FOUND',
  severity: 'error',
  refs: (ctx) => ctx.effectIdReferences.filter((ref) => !ref.path.includes('params')),
  has: (ctx, ref) => ctx.effectIds.has(ref.effectId),
  message: (ref) => `Effect "${ref.effectId}" is referenced but not defined in interact.effects.`,
  hint: 'Add an entry to interact.effects or fix the reference.',
});
