import type { Rule } from '..';
import type { ValidationError } from '../../errors';

export const controlTargetsExist: Rule = {
  code: 'CONTROL_TARGET_NOT_FOUND',
  defaultSeverity: 'error',
  run: (ctx) => {
    const errors: ValidationError[] = [];
    for (const { path, binding } of ctx.controlBindingReferences) {
      switch (binding.target) {
        case 'element':
          if (!ctx.elementKeys.has(binding.targetId)) {
            errors.push({
              code: 'CONTROL_TARGET_NOT_FOUND' as const,
              severity: 'error' as const,
              path: [...path, 'targetId'],
              message: `Element "${binding.targetId}" referenced by control binding is not defined.`,
            });
          }
          break;
        case 'effect':
          if (!ctx.effectIds.has(binding.targetId)) {
            errors.push({
              code: 'CONTROL_TARGET_NOT_FOUND' as const,
              severity: 'error' as const,
              path: [...path, 'targetId'],
              message: `Effect "${binding.targetId}" referenced by control binding is not defined.`,
            });
          }
          break;
        case 'sequence':
          if (!ctx.sequenceIds.has(binding.targetId)) {
            errors.push({
              code: 'CONTROL_TARGET_NOT_FOUND' as const,
              severity: 'error' as const,
              path: [...path, 'targetId'],
              message: `Sequence "${binding.targetId}" referenced by control binding is not defined.`,
            });
          }
          break;
        case 'interaction':
          if (!ctx.interactionIds.has(binding.targetId)) {
            errors.push({
              code: 'CONTROL_TARGET_NOT_FOUND' as const,
              severity: 'error' as const,
              path: [...path, 'targetId'],
              message: `Interaction "${binding.targetId}" referenced by control binding is not defined.`,
            });
          }
          break;
        case 'style':
        case 'variable':
          // Validated in dedicated rules below.
          break;
      }
    }
    return errors;
  },
};
