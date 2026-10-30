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
                'translateX(calc(100vw - var(--motion-left, 0px))) skewX(-10deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform: 'translateX(0px) skewX(0deg) rotate(var(--motion-rotate, 0deg))',
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
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'translateX(calc(100vw - var(--motion-left, 0px))) skewX(-20deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform: 'translateX(0px) skewX(0deg) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = SkewPanScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'right' } as SkewPanScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'translateX(calc(var(--motion-left, calc(100vw - 100%)) * -1 - 100%)) skewX(10deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform: 'translateX(0px) skewX(0deg) rotate(var(--motion-rotate, 0deg))',
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
          easing: 'linear',
          keyframes: [
            {
              transform: 'translateX(0px) skewX(0deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'translateX(calc(var(--motion-left, calc(100vw - 100%)) * -1 - 100%)) skewX(10deg) rotate(var(--motion-rotate, 0deg))',
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
          fill: 'both',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'translateX(calc(100vw - var(--motion-left, 0px))) skewX(-10deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'translateX(calc(var(--motion-left, calc(100vw - 100%)) * -1 - 100%)) skewX(10deg) rotate(var(--motion-rotate, 0deg))',
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
          custom: {
            '--motion-skewpan-start-x': 'calc(100vw - var(--motion-left, 0px))',
            '--motion-skewpan-end-x': '0px',
            '--motion-skewpan-from-skew': '-10deg',
            '--motion-skewpan-to-skew': '0deg',
          },
          keyframes: [
            {
              transform:
                'translateX(var(--motion-skewpan-start-x)) skewX(var(--motion-skewpan-from-skew)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'translateX(var(--motion-skewpan-end-x)) skewX(var(--motion-skewpan-to-skew)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = SkewPanScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'right' } as SkewPanScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          custom: {
            '--motion-skewpan-start-x': 'calc(var(--motion-left, calc(100vw - 100%)) * -1 - 100%)',
            '--motion-skewpan-end-x': '0px',
            '--motion-skewpan-from-skew': '10deg',
            '--motion-skewpan-to-skew': '0deg',
          },
          keyframes: [
            {
              transform:
                'translateX(var(--motion-skewpan-start-x)) skewX(var(--motion-skewpan-from-skew)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'translateX(var(--motion-skewpan-end-x)) skewX(var(--motion-skewpan-to-skew)) rotate(var(--motion-rotate, 0deg))',
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
          easing: 'linear',
          custom: {
            '--motion-skewpan-start-x': '0px',
            '--motion-skewpan-end-x': 'calc(var(--motion-left, calc(100vw - 100%)) * -1 - 100%)',
            '--motion-skewpan-from-skew': '0deg',
            '--motion-skewpan-to-skew': '10deg',
          },
          keyframes: [
            {
              transform:
                'translateX(var(--motion-skewpan-start-x)) skewX(var(--motion-skewpan-from-skew)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'translateX(var(--motion-skewpan-end-x)) skewX(var(--motion-skewpan-to-skew)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = SkewPanScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
