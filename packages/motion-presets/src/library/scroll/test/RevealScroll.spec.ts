import { describe, expect, test } from 'vitest';

import * as RevealScroll from '../RevealScroll';
import type { RevealScroll as RevealScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('RevealScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as RevealScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from, polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%))',
            },
            {
              clipPath: 'var(--motion-clip-to, polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%))',
            },
          ],
        },
      ];

      const result = RevealScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as RevealScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from, polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%))',
            },
            {
              clipPath: 'var(--motion-clip-to, polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%))',
            },
          ],
        },
      ];

      const result = RevealScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'right' } as RevealScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from, polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%))',
            },
            {
              clipPath: 'var(--motion-clip-to, polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%))',
            },
          ],
        },
      ];

      const result = RevealScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top' } as RevealScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from, polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%))',
            },
            {
              clipPath: 'var(--motion-clip-to, polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%))',
            },
          ],
        },
      ];

      const result = RevealScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as RevealScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from, polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%))',
            },
            {
              clipPath: 'var(--motion-clip-to, polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%))',
            },
          ],
        },
      ];

      const result = RevealScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as RevealScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from, polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%))',
            },
            {
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            },
            {
              clipPath: 'var(--motion-clip-to, polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%))',
            },
          ],
        },
      ];

      const result = RevealScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as RevealScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from, polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%))',
            },
            {
              clipPath: 'var(--motion-clip-to, polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%))',
            },
          ],
        },
      ];

      const result = RevealScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as RevealScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from, polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%))',
            },
            {
              clipPath: 'var(--motion-clip-to, polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%))',
            },
          ],
        },
      ];

      const result = RevealScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as RevealScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from, polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%))',
            },
            {
              clipPath: 'var(--motion-clip-to, polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%))',
            },
          ],
        },
      ];

      const result = RevealScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as RevealScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from, polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%))',
            },
            {
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            },
            {
              clipPath: 'var(--motion-clip-to, polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%))',
            },
          ],
        },
      ];

      const result = RevealScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
