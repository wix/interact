import type { InteractConfig, ValidationResult, Scope } from '../types';
import { isRecord, error, warning, toResult, isInScope } from './helpers';

/**
 * Validate that all cross-references in the config resolve correctly:
 * - effectId -> config.effects
 * - conditions -> config.conditions
 * - sequenceId -> config.sequences
 * - animationEnd params.effectId -> existing effect
 * - Cross-key wiring (effect.key targets existing interaction key)
 * - Orphan detection for unused effects/conditions/sequences
 */
export function validateReferences(config: InteractConfig, scope?: Scope): ValidationResult {
  const entries = [];
  const effects = config.effects ?? {};
  const conditions = config.conditions ?? {};
  const sequences = config.sequences ?? {};

  const referencedEffects = new Set<string>();
  const referencedConditions = new Set<string>();
  const referencedSequences = new Set<string>();

  for (let i = 0; i < config.interactions.length; i++) {
    const interaction = config.interactions[i];
    if (!isInScope(interaction, i, scope)) continue;
    const basePath = ['interactions', i] as (string | number)[];

    // Interaction-level conditions
    if (interaction.conditions) {
      for (let c = 0; c < interaction.conditions.length; c++) {
        const ref = interaction.conditions[c];
        referencedConditions.add(ref);
        if (!(ref in conditions)) {
          entries.push(error([...basePath, 'conditions', c], 'condition-ref-missing', `Condition "${ref}" is not defined in config.conditions`));
        }
      }
    }

    // Effects
    if (interaction.effects) {
      for (let j = 0; j < interaction.effects.length; j++) {
        const eff = interaction.effects[j] as Record<string, unknown>;
        const effPath = [...basePath, 'effects', j];

        if (typeof eff.effectId === 'string') {
          referencedEffects.add(eff.effectId);
          if (!(eff.effectId in effects)) {
            entries.push(error([...effPath, 'effectId'], 'effect-ref-missing', `Effect "${eff.effectId}" is not defined in config.effects`));
          }
        }

        collectConditionRefs(eff, effPath, conditions, referencedConditions, entries);

        if (typeof eff.key === 'string' && eff.key !== interaction.key) {
          const targetExists = config.interactions.some((ix) => ix.key === eff.key);
          if (!targetExists) {
            entries.push(warning([...effPath, 'key'], 'cross-key-missing', `Effect targets key "${eff.key}" but no interaction with that key exists`));
          }
        }
      }
    }

    // Sequences
    if (interaction.sequences) {
      for (let j = 0; j < interaction.sequences.length; j++) {
        const seq = interaction.sequences[j] as Record<string, unknown>;
        const seqPath = [...basePath, 'sequences', j];

        if (typeof seq.sequenceId === 'string') {
          referencedSequences.add(seq.sequenceId);
          if (!(seq.sequenceId in sequences)) {
            entries.push(error([...seqPath, 'sequenceId'], 'sequence-ref-missing', `Sequence "${seq.sequenceId}" is not defined in config.sequences`));
          }
        }

        collectConditionRefs(seq, seqPath, conditions, referencedConditions, entries);

        const resolved = typeof seq.sequenceId === 'string' && isRecord(sequences[seq.sequenceId])
          ? (sequences[seq.sequenceId] as Record<string, unknown>)
          : null;
        const seqEffects = Array.isArray(seq.effects) ? seq.effects : [];
        const effectsToCheck = seqEffects.length > 0
          ? seqEffects
          : (resolved && Array.isArray(resolved.effects) ? resolved.effects : []);

        for (let k = 0; k < effectsToCheck.length; k++) {
          const eff = effectsToCheck[k] as Record<string, unknown>;
          if (typeof eff.effectId === 'string') {
            referencedEffects.add(eff.effectId);
            if (!(eff.effectId in effects)) {
              entries.push(error([...seqPath, 'effects', k, 'effectId'], 'effect-ref-missing', `Effect "${eff.effectId}" is not defined in config.effects`));
            }
          }
          collectConditionRefs(eff, [...seqPath, 'effects', k], conditions, referencedConditions, entries);
        }
      }
    }

    // animationEnd params.effectId
    if (interaction.trigger === 'animationEnd' && isRecord(interaction.params)) {
      const params = interaction.params as Record<string, unknown>;
      if (typeof params.effectId === 'string') {
        referencedEffects.add(params.effectId);
        if (!(params.effectId in effects)) {
          entries.push(error([...basePath, 'params', 'effectId'], 'animationEnd-effect-ref', `animationEnd params.effectId "${params.effectId}" is not defined in config.effects`));
        }
      }
    }
  }

  // Scan top-level sequences for effectId/condition refs
  for (const [seqId, seq] of Object.entries(sequences)) {
    if (!isRecord(seq)) continue;
    const seqObj = seq as Record<string, unknown>;
    if (Array.isArray(seqObj.effects)) {
      for (let k = 0; k < seqObj.effects.length; k++) {
        const eff = seqObj.effects[k] as Record<string, unknown>;
        if (typeof eff.effectId === 'string') {
          referencedEffects.add(eff.effectId);
          if (!(eff.effectId in effects)) {
            entries.push(error(['sequences', seqId, 'effects', k, 'effectId'], 'effect-ref-missing', `Effect "${eff.effectId}" is not defined in config.effects`));
          }
        }
      }
    }
    if (Array.isArray(seqObj.conditions)) {
      for (const ref of seqObj.conditions as string[]) {
        referencedConditions.add(ref);
      }
    }
  }

  // Orphan detection (only when no scope filter)
  if (!scope) {
    for (const id of Object.keys(effects)) {
      if (!referencedEffects.has(id)) {
        entries.push(warning(['effects', id], 'orphan-effect', `Effect "${id}" is defined but never referenced by any interaction`));
      }
    }
    for (const id of Object.keys(conditions)) {
      if (!referencedConditions.has(id)) {
        entries.push(warning(['conditions', id], 'orphan-condition', `Condition "${id}" is defined but never referenced`));
      }
    }
    for (const id of Object.keys(sequences)) {
      if (!referencedSequences.has(id)) {
        entries.push(warning(['sequences', id], 'orphan-sequence', `Sequence "${id}" is defined but never referenced by any interaction`));
      }
    }
  }

  return toResult(entries);
}

function collectConditionRefs(
  obj: Record<string, unknown>,
  basePath: (string | number)[],
  globalConditions: Record<string, unknown>,
  referencedConditions: Set<string>,
  entries: ReturnType<typeof error>[],
): void {
  if (!Array.isArray(obj.conditions)) return;
  for (let c = 0; c < obj.conditions.length; c++) {
    const ref = obj.conditions[c] as string;
    referencedConditions.add(ref);
    if (!(ref in globalConditions)) {
      entries.push(error([...basePath, 'conditions', c], 'condition-ref-missing', `Condition "${ref}" is not defined in config.conditions`));
    }
  }
}
