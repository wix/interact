import { describe, expect, test } from 'vitest';

import * as BreatheAnimation from '../Breathe';
import { Breathe, TimeAnimationOptions, AnimationData } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Breathe', () => {
  test('schema', () => {
    expect(BreatheAnimation.schema).toEqual({
      direction: {
        type: 'enum',
        values: ['horizontal', 'vertical', 'center'],
        default: 'vertical',
      },
      iterationDelay: { type: 'number', min: 0, default: 0 },
      perspective: { type: 'number', min: 0, default: 800 },
      travel: { type: 'length', default: { value: 25, unit: 'px' } },
    });
  });

  describe('web() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                ' translate(calc(0 * 25px * 0), calc(1 * 25px * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 25px * 1), calc(1 * 25px * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.302,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 25px * -1), calc(1 * 25px * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.504,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 25px * 1), calc(1 * 25px * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.705,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 25px * -0.7), calc(1 * 25px * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.839,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 25px * 0.6), calc(1 * 25px * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                ' translate(calc(0 * 25px * 0), calc(1 * 25px * 0)) rotateZ(var(--motion-rotate, 0deg))',
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
          duration: 1500,
          name: 'motion-breathe-067',
          easing: 'linear',
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                ' translate(calc(0 * 25px * 0), calc(1 * 25px * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.06666666666666667,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 25px * 1), calc(1 * 25px * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.2013333333333333,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 25px * -1), calc(1 * 25px * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.33599999999999997,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 25px * 1), calc(1 * 25px * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.47,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 25px * -0.7), calc(1 * 25px * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5593333333333332,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 25px * 0.6), calc(1 * 25px * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.6666666666666666,
              transform:
                ' translate(calc(0 * 25px * 0), calc(1 * 25px * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom travel', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { travel: { value: 50, unit: 'percentage' } } as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '50%',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                ' translate(calc(0 * 50% * 0), calc(1 * 50% * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 50% * 1), calc(1 * 50% * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.302,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 50% * -1), calc(1 * 50% * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.504,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 50% * 1), calc(1 * 50% * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.705,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 50% * -0.7), calc(1 * 50% * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.839,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(0 * 50% * 0.6), calc(1 * 50% * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                ' translate(calc(0 * 50% * 0), calc(1 * 50% * 0)) rotateZ(var(--motion-rotate, 0deg))',
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
        easing: 'quadInOut',
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
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform:
                ' translate(calc(0 * 25px * 0), calc(1 * 25px * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.1,
              easing: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              transform:
                ' translate(calc(0 * 25px * 1), calc(1 * 25px * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.302,
              easing: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              transform:
                ' translate(calc(0 * 25px * -1), calc(1 * 25px * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.504,
              easing: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              transform:
                ' translate(calc(0 * 25px * 1), calc(1 * 25px * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.705,
              easing: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              transform:
                ' translate(calc(0 * 25px * -0.7), calc(1 * 25px * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.839,
              easing: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              transform:
                ' translate(calc(0 * 25px * 0.6), calc(1 * 25px * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                ' translate(calc(0 * 25px * 0), calc(1 * 25px * 0)) rotateZ(var(--motion-rotate, 0deg))',
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
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 1,
            '--motion-breathe-y': 0,
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                ' translate(calc(1 * 25px * 0), calc(0 * 25px * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(1 * 25px * 1), calc(0 * 25px * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.302,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(1 * 25px * -1), calc(0 * 25px * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.504,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(1 * 25px * 1), calc(0 * 25px * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.705,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(1 * 25px * -0.7), calc(0 * 25px * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.839,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                ' translate(calc(1 * 25px * 0.6), calc(0 * 25px * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                ' translate(calc(1 * 25px * 0), calc(0 * 25px * 0)) rotateZ(var(--motion-rotate, 0deg))',
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
        namedEffect: { direction: 'center', perspective: 400 } as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': 'perspective(400px)',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 0,
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'perspective(400px) translate3d(0, 0, calc(25px * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'perspective(400px) translate3d(0, 0, calc(25px * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.302,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'perspective(400px) translate3d(0, 0, calc(25px * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.504,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'perspective(400px) translate3d(0, 0, calc(25px * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.705,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'perspective(400px) translate3d(0, 0, calc(25px * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.839,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'perspective(400px) translate3d(0, 0, calc(25px * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'perspective(400px) translate3d(0, 0, calc(25px * 0)) rotateZ(var(--motion-rotate, 0deg))',
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
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.302,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * -1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.504,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.705,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * -0.7), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.839,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0.6), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0)) rotateZ(var(--motion-rotate, 0deg))',
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
          duration: 1500,
          name: 'motion-breathe-067',
          easing: 'linear',
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.06666666666666667,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.2013333333333333,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * -1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.33599999999999997,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.47,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * -0.7), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5593333333333332,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0.6), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.6666666666666666,
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom travel', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { travel: { value: 50, unit: 'percentage' } } as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '50%',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 1,
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.302,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * -1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.504,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.705,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * -0.7), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.839,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0.6), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = BreatheAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom easing', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        easing: 'quadInOut',
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
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.1,
              easing: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.302,
              easing: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * -1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.504,
              easing: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.705,
              easing: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * -0.7), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.839,
              easing: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0.6), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0)) rotateZ(var(--motion-rotate, 0deg))',
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
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': '',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 1,
            '--motion-breathe-y': 0,
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.302,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * -1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.504,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 1), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.705,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * -0.7), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.839,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0.6), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'var(--motion-breathe-perspective, ) translate(calc(var(--motion-breathe-x) * var(--motion-breathe-distance) * 0), calc(var(--motion-breathe-y) * var(--motion-breathe-distance) * 0)) rotateZ(var(--motion-rotate, 0deg))',
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
        namedEffect: { direction: 'center', perspective: 400 } as Breathe,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-breathe-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-breathe-perspective': 'perspective(400px)',
            '--motion-breathe-distance': '25px',
            '--motion-breathe-x': 0,
            '--motion-breathe-y': 0,
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, calc(var(--motion-breathe-distance) * 0)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.1,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, calc(var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.302,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, calc(var(--motion-breathe-distance) * -1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.504,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, calc(var(--motion-breathe-distance) * 1)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.705,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, calc(var(--motion-breathe-distance) * -0.7)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.839,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, calc(var(--motion-breathe-distance) * 0.6)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'var(--motion-breathe-perspective, ) translate3d(0, 0, calc(var(--motion-breathe-distance) * 0)) rotateZ(var(--motion-rotate, 0deg))',
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
