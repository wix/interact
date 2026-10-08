import type { Path, SemanticIssue, AnyEffect } from '../types';

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
