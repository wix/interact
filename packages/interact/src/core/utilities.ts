import type {
  Effect,
  EffectRef,
  ElementIdentifier,
  InteractConfig,
  Interaction,
  StateEffect,
  TimeAnimationTriggerType,
} from '../types';

export function _processKeysForInterpolation(key: string) {
  return [...key.matchAll(/\[([^\]]+)]/g)].map(([_, _instanceKey]) => _instanceKey);
}

// TODO: currently only supports simple one-to-one mapping, e.g. item[0] -> item[0], item[1] -> item[1]
export function getInterpolatedKey(template: string, key: string) {
  const keys = _processKeysForInterpolation(key);
  let index = 0;
  return keys.length
    ? template.replace(/\[]/g, () => {
        const k = keys[index++];
        return k !== undefined ? `[${k}]` : '[]';
      })
    : template;
}

export function shouldUseInitial(
  interaction: Interaction,
  effect: ElementIdentifier & { triggerType: TimeAnimationTriggerType },
) {
  return (
    interaction.trigger === 'viewEnter' &&
    effect.triggerType === 'once' &&
    getElementHash(interaction) === getElementHash(effect)
  );
}

export function getElementHash(elementIdentifier: ElementIdentifier): string {
  const { key, listContainer, listItemSelector, selector } = elementIdentifier;
  return `${key}\0${listContainer || ''}\0${listItemSelector || ''}\0${selector || ''}`;
}

/**
 * The state effects of `config.effects` that no interaction or sequence references: states that
 * code toggles (`toggleEffect`), which still need their look. Each is named by its `effectId`, else
 * its entry's id.
 */
export function getCodeStates(
  config: InteractConfig,
): (Effect & { key: string; effectId: string })[] {
  const { effects = {}, interactions = [], sequences = {} } = config;
  const referenced = new Set<string>();
  const addReferences = (list: (Effect | EffectRef)[] = []) =>
    list.forEach(({ effectId }) => effectId && referenced.add(effectId));

  Object.values(sequences).forEach((sequence) => addReferences(sequence.effects));
  interactions.forEach((interaction) => {
    addReferences(interaction.effects);
    interaction.sequences?.forEach((sequence) => {
      if ('effects' in sequence) {
        addReferences(sequence.effects);
      }
    });
  });

  return Object.entries(effects).flatMap(([id, effect]) => {
    const { transition, transitionProperties } = effect as StateEffect;
    return !referenced.has(id) && effect.key && (transition || transitionProperties)
      ? [{ ...effect, key: effect.key, effectId: effect.effectId || id }]
      : [];
  });
}
