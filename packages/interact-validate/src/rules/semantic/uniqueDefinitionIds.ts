import type { Rule } from '..';
import type { ValidationError } from '../../errors';

// Checks that keyframeEffect.name is unique across all effects. Object-key
// uniqueness for config.effects / config.sequences is guaranteed by JSON parsers.
export const uniqueDefinitionIds: Rule = {
  code: 'DUPLICATE_KEYFRAME_NAME',
  defaultSeverity: 'warning',
  run: (ctx): ValidationError[] => {
    const errors: ValidationError[] = [];
    const seen = new Map<string, (string | number)[]>();

    for (const { name, path } of ctx.keyframeNames) {
      const first = seen.get(name);
      if (first !== undefined) {
        errors.push({
          code: 'DUPLICATE_KEYFRAME_NAME',
          severity: 'warning',
          path,
          message: `Keyframe name "${name}" is already used at [${first.join(', ')}].`,
          hint: 'Keyframe names must be unique across all effects.',
        });
      } else {
        seen.set(name, path);
      }
    }

    return errors;
  },
};
