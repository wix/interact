import type { SplitTextConfig } from './config';

/**
 * Context passed to a {@link SplitTextResolver} describing the interaction or
 * effect that requested the split. Carries the targeting props so an advanced
 * resolver can make decisions, plus an optional re-split callback.
 */
export type SplitTextResolverContext = {
  /** The interact key of the element being processed (the split root). */
  key: string;
  listContainer?: string;
  listItemSelector?: string;
  conditions?: string[];
  selector?: string;
  /**
   * Invoke to ask Interact to re-resolve targets after an asynchronous re-split
   * (e.g. from `autoSplit`'s ResizeObserver / fonts.ready). Backed by the
   * connecting controller's `update()`. Do **not** call this for the initial
   * (synchronous) split — only for subsequent re-splits.
   */
  onResplit?: () => void;
};

/**
 * Contract implemented by a splitText provider and registered through
 * `Interact.use('splitText', resolver)`. Interact references this interface
 * only (`import type`), so no runtime coupling exists between the packages.
 */
export type SplitTextResolver = {
  /**
   * Split the text of `config.container` (resolved relative to `root`) into
   * wrapper spans. Must be synchronous so the spans exist before Interact
   * resolves animation targets. Idempotent per container.
   */
  resolve(root: HTMLElement, config: SplitTextConfig, context: SplitTextResolverContext): void;
  /** Restore `container` (relative to `root`) to its original, unsplit content. */
  revert(root: HTMLElement, container: string): void;
};
