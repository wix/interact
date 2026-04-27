import { describe, expect, test } from 'vitest';

import * as SkewPanScroll from '../SkewPanScroll';
import type { SkewPanScroll as SkewPanScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('SkewPanScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as SkewPanScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'translateX(calc(100vw - var(--motion-left, 0px))) skewX(-10deg) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translateX(0) skewX(0deg) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = SkewPanScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom skew value', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { skew: 20 } as SkewPanScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateX(calc(100vw - var(--motion-left, 0px))) skewX(-20deg) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translateX(0) skewX(0deg) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = SkewPanScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as SkewPanScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateX(calc(var(--motion-left, calc(100vw - 100%)) * -1 - 100%)) skewX(10deg) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translateX(0) skewX(0deg) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = SkewPanScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as SkewPanScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              transform: 'translateX(0) skewX(0deg) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateX(calc(100vw - var(--motion-left, 0px))) skewX(10deg) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = SkewPanScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as SkewPanScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateX(calc(100vw - var(--motion-left, 0px))) skewX(-10deg) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateX(calc(var(--motion-left, calc(100vw - 100%)) * -1 - 100%)) skewX(10deg) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = SkewPanScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as SkewPanScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'translateX(var(--motion-skewpan-start-x)) skewX(var(--motion-skewpan-from-skew)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateX(var(--motion-skewpan-end-x)) skewX(var(--motion-skewpan-to-skew)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = SkewPanScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as SkewPanScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateX(var(--motion-skewpan-start-x)) skewX(var(--motion-skewpan-from-skew)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateX(var(--motion-skewpan-end-x)) skewX(var(--motion-skewpan-to-skew)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = SkewPanScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as SkewPanScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              transform:
                'translateX(var(--motion-skewpan-start-x)) skewX(var(--motion-skewpan-from-skew)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateX(var(--motion-skewpan-end-x)) skewX(var(--motion-skewpan-to-skew)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = SkewPanScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
