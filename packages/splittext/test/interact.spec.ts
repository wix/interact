import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { splitTextResolver } from '../src/interact';
import type { SplitTextResolverContext } from '../src/interact';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Append a div with given innerHTML to document.body and return it (the split root). */
function root(html: string): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
  return div;
}

function ctx(overrides: Partial<SplitTextResolverContext> = {}): SplitTextResolverContext {
  return { key: 'el-1', ...overrides };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('splitTextResolver', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('resolve', () => {
    it('splits the container eagerly into wrapper spans', () => {
      const el = root('<p class="title">Hello World</p>');

      splitTextResolver.resolve(el, { container: '.title', type: 'chars' }, ctx());

      expect(el.querySelectorAll('.split-c').length).toBeGreaterThan(0);
    });

    it('maps config → splitText options (wrapperClass, wrapperAttrs)', () => {
      const el = root('<p class="title">Hi</p>');

      splitTextResolver.resolve(
        el,
        {
          container: '.title',
          type: 'chars',
          wrapperClass: 'my-char',
          wrapperAttrs: { 'data-test': 'x' },
        },
        ctx(),
      );

      const span = el.querySelector('.split-c.my-char');
      expect(span).toBeTruthy();
      expect(span?.getAttribute('data-test')).toBe('x');
    });

    it('is idempotent — a second resolve on the same container is a no-op', () => {
      const el = root('<p class="title">Hello</p>');

      splitTextResolver.resolve(el, { container: '.title', type: 'chars' }, ctx());
      const afterFirst = el.querySelector('.title')!.innerHTML;

      // Even with a different type, the WeakMap re-entrancy guard prevents re-splitting.
      splitTextResolver.resolve(el, { container: '.title', type: 'words' }, ctx());

      expect(el.querySelector('.title')!.innerHTML).toBe(afterFirst);
    });

    it('warns (without throwing) when the container is not found', () => {
      const el = root('<p class="title">Hello</p>');
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() =>
        splitTextResolver.resolve(el, { container: '.missing', type: 'chars' }, ctx()),
      ).not.toThrow();

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('not found'));
    });

    it('does not call context.onResplit for the initial (synchronous) split', () => {
      const el = root('<p class="title">Hello</p>');
      const onResplit = vi.fn();

      splitTextResolver.resolve(el, { container: '.title', type: 'chars' }, ctx({ onResplit }));

      expect(onResplit).not.toHaveBeenCalled();
    });
  });

  describe('revert', () => {
    it('restores the container to its original content', () => {
      const el = root('<p class="title">Hello World</p>');
      const original = el.querySelector('.title')!.innerHTML;

      splitTextResolver.resolve(el, { container: '.title', type: 'chars' }, ctx());
      expect(el.querySelector('.split-c')).toBeTruthy();

      splitTextResolver.revert(el, '.title');

      expect(el.querySelector('.split-c')).toBeFalsy();
      expect(el.querySelector('.title')!.innerHTML).toBe(original);
    });

    it('is a no-op for a container that was never split', () => {
      const el = root('<p class="title">Hello</p>');

      expect(() => splitTextResolver.revert(el, '.title')).not.toThrow();
      expect(() => splitTextResolver.revert(el, '.missing')).not.toThrow();
    });

    it('allows re-splitting after revert (clears the WeakMap entry)', () => {
      const el = root('<p class="title">Hello</p>');

      splitTextResolver.resolve(el, { container: '.title', type: 'chars' }, ctx());
      splitTextResolver.revert(el, '.title');
      splitTextResolver.resolve(el, { container: '.title', type: 'words' }, ctx());

      expect(el.querySelectorAll('.split-w').length).toBeGreaterThan(0);
    });
  });
});
