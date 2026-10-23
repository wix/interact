import { describe, expect, test } from 'vitest';

import * as Rubber from '../Rubber';
import { Rubber as RubberType, TimeAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Rubber', () => {
  test('default values - style method', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: {} as RubberType,
    };

    const expectedResult = [
      {
        id: 'test-id',
        duration: 1000,
        namedEffect: {},
        name: 'motion-rubber-1',
        easing: 'linear',
        custom: {
          '--motion-scale-x-45': 1.1,
          '--motion-scale-y-45': 0.9,
          '--motion-scale-x-56': 0.91,
          '--motion-scale-y-56': 1.09,
          '--motion-scale-x-66': 1.08,
          '--motion-scale-y-66': 0.92,
          '--motion-scale-x-78': 0.955,
          '--motion-scale-y-78': 1.045,
          '--motion-scale-x-89': 1.0528,
          '--motion-scale-y-89': 0.9473,
          '--motion-scale-x-100': 1,
          '--motion-scale-y-100': 1,
        },
        keyframes: [
          {
            offset: 0.45,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-45), var(--motion-scale-y-45))',
          },
          {
            offset: 0.56,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-56), var(--motion-scale-y-56))',
          },
          {
            offset: 0.66,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-66), var(--motion-scale-y-66))',
          },
          {
            offset: 0.78,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-78), var(--motion-scale-y-78))',
          },
          {
            offset: 0.89,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-89), var(--motion-scale-y-89))',
          },
          {
            offset: 1,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-100), var(--motion-scale-y-100))',
          },
        ],
      },
    ];

    const result = Rubber.style(mockOptions);

    expect(result).toEqual(expectedResult);
  });

  test('default values - web method', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: {} as RubberType,
    };

    const expectedResult = [
      {
        id: 'test-id',
        duration: 1000,
        namedEffect: {},
        name: 'motion-rubber-1',
        easing: 'linear',
        custom: {
          '--motion-scale-x-45': 1.1,
          '--motion-scale-y-45': 0.9,
          '--motion-scale-x-56': 0.91,
          '--motion-scale-y-56': 1.09,
          '--motion-scale-x-66': 1.08,
          '--motion-scale-y-66': 0.92,
          '--motion-scale-x-78': 0.955,
          '--motion-scale-y-78': 1.045,
          '--motion-scale-x-89': 1.0528,
          '--motion-scale-y-89': 0.9473,
          '--motion-scale-x-100': 1,
          '--motion-scale-y-100': 1,
        },
        keyframes: [
          {
            offset: 0.45,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1.1, 0.9)',
          },
          {
            offset: 0.56,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(0.91, 1.09)',
          },
          {
            offset: 0.66,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1.08, 0.92)',
          },
          {
            offset: 0.78,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(0.955, 1.045)',
          },
          {
            offset: 0.89,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1.0528, 0.9473)',
          },
          {
            offset: 1,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1, 1)',
          },
        ],
      },
    ];

    const result = Rubber.web(mockOptions);

    expect(result).toEqual(expectedResult);
  });

  test('custom stretch - style method', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: { stretch: 0.13, iterationDelay: 1000 } as RubberType,
    };

    const expectedResult = [
      {
        name: 'motion-rubber-05',
        duration: 2000,
        easing: 'linear',
        custom: {
          '--motion-scale-x-45': 1.13,
          '--motion-scale-y-45': 0.87,
          '--motion-scale-x-56': 0.883,
          '--motion-scale-y-56': 1.117,
          '--motion-scale-x-66': 1.104,
          '--motion-scale-y-66': 0.896,
          '--motion-scale-x-78': 0.9415,
          '--motion-scale-y-78': 1.0585,
          '--motion-scale-x-89': 1.0686,
          '--motion-scale-y-89': 0.9314,
          '--motion-scale-x-100': 1,
          '--motion-scale-y-100': 1,
        },
        keyframes: [
          {
            offset: 0.225,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-45), var(--motion-scale-y-45))',
          },
          {
            offset: 0.28,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-56), var(--motion-scale-y-56))',
          },
          {
            offset: 0.33,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-66), var(--motion-scale-y-66))',
          },
          {
            offset: 0.39,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-78), var(--motion-scale-y-78))',
          },
          {
            offset: 0.445,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-89), var(--motion-scale-y-89))',
          },
          {
            offset: 0.5,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-100), var(--motion-scale-y-100))',
          },
          {
            offset: 1,
            transform:
              'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x-100), var(--motion-scale-y-100))',
          },
        ],
      },
    ];

    const result = Rubber.style(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('custom stretch - web method', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: { stretch: 0.13, iterationDelay: 1000 } as RubberType,
    };

    const expectedResult = [
      {
        name: 'motion-rubber-05',
        duration: 2000,
        easing: 'linear',
        custom: {
          '--motion-scale-x-45': 1.13,
          '--motion-scale-y-45': 0.87,
          '--motion-scale-x-56': 0.883,
          '--motion-scale-y-56': 1.117,
          '--motion-scale-x-66': 1.104,
          '--motion-scale-y-66': 0.896,
          '--motion-scale-x-78': 0.9415,
          '--motion-scale-y-78': 1.0585,
          '--motion-scale-x-89': 1.0686,
          '--motion-scale-y-89': 0.9314,
          '--motion-scale-x-100': 1,
          '--motion-scale-y-100': 1,
        },
        keyframes: [
          {
            offset: 0.225,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1.13, 0.87)',
          },
          {
            offset: 0.28,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(0.883, 1.117)',
          },
          {
            offset: 0.33,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1.104, 0.896)',
          },
          {
            offset: 0.39,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(0.9415, 1.0585)',
          },
          {
            offset: 0.445,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1.0686, 0.9314)',
          },
          {
            offset: 0.5,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1, 1)',
          },
          {
            offset: 1,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1, 1)',
          },
        ],
      },
    ];

    const result = Rubber.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});

describe('Rubber stretch', () => {
  test.each([0.1, 0.13, 0.05, -0.2])('the first squash is 1 ± %s', (stretch) => {
    const scales = Rubber.web({
      ...baseMockOptions,
      namedEffect: { stretch } as RubberType,
    })[0].keyframes.map(({ transform }) =>
      (transform as string)
        .match(/scale\(([^,]+), ([^)]+)\)/)!
        .slice(1)
        .map(parseFloat),
    );
    const [peakX, peakY] = scales.reduce((a, b) =>
      Math.abs(b[0] - 1) > Math.abs(a[0] - 1) ? b : a,
    );
    expect(scales[0]).toEqual([peakX, peakY]);
    expect(peakX).toBeCloseTo(1 + stretch, 10);
    expect(peakY).toBeCloseTo(1 - stretch, 10);
  });
});
