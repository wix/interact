import { describe, expect, test } from 'vitest';

import * as RubberAnimation from '../Rubber';
import { Rubber, TimeAnimationOptions, AnimationData } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Rubber', () => {
  test('schema', () => {
    expect(RubberAnimation.schema).toEqual({
      iterationDelay: {
        type: 'number',
        min: 0,
        default: 0,
      },
      stretch: {
        type: 'number',
        min: -1,
        max: 1,
        default: 0.1,
      },
    });
  });

  describe('web() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Rubber,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-rubber-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-rubber-stretch': 0.1,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.1 * 0), calc(1 + 0.1 * 0))',
            },
            {
              offset: 0.45,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.1 * -1), calc(1 + 0.1 * -1))',
            },
            {
              offset: 0.56,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.1 * 0.9), calc(1 + 0.1 * 0.9))',
            },
            {
              offset: 0.66,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.1 * -0.8), calc(1 + 0.1 * -0.8))',
            },
            {
              offset: 0.78,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.1 * 0.45), calc(1 + 0.1 * 0.45))',
            },
            {
              offset: 0.89,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.1 * -0.5275), calc(1 + 0.1 * -0.5275))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.1 * 0), calc(1 + 0.1 * 0))',
            },
          ],
        },
      ];

      const result = RubberAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom stretch, duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {
          stretch: 0.2,
          iterationDelay: 500,
        } as Rubber,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-rubber-067',
          duration: 1500,
          easing: 'linear',
          custom: {
            '--motion-rubber-stretch': 0.2,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.2 * 0), calc(1 + 0.2 * 0))',
            },
            {
              offset: 0.3,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.2 * -1), calc(1 + 0.2 * -1))',
            },
            {
              offset: 0.37333333333333335,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.2 * 0.9), calc(1 + 0.2 * 0.9))',
            },
            {
              offset: 0.44,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.2 * -0.8), calc(1 + 0.2 * -0.8))',
            },
            {
              offset: 0.52,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.2 * 0.45), calc(1 + 0.2 * 0.45))',
            },
            {
              offset: 0.5933333333333333,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.2 * -0.5275), calc(1 + 0.2 * -0.5275))',
            },
            {
              offset: 0.6666666666666666,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - 0.2 * 0), calc(1 + 0.2 * 0))',
            },
          ],
        },
      ];

      const result = RubberAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Rubber,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-rubber-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-rubber-stretch': 0.1,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * 0), calc(1 + var(--motion-rubber-stretch) * 0))',
            },
            {
              offset: 0.45,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * -1), calc(1 + var(--motion-rubber-stretch) * -1))',
            },
            {
              offset: 0.56,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * 0.9), calc(1 + var(--motion-rubber-stretch) * 0.9))',
            },
            {
              offset: 0.66,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * -0.8), calc(1 + var(--motion-rubber-stretch) * -0.8))',
            },
            {
              offset: 0.78,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * 0.45), calc(1 + var(--motion-rubber-stretch) * 0.45))',
            },
            {
              offset: 0.89,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * -0.5275), calc(1 + var(--motion-rubber-stretch) * -0.5275))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * 0), calc(1 + var(--motion-rubber-stretch) * 0))',
            },
          ],
        },
      ];

      const result = RubberAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom stretch, duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {
          stretch: 0.2,
          iterationDelay: 500,
        } as Rubber,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-rubber-067',
          duration: 1500,
          easing: 'linear',
          custom: {
            '--motion-rubber-stretch': 0.2,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * 0), calc(1 + var(--motion-rubber-stretch) * 0))',
            },
            {
              offset: 0.3,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * -1), calc(1 + var(--motion-rubber-stretch) * -1))',
            },
            {
              offset: 0.37333333333333335,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * 0.9), calc(1 + var(--motion-rubber-stretch) * 0.9))',
            },
            {
              offset: 0.44,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * -0.8), calc(1 + var(--motion-rubber-stretch) * -0.8))',
            },
            {
              offset: 0.52,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * 0.45), calc(1 + var(--motion-rubber-stretch) * 0.45))',
            },
            {
              offset: 0.5933333333333333,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * -0.5275), calc(1 + var(--motion-rubber-stretch) * -0.5275))',
            },
            {
              offset: 0.6666666666666666,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - var(--motion-rubber-stretch) * 0), calc(1 + var(--motion-rubber-stretch) * 0))',
            },
          ],
        },
      ];

      const result = RubberAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('getNames()', () => {
    test('default options', () => {
      expect(RubberAnimation.getNames({ ...baseMockOptions, namedEffect: {} as Rubber })).toEqual([
        'motion-rubber-1',
      ]);
    });

    test('custom duration and delay', () => {
      expect(
        RubberAnimation.getNames({
          ...baseMockOptions,
          duration: 1000,
          namedEffect: { iterationDelay: 500 } as Rubber,
        }),
      ).toEqual(['motion-rubber-067']);
    });
  });
});
