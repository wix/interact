import { splitText } from '../splitText';
import type { SplitTextResult, SplitType } from '../types';

/**
 * Local mirror of `@wix/interact`'s `SplitTextConfig`. Deliberately **not**
 * imported from `@wix/interact` — this package has no dependency on it, so
 * any Interact resolver plugin (this one or a third-party alternative) can be
 * registered via `Interact.use('splitText', resolver)` without requiring
 * `@wix/interact` to be installed. The shapes are kept in sync by hand.
 */
export type SplitTextConfig = {
  container: string;
  type: SplitType | SplitType[];
  splitId?: string;
  wrapperClass?: string;
  wrapperStyle?: Record<string, string>;
  wrapperAttrs?: Record<string, string>;
  autoSplit?: boolean;
  aria?: 'auto' | 'none';
  hide?: boolean;
};

/** Local mirror of `@wix/interact`'s `SplitTextResolverContext`. */
export type SplitTextResolverContext = {
  key: string;
  listContainer?: string;
  listItemSelector?: string;
  conditions?: string[];
  selector?: string;
  onResplit?: () => void;
};

/** Local mirror of `@wix/interact`'s `SplitTextResolver` contract. */
export type SplitTextResolver = {
  resolve(root: HTMLElement, config: SplitTextConfig, context: SplitTextResolverContext): void;
  revert(root: HTMLElement, container: string): void;
};

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
