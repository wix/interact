import type { Rule } from '..';
import type { Path } from '../../context';
import type { ValidationError } from '../../errors';

function checkNonNegative(
  value: number | undefined,
  field: string,
  code: string,
  basePath: Path,
  errors: ValidationError[],
): void {
  if (value !== undefined && value < 0) {
    errors.push({
      code,
      severity: 'error',
      path: [...basePath, field],
      message: `"${field}" must be ≥ 0, got ${value}.`,
    });
  }
}

function checkEffectRecord(
  entry: Record<string, unknown>,
  path: Path,
  errors: ValidationError[],
): void {
  checkNonNegative(
    entry['duration'] as number | undefined,
    'duration',
    'NEGATIVE_DURATION',
    path,
    errors,
  );
  checkNonNegative(entry['delay'] as number | undefined, 'delay', 'NEGATIVE_DELAY', path, errors);
  checkNonNegative(
    entry['iterations'] as number | undefined,
    'iterations',
    'NEGATIVE_ITERATIONS',
    path,
    errors,
  );
}

function checkSequenceRecord(
  entry: Record<string, unknown>,
  path: Path,
  errors: ValidationError[],
): void {
  checkNonNegative(
    entry['offset'] as number | undefined,
    'offset',
    'NEGATIVE_OFFSET',
    path,
    errors,
  );
  checkNonNegative(entry['delay'] as number | undefined, 'delay', 'NEGATIVE_DELAY', path, errors);
  if (Array.isArray(entry['effects'])) {
    (entry['effects'] as Record<string, unknown>[]).forEach((e, i) =>
      checkEffectRecord(e, [...path, 'effects', i], errors),
    );
  }
}

export const numericBounds: Rule = {
  code: 'NUMERIC_BOUNDS',
  defaultSeverity: 'error',
  run: (ctx): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Top-level effect definitions
    for (const [id, effect] of Object.entries(ctx.config.effects ?? {})) {
      checkEffectRecord(effect as unknown as Record<string, unknown>, ['effects', id], errors);
    }

    // Top-level sequence definitions
    for (const [id, seq] of Object.entries(ctx.config.sequences ?? {})) {
      checkSequenceRecord(seq as unknown as Record<string, unknown>, ['sequences', id], errors);
    }

    // Per-interaction checks
    ctx.config.interactions.forEach((interaction, i) => {
      const base: Path = ['interactions', i];
      const inter = interaction as unknown as Record<string, unknown>;

      // viewEnter / pageVisible threshold ∈ [0, 1]
      if (
        (interaction.trigger === 'viewEnter' || interaction.trigger === 'pageVisible') &&
        inter['params']
      ) {
        const threshold = (inter['params'] as Record<string, unknown>)['threshold'] as
          | number
          | undefined;
        if (threshold !== undefined && (threshold < 0 || threshold > 1)) {
          errors.push({
            code: 'THRESHOLD_OUT_OF_RANGE',
            severity: 'error',
            path: [...base, 'params', 'threshold'],
            message: `"threshold" must be between 0 and 1, got ${threshold}.`,
          });
        }
      }

      // Inline effects
      if (Array.isArray(inter['effects'])) {
        (inter['effects'] as Record<string, unknown>[]).forEach((e, ei) =>
          checkEffectRecord(e, [...base, 'effects', ei], errors),
        );
      }

      // Inline sequences (and their effects)
      if (Array.isArray(inter['sequences'])) {
        (inter['sequences'] as Record<string, unknown>[]).forEach((s, si) =>
          checkSequenceRecord(s, [...base, 'sequences', si], errors),
        );
      }
    });

    return errors;
  },
};
