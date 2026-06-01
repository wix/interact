import type { Rule } from '..';
import type { ValidationError } from '../../errors';

// Mirrors the referential rules in reverse: definitions that exist but are never
// referenced produce warnings so dead config can be cleaned up.
export const unusedDefinitions: Rule = {
  code: 'UNUSED_DEFINITION',
  defaultSeverity: 'warning',
  run: (ctx): ValidationError[] => {
    const errors: ValidationError[] = [];

    const referencedEffectIds = new Set(ctx.effectIdReferences.map((r) => r.effectId));
    const referencedSequenceIds = new Set(ctx.sequenceIdReferences.map((r) => r.sequenceId));
    const referencedConditionIds = new Set(ctx.conditionReferences.map((r) => r.conditionId));

    for (const id of ctx.effectIds) {
      if (!referencedEffectIds.has(id)) {
        errors.push({
          code: 'UNUSED_EFFECT',
          severity: 'warning',
          path: ['effects', id],
          message: `Effect "${id}" is defined but never referenced by any interaction.`,
          hint: 'Remove the unused effect or reference it from an interaction.',
        });
      }
    }

    for (const id of ctx.sequenceIds) {
      if (!referencedSequenceIds.has(id)) {
        errors.push({
          code: 'UNUSED_SEQUENCE',
          severity: 'warning',
          path: ['sequences', id],
          message: `Sequence "${id}" is defined but never referenced by any interaction.`,
          hint: 'Remove the unused sequence or reference it from an interaction.',
        });
      }
    }

    for (const id of ctx.conditionIds) {
      if (!referencedConditionIds.has(id)) {
        errors.push({
          code: 'UNUSED_CONDITION',
          severity: 'warning',
          path: ['conditions', id],
          message: `Condition "${id}" is defined but never referenced.`,
          hint: 'Remove the unused condition or reference it from an interaction or effect.',
        });
      }
    }

    return errors;
  },
};
