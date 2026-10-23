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
          namedEffect: {
            type: 'Bounce',
          },
          name: 'motion-bounce-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-bounce-y-1': '-27.5px',
            '--motion-bounce-y-2': '-43.5px',
            '--motion-bounce-y-3': '-49px',
            '--motion-bounce-y-4': '-43.5px',
            '--motion-bounce-y-5': '-27.5px',
            '--motion-bounce-y-7': '-11.5px',
            '--motion-bounce-y-9': '-2.5px',
            '--motion-bounce-y-11': '-1px',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.08800000000000001,
              translate: '0px var(--motion-bounce-y-1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17600000000000002,
              translate: '0px var(--motion-bounce-y-2)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.265,
              translate: '0px var(--motion-bounce-y-3)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.353,
              translate: '0px var(--motion-bounce-y-4)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.441,
              translate: '0px var(--motion-bounce-y-5)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.531,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.662,
              translate: '0px var(--motion-bounce-y-7)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.81,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.868,
              translate: '0px var(--motion-bounce-y-9)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.941,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.971,
              translate: '0px var(--motion-bounce-y-11)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 1,
              translate: '0px 0px',
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
        namedEffect: { type: 'Bounce', travel: 127.4, iterationDelay: 500 },
      };

      const expectedResult = [
        {
          id: 'test-id',
          duration: 1500,
          namedEffect: {
            type: 'Bounce',
            travel: 127.4,
            iterationDelay: 500,
          },
          name: 'motion-bounce-067',
          easing: 'linear',
          custom: {
            '--motion-bounce-y-1': '-71.5px',
            '--motion-bounce-y-2': '-113.1px',
            '--motion-bounce-y-3': '-127.4px',
            '--motion-bounce-y-4': '-113.1px',
            '--motion-bounce-y-5': '-71.5px',
            '--motion-bounce-y-7': '-29.9px',
            '--motion-bounce-y-9': '-6.5px',
            '--motion-bounce-y-11': '-2.6px',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.05896000000000001,
              translate: '0px var(--motion-bounce-y-1)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.11792000000000002,
              translate: '0px var(--motion-bounce-y-2)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17755,
              translate: '0px var(--motion-bounce-y-3)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.23651,
              translate: '0px var(--motion-bounce-y-4)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.29547,
              translate: '0px var(--motion-bounce-y-5)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.35577000000000003,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.44354000000000005,
              translate: '0px var(--motion-bounce-y-7)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.5427000000000001,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.5815600000000001,
              translate: '0px var(--motion-bounce-y-9)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.63047,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.65057,
              translate: '0px var(--motion-bounce-y-11)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.67,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 1,
              translate: '0px 0px',
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
          namedEffect: {
            type: 'Bounce',
          },
          name: 'motion-bounce-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-bounce-y-1': '-27.5px',
            '--motion-bounce-y-2': '-43.5px',
            '--motion-bounce-y-3': '-49px',
            '--motion-bounce-y-4': '-43.5px',
            '--motion-bounce-y-5': '-27.5px',
            '--motion-bounce-y-7': '-11.5px',
            '--motion-bounce-y-9': '-2.5px',
            '--motion-bounce-y-11': '-1px',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.08800000000000001,
              translate: '0px -27.5px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17600000000000002,
              translate: '0px -43.5px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.265,
              translate: '0px -49px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.353,
              translate: '0px -43.5px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.441,
              translate: '0px -27.5px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.531,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.662,
              translate: '0px -11.5px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.81,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.868,
              translate: '0px -2.5px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.941,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.971,
              translate: '0px -1px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 1,
              translate: '0px 0px',
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
        namedEffect: { type: 'Bounce', travel: 127.4, iterationDelay: 500 },
      };

      const expectedResult = [
        {
          id: 'test-id',
          duration: 1500,
          namedEffect: {
            type: 'Bounce',
            travel: 127.4,
            iterationDelay: 500,
          },
          name: 'motion-bounce-067',
          easing: 'linear',
          custom: {
            '--motion-bounce-y-1': '-71.5px',
            '--motion-bounce-y-2': '-113.1px',
            '--motion-bounce-y-3': '-127.4px',
            '--motion-bounce-y-4': '-113.1px',
            '--motion-bounce-y-5': '-71.5px',
            '--motion-bounce-y-7': '-29.9px',
            '--motion-bounce-y-9': '-6.5px',
            '--motion-bounce-y-11': '-2.6px',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.05896000000000001,
              translate: '0px -71.5px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.11792000000000002,
              translate: '0px -113.1px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.17755,
              translate: '0px -127.4px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.23651,
              translate: '0px -113.1px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.29547,
              translate: '0px -71.5px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.35577000000000003,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.44354000000000005,
              translate: '0px -29.9px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.5427000000000001,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.5815600000000001,
              translate: '0px -6.5px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.63047,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.65057,
              translate: '0px -2.6px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 0.67,
              translate: '0px 0px',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              offset: 1,
              translate: '0px 0px',
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

    test('suffix', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        suffix: '-1a',
        namedEffect: { type: 'Bounce', iterationDelay: 500 },
      };

      expect(Bounce.getNames(mockOptions)).toEqual(['motion-bounce-067-1a']);
      expect(Bounce.style(mockOptions)[0].name).toBe('motion-bounce-067-1a');
    });
  });
});

describe('Bounce travel', () => {
  const peakOf = (travel: unknown) => {
    const { keyframes } = Bounce.web({
      ...baseMockOptions,
      namedEffect: { travel } as any,
    })[0];
    return keyframes.map(({ translate }) => (translate as string).replace(/^0px /, ''));
  };

  test.each([49, 98, 33.3])('the peak is the travel %spx', (travel) => {
    const ys = peakOf({ value: travel, unit: 'px' }).map(parseFloat);
    expect(Math.min(...ys)).toBe(-travel);
  });

  test('the peak is a calc travel', () => {
    expect(peakOf('calc(1vh + 10px)')).toContain('calc(-1 * calc(1vh + 10px))');
  });
});
