import type { Rule } from '..';

export const conditionsExist: Rule = {
  code: 'CONDITION_NOT_FOUND',
  defaultSeverity: 'error',
  run: (ctx) =>
    ctx.conditionReferences
      .filter((ref) => !ctx.conditionIds.has(ref.conditionId))
      .map((ref) => ({
        code: 'CONDITION_NOT_FOUND',
        severity: 'error' as const,
        path: ref.path,
        message: `Condition "${ref.conditionId}" is referenced but not defined in interact.conditions.`,
        hint: 'Add an entry to interact.conditions or remove the reference.',
      })),
};
