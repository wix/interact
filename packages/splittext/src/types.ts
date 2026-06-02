export type SplitType = 'chars' | 'words' | 'lines' | 'sentences';

export interface WrapperClassConfig {
  chars?: string;
  words?: string;
  lines?: string;
  sentences?: string;
}

export interface WrapperStyleConfig {
  chars?: Partial<CSSStyleDeclaration>;
  words?: Partial<CSSStyleDeclaration>;
  lines?: Partial<CSSStyleDeclaration>;
  sentences?: Partial<CSSStyleDeclaration>;
}

export interface WrapperAttrsConfig {
  chars?: Record<string, string>;
  words?: Record<string, string>;
  lines?: Record<string, string>;
  sentences?: Record<string, string>;
}

export interface SplitTextOptions {
  /**
   * Split types to compute. When specified, those types are split eagerly on
   * invocation; omitting the option defers splitting until each getter is
   * accessed.
   */
  type?: SplitType | SplitType[];

  /**
   * CSS class(es) added to every wrapper `<span>`. Accepts either a single
   * string (applied to all types) or a per-type config object.
   */
  wrapperClass?: string | WrapperClassConfig;

  /**
   * Inline styles applied to every wrapper `<span>`. Accepts either a global
   * `CSSStyleDeclaration` partial (applied to all types) or a per-type config.
   */
  wrapperStyle?: Partial<CSSStyleDeclaration> | WrapperStyleConfig;

  /**
   * Custom HTML attributes applied to every wrapper `<span>`. Accepts either a
   * global record (applied to all types) or a per-type config.
   */
  wrapperAttrs?: Record<string, string> | WrapperAttrsConfig;

  /**
   * Controls whether char/word wrappers receive a `data-content` attribute
   * mirroring their text content (useful for CSS `content: attr(data-content)`
   * generated-content effects).
   *
   * - `'both'` (default): text content present and `data-content` set.
   * - `'none'`: no `data-content` attribute.
   * - `'attribute-only'`: `data-content` set, text content left empty.
   */
  contentAttribute?: 'none' | 'both' | 'attribute-only';

  /**
   * ARIA handling mode.
   *
   * - `'auto'` (default): wraps split content in an `aria-hidden` div and
   *   preserves the original text for screen readers.
   * - `'none'`: no ARIA changes.
   */
  aria?: 'auto' | 'none';

  /**
   * When `true` (default), inserts a visually-hidden `<span>` containing the
   * original text as a sibling of the split content for SEO and assistive
   * technology. When `false`, sets `aria-label` on the container instead.
   */
  preserveText?: boolean;

  /**
   * How inner DOM structure is handled.
   *
   * - `'preserve'` (default): traverse text nodes via `TreeWalker`, keeping
   *   inline elements (links, bold, italic) intact.
   * - `'flatten'`: use `element.textContent`, discarding all inner DOM.
   * - `number`: preserve N element levels; deeper content is flattened.
   */
  nested?: 'flatten' | 'preserve' | number;

  /**
   * Provide a custom `Intl.Segmenter` constructor when native support is
   * missing. Accepts either an already-constructed instance or the constructor
   * itself (the library will instantiate it per granularity).
   */
  segmenter?: Intl.Segmenter | { new (locale: string, options: { granularity: string }): Intl.Segmenter };

  /**
   * Optional plugin for BiDi (bidirectional text) handling. Receives the flat
   * text content and must return ordered runs with explicit direction. See docs
   * for plugin contract details.
   */
  bidiResolver?: (text: string) => Array<{ text: string; direction: 'ltr' | 'rtl' }>;

  /**
   * When `true`, attaches a `ResizeObserver` and `fonts.ready` listener that
   * automatically re-split on viewport or font changes.
   */
  autoSplit?: boolean;

  /**
   * Called after every split (including re-splits triggered by `autoSplit`).
   * Receives the updated `SplitTextResult`.
   */
  onSplit?: (result: SplitTextResult) => Animation | void;

  /**
   * When `true` (default), sets CSS custom properties (`--char-index`,
   * `--word-index`, `--line-index`, `--sentence-index`) on each wrapper span
   * for use in staggered CSS animations.
   */
  partIndexing?: boolean;

  /**
   * Selectors or a predicate to skip nodes during traversal (only applies in
   * `'preserve'` / `number` nested modes). Example: `['sup', 'sub']`.
   */
  ignore?: string[] | ((node: Node) => boolean);
}

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
   * cache first.
   */
  split(options?: SplitTextOptions): SplitTextResult;

  /** Original `innerHTML` captured at construction time. */
  readonly originalHTML: string;

  /** The target element. */
  readonly element: HTMLElement;

  /** `true` if the DOM has been mutated by at least one split operation. */
  readonly isSplit: boolean;
}
