import { describe, expect, test } from 'vitest';

import * as WiggleAnimation from '../Wiggle';
import { Wiggle, TimeAnimationOptions, AnimationData } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Wiggle', () => {
  test('schema', () => {
    expect(WiggleAnimation.schema).toEqual({
      angle: {
        type: 'number',
        default: 25,
      },
      iterationDelay: {
        type: 'number',
        min: 0,
        default: 0,
      },
      travel: {
        type: 'length',
        default: {
          value: 25,
          unit: 'px',
        },
      },
    });
  });

  describe('web() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Wiggle,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-wiggle-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-wiggle-angle': '25deg',
            '--motion-wiggle-travel': '25px',
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + 25deg * 0)) translateY(calc(25px * 0))',
            },
            {
              offset: 0.18,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + 25deg * 1)) translateY(calc(25px * -1))',
            },
            {
              offset: 0.35,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + 25deg * -0.8)) translateY(calc(25px * 0))',
            },
            {
              offset: 0.53,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + 25deg * 0.6)) translateY(calc(25px * 0))',
            },
            {
              offset: 0.73,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + 25deg * -0.4)) translateY(calc(25px * 0))',
            },
            {
              offset: 1,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + 25deg * 0)) translateY(calc(25px * 0))',
            },
          ],
        },
      ];

      const result = WiggleAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom angle, travel, duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {
          angle: 10,
          travel: {
            value: 30,
            unit: 'percentage',
          },
          iterationDelay: 500,
        } as Wiggle,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-wiggle-067',
          duration: 1500,
          easing: 'linear',
          custom: {
            '--motion-wiggle-angle': '10deg',
            '--motion-wiggle-travel': '30%',
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + 10deg * 0)) translateY(calc(30% * 0))',
            },
            {
              offset: 0.12,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + 10deg * 1)) translateY(calc(30% * -1))',
            },
            {
              offset: 0.2333333333333333,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + 10deg * -0.8)) translateY(calc(30% * 0))',
            },
            {
              offset: 0.35333333333333333,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + 10deg * 0.6)) translateY(calc(30% * 0))',
            },
            {
              offset: 0.48666666666666664,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + 10deg * -0.4)) translateY(calc(30% * 0))',
            },
            {
              offset: 0.6666666666666666,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + 10deg * 0)) translateY(calc(30% * 0))',
            },
          ],
        },
      ];

      const result = WiggleAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Wiggle,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-wiggle-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-wiggle-angle': '25deg',
            '--motion-wiggle-travel': '25px',
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-wiggle-angle) * 0)) translateY(calc(var(--motion-wiggle-travel) * 0))',
            },
            {
              offset: 0.18,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-wiggle-angle) * 1)) translateY(calc(var(--motion-wiggle-travel) * -1))',
            },
            {
              offset: 0.35,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-wiggle-angle) * -0.8)) translateY(calc(var(--motion-wiggle-travel) * 0))',
            },
            {
              offset: 0.53,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-wiggle-angle) * 0.6)) translateY(calc(var(--motion-wiggle-travel) * 0))',
            },
            {
              offset: 0.73,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-wiggle-angle) * -0.4)) translateY(calc(var(--motion-wiggle-travel) * 0))',
            },
            {
              offset: 1,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-wiggle-angle) * 0)) translateY(calc(var(--motion-wiggle-travel) * 0))',
            },
          ],
        },
      ];

      const result = WiggleAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom angle, travel, duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {
          angle: 10,
          travel: {
            value: 30,
            unit: 'percentage',
          },
          iterationDelay: 500,
        } as Wiggle,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-wiggle-067',
          duration: 1500,
          easing: 'linear',
          custom: {
            '--motion-wiggle-angle': '10deg',
            '--motion-wiggle-travel': '30%',
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-wiggle-angle) * 0)) translateY(calc(var(--motion-wiggle-travel) * 0))',
            },
            {
              offset: 0.12,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-wiggle-angle) * 1)) translateY(calc(var(--motion-wiggle-travel) * -1))',
            },
            {
              offset: 0.2333333333333333,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-wiggle-angle) * -0.8)) translateY(calc(var(--motion-wiggle-travel) * 0))',
            },
            {
              offset: 0.35333333333333333,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-wiggle-angle) * 0.6)) translateY(calc(var(--motion-wiggle-travel) * 0))',
            },
            {
              offset: 0.48666666666666664,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-wiggle-angle) * -0.4)) translateY(calc(var(--motion-wiggle-travel) * 0))',
            },
            {
              offset: 0.6666666666666666,
              transform:
                'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-wiggle-angle) * 0)) translateY(calc(var(--motion-wiggle-travel) * 0))',
            },
          ],
        },
      ];

      const result = WiggleAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('getNames()', () => {
    test('default options', () => {
      expect(WiggleAnimation.getNames({ ...baseMockOptions, namedEffect: {} as Wiggle })).toEqual([
        'motion-wiggle-1',
      ]);
    });

    test('custom duration and delay', () => {
      expect(
        WiggleAnimation.getNames({
          ...baseMockOptions,
          duration: 1000,
          namedEffect: { iterationDelay: 500 } as Wiggle,
        }),
      ).toEqual(['motion-wiggle-067']);
    });
  });
});
