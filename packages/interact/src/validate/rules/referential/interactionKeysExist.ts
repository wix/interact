import type { Rule } from '..';

export const interactionKeysExist: Rule = {
  code: 'INTERACTION_KEY_NOT_FOUND',
  defaultSeverity: 'error',
  run: (ctx) =>
    ctx.interactionKeyReferences
      .filter((ref) => !ctx.elementKeys.has(ref.key))
      .map((ref) => ({
        code: 'INTERACTION_KEY_NOT_FOUND',
        severity: 'error',
        path: ref.path,
        message: `Interaction targets element key "${ref.key}" which is not defined in elements.`,
        hint: `Add "${ref.key}" to elements or fix the interaction key.`,
      })),
};
