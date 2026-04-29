import type { ValidationResult, ValidationEntry, Scope, TriggerType } from '../types';
import {
  TRIGGER_TYPES,
  TRIGGER_TYPE_VALUES,
  FILL_VALUES,
  CONDITION_TYPES,
  RANGE_NAMES,
  STATE_ACTIONS,
  SCRUB_TRANSITION_EASINGS,
  TRIGGERS_REQUIRING_PARAMS,
  isRecord,
  error,
  warning,
  toResult,
  isInScope,
  resolveEffect,
  resolveSequence,
} from './helpers';

/**
 * Validate config schema shape against the InteractConfig type definitions.
 *
 * This validator checks **structural correctness**: types, required fields,
 * enum values, and mutual exclusivity. It does NOT check cross-references
 * (effectId/sequenceId/conditions existence) or trigger-effect compatibility —
 * those are handled by referenceValidator and compatibilityValidator.
 */
export function validateSchema(config: unknown, scope?: Scope): ValidationResult {
  const entries: ValidationEntry[] = [];

  if (!isRecord(config)) {
    entries.push(error(['config'], 'config-type', 'Config must be an object'));
    return toResult(entries);
  }

  // -- effects: must be a plain-object record --
  const effectsValid = isRecord(config.effects);
  if (!effectsValid) {
    const rule = Array.isArray(config.effects) ? 'effects-not-array' : 'effects-type';
    entries.push(
      error(['effects'], rule, 'effects must be a Record<string, Effect> (object, not array)'),
    );
  } else {
    for (const [id, effect] of Object.entries(config.effects as Record<string, unknown>)) {
      if (!isRecord(effect)) {
        entries.push(error(['effects', id], 'effect-type', `Effect "${id}" must be an object`));
      }
    }
  }

  const globalEffects = effectsValid
    ? (config.effects as Record<string, Record<string, unknown>>)
    : {};

  // -- conditions (optional): validate definition shapes --
  if (config.conditions !== undefined) {
    if (!isRecord(config.conditions)) {
      entries.push(
        error(['conditions'], 'conditions-type', 'conditions must be a Record<string, Condition>'),
      );
    } else {
      validateConditionDefinitions(config.conditions as Record<string, unknown>, entries);
    }
  }

  // -- sequences (optional): basic structural check --
  let globalSequences: Record<string, Record<string, unknown>> = {};
  if (config.sequences !== undefined) {
    if (!isRecord(config.sequences)) {
      entries.push(
        error(
          ['sequences'],
          'sequences-type',
          'sequences must be a Record<string, SequenceConfig>',
        ),
      );
    } else {
      globalSequences = config.sequences as Record<string, Record<string, unknown>>;
      for (const [id, seq] of Object.entries(globalSequences)) {
        if (!isRecord(seq)) {
          entries.push(
            error(['sequences', id], 'sequence-type', `Sequence "${id}" must be an object`),
          );
        }
      }
    }
  }

  // -- interactions: must be a non-empty array --
  if (!Array.isArray(config.interactions)) {
    entries.push(
      error(['interactions'], 'interactions-type', 'interactions must be a non-empty array'),
    );
  } else if (config.interactions.length === 0) {
    entries.push(
      error(['interactions'], 'interactions-empty', 'interactions array must not be empty'),
    );
  } else {
    for (let i = 0; i < config.interactions.length; i++) {
      const interaction = config.interactions[i] as unknown;
      if (!isRecord(interaction)) {
        entries.push(
          error(
            ['interactions', i],
            'interaction-type',
            `Interaction at index ${i} must be an object`,
          ),
        );
        continue;
      }
      if (!isInScope(interaction as { key: string; trigger: string }, i, scope)) continue;
      validateInteraction(interaction, i, globalEffects, globalSequences, entries);
    }
  }

  return toResult(entries);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function validateInteraction(
  interaction: Record<string, unknown>,
  index: number,
  globalEffects: Record<string, Record<string, unknown>>,
  globalSequences: Record<string, Record<string, unknown>>,
  entries: ValidationEntry[],
): void {
  const basePath: (string | number)[] = ['interactions', index];
  const trigger = interaction.trigger as TriggerType;
  const validTrigger = TRIGGER_TYPES.includes(trigger);

  if (typeof interaction.key !== 'string' || interaction.key.length === 0) {
    entries.push(
      error(
        [...basePath, 'key'],
        'interaction-key',
        'Interaction must have a non-empty string "key"',
      ),
    );
  }

  if (!validTrigger) {
    entries.push(
      error(
        [...basePath, 'trigger'],
        'interaction-trigger',
        `Interaction trigger must be one of: ${TRIGGER_TYPES.join(', ')}. Got: "${String(interaction.trigger)}"`,
      ),
    );
  }

  if (interaction.params !== undefined) {
    validateParams(interaction.params, trigger, basePath, entries);
  } else if (validTrigger && TRIGGERS_REQUIRING_PARAMS.has(trigger)) {
    entries.push(
      error([...basePath, 'params'], 'params-required', `Trigger "${trigger}" requires params`),
    );
  }

  // Conditions shape check (array of strings) — existence is checked by referenceValidator
  if (interaction.conditions !== undefined) {
    validateConditionsShape(interaction.conditions, [...basePath, 'conditions'], entries);
  }

  const hasEffects = interaction.effects !== undefined;
  const hasSequences = interaction.sequences !== undefined;

  if (!hasEffects && !hasSequences) {
    entries.push(
      warning(basePath, 'interaction-no-effects', 'Interaction has neither effects nor sequences'),
    );
  }

  if (hasEffects) {
    if (!Array.isArray(interaction.effects)) {
      entries.push(
        error(
          [...basePath, 'effects'],
          'interaction-effects-type',
          'Interaction effects must be an array',
        ),
      );
    } else {
      for (let j = 0; j < interaction.effects.length; j++) {
        const raw = interaction.effects[j] as unknown;
        if (!isRecord(raw)) {
          entries.push(
            error(
              [...basePath, 'effects', j],
              'effect-type',
              `Effect at index ${j} must be an object`,
            ),
          );
          continue;
        }
        const resolved = resolveEffect(raw, globalEffects);
        validateEffectShape(resolved, [...basePath, 'effects', j], entries);
      }
    }
  }

  if (hasSequences) {
    if (!Array.isArray(interaction.sequences)) {
      entries.push(
        error(
          [...basePath, 'sequences'],
          'interaction-sequences-type',
          'Interaction sequences must be an array',
        ),
      );
    } else {
      for (let j = 0; j < interaction.sequences.length; j++) {
        const raw = interaction.sequences[j] as unknown;
        if (!isRecord(raw)) {
          entries.push(
            error(
              [...basePath, 'sequences', j],
              'sequence-type',
              `Sequence at index ${j} must be an object`,
            ),
          );
          continue;
        }
        validateSequenceShape(
          raw,
          [...basePath, 'sequences', j],
          globalEffects,
          globalSequences,
          entries,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Effect shape validation (no compat, no ref checks)
// ---------------------------------------------------------------------------

function validateEffectShape(
  eff: Record<string, unknown>,
  path: (string | number)[],
  entries: ValidationEntry[],
): void {
  const hasKeyframe = 'keyframeEffect' in eff;
  const hasNamed = 'namedEffect' in eff;
  const hasCustom = 'customEffect' in eff;
  const hasTransition = 'transition' in eff;
  const hasTransitionProps = 'transitionProperties' in eff;

  const animationPropertyCount = (hasKeyframe ? 1 : 0) + (hasNamed ? 1 : 0) + (hasCustom ? 1 : 0);
  const isAnimationEffect = animationPropertyCount > 0;
  const isStateEffect = hasTransition || hasTransitionProps;

  if (animationPropertyCount > 1) {
    entries.push(
      error(
        path,
        'effect-property-exclusive',
        'Effect must have only one of: keyframeEffect, namedEffect, customEffect',
      ),
    );
  }

  if (isAnimationEffect && isStateEffect) {
    entries.push(
      error(
        path,
        'effect-mixed-types',
        'Effect cannot mix keyframeEffect/namedEffect/customEffect with transition/transitionProperties',
      ),
    );
  }

  if (hasTransition && hasTransitionProps) {
    entries.push(
      error(
        path,
        'state-exclusive',
        'Effect cannot have both transition and transitionProperties; use one or the other',
      ),
    );
  }

  if (!isAnimationEffect && !isStateEffect) {
    entries.push(
      error(
        path,
        'effect-property',
        'Resolved effect must have exactly one of: keyframeEffect, namedEffect, customEffect (for time/scrub) or transition/transitionProperties (for state)',
      ),
    );
    return;
  }

  if (hasKeyframe) validateKeyframeEffect(eff.keyframeEffect, path, entries);
  if (hasNamed) validateNamedEffect(eff.namedEffect, path, entries);

  // Validate enum fields regardless of trigger context
  if ('duration' in eff && (typeof eff.duration !== 'number' || (eff.duration as number) <= 0)) {
    entries.push(
      error([...path, 'duration'], 'duration-positive', 'duration must be a positive number'),
    );
  }

  if ('triggerType' in eff) {
    if (!TRIGGER_TYPE_VALUES.includes(eff.triggerType as (typeof TRIGGER_TYPE_VALUES)[number])) {
      entries.push(
        error(
          [...path, 'triggerType'],
          'trigger-type-value',
          `triggerType must be one of: ${TRIGGER_TYPE_VALUES.join(', ')}. Got: "${String(eff.triggerType)}"`,
        ),
      );
    }
  }

  if ('fill' in eff) {
    if (!FILL_VALUES.includes(eff.fill as (typeof FILL_VALUES)[number])) {
      entries.push(
        error(
          [...path, 'fill'],
          'fill-value',
          `fill must be one of: ${FILL_VALUES.join(', ')}. Got: "${String(eff.fill)}"`,
        ),
      );
    }
  }

  if ('stateAction' in eff) {
    if (!STATE_ACTIONS.includes(eff.stateAction as (typeof STATE_ACTIONS)[number])) {
      entries.push(
        error(
          [...path, 'stateAction'],
          'state-action-value',
          `stateAction must be one of: ${STATE_ACTIONS.join(', ')}. Got: "${String(eff.stateAction)}"`,
        ),
      );
    }
  }

  if ('transitionEasing' in eff) {
    if (
      !SCRUB_TRANSITION_EASINGS.includes(
        eff.transitionEasing as (typeof SCRUB_TRANSITION_EASINGS)[number],
      )
    ) {
      entries.push(
        error(
          [...path, 'transitionEasing'],
          'scrub-transition-easing',
          `transitionEasing must be one of: ${SCRUB_TRANSITION_EASINGS.join(', ')}. Got: "${String(eff.transitionEasing)}"`,
        ),
      );
    }
  }

  // Range offset structure
  validateRangeOffset(eff, 'rangeStart', path, entries);
  validateRangeOffset(eff, 'rangeEnd', path, entries);

  // Effect-level conditions shape
  if (eff.conditions !== undefined) {
    validateConditionsShape(eff.conditions, [...path, 'conditions'], entries);
  }
}

// ---------------------------------------------------------------------------
// Sub-property validators
// ---------------------------------------------------------------------------

function validateKeyframeEffect(
  kf: unknown,
  path: (string | number)[],
  entries: ValidationEntry[],
): void {
  if (!isRecord(kf)) {
    entries.push(
      error([...path, 'keyframeEffect'], 'keyframe-type', 'keyframeEffect must be an object'),
    );
    return;
  }
  if (typeof kf.name !== 'string') {
    entries.push(
      error(
        [...path, 'keyframeEffect', 'name'],
        'keyframe-name',
        'keyframeEffect.name must be a string',
      ),
    );
  } else if (kf.name.length === 0) {
    entries.push(
      error(
        [...path, 'keyframeEffect', 'name'],
        'keyframe-name-empty',
        'keyframeEffect.name must not be empty',
      ),
    );
  }
  if (!Array.isArray(kf.keyframes) || kf.keyframes.length === 0) {
    entries.push(
      error(
        [...path, 'keyframeEffect', 'keyframes'],
        'keyframe-keyframes',
        'keyframeEffect.keyframes must be a non-empty array',
      ),
    );
  }
}

function validateNamedEffect(
  ne: unknown,
  path: (string | number)[],
  entries: ValidationEntry[],
): void {
  if (!isRecord(ne)) {
    entries.push(error([...path, 'namedEffect'], 'named-type', 'namedEffect must be an object'));
    return;
  }
  if (typeof ne.type !== 'string') {
    entries.push(
      error(
        [...path, 'namedEffect', 'type'],
        'named-effect-type',
        'namedEffect.type must be a string',
      ),
    );
  }
}

function validateRangeOffset(
  eff: Record<string, unknown>,
  field: 'rangeStart' | 'rangeEnd',
  path: (string | number)[],
  entries: ValidationEntry[],
): void {
  if (!(field in eff)) return;
  const range = eff[field];
  if (!isRecord(range)) {
    entries.push(error([...path, field], 'range-type', `${field} must be an object`));
    return;
  }
  if ('name' in range) {
    if (!RANGE_NAMES.includes(range.name as (typeof RANGE_NAMES)[number])) {
      entries.push(
        error(
          [...path, field, 'name'],
          'range-name-value',
          `${field}.name must be one of: ${RANGE_NAMES.join(', ')}. Got: "${String(range.name)}"`,
        ),
      );
    }
  }
  if ('offset' in range) {
    if (!isRecord(range.offset)) {
      entries.push(
        error(
          [...path, field, 'offset'],
          'range-offset-type',
          `${field}.offset must be an object with { value, unit }`,
        ),
      );
    } else {
      if (typeof range.offset.value !== 'number') {
        entries.push(
          error(
            [...path, field, 'offset', 'value'],
            'range-offset-value',
            `${field}.offset.value must be a number`,
          ),
        );
      }
      if (typeof range.offset.unit !== 'string') {
        entries.push(
          error(
            [...path, field, 'offset', 'unit'],
            'range-offset-unit',
            `${field}.offset.unit must be a string (e.g. 'percentage', 'px')`,
          ),
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Params
// ---------------------------------------------------------------------------

function validateParams(
  params: unknown,
  trigger: TriggerType,
  basePath: (string | number)[],
  entries: ValidationEntry[],
): void {
  if (!isRecord(params)) {
    entries.push(error([...basePath, 'params'], 'params-type', 'params must be an object'));
    return;
  }
  if (trigger === 'viewEnter' || trigger === 'pageVisible') {
    if ('threshold' in params && typeof params.threshold !== 'number') {
      entries.push(
        error(
          [...basePath, 'params', 'threshold'],
          'param-threshold',
          'threshold must be a number',
        ),
      );
    }
    if ('inset' in params && typeof params.inset !== 'string') {
      entries.push(
        error([...basePath, 'params', 'inset'], 'param-inset', 'inset must be a string'),
      );
    }
  }
  if (trigger === 'pointerMove') {
    if ('hitArea' in params && params.hitArea !== 'root' && params.hitArea !== 'self') {
      entries.push(
        error(
          [...basePath, 'params', 'hitArea'],
          'param-hit-area',
          'hitArea must be "root" or "self"',
        ),
      );
    }
    if ('axis' in params && params.axis !== 'x' && params.axis !== 'y') {
      entries.push(error([...basePath, 'params', 'axis'], 'param-axis', 'axis must be "x" or "y"'));
    }
  }
  if (trigger === 'animationEnd') {
    if (typeof params.effectId !== 'string' || params.effectId.length === 0) {
      entries.push(
        error(
          [...basePath, 'params', 'effectId'],
          'param-effect-id-required',
          'animationEnd trigger requires params.effectId (non-empty string)',
        ),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Conditions shape (not ref checking — that's referenceValidator)
// ---------------------------------------------------------------------------

function validateConditionsShape(
  conditions: unknown,
  path: (string | number)[],
  entries: ValidationEntry[],
): void {
  if (!Array.isArray(conditions)) {
    entries.push(error(path, 'conditions-array', 'conditions must be an array of strings'));
    return;
  }
  for (let i = 0; i < conditions.length; i++) {
    if (typeof conditions[i] !== 'string') {
      entries.push(
        error([...path, i], 'condition-ref-type', 'Condition reference must be a string'),
      );
    }
  }
}

function validateConditionDefinitions(
  conditions: Record<string, unknown>,
  entries: ValidationEntry[],
): void {
  for (const [id, cond] of Object.entries(conditions)) {
    if (!isRecord(cond)) {
      entries.push(
        error(['conditions', id], 'condition-type', `Condition "${id}" must be an object`),
      );
      continue;
    }
    if (!CONDITION_TYPES.includes(cond.type as (typeof CONDITION_TYPES)[number])) {
      entries.push(
        error(
          ['conditions', id, 'type'],
          'condition-type-value',
          `Condition type must be one of: ${CONDITION_TYPES.join(', ')}. Got: "${String(cond.type)}"`,
        ),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Sequences shape
// ---------------------------------------------------------------------------

function validateSequenceShape(
  raw: Record<string, unknown>,
  path: (string | number)[],
  globalEffects: Record<string, Record<string, unknown>>,
  globalSequences: Record<string, Record<string, unknown>>,
  entries: ValidationEntry[],
): void {
  const resolved = resolveSequence(raw, globalSequences);

  if ('delay' in resolved && typeof resolved.delay !== 'number') {
    entries.push(error([...path, 'delay'], 'sequence-delay', 'Sequence delay must be a number'));
  }
  if ('offset' in resolved && typeof resolved.offset !== 'number') {
    entries.push(error([...path, 'offset'], 'sequence-offset', 'Sequence offset must be a number'));
  }
  if ('triggerType' in resolved) {
    if (
      !TRIGGER_TYPE_VALUES.includes(resolved.triggerType as (typeof TRIGGER_TYPE_VALUES)[number])
    ) {
      entries.push(
        error(
          [...path, 'triggerType'],
          'trigger-type-value',
          `triggerType must be one of: ${TRIGGER_TYPE_VALUES.join(', ')}. Got: "${String(resolved.triggerType)}"`,
        ),
      );
    }
  }

  if (resolved.conditions !== undefined) {
    validateConditionsShape(resolved.conditions, [...path, 'conditions'], entries);
  }

  if (!Array.isArray(resolved.effects)) {
    if (typeof raw.sequenceId !== 'string') {
      entries.push(
        error([...path, 'effects'], 'sequence-effects-type', 'Sequence must have an effects array'),
      );
    }
    return;
  }

  for (let k = 0; k < resolved.effects.length; k++) {
    const rawEff = resolved.effects[k] as unknown;
    if (!isRecord(rawEff)) {
      entries.push(
        error(
          [...path, 'effects', k],
          'effect-type',
          `Sequence effect at index ${k} must be an object`,
        ),
      );
      continue;
    }
    const resolvedEff = resolveEffect(rawEff, globalEffects);
    validateEffectShape(resolvedEff, [...path, 'effects', k], entries);
  }
}
