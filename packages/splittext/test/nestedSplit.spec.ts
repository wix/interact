import { describe, expect, it } from 'vitest';
import { buildNestedNodes, createIndexOffsets, normalizeSplitTypes } from '../src/nestedSplit';

describe('normalizeSplitTypes', () => {
  it('dedupes and sorts to canonical order', () => {
    expect(normalizeSplitTypes(['chars', 'words'])).toEqual(['words', 'chars']);
  });

  it('sorts lines, words, and chars', () => {
    expect(normalizeSplitTypes(['chars', 'lines', 'words'])).toEqual(['lines', 'words', 'chars']);
  });

  it('preserves canonical order when already sorted', () => {
    expect(normalizeSplitTypes(['lines', 'words', 'chars'])).toEqual(['lines', 'words', 'chars']);
  });
});

describe('buildNestedNodes', () => {
  const flattenOptions = { nested: 'flatten' as const };

  it('nests chars inside word spans', () => {
    const offsets = createIndexOffsets();
    const { nodes, spansByType } = buildNestedNodes(
      'Hello',
      ['words', 'chars'],
      flattenOptions,
      offsets,
    );

    expect(spansByType.words).toHaveLength(1);
    expect(spansByType.chars).toHaveLength(5);
    expect(nodes).toHaveLength(1);

    const wordSpan = spansByType.words![0];
    expect(wordSpan.querySelectorAll('.split-c')).toHaveLength(5);
    expect(wordSpan.classList.contains('split-w')).toBe(true);
  });

  it('returns flat word spans for words only', () => {
    const offsets = createIndexOffsets();
    const { nodes, spansByType } = buildNestedNodes(
      'Hello World',
      ['words'],
      flattenOptions,
      offsets,
    );

    expect(spansByType.words).toHaveLength(2);
    expect(spansByType.chars).toBeUndefined();
    expect(nodes).toHaveLength(2);
    expect(nodes.every((n) => (n as HTMLElement).classList?.contains('split-w'))).toBe(true);
  });

  it('keeps continuous --word-index and --char-index', () => {
    const offsets = createIndexOffsets();
    const { spansByType } = buildNestedNodes(
      'Hi there',
      ['words', 'chars'],
      flattenOptions,
      offsets,
    );

    expect(spansByType.words![0].style.getPropertyValue('--word-index')).toBe('0');
    expect(spansByType.words![1].style.getPropertyValue('--word-index')).toBe('1');
    expect(spansByType.chars![0].style.getPropertyValue('--char-index')).toBe('0');
    expect(
      spansByType.chars![spansByType.chars!.length - 1].style.getPropertyValue('--char-index'),
    ).toBe('7');
  });

  it('wordGlue none: text nodes between words, chars inside word spans', () => {
    const offsets = createIndexOffsets();
    const { nodes, spansByType } = buildNestedNodes(
      'Hi there',
      ['words', 'chars'],
      { ...flattenOptions, wordGlue: 'none' },
      offsets,
    );

    expect(spansByType.words).toHaveLength(2);
    const textNodes = nodes.filter((n) => n.nodeType === Node.TEXT_NODE);
    expect(textNodes.length).toBeGreaterThan(0);

    for (const word of spansByType.words!) {
      expect(word.querySelectorAll('.split-c').length).toBeGreaterThan(0);
    }
  });

  it('auto-sorts types before building', () => {
    const offsets = createIndexOffsets();
    const { spansByType } = buildNestedNodes(
      'Hello',
      normalizeSplitTypes(['chars', 'words']),
      flattenOptions,
      offsets,
    );

    expect(spansByType.words![0].querySelectorAll('.split-c')).toHaveLength(5);
  });
});
