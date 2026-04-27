import { describe, expect, test } from 'vitest';

import * as FoldAnimation from '../Fold';
import { Fold, TimeAnimationOptions, AnimationData } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Fold', () => {
  describe('web() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Fold,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-fold',
          duration: 1,
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              offset: 0.25,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 1 * 15deg)) rotateY(calc(0 * 1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
              offset: 0.75,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * -1 * 15deg)) rotateY(calc(0 * -1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
          ],
        },
      ];

      const result = FoldAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('default angle, custom duration, delay, and easing', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        namedEffect: { iterationDelay: 500 } as Fold,
      };

      const dynamicName = `motion-fold-067`;

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: dynamicName,
          duration: 1500,
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.067,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 1 * 15deg)) rotateY(calc(0 * 1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.20234,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * -0.7 * 15deg)) rotateY(calc(0 * -0.7 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.33768000000000004,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 0.6 * 15deg)) rotateY(calc(0 * 0.6 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.4596200000000001,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * -0.3 * 15deg)) rotateY(calc(0 * -0.3 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.56749,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 0.2 * 15deg)) rotateY(calc(0 * 0.2 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.70283,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * -0.05 * 15deg)) rotateY(calc(0 * -0.05 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.7966300000000001,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
          ],
        },
      ];

      const result = FoldAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'right' } as Fold,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-fold',
          custom: {
            '--motion-origin-x': '50%',
            '--motion-origin-y': '0%',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '0',
            '--motion-rotate-y': '1',
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(50%) translateY(0%) perspective(800px) rotateX(calc(0 * 0 * 15deg)) rotateY(calc(1 * 0 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              offset: 0.25,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(50%) translateY(0%) perspective(800px) rotateX(calc(0 * 1 * 15deg)) rotateY(calc(1 * 1 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
              offset: 0.75,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(50%) translateY(0%) perspective(800px) rotateX(calc(0 * -1 * 15deg)) rotateY(calc(1 * -1 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(50%) translateY(0%) perspective(800px) rotateX(calc(0 * 0 * 15deg)) rotateY(calc(1 * 0 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
          ],
        },
      ];

      const result = FoldAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as Fold,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-fold',
          custom: {
            '--motion-origin-x': '-50%',
            '--motion-origin-y': '0%',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '0',
            '--motion-rotate-y': '1',
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(-50%) translateY(0%) perspective(800px) rotateX(calc(0 * 0 * 15deg)) rotateY(calc(1 * 0 * 15deg)) translateX(calc(-1 * -50%)) translateY(calc(-1 * 0%))',
            },
            {
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              offset: 0.25,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(-50%) translateY(0%) perspective(800px) rotateX(calc(0 * 1 * 15deg)) rotateY(calc(1 * 1 * 15deg)) translateX(calc(-1 * -50%)) translateY(calc(-1 * 0%))',
            },
            {
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
              offset: 0.75,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(-50%) translateY(0%) perspective(800px) rotateX(calc(0 * -1 * 15deg)) rotateY(calc(1 * -1 * 15deg)) translateX(calc(-1 * -50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(-50%) translateY(0%) perspective(800px) rotateX(calc(0 * 0 * 15deg)) rotateY(calc(1 * 0 * 15deg)) translateX(calc(-1 * -50%)) translateY(calc(-1 * 0%))',
            },
          ],
        },
      ];

      const result = FoldAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - bottom', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'bottom' } as Fold,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-fold',
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '50%',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(50%) perspective(800px) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              offset: 0.25,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(50%) perspective(800px) rotateX(calc(1 * 1 * 15deg)) rotateY(calc(0 * 1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
              offset: 0.75,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(50%) perspective(800px) rotateX(calc(1 * -1 * 15deg)) rotateY(calc(0 * -1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(50%) perspective(800px) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
          ],
        },
      ];

      const result = FoldAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom angle', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { angle: 30 } as Fold,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-fold',
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-rotate-angle': '30deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 0 * 30deg)) rotateY(calc(0 * 0 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              offset: 0.25,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 1 * 30deg)) rotateY(calc(0 * 1 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
              offset: 0.75,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * -1 * 30deg)) rotateY(calc(0 * -1 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 0 * 30deg)) rotateY(calc(0 * 0 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
          ],
        },
      ];

      const result = FoldAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Fold,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-fold',
          duration: 1,
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              offset: 0.25,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * 1 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 1 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
              offset: 0.75,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * -1 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -1 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
          ],
        },
      ];

      const result = FoldAnimation.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'right' } as Fold,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-fold',
          custom: {
            '--motion-origin-x': '50%',
            '--motion-origin-y': '0%',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '0',
            '--motion-rotate-y': '1',
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              offset: 0.25,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * 1 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 1 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
              offset: 0.75,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * -1 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -1 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
          ],
        },
      ];

      const result = FoldAnimation.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('with delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        namedEffect: { iterationDelay: 500 } as Fold,
      };

      const dynamicName = `motion-fold-067`;

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: dynamicName,
          duration: 1500,
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.067,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * 1 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 1 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.20234,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * -0.7 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.7 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.33768000000000004,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * 0.6 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0.6 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.4596200000000001,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * -0.3 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.3 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.56749,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * 0.2 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0.2 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.70283,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * -0.05 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.05 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              offset: 0.7966300000000001,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(800px) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
          ],
        },
      ];

      const result = FoldAnimation.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
