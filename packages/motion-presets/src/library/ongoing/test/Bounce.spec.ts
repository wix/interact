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
            '--motion-bounce-travel': '49px',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0px calc(var(--motion-bounce-travel) * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.088,
              translate: '0px calc(var(--motion-bounce-travel) * -55 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.176,
              translate: '0px calc(var(--motion-bounce-travel) * -87 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.265,
              translate: '0px calc(var(--motion-bounce-travel) * -98 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.353,
              translate: '0px calc(var(--motion-bounce-travel) * -87 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.441,
              translate: '0px calc(var(--motion-bounce-travel) * -55 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.531,
              translate: '0px calc(var(--motion-bounce-travel) * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.662,
              translate: '0px calc(var(--motion-bounce-travel) * -23 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.81,
              translate: '0px calc(var(--motion-bounce-travel) * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.868,
              translate: '0px calc(var(--motion-bounce-travel) * -5 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.941,
              translate: '0px calc(var(--motion-bounce-travel) * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.971,
              translate: '0px calc(var(--motion-bounce-travel) * -2 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 1,
              translate: '0px calc(var(--motion-bounce-travel) * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
          ],
        },
      ];

      const result = Bounce.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration and travel', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { type: 'Bounce', travel: '127.4px', iterationDelay: 500 },
      };

      const expectedResult = [
        {
          id: 'test-id',
          duration: 1500,
          namedEffect: { type: 'Bounce', travel: '127.4px', iterationDelay: 500 },
          name: 'motion-bounce-067',
          easing: 'linear',
          custom: {
            '--motion-bounce-travel': '127.4px',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0px calc(var(--motion-bounce-travel) * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.05896,
              translate: '0px calc(var(--motion-bounce-travel) * -55 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.11792,
              translate: '0px calc(var(--motion-bounce-travel) * -87 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17755,
              translate: '0px calc(var(--motion-bounce-travel) * -98 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.23651,
              translate: '0px calc(var(--motion-bounce-travel) * -87 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.29547,
              translate: '0px calc(var(--motion-bounce-travel) * -55 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.35577,
              translate: '0px calc(var(--motion-bounce-travel) * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.44354,
              translate: '0px calc(var(--motion-bounce-travel) * -23 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.5427,
              translate: '0px calc(var(--motion-bounce-travel) * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.58156,
              translate: '0px calc(var(--motion-bounce-travel) * -5 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.63047,
              translate: '0px calc(var(--motion-bounce-travel) * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.65057,
              translate: '0px calc(var(--motion-bounce-travel) * -2 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.67,
              translate: '0px calc(var(--motion-bounce-travel) * 0 / 98)',
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
            '--motion-bounce-travel': '49px',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0px calc(49px * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.088,
              translate: '0px calc(49px * -55 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.176,
              translate: '0px calc(49px * -87 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.265,
              translate: '0px calc(49px * -98 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.353,
              translate: '0px calc(49px * -87 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.441,
              translate: '0px calc(49px * -55 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.531,
              translate: '0px calc(49px * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.662,
              translate: '0px calc(49px * -23 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.81,
              translate: '0px calc(49px * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.868,
              translate: '0px calc(49px * -5 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.941,
              translate: '0px calc(49px * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.971,
              translate: '0px calc(49px * -2 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 1,
              translate: '0px calc(49px * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
          ],
        },
      ];

      const result = Bounce.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration and travel', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { type: 'Bounce', travel: '127.4px', iterationDelay: 500 },
      };

      const expectedResult = [
        {
          id: 'test-id',
          duration: 1500,
          namedEffect: { type: 'Bounce', travel: '127.4px', iterationDelay: 500 },
          name: 'motion-bounce-067',
          easing: 'linear',
          custom: {
            '--motion-bounce-travel': '127.4px',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0px calc(127.4px * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.05896,
              translate: '0px calc(127.4px * -55 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.11792,
              translate: '0px calc(127.4px * -87 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17755,
              translate: '0px calc(127.4px * -98 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.23651,
              translate: '0px calc(127.4px * -87 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.29547,
              translate: '0px calc(127.4px * -55 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.35577,
              translate: '0px calc(127.4px * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.44354,
              translate: '0px calc(127.4px * -23 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.5427,
              translate: '0px calc(127.4px * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.58156,
              translate: '0px calc(127.4px * -5 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.63047,
              translate: '0px calc(127.4px * 0 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.65057,
              translate: '0px calc(127.4px * -2 / 98)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.67,
              translate: '0px calc(127.4px * 0 / 98)',
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
