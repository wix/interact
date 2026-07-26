import type { Interaction, ElementIdentifier, TimeAnimationTriggerType } from '../types';

export function _processKeysForInterpolation(key: string) {
  return [...key.matchAll(/\[([-\w]+)]/g)].map(([_, _instanceKey]) => _instanceKey);
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

export function getUniqueEncodedHash(hash: string): string {
  let h1 = 0;
  let h2 = 0;
  for (let i = 0; i < hash.length; i++) {
    const ch = hash.charCodeAt(i);
    h1 = ((h1 << 5) - h1 + ch) | 0;
    h2 = ((h2 << 3) ^ (h2 >>> 2) ^ ch) | 0;
  }
  return ((h1 >>> 0) * 0x100000 + ((h2 >>> 0) % 0x100000)).toString(36);
}

/**
 * Name of the CSS custom property that carries a sequence effect's per-element stagger factor.
 *
 * This is the single source of truth shared by the build-time CSS generator (which embeds
 * `var(<name>)` inside an `animation-delay: calc(...)`) and the run-time (which writes the
 * per-element factor via `element.style.setProperty`). The two MUST agree byte-for-byte, so the
 * name is derived only from identifiers computed identically on both sides: the `sequenceId` and
 * the effect's original index within the sequence's `effects` array. Notably it does NOT use the
 * interaction index, which is positional in the CSS pass but a module-global counter at run-time.
 */
export function staggerPropName(sequenceId: string, effectIndex: number): string {
  return `--wi-stg-${getUniqueEncodedHash(`${sequenceId}\0${effectIndex}`)}`;
}
