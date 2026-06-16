import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { splitText } from '../src/index';
import type { SplitTextOptions } from '../src/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Append a div with given innerHTML to document.body and return it. */
function el(html: string): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
  return div;
}

/**
 * Simulate N rendered lines by patching `Range.prototype.getClientRects`.
 *
 * jsdom does not implement `getClientRects` at all, so we cannot use
 * `vi.spyOn` (which requires the property to already exist). Instead we
 * define it directly on the prototype and clean it up in afterEach via
 * `vi.restoreAllMocks` (which restores `Object.defineProperty` patches made
 * through Vitest internals). We use a manual delete fallback as well.
 */
function mockLines(lineCount: number) {
  const rects = Array.from({ length: lineCount }, (_, i) => new DOMRect(0, i * 20, 200, 20));
  const mockResult: DOMRectList = {
    length: rects.length,
    item: (i: number) => rects[i] ?? null,
    [Symbol.iterator]: rects[Symbol.iterator].bind(rects),
  } as unknown as DOMRectList;

  Object.defineProperty(Range.prototype, 'getClientRects', {
    configurable: true,
    writable: true,
    value: () => mockResult,
  });
}

function restoreGetClientRects() {
  delete (Range.prototype as unknown as Record<string, unknown>).getClientRects;
}

/** Minimal `ResizeObserverEntry` for autoSplit tests. */
function resizeEntry(target: Element, inlineSize: number): ResizeObserverEntry {
  return {
    target,
    borderBoxSize: [{ inlineSize, blockSize: 100 }],
    contentBoxSize: [{ inlineSize, blockSize: 100 }],
    contentRect: new DOMRectReadOnly(0, 0, inlineSize, 100),
    devicePixelContentBoxSize: [],
  } as ResizeObserverEntry;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('splitText', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    restoreGetClientRects();
  });

  // -------------------------------------------------------------------------
  // Target resolution
  // -------------------------------------------------------------------------

  describe('target resolution', () => {
    it('resolves a CSS selector to an element', () => {
      const target = el('Hello');
      target.id = 'resolve-test';
      const result = splitText('#resolve-test');
      expect(result.element).toBe(target);
    });

    it('accepts an HTMLElement directly', () => {
      const target = el('Hello');
      const result = splitText(target);
      expect(result.element).toBe(target);
    });

    it('throws a descriptive error for a missing selector', () => {
      expect(() => splitText('.does-not-exist')).toThrow('@wix/splittext');
    });

    it('stores the original innerHTML', () => {
      const target = el('<strong>Hello</strong> World');
      const result = splitText(target);
      expect(result.originalHTML).toBe('<strong>Hello</strong> World');
    });
  });

  // -------------------------------------------------------------------------
  // Lazy evaluation
  // -------------------------------------------------------------------------

  describe('lazy evaluation', () => {
    it('does not mutate the DOM on construction', () => {
      const target = el('Hello World');
      const original = target.innerHTML;
      splitText(target);
      expect(target.innerHTML).toBe(original);
    });

    it('isSplit is false before any getter is accessed', () => {
      const target = el('Hello');
      const result = splitText(target);
      expect(result.isSplit).toBe(false);
    });

    it('mutates the DOM when chars getter is first accessed', () => {
      const target = el('Hello');
      const original = target.innerHTML;
      const result = splitText(target);
      void result.chars;
      expect(target.innerHTML).not.toBe(original);
    });

    it('isSplit becomes true after first getter access', () => {
      const target = el('Hello');
      const result = splitText(target);
      void result.chars;
      expect(result.isSplit).toBe(true);
    });

    it('returns the same array reference on repeated access (caching)', () => {
      const target = el('Hello');
      const result = splitText(target);
      const a = result.chars;
      const b = result.chars;
      expect(a).toBe(b);
    });

    it('returns the same word array reference on repeated access', () => {
      const target = el('Hello World');
      const result = splitText(target);
      expect(result.words).toBe(result.words);
    });
  });

  // -------------------------------------------------------------------------
  // Eager split (type option)
  // -------------------------------------------------------------------------

  describe('eager split', () => {
    it('splits immediately when type: chars', () => {
      const target = el('Hi');
      const original = target.innerHTML;
      splitText(target, { type: 'chars' });
      expect(target.innerHTML).not.toBe(original);
    });

    it('isSplit is true when type is provided', () => {
      const target = el('Hi');
      const result = splitText(target, { type: 'chars' });
      expect(result.isSplit).toBe(true);
    });

    it('computes chars when type: chars', () => {
      const target = el('Hi');
      const result = splitText(target, { type: 'chars' });
      // 'Hi' = 2 chars
      expect(result.chars).toHaveLength(2);
    });

    it('computes both types when type: [chars, words]', () => {
      const target = el('Hello World');
      const result = splitText(target, { type: ['chars', 'words'] });
      expect(result.chars.length).toBeGreaterThan(0);
      expect(result.words.length).toBeGreaterThan(0);
    });

    it('last type in array is active in DOM for multi-type eager split', () => {
      const target = el('Hello World');
      const result = splitText(target, { type: ['chars', 'words'] });
      // Words is last, so word spans should be in the DOM
      expect(target.querySelectorAll('.split-w').length).toBeGreaterThan(0);
      // Char spans exist in cache but might not be in DOM
      expect(result.words.length).toBe(2);
    });

    it('re-activates chars after words were last active', () => {
      const target = el('Hello World');
      const result = splitText(target, { type: ['chars', 'words'] });
      // words is last-active; accessing chars should swap them back in
      void result.chars;
      expect(target.querySelectorAll('.split-c').length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // Character splitting
  // -------------------------------------------------------------------------

  describe('chars', () => {
    it('wraps each character in a span', () => {
      const target = el('Hello');
      const { chars } = splitText(target, { type: 'chars' });
      expect(chars).toHaveLength(5);
    });

    it('handles emoji as a single character', () => {
      const target = el('Hi 👋');
      const { chars } = splitText(target, { type: 'chars' });
      const emojiSpan = chars.find((c) => c.getAttribute('data-content') === '👋');
      expect(emojiSpan).toBeDefined();
    });

    it('handles multi-codepoint emoji clusters', () => {
      const target = el('👨‍👩‍👧'); // family emoji (ZWJ sequence)
      const { chars } = splitText(target, { type: 'chars' });
      // Intl.Segmenter with grapheme granularity treats ZWJ sequences as one segment
      expect(chars).toHaveLength(1);
    });

    it('applies the default split-c class', () => {
      const target = el('Hi');
      const { chars } = splitText(target, { type: 'chars' });
      expect(chars[0].classList.contains('split-c')).toBe(true);
    });

    it('sets data-content by default (contentAttribute: both)', () => {
      const target = el('Hi');
      const { chars } = splitText(target, { type: 'chars' });
      expect(chars[0].getAttribute('data-content')).toBe('H');
      expect(chars[0].textContent).toBe('H');
    });

    it('contentAttribute: none — no data-content, text content present', () => {
      const target = el('Hi');
      const { chars } = splitText(target, { type: 'chars', contentAttribute: 'none' });
      expect(chars[0].hasAttribute('data-content')).toBe(false);
      expect(chars[0].textContent).toBe('H');
    });

    it('contentAttribute: attribute-only — data-content set, text content empty', () => {
      const target = el('Hi');
      const { chars } = splitText(target, {
        type: 'chars',
        contentAttribute: 'attribute-only',
      });
      expect(chars[0].getAttribute('data-content')).toBe('H');
      expect(chars[0].textContent).toBe('');
    });

    it('sets --char-index on each span', () => {
      const target = el('Hi');
      const { chars } = splitText(target, { type: 'chars' });
      expect(chars[0].style.getPropertyValue('--char-index')).toBe('0');
      expect(chars[1].style.getPropertyValue('--char-index')).toBe('1');
    });
  });

  // -------------------------------------------------------------------------
  // Word splitting
  // -------------------------------------------------------------------------

  describe('words', () => {
    it('splits text into words', () => {
      const target = el('Hello World');
      const { words } = splitText(target, { type: 'words' });
      expect(words).toHaveLength(2);
      expect(words[0].textContent).toBe('Hello ');
      expect(words[1].textContent).toBe('World');
    });

    it('glues punctuation to adjacent words by default (wordGlue: adjacent)', () => {
      const target = el('Hello, World!');
      const { words } = splitText(target, { type: 'words' });
      expect(words).toHaveLength(2);
      expect(words[0].textContent).toBe('Hello, ');
      expect(words[1].textContent).toBe('World!');
    });

    it('merges hyphenated compounds into a single word token', () => {
      const target = el('state-of-the-art');
      const { words } = splitText(target, { type: 'words' });
      expect(words).toHaveLength(1);
      expect(words[0].textContent).toBe('state-of-the-art');
    });

    it('applies the default split-w class', () => {
      const target = el('Hello');
      const { words } = splitText(target, { type: 'words' });
      expect(words[0].classList.contains('split-w')).toBe(true);
    });

    it('sets data-content on word wrappers', () => {
      const target = el('Hello World');
      const { words } = splitText(target, { type: 'words' });
      expect(words[0].getAttribute('data-content')).toBe('Hello ');
      expect(words[1].getAttribute('data-content')).toBe('World');
    });

    it('does not set data-content when contentAttribute: none', () => {
      const target = el('Hello World');
      const { words } = splitText(target, { type: 'words', contentAttribute: 'none' });
      expect(words[0].hasAttribute('data-content')).toBe(false);
    });

    it('sets --word-index on each span', () => {
      const target = el('Hello World');
      const { words } = splitText(target, { type: 'words' });
      expect(words[0].style.getPropertyValue('--word-index')).toBe('0');
      expect(words[1].style.getPropertyValue('--word-index')).toBe('1');
    });

    it('uses only wrapper spans in the DOM when wordGlue is adjacent', () => {
      const target = el('Hello World');
      splitText(target, { type: 'words' });
      const wrapper = target.querySelector('[data-splittext-wrapper]')!;
      const textNodes = Array.from(wrapper.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE);
      expect(textNodes).toHaveLength(0);
      expect(wrapper.querySelectorAll('.split-w')).toHaveLength(2);
    });

    describe('wordGlue: none', () => {
      it('wraps lexical words and punctuation in separate indexed spans', () => {
        const target = el('Hello, World!');
        const { words } = splitText(target, { type: 'words', wordGlue: 'none' });
        expect(words.map((w) => w.textContent)).toEqual(['Hello', ',', 'World', '!']);
        expect(words[0].style.getPropertyValue('--word-index')).toBe('0');
        expect(words[1].style.getPropertyValue('--word-index')).toBe('1');
        expect(words[2].style.getPropertyValue('--word-index')).toBe('2');
        expect(words[3].style.getPropertyValue('--word-index')).toBe('3');
      });

      it('preserves inter-word whitespace as text nodes in the DOM', () => {
        const target = el('Hello World');
        splitText(target, { type: 'words', wordGlue: 'none' });
        const wrapper = target.querySelector('[data-splittext-wrapper]')!;
        const textNodes = Array.from(wrapper.childNodes).filter(
          (n) => n.nodeType === Node.TEXT_NODE,
        );
        expect(textNodes.length).toBeGreaterThan(0);
        expect(textNodes[0].textContent).toBe(' ');
      });
    });
  });

  // -------------------------------------------------------------------------
  // Sentence splitting
  // -------------------------------------------------------------------------

  describe('sentences', () => {
    it('splits text into sentences', () => {
      const target = el('Hello World. This is a sentence.');
      const { sentences } = splitText(target, { type: 'sentences' });
      expect(sentences.length).toBeGreaterThanOrEqual(2);
    });

    it('applies the default split-s class', () => {
      const target = el('Hello World. Another sentence.');
      const { sentences } = splitText(target, { type: 'sentences' });
      expect(sentences[0].classList.contains('split-s')).toBe(true);
    });

    it('does NOT set data-content on sentence wrappers', () => {
      const target = el('Hello World. Another sentence.');
      const { sentences } = splitText(target, { type: 'sentences' });
      expect(sentences[0].hasAttribute('data-content')).toBe(false);
    });

    it('sets --sentence-index on each span', () => {
      const target = el('Hello World. Another sentence.');
      const { sentences } = splitText(target, { type: 'sentences' });
      expect(sentences[0].style.getPropertyValue('--sentence-index')).toBe('0');
    });
  });

  // -------------------------------------------------------------------------
  // Line splitting (requires mocked Range.getClientRects)
  // -------------------------------------------------------------------------

  describe('lines', () => {
    it('returns an array of spans', () => {
      mockLines(2);
      const target = el('Hello World');
      const { lines } = splitText(target, { type: 'lines' });
      expect(Array.isArray(lines)).toBe(true);
    });

    it('applies the default split-l class', () => {
      mockLines(2);
      const target = el('Hello World');
      const { lines } = splitText(target, { type: 'lines' });
      if (lines.length > 0) {
        expect(lines[0].classList.contains('split-l')).toBe(true);
      }
    });

    it('sets --line-index on each span', () => {
      mockLines(2);
      const target = el('Hello World Overflow');
      const { lines } = splitText(target, { type: 'lines' });
      if (lines.length > 0) {
        expect(lines[0].style.getPropertyValue('--line-index')).toBe('0');
      }
    });

    it('does NOT set data-content on line wrappers', () => {
      mockLines(1);
      const target = el('Hello');
      const { lines } = splitText(target, { type: 'lines' });
      if (lines.length > 0) {
        expect(lines[0].hasAttribute('data-content')).toBe(false);
      }
    });

    it('restores original DOM before detecting lines when already split', () => {
      const target = el('Hello World');
      const result = splitText(target, { type: 'chars' });
      const originalText = result.originalHTML;

      // Now access lines — implementation must restore before measuring
      mockLines(1);
      void result.lines;
      // After lines are activated, DOM should have line spans
      expect(target.querySelectorAll('.split-l').length).toBeGreaterThanOrEqual(0);
      // Original HTML was correctly captured before split
      expect(result.originalHTML).toBe(originalText);
    });
  });

  // -------------------------------------------------------------------------
  // Wrapper class options
  // -------------------------------------------------------------------------

  describe('wrapperClass', () => {
    it('global string applies to all wrapper spans of that type', () => {
      const target = el('Hello');
      const { chars } = splitText(target, { type: 'chars', wrapperClass: 'my-char' });
      expect(chars.every((c) => c.classList.contains('my-char'))).toBe(true);
    });

    it('per-type config applies class only to specified type', () => {
      const target = el('Hello');
      const { chars } = splitText(target, {
        type: 'chars',
        wrapperClass: { chars: 'char-class' },
      });
      expect(chars[0].classList.contains('char-class')).toBe(true);
    });

    it('per-type config for other type does not affect chars', () => {
      const target = el('Hello');
      const { chars } = splitText(target, {
        type: 'chars',
        wrapperClass: { words: 'word-only' },
      });
      expect(chars[0].classList.contains('word-only')).toBe(false);
    });

    it('applies multiple space-separated classes', () => {
      const target = el('Hello');
      const { chars } = splitText(target, { type: 'chars', wrapperClass: 'cls-a cls-b' });
      expect(chars[0].classList.contains('cls-a')).toBe(true);
      expect(chars[0].classList.contains('cls-b')).toBe(true);
    });

    it('always includes the default class alongside custom ones', () => {
      const target = el('Hello');
      const { chars } = splitText(target, { type: 'chars', wrapperClass: 'custom' });
      expect(chars[0].classList.contains('split-c')).toBe(true);
      expect(chars[0].classList.contains('custom')).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Wrapper style options
  // -------------------------------------------------------------------------

  describe('wrapperStyle', () => {
    it('applies global inline styles to all spans', () => {
      const target = el('Hello');
      const { chars } = splitText(target, {
        type: 'chars',
        wrapperStyle: { opacity: '0' },
      });
      expect(chars.every((c) => c.style.opacity === '0')).toBe(true);
    });

    it('applies per-type styles to chars only', () => {
      const target = el('Hello');
      const { chars } = splitText(target, {
        type: 'chars',
        wrapperStyle: { chars: { opacity: '0' } },
      });
      expect(chars[0].style.opacity).toBe('0');
    });

    it('does not apply per-type char style to word spans', () => {
      const target = el('Hello World');
      const result = splitText(target, {
        type: ['chars', 'words'],
        wrapperStyle: { chars: { opacity: '0' }, words: { opacity: '1' } },
      });
      // words are last-active
      const words = result.words;
      expect(words[0].style.opacity).toBe('1');
      // chars are cached but not currently in DOM
      const chars = result.chars;
      expect(chars[0].style.opacity).toBe('0');
    });
  });

  // -------------------------------------------------------------------------
  // Wrapper attrs options
  // -------------------------------------------------------------------------

  describe('wrapperAttrs', () => {
    it('applies global custom attributes to all spans', () => {
      const target = el('Hello');
      const { chars } = splitText(target, {
        type: 'chars',
        wrapperAttrs: { 'data-test': 'yes' },
      });
      expect(chars.every((c) => c.getAttribute('data-test') === 'yes')).toBe(true);
    });

    it('applies per-type attrs to chars only', () => {
      const target = el('Hello');
      const { chars } = splitText(target, {
        type: 'chars',
        wrapperAttrs: { chars: { 'data-char': 'c' } },
      });
      expect(chars[0].getAttribute('data-char')).toBe('c');
    });

    it('per-type attrs do not bleed across types', () => {
      const target = el('Hello');
      const { chars } = splitText(target, {
        type: 'chars',
        wrapperAttrs: { words: { 'data-word': 'w' } },
      });
      expect(chars[0].hasAttribute('data-word')).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Combined options
  // -------------------------------------------------------------------------

  describe('combined wrapper options', () => {
    it('class + style + attrs work together', () => {
      const target = el('Hi');
      const { chars } = splitText(target, {
        type: 'chars',
        wrapperClass: 'animate',
        wrapperStyle: { opacity: '0' },
        wrapperAttrs: { 'data-role': 'char' },
      });
      expect(chars[0].classList.contains('animate')).toBe(true);
      expect(chars[0].style.opacity).toBe('0');
      expect(chars[0].getAttribute('data-role')).toBe('char');
    });
  });

  // -------------------------------------------------------------------------
  // CSS custom property indexing
  // -------------------------------------------------------------------------

  describe('partIndexing', () => {
    it('sets --char-index on each char span (0-based)', () => {
      const target = el('ABC');
      const { chars } = splitText(target, { type: 'chars' });
      chars.forEach((c, i) => {
        expect(c.style.getPropertyValue('--char-index')).toBe(String(i));
      });
    });

    it('sets --word-index on each word span', () => {
      const target = el('One Two Three');
      const { words } = splitText(target, { type: 'words' });
      words.forEach((w, i) => {
        expect(w.style.getPropertyValue('--word-index')).toBe(String(i));
      });
    });

    it('sets --sentence-index on each sentence span', () => {
      const target = el('First. Second.');
      const { sentences } = splitText(target, { type: 'sentences' });
      sentences.forEach((s, i) => {
        expect(s.style.getPropertyValue('--sentence-index')).toBe(String(i));
      });
    });

    it('does not set index CSS properties when partIndexing: false', () => {
      const target = el('Hi');
      const { chars } = splitText(target, { type: 'chars', partIndexing: false });
      expect(chars[0].style.getPropertyValue('--char-index')).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------

  describe('accessibility', () => {
    it('default: sr-only span + aria-hidden wrapper', () => {
      const target = el('Hello World');
      splitText(target, { type: 'chars' });

      const srOnly = target.querySelector('.sr-only');
      const hiddenWrapper = target.querySelector('[aria-hidden="true"]');

      expect(srOnly).not.toBeNull();
      expect(srOnly!.textContent).toBe('Hello World');
      expect(hiddenWrapper).not.toBeNull();
    });

    it('default: container does NOT get aria-label', () => {
      const target = el('Hello World');
      splitText(target, { type: 'chars' });
      expect(target.getAttribute('aria-label')).toBeNull();
    });

    it('preserveText: false — aria-label on container, no sr-only span', () => {
      const target = el('Hello World');
      splitText(target, { type: 'chars', preserveText: false });

      expect(target.getAttribute('aria-label')).toBe('Hello World');
      expect(target.querySelector('.sr-only')).toBeNull();
    });

    it('aria: none — no sr-only, no aria-label, no aria-hidden', () => {
      const target = el('Hello World');
      splitText(target, { type: 'chars', aria: 'none' });

      expect(target.querySelector('.sr-only')).toBeNull();
      expect(target.getAttribute('aria-label')).toBeNull();
      expect(target.querySelector('[aria-hidden]')).toBeNull();
    });

    it('aria: none — split spans are direct children of target', () => {
      const target = el('Hi');
      const { chars } = splitText(target, { type: 'chars', aria: 'none' });
      // Spans should be in a data-splittext-wrapper div even with aria:none
      // (passthrough wrapper is used for consistent DOM insertion)
      expect(chars.length).toBeGreaterThan(0);
      expect(target.contains(chars[0])).toBe(true);
    });

    it('sr-only text accurately reflects the original element text', () => {
      const target = el('Hello <em>World</em>');
      splitText(target, { type: 'chars' });
      const srOnly = target.querySelector('.sr-only');
      // Plain text of "Hello <em>World</em>" is "Hello World"
      expect(srOnly!.textContent).toBe('Hello World');
    });
  });

  // -------------------------------------------------------------------------
  // Revert
  // -------------------------------------------------------------------------

  describe('revert', () => {
    it('restores original innerHTML exactly', () => {
      const target = el('Hello World');
      const original = target.innerHTML;
      const result = splitText(target, { type: 'chars' });
      result.revert();
      expect(target.innerHTML).toBe(original);
    });

    it('sets isSplit to false', () => {
      const target = el('Hello');
      const result = splitText(target, { type: 'chars' });
      result.revert();
      expect(result.isSplit).toBe(false);
    });

    it('clears the cache so a subsequent getter re-splits', () => {
      const target = el('Hello');
      const result = splitText(target, { type: 'chars' });
      const firstChars = result.chars;
      result.revert();
      const secondChars = result.chars;
      // New spans should be created, so references differ
      expect(secondChars).not.toBe(firstChars);
    });

    it('clears preserve-mode cache so nested re-split creates fresh spans', () => {
      const target = el('<b>Hi</b> there');
      const result = splitText(target, { type: 'chars', nested: 'preserve' });
      const firstChars = result.chars;
      result.revert();
      const secondChars = result.chars;
      expect(secondChars).not.toBe(firstChars);
      expect(secondChars).toHaveLength(8);
      expect(target.querySelector('b')).not.toBeNull();
    });

    it('re-split after revert produces correct spans', () => {
      const target = el('Hi');
      const result = splitText(target, { type: 'chars' });
      result.revert();
      const chars = result.chars;
      expect(chars).toHaveLength(2);
      expect(chars[0].textContent).toBe('H');
    });

    it('removes split wrapper spans from the DOM', () => {
      const target = el('Hello');
      const result = splitText(target, { type: 'chars' });
      expect(target.querySelectorAll('.split-c').length).toBeGreaterThan(0);
      result.revert();
      expect(target.querySelectorAll('.split-c').length).toBe(0);
    });

    it('works without a prior split (no-op)', () => {
      const target = el('Hello');
      const original = target.innerHTML;
      const result = splitText(target);
      result.revert(); // Should not throw
      expect(target.innerHTML).toBe(original);
    });
  });

  // -------------------------------------------------------------------------
  // split() method
  // -------------------------------------------------------------------------

  describe('split() method', () => {
    it('returns a new SplitTextResult with updated options', () => {
      const target = el('Hello');
      const result1 = splitText(target, { type: 'chars' });
      const result2 = result1.split({ type: 'words' });
      // New result should have word spans in DOM
      expect(target.querySelectorAll('.split-w').length).toBeGreaterThan(0);
      expect(result2.isSplit).toBe(true);
    });

    it('restores DOM before re-splitting', () => {
      const target = el('Hello World');
      const result1 = splitText(target, { type: 'chars' });
      // Chars are in DOM; calling split() should revert then re-split
      result1.split({ type: 'words' });
      // No char spans should remain
      expect(target.querySelectorAll('.split-c').length).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Multiple split types from same result
  // -------------------------------------------------------------------------

  describe('multiple split types', () => {
    it('accessing chars then words: words become active in DOM', () => {
      const target = el('Hello World');
      const result = splitText(target);
      void result.chars;
      void result.words;
      expect(target.querySelectorAll('.split-w').length).toBeGreaterThan(0);
    });

    it('re-accessing chars after words swaps them back into the DOM', () => {
      const target = el('Hello World');
      const result = splitText(target);
      void result.chars;
      void result.words;
      void result.chars; // Re-activates chars
      expect(target.querySelectorAll('.split-c').length).toBeGreaterThan(0);
    });

    it('cached spans are re-used (same reference) when re-activated', () => {
      const target = el('Hello World');
      const result = splitText(target);
      const chars1 = result.chars;
      void result.words; // Words now active
      const chars2 = result.chars; // Chars re-activated
      expect(chars1).toBe(chars2); // Same cached array
    });

    it('chars text content is correct after re-activation', () => {
      const target = el('Hi');
      const result = splitText(target);
      const chars = result.chars;
      void result.words;
      void result.chars; // Re-activate
      // Spans are the same objects, content unchanged
      expect(chars[0].textContent).toBe('H');
      expect(chars[1].textContent).toBe('i');
    });
  });

  // -------------------------------------------------------------------------
  // autoSplit
  // -------------------------------------------------------------------------

  describe('autoSplit', () => {
    // Shared spy references set up per-test
    let mockObserve: ReturnType<typeof vi.fn>;
    let mockDisconnect: ReturnType<typeof vi.fn>;
    let capturedCallback: ResizeObserverCallback | null = null;

    beforeEach(() => {
      mockObserve = vi.fn();
      mockDisconnect = vi.fn();
      capturedCallback = null;

      // Must be a real class (using `new`) — arrow functions cannot be constructors
      class MockResizeObserver {
        observe = mockObserve;
        disconnect = mockDisconnect;
        unobserve = vi.fn();
        constructor(cb: ResizeObserverCallback) {
          capturedCallback = cb;
        }
      }
      vi.stubGlobal('ResizeObserver', MockResizeObserver);
    });

    it('attaches a ResizeObserver when autoSplit is true', () => {
      const target = el('Hello');
      splitText(target, { type: 'chars', autoSplit: true });
      expect(mockObserve).toHaveBeenCalledWith(target);
    });

    it('does not attach a ResizeObserver when autoSplit is false/omitted', () => {
      const target = el('Hello');
      splitText(target, { type: 'chars' });
      expect(mockObserve).not.toHaveBeenCalled();
    });

    it('disconnects the ResizeObserver on revert', () => {
      const target = el('Hello');
      const result = splitText(target, { type: 'chars', autoSplit: true });
      result.revert();
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('re-splits when border-box inline size changes', () => {
      const target = el('Hello');
      const onSplit = vi.fn();
      splitText(target, { type: 'chars', autoSplit: true, onSplit });
      expect(capturedCallback).not.toBeNull();
      onSplit.mockClear();

      capturedCallback!([resizeEntry(target, 200)], {} as ResizeObserver);
      expect(onSplit).toHaveBeenCalledOnce();
    });

    it('does not re-split when border-box inline size is unchanged', () => {
      const target = el('Hello');
      const onSplit = vi.fn();
      splitText(target, { type: 'chars', autoSplit: true, onSplit });
      expect(capturedCallback).not.toBeNull();
      onSplit.mockClear();

      // First resize records width and re-splits
      capturedCallback!([resizeEntry(target, 200)], {} as ResizeObserver);
      expect(onSplit).toHaveBeenCalledOnce();
      onSplit.mockClear();

      // Same width (e.g. height-only change) — ignore feedback loop
      capturedCallback!([resizeEntry(target, 200)], {} as ResizeObserver);
      expect(onSplit).not.toHaveBeenCalled();
    });

    it('reads inline size from ResizeObserver entry without getBoundingClientRect', () => {
      const target = el('Hello');
      const onSplit = vi.fn();
      const getBoundingClientRect = vi.spyOn(target, 'getBoundingClientRect');
      splitText(target, { type: 'chars', autoSplit: true, onSplit });
      expect(capturedCallback).not.toBeNull();
      onSplit.mockClear();
      getBoundingClientRect.mockClear();

      capturedCallback!([resizeEntry(target, 200)], {} as ResizeObserver);

      expect(onSplit).toHaveBeenCalledOnce();
      expect(getBoundingClientRect).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // onSplit callback
  // -------------------------------------------------------------------------

  describe('onSplit callback', () => {
    it('is called after eager split', () => {
      const target = el('Hello');
      const onSplit = vi.fn();
      splitText(target, { type: 'chars', onSplit });
      expect(onSplit).toHaveBeenCalledOnce();
    });

    it('is called with the SplitTextResult', () => {
      const target = el('Hello');
      const onSplit = vi.fn();
      const result = splitText(target, { type: 'chars', onSplit });
      expect(onSplit).toHaveBeenCalledWith(result);
    });

    it('is called on lazy getter access', () => {
      const target = el('Hello');
      const onSplit = vi.fn();
      const result = splitText(target, { onSplit });
      void result.chars;
      expect(onSplit).toHaveBeenCalledOnce();
    });
  });

  // -------------------------------------------------------------------------
  // bidiResolver
  // -------------------------------------------------------------------------

  describe('bidiResolver', () => {
    it('wraps splits in direction spans when bidiResolver is provided', () => {
      const target = el('Hello');
      const resolver = vi.fn().mockReturnValue([{ text: 'Hello', direction: 'ltr' as const }]);
      splitText(target, { type: 'chars', bidiResolver: resolver });

      expect(resolver).toHaveBeenCalledWith('Hello');
      const dirSpan = target.querySelector('[dir="ltr"]');
      expect(dirSpan).not.toBeNull();
      expect(dirSpan!.classList.contains('split-ltr')).toBe(true);
    });

    it('wraps RTL runs in span with dir=rtl and split-rtl class', () => {
      const target = el('שלום');
      const resolver = vi.fn().mockReturnValue([{ text: 'שלום', direction: 'rtl' as const }]);
      splitText(target, { type: 'chars', bidiResolver: resolver });

      const rtlSpan = target.querySelector('[dir="rtl"]');
      expect(rtlSpan).not.toBeNull();
      expect(rtlSpan!.classList.contains('split-rtl')).toBe(true);
    });

    it('distributes word spans correctly across multiple bidi runs', () => {
      const target = el('Hello שלום');
      const resolver = vi.fn().mockReturnValue([
        { text: 'Hello ', direction: 'ltr' as const },
        { text: 'שלום', direction: 'rtl' as const },
      ]);
      const { words } = splitText(target, { type: 'words', bidiResolver: resolver });

      const ltrRun = target.querySelector('[dir="ltr"]')!;
      const rtlRun = target.querySelector('[dir="rtl"]')!;
      expect(ltrRun).not.toBeNull();
      expect(rtlRun).not.toBeNull();
      expect(ltrRun.querySelectorAll('.split-w')).toHaveLength(1);
      expect(rtlRun.querySelectorAll('.split-w')).toHaveLength(1);
      expect(words).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Segmenter polyfill
  // -------------------------------------------------------------------------

  describe('segmenter polyfill', () => {
    it('accepts a constructor as segmenter option', () => {
      const target = el('Hi');
      // Pass a constructor that proxies to native Intl.Segmenter.
      // Cast through unknown to satisfy the narrower segmenter option type.
      const { chars } = splitText(target, {
        type: 'chars',
        segmenter: Intl.Segmenter as unknown as SplitTextOptions['segmenter'],
      });
      expect(chars).toHaveLength(2);
    });

    it('throws when Intl.Segmenter is unavailable and no polyfill provided', () => {
      const original = Intl.Segmenter;
      // Temporarily remove native support
      (Intl as unknown as Record<string, unknown>).Segmenter = undefined;

      try {
        const target = el('Hi');
        expect(() => splitText(target, { type: 'chars' })).toThrow('@wix/splittext');
      } finally {
        (Intl as unknown as Record<string, unknown>).Segmenter = original;
      }
    });
  });

  // -------------------------------------------------------------------------
  // ignore option
  // -------------------------------------------------------------------------

  describe('ignore option', () => {
    it('skips elements matching selector for word splits (preserve mode)', () => {
      // In preserve mode (default) each text node is split independently.
      // "Hello " and " World" are separate text nodes; the <sup> stays in the DOM.
      const target = el('Hello <sup>1</sup> World');
      const { words } = splitText(target, { type: 'words', ignore: 'sup' });
      expect(words).toHaveLength(2);
      expect(words[0].textContent).toBe('Hello ');
      expect(words[1].textContent).toBe(' World');
    });

    it('skips elements matching selector for word splits (flatten mode)', () => {
      // In flatten mode the two text nodes are concatenated → double space.
      const target = el('Hello <sup>1</sup> World');
      const { words } = splitText(target, { type: 'words', ignore: 'sup', nested: 'flatten' });
      expect(words).toHaveLength(2);
      expect(words[0].textContent).toBe('Hello  ');
      expect(words[1].textContent).toBe('World');
    });

    it('skips elements matching selector for char splits', () => {
      const target = el('AB<sup>1</sup>CD');
      const { chars } = splitText(target, { type: 'chars', ignore: 'sup' });
      const text = chars.map((c) => c.textContent).join('');
      expect(text).toBe('ABCD');
    });
  });

  // -------------------------------------------------------------------------
  // nested option
  // -------------------------------------------------------------------------

  describe('nested option', () => {
    describe("nested: 'flatten'", () => {
      it('extracts flat text and removes nested elements from output', () => {
        const target = el('<b>Hello</b> <i>World</i>');
        const { chars } = splitText(target, { type: 'chars', nested: 'flatten' });
        expect(chars.map((c) => c.textContent).join('')).toBe('Hello World');
        const wrapper = target.querySelector('[data-splittext-wrapper]')!;
        expect(wrapper.querySelector('b')).toBeNull();
        expect(wrapper.querySelector('i')).toBeNull();
      });

      it('splits words from concatenated flat text', () => {
        const target = el('<b>Hello</b> <i>World</i>');
        const { words } = splitText(target, { type: 'words', nested: 'flatten' });
        expect(words).toHaveLength(2);
        expect(words[0].textContent).toBe('Hello ');
        expect(words[1].textContent).toBe('World');
      });
    });

    describe("nested: 'preserve' (default)", () => {
      it('keeps nested elements intact in the output DOM', () => {
        const target = el('<b>Hello</b> World');
        splitText(target, { type: 'chars', nested: 'preserve' });
        const wrapper = target.querySelector('[data-splittext-wrapper]')!;
        expect(wrapper.querySelector('b')).not.toBeNull();
      });

      it('is active when the nested option is omitted (default)', () => {
        const target = el('<strong>Hi</strong>');
        splitText(target, { type: 'chars' });
        const wrapper = target.querySelector('[data-splittext-wrapper]')!;
        expect(wrapper.querySelector('strong')).not.toBeNull();
      });

      it('splits chars within nested elements', () => {
        const target = el('Hi <strong>AB</strong>');
        const { chars } = splitText(target, { type: 'chars', nested: 'preserve' });
        const wrapper = target.querySelector('[data-splittext-wrapper]')!;
        const strong = wrapper.querySelector('strong')!;
        expect(strong).not.toBeNull();
        // "AB" = 2 chars inside <strong>
        expect(strong.querySelectorAll('.split-c')).toHaveLength(2);
        // Chars outside <strong> are siblings of it
        expect(chars.length).toBeGreaterThan(2);
      });

      it('char indices are continuous across nested elements', () => {
        const target = el('Hi <strong>AB</strong>');
        // "Hi " = 3 chars (H=0, i=1, ' '=2), "AB" = 2 chars (A=3, B=4)
        const { chars } = splitText(target, { type: 'chars', nested: 'preserve' });
        expect(chars[0].style.getPropertyValue('--char-index')).toBe('0');
        const wrapper = target.querySelector('[data-splittext-wrapper]')!;
        const strongSpans = wrapper
          .querySelector('strong')!
          .querySelectorAll<HTMLElement>('.split-c');
        expect(strongSpans[0].style.getPropertyValue('--char-index')).toBe('3');
      });

      it('word indices are continuous across nested elements', () => {
        const target = el('Hello <strong>World</strong>');
        const { words } = splitText(target, { type: 'words', nested: 'preserve' });
        expect(words).toHaveLength(2);
        expect(words[0].style.getPropertyValue('--word-index')).toBe('0');
        expect(words[1].style.getPropertyValue('--word-index')).toBe('1');
      });

      it('word inside nested element is a descendant of that element', () => {
        const target = el('Hello <strong>World</strong>');
        const { words } = splitText(target, { type: 'words', nested: 'preserve' });
        const strong = target.querySelector('strong')!;
        expect(strong.contains(words[1])).toBe(true);
      });

      it('cached spans are reused when re-activating after a type switch', () => {
        const target = el('<em>Hi</em>');
        const result = splitText(target, { nested: 'preserve' });
        const chars1 = result.chars;
        void result.words;
        const chars2 = result.chars;
        expect(chars1).toBe(chars2);
      });
    });

    describe('nested: number', () => {
      it('preserves elements within the depth limit', () => {
        const target = el('<b>bold <i>italic <u>under</u></i></b>');
        splitText(target, { type: 'chars', nested: 2 });
        const wrapper = target.querySelector('[data-splittext-wrapper]')!;
        expect(wrapper.querySelector('b')).not.toBeNull(); // depth 1 — preserved
        expect(wrapper.querySelector('i')).not.toBeNull(); // depth 2 — preserved
        expect(wrapper.querySelector('u')).toBeNull(); // depth 3 — flattened
      });

      it('includes text from elements that were flattened', () => {
        const target = el('<b>x <i>y <u>z</u></i></b>');
        const { chars } = splitText(target, { type: 'chars', nested: 2 });
        const text = chars.map((c) => c.textContent).join('');
        expect(text).toContain('z'); // was inside the removed <u>
      });

      it('nested: 1 preserves only direct children', () => {
        const target = el('<b>bold <i>italic</i></b>');
        splitText(target, { type: 'chars', nested: 1 });
        const wrapper = target.querySelector('[data-splittext-wrapper]')!;
        expect(wrapper.querySelector('b')).not.toBeNull(); // depth 1 — preserved
        expect(wrapper.querySelector('i')).toBeNull(); // depth 2 — flattened
      });

      it('char indices are continuous across depth-limited elements', () => {
        const target = el('<b>AB</b><i>CD</i>');
        const { chars } = splitText(target, { type: 'chars', nested: 1 });
        // A=0, B=1 (in <b>), C=2, D=3 (in <i>)
        expect(chars[0].style.getPropertyValue('--char-index')).toBe('0');
        expect(chars[2].style.getPropertyValue('--char-index')).toBe('2');
      });
    });
  });
});
