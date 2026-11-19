import type { InteractStateChangeDetail, StateAction } from '../types';

type NativeEffectState = {
  states: Set<string>;
  legacySyntax: boolean;
};

function readEffectTokens(value: string | undefined): string[] {
  return value?.match(/[^ \t\n\f\r]+/g) ?? [];
}

export function getActiveEffectIds(
  element: HTMLElement,
  nativeState?: NativeEffectState,
): string[] {
  if (nativeState) {
    return Array.from(nativeState.states, (id) =>
      nativeState.legacySyntax ? id.replace(/^--/, '') : id,
    );
  }

  return readEffectTokens(element.dataset.interactEffect);
}

export function mutateEffectState({
  element,
  key,
  effectId,
  stateAction,
  nativeState,
}: {
  element: HTMLElement;
  key?: string;
  effectId: string;
  stateAction: StateAction;
  nativeState?: NativeEffectState;
}): void {
  const states = nativeState?.states ?? new Set(readEffectTokens(element.dataset.interactEffect));
  let changed = false;

  if (stateAction === 'clear') {
    changed = states.size > 0;
    if (changed) {
      states.clear();
    }
  } else if (stateAction === 'add' || stateAction === 'remove' || stateAction === 'toggle') {
    const ids = nativeState
      ? [nativeState.legacySyntax ? `--${effectId}` : effectId]
      : new Set(readEffectTokens(effectId));

    for (const id of ids) {
      const isActive = states.has(id);
      const shouldBeActive = stateAction === 'toggle' ? !isActive : stateAction === 'add';

      if (isActive !== shouldBeActive) {
        changed = true;
        if (shouldBeActive) {
          states.add(id);
        } else {
          states.delete(id);
        }
      }
    }
  }

  if (!changed) {
    return;
  }

  const activeEffectIds = nativeState
    ? getActiveEffectIds(element, nativeState)
    : Array.from(states);
  if (!nativeState) {
    element.dataset.interactEffect = activeEffectIds.join(' ');
  }

  const ownerKey = element.dataset.interactKey || key;
  const detail: InteractStateChangeDetail = ownerKey
    ? { key: ownerKey, activeEffectIds }
    : { activeEffectIds };

  element.dispatchEvent(
    new CustomEvent<InteractStateChangeDetail>('interact-state-change', {
      bubbles: true,
      composed: true,
      detail,
    }),
  );
}
