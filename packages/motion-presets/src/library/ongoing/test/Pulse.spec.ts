import { describe, expect, test } from 'vitest';

import * as PulseAnimation from '../Pulse';
import { Pulse, TimeAnimationOptions, AnimationData } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Pulse', () => {
  test('schema', () => {
    expect(PulseAnimation.schema).toEqual({
      iterationDelay: {
        type: 'number',
        min: 0,
        default: 0,
      },
      scale: {
        type: 'number',
        min: 0,
        default: 0.93,
      },
    });
  });

  describe('web() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Pulse,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-pulse-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-pulse-scale': 0.93,
          },
          keyframes: [
            {
              offset: 0,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.27,
              transform:
                'rotate(var(--motion-rotate, 0deg)) scale(calc(1 + (0.93 - 1) * 0.5714285714285714))',
            },
            {
              offset: 0.45,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.72,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(calc(1 + (0.93 - 1) * 1))',
            },
            {
              offset: 1,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
          ],
        },
      ];

      const result = PulseAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom scale, duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {
          scale: 1.2,
          iterationDelay: 500,
        } as Pulse,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-pulse-067',
          duration: 1500,
          easing: 'linear',
          custom: {
            '--motion-pulse-scale': 1.2,
          },
          keyframes: [
            {
              offset: 0,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.18,
              transform:
                'rotate(var(--motion-rotate, 0deg)) scale(calc(1 + (1.2 - 1) * 0.5714285714285714))',
            },
            {
              offset: 0.3,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.48,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(calc(1 + (1.2 - 1) * 1))',
            },
            {
              offset: 0.6666666666666666,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 1,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
          ],
        },
      ];

      const result = PulseAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Pulse,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-pulse-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-pulse-scale': 0.93,
          },
          keyframes: [
            {
              offset: 0,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.27,
              transform:
                'rotate(var(--motion-rotate, 0deg)) scale(calc(1 + (var(--motion-pulse-scale) - 1) * 0.5714285714285714))',
            },
            {
              offset: 0.45,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.72,
              transform:
                'rotate(var(--motion-rotate, 0deg)) scale(calc(1 + (var(--motion-pulse-scale) - 1) * 1))',
            },
            {
              offset: 1,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
          ],
        },
      ];

      const result = PulseAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom scale, duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {
          scale: 1.2,
          iterationDelay: 500,
        } as Pulse,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-pulse-067',
          duration: 1500,
          easing: 'linear',
          custom: {
            '--motion-pulse-scale': 1.2,
          },
          keyframes: [
            {
              offset: 0,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.18,
              transform:
                'rotate(var(--motion-rotate, 0deg)) scale(calc(1 + (var(--motion-pulse-scale) - 1) * 0.5714285714285714))',
            },
            {
              offset: 0.3,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.48,
              transform:
                'rotate(var(--motion-rotate, 0deg)) scale(calc(1 + (var(--motion-pulse-scale) - 1) * 1))',
            },
            {
              offset: 0.6666666666666666,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 1,
              transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
            },
          ],
        },
      ];

      const result = PulseAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('getNames()', () => {
    test('default options', () => {
      expect(PulseAnimation.getNames({ ...baseMockOptions, namedEffect: {} as Pulse })).toEqual([
        'motion-pulse-1',
      ]);
    });

    test('custom duration and delay', () => {
      expect(
        PulseAnimation.getNames({
          ...baseMockOptions,
          duration: 1000,
          namedEffect: { iterationDelay: 500 } as Pulse,
        }),
      ).toEqual(['motion-pulse-067']);
    });
  });
});
