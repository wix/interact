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
          '--motion-skew-y': 1.75,
        },
        keyframes: [
          {
            offset: 0.24,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(1.75 * 7deg))',
          },
          {
            offset: 0.38,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(1.75 * -2deg))',
          },
          {
            offset: 0.58,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(1.75 * 4deg))',
          },
          {
            offset: 0.8,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(1.75 * -2deg))',
          },
          {
            offset: 1,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(1.75 * 0deg))',
          },
        ],
      },
    ];

    const result = JelloAnimation.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('custom intensity and duration', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: { intensity: 0.8, iterationDelay: 500 } as Jello,
    };

    const expectedResult = [
      {
        name: 'motion-jello-067',
        duration: 1500,
        easing: 'linear',
        custom: {
          '--motion-skew-y': 3.4000000000000004,
        },
        keyframes: [
          {
            offset: 0.1608,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(3.4000000000000004 * 7deg))',
          },
          {
            offset: 0.2546,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(3.4000000000000004 * -2deg))',
          },
          {
            offset: 0.3886,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(3.4000000000000004 * 4deg))',
          },
          {
            offset: 0.536,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(3.4000000000000004 * -2deg))',
          },
          {
            offset: 0.67,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(3.4000000000000004 * 0deg))',
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
          '--motion-skew-y': 1.75,
        },
        keyframes: [
          {
            offset: 0.24,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 7deg))',
          },
          {
            offset: 0.38,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * -2deg))',
          },
          {
            offset: 0.58,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 4deg))',
          },
          {
            offset: 0.8,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * -2deg))',
          },
          {
            offset: 1,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 0deg))',
          },
        ],
      },
    ];

    const result = JelloAnimation.style(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('custom intensity and duration', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: { intensity: 0.8, iterationDelay: 500 } as Jello,
    };

    const expectedResult = [
      {
        name: 'motion-jello-067',
        duration: 1500,
        easing: 'linear',
        custom: {
          '--motion-skew-y': 3.4000000000000004,
        },
        keyframes: [
          {
            offset: 0.1608,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 7deg))',
          },
          {
            offset: 0.2546,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * -2deg))',
          },
          {
            offset: 0.3886,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 4deg))',
          },
          {
            offset: 0.536,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * -2deg))',
          },
          {
            offset: 0.67,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 0deg))',
          },
        ],
      },
    ];

    const result = JelloAnimation.style(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
