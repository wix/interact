import { describe, expect, test } from 'vitest';

import * as Bounce from '../Bounce';
import { AnimationData, TimeAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Bounce', () => {
  test('schema', () => {
    expect(Bounce.schema).toEqual({
      iterationDelay: { type: 'number', min: 0, default: 0 },
      travel: { type: 'length', default: { value: 49, unit: 'px' } },
    });
  });

  describe('style function', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { type: 'Bounce' },
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-bounce-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-bounce-travel': '49px',
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'translateY(calc(0 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.08800000000000001,
              transform:
                'translateY(calc(-0.5612244897959183 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17600000000000002,
              transform:
                'translateY(calc(-0.8877551020408163 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.265,
              transform:
                'translateY(calc(-1 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.353,
              transform:
                'translateY(calc(-0.8877551020408163 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.441,
              transform:
                'translateY(calc(-0.5612244897959183 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.531,
              transform:
                'translateY(calc(0 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.662,
              transform:
                'translateY(calc(-0.23469387755102042 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.81,
              transform:
                'translateY(calc(0 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.868,
              transform:
                'translateY(calc(-0.05102040816326531 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.941,
              transform:
                'translateY(calc(0 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.971,
              transform:
                'translateY(calc(-0.02040816326530612 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 1,
              transform:
                'translateY(calc(0 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
          ],
        },
      ];

      const result = Bounce.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration, travel and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { type: 'Bounce', travel: { value: 37, unit: 'px' }, iterationDelay: 500 },
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          duration: 1500,
          name: 'motion-bounce-067',
          easing: 'linear',
          custom: {
            '--motion-bounce-travel': '37px',
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'translateY(calc(0 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.05866666666666667,
              transform:
                'translateY(calc(-0.5612244897959183 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.11733333333333335,
              transform:
                'translateY(calc(-0.8877551020408163 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17666666666666667,
              transform:
                'translateY(calc(-1 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.2353333333333333,
              transform:
                'translateY(calc(-0.8877551020408163 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.294,
              transform:
                'translateY(calc(-0.5612244897959183 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.354,
              transform:
                'translateY(calc(0 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.44133333333333336,
              transform:
                'translateY(calc(-0.23469387755102042 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.54,
              transform:
                'translateY(calc(0 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.5786666666666667,
              transform:
                'translateY(calc(-0.05102040816326531 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.6273333333333333,
              transform:
                'translateY(calc(0 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.6473333333333333,
              transform:
                'translateY(calc(-0.02040816326530612 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.6666666666666666,
              transform:
                'translateY(calc(0 * var(--motion-bounce-travel))) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
          ],
        },
      ];

      const result = Bounce.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('web function', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { type: 'Bounce' },
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-bounce-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-bounce-travel': '49px',
          },
          keyframes: [
            {
              offset: 0,
              transform: 'translateY(calc(0 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.08800000000000001,
              transform:
                'translateY(calc(-0.5612244897959183 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17600000000000002,
              transform:
                'translateY(calc(-0.8877551020408163 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.265,
              transform: 'translateY(calc(-1 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.353,
              transform:
                'translateY(calc(-0.8877551020408163 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.441,
              transform:
                'translateY(calc(-0.5612244897959183 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.531,
              transform: 'translateY(calc(0 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.662,
              transform:
                'translateY(calc(-0.23469387755102042 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.81,
              transform: 'translateY(calc(0 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.868,
              transform:
                'translateY(calc(-0.05102040816326531 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.941,
              transform: 'translateY(calc(0 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.971,
              transform:
                'translateY(calc(-0.02040816326530612 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 1,
              transform: 'translateY(calc(0 * 49px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
          ],
        },
      ];

      const result = Bounce.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration, travel and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { type: 'Bounce', travel: { value: 37, unit: 'px' }, iterationDelay: 500 },
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          duration: 1500,
          name: 'motion-bounce-067',
          easing: 'linear',
          custom: {
            '--motion-bounce-travel': '37px',
          },
          keyframes: [
            {
              offset: 0,
              transform: 'translateY(calc(0 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.05866666666666667,
              transform:
                'translateY(calc(-0.5612244897959183 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.11733333333333335,
              transform:
                'translateY(calc(-0.8877551020408163 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17666666666666667,
              transform: 'translateY(calc(-1 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.2353333333333333,
              transform:
                'translateY(calc(-0.8877551020408163 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.294,
              transform:
                'translateY(calc(-0.5612244897959183 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.354,
              transform: 'translateY(calc(0 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.44133333333333336,
              transform:
                'translateY(calc(-0.23469387755102042 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.54,
              transform: 'translateY(calc(0 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.5786666666666667,
              transform:
                'translateY(calc(-0.05102040816326531 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.6273333333333333,
              transform: 'translateY(calc(0 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.6473333333333333,
              transform:
                'translateY(calc(-0.02040816326530612 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.6666666666666666,
              transform: 'translateY(calc(0 * 37px)) rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
          ],
        },
      ];

      const result = Bounce.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('getNames function', () => {
    test('default duration and no delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { type: 'Bounce' },
      };

      const expectedResult = ['motion-bounce-1'];

      const result = Bounce.getNames(mockOptions);

      expect(result).toEqual(expectedResult);
    });

    test('custom duration with no delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 2000,
        namedEffect: { type: 'Bounce' },
      };

      const expectedResult = ['motion-bounce-1'];

      const result = Bounce.getNames(mockOptions);

      expect(result).toEqual(expectedResult);
    });

    test('custom duration with delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { type: 'Bounce', iterationDelay: 500 },
      };

      const expectedResult = ['motion-bounce-067'];

      const result = Bounce.getNames(mockOptions);

      expect(result).toEqual(expectedResult);
    });

    test('equal duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { type: 'Bounce', iterationDelay: 1000 },
      };

      const expectedResult = ['motion-bounce-05'];

      const result = Bounce.getNames(mockOptions);

      expect(result).toEqual(expectedResult);
    });

    test('delay longer than duration', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 500,
        namedEffect: { type: 'Bounce', iterationDelay: 1500 },
      };

      const expectedResult = ['motion-bounce-025'];

      const result = Bounce.getNames(mockOptions);

      expect(result).toEqual(expectedResult);
    });
  });
});
