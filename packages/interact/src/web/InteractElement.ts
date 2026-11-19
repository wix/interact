import type { IInteractionController, StateAction } from '../types';
import { InteractionController } from '../core/InteractionController';
import { getActiveEffectIds, mutateEffectState } from '../core/effectState';

export function getInteractElement() {
  let checkedForLegacyStateSyntax = false;
  let isLegacyStateSyntax = false;

  return class InteractElement extends HTMLElement {
    _internals: (ElementInternals & { states: Set<string> }) | null;
    controller: IInteractionController;

    constructor() {
      super();

      this.controller = new InteractionController(this, undefined, { useFirstChild: true });
      this._internals = null;

      const internals = this.attachInternals?.();

      // Safari before 17.4 exposes ElementInternals without CustomStateSet.
      if (internals?.states) {
        this._internals = internals;

        if (!checkedForLegacyStateSyntax) {
          checkedForLegacyStateSyntax = true;

          try {
            this._internals.states.add('test');
            this._internals.states.delete('test');
          } catch (e) {
            isLegacyStateSyntax = true;
          }
        }
      }
    }
    connectedCallback() {
      this.connect();
    }

    disconnectedCallback() {
      this.disconnect({ removeFromCache: true });
    }

    connect(key?: string) {
      if (this.controller.connected) {
        return;
      }

      this.controller.connect(key);
    }

    disconnect(options?: { removeFromCache?: boolean }) {
      this.controller.disconnect(options);
    }

    toggleEffect(effectId: string, stateAction: StateAction, item?: HTMLElement | null) {
      if (item === null) {
        return;
      }

      mutateEffectState({
        element: item ?? this,
        key: this.controller.key,
        effectId,
        stateAction,
        nativeState:
          this._internals && !item
            ? { states: this._internals.states, legacySyntax: isLegacyStateSyntax }
            : undefined,
      });
    }

    getActiveEffects(): string[] {
      return getActiveEffectIds(
        this,
        this._internals
          ? { states: this._internals.states, legacySyntax: isLegacyStateSyntax }
          : undefined,
      );
    }
  };
}
