import { describe, expect, test } from 'vitest';

import * as JelloAnimation from '../Jello';
import { Jello, TimeAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Jello.web()', () => {
  test('default values', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      namedEffect: {} as Jello,
    };

    const expectedResult = [
      {
        name: 'motion-jello-1',
        duration: 1,
        easing: 'linear',
        custom: {
          '--motion-skew-y': '12.25deg',
        },
        keyframes: [
          {
            offset: 0.24,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(12.25deg * 7 / 7))',
          },
          {
            offset: 0.38,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(12.25deg * -2 / 7))',
          },
          {
            offset: 0.58,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(12.25deg * 4 / 7))',
          },
          {
            offset: 0.8,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(12.25deg * -2 / 7))',
          },
          {
            offset: 1,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(12.25deg * 0 / 7))',
          },
        ],
      },
    ];

    const result = JelloAnimation.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('custom skew and duration', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: { skew: 23.8, iterationDelay: 500 } as Jello,
    };

    const expectedResult = [
      {
        name: 'motion-jello-067',
        duration: 1500,
        easing: 'linear',
        custom: {
          '--motion-skew-y': '23.8deg',
        },
        keyframes: [
          {
            offset: 0.1608,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(23.8deg * 7 / 7))',
          },
          {
            offset: 0.2546,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(23.8deg * -2 / 7))',
          },
          {
            offset: 0.3886,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(23.8deg * 4 / 7))',
          },
          {
            offset: 0.536,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(23.8deg * -2 / 7))',
          },
          {
            offset: 0.67,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(23.8deg * 0 / 7))',
          },
        ],
      },
    ];

    const result = JelloAnimation.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});

describe('Jello.style()', () => {
  test('default values', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      namedEffect: {} as Jello,
    };

    const expectedResult = [
      {
        name: 'motion-jello-1',
        duration: 1,
        easing: 'linear',
        custom: {
          '--motion-skew-y': '12.25deg',
        },
        keyframes: [
          {
            offset: 0.24,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 7 / 7))',
          },
          {
            offset: 0.38,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * -2 / 7))',
          },
          {
            offset: 0.58,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 4 / 7))',
          },
          {
            offset: 0.8,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * -2 / 7))',
          },
          {
            offset: 1,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 0 / 7))',
          },
        ],
      },
    ];

    const result = JelloAnimation.style(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('custom skew and duration', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: { skew: 23.8, iterationDelay: 500 } as Jello,
    };

    const expectedResult = [
      {
        name: 'motion-jello-067',
        duration: 1500,
        easing: 'linear',
        custom: {
          '--motion-skew-y': '23.8deg',
        },
        keyframes: [
          {
            offset: 0.1608,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 7 / 7))',
          },
          {
            offset: 0.2546,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * -2 / 7))',
          },
          {
            offset: 0.3886,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 4 / 7))',
          },
          {
            offset: 0.536,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * -2 / 7))',
          },
          {
            offset: 0.67,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 0 / 7))',
          },
        ],
      },
    ];

    const result = JelloAnimation.style(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
