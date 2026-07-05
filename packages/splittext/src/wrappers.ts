import type { SplitTextOptions, SplitType } from './types';

/** Default CSS class suffix per split type. */
const DEFAULT_CLASS: Record<SplitType, string> = {
  chars: 'split-c',
  words: 'split-w',
  lines: 'split-l',
  sentences: 'split-s',
};

/** Long-form CSS custom property name per split type. */
const INDEX_PROP: Record<SplitType, string> = {
  chars: '--char-index',
  words: '--word-index',
  lines: '--line-index',
  sentences: '--sentence-index',
};

const SPLIT_TYPE_KEYS = new Set<string>(['chars', 'words', 'lines', 'sentences']);

/**
 * Return `true` when `obj` is a per-type config object whose top-level keys
 * are split-type names (`chars`, `words`, `lines`, `sentences`). This lets
 * us distinguish `{ chars: 'my-class' }` (per-type) from
 * `{ opacity: '0' }` (global CSS style object).
 */
function isPerTypeConfig(obj: object): boolean {
  return Object.keys(obj).some((k) => SPLIT_TYPE_KEYS.has(k));
}

/**
 * Resolve a global-or-per-type wrapper option to the value for a given type.
 *
 * When the option is a plain object whose keys include at least one split-type
 * key, it is treated as a per-type config and the value for `type` is returned
 * (or `undefined` if that type is not in the config). Otherwise the whole
 * value is returned as a global option that applies to all types.
 */
export function resolveWrapperOption<T>(
  option: T | Partial<Record<SplitType, T>> | undefined,
  type: SplitType,
): T | undefined {
  if (option == null) return undefined;
  if (typeof option === 'object' && !Array.isArray(option) && isPerTypeConfig(option as object)) {
    return (option as Partial<Record<SplitType, T>>)[type];
  }
  return option as T;
}

/**
 * Create a wrapper `<span>` for a single split item.
 *
 * @param content - Text string or a child `Node` to place inside the span.
 * @param type    - Split category (`chars`, `words`, `lines`, `sentences`).
 * @param index   - Zero-based position within the type's collection.
 * @param options - The parent `splitText` options.
 */
export function createWrapper(
  content: string | Node,
  type: SplitType,
  index: number,
  options: SplitTextOptions,
): HTMLSpanElement {
  const span = document.createElement('span');

  // Default class
  span.classList.add(DEFAULT_CLASS[type]);

  // Custom class(es)
  const customClass = resolveWrapperOption<string>(options.wrapperClass, type);
  if (customClass) {
    const classes = customClass.split(' ').filter(Boolean);
    if (classes.length) span.classList.add(...classes);
  }

  // Custom inline styles
  const customStyle = resolveWrapperOption<Partial<CSSStyleDeclaration>>(
    options.wrapperStyle,
    type,
  );
  if (customStyle) {
    Object.assign(span.style, customStyle);
  }

  // Custom attributes
  const customAttrs = resolveWrapperOption<Record<string, string>>(options.wrapperAttrs, type);
  if (customAttrs) {
    for (const [key, value] of Object.entries(customAttrs)) {
      span.setAttribute(key, value);
    }
  }

  // CSS custom property for animation sequencing
  if (options.partIndexing !== false) {
    span.style.setProperty(INDEX_PROP[type], String(index));
  }

  const isStringContent = typeof content === 'string';
  const contentAttribute = options.contentAttribute ?? 'both';
  const supportsContentAttr = type === 'chars' || type === 'words';

  if (isStringContent) {
    if (supportsContentAttr && contentAttribute !== 'none') {
      span.setAttribute('data-content', content);
    }
    if (!supportsContentAttr || contentAttribute !== 'attribute-only') {
      span.textContent = content;
    }
  } else {
    span.appendChild(content);
  }

  return span;
}

const BASE_CSS = `
.split-c, .split-w, .split-s {
  display: inline-block;
  white-space: pre;
}
.split-l {
  display: block;
}
[aria-hidden="true"][data-splittext-wrapper] {
  display: contents;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: clip;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`.trim();

/**
 * Inject the package's base stylesheet once per document.
 *
 * Prefers `adoptedStyleSheets` (Constructable Stylesheets API) for efficiency.
 * Falls back to a `<style>` element for environments that don't support it
 * (e.g. older jsdom versions used in tests).
 */
export function injectBaseStyles(doc: Document = document): void {
  // Guard: only inject once per document
  const marker = '__splittext_styles__';
  if ((doc as unknown as Record<string, boolean>)[marker]) return;
  (doc as unknown as Record<string, boolean>)[marker] = true;

  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(BASE_CSS);
    doc.adoptedStyleSheets.push(sheet);
  } catch {
    // Fallback for environments without Constructable Stylesheets (e.g. jsdom)
    const style = doc.createElement('style');
    style.textContent = BASE_CSS;
    (doc.head ?? doc.documentElement)?.appendChild(style);
  }
}
