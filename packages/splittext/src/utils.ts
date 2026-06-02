import type { SplitTextOptions } from './types';

/**
 * Resolve `Intl.Segmenter` constructor from the `segmenter` option or the
 * global. Throws a descriptive error when neither is available.
 */
function resolveSegmenterCtor(option: SplitTextOptions['segmenter']): typeof Intl.Segmenter {
  // Option is already a constructor (has `prototype.segment`)
  if (typeof option === 'function') {
    return option as unknown as typeof Intl.Segmenter;
  }

  // Option is a pre-constructed instance — extract its constructor
  if (option != null && typeof (option as Intl.Segmenter).segment === 'function') {
    return option.constructor as unknown as typeof Intl.Segmenter;
  }

  // Fall back to native global
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    return Intl.Segmenter;
  }

  throw new Error(
    '[@wix/splittext] Intl.Segmenter is not available in this environment. ' +
      'Provide a polyfill via the `segmenter` option or install one that ' +
      'patches the global (e.g. `@formatjs/intl-segmenter`).',
  );
}

/**
 * Resolve the best available locale for Intl.Segmenter.
 * An empty string `''` is not a valid BCP 47 tag in all runtimes; fall back
 * to `'en'` when locale detection is unavailable.
 */
function resolveLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || 'en';
  } catch {
    return 'en';
  }
}

/**
 * Segment `text` into grapheme clusters (characters), respecting emoji and
 * multi-codepoint sequences.
 */
export function segmentChars(
  text: string,
  options: Pick<SplitTextOptions, 'segmenter'> = {},
): string[] {
  const Ctor = resolveSegmenterCtor(options.segmenter);
  const segmenter = new Ctor(resolveLocale(), { granularity: 'grapheme' });
  return Array.from(segmenter.segment(text), (s) => s.segment);
}

/**
 * Segment `text` into word tokens, filtering punctuation/whitespace-only
 * segments via `isWordLike`.
 */
export function segmentWords(
  text: string,
  options: Pick<SplitTextOptions, 'segmenter'> = {},
): string[] {
  const Ctor = resolveSegmenterCtor(options.segmenter);
  const segmenter = new Ctor(resolveLocale(), { granularity: 'word' });
  return Array.from(segmenter.segment(text))
    .filter((s) => s.isWordLike)
    .map((s) => s.segment);
}

/**
 * Segment `text` into sentences using `Intl.Segmenter` with
 * `granularity: 'sentence'`.
 */
export function segmentSentences(
  text: string,
  options: Pick<SplitTextOptions, 'segmenter'> = {},
): string[] {
  const Ctor = resolveSegmenterCtor(options.segmenter);
  const segmenter = new Ctor(resolveLocale(), { granularity: 'sentence' });
  return Array.from(segmenter.segment(text), (s) => s.segment.trim()).filter(Boolean);
}

/**
 * Walk all text node descendants of `root`, invoking `callback` for each.
 * Skips `<script>`, `<style>`, and elements matched by the `ignore` option.
 * Enforces a max-depth safety limit to prevent infinite loops on pathological
 * DOM trees.
 */
export function walkTextNodes(
  root: HTMLElement,
  callback: (node: Text) => void,
  ignoreOption?: SplitTextOptions['ignore'],
  maxDepth = 10,
): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tag = el.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style') return NodeFilter.FILTER_REJECT;

        if (ignoreOption) {
          if (Array.isArray(ignoreOption)) {
            if (ignoreOption.some((sel) => el.matches(sel))) return NodeFilter.FILTER_REJECT;
          } else if (ignoreOption(node)) {
            return NodeFilter.FILTER_REJECT;
          }
        }
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let depth = 0;
  let current = walker.nextNode();
  while (current && depth < maxDepth * 100) {
    if (current.nodeType === Node.TEXT_NODE) {
      callback(current as Text);
    }
    current = walker.nextNode();
    depth++;
  }
}

/**
 * Return the plain text content of `element`. Equivalent to
 * `element.textContent` but strips leading/trailing whitespace from
 * the result.
 */
export function getTextContent(element: HTMLElement): string {
  return (element.textContent ?? '').trim();
}
