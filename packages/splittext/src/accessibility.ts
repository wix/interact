import type { SplitTextOptions } from './types';

export const WRAPPER_ATTR = 'data-splittext-wrapper';
export const SR_ONLY_ATTR = 'data-splittext-sr';

/**
 * Wrap all current children of `container` in an `aria-hidden` inner div and
 * add a screen-reader-accessible copy of the original text.
 *
 * DOM structure produced when `aria: 'auto'` and `preserveText: true`:
 *
 * ```html
 * <container>
 *   <span class="sr-only" data-splittext-sr>Original text</span>
 *   <div aria-hidden="true" data-splittext-wrapper>
 *     <!-- split spans -->
 *   </div>
 * </container>
 * ```
 *
 * When `preserveText` is `false`, `aria-label` is set on the container
 * instead of injecting the visually-hidden span.
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

  if (aria === 'none') {
    // No ARIA changes — return a transparent fragment wrapper so callers
    // still have a consistent element to append split spans to.
    const passthrough = document.createElement('div');
    passthrough.setAttribute(WRAPPER_ATTR, '');
    while (container.firstChild) {
      passthrough.appendChild(container.firstChild);
    }
    container.appendChild(passthrough);
    return passthrough;
  }

  // aria === 'auto'
  const preserveText = options.preserveText !== false;

  const inner = document.createElement('div');
  inner.setAttribute('aria-hidden', 'true');
  inner.setAttribute(WRAPPER_ATTR, '');

  // Move existing children into the hidden wrapper
  while (container.firstChild) {
    inner.appendChild(container.firstChild);
  }

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
 * Remove accessibility structures added by `applyAccessibility`, restoring
 * the container to its original state (only the inner wrapper is dealt with —
 * the caller is responsible for restoring `innerHTML` via `originalHTML`).
 */
export function removeAccessibility(container: HTMLElement): void {
  container.removeAttribute('aria-label');

  const srOnly = container.querySelector(`[${SR_ONLY_ATTR}]`);
  if (srOnly) srOnly.remove();

  const wrapper = container.querySelector(`[${WRAPPER_ATTR}]`);
  if (wrapper) wrapper.remove();
}
