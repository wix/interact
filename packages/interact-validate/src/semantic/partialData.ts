import type { Path, SemanticIssue, AnyEffect, AnyInteraction } from '../types';

const SCROLL_RANGE_VALUES = ['in', 'out', 'continuous'];

// Scroll presets (the `*Scroll` motion-presets) all end with `Scroll`; no other
// preset category does. Used to flag a missing/invalid `range` on `viewProgress`.
function isScrollPresetType(type: unknown): boolean {
  return typeof type === 'string' && /Scroll$/.test(type);
}

// `*Scroll` namedEffect on viewProgress without a valid `range`
export function checkScrollPresetRange(
  path: Path,
  effect: AnyEffect,
  owner?: AnyInteraction,
): SemanticIssue[] {
  if (!owner || owner.trigger !== 'viewProgress') return [];
  const named = effect.namedEffect;
  if (!named || !isScrollPresetType(named.type)) return [];
  if (named.range === undefined) {
    return [
      {
        code: 'custom',
        params: { domainCode: 'SCROLL_PRESET_MISSING_RANGE' },
        path: [...path, 'namedEffect', 'range'],
        message: `Scroll preset '${named.type}' on viewProgress requires \`range: 'in' | 'out' | 'continuous'\` (prefer 'continuous').`,
      },
    ];
  } else if (typeof named.range !== 'string' || !SCROLL_RANGE_VALUES.includes(named.range)) {
    return [
      {
        code: 'custom',
        params: { domainCode: 'SCROLL_PRESET_BAD_RANGE' },
        path: [...path, 'namedEffect', 'range'],
        message: `Scroll preset \`range\` must be 'in', 'out', or 'continuous' (prefer 'continuous'); got ${JSON.stringify(named.range)}.`,
      },
    ];
  }
  return [];
}

// state effect that toggles nothing (empty style arrays)
export function checkEmptyStyleProperties(path: Path, effect: AnyEffect): SemanticIssue[] {
  const result: SemanticIssue[] = [];
  if (
    Array.isArray(effect.transition?.styleProperties) &&
    effect.transition.styleProperties.length === 0
  ) {
    result.push({
      code: 'custom',
      params: { domainCode: 'EMPTY_STYLE_PROPERTIES' },
      path: [...path, 'transition', 'styleProperties'],
      message: '`transition.styleProperties` is empty; this state effect toggles nothing.',
    });
  }
  if (Array.isArray(effect.transitionProperties) && effect.transitionProperties.length === 0) {
    result.push({
      code: 'custom',
      params: { domainCode: 'EMPTY_STYLE_PROPERTIES' },
      path: [...path, 'transitionProperties'],
      message: '`transitionProperties` is empty; this state effect toggles nothing.',
    });
  }
  return result;
}

// stateAction 'remove' with no effectId to pair with
export function checkStateRemoveWithoutEffectId(path: Path, effect: AnyEffect): SemanticIssue[] {
  if (effect.stateAction === 'remove' && effect.effectId === undefined) {
    return [
      {
        code: 'custom',
        params: { domainCode: 'STATE_REMOVE_WITHOUT_EFFECT_ID' },
        path: [...path, 'stateAction'],
        message:
          "stateAction 'remove' has no `effectId` to pair with a matching 'add'; the removal has nothing to target.",
      },
    ];
  }
  return [];
}
