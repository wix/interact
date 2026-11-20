import type { Interaction, ElementIdentifier, TimeAnimationTriggerType } from '../types';

export function getKeyTemplate(key: string): string {
  return key.replace(/\[[^\]]+]/g, '[]');
}

export function getRepeaterItems(key: string): Map<string, string> {
  const items = new Map<string, string>();
  let prefix = '';
  let offset = 0;

  for (const match of key.matchAll(/\[([^\]]+)]/g)) {
    prefix += key.slice(offset, match.index);
    items.set(prefix, match[1]);
    prefix += '[]';
    offset = match.index + match[0].length;
  }

  return items;
}

export function matchesRepeaterItems(
  sourceItems: ReadonlyMap<string, string>,
  targetItems: ReadonlyMap<string, string>,
): boolean {
  for (const [owner, itemId] of sourceItems) {
    const targetItemId = targetItems.get(owner);
    if (targetItemId !== undefined && targetItemId !== itemId) {
      return false;
    }
  }
  return true;
}

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
