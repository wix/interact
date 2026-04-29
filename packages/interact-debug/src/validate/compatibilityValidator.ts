import type {
  InteractConfig,
  ValidationResult,
  ValidationEntry,
  Scope,
  TriggerType,
} from '../types';
import {
  TIME_TRIGGERS,
  SCRUB_TRIGGERS,
  STATE_TRIGGERS,
  isRecord,
  error,
  warning,
  toResult,
  isInScope,
  resolveEffect,
  resolveSequence,
  buildGlobalMaps,
} from './helpers';

// ---------------------------------------------------------------------------
// Effect classification
// ---------------------------------------------------------------------------

type EffectKind = 'time' | 'scrub' | 'state' | 'unknown';

function classifyEffect(eff: Record<string, unknown>): EffectKind {
  const hasAnimation = 'keyframeEffect' in eff || 'namedEffect' in eff || 'customEffect' in eff;
  const hasState = 'transition' in eff || 'transitionProperties' in eff;

  if (hasAnimation && 'duration' in eff && !('rangeStart' in eff) && !('rangeEnd' in eff))
    return 'time';
  if (hasAnimation && ('rangeStart' in eff || 'rangeEnd' in eff)) return 'scrub';
  if (hasState && !hasAnimation) return 'state';
  if (hasAnimation) return 'time';
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validate semantic compatibility between triggers and effects:
 * - Time effects only on time triggers, scrub on scrub, state on state
 * - Property affinity warnings (transitionEasing on non-scrub, stateAction on non-state, etc.)
 * - Duration on scrub warning, duration required for time
 * - triggerType + stateAction exclusivity
 * - triggerType:'state' mismatch with non-state effect
 * - triggerType on sequence effects warning
 * - animationEnd params.effectId should reference time effect
 * - viewProgress rangeStart/rangeEnd warnings
 * - namedEffect scroll preset + viewProgress range warning
 */
export function validateCompatibility(config: InteractConfig, scope?: Scope): ValidationResult {
  const entries: ValidationEntry[] = [];
  const { globalEffects, globalSequences } = buildGlobalMaps(config);

  for (let i = 0; i < config.interactions.length; i++) {
    const interaction = config.interactions[i];
    if (!isInScope(interaction, i, scope)) continue;
    const basePath = ['interactions', i] as (string | number)[];
    const trigger = interaction.trigger as TriggerType;

    if (interaction.effects) {
      for (let j = 0; j < interaction.effects.length; j++) {
        const raw = interaction.effects[j] as Record<string, unknown>;
        if (!isRecord(raw)) continue;
        const resolved = resolveEffect(raw, globalEffects);
        validateEffectCompat(resolved, [...basePath, 'effects', j], trigger, entries);
      }
    }

    if (interaction.sequences) {
      for (let j = 0; j < interaction.sequences.length; j++) {
        const raw = interaction.sequences[j] as Record<string, unknown>;
        if (!isRecord(raw)) continue;
        const seqPath = [...basePath, 'sequences', j];
        const resolved = resolveSequence(raw, globalSequences);
        const seqEffects = Array.isArray(resolved.effects) ? resolved.effects : [];

        for (let k = 0; k < seqEffects.length; k++) {
          const effRaw = seqEffects[k] as Record<string, unknown>;
          if (!isRecord(effRaw)) continue;
          const effResolved = resolveEffect(effRaw, globalEffects);

          if ('triggerType' in effResolved) {
            entries.push(
              warning(
                [...seqPath, 'effects', k, 'triggerType'],
                'sequence-effect-triggerType',
                'triggerType should be on the sequence, not on individual effects inside a sequence',
              ),
            );
          }

          validateEffectCompat(effResolved, [...seqPath, 'effects', k], trigger, entries);
        }
      }
    }

    // animationEnd: params.effectId should reference a time-based effect
    if (trigger === 'animationEnd' && isRecord(interaction.params)) {
      const params = interaction.params as Record<string, unknown>;
      if (typeof params.effectId === 'string' && params.effectId in globalEffects) {
        const referenced = globalEffects[params.effectId];
        const kind = classifyEffect(referenced);
        if (kind !== 'time' && kind !== 'unknown') {
          entries.push(
            warning(
              [...basePath, 'params', 'effectId'],
              'animationEnd-non-time-effect',
              `animationEnd params.effectId "${params.effectId}" references a ${kind} effect; it should reference a time-based effect`,
            ),
          );
        }
      }
    }
  }

  return toResult(entries);
}

// ---------------------------------------------------------------------------
// Per-effect compatibility
// ---------------------------------------------------------------------------

function validateEffectCompat(
  eff: Record<string, unknown>,
  path: (string | number)[],
  trigger: TriggerType,
  entries: ValidationEntry[],
): void {
  const kind = classifyEffect(eff);
  const isAnimationEffect = kind === 'time' || kind === 'scrub';
  const isStateEffect = kind === 'state';
  const isScrub = kind === 'scrub';
  const isTime = kind === 'time';

  // -- Trigger-effect type mismatch --
  if (kind !== 'unknown') {
    if (isTime && !TIME_TRIGGERS.has(trigger)) {
      entries.push(
        error(
          path,
          'time-on-non-time-trigger',
          `Time effect (has duration) is not supported on "${trigger}" trigger`,
        ),
      );
    }
    if (isScrub && !SCRUB_TRIGGERS.has(trigger)) {
      entries.push(
        error(
          path,
          'scrub-on-non-scrub-trigger',
          `Scrub effect (has rangeStart/rangeEnd) is not supported on "${trigger}" trigger`,
        ),
      );
    }
    if (isStateEffect && !STATE_TRIGGERS.has(trigger)) {
      entries.push(
        error(
          path,
          'state-on-non-state-trigger',
          `State effect (transition/transitionProperties) is not supported on "${trigger}" trigger`,
        ),
      );
    }
  }

  // -- triggerType:'state' should pair with a state effect --
  if (eff.triggerType === 'state' && !isStateEffect) {
    entries.push(
      warning(
        path,
        'triggerType-state-mismatch',
        'triggerType "state" is typically used with state effects (transition/transitionProperties)',
      ),
    );
  }

  // -- Do not mix triggerType and stateAction --
  if ('triggerType' in eff && 'stateAction' in eff) {
    entries.push(
      error(
        path,
        'triggerType-stateAction-mixed',
        'An effect cannot have both triggerType and stateAction; use one or the other',
      ),
    );
  }

  // -- Property affinity warnings --
  if ('stateAction' in eff && !isStateEffect) {
    entries.push(
      warning(
        [...path, 'stateAction'],
        'stateAction-affinity',
        'stateAction is only meaningful on state effects (transition/transitionProperties)',
      ),
    );
  }
  if ('triggerType' in eff && !isTime) {
    if (isScrub) {
      entries.push(
        warning(
          [...path, 'triggerType'],
          'triggerType-affinity',
          'triggerType is not used on scrub effects',
        ),
      );
    } else if (isStateEffect) {
      entries.push(
        warning(
          [...path, 'triggerType'],
          'triggerType-affinity',
          'triggerType is not used on state effects',
        ),
      );
    }
  }
  if ('transitionEasing' in eff && !isScrub) {
    entries.push(
      warning(
        [...path, 'transitionEasing'],
        'transitionEasing-affinity',
        'transitionEasing is only meaningful on scrub effects (viewProgress/pointerMove)',
      ),
    );
  }
  if (('rangeStart' in eff || 'rangeEnd' in eff) && !isScrub) {
    entries.push(
      warning(
        path,
        'range-on-non-scrub',
        'rangeStart/rangeEnd are only meaningful on viewProgress/pointerMove triggers',
      ),
    );
  }

  // -- Time-specific: duration required --
  if (isAnimationEffect && TIME_TRIGGERS.has(trigger) && !SCRUB_TRIGGERS.has(trigger)) {
    if (!('duration' in eff) && !('rangeStart' in eff)) {
      entries.push(
        error(
          [...path, 'duration'],
          'duration-required',
          'TimeEffect requires a duration property',
        ),
      );
    }
  }

  // -- Scrub-specific warnings --
  if (isScrub || SCRUB_TRIGGERS.has(trigger)) {
    if ('duration' in eff && isAnimationEffect) {
      entries.push(
        warning(
          [...path, 'duration'],
          'duration-on-scrub',
          'duration is not used on scrub effects; scroll/pointer progress drives the animation',
        ),
      );
    }
    if (trigger === 'viewProgress') {
      if (!('rangeStart' in eff) && isAnimationEffect) {
        entries.push(
          warning(
            [...path, 'rangeStart'],
            'range-start-missing',
            'viewProgress effects should specify rangeStart',
          ),
        );
      }
      if (!('rangeEnd' in eff) && isAnimationEffect) {
        entries.push(
          warning(
            [...path, 'rangeEnd'],
            'range-end-missing',
            'viewProgress effects should specify rangeEnd',
          ),
        );
      }
    }
  }

  // -- namedEffect scroll preset + viewProgress range --
  if ('namedEffect' in eff && isRecord(eff.namedEffect)) {
    const ne = eff.namedEffect as Record<string, unknown>;
    if (
      trigger === 'viewProgress' &&
      typeof ne.type === 'string' &&
      ne.type.endsWith('Scroll') &&
      !('range' in ne)
    ) {
      entries.push(
        warning(
          [...path, 'namedEffect', 'range'],
          'named-scroll-range',
          `Scroll preset "${ne.type}" used with viewProgress should include range: 'in' | 'out' | 'continuous'`,
        ),
      );
    }
  }
}
