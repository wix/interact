import type { SplitTextOptions } from './types';

export const WRAPPER_ATTR = 'data-splittext-wrapper';
export const SR_ONLY_ATTR = 'data-splittext-sr';

/**
 * Wrap all current children of `container` in an inner div and optionally add
 * screen-reader-accessible copy of the original text.
 *
 * @param container    - The target element whose children will be wrapped.
 * @param originalText - Plain-text representation of the original content.
 * @param options      - Parent `splitText` options.
 * @returns The inner wrapper div containing the split content children.
 */
export function applyAccessibility(
  container: HTMLElement,
  originalText: string,
  options: Pick<SplitTextOptions, 'aria' | 'preserveText'>,
): HTMLDivElement {
  const aria = options.aria ?? 'auto';

  const inner = document.createElement('div');
  inner.setAttribute(WRAPPER_ATTR, '');
  if (aria !== 'none') {
    inner.setAttribute('aria-hidden', 'true');
  }
  inner.append(...container.childNodes);

  if (aria === 'none') {
    container.appendChild(inner);
    return inner;
  }

  const preserveText = options.preserveText !== false;

  if (preserveText) {
    const srSpan = document.createElement('span');
    srSpan.className = 'sr-only';
    srSpan.setAttribute(SR_ONLY_ATTR, '');
    srSpan.textContent = originalText;
    container.appendChild(srSpan);
  } else {
    container.setAttribute('aria-label', originalText);
  }

  container.appendChild(inner);
  return inner;
}

/**
 * Remove accessibility structures added by `applyAccessibility` — the
 * screen-reader span, aria-label, and inner wrapper — before restoring
 * `innerHTML` via `originalHTML`.
 */
export function removeAccessibility(container: HTMLElement): void {
  container.removeAttribute('aria-label');

  const srOnly = container.querySelector(`[${SR_ONLY_ATTR}]`);
  if (srOnly) srOnly.remove();

  const wrapper = container.querySelector(`[${WRAPPER_ATTR}]`);
  if (wrapper) wrapper.remove();
}
