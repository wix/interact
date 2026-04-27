import { describe, expect, test } from 'vitest';
import { getJsEasing } from '../src/utils';
import { jsEasings } from '../src/easings';

describe('utils/getJsEasing()', () => {
  test('returns named JS easing function', () => {
    const easing = getJsEasing('quadIn');

    expect(easing).toBeTypeOf('function');
    expect(easing?.(0.5)).toBeCloseTo(0.25, 6);
  });

  test('parses cubic-bezier() string and evaluates endpoints', () => {
    const easing = getJsEasing('cubic-bezier(0.25, 0.1, 0.25, 1)');

    expect(easing).toBeTypeOf('function');
    expect(easing?.(0)).toBeCloseTo(0, 6);
    expect(easing?.(1)).toBeCloseTo(1, 6);
  });

  test('cubic-bezier(0, 0, 1, 1) behaves like linear', () => {
    const easing = getJsEasing('cubic-bezier(0, 0, 1, 1)');

    expect(easing).toBeTypeOf('function');
    expect(easing?.(0.1)).toBeCloseTo(0.1, 6);
    expect(easing?.(0.5)).toBeCloseTo(0.5, 6);
    expect(easing?.(0.9)).toBeCloseTo(0.9, 6);
  });

  test('parses linear() with implicit stop positions', () => {
    const easing = getJsEasing('linear(0, 1)');

    expect(easing).toBeTypeOf('function');
    expect(easing?.(0)).toBeCloseTo(0, 6);
    expect(easing?.(0.25)).toBeCloseTo(0.25, 6);
    expect(easing?.(0.75)).toBeCloseTo(0.75, 6);
    expect(easing?.(1)).toBeCloseTo(1, 6);
  });

  test('parses linear() with explicit stop positions', () => {
    const easing = getJsEasing('linear(0, 0.5 50%, 1)');

    expect(easing).toBeTypeOf('function');
    expect(easing?.(0.25)).toBeCloseTo(0.25, 6);
    expect(easing?.(0.5)).toBeCloseTo(0.5, 6);
    expect(easing?.(0.75)).toBeCloseTo(0.75, 6);
  });

  test('parses linear() plateau with two percentages on a stop', () => {
    const easing = getJsEasing('linear(0, 1 40% 60%, 0)');

    expect(easing).toBeTypeOf('function');
    expect(easing?.(0.5)).toBeCloseTo(1, 6);
    expect(easing?.(0.8)).toBeCloseTo(0.5, 6);
  });

  test('returns linear for invalid cubic-bezier() string', () => {
    expect(getJsEasing('cubic-bezier(0.1, 0.2, 0.3)')).toBe(jsEasings.linear);
  });

  test('returns linear easing for invalid linear() string', () => {
    expect(getJsEasing('linear(foo, bar)')).toBe(jsEasings.linear);
  });
});
