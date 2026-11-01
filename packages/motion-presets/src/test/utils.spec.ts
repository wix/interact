import { afterEach, describe, expect, test, vi } from 'vitest';

import { parseAngle, parseCssLength, parseLength, parseDirection } from '../utils';

describe('parseLength', () => {
  const defaultValue = { value: 100, unit: 'percentage' };

  describe('number input', () => {
    test('handles positive number', () => {
      expect(parseLength(50, defaultValue)).toEqual({ value: 50, unit: 'percentage' });
    });

    test('handles zero', () => {
      expect(parseLength(0, defaultValue)).toEqual({ value: 0, unit: 'percentage' });
    });

    test('handles decimal number', () => {
      expect(parseLength(33.5, defaultValue)).toEqual({ value: 33.5, unit: 'percentage' });
    });

    test('inherits unit from default value', () => {
      const pxDefault = { value: 100, unit: 'px' };
      expect(parseLength(50, pxDefault)).toEqual({ value: 50, unit: 'px' });
    });
  });

  describe('object input { value, unit }', () => {
    test('handles valid object with number value', () => {
      expect(parseLength({ value: 200, unit: 'px' }, defaultValue)).toEqual({
        value: 200,
        unit: 'px',
      });
    });

    test('handles object with string value that can be parsed', () => {
      expect(parseLength({ value: '150' as any, unit: 'em' }, defaultValue)).toEqual({
        value: 150,
        unit: 'em',
      });
    });

    test('normalizes percentage symbol to "percentage"', () => {
      expect(parseLength({ value: 50, unit: '%' }, defaultValue)).toEqual({
        value: 50,
        unit: 'percentage',
      });
    });

    test('normalizes uppercase unit', () => {
      expect(parseLength({ value: 100, unit: 'PX' }, defaultValue)).toEqual({
        value: 100,
        unit: 'px',
      });
    });

    test('returns default for object with NaN value', () => {
      expect(parseLength({ value: NaN, unit: 'px' }, defaultValue)).toEqual(defaultValue);
    });

    test('returns default for object with invalid string value', () => {
      expect(parseLength({ value: 'abc' as any, unit: 'px' }, defaultValue)).toEqual(defaultValue);
    });

    test('returns default for object missing value', () => {
      expect(parseLength({ unit: 'px' } as any, defaultValue)).toEqual(defaultValue);
    });

    test('returns default for object missing unit', () => {
      expect(parseLength({ value: 100 } as any, defaultValue)).toEqual(defaultValue);
    });
  });

  describe('string input with unit', () => {
    test('parses "100px"', () => {
      expect(parseLength('100px', defaultValue)).toEqual({ value: 100, unit: 'px' });
    });

    test('parses "50%"', () => {
      expect(parseLength('50%', defaultValue)).toEqual({ value: 50, unit: 'percentage' });
    });

    test('parses decimal "33.5em"', () => {
      expect(parseLength('33.5em', defaultValue)).toEqual({ value: 33.5, unit: 'em' });
    });

    test('parses with whitespace "  100px  "', () => {
      expect(parseLength('  100px  ', defaultValue)).toEqual({ value: 100, unit: 'px' });
    });

    test('parses uppercase unit "100PX"', () => {
      expect(parseLength('100PX', defaultValue)).toEqual({ value: 100, unit: 'px' });
    });

    test('parses various CSS units', () => {
      expect(parseLength('10rem', defaultValue)).toEqual({ value: 10, unit: 'rem' });
      expect(parseLength('20vw', defaultValue)).toEqual({ value: 20, unit: 'vw' });
      expect(parseLength('30vh', defaultValue)).toEqual({ value: 30, unit: 'vh' });
      expect(parseLength('40vmin', defaultValue)).toEqual({ value: 40, unit: 'vmin' });
      expect(parseLength('50vmax', defaultValue)).toEqual({ value: 50, unit: 'vmax' });
      expect(parseLength('5ch', defaultValue)).toEqual({ value: 5, unit: 'ch' });
      expect(parseLength('2cm', defaultValue)).toEqual({ value: 2, unit: 'cm' });
      expect(parseLength('3mm', defaultValue)).toEqual({ value: 3, unit: 'mm' });
      expect(parseLength('1in', defaultValue)).toEqual({ value: 1, unit: 'in' });
      expect(parseLength('12pt', defaultValue)).toEqual({ value: 12, unit: 'pt' });
      expect(parseLength('6pc', defaultValue)).toEqual({ value: 6, unit: 'pc' });
    });
  });

  describe('string input without unit (plain number)', () => {
    test('parses "100" using default unit', () => {
      expect(parseLength('100', defaultValue)).toEqual({ value: 100, unit: 'percentage' });
    });

    test('inherits unit from px default', () => {
      const pxDefault = { value: 50, unit: 'px' };
      expect(parseLength('200', pxDefault)).toEqual({ value: 200, unit: 'px' });
    });
  });

  describe('invalid string input', () => {
    test('returns default for empty string', () => {
      expect(parseLength('', defaultValue)).toEqual(defaultValue);
    });

    test('returns default for invalid string "abc"', () => {
      expect(parseLength('abc', defaultValue)).toEqual(defaultValue);
    });

    test('returns default for string with trailing characters "100pxabc"', () => {
      expect(parseLength('100pxabc', defaultValue)).toEqual(defaultValue);
    });

    test('returns default for unknown unit "100xyz"', () => {
      expect(parseLength('100xyz', defaultValue)).toEqual(defaultValue);
    });
  });
});

describe('parseDirection', () => {
  const allowedKeywords = ['top', 'right', 'bottom', 'left'] as const;
  const defaultValue = 'bottom';

  describe('number input (with acceptAngles: true)', () => {
    test('handles positive number', () => {
      expect(parseDirection(90, allowedKeywords, defaultValue, true)).toBe(90);
    });

    test('handles negative number', () => {
      expect(parseDirection(-45, allowedKeywords, defaultValue, true)).toBe(-45);
    });

    test('handles zero', () => {
      expect(parseDirection(0, allowedKeywords, defaultValue, true)).toBe(0);
    });

    test('handles decimal number', () => {
      expect(parseDirection(45.5, allowedKeywords, defaultValue, true)).toBe(45.5);
    });

    test('handles large angle', () => {
      expect(parseDirection(360, allowedKeywords, defaultValue, true)).toBe(360);
    });
  });

  describe('string keyword input', () => {
    test('handles valid keyword "right"', () => {
      expect(parseDirection('right', allowedKeywords, defaultValue)).toBe('right');
    });

    test('handles mixed case keyword "RiGhT"', () => {
      expect(parseDirection('RiGhT', allowedKeywords, defaultValue)).toBe('right');
    });

    test('handles keyword with whitespace "  left  "', () => {
      expect(parseDirection('  left  ', allowedKeywords, defaultValue)).toBe('left');
    });

    test('returns default for invalid keyword', () => {
      expect(parseDirection('diagonal', allowedKeywords, defaultValue)).toBe(defaultValue);
    });
  });

  describe('string degree input (with acceptAngles: true)', () => {
    test('parses "45deg"', () => {
      expect(parseDirection('45deg', allowedKeywords, defaultValue, true)).toBe(45);
    });

    test('parses "90DEG" (uppercase)', () => {
      expect(parseDirection('90DEG', allowedKeywords, defaultValue, true)).toBe(90);
    });

    test('parses "-30deg" (negative)', () => {
      expect(parseDirection('-30deg', allowedKeywords, defaultValue, true)).toBe(-30);
    });

    test('parses "45.5deg" (decimal)', () => {
      expect(parseDirection('45.5deg', allowedKeywords, defaultValue, true)).toBe(45.5);
    });

    test('parses "0deg"', () => {
      expect(parseDirection('0deg', allowedKeywords, defaultValue, true)).toBe(0);
    });
  });

  describe('string number input (with acceptAngles: true)', () => {
    test('parses "45"', () => {
      expect(parseDirection('45', allowedKeywords, defaultValue, true)).toBe(45);
    });
  });

  describe('acceptAngles parameter', () => {
    describe('when acceptAngles is false (default)', () => {
      test('rejects number input, returns default', () => {
        expect(parseDirection(45, allowedKeywords, defaultValue, false)).toBe(defaultValue);
      });

      test('rejects "45deg" string, returns default', () => {
        expect(parseDirection('45deg', allowedKeywords, defaultValue, false)).toBe(defaultValue);
      });

      test('rejects "45" number string, returns default', () => {
        expect(parseDirection('45', allowedKeywords, defaultValue, false)).toBe(defaultValue);
      });
    });
  });
});

describe('parseAngle and parseCssLength', () => {
  const defaultLength = { value: 25, unit: 'px' };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('numbers take the default unit', () => {
    expect(parseAngle(30, 0)).toBe('30deg');
    expect(parseCssLength(10, defaultLength)).toBe('10px');
  });

  test('unit strings, calc() and side keywords pass through', () => {
    expect(parseAngle('0.5turn', 0)).toBe('0.5turn');
    expect(parseAngle('top', 0)).toBe('270deg');
    expect(parseCssLength('2em', defaultLength)).toBe('2em');
    expect(parseCssLength('calc(10px + 5%)', defaultLength)).toBe('calc(10px + 5%)');
  });

  test('length objects keep their unit', () => {
    expect(parseCssLength({ value: 3, unit: 'percentage' }, defaultLength)).toBe('3%');
  });

  test('other strings fall back to the default without CSS Typed OM', () => {
    expect(parseAngle('max(10deg, 1rad)', 15)).toBe('15deg');
    expect(parseCssLength('min(10px, 2vw)', defaultLength)).toBe('25px');
  });

  test('CSS Typed OM accepts any numeric value of the right type', () => {
    const types: Record<string, object> = {
      'max(10deg, 1rad)': { angle: 1 },
      'min(10px, 2vw)': { length: 1 },
      'clamp(1%, 2px, 3%)': { length: 1, percentHint: 'length' },
      'min(1px, 2deg)': { length: 1, angle: 1 },
      'max(1px, 2px)': { length: 2 },
    };
    vi.stubGlobal('CSSNumericValue', {
      parse: (value: string) => {
        if (!(value in types)) {
          throw new SyntaxError(value);
        }
        return { type: () => types[value] };
      },
    });

    expect(parseAngle('max(10deg, 1rad)', 15)).toBe('max(10deg, 1rad)');
    expect(parseAngle('min(10px, 2vw)', 15)).toBe('15deg');
    expect(parseCssLength('min(10px, 2vw)', defaultLength)).toBe('min(10px, 2vw)');
    expect(parseCssLength('clamp(1%, 2px, 3%)', defaultLength)).toBe('clamp(1%, 2px, 3%)');
    expect(parseCssLength('max(10deg, 1rad)', defaultLength)).toBe('25px');
    expect(parseCssLength('min(1px, 2deg)', defaultLength)).toBe('25px');
    expect(parseCssLength('max(1px, 2px)', defaultLength)).toBe('25px');
    expect(parseCssLength('foo', defaultLength)).toBe('25px');
  });
});
