import type { Rule } from '..';

export const styleBindingSelectorExists: Rule = {
  code: 'STYLE_BINDING_SELECTOR_NOT_FOUND',
  defaultSeverity: 'error',
  run: (ctx) =>
    ctx.controlBindingReferences
      .filter(({ binding }) => binding.target === 'style' && !ctx.styleSelectors.has(binding.targetId))
      .map(({ path, binding }) => ({
        code: 'STYLE_BINDING_SELECTOR_NOT_FOUND',
        severity: 'error' as const,
        path: [...path, 'targetId'],
        message: `Style binding selector "${binding.targetId}" does not match any styles[].selector.`,
        hint: 'Add a matching entry to styles or fix the binding targetId.',
      })),
};
