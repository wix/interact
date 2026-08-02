import type { StateAction } from './effects';
import type { InteractPluginCleanup } from './plugins';

export interface IInteractionController {
  element: HTMLElement;
  key: string | undefined;
  connected: boolean;
  sheet: CSSStyleSheet | null;
  useFirstChild: boolean;
  _observers: WeakMap<HTMLElement, MutationObserver>;
  /** Cleanup callbacks returned by plugins applied to this controller's element. */
  _pluginCleanups: InteractPluginCleanup[];
  /** Plugin config values already applied during the current connect (dedup guard). */
  _appliedPlugins: WeakSet<object>;
  connect(key?: string): void;
  disconnect(options?: { removeFromCache?: boolean }): void;
  update(): void;
  toggleEffect(
    effectId: string,
    stateAction: StateAction,
    item?: HTMLElement | null,
    isLegacy?: boolean,
  ): void;
  getActiveEffects(): string[];
  renderStyle(cssRules: string[]): void;
  watchChildList(listContainer: string): void;
  _childListChangeHandler(listContainer: string, entries: MutationRecord[]): void;
}

export interface IInteractElement extends HTMLElement {
  _internals: (ElementInternals & { states: Set<string> }) | null;
  controller: IInteractionController;
  connectedCallback(): void;
  disconnectedCallback(): void;
  connect(key?: string): void;
  disconnect(options?: { removeFromCache?: boolean }): void;
  toggleEffect(effectId: string, stateAction: StateAction, item?: HTMLElement | null): void;
  getActiveEffects(): string[];
}
