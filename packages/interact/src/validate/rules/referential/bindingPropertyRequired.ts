import type { Rule } from '..';

const REQUIRES_PROPERTY = new Set([
  'effect',
  'sequence',
  'style',
  'element',
  'interaction',
]);

export const bindingPropertyRequired: Rule = {
  code: 'BINDING_PROPERTY_REQUIRED',
  defaultSeverity: 'error',
  run: (ctx) =>
    ctx.controlBindingReferences
      .filter(
        ({ binding }) => REQUIRES_PROPERTY.has(binding.target) && !binding.property,
      )
      .map(({ path, binding }) => ({
        code: 'BINDING_PROPERTY_REQUIRED',
        severity: 'error' as const,
        path,
        message: `Binding to ${binding.target} "${binding.targetId}" requires a "property".`,
      })),
};
