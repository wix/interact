import { describe, expect, test } from 'vitest';
import { cubicBezierCalc, jsEasings, jsEasingsInCSS } from '../src/easings';
import { cubicBezierEasing, getJsEasing, getJsEasingInCSS } from '../src/utils';

/**
 * `jsEasingsInCSS` emits `calc()` expression fragments, so asserting on the strings would only
 * pin down their spelling. Instead these tests translate the CSS math functions to their JS
 * equivalents and check that the expression *evaluates* to the same curve as the JS easing it
 * mirrors - which is what the staggered-sequence CSS actually depends on.
 */
function evaluateCSSCalc(expression: string): number {
  const body = expression
    .replace(/(-?[\d.]+)deg/g, '($1 * Math.PI / 180)')
    .replace(/\bpow\(/g, 'Math.pow(')
    .replace(/\bsqrt\(/g, 'Math.sqrt(')
    .replace(/\bacos\(/g, 'Math.acos(')
    .replace(/\bsin\(/g, 'Math.sin(')
    .replace(/\bcos\(/g, 'Math.cos(')
    .replace(/\bround\(/g, 'Math.round(')
    .replace(/\bmax\(/g, 'Math.max(')
    .replace(/\bclamp\(/g, 'clamp(');

  return new Function('clamp', `"use strict"; return ${body};`)(
    (lo: number, value: number, hi: number) => Math.min(Math.max(value, lo), hi),
  );
}

const at = (build: (t: string) => string, t: number) => evaluateCSSCalc(build(`(${t})`));

const SAMPLES = [0, 0.1, 0.25, 1 / 3, 0.4, 0.5, 0.6, 2 / 3, 0.75, 0.9, 1];

describe('easings/jsEasingsInCSS', () => {
  const named = Object.keys(jsEasingsInCSS).filter(
    (name) => name in jsEasings,
  ) as (keyof typeof jsEasings & keyof typeof jsEasingsInCSS)[];

  test('covers every JS easing so any offsetEasing can be staggered in CSS', () => {
    expect(named.length).toBe(Object.keys(jsEasings).length);
  });

  test.each(named)('%s matches the JS easing across the curve', (name) => {
    for (const t of SAMPLES) {
      // expo* trade the JS `t === 0`/`t === 1` special cases for a branchless linear correction
      expect(at(jsEasingsInCSS[name], t)).toBeCloseTo(
        jsEasings[name](t),
        name.startsWith('expo') ? 2 : 6,
      );
    }
  });
});

describe('easings/cubicBezierCalc', () => {
  const curves: [string, [number, number, number, number]][] = [
    ['ease', [0.25, 0.1, 0.25, 1]],
    ['easeIn', [0.42, 0, 1, 1]],
    ['easeOut', [0, 0, 0.58, 1]],
    ['easeInOut', [0.42, 0, 0.58, 1]],
    ['overshoot', [0.68, -0.55, 0.265, 1.55]],
    ['expo-like', [0.16, 1, 0.3, 1]],
    ['extreme', [1, 0, 0, 1]],
    ['degenerate quadratic', [1 / 3, 0, 2 / 3, 1]],
  ];

  test.each(curves)('%s resolves to finite values matching the reference curve', (_name, curve) => {
    const reference = cubicBezierEasing(...curve);

    for (const t of SAMPLES) {
      const value = at((input) => cubicBezierCalc(input, ...curve), t);

      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeCloseTo(reference(t), 6);
    }
  });
});

describe('utils/getJsEasingInCSS()', () => {
  test('returns undefined for falsy easing', () => {
    expect(getJsEasingInCSS()).toBeUndefined();
    expect(getJsEasingInCSS('')).toBeUndefined();
  });

  test('resolves a named easing', () => {
    expect(at(getJsEasingInCSS('quadIn')!, 0.5)).toBeCloseTo(0.25, 6);
  });

  test('passes the raw index expression through for linear', () => {
    expect(getJsEasingInCSS('linear')!('var(--i)')).toBe('var(--i)');
  });

  test('parses a cubic-bezier() string', () => {
    const easing = getJsEasingInCSS('cubic-bezier(0.25, 0.1, 0.25, 1)')!;

    expect(at(easing, 0)).toBeCloseTo(0, 6);
    expect(at(easing, 1)).toBeCloseTo(1, 6);
    expect(at(easing, 0.5)).toBeCloseTo(getJsEasing('cubic-bezier(0.25, 0.1, 0.25, 1)')!(0.5), 6);
  });

  test.each([
    'linear(0, 1)',
    'linear(0, 0.5 50%, 1)',
    'linear(0.2, 0.8)',
    'linear(0, 1 40% 60%, 0)',
    'linear(0, 1 50% 50%, 0)',
  ])('parses %s to the same curve as getJsEasing', (input) => {
    const css = getJsEasingInCSS(input)!;
    const js = getJsEasing(input)!;

    for (const t of SAMPLES) {
      expect(at(css, t)).toBeCloseTo(js(t), 6);
    }
  });

  test('falls back to linear for an unparsable easing', () => {
    expect(getJsEasingInCSS('not-a-real-easing')).toBe(jsEasingsInCSS.linear);
  });
});
