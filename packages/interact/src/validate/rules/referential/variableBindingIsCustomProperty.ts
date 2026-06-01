import type { Rule } from '..';

export const variableBindingIsCustomProperty: Rule = {
  code: 'VARIABLE_BINDING_INVALID_NAME',
  defaultSeverity: 'error',
  run: (ctx) =>
    ctx.variableBindings
      .filter(({ name }) => !name.startsWith('--'))
      .map(({ path, name }) => ({
        code: 'VARIABLE_BINDING_INVALID_NAME',
        severity: 'error' as const,
        path: [...path, 'targetId'],
        message: `Variable binding "${name}" is not a valid CSS custom property name.`,
        hint: 'CSS custom properties must start with "--".',
      })),
};
