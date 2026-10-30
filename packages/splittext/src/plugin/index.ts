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
  elements.forEach((element) => {
    results.push(splitText(element, options));
  });

  // Reveal the container (see splitTextStyle) now that it holds the individually-animated spans.
  if (hideUntilReady) {
    elements.forEach((element) => element.setAttribute(READY_ATTR, ''));
  }

  const observer = refresh && refreshOnReplace(root, elements, refresh);

  // Interact runs this on disconnect/teardown, restoring the original text.
  return () => {
    observer?.disconnect();
    results.forEach((result) => result.revert());
    elements.forEach((element) => element.removeAttribute(READY_ATTR));
  };
};

/**
 * A re-render can replace a split container while its root stays, e.g. a hydration that doesn't match
 * the split DOM and renders the container again. The new container isn't split, and Interact's effects
 * still target the old one's spans. `refresh` re-applies the plugin, which splits the new container,
 * and re-resolves the targets. The split itself keeps the containers, so it doesn't trigger this.
 */
function refreshOnReplace(
  root: HTMLElement,
  elements: HTMLElement[],
  refresh: () => void,
): MutationObserver {
  const observer = new MutationObserver(() => {
    if (root.isConnected && elements.some((element) => !element.isConnected)) {
      observer.disconnect();
      refresh();
    }
  });
  observer.observe(root, { childList: true, subtree: true });

  return observer;
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
