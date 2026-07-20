import { splitText, type SplitTextOptions, type SplitTextResult } from '@wix/splittext';
import type { InteractPlugin, InteractPluginStyleGenerator } from '@wix/interact';

/** Config accepted under `$splitText` in an InteractConfig on an interaction or effect. */
export type SplitTextPluginConfig = {
  container: string;
  /**
   * Hide the container until the split has been applied, to prevent a flash of the un-split text
   * before an entrance/scroll animation runs. Emits SSR CSS via {@link splitTextStyle} and is
   * revealed once the runtime plugin marks the container ready.
   */
  hideUntilReady?: boolean;
} & SplitTextOptions;

const READY_ATTR = 'data-splittext-ready';

/**
 * Runtime adapter that lets `@wix/splittext` be driven through an InteractConfig `$splitText` field.
 *
 * Register once, before `Interact.create()`:
 *
 * ```ts
 * import { Interact } from '@wix/interact';
 * import { splitTextPlugin } from './plugins/splitTextPlugin';
 * Interact.use('splitText', splitTextPlugin);
 * ```
 *
 * This module is the ONLY place that imports both packages. `@wix/interact` never imports
 * `@wix/splittext` and vice-versa — the plugin bridge keeps them fully decoupled.
 */
export const splitTextPlugin: InteractPlugin = (value, { root }) => {
  const { container, hideUntilReady, ...options } = value as SplitTextPluginConfig;

  const element = root.querySelector<HTMLElement>(container);

  if (!element) {
    return;
  }

  const result: SplitTextResult = splitText(element, options);

  // Reveal the container (see splitTextStyle) now that it holds the individually-animated spans.
  if (hideUntilReady) {
    element.setAttribute(READY_ATTR, '');
  }

  // Interact runs this on disconnect/teardown, restoring the original text.
  return () => {
    result.revert();
    element.removeAttribute(READY_ATTR);
  };
};

/**
 * Build-time (SSR) styling for `$splitText`, passed to `generate()` — NOT the same callback as the
 * runtime `splitTextPlugin` above. When `hideUntilReady` is set, hides the container until the
 * runtime plugin has split it, preventing a flash of un-split text before the animation.
 *
 * ```ts
 * import { generate } from '@wix/interact';
 * import { splitTextStyle } from './plugins/splitTextPlugin';
 * const css = generate(config, true, { splitText: splitTextStyle });
 * ```
 */
export const splitTextStyle: InteractPluginStyleGenerator = (value, _) => {
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

// Type the `$splitText` value so configs get autocomplete + checking.
declare module '@wix/interact' {
  interface InteractPluginConfigMap {
    splitText: SplitTextPluginConfig;
  }
}
