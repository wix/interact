import { describe, expect, test } from 'vitest';

import * as SpinAnimation from '../Spin';
import { Spin, TimeAnimationOptions, AnimationData } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Spin', () => {
  describe('web() method', () => {
    test('Spin animation with default options', () => {
      const duration = 1000;
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration,
        namedEffect: {} as Spin,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-spin-1',
          easing: 'linear',
          duration: 1000,
          custom: {
            '--motion-rotate-start': 'calc(var(--motion-rotate, 0deg) + -360deg)',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'linear',
              rotate: 'calc(var(--motion-rotate, 0deg) + -360deg)',
            },
            {
              offset: 1,
              rotate: 'var(--motion-rotate, 0deg)',
            },
          ],
        },
      ];

      const result = SpinAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Spin animation with custom duration, delay, and easing', () => {
      const duration = 1000;
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration,
        easing: 'quintInOut',
        namedEffect: { iterationDelay: 500 } as Spin,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-spin-067',
          easing: 'linear',
          namedEffect: { iterationDelay: 500 } as Spin,
          duration: 1500,
          custom: {
            '--motion-rotate-start': 'calc(var(--motion-rotate, 0deg) + -360deg)',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.86, 0, 0.07, 1)',
              rotate: 'calc(var(--motion-rotate, 0deg) + -360deg)',
            },
            {
              offset: 0.67,
              rotate: 'var(--motion-rotate, 0deg)',
            },
          ],
        },
      ];

      const result = SpinAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Spin animation with counter-clockwise direction', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { direction: 'counter-clockwise' } as Spin,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-spin-1',
          custom: {
            '--motion-rotate-start': 'calc(var(--motion-rotate, 0deg) + 360deg)',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'linear',
              rotate: 'calc(var(--motion-rotate, 0deg) + 360deg)',
            },
            {
              offset: 1,
              rotate: 'var(--motion-rotate, 0deg)',
            },
          ],
        },
      ];

      const result = SpinAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style() method', () => {
    test('Spin.style animation with default options', () => {
      const duration = 1000;
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration,
        namedEffect: {} as Spin,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-spin-1',
          easing: 'linear',
          duration: 1000,
          custom: {
            '--motion-rotate-start': 'calc(var(--motion-rotate, 0deg) + -360deg)',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'linear',
              rotate: 'var(--motion-rotate-start)',
            },
            {
              offset: 1,
              rotate: 'var(--motion-rotate, 0deg)',
            },
          ],
        },
      ];

      const result = SpinAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Spin.style animation with custom duration and delay', () => {
      const duration = 800;
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration,
        namedEffect: { iterationDelay: 200 } as Spin,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-spin-08',
          easing: 'linear',
          namedEffect: { iterationDelay: 200 } as Spin,
          duration: 1000,
          custom: {
            '--motion-rotate-start': 'calc(var(--motion-rotate, 0deg) + -360deg)',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'linear',
              rotate: 'var(--motion-rotate-start)',
            },
            {
              offset: 0.8, // duration / (duration + delay)
              rotate: 'var(--motion-rotate, 0deg)',
            },
          ],
        },
      ];

      const result = SpinAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Spin.style animation with counter-clockwise direction', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { direction: 'counter-clockwise' } as Spin,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-spin-1',
          custom: {
            '--motion-rotate-start': 'calc(var(--motion-rotate, 0deg) + 360deg)',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'linear',
              rotate: 'var(--motion-rotate-start)',
            },
            {
              offset: 1,
              rotate: 'var(--motion-rotate, 0deg)',
            },
          ],
        },
      ];

      const result = SpinAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
