import { describe, expect, test } from 'vitest';

import * as PulseAnimation from '../Pulse';
import { Pulse, TimeAnimationOptions, AnimationData } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Pulse', () => {
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
          custom: {
            '--motion-scale': 0.93,
          },
          keyframes: [
            {
              offset: 0.27,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - (1 - 0.93) * 0.5714285714285714))',
            },
            {
              offset: 0.45,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.72,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - (1 - 0.93) * 1))',
            },
            {
              offset: 1,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
          ],
        },
      ];

      const result = PulseAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom scale and duration', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { scale: 0.834, iterationDelay: 500 } as Pulse,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-pulse-067',
          duration: 1500,
          custom: {
            '--motion-scale': 0.834,
          },
          keyframes: [
            {
              offset: 0.1809,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - (1 - 0.834) * 0.5714285714285714))',
            },
            {
              offset: 0.3015,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.4824,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - (1 - 0.834) * 1))',
            },
            {
              offset: 0.67,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 1,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
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
          custom: {
            '--motion-scale': 0.93,
          },
          keyframes: [
            {
              offset: 0.27,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - (1 - var(--motion-scale)) * 0.5714285714285714))',
            },
            {
              offset: 0.45,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.72,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - (1 - var(--motion-scale)) * 1))',
            },
            {
              offset: 1,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
          ],
        },
      ];

      const result = PulseAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom scale and duration', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { scale: 0.834, iterationDelay: 500 } as Pulse,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-pulse-067',
          duration: 1500,
          custom: {
            '--motion-scale': 0.834,
          },
          keyframes: [
            {
              offset: 0.1809,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - (1 - var(--motion-scale)) * 0.5714285714285714))',
            },
            {
              offset: 0.3015,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.4824,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - (1 - var(--motion-scale)) * 1))',
            },
            {
              offset: 0.67,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 1,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
          ],
        },
      ];

      const result = PulseAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('style method should populate custom properties correctly', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { scale: 0.87 } as Pulse,
      };

      const result = PulseAnimation.style(mockOptions);

      expect(result[0].custom).toEqual({ '--motion-scale': 0.87 });
    });
  });
});
