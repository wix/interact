import { splitText } from '../splitText';
import type { SplitTextResult } from '../types';
// Type-only dependency: keeps the runtime bundle free of @wix/interact.
import type { SplitTextResolver, SplitTextConfig, SplitTextResolverContext } from '@wix/interact';

const results = new WeakMap<HTMLElement, SplitTextResult>();

function toOptions(config: SplitTextConfig, context: SplitTextResolverContext) {
  let initialSplitDone = false;

  return {
    type: config.type,
    wrapperClass: config.wrapperClass,
    wrapperStyle: config.wrapperStyle as Partial<CSSStyleDeclaration> | undefined,
    wrapperAttrs: config.wrapperAttrs,
    autoSplit: config.autoSplit,
    aria: config.aria,
    onSplit: () => {
      // The initial (synchronous) split fires onSplit during splitText()
      // construction; Interact resolves targets against it immediately, so it
      // must NOT trigger a rebuild. Only asynchronous re-splits (ResizeObserver
      // / fonts.ready) ask Interact to re-resolve targets via controller.update().
      if (!initialSplitDone) {
        initialSplitDone = true;
        return;
      }
      context.onResplit?.();
    },
  };
}

/**
 * `@wix/interact` resolver backed by `@wix/splittext`. Register it before
 * creating interactions:
 *
 * ```ts
 * import { Interact } from '@wix/interact';
 * import { splitTextResolver } from '@wix/splittext/interact';
 *
 * Interact.use('splitText', splitTextResolver);
 * Interact.create(config);
 * ```
 */
export const splitTextResolver: SplitTextResolver = {
  resolve(root, config, context) {
    const container = root.querySelector(config.container) as HTMLElement | null;
    if (!container) {
      console.warn(`[@wix/splittext] container "${config.container}" not found`);
      return;
    }

    // Idempotent: a container referenced by multiple effects splits only once.
    if (results.has(container)) return;

    // Passing `type` makes splitText split eagerly & synchronously, so the
    // spans exist immediately for Interact's target resolution.
    results.set(container, splitText(container, toOptions(config, context)));
  },

  revert(root, containerSelector) {
    const container = root.querySelector(containerSelector) as HTMLElement | null;
    const result = container && results.get(container);
    if (result) {
      result.revert();
      results.delete(container);
    }
  },
};
