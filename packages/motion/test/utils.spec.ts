import { describe, expect, test } from 'vitest';
import {
  getJsEasing,
  normalizeKeyframes,
  toCSSPropertyName,
  toWAAPIPropertyName,
} from '../src/utils';
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

describe('utils/toCSSPropertyName()', () => {
  test('converts camelCase to kebab-case', () => {
    expect(toCSSPropertyName('backgroundColor')).toBe('background-color');
    expect(toCSSPropertyName('borderTopLeftRadius')).toBe('border-top-left-radius');
  });

  test('leaves kebab-case and single-word names unchanged', () => {
    expect(toCSSPropertyName('background-color')).toBe('background-color');
    expect(toCSSPropertyName('opacity')).toBe('opacity');
  });

  test('leaves custom properties untouched', () => {
    expect(toCSSPropertyName('--myVar')).toBe('--myVar');
    expect(toCSSPropertyName('--my-var')).toBe('--my-var');
  });

  test('restores the leading dash of vendor-prefixed properties', () => {
    expect(toCSSPropertyName('webkitTextStroke')).toBe('-webkit-text-stroke');
    expect(toCSSPropertyName('msOverflowStyle')).toBe('-ms-overflow-style');
  });

  test('does not treat a lowercase prefix-lookalike as a vendor prefix', () => {
    expect(toCSSPropertyName('objectFit')).toBe('object-fit');
    expect(toCSSPropertyName('overflowX')).toBe('overflow-x');
  });

  test('is idempotent', () => {
    expect(toCSSPropertyName(toCSSPropertyName('webkitTextStroke'))).toBe('-webkit-text-stroke');
    expect(toCSSPropertyName(toCSSPropertyName('backgroundColor'))).toBe('background-color');
  });
});

describe('utils/toWAAPIPropertyName()', () => {
  test('converts kebab-case to camelCase', () => {
    expect(toWAAPIPropertyName('background-color')).toBe('backgroundColor');
    expect(toWAAPIPropertyName('border-top-left-radius')).toBe('borderTopLeftRadius');
  });

  test('leaves camelCase and single-word names unchanged', () => {
    expect(toWAAPIPropertyName('backgroundColor')).toBe('backgroundColor');
    expect(toWAAPIPropertyName('opacity')).toBe('opacity');
  });

  test('leaves custom properties untouched', () => {
    expect(toWAAPIPropertyName('--my-var')).toBe('--my-var');
    expect(toWAAPIPropertyName('--myVar')).toBe('--myVar');
  });

  test('converts vendor-prefixed properties to their IDL name', () => {
    expect(toWAAPIPropertyName('-webkit-text-stroke')).toBe('webkitTextStroke');
    expect(toWAAPIPropertyName('-ms-overflow-style')).toBe('msOverflowStyle');
  });

  test('round-trips with toCSSPropertyName', () => {
    ['background-color', '-webkit-text-stroke', 'opacity', '--myVar'].forEach((name) => {
      expect(toCSSPropertyName(toWAAPIPropertyName(name))).toBe(name);
    });
  });

  test('is idempotent', () => {
    expect(toWAAPIPropertyName(toWAAPIPropertyName('background-color'))).toBe('backgroundColor');
  });
});

describe('utils/normalizeKeyframes()', () => {
  test('normalizes kebab-case property names to camelCase', () => {
    expect(
      normalizeKeyframes([{ 'background-color': 'red' }, { 'background-color': 'blue' }]),
    ).toEqual([{ backgroundColor: 'red' }, { backgroundColor: 'blue' }]);
  });

  test('normalizes mixed casings within a single keyframe', () => {
    expect(normalizeKeyframes([{ 'border-radius': '8px', backgroundColor: 'red' }])).toEqual([
      { borderRadius: '8px', backgroundColor: 'red' },
    ]);
  });

  test('maps keyframe-level CSS descriptors to their WAAPI keys', () => {
    expect(
      normalizeKeyframes([
        { opacity: 0, 'animation-timing-function': 'ease-in', 'animation-composition': 'add' },
      ]),
    ).toEqual([{ opacity: 0, easing: 'ease-in', composite: 'add' }]);
    expect(normalizeKeyframes([{ float: 'left' }])).toEqual([{ cssFloat: 'left' }]);
  });

  test('preserves WAAPI keyword keys', () => {
    const keyframes = [{ opacity: 0, offset: 0.5, easing: 'ease-in', composite: 'add' }];

    expect(normalizeKeyframes(keyframes)).toBe(keyframes);
  });

  test('preserves custom properties verbatim', () => {
    const keyframes = [{ '--myVar': '1' }];

    expect(normalizeKeyframes(keyframes)).toBe(keyframes);
  });

  test('returns the same array and frames when nothing needs normalizing', () => {
    const keyframes = [{ backgroundColor: 'red' }, { opacity: 1 }];

    expect(normalizeKeyframes(keyframes)).toBe(keyframes);
  });

  test('keeps untouched frames by reference when another frame changes', () => {
    const unchanged = { opacity: 1 };
    const result = normalizeKeyframes([{ 'background-color': 'red' }, unchanged]);

    expect(result[1]).toBe(unchanged);
    expect(result[0]).toEqual({ backgroundColor: 'red' });
  });

  test('is idempotent', () => {
    const once = normalizeKeyframes([{ 'background-color': 'red' }]);

    expect(normalizeKeyframes(once)).toBe(once);
  });

  test('does not resolve property names off Object.prototype', () => {
    const keyframes = [{ constructor: 'red', toString: 'blue', valueOf: '1' }];

    expect(normalizeKeyframes(keyframes)).toBe(keyframes);
  });
});
