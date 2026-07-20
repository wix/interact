import type { IInteractElement, InteractPluginCleanup, StateAction } from '../types';
import { add, addListItems } from './add';
import { remove, removeListItems } from './remove';

export const INTERACT_EFFECT_DATA_ATTR = 'interactEffect';

export class InteractionController {
  element: HTMLElement;
  key: string | undefined;
  connected: boolean;
  sheet: CSSStyleSheet | null;
  useFirstChild: boolean;
  _observers: WeakMap<HTMLElement, MutationObserver>;
  _pluginCleanups: InteractPluginCleanup[];
  _appliedPlugins: WeakSet<object>;

  constructor(element: HTMLElement, key?: string, options?: { useFirstChild?: boolean }) {
    this.element = element;
    this.key = key;
    this.connected = false;
    this.sheet = null;
    this._observers = new WeakMap();
    this._pluginCleanups = [];
    this._appliedPlugins = new WeakSet();
    this.useFirstChild = options?.useFirstChild ?? false;
  }

  connect(key?: string) {
    if (this.connected) {
      return;
    }

    const domKey = this.element.dataset.interactKey;

    key = key || this.key || domKey;

    if (!key) {
      console.warn('Interact: No key provided');
      return;
    }

    if (domKey !== key) {
      if (domKey) {
        console.warn(
          `Interact: Key mismatch between element ${domKey} and parameter ${key}, updating element key`,
        );
      }

      this.element.dataset.interactKey = key;
    }

    this.key = key;

    this.connected = add(this);
  }

  disconnect({ removeFromCache = false }: { removeFromCache?: boolean } = {}) {
    const key = this.key || this.element.dataset.interactKey;

    if (key) {
      remove(this, removeFromCache);
    }

    // Run plugin cleanups after `remove()` has torn down animations on the (possibly
    // plugin-generated) elements, then revert the plugins' DOM mutations.
    if (this._pluginCleanups.length) {
      for (const cleanup of this._pluginCleanups) {
        try {
          cleanup();
        } catch (e) {
          console.error(e);
        }
      }
      this._pluginCleanups = [];
    }
    this._appliedPlugins = new WeakSet();

    if (this.sheet) {
      const rootNode = this.element?.getRootNode() as ShadowRoot | Document;
      const adoptTarget: { adoptedStyleSheets: CSSStyleSheet[] } = ((rootNode as ShadowRoot).host
        ? (rootNode as ShadowRoot)
        : document) as unknown as { adoptedStyleSheets: CSSStyleSheet[] };
      const index = adoptTarget.adoptedStyleSheets.indexOf(this.sheet);
      if (index !== -1) {
        adoptTarget.adoptedStyleSheets = adoptTarget.adoptedStyleSheets.filter(
          (s) => s !== this.sheet,
        );
      }
    }

    this._observers = new WeakMap();
    this.sheet = null;
    this.connected = false;
  }

  update() {
    this.disconnect();
    this.connect();
  }

  renderStyle(cssRules: string[]) {
    const rootNode = this.element?.getRootNode() as ShadowRoot | Document;
    const adoptTarget: { adoptedStyleSheets: CSSStyleSheet[] } = ((rootNode as ShadowRoot).host
      ? (rootNode as ShadowRoot)
      : document) as unknown as { adoptedStyleSheets: CSSStyleSheet[] };
    if (!this.sheet) {
      this.sheet = new CSSStyleSheet();
      void this.sheet.replaceSync(cssRules.join('\n'));

      adoptTarget.adoptedStyleSheets = [...(adoptTarget.adoptedStyleSheets || []), this.sheet];
    } else {
      let position = this.sheet.cssRules.length;

      for (const cssRule of cssRules) {
        try {
          this.sheet.insertRule(cssRule, position);
          position++;
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  toggleEffect(
    effectId: string,
    stateAction: StateAction,
    item?: HTMLElement | null,
    isLegacy?: boolean,
  ) {
    if (item === null) {
      return;
    }

    if (!isLegacy && (this.element as IInteractElement).toggleEffect) {
      (this.element as IInteractElement).toggleEffect(effectId, stateAction, item);
      return;
    }

    const currentEffects = new Set(
      this.element.dataset[INTERACT_EFFECT_DATA_ATTR]?.split(' ') || [],
    );

    if (stateAction === 'toggle') {
      if (currentEffects.has(effectId)) {
        currentEffects.delete(effectId);
      } else {
        currentEffects.add(effectId);
      }
    } else if (stateAction === 'add') {
      currentEffects.add(effectId);
    } else if (stateAction === 'remove') {
      currentEffects.delete(effectId);
    } else if (stateAction === 'clear') {
      currentEffects.clear();
    }

    (item || this.element).dataset[INTERACT_EFFECT_DATA_ATTR] =
      Array.from(currentEffects).join(' ');
  }

  getActiveEffects(): string[] {
    const raw = this.element.dataset[INTERACT_EFFECT_DATA_ATTR] || '';
    const trimmed = raw.trim();
    return trimmed ? trimmed.split(/\s+/) : [];
  }

  watchChildList(listContainer: string): void {
    const list = this.element.querySelector(listContainer);

    if (list) {
      // TODO: we can probably improve this and use less observers, this impl. uses one per container element
      let observer = this._observers.get(list as HTMLElement);

      if (!observer) {
        observer = new MutationObserver(this._childListChangeHandler.bind(this, listContainer));

        this._observers.set(list as HTMLElement, observer);

        observer.observe(list as HTMLElement, { childList: true });
      }
    }
  }

  _childListChangeHandler(listContainer: string, entries: MutationRecord[]) {
    const key = this.key || this.element.dataset.interactKey;
    const removedElements: HTMLElement[] = [];
    const addedElements: HTMLElement[] = [];

    entries.forEach((entry) => {
      entry.removedNodes.forEach((el) => {
        if (el instanceof HTMLElement) {
          removedElements.push(el);
        }
      });

      entry.addedNodes.forEach((el) => {
        if (el instanceof HTMLElement) {
          addedElements.push(el);
        }
      });
    });

    removeListItems(removedElements);

    if (key) {
      addListItems(this, listContainer, addedElements);
    }
  }
}
