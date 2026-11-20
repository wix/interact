import type { InteractPluginCleanup, ScopedStateMutation, StateAction } from '../types';
import { add, addListItems } from './add';
import { applyScopedEffectState, getActiveEffectIds, toggleEffectState } from './effectState';
import { getMountedController } from './Interact';
import { remove, removeListItems } from './remove';
import {
  appendOwnedStyle,
  closeRuntimeSheet,
  makeStyleReceipt,
  type StyleSheetScope,
} from './runtimeStyle';

export class InteractionController {
  element: HTMLElement;
  key: string | undefined;
  connected: boolean;
  sheet: CSSStyleSheet | null;
  private runtimeSheet?: StyleSheetScope;
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
    const scope = this.runtimeSheet;
    const originalSheet = this.sheet;
    const opaqueAdoption =
      originalSheet && originalSheet !== scope?.sheet ? this.getRuntimeStyleRoot() : undefined;
    const key = this.key || this.element.dataset.interactKey;
    if (scope && !scope.closing) {
      const mounted = key ? getMountedController(key) : undefined;
      scope.closing = { connection: mounted?.controller === this ? mounted : undefined };
    }

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
      this._pluginCleanups.length = 0;
    }
    this._appliedPlugins = new WeakSet();

    if (scope) closeRuntimeSheet(scope);
    if (originalSheet && opaqueAdoption?.adoptedStyleSheets.includes(originalSheet)) {
      opaqueAdoption.adoptedStyleSheets = opaqueAdoption.adoptedStyleSheets.filter(
        (sheet) => sheet !== originalSheet,
      );
    }
    if (this.runtimeSheet === scope) this.runtimeSheet = undefined;
    if (this.sheet === originalSheet) this.sheet = null;

    this._observers = new WeakMap();
    this.connected = false;
  }

  update() {
    this.disconnect();
    this.connect();
  }

  resume() {
    if (this.connected) {
      add(this);
    }
  }

  renderStyle(cssRules: string[]): void {
    this.appendRuntimeRules(cssRules);
  }

  [appendOwnedStyle](rules: string[], canPublish: () => boolean) {
    const renderStyle = this.renderStyle;
    if (renderStyle !== defaultRenderStyle) {
      renderStyle.call(this, rules);
      return;
    }
    if (!canPublish()) return;

    const { scope, inserted } = this.appendRuntimeRules(rules);
    return scope && makeStyleReceipt(scope, inserted);
  }

  private getRuntimeStyleRoot(): Document | ShadowRoot {
    const root = this.element.getRootNode();
    const view = this.element.ownerDocument.defaultView;
    return view && root instanceof view.ShadowRoot ? root : document;
  }

  private appendRuntimeRules(cssRules: string[]): { scope?: StyleSheetScope; inserted: CSSRule[] } {
    const sheet = this.sheet;
    const scope = this.runtimeSheet?.sheet === sheet ? this.runtimeSheet : undefined;
    const closing = scope?.closing;
    const mounted = closing && this.key ? getMountedController(this.key) : undefined;
    const resumed = mounted?.controller === this && mounted !== closing?.connection;
    if (!sheet || resumed) {
      const adoptedInto = this.getRuntimeStyleRoot();
      const nextSheet = new CSSStyleSheet();
      this.sheet = nextSheet;
      nextSheet.replaceSync(cssRules.join('\n'));
      adoptedInto.adoptedStyleSheets = [...(adoptedInto.adoptedStyleSheets || []), nextSheet];
      const nextScope: StyleSheetScope = { sheet: nextSheet, adoptedInto, receipts: new Set() };
      this.runtimeSheet = nextScope;
      return { scope: nextScope, inserted: Array.from(nextSheet.cssRules) };
    }

    const inserted: CSSRule[] = [];
    for (const cssRule of cssRules) {
      try {
        const index = sheet.insertRule(cssRule, sheet.cssRules.length);
        inserted.push(sheet.cssRules[index]);
      } catch (error) {
        console.error(error);
      }
    }
    return { scope, inserted };
  }

  applyState(mutation: ScopedStateMutation): void {
    applyScopedEffectState(this.element, this.key, mutation);
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

    const { element, key } = this;
    if (!isLegacy && 'toggleEffect' in element && typeof element.toggleEffect === 'function') {
      element.toggleEffect(effectId, stateAction, item);
      return;
    }

    toggleEffectState({ element: item ?? element, key, effectId, stateAction });
  }

  getActiveEffects(): string[] {
    return getActiveEffectIds(this.element);
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
    const container = entries[0]?.target;
    const removedElements = new Set<HTMLElement>();
    const addedElements = new Set<HTMLElement>();

    entries.forEach((entry) => {
      entry.removedNodes.forEach((el) => {
        if (el instanceof HTMLElement) {
          removedElements.add(el);
        }
      });

      entry.addedNodes.forEach((el) => {
        if (el instanceof HTMLElement) {
          addedElements.add(el);
        }
      });
    });

    if (key && container instanceof Element) {
      removeListItems([...removedElements], { key, container });
      const currentItems = [...addedElements].filter((item) => item.parentElement === container);
      addListItems(this, listContainer, currentItems, container);
    }
  }
}

const defaultRenderStyle = InteractionController.prototype.renderStyle;
