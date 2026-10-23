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
          '--motion-skew-y-24': '12.25deg',
          '--motion-skew-y-38': '-3.5deg',
          '--motion-skew-y-58': '7deg',
          '--motion-skew-y-80': '-3.5deg',
          '--motion-skew-y-100': '0deg',
        },
        keyframes: [
          {
            offset: 0.24,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(12.25deg)',
          },
          {
            offset: 0.38,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(-3.5deg)',
          },
          {
            offset: 0.58,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(7deg)',
          },
          {
            offset: 0.8,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(-3.5deg)',
          },
          {
            offset: 1,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(0deg)',
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
          '--motion-skew-y-24': '23.8deg',
          '--motion-skew-y-38': '-6.8deg',
          '--motion-skew-y-58': '13.6deg',
          '--motion-skew-y-80': '-6.8deg',
          '--motion-skew-y-100': '0deg',
        },
        keyframes: [
          {
            offset: 0.1608,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(23.8deg)',
          },
          {
            offset: 0.2546,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(-6.8deg)',
          },
          {
            offset: 0.3886,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(13.6deg)',
          },
          {
            offset: 0.536,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(-6.8deg)',
          },
          {
            offset: 0.67,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(0deg)',
          },
          {
            offset: 1,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(0deg)',
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
          '--motion-skew-y-24': '12.25deg',
          '--motion-skew-y-38': '-3.5deg',
          '--motion-skew-y-58': '7deg',
          '--motion-skew-y-80': '-3.5deg',
          '--motion-skew-y-100': '0deg',
        },
        keyframes: [
          {
            offset: 0.24,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(var(--motion-skew-y-24))',
          },
          {
            offset: 0.38,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(var(--motion-skew-y-38))',
          },
          {
            offset: 0.58,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(var(--motion-skew-y-58))',
          },
          {
            offset: 0.8,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(var(--motion-skew-y-80))',
          },
          {
            offset: 1,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(var(--motion-skew-y-100))',
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
          '--motion-skew-y-24': '23.8deg',
          '--motion-skew-y-38': '-6.8deg',
          '--motion-skew-y-58': '13.6deg',
          '--motion-skew-y-80': '-6.8deg',
          '--motion-skew-y-100': '0deg',
        },
        keyframes: [
          {
            offset: 0.1608,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(var(--motion-skew-y-24))',
          },
          {
            offset: 0.2546,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(var(--motion-skew-y-38))',
          },
          {
            offset: 0.3886,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(var(--motion-skew-y-58))',
          },
          {
            offset: 0.536,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(var(--motion-skew-y-80))',
          },
          {
            offset: 0.67,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(var(--motion-skew-y-100))',
          },
          {
            offset: 1,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(var(--motion-skew-y-100))',
          },
        ],
      },
    ];

    const result = JelloAnimation.style(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});

describe('Jello skew', () => {
  test.each([12.25, 7, 28, -10])('the peak is the skew %s', (skew) => {
    const skews = JelloAnimation.web({
      ...baseMockOptions,
      namedEffect: { skew } as Jello,
    })[0].keyframes.map(({ transform }) =>
      parseFloat((transform as string).match(/skewY\((-?[\d.]+)deg\)/)![1]),
    );
    expect(skews[0]).toBe(skew);
    expect(Math.max(...skews.map(Math.abs))).toBe(Math.abs(skew));
  });
});
