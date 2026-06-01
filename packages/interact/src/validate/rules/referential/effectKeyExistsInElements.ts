import type { Rule } from '..';

export const effectKeyExistsInElements: Rule = {
  code: 'EFFECT_KEY_NOT_FOUND',
  defaultSeverity: 'error',
  run: (ctx) =>
    ctx.effectKeyReferences
      .filter((ref) => !ctx.elementKeys.has(ref.key))
      .map((ref) => ({
        code: 'EFFECT_KEY_NOT_FOUND',
        severity: 'error',
        path: ref.path,
        message: `Effect override key "${ref.key}" is not defined in elements.`,
        hint: `Add "${ref.key}" to elements or remove the override.`,
      })),
};
