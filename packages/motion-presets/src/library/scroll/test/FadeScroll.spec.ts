import { describe, expect, test } from 'vitest';

import * as FadeScroll from '../FadeScroll';
import type { FadeScroll as FadeScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('FadeScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as FadeScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              opacity: 0,
            },
            {
              opacity: 'var(--comp-opacity, 1)',
            },
          ],
        },
      ];

      const result = FadeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom opacity', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { opacity: 0.5 } as FadeScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              opacity: 0.5,
            },
            {
              opacity: 'var(--comp-opacity, 1)',
            },
          ],
        },
      ];

      const result = FadeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as FadeScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              opacity: 'var(--comp-opacity, 1)',
            },
            {
              opacity: 0,
            },
          ],
        },
      ];

      const result = FadeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        fill: 'both',
        namedEffect: { range: 'continuous' } as FadeScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          keyframes: [
            {
              opacity: 0,
            },
            {
              opacity: `var(--comp-opacity, 1)`,
            },
          ],
        },
      ];

      const result = FadeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as FadeScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              opacity: 'var(--motion-fade-from)',
            },
            {
              opacity: 'var(--motion-fade-to)',
            },
          ],
        },
      ];

      const result = FadeScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom opacity', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { opacity: 0.5 } as FadeScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              opacity: 'var(--motion-fade-from)',
            },
            {
              opacity: 'var(--motion-fade-to)',
            },
          ],
        },
      ];

      const result = FadeScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as FadeScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              opacity: 'var(--motion-fade-from)',
            },
            {
              opacity: 'var(--motion-fade-to)',
            },
          ],
        },
      ];

      const result = FadeScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        fill: 'both',
        namedEffect: { range: 'continuous' } as FadeScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          keyframes: [
            {
              opacity: 'var(--motion-fade-from)',
            },
            {
              opacity: 'var(--motion-fade-to)',
            },
          ],
        },
      ];

      const result = FadeScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
