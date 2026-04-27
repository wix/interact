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
        easing: 'linear',
        namedEffect: {},
        name: 'motion-rubber-1',
        custom: {
          '--motion-scale-x-45': 1.08,
          '--motion-scale-y-45': 0.88,
          '--motion-scale-x-56': 0.875,
          '--motion-scale-y-56': 1.055,
          '--motion-scale-x-66': 1.07,
          '--motion-scale-y-66': 0.91,
          '--motion-scale-x-78': 0.955,
          '--motion-scale-y-78': 1.045,
          '--motion-scale-x-89': 1.055,
          '--motion-scale-y-89': 0.9495,
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
        easing: 'linear',
        namedEffect: {},
        name: 'motion-rubber-1',
        custom: {
          '--motion-scale-x-45': 1.08,
          '--motion-scale-y-45': 0.88,
          '--motion-scale-x-56': 0.875,
          '--motion-scale-y-56': 1.055,
          '--motion-scale-x-66': 1.07,
          '--motion-scale-y-66': 0.91,
          '--motion-scale-x-78': 0.955,
          '--motion-scale-y-78': 1.045,
          '--motion-scale-x-89': 1.055,
          '--motion-scale-y-89': 0.9495,
          '--motion-scale-x-100': 1,
          '--motion-scale-y-100': 1,
        },
        keyframes: [
          {
            offset: 0.45,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1.08, 0.88)',
          },
          {
            offset: 0.56,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(0.875, 1.055)',
          },
          {
            offset: 0.66,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1.07, 0.91)',
          },
          {
            offset: 0.78,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(0.955, 1.045)',
          },
          {
            offset: 0.89,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1.055, 0.9495)',
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

  test('custom intensity - style method', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: { intensity: 0.8, iterationDelay: 1000 } as RubberType,
    };

    const expectedResult = [
      {
        name: 'motion-rubber-05',
        duration: 2000,
        easing: 'linear',
        custom: {
          '--motion-scale-x-45': 1.11,
          '--motion-scale-y-45': 0.85,
          '--motion-scale-x-56': 0.86,
          '--motion-scale-y-56': 1.07,
          '--motion-scale-x-66': 1.1,
          '--motion-scale-y-66': 0.88,
          '--motion-scale-x-78': 0.94,
          '--motion-scale-y-78': 1.06,
          '--motion-scale-x-89': 1.085,
          '--motion-scale-y-89': 0.9195,
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
        ],
      },
    ];

    const result = Rubber.style(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('custom intensity - web method', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: { intensity: 0.8, iterationDelay: 1000 } as RubberType,
    };

    const expectedResult = [
      {
        name: 'motion-rubber-05',
        duration: 2000,
        easing: 'linear',
        custom: {
          '--motion-scale-x-45': 1.11,
          '--motion-scale-y-45': 0.85,
          '--motion-scale-x-56': 0.86,
          '--motion-scale-y-56': 1.07,
          '--motion-scale-x-66': 1.1,
          '--motion-scale-y-66': 0.88,
          '--motion-scale-x-78': 0.94,
          '--motion-scale-y-78': 1.06,
          '--motion-scale-x-89': 1.085,
          '--motion-scale-y-89': 0.9195,
          '--motion-scale-x-100': 1,
          '--motion-scale-y-100': 1,
        },
        keyframes: [
          {
            offset: 0.225,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1.11, 0.85)',
          },
          {
            offset: 0.28,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(0.86, 1.07)',
          },
          {
            offset: 0.33,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1.1, 0.88)',
          },
          {
            offset: 0.39,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(0.94, 1.06)',
          },
          {
            offset: 0.445,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1.085, 0.9195)',
          },
          {
            offset: 0.5,
            transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1, 1)',
          },
        ],
      },
    ];

    const result = Rubber.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
