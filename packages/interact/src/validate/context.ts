import type {
  Control,
  ControlBinding,
  Experience,
  ExperienceInteraction,
  SerializableEffect,
  SerializableSequenceConfig,
} from '../schema';

export type Path = (string | number)[];

export type EffectIdRef = { path: Path; effectId: string };
export type SequenceIdRef = { path: Path; sequenceId: string };
export type ElementKeyRef = { path: Path; key: string };
export type ConditionRef = { path: Path; conditionId: string };
export type ControlBindingRef = { path: Path; binding: ControlBinding; controlId: string };
export type VariableBindingRef = { path: Path; name: string; controlId: string };
export type InteractionRef = { path: Path; interaction: ExperienceInteraction };

export type ValidationContext = {
  experience: Experience;

  elementKeys: Set<string>;
  effectIds: Set<string>;
  sequenceIds: Set<string>;
  conditionIds: Set<string>;
  controlIds: Set<string>;
  styleSelectors: Set<string>;
  interactionIds: Set<string>;

  effectIdReferences: EffectIdRef[];
  sequenceIdReferences: SequenceIdRef[];
  interactionKeyReferences: ElementKeyRef[];
  effectKeyReferences: ElementKeyRef[];
  conditionReferences: ConditionRef[];
  controlBindingReferences: ControlBindingRef[];
  variableBindings: VariableBindingRef[];
  interactions: InteractionRef[];
  controls: Control[];

  cssVarUsage: Set<string>;
};

const VAR_RE = /var\(\s*(--[A-Za-z0-9_-]+)/g;

function collectVarUsage(value: string, out: Set<string>): void {
  for (const m of value.matchAll(VAR_RE)) out.add(m[1]!);
}

function walkEffect(
  effect: SerializableEffect,
  basePath: Path,
  ctx: Pick<ValidationContext, 'effectKeyReferences' | 'conditionReferences'>,
): void {
  if (effect.key !== undefined) {
    ctx.effectKeyReferences.push({ path: [...basePath, 'key'], key: effect.key });
  }
  if (effect.conditions) {
    effect.conditions.forEach((c, i) =>
      ctx.conditionReferences.push({ path: [...basePath, 'conditions', i], conditionId: c }),
    );
  }
}

function walkSequence(
  seq: SerializableSequenceConfig,
  basePath: Path,
  ctx: Pick<ValidationContext, 'effectIdReferences' | 'conditionReferences' | 'effectKeyReferences'>,
): void {
  seq.effects.forEach((entry, i) => {
    const path = [...basePath, 'effects', i];
    if ('effectId' in entry && entry.effectId !== undefined && !('namedEffect' in entry) && !('keyframeEffect' in entry)) {
      // Ref-only entry
      ctx.effectIdReferences.push({ path: [...path, 'effectId'], effectId: entry.effectId });
    } else {
      walkEffect(entry as SerializableEffect, path, ctx);
    }
  });
  if (seq.conditions) {
    seq.conditions.forEach((c, i) =>
      ctx.conditionReferences.push({ path: [...basePath, 'conditions', i], conditionId: c }),
    );
  }
}

export function buildContext(experience: Experience): ValidationContext {
  const elementKeys = new Set(Object.keys(experience.elements));
  const effectIds = new Set(Object.keys(experience.interact.effects));
  const sequenceIds = new Set(Object.keys(experience.interact.sequences ?? {}));
  const conditionIds = new Set(Object.keys(experience.interact.conditions ?? {}));
  const controlIds = new Set(experience.controls.map((c) => c.id));
  const styleSelectors = new Set((experience.styles ?? []).map((s) => s.selector));
  const interactionIds = new Set(
    experience.interact.interactions.map((i) => i.id).filter((id): id is string => Boolean(id)),
  );

  const effectIdReferences: EffectIdRef[] = [];
  const sequenceIdReferences: SequenceIdRef[] = [];
  const interactionKeyReferences: ElementKeyRef[] = [];
  const effectKeyReferences: ElementKeyRef[] = [];
  const conditionReferences: ConditionRef[] = [];
  const controlBindingReferences: ControlBindingRef[] = [];
  const variableBindings: VariableBindingRef[] = [];
  const interactions: InteractionRef[] = [];
  const cssVarUsage = new Set<string>();

  // Effects (top-level)
  for (const [id, effect] of Object.entries(experience.interact.effects)) {
    walkEffect(effect, ['interact', 'effects', id], {
      effectKeyReferences,
      conditionReferences,
    });
  }

  // Sequences
  for (const [id, seq] of Object.entries(experience.interact.sequences ?? {})) {
    walkSequence(seq, ['interact', 'sequences', id], {
      effectIdReferences,
      effectKeyReferences,
      conditionReferences,
    });
  }

  // Interactions
  experience.interact.interactions.forEach((interaction, i) => {
    const base: Path = ['interact', 'interactions', i];
    interactions.push({ path: base, interaction });

    interactionKeyReferences.push({ path: [...base, 'key'], key: interaction.key });

    if (interaction.conditions) {
      interaction.conditions.forEach((c, ci) =>
        conditionReferences.push({
          path: [...base, 'conditions', ci],
          conditionId: c,
        }),
      );
    }

    if (interaction.trigger === 'animationEnd' && interaction.params) {
      effectIdReferences.push({
        path: [...base, 'params', 'effectId'],
        effectId: interaction.params.effectId,
      });
    }

    interaction.effects?.forEach((entry, ei) => {
      const path: Path = [...base, 'effects', ei];
      if (
        'effectId' in entry &&
        entry.effectId !== undefined &&
        !('namedEffect' in entry) &&
        !('keyframeEffect' in entry)
      ) {
        effectIdReferences.push({ path: [...path, 'effectId'], effectId: entry.effectId });
      } else {
        walkEffect(entry as SerializableEffect, path, {
          effectKeyReferences,
          conditionReferences,
        });
      }
    });

    interaction.sequences?.forEach((entry, si) => {
      const path: Path = [...base, 'sequences', si];
      if ('sequenceId' in entry && !('effects' in entry)) {
        sequenceIdReferences.push({
          path: [...path, 'sequenceId'],
          sequenceId: entry.sequenceId,
        });
      } else {
        walkSequence(entry as SerializableSequenceConfig, path, {
          effectIdReferences,
          effectKeyReferences,
          conditionReferences,
        });
      }
    });
  });

  // Controls
  experience.controls.forEach((control, ci) => {
    control.bindings.forEach((binding, bi) => {
      const path: Path = ['controls', ci, 'bindings', bi];
      controlBindingReferences.push({ path, binding, controlId: control.id });
      if (binding.target === 'variable') {
        variableBindings.push({ path, name: binding.targetId, controlId: control.id });
      }
    });
  });

  // CSS var() usage in element styles + top-level styles
  for (const el of Object.values(experience.elements)) {
    if (!el.styles) continue;
    for (const v of Object.values(el.styles)) collectVarUsage(v, cssVarUsage);
  }
  for (const rule of experience.styles ?? []) {
    for (const v of Object.values(rule.properties)) collectVarUsage(v, cssVarUsage);
  }

  return {
    experience,
    elementKeys,
    effectIds,
    sequenceIds,
    conditionIds,
    controlIds,
    styleSelectors,
    interactionIds,
    effectIdReferences,
    sequenceIdReferences,
    interactionKeyReferences,
    effectKeyReferences,
    conditionReferences,
    controlBindingReferences,
    variableBindings,
    interactions,
    controls: experience.controls,
    cssVarUsage,
  };
}
