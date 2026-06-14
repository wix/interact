import type { InteractConfig, SequenceConfig, SequenceConfigRef, Interaction } from '@wix/interact';
import type { Effect, EffectRef } from '@wix/interact';

export type Path = (string | number)[];

export type EffectIdRef = { path: Path; effectId: string; fromAnimationEnd?: true };
export type SequenceIdRef = { path: Path; sequenceId: string };
export type ConditionRef = { path: Path; conditionId: string };
export type InteractionRef = { path: Path; interaction: Interaction };

export type TriggerEffectTuple = {
  trigger: string;
  effect: Effect;
  path: Path;
};

export type KeyframeNameRef = {
  name: string;
  path: Path;
};

export type ValidationContext = {
  config: InteractConfig;

  effectIds: Set<string>;
  sequenceIds: Set<string>;
  conditionIds: Set<string>;

  effectIdReferences: EffectIdRef[];
  sequenceIdReferences: SequenceIdRef[];
  conditionReferences: ConditionRef[];
  interactions: InteractionRef[];

  triggerEffectTuples: TriggerEffectTuple[];
  keyframeNames: KeyframeNameRef[];
};

function isEffectRef(entry: Effect | EffectRef): entry is EffectRef {
  return !!(entry as Record<string, unknown>)['effectId'];
}

function isSequenceRef(entry: SequenceConfig | SequenceConfigRef): entry is SequenceConfigRef {
  return !!(entry as Record<string, unknown>)['sequenceId'];
}

function collectKeyframeName(effect: Effect, basePath: Path, out: KeyframeNameRef[]): void {
  const ke = (effect as Record<string, unknown>)['keyframeEffect'] as { name: string } | undefined;
  if (ke) {
    out.push({ name: ke.name, path: [...basePath, 'keyframeEffect', 'name'] });
  }
}

function walkEffect(
  effect: Effect,
  basePath: Path,
  ctx: Pick<ValidationContext, 'conditionReferences' | 'keyframeNames'>,
): void {
  effect.conditions?.forEach((c, i) =>
    ctx.conditionReferences.push({ path: [...basePath, 'conditions', i], conditionId: c }),
  );
  collectKeyframeName(effect, basePath, ctx.keyframeNames);
}

function walkSequence(
  seq: SequenceConfig,
  basePath: Path,
  ctx: Pick<ValidationContext, 'effectIdReferences' | 'conditionReferences' | 'keyframeNames'>,
): void {
  seq.effects.forEach((entry, i) => {
    const path = [...basePath, 'effects', i];
    if (isEffectRef(entry)) {
      ctx.effectIdReferences.push({ path: [...path, 'effectId'], effectId: entry.effectId });
    }
    walkEffect(entry, path, ctx);
  });
  seq.conditions?.forEach((c, i) =>
    ctx.conditionReferences.push({ path: [...basePath, 'conditions', i], conditionId: c }),
  );
}

export function buildContext(config: InteractConfig): ValidationContext {
  const effectIds = new Set(Object.keys(config.effects ?? {}));
  const sequenceIds = new Set(Object.keys(config.sequences ?? {}));
  const conditionIds = new Set(Object.keys(config.conditions ?? {}));

  const effectIdReferences: EffectIdRef[] = [];
  const sequenceIdReferences: SequenceIdRef[] = [];
  const conditionReferences: ConditionRef[] = [];
  const interactions: InteractionRef[] = [];
  const triggerEffectTuples: TriggerEffectTuple[] = [];
  const keyframeNames: KeyframeNameRef[] = [];

  for (const [id, effect] of Object.entries(config.effects ?? {})) {
    walkEffect(effect, ['effects', id], { conditionReferences, keyframeNames });
  }

  for (const [id, seq] of Object.entries(config.sequences ?? {})) {
    walkSequence(seq, ['sequences', id], {
      effectIdReferences,
      conditionReferences,
      keyframeNames,
    });
  }

  config.interactions.forEach((interaction, i) => {
    const base: Path = ['interactions', i];
    interactions.push({ path: base, interaction });

    interaction.conditions?.forEach((c, ci) =>
      conditionReferences.push({ path: [...base, 'conditions', ci], conditionId: c }),
    );

    if (interaction.trigger === 'animationEnd' && interaction.params) {
      effectIdReferences.push({
        path: [...base, 'params', 'effectId'],
        effectId: (interaction.params as { effectId: string }).effectId,
        fromAnimationEnd: true,
      });
    }

    interaction.effects?.forEach((entry, ei) => {
      const path: Path = [...base, 'effects', ei];
      if (isEffectRef(entry)) {
        effectIdReferences.push({ path: [...path, 'effectId'], effectId: entry.effectId });
      }
      walkEffect(entry, path, { conditionReferences, keyframeNames });
      triggerEffectTuples.push({
        trigger: interaction.trigger,
        effect: { ...(config.effects?.[entry.effectId || ''] || {}), ...entry },
        path,
      });
    });

    interaction.sequences?.forEach((entry, si) => {
      const path: Path = [...base, 'sequences', si];
      if (isSequenceRef(entry)) {
        sequenceIdReferences.push({ path: [...path, 'sequenceId'], sequenceId: entry.sequenceId });
      }
      walkSequence({ effects: [], ...entry }, path, {
        effectIdReferences,
        conditionReferences,
        keyframeNames,
      });
    });
  });

  return {
    config,
    effectIds,
    sequenceIds,
    conditionIds,
    effectIdReferences,
    sequenceIdReferences,
    conditionReferences,
    interactions,
    triggerEffectTuples,
    keyframeNames,
  };
}
