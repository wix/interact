export type {
  SplitType,
  WrapperClassConfig,
  WrapperStyleConfig,
  WrapperAttrsConfig,
  SplitTextOptions,
  SplitTextPluginConfig,
} from './schema';

import type { SplitTextOptions } from './schema';

/**
 * Live DOM handle returned by {@link splitText}. Not part of the JSON schema surface.
 */
export interface SplitTextResult {
  /** Split into individual grapheme clusters. DOM is mutated on first access. */
  readonly chars: HTMLSpanElement[];

  /** Split into word tokens. DOM is mutated on first access. */
  readonly words: HTMLSpanElement[];

  /**
   * Split into rendered lines using the Range API. DOM is mutated on first
   * access. Triggers layout queries.
   */
  readonly lines: HTMLSpanElement[];

  /** Split into sentences. DOM is mutated on first access. */
  readonly sentences: HTMLSpanElement[];

  /** Restore the element to its original HTML and clear the cache. */
  revert(): void;

  /**
   * Re-split the element with (optionally new) options, clearing the current
   * cache first. Returns the same result instance.
   */
  split(options?: SplitTextOptions): SplitTextResult;

  /** Original `innerHTML` captured at construction time. */
  readonly originalHTML: string;

  /** The target element. */
  readonly element: HTMLElement;

  /** `true` if the DOM has been mutated by at least one split operation. */
  readonly isSplit: boolean;
}
