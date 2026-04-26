import type { InteractConfig, TriggerType } from '../types';
import { isRecord, resolveEffect, resolveSequence, buildGlobalMaps } from '../validate/helpers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConfigSummary = {
  interactionCount: number;
  effectCount: number;
  conditionCount: number;
  sequenceCount: number;
  uniqueKeys: string[];
  triggersUsed: TriggerType[];
  crossKeyEdges: { sourceKey: string; targetKey: string; effectId?: string }[];
  hasNamedEffects: boolean;
  hasCustomEffects: boolean;
  hasStateEffects: boolean;
};

export type InteractionSummary = {
  index: number;
  key: string;
  trigger: TriggerType;
  params?: Record<string, unknown>;
  conditions: string[];
  resolvedEffects: ResolvedEffectSummary[];
  resolvedSequences: ResolvedSequenceSummary[];
};

export type ResolvedEffectSummary = {
  effectId?: string;
  kind: 'keyframe' | 'named' | 'custom' | 'state' | 'unknown';
  namedType?: string;
  targetKey?: string;
  properties: string[];
};

export type ResolvedSequenceSummary = {
  sequenceId?: string;
  effectCount: number;
  delay?: number;
  offset?: number;
  triggerType?: string;
};

export type EffectUsageSummary = {
  effectId: string;
  definition: Record<string, unknown>;
  kind: 'keyframe' | 'named' | 'custom' | 'state' | 'unknown';
  referencedBy: { interactionIndex: number; key: string; trigger: TriggerType; context: 'effect' | 'sequence' }[];
};

export type KeySummary = {
  key: string;
  interactionsAsSource: { index: number; trigger: TriggerType }[];
  interactionsAsTarget: { index: number; sourceKey: string; trigger: TriggerType }[];
  effectIds: string[];
};

// ---------------------------------------------------------------------------
// inspectConfig
// ---------------------------------------------------------------------------

export function inspectConfig(config: InteractConfig): ConfigSummary {
  const { globalEffects, globalSequences } = buildGlobalMaps(config);
  const keys = new Set<string>();
  const triggers = new Set<TriggerType>();
  const crossKeyEdges: ConfigSummary['crossKeyEdges'] = [];
  let hasNamed = false;
  let hasCustom = false;
  let hasState = false;

  for (const interaction of config.interactions) {
    keys.add(interaction.key);
    triggers.add(interaction.trigger);

    const effects = collectAllEffects(interaction, globalEffects, globalSequences);

    for (const eff of effects) {
      if ('namedEffect' in eff) hasNamed = true;
      if ('customEffect' in eff) hasCustom = true;
      if ('transition' in eff || 'transitionProperties' in eff) hasState = true;

      if (typeof eff.key === 'string' && eff.key !== interaction.key) {
        crossKeyEdges.push({
          sourceKey: interaction.key,
          targetKey: eff.key as string,
          effectId: typeof eff.effectId === 'string' ? (eff.effectId as string) : undefined,
        });
      }
    }
  }

  return {
    interactionCount: config.interactions.length,
    effectCount: Object.keys(config.effects ?? {}).length,
    conditionCount: Object.keys(config.conditions ?? {}).length,
    sequenceCount: Object.keys(config.sequences ?? {}).length,
    uniqueKeys: [...keys],
    triggersUsed: [...triggers],
    crossKeyEdges,
    hasNamedEffects: hasNamed,
    hasCustomEffects: hasCustom,
    hasStateEffects: hasState,
  };
}

// ---------------------------------------------------------------------------
// inspectInteraction
// ---------------------------------------------------------------------------

export function inspectInteraction(config: InteractConfig, index: number): InteractionSummary | null {
  const interaction = config.interactions[index];
  if (!interaction) return null;

  const { globalEffects, globalSequences } = buildGlobalMaps(config);

  const resolvedEffects: ResolvedEffectSummary[] = [];
  if (interaction.effects) {
    for (const raw of interaction.effects) {
      const eff = isRecord(raw) ? resolveEffect(raw as Record<string, unknown>, globalEffects) : (raw as Record<string, unknown>);
      resolvedEffects.push(summarizeEffect(eff));
    }
  }

  const resolvedSequences: ResolvedSequenceSummary[] = [];
  if (interaction.sequences) {
    for (const raw of interaction.sequences) {
      const seq = isRecord(raw) ? resolveSequence(raw as Record<string, unknown>, globalSequences) : (raw as Record<string, unknown>);
      resolvedSequences.push({
        sequenceId: typeof (raw as Record<string, unknown>).sequenceId === 'string' ? (raw as Record<string, unknown>).sequenceId as string : undefined,
        effectCount: Array.isArray(seq.effects) ? seq.effects.length : 0,
        delay: typeof seq.delay === 'number' ? seq.delay as number : undefined,
        offset: typeof seq.offset === 'number' ? seq.offset as number : undefined,
        triggerType: typeof seq.triggerType === 'string' ? seq.triggerType as string : undefined,
      });
    }
  }

  return {
    index,
    key: interaction.key,
    trigger: interaction.trigger,
    params: isRecord(interaction.params) ? (interaction.params as Record<string, unknown>) : undefined,
    conditions: Array.isArray(interaction.conditions) ? (interaction.conditions as string[]) : [],
    resolvedEffects,
    resolvedSequences,
  };
}

// ---------------------------------------------------------------------------
// inspectEffect
// ---------------------------------------------------------------------------

export function inspectEffect(config: InteractConfig, effectId: string): EffectUsageSummary | null {
  const definition = (config.effects as Record<string, unknown>)?.[effectId];
  if (!isRecord(definition)) return null;

  const { globalEffects, globalSequences } = buildGlobalMaps(config);
  const referencedBy: EffectUsageSummary['referencedBy'] = [];

  for (let i = 0; i < config.interactions.length; i++) {
    const interaction = config.interactions[i];

    if (interaction.effects) {
      for (const raw of interaction.effects) {
        if (isRecord(raw) && (raw as Record<string, unknown>).effectId === effectId) {
          referencedBy.push({ interactionIndex: i, key: interaction.key, trigger: interaction.trigger, context: 'effect' });
        }
      }
    }

    if (interaction.sequences) {
      for (const rawSeq of interaction.sequences) {
        const seq = isRecord(rawSeq) ? resolveSequence(rawSeq as Record<string, unknown>, globalSequences) : (rawSeq as Record<string, unknown>);
        if (Array.isArray(seq.effects)) {
          for (const eff of seq.effects) {
            if (isRecord(eff) && (eff as Record<string, unknown>).effectId === effectId) {
              referencedBy.push({ interactionIndex: i, key: interaction.key, trigger: interaction.trigger, context: 'sequence' });
              break;
            }
          }
        }
      }
    }
  }

  const resolved = resolveEffect({ effectId, ...definition } as Record<string, unknown>, globalEffects);

  return {
    effectId,
    definition: definition as Record<string, unknown>,
    kind: classifyEffectKind(resolved),
    referencedBy,
  };
}

// ---------------------------------------------------------------------------
// inspectKey
// ---------------------------------------------------------------------------

export function inspectKey(config: InteractConfig, key: string): KeySummary {
  const { globalEffects, globalSequences } = buildGlobalMaps(config);
  const asSource: KeySummary['interactionsAsSource'] = [];
  const asTarget: KeySummary['interactionsAsTarget'] = [];
  const effectIds = new Set<string>();

  for (let i = 0; i < config.interactions.length; i++) {
    const interaction = config.interactions[i];

    if (interaction.key === key) {
      asSource.push({ index: i, trigger: interaction.trigger });
    }

    const allEffects = collectAllEffects(interaction, globalEffects, globalSequences);

    for (const eff of allEffects) {
      if (typeof eff.key === 'string' && eff.key === key && interaction.key !== key) {
        asTarget.push({ index: i, sourceKey: interaction.key, trigger: interaction.trigger });
      }
      if (interaction.key === key && typeof eff.effectId === 'string') {
        effectIds.add(eff.effectId as string);
      }
    }
  }

  return {
    key,
    interactionsAsSource: asSource,
    interactionsAsTarget: asTarget,
    effectIds: [...effectIds],
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function classifyEffectKind(eff: Record<string, unknown>): ResolvedEffectSummary['kind'] {
  if ('keyframeEffect' in eff) return 'keyframe';
  if ('namedEffect' in eff) return 'named';
  if ('customEffect' in eff) return 'custom';
  if ('transition' in eff || 'transitionProperties' in eff) return 'state';
  return 'unknown';
}

function summarizeEffect(eff: Record<string, unknown>): ResolvedEffectSummary {
  const kind = classifyEffectKind(eff);
  const properties: string[] = [];

  if (kind === 'keyframe' && isRecord(eff.keyframeEffect)) {
    const kf = eff.keyframeEffect as Record<string, unknown>;
    if (Array.isArray(kf.keyframes)) {
      for (const frame of kf.keyframes) {
        if (isRecord(frame)) {
          properties.push(...Object.keys(frame as Record<string, unknown>));
        }
      }
    }
  }

  return {
    effectId: typeof eff.effectId === 'string' ? (eff.effectId as string) : undefined,
    kind,
    namedType: isRecord(eff.namedEffect) && typeof (eff.namedEffect as Record<string, unknown>).type === 'string'
      ? (eff.namedEffect as Record<string, unknown>).type as string
      : undefined,
    targetKey: typeof eff.key === 'string' ? (eff.key as string) : undefined,
    properties: [...new Set(properties)],
  };
}

function collectAllEffects(
  interaction: Record<string, unknown>,
  globalEffects: Record<string, Record<string, unknown>>,
  globalSequences: Record<string, Record<string, unknown>>,
): Record<string, unknown>[] {
  const result: Record<string, unknown>[] = [];

  if (Array.isArray(interaction.effects)) {
    for (const raw of interaction.effects) {
      if (isRecord(raw)) result.push(resolveEffect(raw as Record<string, unknown>, globalEffects));
    }
  }

  if (Array.isArray(interaction.sequences)) {
    for (const rawSeq of interaction.sequences) {
      if (!isRecord(rawSeq)) continue;
      const seq = resolveSequence(rawSeq as Record<string, unknown>, globalSequences);
      if (Array.isArray(seq.effects)) {
        for (const eff of seq.effects) {
          if (isRecord(eff)) result.push(resolveEffect(eff as Record<string, unknown>, globalEffects));
        }
      }
    }
  }

  return result;
}
