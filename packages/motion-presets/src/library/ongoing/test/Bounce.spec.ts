import { describe, expect, test } from 'vitest';

import * as Bounce from '../Bounce';
import { TimeAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Bounce', () => {
  describe('style function', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { type: 'Bounce' },
      };

      const expectedResult = [
        {
          id: 'test-id',
          namedEffect: { type: 'Bounce' },
          name: 'motion-bounce-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-bounce-factor': 1,
          },
          keyframes: [
            {
              offset: 0,
              translate: '0px calc(0px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.08800000000000001,
              translate: '0px calc(-27.5px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17600000000000002,
              translate: '0px calc(-43.5px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.265,
              translate: '0px calc(-49px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.353,
              translate: '0px calc(-43.5px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.441,
              translate: '0px calc(-27.5px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.531,
              translate: '0px calc(0px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.662,
              translate: '0px calc(-11.5px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.81,
              translate: '0px calc(0px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.868,
              translate: '0px calc(-2.5px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.941,
              translate: '0px calc(0px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.971,
              translate: '0px calc(-1px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 1,
              translate: '0px calc(0px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
          ],
        },
      ];

      const result = Bounce.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration and intensity', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { type: 'Bounce', intensity: 0.8, iterationDelay: 500 },
      };

      const expectedResult = [
        {
          id: 'test-id',
          duration: 1500,
          namedEffect: { type: 'Bounce', intensity: 0.8, iterationDelay: 500 },
          name: 'motion-bounce-067',
          easing: 'linear',
          custom: {
            '--motion-bounce-factor': 2.6,
          },
          keyframes: [
            {
              offset: 0,
              translate: '0px calc(0px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.05896000000000001,
              translate: '0px calc(-27.5px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.11792000000000002,
              translate: '0px calc(-43.5px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17755,
              translate: '0px calc(-49px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.23651,
              translate: '0px calc(-43.5px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.29547,
              translate: '0px calc(-27.5px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.35577000000000003,
              translate: '0px calc(0px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.44354000000000005,
              translate: '0px calc(-11.5px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.5427000000000001,
              translate: '0px calc(0px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.5815600000000001,
              translate: '0px calc(-2.5px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.63047,
              translate: '0px calc(0px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.65057,
              translate: '0px calc(-1px * var(--motion-bounce-factor))',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.67,
              translate: '0px calc(0px * var(--motion-bounce-factor))',
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

      const expectedResult = [
        {
          id: 'test-id',
          namedEffect: { type: 'Bounce' },
          name: 'motion-bounce-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-bounce-factor': 1,
          },
          keyframes: [
            {
              offset: 0,
              translate: '0px calc(0px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.08800000000000001,
              translate: '0px calc(-27.5px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17600000000000002,
              translate: '0px calc(-43.5px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.265,
              translate: '0px calc(-49px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.353,
              translate: '0px calc(-43.5px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.441,
              translate: '0px calc(-27.5px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.531,
              translate: '0px calc(0px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.662,
              translate: '0px calc(-11.5px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.81,
              translate: '0px calc(0px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.868,
              translate: '0px calc(-2.5px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.941,
              translate: '0px calc(0px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.971,
              translate: '0px calc(-1px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 1,
              translate: '0px calc(0px * 1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
          ],
        },
      ];

      const result = Bounce.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration and intensity', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { type: 'Bounce', intensity: 0.8, iterationDelay: 500 },
      };

      const expectedResult = [
        {
          id: 'test-id',
          duration: 1500,
          namedEffect: { type: 'Bounce', intensity: 0.8, iterationDelay: 500 },
          name: 'motion-bounce-067',
          easing: 'linear',
          custom: {
            '--motion-bounce-factor': 2.6,
          },
          keyframes: [
            {
              offset: 0,
              translate: '0px calc(0px * 2.6)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.05896000000000001,
              translate: '0px calc(-27.5px * 2.6)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.11792000000000002,
              translate: '0px calc(-43.5px * 2.6)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17755,
              translate: '0px calc(-49px * 2.6)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.23651,
              translate: '0px calc(-43.5px * 2.6)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.29547,
              translate: '0px calc(-27.5px * 2.6)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.35577000000000003,
              translate: '0px calc(0px * 2.6)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.44354000000000005,
              translate: '0px calc(-11.5px * 2.6)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.5427000000000001,
              translate: '0px calc(0px * 2.6)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.5815600000000001,
              translate: '0px calc(-2.5px * 2.6)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.63047,
              translate: '0px calc(0px * 2.6)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.65057,
              translate: '0px calc(-1px * 2.6)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.67,
              translate: '0px calc(0px * 2.6)',
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
