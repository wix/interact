import { describe, expect, test } from 'vitest';

import * as BreatheAnimation from '../Breathe';
import { Breathe, TimeAnimationOptions, AnimationData } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Breathe', () => {
  describe('web() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
            '--motion-breathe-z': 0,
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0,
              transform: ' translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.25,
              transform:
                ' translate3d(calc(0 * 25px), calc(1 * 25px), calc(0 * 25px)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
              offset: 0.75,
              transform:
                ' translate3d(calc(0 * -1 * 25px), calc(1 * -1 * 25px), calc(0 * -1 * 25px)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: ' translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { iterationDelay: 500 } as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-067',
          duration: 1500,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
            '--motion-breathe-z': 0,
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0,
              transform: ' translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.067,
              transform:
                ' translate3d(calc(0 * 25px * 1), calc(1 * 25px * 1), calc(0 * 25px * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.20234,
              transform:
                ' translate3d(calc(0 * 25px * -1), calc(1 * 25px * -1), calc(0 * 25px * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.33768000000000004,
              transform:
                ' translate3d(calc(0 * 25px * 1), calc(1 * 25px * 1), calc(0 * 25px * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.47235,
              transform:
                ' translate3d(calc(0 * 25px * -0.7), calc(1 * 25px * -0.7), calc(0 * 25px * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.56213,
              transform:
                ' translate3d(calc(0 * 25px * 0.6), calc(1 * 25px * 0.6), calc(0 * 25px * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: ' translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom distance', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { distance: { value: 50, unit: 'percentage' } } as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '50%',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
            '--motion-breathe-z': 0,
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0,
              transform: ' translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.25,
              transform:
                ' translate3d(calc(0 * 50%), calc(1 * 50%), calc(0 * 50%)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
              offset: 0.75,
              transform:
                ' translate3d(calc(0 * -1 * 50%), calc(1 * -1 * 50%), calc(0 * -1 * 50%)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: ' translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom easing', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        easing: 'easeIn',
        namedEffect: {} as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
            '--motion-breathe-z': 0,
          },
          keyframes: [
            {
              easing: 'ease-out',
              offset: 0,
              transform: ' translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'ease-in-out',
              offset: 0.25,
              transform:
                ' translate3d(calc(0 * 25px), calc(1 * 25px), calc(0 * 25px)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'ease-in',
              offset: 0.75,
              transform:
                ' translate3d(calc(0 * -1 * 25px), calc(1 * -1 * 25px), calc(0 * -1 * 25px)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: ' translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - horizontal', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'horizontal' } as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 1,
            '--motion-breathe-y': 0,
            '--motion-breathe-z': 0,
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0,
              transform: ' translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.25,
              transform:
                ' translate3d(calc(1 * 25px), calc(0 * 25px), calc(0 * 25px)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
              offset: 0.75,
              transform:
                ' translate3d(calc(1 * -1 * 25px), calc(0 * -1 * 25px), calc(0 * -1 * 25px)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: ' translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - center', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'center' } as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': 'perspective(800px)',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 0,
            '--motion-breathe-z': 1,
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0,
              transform:
                'perspective(800px) translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.25,
              transform:
                'perspective(800px) translate3d(calc(0 * 25px), calc(0 * 25px), calc(1 * 25px)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
              offset: 0.75,
              transform:
                'perspective(800px) translate3d(calc(0 * -1 * 25px), calc(0 * -1 * 25px), calc(1 * -1 * 25px)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'perspective(800px) translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
            '--motion-breathe-z': 0,
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.25,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * var(--motion-breathe-distance)), calc(var(--motion-breathe-y) * var(--motion-breathe-distance)), calc(var(--motion-breathe-z) * var(--motion-breathe-distance))) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
              offset: 0.75,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * -1 * var(--motion-breathe-distance)), calc(var(--motion-breathe-y) * -1 * var(--motion-breathe-distance)), calc(var(--motion-breathe-z) * -1 * var(--motion-breathe-distance))) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { iterationDelay: 500 } as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-067',
          duration: 1500,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
            '--motion-breathe-z': 0,
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.067,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-z) * var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.20234,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * -1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * -1), calc(var(--motion-breathe-z) * var(--motion-breathe-distance) * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.33768000000000004,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-z) * var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.47235,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * -0.7), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * -0.7), calc(var(--motion-breathe-z) * var(--motion-breathe-distance) * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.56213,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0.6), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0.6), calc(var(--motion-breathe-z) * var(--motion-breathe-distance) * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom distance', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { distance: { value: 50, unit: 'percentage' } } as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '50%',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
            '--motion-breathe-z': 0,
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.25,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * var(--motion-breathe-distance)), calc(var(--motion-breathe-y) * var(--motion-breathe-distance)), calc(var(--motion-breathe-z) * var(--motion-breathe-distance))) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
              offset: 0.75,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * -1 * var(--motion-breathe-distance)), calc(var(--motion-breathe-y) * -1 * var(--motion-breathe-distance)), calc(var(--motion-breathe-z) * -1 * var(--motion-breathe-distance))) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - horizontal', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'horizontal' } as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 1,
            '--motion-breathe-y': 0,
            '--motion-breathe-z': 0,
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.25,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * var(--motion-breathe-distance)), calc(var(--motion-breathe-y) * var(--motion-breathe-distance)), calc(var(--motion-breathe-z) * var(--motion-breathe-distance))) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
              offset: 0.75,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * -1 * var(--motion-breathe-distance)), calc(var(--motion-breathe-y) * -1 * var(--motion-breathe-distance)), calc(var(--motion-breathe-z) * -1 * var(--motion-breathe-distance))) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - center', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'center' } as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': 'perspective(800px)',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 0,
            '--motion-breathe-z': 1,
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.25,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * var(--motion-breathe-distance)), calc(var(--motion-breathe-y) * var(--motion-breathe-distance)), calc(var(--motion-breathe-z) * var(--motion-breathe-distance))) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
              offset: 0.75,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(calc(var(--motion-breathe-x) * -1 * var(--motion-breathe-distance)), calc(var(--motion-breathe-y) * -1 * var(--motion-breathe-distance)), calc(var(--motion-breathe-z) * -1 * var(--motion-breathe-distance))) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('getNames() method', () => {
    test('default duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Breathe,
      };

      const result = BreatheAnimation.getNames(mockOptions);

      expect(result).toEqual(['motion-breathe-1']);
    });

    test('custom duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { iterationDelay: 500 } as Breathe,
      };

      const result = BreatheAnimation.getNames(mockOptions);

      expect(result).toEqual(['motion-breathe-067']);
    });

    test('different timing combinations', () => {
      const mockOptions1: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 2000,
        namedEffect: {} as Breathe,
      };

      const mockOptions2: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 500,
        namedEffect: { iterationDelay: 1000 } as Breathe,
      };

      const result1 = BreatheAnimation.getNames(mockOptions1);
      const result2 = BreatheAnimation.getNames(mockOptions2);

      expect(result1).toEqual(['motion-breathe-1']);
      expect(result2).toEqual(['motion-breathe-033']);
    });
  });
});
