import type { Rule } from '..';

export const sequenceIdsExist: Rule = {
  code: 'SEQUENCE_ID_NOT_FOUND',
  defaultSeverity: 'error',
  run: (ctx) =>
    ctx.sequenceIdReferences
      .filter((ref) => !ctx.sequenceIds.has(ref.sequenceId))
      .map((ref) => ({
        code: 'SEQUENCE_ID_NOT_FOUND',
        severity: 'error' as const,
        path: ref.path,
        message: `Sequence "${ref.sequenceId}" is referenced but not defined in interact.sequences.`,
        hint: 'Add an entry to interact.sequences or fix the reference.',
      })),
};
