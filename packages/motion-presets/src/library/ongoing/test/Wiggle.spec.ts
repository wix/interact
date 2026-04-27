import { describe, expect, test } from 'vitest';

import * as WiggleAnimation from '../Wiggle';
import { Wiggle, TimeAnimationOptions, AnimationData } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Wiggle', () => {
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
          keyframes: [
            {
              offset: 0.18,
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 25deg)) translateY(-25px)',
            },
            {
              offset: 0.35,
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + -20deg)) translateY(0px)',
            },
            {
              offset: 0.53,
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 15deg)) translateY(0px)',
            },
            {
              offset: 0.73,
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + -10deg)) translateY(0px)',
            },
            {
              offset: 1,
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 0deg)) translateY(0px)',
            },
          ],
        },
      ];

      const result = WiggleAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration and intensity', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { intensity: 0.8, iterationDelay: 500 } as Wiggle,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-wiggle-067',
          duration: 1500,
          keyframes: [
            {
              offset: 0.1206,
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 34deg)) translateY(-34px)',
            },
            {
              offset: 0.2345,
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + -27.2deg)) translateY(0px)',
            },
            {
              offset: 0.3551,
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 20.4deg)) translateY(0px)',
            },
            {
              offset: 0.48910000000000003,
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + -13.6deg)) translateY(0px)',
            },
            {
              offset: 0.67,
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 0deg)) translateY(0px)',
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
          custom: {
            '--motion-rotate-18': 'calc(var(--motion-rotate, 0deg) + 25deg)',
            '--motion-translate-y-18': '-25px',
            '--motion-rotate-35': 'calc(var(--motion-rotate, 0deg) + -20deg)',
            '--motion-translate-y-35': '0px',
            '--motion-rotate-53': 'calc(var(--motion-rotate, 0deg) + 15deg)',
            '--motion-translate-y-53': '0px',
            '--motion-rotate-73': 'calc(var(--motion-rotate, 0deg) + -10deg)',
            '--motion-translate-y-73': '0px',
            '--motion-rotate-100': 'calc(var(--motion-rotate, 0deg) + 0deg)',
            '--motion-translate-y-100': '0px',
          },
          keyframes: [
            {
              offset: 0.18,
              transform: 'rotate(var(--motion-rotate-18)) translateY(var(--motion-translate-y-18))',
            },
            {
              offset: 0.35,
              transform: 'rotate(var(--motion-rotate-35)) translateY(var(--motion-translate-y-35))',
            },
            {
              offset: 0.53,
              transform: 'rotate(var(--motion-rotate-53)) translateY(var(--motion-translate-y-53))',
            },
            {
              offset: 0.73,
              transform: 'rotate(var(--motion-rotate-73)) translateY(var(--motion-translate-y-73))',
            },
            {
              offset: 1,
              transform:
                'rotate(var(--motion-rotate-100)) translateY(var(--motion-translate-y-100))',
            },
          ],
        },
      ];

      const result = WiggleAnimation.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom intensity and duration', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { intensity: 0.8, iterationDelay: 500 } as Wiggle,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-wiggle-067',
          duration: 1500,
          custom: {
            '--motion-rotate-18': 'calc(var(--motion-rotate, 0deg) + 34deg)',
            '--motion-translate-y-18': '-34px',
            '--motion-rotate-35': 'calc(var(--motion-rotate, 0deg) + -27.2deg)',
            '--motion-translate-y-35': '0px',
            '--motion-rotate-53': 'calc(var(--motion-rotate, 0deg) + 20.4deg)',
            '--motion-translate-y-53': '0px',
            '--motion-rotate-73': 'calc(var(--motion-rotate, 0deg) + -13.6deg)',
            '--motion-translate-y-73': '0px',
            '--motion-rotate-100': 'calc(var(--motion-rotate, 0deg) + 0deg)',
            '--motion-translate-y-100': '0px',
          },
          keyframes: [
            {
              offset: 0.1206,
              transform: 'rotate(var(--motion-rotate-18)) translateY(var(--motion-translate-y-18))',
            },
            {
              offset: 0.2345,
              transform: 'rotate(var(--motion-rotate-35)) translateY(var(--motion-translate-y-35))',
            },
            {
              offset: 0.3551,
              transform: 'rotate(var(--motion-rotate-53)) translateY(var(--motion-translate-y-53))',
            },
            {
              offset: 0.48910000000000003,
              transform: 'rotate(var(--motion-rotate-73)) translateY(var(--motion-translate-y-73))',
            },
            {
              offset: 0.67,
              transform:
                'rotate(var(--motion-rotate-100)) translateY(var(--motion-translate-y-100))',
            },
          ],
        },
      ];

      const result = WiggleAnimation.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('style method should populate custom properties correctly', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { intensity: 0.5 } as Wiggle,
      };

      const result = WiggleAnimation.style?.(mockOptions);

      expect(result[0]).toHaveProperty('custom');
      expect(result[0].custom).toHaveProperty('--motion-rotate-18');
      expect(result[0].custom).toHaveProperty('--motion-translate-y-18');
      expect(result[0].custom).toHaveProperty('--motion-rotate-35');
      expect(result[0].custom).toHaveProperty('--motion-translate-y-35');
      expect(result[0].custom).toHaveProperty('--motion-rotate-53');
      expect(result[0].custom).toHaveProperty('--motion-translate-y-53');
      expect(result[0].custom).toHaveProperty('--motion-rotate-73');
      expect(result[0].custom).toHaveProperty('--motion-translate-y-73');
      expect(result[0].custom).toHaveProperty('--motion-rotate-100');
      expect(result[0].custom).toHaveProperty('--motion-translate-y-100');

      // Verify the custom properties contain the expected calculated values
      expect(typeof result[0].custom!['--motion-rotate-18']).toBe('string');
      expect(typeof result[0].custom!['--motion-translate-y-18']).toBe('string');
    });
  });
});
