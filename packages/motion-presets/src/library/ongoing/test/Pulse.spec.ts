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
            '--motion-scale-27': 0.96,
            '--motion-scale-72': 0.93,
          },
          keyframes: [
            {
              offset: 0.27,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(0.96)',
            },
            {
              offset: 0.45,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.72,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(0.93)',
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
            '--motion-scale-27': 0.9051,
            '--motion-scale-72': 0.834,
          },
          keyframes: [
            {
              offset: 0.18090000000000003,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(0.9051)',
            },
            {
              offset: 0.30150000000000005,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.4824,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(0.834)',
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
            '--motion-scale-27': 0.96,
            '--motion-scale-72': 0.93,
          },
          keyframes: [
            {
              offset: 0.27,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-27))',
            },
            {
              offset: 0.45,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.72,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-72))',
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
            '--motion-scale-27': 0.9051,
            '--motion-scale-72': 0.834,
          },
          keyframes: [
            {
              offset: 0.18090000000000003,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-27))',
            },
            {
              offset: 0.30150000000000005,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
            },
            {
              offset: 0.4824,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(var(--motion-scale-72))',
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

      expect(result[0]).toHaveProperty('custom');
      expect(result[0].custom).toEqual({
        '--motion-scale-27': 0.9257,
        '--motion-scale-72': 0.87,
      });
    });
  });
});

describe('Pulse scale', () => {
  const scalesOf = (scale: number) =>
    PulseAnimation.web({ ...baseMockOptions, namedEffect: { scale } as Pulse })[0].keyframes.map(
      ({ transform }) => parseFloat((transform as string).match(/scale\(([^)]+)\)/)![1]),
    );

  test.each([0.93, 0.87, 0.5, 1.2])('the deeper beat is the scale %s', (scale) => {
    const scales = scalesOf(scale);
    const deepest = scales.reduce((a, b) => (Math.abs(b - 1) > Math.abs(a - 1) ? b : a));
    expect(deepest).toBe(scale);
    expect(scales[0]).toBeCloseTo(1 - (4 / 7) * (1 - scale), 4);
  });

  test('keeps the layout rotation', () => {
    for (const { transform } of PulseAnimation.style({
      ...baseMockOptions,
      namedEffect: {} as Pulse,
    })[0].keyframes) {
      expect(transform).toMatch(/^rotateZ\(var\(--motion-rotate, 0deg\)\) scale\(/);
    }
  });
});
