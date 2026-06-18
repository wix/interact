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

export const TriggerType = z.enum([
  'hover',
  'click',
  'interest',
  'activate',
  'viewEnter',
  'viewProgress',
  'pointerMove',
  'animationEnd',
  'pageVisible',
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

export const AnimationEndInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.literal('animationEnd'),
    params: AnimationEndParams,
    effects: z.array(z.union([TimeEffect, TimeEffectRef])).optional(),
    sequences: z.array(z.union([SequenceConfig, SequenceConfigRef])).optional(),
  })
  .strict()
  .superRefine((interaction, ctx) => {
    if (!hasEffectsOrSequences(interaction)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Interaction must have at least one effect or sequence',
        params: { domainCode: 'INTERACTION_EMPTY' },
      } as any);
    }
  });

export const ViewEnterInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.enum(['viewEnter', 'pageVisible']),
    params: ViewEnterParams.optional(),
    effects: z.array(z.union([TimeEffect, TimeEffectRef])).optional(),
    sequences: z.array(z.union([SequenceConfig, SequenceConfigRef])).optional(),
  })
  .strict()
  .superRefine((interaction, ctx) => {
    if (!hasEffectsOrSequences(interaction)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Interaction must have at least one effect or sequence',
        params: { domainCode: 'INTERACTION_EMPTY' },
      } as any);
    }
  });

export const ViewProgressInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.literal('viewProgress'),
    effects: z.array(z.union([ViewProgressEffect, ViewProgressEffectRef])).min(1),
  })
  .strict();

export const PointerMoveInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.literal('pointerMove'),
    params: PointerMoveParams.optional(),
    effects: z.array(z.union([PointerMoveEffect, PointerMoveEffectRef])).min(1),
  })
  .strict();

export const ScrubInteraction = z.discriminatedUnion('trigger', [
  ViewProgressInteraction,
  PointerMoveInteraction,
]);

export const StateInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.enum(['hover', 'click', 'activate', 'interest']),
    effects: z.array(z.union([StateEffect, StateEffectRef])).min(1),
  })
  .strict();

export const Interaction = z.discriminatedUnion('trigger', [
  AnimationEndInteraction,
  ViewEnterInteraction,
  ViewProgressInteraction,
  PointerMoveInteraction,
  StateInteraction,
]);

function validateEffectSource(ctx: z.RefinementCtx, path: (string | number)[], effect: any): void {
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
  path: (string | number)[],
  effect: { effectId?: string },
  configEffects: Record<string, any>,
): void {
  const { effectId } = effect;
  if (effectId) {
    if (configEffects[effectId]) {
      validateEffectSource(ctx, path, { ...configEffects[effectId], ...effect });
    } else {
      ctx.addIssue({
        code: 'custom',
        path: [...path, 'effectId'],
        message: `Effect "${effectId}" not found`,
        params: { domainCode: 'EFFECT_ID_NOT_FOUND' },
      } as any);
    }
  } else {
    validateEffectSource(ctx, path, effect);
  }
}

type WarningIssue = {
  code: 'custom';
  path: (string | number)[];
  message: string;
  params: { domainCode: string };
};

function collectEffectKeyframeNames(
  warnings: WarningIssue[],
  path: (string | number)[],
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
  path: (string | number)[],
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

type Path = (string | number)[];

function walkConfig(
  config: {
    effects?: Record<string, any>;
    sequences?: Record<string, any>;
    interactions: any[];
  },
  visitors: {
    onInteraction?: (path: Path, interaction: any) => void;
    onEffect: (path: Path, effect: any, isTopLevel: boolean) => void;
    onSequence: (path: Path, sequence: any, isTopLevel: boolean) => void;
  },
): void {
  const { onInteraction, onEffect, onSequence } = visitors;

  Object.entries(config.effects ?? {}).forEach(([id, effect]) => {
    onEffect(['effects', id], effect, true);
  });

  Object.entries(config.sequences ?? {}).forEach(([id, sequence]) => {
    onSequence(['sequences', id], sequence, true);
    sequence.effects.forEach((effect: any, ei: number) => {
      onEffect(['sequences', id, 'effects', ei], effect, false);
    });
  });

  config.interactions.forEach((interaction: any, i: number) => {
    onInteraction?.(['interactions', i], interaction);
    const { effects, sequences } = interaction as { effects?: any[]; sequences?: any[] };
    effects?.forEach((effect, ei) => {
      onEffect(['interactions', i, 'effects', ei], effect, false);
    });
    sequences?.forEach((sequence, si) => {
      const seqPath: Path = ['interactions', i, 'sequences', si];
      onSequence(seqPath, sequence, false);
      sequence.effects?.forEach((effect: any, ei: number) => {
        onEffect([...seqPath, 'effects', ei], effect, false);
      });
    });
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

    return { ...config, warnings };
  });
