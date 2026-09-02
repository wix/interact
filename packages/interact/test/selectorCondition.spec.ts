import { describe, expect, it } from 'vitest';
import { applySelectorCondition, matchesSelectorCondition } from '../src/utils';

describe('applySelectorCondition', () => {
  it('substitutes the base selector for `&`', () => {
    expect(applySelectorCondition('[data-interact-key="a"]', ':is(.theme-dark &)')).toBe(
      ':is(.theme-dark [data-interact-key="a"])',
    );
  });

  it('appends the predicate when it has no `&`', () => {
    expect(applySelectorCondition('[data-interact-key="a"]', ':is(.featured)')).toBe(
      '[data-interact-key="a"]:is(.featured)',
    );
  });
});

describe('matchesSelectorCondition', () => {
  it('honours an ancestor predicate written with `&`', () => {
    document.body.innerHTML =
      '<div class="theme-dark"><span id="in"></span></div><span id="out"></span>';
    const inside = document.getElementById('in')!;
    const outside = document.getElementById('out')!;

    // `element.matches(':is(.theme-dark &)')` resolves `&` to the element's
    // root, so it never matches - the reason this helper exists.
    expect(matchesSelectorCondition(inside, ':is(.theme-dark &)')).toBe(true);
    expect(matchesSelectorCondition(outside, ':is(.theme-dark &)')).toBe(false);
  });

  it('honours a predicate on the element itself', () => {
    document.body.innerHTML = '<span id="a" class="featured"></span><span id="b"></span>';

    expect(matchesSelectorCondition(document.getElementById('a')!, ':is(.featured)')).toBe(true);
    expect(matchesSelectorCondition(document.getElementById('b')!, ':is(.featured)')).toBe(false);
  });
});
