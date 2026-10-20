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
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.25,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 1 * 15deg)) rotateY(calc(0 * 1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.75,
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
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

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-fold-067-qiboha',
          duration: 1500,
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.1675,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 1 * 15deg)) rotateY(calc(0 * 1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.5025000000000001,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * -1 * 15deg)) rotateY(calc(0 * -1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.67,
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

    test('custom pivot - right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'right' } as Fold,
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
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(50%) translateY(0%) perspective(800px) rotateX(calc(0 * 0 * 15deg)) rotateY(calc(1 * 0 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 0.25,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(50%) translateY(0%) perspective(800px) rotateX(calc(0 * 1 * 15deg)) rotateY(calc(1 * 1 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 0.75,
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
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

    test('custom pivot - left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'left' } as Fold,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-fold',
          custom: {
            '--motion-origin-x': '-50%',
            '--motion-origin-y': '0%',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '0',
            '--motion-rotate-y': '-1',
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(-50%) translateY(0%) perspective(800px) rotateX(calc(0 * 0 * 15deg)) rotateY(calc(-1 * 0 * 15deg)) translateX(calc(-1 * -50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 0.25,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(-50%) translateY(0%) perspective(800px) rotateX(calc(0 * 1 * 15deg)) rotateY(calc(-1 * 1 * 15deg)) translateX(calc(-1 * -50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 0.75,
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(-50%) translateY(0%) perspective(800px) rotateX(calc(0 * -1 * 15deg)) rotateY(calc(-1 * -1 * 15deg)) translateX(calc(-1 * -50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(-50%) translateY(0%) perspective(800px) rotateX(calc(0 * 0 * 15deg)) rotateY(calc(-1 * 0 * 15deg)) translateX(calc(-1 * -50%)) translateY(calc(-1 * 0%))',
            },
          ],
        },
      ];

      const result = FoldAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - bottom', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'bottom' } as Fold,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-fold',
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '50%',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '-1',
            '--motion-rotate-y': '0',
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(50%) perspective(800px) rotateX(calc(-1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              offset: 0.25,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(50%) perspective(800px) rotateX(calc(-1 * 1 * 15deg)) rotateY(calc(0 * 1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              offset: 0.75,
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(50%) perspective(800px) rotateX(calc(-1 * -1 * 15deg)) rotateY(calc(0 * -1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(50%) perspective(800px) rotateX(calc(-1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
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
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 0 * 30deg)) rotateY(calc(0 * 0 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.25,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(0%) translateY(-50%) perspective(800px) rotateX(calc(1 * 1 * 30deg)) rotateY(calc(0 * 1 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.75,
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
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
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * 0 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * 0 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.25,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * 1 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * 1 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.75,
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * -1 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * -1 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * 0 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * 0 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
          ],
        },
      ];

      const result = FoldAnimation.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'right' } as Fold,
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
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * 0 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * 0 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.25,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * 1 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * 1 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.75,
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * -1 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * -1 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * 0 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * 0 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
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

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-fold-067-qiboha',
          duration: 1500,
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * 0 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * 0 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.1675,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * 1 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * 1 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.5025000000000001,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * -1 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * -1 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.67,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * 0 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * 0 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) perspective(var(--motion-perspective)) rotateX(calc(var(--motion-rotate-x) * 0 * var(--motion-rotate-angle))) rotateY(calc(var(--motion-rotate-y) * 0 * var(--motion-rotate-angle))) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
          ],
        },
      ];

      const result = FoldAnimation.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
