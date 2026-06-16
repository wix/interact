import type { SplitTextOptions, SplitTextResult, SplitType } from './types';
import { applyAccessibility } from './accessibility';
import { detectLines } from './lineDetection';
import {
  buildNestedFromLines,
  buildNestedNodes,
  createIndexOffsets,
  normalizeSplitTypes,
} from './nestedSplit';
import {
  segmentChars,
  segmentSentences,
  segmentWordsAll,
  buildAdjacentWordTokens,
  isWhitespaceOnly,
  getTextContent,
  getFilteredTextContent,
  walkTextNodes,
  flattenBeyondDepth,
} from './utils';
import { createWrapper, injectBaseStyles } from './wrappers';

type SplitCache = {
  chars?: HTMLSpanElement[];
  words?: HTMLSpanElement[];
  lines?: HTMLSpanElement[];
  sentences?: HTMLSpanElement[];
};

/**
 * Tracks the replacement nodes for one text node in preserve mode.
 */
interface PreserveSegment {
  nodeIndex: number;
  nodes: Node[];
  spans: HTMLSpanElement[];
}

function splitChars(
  text: string,
  options: SplitTextOptions,
  charIndexOffset = 0,
): HTMLSpanElement[] {
  const chars = segmentChars(text, options);
  return chars.map((char, i) => createWrapper(char, 'chars', i + charIndexOffset, options));
}

function splitWordsWithSpacing(
  text: string,
  options: SplitTextOptions,
  wordIndexOffset = 0,
): Pick<PreserveSegment, 'spans' | 'nodes'> {
  const wordGlue = options.wordGlue ?? 'adjacent';
  const allSegments = segmentWordsAll(text, options);
  const spans: HTMLSpanElement[] = [];
  const nodes: Node[] = [];

  if (wordGlue === 'adjacent') {
    const tokens = buildAdjacentWordTokens(allSegments);
    tokens.forEach((token, index) => {
      const span = createWrapper(token, 'words', index + wordIndexOffset, options);
      spans.push(span);
      nodes.push(span);
    });
    return { spans, nodes };
  }

  let wordIndex = wordIndexOffset;
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

function splitSentences(
  text: string,
  options: SplitTextOptions,
  sentenceIndexOffset = 0,
): HTMLSpanElement[] {
  const sentences = segmentSentences(text, options);
  return sentences.map((sentence, i) =>
    createWrapper(sentence, 'sentences', i + sentenceIndexOffset, options),
  );
}

function resolveElement(target: string | HTMLElement): HTMLElement {
  if (typeof target === 'string') {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) throw new Error(`[@wix/splittext] No element found for selector: "${target}"`);
    return el;
  }
  return target;
}

function readBorderInlineSize(entry: ResizeObserverEntry): number {
  const box = entry.borderBoxSize;
  if (box?.length) return box[0].inlineSize;
  return entry.contentRect.width;
}

function typesEqual(a: SplitType[], b: SplitType[]): boolean {
  return a.length === b.length && a.every((t, i) => t === b[i]);
}

function assertFlattenForMultiType(options: SplitTextOptions): void {
  const nested = options.nested;
  if (nested === 'preserve' || typeof nested === 'number') {
    throw new Error(
      '[@wix/splittext] Multi-type splits require nested: "flatten" (preserve mode is not supported for nested composition in v1)',
    );
  }
}

// ---------------------------------------------------------------------------
// SplitTextResultImpl
// ---------------------------------------------------------------------------

class SplitTextResultImpl implements SplitTextResult {
  readonly element: HTMLElement;
  readonly originalHTML: string;

  private _originalText!: string;
  private _splitText!: string;
  private _options!: SplitTextOptions;
  private _cache: SplitCache = {};
  private _preserveMap: Partial<Record<SplitType, PreserveSegment[]>> = {};
  private _isSplit = false;
  private _domBuilt = false;
  private _builtTypes: SplitType[] = [];

  private _resizeObserver: ResizeObserver | null = null;
  private _lastWidth = -1;

  constructor(element: HTMLElement, options: SplitTextOptions = {}) {
    this.element = element;
    this.originalHTML = element.innerHTML;
    injectBaseStyles(element.ownerDocument);
    this._init(options);
  }

  private _init(options: SplitTextOptions): void {
    this._options = options;
    this._originalText = getTextContent(this.element);
    this._splitText = getFilteredTextContent(this.element, options.ignore);

    if (options.type) {
      const types = Array.isArray(options.type) ? options.type : [options.type];
      this._buildDom(types);
    }

    if (options.autoSplit) {
      this._attachObservers();
    }
  }

  get chars(): HTMLSpanElement[] {
    if (this._domBuilt && this._builtTypes.length >= 2) return this._cache.chars ?? [];
    this._buildDom(this._resolveLazyTypes('chars'));
    return this._cache.chars ?? [];
  }

  get words(): HTMLSpanElement[] {
    if (this._domBuilt && this._builtTypes.length >= 2) return this._cache.words ?? [];
    this._buildDom(this._resolveLazyTypes('words'));
    return this._cache.words ?? [];
  }

  get lines(): HTMLSpanElement[] {
    if (this._domBuilt && this._builtTypes.length >= 2) return this._cache.lines ?? [];
    this._buildDom(this._resolveLazyTypes('lines'));
    return this._cache.lines ?? [];
  }

  get sentences(): HTMLSpanElement[] {
    if (this._domBuilt && this._builtTypes.length >= 2) return this._cache.sentences ?? [];
    this._buildDom(this._resolveLazyTypes('sentences'));
    return this._cache.sentences ?? [];
  }

  get isSplit(): boolean {
    return this._isSplit;
  }

  revert(): void {
    this._detachObservers();
    this._resetState();
  }

  private _resetState(): void {
    this.element.innerHTML = this.originalHTML;
    this._cache = {};
    this._preserveMap = {};
    this._isSplit = false;
    this._domBuilt = false;
    this._builtTypes = [];
  }

  split(optionsOverride?: SplitTextOptions): SplitTextResult {
    this._detachObservers();
    this._resetState();
    this._init({ ...this._options, ...optionsOverride });
    return this;
  }

  private _resolveLazyTypes(requested: SplitType): SplitType[] {
    const merged = this._builtTypes.length
      ? [...new Set([...this._builtTypes, requested])]
      : [requested];
    return normalizeSplitTypes(merged);
  }

  private _buildDom(types: SplitType[]): void {
    const ordered = normalizeSplitTypes(types);
    if (ordered.length === 0) return;

    if (this._domBuilt && typesEqual(this._builtTypes, ordered)) return;

    if (this._isSplit) {
      this.element.innerHTML = this.originalHTML;
      this._cache = {};
      this._preserveMap = {};
      this._isSplit = false;
    }

    if (ordered.length === 1) {
      this._buildDomSingle(ordered[0]);
    } else {
      assertFlattenForMultiType(this._options);
      this._buildDomNested(ordered);
    }

    this._domBuilt = true;
    this._builtTypes = ordered;
  }

  private _buildDomSingle(type: SplitType): void {
    if (type === 'lines') {
      this._buildDomSingleLines();
      return;
    }

    if (this._options.nested !== 'flatten') {
      this._buildDomPreserve(type as Exclude<SplitType, 'lines'>);
      return;
    }

    let nodes: Node[];
    if (type === 'chars') {
      this._cache.chars = splitChars(this._splitText, this._options);
      nodes = this._cache.chars;
    } else if (type === 'words') {
      const { spans, nodes: wordNodes } = splitWordsWithSpacing(this._splitText, this._options);
      this._cache.words = spans;
      nodes = wordNodes;
    } else {
      this._cache.sentences = splitSentences(this._splitText, this._options);
      nodes = this._cache.sentences;
    }

    this._mountFlattenNodes(nodes);
  }

  private _buildDomSingleLines(): void {
    this._cache.lines = detectLines(this.element, this._options).map((line, i) =>
      createWrapper(line, 'lines', i, this._options),
    );
    this._mountFlattenNodes(this._cache.lines);
  }

  private _buildDomNested(ordered: SplitType[]): void {
    let result: { nodes: Node[]; spansByType: Partial<Record<SplitType, HTMLSpanElement[]>> };

    if (ordered.includes('lines')) {
      if (this._isSplit) {
        this.element.innerHTML = this.originalHTML;
      }
      const lineTexts = detectLines(this.element, this._options);
      result = buildNestedFromLines(lineTexts, ordered, this._options);
    } else {
      const offsets = createIndexOffsets();
      result = buildNestedNodes(this._splitText, ordered, this._options, offsets);
    }

    this._cache = { ...result.spansByType };
    this._mountFlattenNodes(result.nodes);
  }

  private _mountFlattenNodes(nodes: Node[]): void {
    if (!nodes.length) return;

    const finalNodes = this._applyBidi(nodes, this._splitText);

    this.element.innerHTML = '';
    const innerWrapper = applyAccessibility(this.element, this._originalText, this._options);
    innerWrapper.append(...finalNodes);

    this._isSplit = true;
    this._options.onSplit?.(this);
  }

  private _buildDomPreserve(type: Exclude<SplitType, 'lines'>): void {
    const nested = this._options.nested;

    const container = this.element.ownerDocument.createElement('div');
    container.innerHTML = this.originalHTML;

    if (typeof nested === 'number') {
      flattenBeyondDepth(container, nested, this._options.ignore);
    }

    const mapping: PreserveSegment[] = [];
    const allSpans: HTMLSpanElement[] = [];
    let globalIndex = 0;
    let nodeIdx = 0;

    walkTextNodes(
      container,
      (textNode) => {
        const text = textNode.textContent ?? '';
        if (!getTextContent(textNode)) {
          nodeIdx++;
          return;
        }

        let nodeSpans: HTMLSpanElement[];
        let nodeNodes: Node[];

        if (type === 'chars') {
          nodeSpans = splitChars(text, this._options, globalIndex);
          nodeNodes = nodeSpans;
        } else if (type === 'words') {
          const { spans, nodes } = splitWordsWithSpacing(text, this._options, globalIndex);
          nodeSpans = spans;
          nodeNodes = nodes;
        } else {
          nodeSpans = splitSentences(text, this._options, globalIndex);
          nodeNodes = nodeSpans;
        }

        if (nodeSpans.length > 0) {
          mapping.push({ nodeIndex: nodeIdx, nodes: nodeNodes, spans: nodeSpans });
          allSpans.push(...nodeSpans);
          globalIndex += nodeSpans.length;
        }
        nodeIdx++;
      },
      this._options.ignore,
    );

    this._preserveMap[type] = mapping;
    if (type === 'chars') this._cache.chars = allSpans;
    else if (type === 'words') this._cache.words = allSpans;
    else this._cache.sentences = allSpans;

    this.element.innerHTML = this.originalHTML;

    if (typeof nested === 'number') {
      flattenBeyondDepth(this.element, nested, this._options.ignore);
    }

    const innerWrapper = applyAccessibility(this.element, this._originalText, this._options);

    const toReplace: Array<{ textNode: Text; seg: PreserveSegment }> = [];
    let mappingIdx = 0;
    let walkNodeIdx = 0;

    walkTextNodes(
      innerWrapper,
      (textNode) => {
        if (!getTextContent(textNode)) {
          walkNodeIdx++;
          return;
        }
        if (mappingIdx < mapping.length && mapping[mappingIdx].nodeIndex === walkNodeIdx) {
          toReplace.push({ textNode, seg: mapping[mappingIdx] });
          mappingIdx++;
        }
        walkNodeIdx++;
      },
      this._options.ignore,
    );

    for (const { textNode, seg } of toReplace) {
      const parent = textNode.parentNode!;
      for (const node of seg.nodes) {
        parent.insertBefore(node, textNode);
      }
      parent.removeChild(textNode);
    }

    if (this._options.bidiResolver) {
      const allNodes = mapping.flatMap((seg) => seg.nodes);
      const bidiNodes = this._applyBidi(allNodes, this._splitText);
      innerWrapper.innerHTML = '';
      for (const node of bidiNodes) {
        innerWrapper.appendChild(node);
      }
    }

    this._isSplit = true;
    this._options.onSplit?.(this);
  }

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

    if (nodeIndex < nodes.length && runEls.length > 0) {
      const lastRun = runEls[runEls.length - 1];
      while (nodeIndex < nodes.length) {
        (lastRun as HTMLSpanElement).appendChild(nodes[nodeIndex++]);
      }
    }

    return runEls;
  }

  private _attachObservers(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver((entries) => {
        const entry = entries.find((e) => e.target === this.element) ?? entries[0];
        if (entry) this._onResize(entry);
      });
      this._resizeObserver.observe(this.element);
    }

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => this._resplit());
    }
  }

  private _detachObservers(): void {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  private _onResize(entry: ResizeObserverEntry): void {
    const currentWidth = readBorderInlineSize(entry);
    if (Math.abs(currentWidth - this._lastWidth) < 1) return;
    this._resplit(currentWidth);
  }

  private _resplit(knownWidth?: number): void {
    if (this._builtTypes.length === 0) {
      this._lastWidth = knownWidth ?? this.element.getBoundingClientRect().width;
      return;
    }

    const types = [...this._builtTypes];
    this._resetState();
    this._originalText = getTextContent(this.element);
    this._splitText = getFilteredTextContent(this.element, this._options.ignore);
    this._buildDom(types);

    this._lastWidth = knownWidth ?? this.element.getBoundingClientRect().width;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Split the text content of `target` into animatable `<span>` wrappers.
 */
export function splitText(
  target: string | HTMLElement,
  options: SplitTextOptions = {},
): SplitTextResult {
  const element = resolveElement(target);
  return new SplitTextResultImpl(element, options);
}
