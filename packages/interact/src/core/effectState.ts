import type { InteractStateChangeDetail, ScopedStateMutation, StateAction } from '../types';

export const nativeEffectState = Symbol('Interact native effect state');

type NativeEffectState = {
  states: Set<string>;
  legacySyntax: boolean;
};

type StateOwner = {
  element: HTMLElement;
  key?: string;
  nativeState?: NativeEffectState;
};

type WriteOperation = Exclude<StateAction, 'clear'>;
type MembershipMutation =
  | { operation: 'clearAll' }
  | { operation: WriteOperation; stateIds: Iterable<string> };

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

function isWriteOperation(operation: unknown): operation is WriteOperation {
  return operation === 'add' || operation === 'remove' || operation === 'toggle';
}

function isScopedStateId(stateId: unknown): stateId is string {
  return typeof stateId === 'string' && stateId.length > 0 && !/[ \t\n\f\r]/.test(stateId);
}

export function applyScopedEffectState(
  element: HTMLElement & { [nativeEffectState]?: NativeEffectState },
  key: string | undefined,
  mutation: ScopedStateMutation,
): void {
  const owner = { element, key, nativeState: element[nativeEffectState] };
  const operation = mutation?.operation;

  switch (operation) {
    case 'clear': {
      const ids = mutation.stateIds;
      if (!Array.isArray(ids)) break;
      const stateIds = Array.from(ids);
      if (!stateIds.every(isScopedStateId)) break;
      mutateEffectState(owner, { operation: 'remove', stateIds });
      return;
    }
    case 'add':
    case 'remove':
    case 'toggle': {
      const { stateId } = mutation;
      if (!isScopedStateId(stateId)) break;
      mutateEffectState(owner, { operation, stateIds: [stateId] });
      return;
    }
  }

  throw new TypeError('Invalid scoped state mutation');
}

export function toggleEffectState({
  effectId,
  stateAction,
  ...owner
}: StateOwner & {
  effectId: string;
  stateAction: StateAction;
}): void {
  if (stateAction === 'clear') {
    mutateEffectState(owner, { operation: 'clearAll' });
  } else if (isWriteOperation(stateAction)) {
    const stateIds = owner.nativeState ? [effectId] : new Set(readEffectTokens(effectId));
    mutateEffectState(owner, { operation: stateAction, stateIds });
  }
}

function mutateEffectState(
  { element, key, nativeState }: StateOwner,
  mutation: MembershipMutation,
): void {
  const states = nativeState?.states ?? new Set(readEffectTokens(element.dataset.interactEffect));
  const { operation } = mutation;
  let changed = false;

  if (operation === 'clearAll') {
    changed = states.size > 0;
    if (changed) {
      states.clear();
    }
  } else {
    for (const stateId of mutation.stateIds) {
      const id = nativeState?.legacySyntax ? `--${stateId}` : stateId;
      const isActive = states.has(id);
      const shouldBeActive = operation === 'toggle' ? !isActive : operation === 'add';

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
