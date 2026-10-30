import { describe, expect, test } from 'vitest';

import * as SwingAnimation from '../Swing';
import { Swing, TimeAnimationOptions, AnimationData } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Swing', () => {
  test('schema', () => {
    expect(SwingAnimation.schema).toEqual({
      angle: {
        type: 'number',
        min: 0,
        default: 20,
      },
      iterationDelay: {
        type: 'number',
        min: 0,
        default: 0,
      },
      pivot: {
        type: 'enum',
        values: ['top', 'right', 'bottom', 'left'],
        default: 'top',
      },
    });
  });

  describe('web() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Swing,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-swing-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-swing-deg': '20deg',
            '--motion-trans-x': '0%',
            '--motion-trans-y': '-50%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(0deg) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.07948936170212766,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * 1)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.23829787234042554,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * -1)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.39659574468085107,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * 0.6)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.5557446808510639,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * -0.3)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.7140425531914893,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * 0.2)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.8731914893617021,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * -0.05)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * 0)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(0deg) translate(calc(0% * -1), calc(-50% * -1))',
            },
          ],
        },
      ];

      const result = SwingAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom angle, duration and easing', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        easing: 'cubicInOut',
        namedEffect: {
          angle: 30,
        } as Swing,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-swing-1',
          duration: 1000,
          easing: 'linear',
          custom: {
            '--motion-swing-deg': '30deg',
            '--motion-trans-x': '0%',
            '--motion-trans-y': '-50%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(0deg) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.07948936170212766,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(30deg * 1)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.23829787234042554,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(30deg * -1)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.39659574468085107,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(30deg * 0.6)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.5557446808510639,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(30deg * -0.3)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.7140425531914893,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(30deg * 0.2)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.8731914893617021,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(30deg * -0.05)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 1,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(30deg * 0)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(0deg) translate(calc(0% * -1), calc(-50% * -1))',
            },
          ],
        },
      ];

      const result = SwingAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {
          iterationDelay: 500,
        } as Swing,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-swing-067',
          duration: 1500,
          easing: 'linear',
          custom: {
            '--motion-swing-deg': '20deg',
            '--motion-trans-x': '0%',
            '--motion-trans-y': '-50%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(0deg) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.05299290780141844,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * 1)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.15886524822695036,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * -1)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.2643971631205674,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * 0.6)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.37049645390070923,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * -0.3)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.4760283687943262,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * 0.2)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.582127659574468,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * -0.05)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.6666666666666666,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * 0)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(0deg) translate(calc(0% * -1), calc(-50% * -1))',
            },
          ],
        },
      ];

      const result = SwingAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          pivot: 'right',
        } as Swing,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-swing-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-swing-deg': '20deg',
            '--motion-trans-x': '50%',
            '--motion-trans-y': '0%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(50%, 0%) rotate(0deg) translate(calc(50% * -1), calc(0% * -1))',
            },
            {
              offset: 0.07948936170212766,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(50%, 0%) rotate(calc(20deg * 1)) translate(calc(50% * -1), calc(0% * -1))',
            },
            {
              offset: 0.23829787234042554,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(50%, 0%) rotate(calc(20deg * -1)) translate(calc(50% * -1), calc(0% * -1))',
            },
            {
              offset: 0.39659574468085107,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(50%, 0%) rotate(calc(20deg * 0.6)) translate(calc(50% * -1), calc(0% * -1))',
            },
            {
              offset: 0.5557446808510639,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(50%, 0%) rotate(calc(20deg * -0.3)) translate(calc(50% * -1), calc(0% * -1))',
            },
            {
              offset: 0.7140425531914893,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(50%, 0%) rotate(calc(20deg * 0.2)) translate(calc(50% * -1), calc(0% * -1))',
            },
            {
              offset: 0.8731914893617021,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(50%, 0%) rotate(calc(20deg * -0.05)) translate(calc(50% * -1), calc(0% * -1))',
            },
            {
              offset: 1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(50%, 0%) rotate(calc(20deg * 0)) translate(calc(50% * -1), calc(0% * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(50%, 0%) rotate(0deg) translate(calc(50% * -1), calc(0% * -1))',
            },
          ],
        },
      ];

      const result = SwingAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - bottom', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          pivot: 'bottom',
        } as Swing,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-swing-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-swing-deg': '20deg',
            '--motion-trans-x': '0%',
            '--motion-trans-y': '50%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(0%, 50%) rotate(0deg) translate(calc(0% * -1), calc(50% * -1))',
            },
            {
              offset: 0.07948936170212766,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, 50%) rotate(calc(20deg * 1)) translate(calc(0% * -1), calc(50% * -1))',
            },
            {
              offset: 0.23829787234042554,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, 50%) rotate(calc(20deg * -1)) translate(calc(0% * -1), calc(50% * -1))',
            },
            {
              offset: 0.39659574468085107,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, 50%) rotate(calc(20deg * 0.6)) translate(calc(0% * -1), calc(50% * -1))',
            },
            {
              offset: 0.5557446808510639,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, 50%) rotate(calc(20deg * -0.3)) translate(calc(0% * -1), calc(50% * -1))',
            },
            {
              offset: 0.7140425531914893,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, 50%) rotate(calc(20deg * 0.2)) translate(calc(0% * -1), calc(50% * -1))',
            },
            {
              offset: 0.8731914893617021,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, 50%) rotate(calc(20deg * -0.05)) translate(calc(0% * -1), calc(50% * -1))',
            },
            {
              offset: 1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, 50%) rotate(calc(20deg * 0)) translate(calc(0% * -1), calc(50% * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(0%, 50%) rotate(0deg) translate(calc(0% * -1), calc(50% * -1))',
            },
          ],
        },
      ];

      const result = SwingAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          pivot: 'left',
        } as Swing,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-swing-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-swing-deg': '20deg',
            '--motion-trans-x': '-50%',
            '--motion-trans-y': '0%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(-50%, 0%) rotate(0deg) translate(calc(-50% * -1), calc(0% * -1))',
            },
            {
              offset: 0.07948936170212766,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(-50%, 0%) rotate(calc(20deg * 1)) translate(calc(-50% * -1), calc(0% * -1))',
            },
            {
              offset: 0.23829787234042554,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(-50%, 0%) rotate(calc(20deg * -1)) translate(calc(-50% * -1), calc(0% * -1))',
            },
            {
              offset: 0.39659574468085107,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(-50%, 0%) rotate(calc(20deg * 0.6)) translate(calc(-50% * -1), calc(0% * -1))',
            },
            {
              offset: 0.5557446808510639,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(-50%, 0%) rotate(calc(20deg * -0.3)) translate(calc(-50% * -1), calc(0% * -1))',
            },
            {
              offset: 0.7140425531914893,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(-50%, 0%) rotate(calc(20deg * 0.2)) translate(calc(-50% * -1), calc(0% * -1))',
            },
            {
              offset: 0.8731914893617021,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(-50%, 0%) rotate(calc(20deg * -0.05)) translate(calc(-50% * -1), calc(0% * -1))',
            },
            {
              offset: 1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(-50%, 0%) rotate(calc(20deg * 0)) translate(calc(-50% * -1), calc(0% * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(-50%, 0%) rotate(0deg) translate(calc(-50% * -1), calc(0% * -1))',
            },
          ],
        },
      ];

      const result = SwingAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Swing,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-swing-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-swing-deg': '20deg',
            '--motion-trans-x': '0%',
            '--motion-trans-y': '-50%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.07948936170212766,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.23829787234042554,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.39659574468085107,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0.6)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.5557446808510639,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -0.3)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.7140425531914893,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0.2)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.8731914893617021,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -0.05)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
          ],
        },
      ];

      const result = SwingAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom angle, duration and easing', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        easing: 'cubicInOut',
        namedEffect: {
          angle: 30,
        } as Swing,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-swing-1',
          duration: 1000,
          easing: 'linear',
          custom: {
            '--motion-swing-deg': '30deg',
            '--motion-trans-x': '0%',
            '--motion-trans-y': '-50%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.07948936170212766,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.23829787234042554,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.39659574468085107,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0.6)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.5557446808510639,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -0.3)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.7140425531914893,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0.2)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.8731914893617021,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -0.05)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 1,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
          ],
        },
      ];

      const result = SwingAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {
          iterationDelay: 500,
        } as Swing,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-swing-067',
          duration: 1500,
          easing: 'linear',
          custom: {
            '--motion-swing-deg': '20deg',
            '--motion-trans-x': '0%',
            '--motion-trans-y': '-50%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.05299290780141844,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.15886524822695036,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.2643971631205674,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0.6)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.37049645390070923,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -0.3)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.4760283687943262,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0.2)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.582127659574468,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -0.05)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.6666666666666666,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
          ],
        },
      ];

      const result = SwingAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          pivot: 'right',
        } as Swing,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-swing-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-swing-deg': '20deg',
            '--motion-trans-x': '50%',
            '--motion-trans-y': '0%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.07948936170212766,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.23829787234042554,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.39659574468085107,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0.6)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.5557446808510639,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -0.3)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.7140425531914893,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0.2)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.8731914893617021,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -0.05)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
          ],
        },
      ];

      const result = SwingAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - bottom', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          pivot: 'bottom',
        } as Swing,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-swing-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-swing-deg': '20deg',
            '--motion-trans-x': '0%',
            '--motion-trans-y': '50%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.07948936170212766,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.23829787234042554,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.39659574468085107,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0.6)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.5557446808510639,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -0.3)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.7140425531914893,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0.2)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.8731914893617021,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -0.05)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
          ],
        },
      ];

      const result = SwingAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          pivot: 'left',
        } as Swing,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-swing-1',
          duration: 1,
          easing: 'linear',
          custom: {
            '--motion-swing-deg': '20deg',
            '--motion-trans-x': '-50%',
            '--motion-trans-y': '0%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.07948936170212766,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.23829787234042554,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.39659574468085107,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0.6)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.5557446808510639,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -0.3)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.7140425531914893,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0.2)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.8731914893617021,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -0.05)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * 0)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
          ],
        },
      ];

      const result = SwingAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('getNames()', () => {
    test('default options', () => {
      expect(SwingAnimation.getNames({ ...baseMockOptions, namedEffect: {} as Swing })).toEqual([
        'motion-swing-1',
      ]);
    });

    test('custom duration and delay', () => {
      expect(
        SwingAnimation.getNames({
          ...baseMockOptions,
          duration: 1000,
          namedEffect: { iterationDelay: 500 } as Swing,
        }),
      ).toEqual(['motion-swing-067']);
    });
  });
});
