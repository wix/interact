import type { Rule } from '..';

const VALID = new Set(['direct', 'linear', 'inverse', 'map', 'template']);

export const validTransformTypes: Rule = {
  code: 'INVALID_TRANSFORM_TYPE',
  defaultSeverity: 'error',
  run: (ctx) =>
    ctx.controlBindingReferences
      .filter(({ binding }) => binding.transform && !VALID.has(binding.transform.type))
      .map(({ path, binding }) => ({
        code: 'INVALID_TRANSFORM_TYPE',
        severity: 'error' as const,
        path: [...path, 'transform', 'type'],
        message: `Invalid transform type "${binding.transform!.type}".`,
      })),
};
