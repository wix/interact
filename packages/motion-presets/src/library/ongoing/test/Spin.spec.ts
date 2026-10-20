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
            '--motion-rotate-start': '-360deg',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'linear',
              rotate: '-360deg',
            },
            {
              offset: 1,
              rotate: '0deg',
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
          name: 'motion-spin-067-quintInOut',
          easing: 'linear',
          namedEffect: {
            iterationDelay: 500,
          } as Spin,
          duration: 1500,
          custom: {
            '--motion-rotate-start': '-360deg',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.86, 0, 0.07, 1)',
              rotate: '-360deg',
            },
            {
              offset: 0.67,
              rotate: '0deg',
            },
            {
              offset: 1,
              rotate: '0deg',
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
            '--motion-rotate-start': '360deg',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'linear',
              rotate: '360deg',
            },
            {
              offset: 1,
              rotate: '0deg',
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
            '--motion-rotate-start': '-360deg',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'linear',
              rotate: 'var(--motion-rotate-start)',
            },
            {
              offset: 1,
              rotate: '0deg',
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
          namedEffect: {
            iterationDelay: 200,
          } as Spin,
          duration: 1000,
          custom: {
            '--motion-rotate-start': '-360deg',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'linear',
              rotate: 'var(--motion-rotate-start)',
            },
            {
              offset: 0.8,
              rotate: '0deg',
            },
            {
              offset: 1,
              rotate: '0deg',
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
            '--motion-rotate-start': '360deg',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'linear',
              rotate: 'var(--motion-rotate-start)',
            },
            {
              offset: 1,
              rotate: '0deg',
            },
          ],
        },
      ];

      const result = SpinAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});

describe('Spin rotation', () => {
  test.each(['clockwise', 'counter-clockwise'])(
    'turns %s without adding the layout rotation',
    (direction) => {
      for (const method of [SpinAnimation.web, SpinAnimation.style]) {
        const [animation] = method({
          ...baseMockOptions,
          namedEffect: { direction } as Spin,
        });
        expect(JSON.stringify(animation)).not.toContain('--motion-rotate,');
        expect(animation.keyframes.at(-1)!.rotate).toBe('0deg');
      }
      expect(
        SpinAnimation.web({ ...baseMockOptions, namedEffect: { direction } as Spin })[0]
          .keyframes[0].rotate,
      ).toBe(direction === 'clockwise' ? '-360deg' : '360deg');
    },
  );
});
