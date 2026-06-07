import type { SplitTextOptions, SplitTextResult, SplitType } from './types';
import { applyAccessibility } from './accessibility';
import { detectLines } from './lineDetection';
import {
  segmentChars,
  segmentSentences,
  segmentWordsAll,
  buildAdjacentWordTokens,
  isWhitespaceOnly,
  getTextContent,
  getFilteredTextContent,
} from './utils';
import { createWrapper, injectBaseStyles } from './wrappers';

type SplitCache = {
  chars?: HTMLSpanElement[];
  words?: HTMLSpanElement[];
  lines?: HTMLSpanElement[];
  sentences?: HTMLSpanElement[];
};

/**
 * Perform character-level splitting on a plain text string.
 * Returns an array of `<span>` elements (not yet inserted into the DOM).
 */
function splitChars(text: string, options: SplitTextOptions): HTMLSpanElement[] {
  const chars = segmentChars(text, options);
  return chars.map((char, i) => createWrapper(char, 'chars', i, options));
}

/**
 * Perform word-level splitting on a plain text string.
 * Returns the word `<span>` elements AND a full DOM node list. With
 * `wordGlue: 'adjacent'` (default) every token is a span; with `'none'`,
 * whitespace-only segments remain as text nodes between spans.
 */
function splitWordsWithSpacing(
  text: string,
  options: SplitTextOptions,
): { spans: HTMLSpanElement[]; nodes: Node[] } {
  const wordGlue = options.wordGlue ?? 'adjacent';
  const allSegments = segmentWordsAll(text, options);
  const spans: HTMLSpanElement[] = [];
  const nodes: Node[] = [];

  if (wordGlue === 'adjacent') {
    const tokens = buildAdjacentWordTokens(allSegments);
    tokens.forEach((token, index) => {
      const span = createWrapper(token, 'words', index, options);
      spans.push(span);
      nodes.push(span);
    });
    return { spans, nodes };
  }

  let wordIndex = 0;
  for (const seg of allSegments) {
    if (!seg.segment) continue;

    if (seg.isWordLike || !isWhitespaceOnly(seg.segment)) {
      const span = createWrapper(seg.segment, 'words', wordIndex++, options);
      spans.push(span);
      nodes.push(span);
    } else {
      nodes.push(document.createTextNode(seg.segment));
    }
  }

  return { spans, nodes };
}

/**
 * Perform sentence-level splitting on a plain text string.
 * Returns an array of `<span>` elements (not yet inserted into the DOM).
 */
function splitSentences(text: string, options: SplitTextOptions): HTMLSpanElement[] {
  const sentences = segmentSentences(text, options);
  return sentences.map((sentence, i) => createWrapper(sentence, 'sentences', i, options));
}

/**
 * Perform line-level splitting on `element`.
 *
 * Line detection **must** happen before any DOM mutation (the Range API
 * queries the pre-split layout). After detection, the element's text is
 * replaced with wrapper spans, one per detected line.
 */
function splitLinesInElement(element: HTMLElement, options: SplitTextOptions): HTMLSpanElement[] {
  const lines = detectLines(element, options);
  return lines.map((line, i) => createWrapper(line, 'lines', i, options));
}

/**
 * Resolve a CSS selector or DOM element to an `HTMLElement`.
 * Throws a descriptive error when the target cannot be found.
 */
function resolveElement(target: string | HTMLElement): HTMLElement {
  if (typeof target === 'string') {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) throw new Error(`[@wix/splittext] No element found for selector: "${target}"`);
    return el;
  }
  return target;
}

/**
 * Read border-box inline size from a `ResizeObserver` entry. Matches
 * `getBoundingClientRect().width` in horizontal writing modes while staying
 * writing-mode aware. Falls back to `contentRect.width` on older engines.
 */
function readBorderInlineSize(entry: ResizeObserverEntry): number {
  const box = entry.borderBoxSize;
  if (box?.length) return box[0].inlineSize;
  return entry.contentRect.width;
}

// ---------------------------------------------------------------------------
// SplitTextResultImpl
// ---------------------------------------------------------------------------

class SplitTextResultImpl implements SplitTextResult {
  readonly element: HTMLElement;
  readonly originalHTML: string;

  private _originalText: string;
  /** Text used for segmentation — respects the `ignore` option. */
  private _splitText: string;
  private _options: SplitTextOptions;
  private _cache: SplitCache = {};
  /**
   * Parallel cache of DOM nodes for types that include non-span nodes
   * (e.g. text nodes for inter-word spacing). For types without extra nodes
   * this mirrors `_cache`.
   */
  private _domNodes: Partial<Record<SplitType, Node[]>> = {};
  private _isSplit = false;
  /**
   * Which split type currently occupies the element's DOM. Only one type is
   * rendered in the DOM at a time; cached spans for other types remain valid
   * JS objects and are re-inserted when their getter is accessed again.
   */
  private _activeType: SplitType | null = null;

  /** ResizeObserver for autoSplit support. */
  private _resizeObserver: ResizeObserver | null = null;

  /** Last observed width — used to avoid resize feedback loops. */
  private _lastWidth = -1;

  constructor(element: HTMLElement, options: SplitTextOptions = {}) {
    this.element = element;
    this.originalHTML = element.innerHTML;
    // Capture plain text before any DOM mutation so getters always use the
    // correct source string regardless of the element's current DOM state.
    this._originalText = getTextContent(element);
    this._splitText = getFilteredTextContent(element, options.ignore);
    this._options = options;

    // Inject base stylesheet once per document
    injectBaseStyles(element.ownerDocument);

    // Eager split when `type` is specified
    if (options.type) {
      const types = Array.isArray(options.type) ? options.type : [options.type];
      for (const type of types) {
        this._compute(type);
      }
      // Activate the last requested type in the DOM
      this._activate(types[types.length - 1]);
    }

    // AutoSplit observers
    if (options.autoSplit) {
      this._attachObservers();
    }
  }

  // -------------------------------------------------------------------------
  // Public getters (lazy evaluation)
  // -------------------------------------------------------------------------

  get chars(): HTMLSpanElement[] {
    if (!this._cache.chars) this._compute('chars');
    if (this._activeType !== 'chars') this._activate('chars');
    return this._cache.chars!;
  }

  get words(): HTMLSpanElement[] {
    if (!this._cache.words) this._compute('words');
    if (this._activeType !== 'words') this._activate('words');
    return this._cache.words!;
  }

  get lines(): HTMLSpanElement[] {
    if (!this._cache.lines) this._compute('lines');
    if (this._activeType !== 'lines') this._activate('lines');
    return this._cache.lines!;
  }

  get sentences(): HTMLSpanElement[] {
    if (!this._cache.sentences) this._compute('sentences');
    if (this._activeType !== 'sentences') this._activate('sentences');
    return this._cache.sentences!;
  }

  get isSplit(): boolean {
    return this._isSplit;
  }

  // -------------------------------------------------------------------------
  // Public methods
  // -------------------------------------------------------------------------

  revert(): void {
    this._detachObservers();
    this.element.innerHTML = this.originalHTML;
    this._cache = {};
    this._domNodes = {};
    this._isSplit = false;
    this._activeType = null;
  }

  split(options?: SplitTextOptions): SplitTextResult {
    this.revert();
    return new SplitTextResultImpl(this.element, { ...this._options, ...options });
  }

  // -------------------------------------------------------------------------
  // Internal: compute (no DOM write) vs. activate (DOM write)
  // -------------------------------------------------------------------------

  /**
   * Compute and cache the spans for `type` **without mutating the DOM**,
   * except for `'lines'` which requires the pre-split layout.
   *
   * Separating computation from activation lets multiple types be computed
   * and cached independently without overwriting each other's cached spans
   * in the DOM between calls.
   */
  private _compute(type: SplitType): void {
    if (this._cache[type]) return;

    if (type === 'lines') {
      // Range-based line detection must run before any DOM mutation.
      // If another type is currently rendered, restore the original HTML first.
      if (this._isSplit) {
        this.element.innerHTML = this.originalHTML;
        this._isSplit = false;
        this._activeType = null;
        // Cached spans for other types remain valid detached DOM nodes and
        // can be re-activated later via _activate().
      }
      this._cache.lines = splitLinesInElement(this.element, this._options);
      this._domNodes.lines = this._cache.lines;
    } else if (type === 'chars') {
      this._cache.chars = splitChars(this._splitText, this._options);
      this._domNodes.chars = this._cache.chars;
    } else if (type === 'words') {
      const { spans, nodes } = splitWordsWithSpacing(this._splitText, this._options);
      this._cache.words = spans;
      this._domNodes.words = nodes;
    } else {
      this._cache.sentences = splitSentences(this._splitText, this._options);
      this._domNodes.sentences = this._cache.sentences;
    }
  }

  /**
   * Insert the cached spans for `type` into the element's DOM, replacing any
   * currently active split content. Only one type is active in the DOM at a
   * time.
   */
  private _activate(type: SplitType): void {
    const nodes = this._domNodes[type] ?? this._cache[type];
    if (!nodes?.length) return;

    const finalNodes = this._applyBidi(nodes, this._splitText);

    this.element.innerHTML = '';
    const innerWrapper = applyAccessibility(this.element, this._originalText, this._options);
    for (const node of finalNodes) {
      innerWrapper.appendChild(node);
    }

    this._activeType = type;
    this._isSplit = true;
    this._options.onSplit?.(this);
  }

  /**
   * Wrap split nodes in `<span dir="…">` runs when a `bidiResolver` is
   * provided. Returns the original array unchanged when no resolver is set.
   *
   * Distributes nodes into runs by matching cumulative text length against
   * each run's text length — works correctly for any split type (chars,
   * words, lines, sentences) and for interleaved text nodes.
   */
  private _applyBidi(nodes: Node[], text: string): Node[] {
    const resolver = this._options.bidiResolver;
    if (!resolver) return nodes;

    const runs = resolver(text);
    const runEls: Node[] = [];
    let nodeIndex = 0;

    for (const run of runs) {
      const runSpan = document.createElement('span') as HTMLSpanElement;
      runSpan.setAttribute('dir', run.direction);
      runSpan.classList.add(run.direction === 'rtl' ? 'split-rtl' : 'split-ltr');

      let consumed = 0;
      while (nodeIndex < nodes.length && consumed < run.text.length) {
        const node = nodes[nodeIndex];
        runSpan.appendChild(node);
        consumed += (node.textContent ?? '').length;
        nodeIndex++;
      }

      runEls.push(runSpan);
    }

    // Append any remaining nodes to the last run element
    if (nodeIndex < nodes.length && runEls.length > 0) {
      const lastRun = runEls[runEls.length - 1];
      while (nodeIndex < nodes.length) {
        (lastRun as HTMLSpanElement).appendChild(nodes[nodeIndex++]);
      }
    }

    return runEls;
  }

  // -------------------------------------------------------------------------
  // AutoSplit observers
  // -------------------------------------------------------------------------

  private _attachObservers(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver((entries) => {
        const entry = entries.find((e) => e.target === this.element) ?? entries[0];
        if (entry) this._onResize(entry);
      });
      this._resizeObserver.observe(this.element);
    }

    if (typeof document !== 'undefined' && document.fonts) {
      // fonts.ready is a one-shot — bypass the width guard since font loading
      // changes glyph metrics (and thus line breaks) without changing width.
      document.fonts.ready.then(() => this._resplit());
    }
  }

  private _detachObservers(): void {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  /**
   * Width-guarded entry point for ResizeObserver. Only re-splits when width
   * actually changed — height changes are expected side-effects of our own
   * DOM mutations and must be ignored to prevent a feedback loop.
   */
  private _onResize(entry: ResizeObserverEntry): void {
    const currentWidth = readBorderInlineSize(entry);
    if (Math.abs(currentWidth - this._lastWidth) < 1) return;
    this._resplit(currentWidth);
  }

  /** Unconditionally re-compute and re-activate all cached split types. */
  private _resplit(knownWidth?: number): void {
    const cachedTypes = Object.keys(this._cache) as SplitType[];
    if (cachedTypes.length === 0) {
      this._lastWidth = knownWidth ?? this.element.getBoundingClientRect().width;
      return;
    }

    const prevActive = this._activeType;

    // Reset state and restore original DOM
    this._cache = {};
    this._domNodes = {};
    this._isSplit = false;
    this._activeType = null;
    this.element.innerHTML = this.originalHTML;
    // Re-read plain text in case the element's content changed
    this._originalText = getTextContent(this.element);
    this._splitText = getFilteredTextContent(this.element, this._options.ignore);

    // Re-compute all previously cached types
    for (const type of cachedTypes) {
      this._compute(type);
    }

    // Re-activate the previously rendered type
    if (prevActive && this._cache[prevActive]) {
      this._activate(prevActive);
    }

    // Record width so the next RO callback (triggered by our height change)
    // sees a matching inline size and early-returns.
    this._lastWidth = knownWidth ?? this.element.getBoundingClientRect().width;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Split the text content of `target` into animatable `<span>` wrappers.
 *
 * ```typescript
 * // Lazy — no DOM mutation until a getter is accessed
 * const result = splitText('.headline');
 * const chars = result.chars; // DOM mutated here
 *
 * // Eager — chars split immediately on call
 * const { chars } = splitText('.headline', { type: 'chars' });
 * ```
 *
 * @param target  - CSS selector string or `HTMLElement`.
 * @param options - Configuration options.
 */
export function splitText(
  target: string | HTMLElement,
  options: SplitTextOptions = {},
): SplitTextResult {
  const element = resolveElement(target);
  return new SplitTextResultImpl(element, options);
}
