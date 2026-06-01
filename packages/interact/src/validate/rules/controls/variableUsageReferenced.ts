import type { Rule } from '..';

export const variableUsageReferenced: Rule = {
  code: 'VARIABLE_UNUSED',
  defaultSeverity: 'warning',
  run: (ctx) =>
    ctx.variableBindings
      .filter(({ name }) => name.startsWith('--') && !ctx.cssVarUsage.has(name))
      .map(({ path, name, controlId }) => ({
        code: 'VARIABLE_UNUSED',
        severity: 'warning' as const,
        path,
        message: `Variable "${name}" written by control "${controlId}" is not referenced via var() in any style.`,
        hint: `Reference ${name} from elements[*].styles or styles[*].properties, or remove the binding.`,
      })),
};
