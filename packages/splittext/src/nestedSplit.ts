import type { SplitTextOptions, SplitType } from './types';
import {
  segmentChars,
  segmentSentences,
  segmentWordsAll,
  buildAdjacentWordTokens,
  isWhitespaceOnly,
} from './utils';
import { createWrapper } from './wrappers';

/** Canonical coarse-to-fine order for split-type nesting. */
export const SPLIT_TYPE_ORDER: readonly SplitType[] = [
  'lines',
  'sentences',
  'words',
  'chars',
] as const;

/** Running index offsets per split type (mutated during nested builds). */
export type IndexOffsets = Record<SplitType, number>;

export function createIndexOffsets(): IndexOffsets {
  return { lines: 0, sentences: 0, words: 0, chars: 0 };
}

/**
 * Deduplicate and sort split types to canonical hierarchy order.
 * Input order is ignored.
 */
export function normalizeSplitTypes(types: SplitType[]): SplitType[] {
  const unique = [...new Set(types)];
  return SPLIT_TYPE_ORDER.filter((t) => unique.includes(t));
}

export type NestedBuildResult = {
  nodes: Node[];
  spansByType: Partial<Record<SplitType, HTMLSpanElement[]>>;
};

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
): { spans: HTMLSpanElement[]; nodes: Node[] } {
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

function concatSpansPerType(
  target: Partial<Record<SplitType, HTMLSpanElement[]>>,
  source: Partial<Record<SplitType, HTMLSpanElement[]>>,
): void {
  for (const type of SPLIT_TYPE_ORDER) {
    const added = source[type];
    if (added?.length) {
      target[type] = (target[type] ?? []).concat(added);
    }
  }
}

function nestInsideSpan(
  span: HTMLSpanElement,
  rest: SplitType[],
  options: SplitTextOptions,
  offsets: IndexOffsets,
): Partial<Record<SplitType, HTMLSpanElement[]>> {
  if (rest.length === 1 && rest[0] === 'chars') {
    return nestCharsInsideSpan(span, options, offsets);
  }

  const innerText = span.textContent ?? '';
  const inner = buildNestedNodes(innerText, rest, options, offsets);
  span.textContent = '';
  span.append(...inner.nodes);
  return inner.spansByType;
}

function buildSingleTypeNodes(
  text: string,
  type: SplitType,
  options: SplitTextOptions,
  offsets: IndexOffsets,
): NestedBuildResult {
  const spansByType: Partial<Record<SplitType, HTMLSpanElement[]>> = {};

  if (type === 'chars') {
    const spans = splitChars(text, options, offsets.chars);
    offsets.chars += spans.length;
    spansByType.chars = spans;
    return { nodes: spans, spansByType };
  }

  if (type === 'words') {
    const { spans, nodes } = splitWordsWithSpacing(text, options, offsets.words);
    offsets.words += spans.length;
    spansByType.words = spans;
    return { nodes, spansByType };
  }

  if (type === 'sentences') {
    const spans = splitSentences(text, options, offsets.sentences);
    offsets.sentences += spans.length;
    spansByType.sentences = spans;
    return { nodes: spans, spansByType };
  }

  return { nodes: [], spansByType };
}

function nestCharsInsideSpan(
  span: HTMLSpanElement,
  options: SplitTextOptions,
  offsets: IndexOffsets,
): Partial<Record<SplitType, HTMLSpanElement[]>> {
  const innerText = span.textContent ?? '';
  const charSpans = splitChars(innerText, options, offsets.chars);
  offsets.chars += charSpans.length;
  span.textContent = '';
  span.append(...charSpans);
  return { chars: charSpans };
}

/**
 * Build a nested DOM fragment for `text` at the given canonical `types` list.
 * `lines` must be handled at element level — do not pass `lines` here.
 */
export function buildNestedNodes(
  text: string,
  types: SplitType[],
  options: SplitTextOptions,
  offsets: IndexOffsets,
): NestedBuildResult {
  const withoutLines = types.filter((t) => t !== 'lines');
  if (withoutLines.length === 0) {
    return { nodes: [], spansByType: {} };
  }

  if (withoutLines.length === 1) {
    return buildSingleTypeNodes(text, withoutLines[0], options, offsets);
  }

  const outer = withoutLines[0];
  const rest = withoutLines.slice(1);
  const spansByType: Partial<Record<SplitType, HTMLSpanElement[]>> = {};
  const nodes: Node[] = [];

  if (outer === 'sentences') {
    const sentenceSpans = splitSentences(text, options, offsets.sentences);
    offsets.sentences += sentenceSpans.length;
    spansByType.sentences = sentenceSpans;

    for (const sentenceSpan of sentenceSpans) {
      concatSpansPerType(spansByType, nestInsideSpan(sentenceSpan, rest, options, offsets));
    }
    nodes.push(...sentenceSpans);
    return { nodes, spansByType };
  }

  if (outer === 'words') {
    const { spans, nodes: wordNodes } = splitWordsWithSpacing(text, options, offsets.words);
    offsets.words += spans.length;
    spansByType.words = spans;

    for (const node of wordNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        nodes.push(node);
        continue;
      }

      const wordSpan = node as HTMLSpanElement;
      concatSpansPerType(spansByType, nestInsideSpan(wordSpan, rest, options, offsets));
      nodes.push(wordSpan);
    }
    return { nodes, spansByType };
  }

  return buildSingleTypeNodes(text, outer, options, offsets);
}

/**
 * Build nested nodes for each detected line string, wrapping with line spans.
 */
export function buildNestedFromLines(
  lineTexts: string[],
  types: SplitType[],
  options: SplitTextOptions,
): NestedBuildResult {
  const typesWithoutLines = types.filter((t) => t !== 'lines');
  const offsets = createIndexOffsets();
  const spansByType: Partial<Record<SplitType, HTMLSpanElement[]>> = {};
  const nodes: Node[] = [];

  for (const lineText of lineTexts) {
    const lineSpan = createWrapper(lineText, 'lines', offsets.lines, options);
    offsets.lines += 1;
    spansByType.lines = (spansByType.lines ?? []).concat(lineSpan);

    const inner = buildNestedNodes(lineText, typesWithoutLines, options, offsets);
    lineSpan.textContent = '';
    lineSpan.append(...inner.nodes);
    concatSpansPerType(spansByType, inner.spansByType);
    nodes.push(lineSpan);
  }

  return { nodes, spansByType };
}
