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
            transform:
              'translate(calc(cos(180deg) * 100%), calc(sin(180deg) * 100%)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        easing: 'step-start',
        keyframes: [{ offset: 0, opacity: 0 }],
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
            transform:
              'translate(calc(cos(315deg) * 200px), calc(sin(315deg) * 200px)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        easing: 'step-start',
        keyframes: [{ offset: 0, opacity: 0 }],
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
          '--motion-translate-x': 'calc(cos(180deg) * 100%)',
          '--motion-translate-y': 'calc(sin(180deg) * 100%)',
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
        name: 'motion-fadeIn',
        custom: {},
        easing: 'step-start',
        keyframes: [{ offset: 0, opacity: 0 }],
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
          '--motion-translate-x': 'calc(cos(315deg) * 200px)',
          '--motion-translate-y': 'calc(sin(315deg) * 200px)',
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
        name: 'motion-fadeIn',
        custom: {},
        easing: 'step-start',
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = GlideIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test.each([
    ['top', '270deg'],
    [90, '90deg'],
    ['0.5rad', '0.5rad'],
    ['calc(90deg + 0.25turn)', 'calc(90deg + 0.25turn)'],
  ])('GlideIn style with from %s', (from, angle) => {
    const result = GlideIn.style({
      ...baseMockOptions,
      namedEffect: { type: 'GlideIn', from, travel: '2em' } as GlideInType,
    });

    expect(result[0].custom).toEqual({
      '--motion-translate-x': `calc(cos(${angle}) * 2em)`,
      '--motion-translate-y': `calc(sin(${angle}) * 2em)`,
    });
  });
});
