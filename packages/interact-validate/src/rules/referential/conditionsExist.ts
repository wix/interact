import { referenceRule } from '../_factory';

export const conditionsExist = referenceRule({
  code: 'CONDITION_NOT_FOUND',
  severity: 'error',
  refs: (ctx) => ctx.conditionReferences,
  has: (ctx, ref) => ctx.conditionIds.has(ref.conditionId),
  message: (ref) =>
    `Condition "${ref.conditionId}" is referenced but not defined in interact.conditions.`,
  hint: 'Add an entry to interact.conditions or remove the reference.',
});
