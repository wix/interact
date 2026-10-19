import { describe, expect, test } from 'vitest';

import * as ExpandIn from '../ExpandIn';
import { baseMockOptions } from './testUtils';
import type { ExpandIn as ExpandInType } from '../../../types';

describe('ExpandIn', () => {
  test('ExpandIn style animation with default options', () => {
    const result = ExpandIn.style?.({
      ...baseMockOptions,
      namedEffect: {} as ExpandInType,
    });

    expect(result?.[1].custom).toEqual({
      '--motion-translate-x': '0%',
      '--motion-translate-y': '-120%',
      '--motion-scale': '0',
    });
  });

  test('ExpandIn with calc() travel uses CSS cos()/sin() of the from angle', () => {
    const result = ExpandIn.style?.({
      ...baseMockOptions,
      namedEffect: { from: 'top', travel: 'calc(10vh + 20px)' } as ExpandInType,
    });

    expect(result?.[1].custom).toEqual({
      '--motion-translate-x': 'calc(cos(270deg) * calc(10vh + 20px))',
      '--motion-translate-y': 'calc(sin(270deg) * calc(10vh + 20px))',
      '--motion-scale': '0',
    });
  });

  test.each([
    ['0.5turn', 'calc(cos(0.5turn) * 120%)', 'calc(sin(0.5turn) * 120%)'],
    [
      'calc(90deg + 90deg)',
      'calc(cos(calc(90deg + 90deg)) * 120%)',
      'calc(sin(calc(90deg + 90deg)) * 120%)',
    ],
  ])('ExpandIn with from %s uses CSS cos()/sin()', (from, x, y) => {
    const result = ExpandIn.style?.({
      ...baseMockOptions,
      namedEffect: { from } as ExpandInType,
    });

    expect(result?.[1].custom).toMatchObject({
      '--motion-translate-x': x,
      '--motion-translate-y': y,
    });
  });

  test.each([180, '180deg', 'left'])(
    'ExpandIn with numeric-equivalent from %s keeps numeric output',
    (from) => {
      const result = ExpandIn.style?.({
        ...baseMockOptions,
        namedEffect: { from } as ExpandInType,
      });

      expect(result?.[1].custom).toMatchObject({
        '--motion-translate-x': '-120%',
        '--motion-translate-y': '0%',
      });
    },
  );
});
