import { describe, expect, test } from 'vitest';

import * as GlideIn from '../GlideIn';
import { baseMockOptions } from './testUtils';
import type { GlideIn as GlideInType, AnimationData } from '../../../types';

describe('GlideIn', () => {
  test('GlideIn animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as GlideInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'quintInOut',
        keyframes: [
          {
            transform: 'translate(-100%, 0%) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        keyframes: [{ opacity: 0, offset: 0, easing: 'step-start' }],
      },
    ];

    const result = GlideIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('GlideIn animation with custom from and travel', () => {
    const from = 315;
    const travel = { value: 200, unit: 'px' };
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { from, travel } as GlideInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        keyframes: [
          {
            transform: 'translate(141px, -141px) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        keyframes: [{ opacity: 0, offset: 0, easing: 'step-start' }],
      },
    ];

    const result = GlideIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('GlideIn style animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as GlideInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'quintInOut',
        name: 'motion-glideIn',
        custom: {
          '--motion-translate-x': '-100%',
          '--motion-translate-y': '0%',
        },
        keyframes: [
          {
            transform:
              'translate(var(--motion-translate-x), var(--motion-translate-y)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        name: 'motion-fadeInStep',
        custom: {},
        keyframes: [{ opacity: 0, offset: 0, easing: 'step-start' }],
      },
    ];

    const result = GlideIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('GlideIn style animation with custom from and travel', () => {
    const from = 315;
    const travel = { value: 200, unit: 'px' };
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { from, travel } as GlideInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-glideIn',
        custom: {
          '--motion-translate-x': '141px',
          '--motion-translate-y': '-141px',
        },
        keyframes: [
          {
            transform:
              'translate(var(--motion-translate-x), var(--motion-translate-y)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        name: 'motion-fadeInStep',
        custom: {},
        keyframes: [{ opacity: 0, offset: 0, easing: 'step-start' }],
      },
    ];

    const result = GlideIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('GlideIn with calc() travel uses CSS cos()/sin() of the numeric angle', () => {
    const result = GlideIn.style?.({
      ...baseMockOptions,
      namedEffect: { from: 'bottom', travel: 'calc(10vh + 20px)' } as GlideInType,
    });

    expect(result?.[0].custom).toEqual({
      '--motion-translate-x': 'calc(cos(90deg) * calc(10vh + 20px))',
      '--motion-translate-y': 'calc(sin(90deg) * calc(10vh + 20px))',
    });
  });

  test.each([
    ['0.5turn', 'calc(cos(0.5turn) * 100%)', 'calc(sin(0.5turn) * 100%)'],
    [
      'calc(90deg + 90deg)',
      'calc(cos(calc(90deg + 90deg)) * 100%)',
      'calc(sin(calc(90deg + 90deg)) * 100%)',
    ],
  ])('GlideIn with from %s uses CSS cos()/sin()', (from, x, y) => {
    const result = GlideIn.style?.({
      ...baseMockOptions,
      namedEffect: { from } as GlideInType,
    });

    expect(result?.[0].custom).toEqual({ '--motion-translate-x': x, '--motion-translate-y': y });
  });

  test.each([180, '180deg', 'left'])(
    'GlideIn with numeric-equivalent from %s keeps numeric output',
    (from) => {
      const result = GlideIn.style?.({
        ...baseMockOptions,
        namedEffect: { from } as GlideInType,
      });

      expect(result?.[0].custom).toEqual({
        '--motion-translate-x': '-100%',
        '--motion-translate-y': '0%',
      });
    },
  );
});
