import type { Rule } from '..';

export const interactionHasEffectsOrSequences: Rule = {
  code: 'INTERACTION_EMPTY',
  defaultSeverity: 'error',
  run: (ctx) =>
    ctx.interactions
      .filter(({ interaction }) => !interaction.effects?.length && !interaction.sequences?.length)
      .map(({ path }) => ({
        code: 'INTERACTION_EMPTY',
        severity: 'error' as const,
        path,
        message: 'Interaction has neither effects nor sequences.',
        hint: 'Add at least one effect or sequence to the interaction.',
      })),
};
