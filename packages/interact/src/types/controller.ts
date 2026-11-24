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
  /**
   * Plugin config values applied during the current connect (dedup guard): `true` once applied, or
   * the in-flight promise of an async plugin, so concurrent passes await it instead of re-running it.
   */
  _appliedPlugins: WeakMap<object, true | Promise<void>>;
  /** Incremented on every disconnect; async plugin continuations from an older connect are stale. */
  _connectId: number;
  /**
   * Trigger latches on this controller's elements while plugins hold their interactions back (see
   * `TriggerLatch`), released on disconnect, or once their element leaves this controller's DOM.
   */
  _latches: { element: HTMLElement; release: () => void }[];
  connect(key?: string): void;
  disconnect(options?: { removeFromCache?: boolean }): void;
  update(): void;
  /**
   * Re-runs the add pass while connected, applying what a plugin's `defer` option no longer holds
   * back. Called by `Interact.ready()`.
   */
  resume(): void;
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
