import type { IInteractionController, StateAction } from '../types';
import { InteractionController } from '../core/InteractionController';

export const INTERACT_EFFECT_DATA_ATTR = 'interactEffect';

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

      if (this.attachInternals) {
        this._internals = this.attachInternals() as ElementInternals & {
          states: Set<string>;
        };

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

      if (isLegacyStateSyntax) {
        effectId = `--${effectId}`;
      }

      if (this._internals && !item) {
        if (stateAction === 'toggle') {
          if (this._internals.states.has(effectId)) {
            this._internals.states.delete(effectId);
          } else {
            this._internals.states.add(effectId);
          }
        } else if (stateAction === 'add') {
          this._internals.states.add(effectId);
        } else if (stateAction === 'remove') {
          this._internals.states.delete(effectId);
        } else if (stateAction === 'clear') {
          this._internals.states.clear();
        }
      } else {
        this.controller?.toggleEffect(effectId, stateAction, item, true);
      }
    }

    getActiveEffects(): string[] {
      if (this._internals) {
        const effects = Array.from(this._internals.states);
        return isLegacyStateSyntax ? effects.map((effect) => effect.replace(/^--/g, '')) : effects;
      }

      return this.controller?.getActiveEffects() || [];
    }
  };
}
