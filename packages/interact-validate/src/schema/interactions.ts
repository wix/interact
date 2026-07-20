import { z } from 'zod';
import { Condition } from './primitives';
import {
  Effect,
  ViewProgressEffect,
  ViewProgressEffectRef,
  PointerMoveEffect,
  PointerMoveEffectRef,
  StateEffect,
  StateEffectRef,
  TimeEffect,
  TimeEffectRef,
  exactlyOne,
} from './effects';
import { SequenceConfig, SequenceConfigRef } from './sequences';
import { withPluginFields } from './plugins';
import type { Path, SemanticIssue } from '../types';
import { walkConfig } from '../walkConfig';
import { collectSemanticWarnings } from '../semantic';

export const TriggerType = z.enum([
  'hover',
  'click',
  'interest',
  'activate',
  'viewEnter',
  'viewProgress',
  'pointerMove',
  'animationEnd',
]);

export const ViewEnterParams = z
  .object({
    threshold: z.number().min(0).max(1).optional(),
    inset: z.string().optional(),
    useSafeViewEnter: z.boolean().optional(),
  })
  .strict();

export const PointerMoveParams = z
  .object({
    hitArea: z.enum(['root', 'self']).optional(),
    axis: z.enum(['x', 'y']).optional(),
  })
  .strict();

export const AnimationEndParams = z
  .object({
    effectId: z.string().min(1),
  })
  .strict();

export const TriggerParams = z.union([ViewEnterParams, PointerMoveParams, AnimationEndParams]);

const InteractionBase = {
  key: z.string().min(1),
  selector: z.string().optional(),
  listContainer: z.string().optional(),
  listItemSelector: z.string().optional(),
  conditions: z.array(z.string().min(1)).optional(),
};

const hasEffectsOrSequences = (interaction: { effects?: unknown[]; sequences?: unknown[] }) =>
  (interaction.effects?.length ?? 0) > 0 || (interaction.sequences?.length ?? 0) > 0;

export const AnimationEndInteraction = withPluginFields(
  z.object({
    ...InteractionBase,
    trigger: z.literal('animationEnd'),
    params: AnimationEndParams,
    effects: z.array(z.union([TimeEffect, TimeEffectRef])).optional(),
    sequences: z.array(z.union([SequenceConfig, SequenceConfigRef])).optional(),
  }),
).superRefine((interaction, ctx) => {
    if (!hasEffectsOrSequences(interaction)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Interaction must have at least one effect or sequence',
        params: { domainCode: 'INTERACTION_EMPTY' },
      } as any);
    }
  });

export const ViewEnterInteraction = withPluginFields(
  z.object({
    ...InteractionBase,
    trigger: z.literal('viewEnter'),
    params: ViewEnterParams.optional(),
    effects: z.array(z.union([TimeEffect, TimeEffectRef])).optional(),
    sequences: z.array(z.union([SequenceConfig, SequenceConfigRef])).optional(),
  }),
).superRefine((interaction, ctx) => {
    if (!hasEffectsOrSequences(interaction)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Interaction must have at least one effect or sequence',
        params: { domainCode: 'INTERACTION_EMPTY' },
      } as any);
    }
  });

export const ViewProgressInteraction = withPluginFields(
  z.object({
    ...InteractionBase,
    trigger: z.literal('viewProgress'),
    effects: z.array(z.union([ViewProgressEffect, ViewProgressEffectRef])).min(1),
  }),
);

export const PointerMoveInteraction = withPluginFields(
  z.object({
    ...InteractionBase,
    trigger: z.literal('pointerMove'),
    params: PointerMoveParams.optional(),
    effects: z.array(z.union([PointerMoveEffect, PointerMoveEffectRef])).min(1),
  }),
);

export const ScrubInteraction = z.discriminatedUnion('trigger', [
  ViewProgressInteraction,
  PointerMoveInteraction,
]);

export const DiscreteInteraction = withPluginFields(
  z.object({
    ...InteractionBase,
    trigger: z.enum(['hover', 'click', 'activate', 'interest']),
    effects: z.array(z.union([TimeEffect, TimeEffectRef, StateEffect, StateEffectRef])).optional(),
    sequences: z.array(z.union([SequenceConfig, SequenceConfigRef])).optional(),
  }),
).superRefine((interaction, ctx) => {
    if (!hasEffectsOrSequences(interaction)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Interaction must have at least one effect or sequence',
        params: { domainCode: 'INTERACTION_EMPTY' },
      } as any);
    }
  });

export const Interaction = z.discriminatedUnion('trigger', [
  AnimationEndInteraction,
  ViewEnterInteraction,
  ViewProgressInteraction,
  PointerMoveInteraction,
  DiscreteInteraction,
]);

function validateEffectSource(ctx: z.RefinementCtx, path: Path, effect: any): void {
  const { transition, transitionProperties, namedEffect, keyframeEffect, customEffect } = effect;
  if (
    !exactlyOne({ transition, transitionProperties, namedEffect, keyframeEffect, customEffect })
  ) {
    ctx.addIssue({
      code: 'custom',
      path,
      message: `Effect source must define exactly one of transition, transitionProperties, namedEffect, keyframeEffect, or customEffect`,
      params: { domainCode: 'MULTIPLE_EFFECT_SOURCES' },
    } as any);
  }
}

function validateEffectReference(
  ctx: z.RefinementCtx,
  path: Path,
  effect: { effectId?: string },
  configEffects: Record<string, any>,
): void {
  const { effectId } = effect;
  if (effectId) {
    if (configEffects[effectId]) {
      validateEffectSource(ctx, path, { ...configEffects[effectId], ...effect });
    }
  } else {
    validateEffectSource(ctx, path, effect);
  }
}

type WarningIssue = SemanticIssue;

function collectEffectKeyframeNames(
  warnings: WarningIssue[],
  path: Path,
  keyframeNames: Set<string>,
  keyframeEffect?: { name: string },
): void {
  if (keyframeEffect) {
    if (keyframeNames.has(keyframeEffect.name)) {
      warnings.push({
        code: 'custom',
        path: [...path, 'keyframeEffect', 'name'],
        message: `Keyframe name "${keyframeEffect.name}" already used`,
        params: { domainCode: 'DUPLICATE_KEYFRAME_NAME' },
      });
    }
    keyframeNames.add(keyframeEffect.name);
  }
}

function validateConditionReferences(
  ctx: z.RefinementCtx,
  path: Path,
  configConditions: Record<string, any>,
  conditions?: string[],
): void {
  conditions?.forEach((conditionId, ci) => {
    if (!configConditions[conditionId]) {
      ctx.addIssue({
        code: 'custom',
        path: [...path, 'conditions', ci],
        message: `Condition "${conditionId}" not found`,
        params: { domainCode: 'CONDITION_NOT_FOUND' },
      } as any);
    }
  });
}

export const InteractConfigSchema = z
  .object({
    effects: z.record(z.string().min(1), Effect).optional(),
    sequences: z.record(z.string().min(1), SequenceConfig).optional(),
    conditions: z.record(z.string().min(1), Condition).optional(),
    interactions: z.array(Interaction),
  })
  .strict()
  .superRefine((config, ctx) => {
    const configEffects = config.effects ?? {};
    const configSequences = config.sequences ?? {};
    const configConditions = config.conditions ?? {};

    // Validate animationEnd params.effectId references
    config.interactions.forEach((interaction: any, i: number) => {
      if (interaction.trigger === 'animationEnd' && interaction.params?.effectId) {
        const { effectId } = interaction.params;
        if (!configEffects[effectId]) {
          ctx.addIssue({
            code: 'custom',
            path: ['interactions', i, 'params', 'effectId'],
            message: `Effect "${effectId}" not found`,
            params: { domainCode: 'ANIMATION_END_EFFECT_NOT_FOUND' },
          } as any);
        }
      }
    });

    walkConfig(config, {
      onInteraction: (path, interaction) => {
        validateConditionReferences(ctx, path, configConditions, interaction.conditions);
      },
      onEffect: (path, effect, isTopLevel) => {
        validateConditionReferences(ctx, path, configConditions, effect.conditions);
        if (!isTopLevel) {
          validateEffectReference(ctx, path, effect, configEffects);
        }
      },
      onSequence: (path, sequence, isTopLevel) => {
        validateConditionReferences(ctx, path, configConditions, sequence.conditions);
        if (!isTopLevel && sequence.sequenceId && !configSequences[sequence.sequenceId]) {
          ctx.addIssue({
            code: 'custom',
            path: [...path, 'sequenceId'],
            message: `Sequence "${sequence.sequenceId}" not found`,
            params: { domainCode: 'SEQUENCE_ID_NOT_FOUND' },
          } as any);
        }
      },
    });
  })
  .transform((config) => {
    const configEffects = config.effects ?? {};
    const configSequences = config.sequences ?? {};
    const configConditions = config.conditions ?? {};
    const keyframeNames = new Set<string>();
    const effectIdReferences = new Set(Object.keys(configEffects));
    const sequenceIdReferences = new Set(Object.keys(configSequences));
    const conditionReferences = new Set(Object.keys(configConditions));

    const warnings: WarningIssue[] = [];

    walkConfig(config, {
      onInteraction: (_path, interaction) => {
        interaction.conditions?.forEach(Set.prototype.delete, conditionReferences);
      },
      onEffect: (path, effect, isTopLevel) => {
        effect.conditions?.forEach(Set.prototype.delete, conditionReferences);
        collectEffectKeyframeNames(warnings, path, keyframeNames, (effect as any).keyframeEffect);
        if (!isTopLevel && effect.effectId) {
          if (!configEffects[effect.effectId]) {
            warnings.push({
              code: 'custom',
              path: [...path, 'effectId'],
              message: `Effect "${effect.effectId}" not found`,
              params: { domainCode: 'EFFECT_ID_NOT_FOUND' },
            } as any);
          }
          effectIdReferences.delete(effect.effectId);
        }
      },
      onSequence: (_path, sequence, isTopLevel) => {
        sequence.conditions?.forEach(Set.prototype.delete, conditionReferences);
        if (!isTopLevel && sequence.sequenceId) {
          sequenceIdReferences.delete(sequence.sequenceId);
        }
      },
    });

    effectIdReferences.forEach((effectId) => {
      warnings.push({
        code: 'custom',
        path: ['effects', effectId],
        message: `Effect "${effectId}" is not referenced by any interaction`,
        params: { domainCode: 'UNUSED_EFFECT' },
      });
    });
    sequenceIdReferences.forEach((sequenceId) => {
      warnings.push({
        code: 'custom',
        path: ['sequences', sequenceId],
        message: `Sequence "${sequenceId}" is not referenced by any interaction`,
        params: { domainCode: 'UNUSED_SEQUENCE' },
      });
    });
    conditionReferences.forEach((conditionId) => {
      warnings.push({
        code: 'custom',
        path: ['conditions', conditionId],
        message: `Condition "${conditionId}" is not referenced by any interaction`,
        params: { domainCode: 'UNUSED_CONDITION' },
      });
    });

    // Append the rule-derived semantic warnings/info nudges (A/C/D + animationEnd self-reference).
    warnings.push(...collectSemanticWarnings(config));

    return { ...config, warnings };
  });
