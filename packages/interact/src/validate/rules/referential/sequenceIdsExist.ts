import { referenceRule } from '../_factory';

export const sequenceIdsExist = referenceRule({
  code: 'SEQUENCE_ID_NOT_FOUND',
  severity: 'error',
  refs: (ctx) => ctx.sequenceIdReferences,
  has: (ctx, ref) => ctx.sequenceIds.has(ref.sequenceId),
  message: (ref) =>
    `Sequence "${ref.sequenceId}" is referenced but not defined in interact.sequences.`,
  hint: 'Add an entry to interact.sequences or fix the reference.',
});
