/**
 * Interact plugin bridge for `@wix/splittext` — ships from `@wix/splittext/plugin`.
 *
 * Lets `@wix/splittext` be driven declaratively through an `@wix/interact` config's `$splitText`
 * field, so apps can reuse the adapter instead of copy-pasting it.
 *
 * IMPORTANT: this module does NOT import `@wix/interact` — the two packages stay fully decoupled.
 * The callbacks below are typed against the minimal *structural* shapes Interact relies on, so
 * they are assignable to Interact's `InteractPlugin` / `InteractPluginStyleGenerator` without a
 * dependency on it. A consumer that also has `@wix/interact` "resolves the typing" on its side:
 * it ties the `$splitText` config value to {@link SplitTextPluginConfig} via declaration merging
 * on `InteractPluginConfigMap` (see the demo's `plugins/splitText.ts`).
 */

import { splitText } from '../splitText';
import type { SplitTextPluginConfig } from '../types';
import type { SplitTextResult } from '../types';

export type { SplitTextPluginConfig };

/**
 * Minimal structural mirror of the runtime context Interact passes to a plugin (a subset of
 * Interact's `InteractPluginContext`). Only `root` and `refresh` are read here; typing it as a subset
 * keeps {@link splitTextPlugin} assignable to `InteractPlugin` without importing `@wix/interact`.
 * `refresh` is optional because Interact versions before it don't pass one.
 */
type PluginContext = { root: HTMLElement; refresh?: () => void };

/**
 * Minimal structural mirror of the CSS rule Interact's `generate()` expects back from a style
 * generator — matches `Pick<CSSRuleData, 'declarations' | 'selectorSuffix'>`. Kept local so this
 * module stays free of `@wix/interact`.
 */
type PluginStyleRule = {
  declarations: { name: string; value: string | number }[];
  selectorSuffix?: string;
};

const READY_ATTR = 'data-splittext-ready';

/**
 * Runtime adapter that lets `@wix/splittext` be driven through an InteractConfig `$splitText` field.
 *
 * Register once, before `Interact.create()`:
 *
 * ```ts
 * import { Interact } from '@wix/interact';
 * import { splitTextPlugin } from '@wix/splittext/plugin';
 * Interact.use('splitText', splitTextPlugin);
 * ```
 */
export const splitTextPlugin = (
  value: unknown,
  { root, refresh }: PluginContext,
): void | (() => void) => {
  const { container, hideUntilReady, ...options } = value as SplitTextPluginConfig;

  const elements = Array.from(root.querySelectorAll<HTMLElement>(container));

  if (!elements.length) {
    return;
  }

  const results: SplitTextResult[] = [];
  const watchers: SplitWatcher[] = [];
  const canWatch = refresh && defineSentinel();
  // The first lost split refreshes, which re-applies the plugin to all the containers
  const onLost = () => {
    watchers.forEach((watcher) => watcher.stop());
    refresh?.();
  };
  elements.forEach((element) => {
    if (!canWatch) {
      results.push(splitText(element, options));
      return;
    }
    const watcher = watchSplit(root, element, onLost);
    watchers.push(watcher);
    // Every split, including an `autoSplit` re-split, rebuilds the container, so the sentinel goes back in each time
    results.push(
      splitText(element, {
        ...options,
        onSplit: (result) => {
          watcher.mark();
          options.onSplit?.(result);
        },
      }),
    );
  });

  // Reveal the container (see splitTextStyle) now that it holds the individually-animated spans.
  if (hideUntilReady) {
    elements.forEach((element) => element.setAttribute(READY_ATTR, ''));
  }

  // Interact runs this on disconnect/teardown, restoring the original text.
  return () => {
    watchers.forEach((watcher) => watcher.stop());
    results.forEach((result) => result.revert());
    elements.forEach((element) => element.removeAttribute(READY_ATTR));
  };
};

const SENTINEL_TAG = 'splittext-sentinel';

type Sentinel = HTMLElement & { onDisconnect?: () => void };

type SplitWatcher = { mark: () => void; stop: () => void };

/**
 * A hidden custom element the plugin appends to each split container. The browser calls its
 * `disconnectedCallback` whenever it leaves the document — the container or any ancestor removed, or the
 * container's children replaced — so watching costs nothing until that happens. The class is defined once
 * per document and shared by every copy of the plugin, which only sets `onDisconnect`.
 */
function defineSentinel(): boolean {
  if (typeof customElements === 'undefined') {
    return false;
  }
  if (!customElements.get(SENTINEL_TAG)) {
    customElements.define(
      SENTINEL_TAG,
      class extends HTMLElement {
        onDisconnect?: () => void;

        disconnectedCallback() {
          this.onDisconnect?.();
        }
      },
    );
  }
  return true;
}

/**
 * A re-render can replace a split container, or its children, while its root stays, e.g. a hydration
 * that doesn't match the split DOM and renders the container again. The split is lost, and Interact's
 * effects still target the old spans. `refresh` re-applies the plugin, which splits the container again,
 * and re-resolves the targets.
 *
 * The sentinel also leaves on the plugin's own changes (`autoSplit` re-splits, which `mark` follows with a
 * new sentinel) and on moves (connected again right away), so the check waits for a microtask and
 * refreshes only if the container or its current sentinel is still out of the document.
 */
function watchSplit(root: HTMLElement, element: HTMLElement, onLost: () => void): SplitWatcher {
  let sentinel: Sentinel | null = null;
  let stopped = false;
  let checkScheduled = false;

  const stop = () => {
    stopped = true;
    if (sentinel) {
      sentinel.onDisconnect = undefined;
    }
  };

  const check = () => {
    checkScheduled = false;
    if (stopped || !root.isConnected || (element.isConnected && sentinel?.isConnected)) {
      return;
    }
    stop();
    onLost();
  };

  const onDisconnect = () => {
    if (!checkScheduled) {
      checkScheduled = true;
      queueMicrotask(check);
    }
  };

  const mark = () => {
    if (stopped) {
      return;
    }
    const next = element.ownerDocument.createElement(SENTINEL_TAG) as Sentinel;
    next.hidden = true;
    next.setAttribute('aria-hidden', 'true');
    next.onDisconnect = onDisconnect;
    element.appendChild(next);
    sentinel = next;
  };

  return { mark, stop };
}

/**
 * Build-time (SSR) styling for `$splitText`, passed to `generate()` — NOT the same callback as the
 * runtime `splitTextPlugin` above. When `hideUntilReady` is set, hides the container until the
 * runtime plugin has split it, preventing a flash of un-split text before the animation.
 *
 * ```ts
 * import { generate } from '@wix/interact';
 * import { splitTextStyle } from '@wix/splittext/plugin';
 * const css = generate(config, { plugins: { splitText: splitTextStyle } });
 * ```
 */
export const splitTextStyle = (value: unknown): PluginStyleRule[] => {
  const { container, hideUntilReady } = value as SplitTextPluginConfig;

  if (!hideUntilReady) {
    return [];
  }

  return [
    {
      declarations: [{ name: 'visibility', value: 'hidden' }],
      selectorSuffix: ` ${container}:not([${READY_ATTR}])`,
    },
  ];
};
