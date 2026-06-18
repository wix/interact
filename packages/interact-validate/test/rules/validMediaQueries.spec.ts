import { afterEach, describe, expect, it, vi } from 'vitest';
import { validateInteractConfig } from '../../src';

// jsdom defines window.matchMedia but its stub returns `media: ''` for all
// queries because jsdom does not implement CSS parsing. Provide a minimal
// replacement so the rule behaves like a real browser:
//  - known-valid queries get back their own string as `media` (truthy → valid)
//  - everything else gets back `''` (falsy → invalid)
function stubMatchMedia(validQueries: string[]) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    media: validQueries.includes(q.trim()) ? q.trim() : '',
    matches: false,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// Helper: a config that references the named condition so no UNUSED_CONDITION fires.
function configWithCondition(
  id: string,
  predicate?: string,
  type: 'media' | 'container' | 'selector' = 'media',
) {
  return {
    conditions: { [id]: { type, predicate: predicate || '' } },
    interactions: [
      {
        key: 'el',
        trigger: 'viewEnter' as const,
        conditions: [id],
        effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
      },
    ],
  };
}

describe('validMediaQueries — INVALID_MEDIA_QUERY', () => {
  it('emits no errors for a syntactically valid media query', () => {
    stubMatchMedia(['(min-width: 768px)']);
    const result = validateInteractConfig(configWithCondition('mq', '(min-width: 768px)'));
    expect(result.errors.filter((e) => e.code === 'INVALID_MEDIA_QUERY')).toHaveLength(0);
  });

  it('emits no errors for a condition type other than media', () => {
    const result = validateInteractConfig(configWithCondition('sel', '.my-class', 'selector'));
    expect(result.errors.filter((e) => e.code === 'INVALID_MEDIA_QUERY')).toHaveLength(0);
  });

  it('emits no errors when the media condition has no predicate (handled by conditionPredicateRequired)', () => {
    // validMediaQueries only fires when predicate is defined; the missing-predicate
    // case is owned by conditionPredicateRequired.
    const result = validateInteractConfig(configWithCondition('mq'));
    expect(result.errors.filter((e) => e.code === 'INVALID_MEDIA_QUERY')).toHaveLength(0);
  });

  it('emits no errors for an empty predicate string', () => {
    // Empty string fails the first guard in isValidMediaQuery: `if (!q) return false`
    const result = validateInteractConfig(configWithCondition('mq', ''));
    expect(result.errors.filter((e) => e.code === 'INVALID_MEDIA_QUERY')).toHaveLength(0);
  });

  it('emits INVALID_MEDIA_QUERY for a query that matchMedia reports as invalid', () => {
    stubMatchMedia([]); // nothing is valid → matchMedia returns media: '' for everything
    const result = validateInteractConfig(configWithCondition('mq', '@bad##query'));
    expect(result.errors.some((e) => e.code === 'INVALID_MEDIA_QUERY')).toBe(true);
  });
});
