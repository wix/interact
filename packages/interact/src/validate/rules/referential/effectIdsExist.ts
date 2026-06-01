import type { Rule } from '..';

export const effectIdsExist: Rule = {
  code: 'EFFECT_ID_NOT_FOUND',
  defaultSeverity: 'error',
  run: (ctx) =>
    ctx.effectIdReferences
      .filter((ref) => !ctx.effectIds.has(ref.effectId))
      .map((ref) => ({
        code: 'EFFECT_ID_NOT_FOUND',
        severity: 'error',
        path: ref.path,
        message: `Effect "${ref.effectId}" is referenced but not defined in interact.effects.`,
        hint: 'Add an entry to interact.effects or fix the reference.',
      })),
};
