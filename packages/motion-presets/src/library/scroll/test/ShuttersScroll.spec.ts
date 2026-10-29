import { describe, expect, test } from 'vitest';

import * as ShuttersScroll from '../ShuttersScroll';
import type { ShuttersScroll as ShuttersScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('ShuttersScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { shutters: 2 } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 0% 0%, 0% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 0%)',
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 50% 0%, 50% 100%, 0% 100%, 0% 0%, 50% 0%, 150% 0%, 150% 100%, 50% 100%, 50% 0%, 100% 0%, 300% 0%, 300% 100%, 100% 100%, 100% 0%)',
            },
          ],
        },
      ];

      const result = ShuttersScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left', shutters: 2 } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 0% 0%, 0% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 0%)',
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            {
              clipPath:
                'polygon(nonzero, 0% 0%, -200% 0%, -200% 100%, 0% 100%, 0% 0%, 50% 0%, -50% 0%, -50% 100%, 50% 100%, 50% 0%, 100% 0%, 50% 0%, 50% 100%, 100% 100%, 100% 0%)',
            },
          ],
        },
      ];

      const result = ShuttersScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top', shutters: 2 } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 100% 0%, 100% 0%, 0% 0%, 0% 0%, 0% 50%, 100% 50%, 100% 50%, 0% 50%, 0% 50%, 0% 100%, 100% 100%, 100% 100%, 0% 100%, 0% 100%)',
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 100% 0%, 100% -200%, 0% -200%, 0% 0%, 0% 50%, 100% 50%, 100% -50%, 0% -50%, 0% 50%, 0% 100%, 100% 100%, 100% 50%, 0% 50%, 0% 100%)',
            },
          ],
        },
      ];

      const result = ShuttersScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - bottom', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'bottom', shutters: 2 } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 100% 0%, 100% 0%, 0% 0%, 0% 0%, 0% 50%, 100% 50%, 100% 50%, 0% 50%, 0% 50%, 0% 100%, 100% 100%, 100% 100%, 0% 100%, 0% 100%)',
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 100% 0%, 100% 50%, 0% 50%, 0% 0%, 0% 50%, 100% 50%, 100% 150%, 0% 150%, 0% 50%, 0% 100%, 100% 100%, 100% 300%, 0% 300%, 0% 100%)',
            },
          ],
        },
      ];

      const result = ShuttersScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom shutters', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { shutters: 3 } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 0% 0%, 0% 100%, 0% 100%, 0% 0%, 33.33333333333333% 0%, 33.33333333333333% 0%, 33.33333333333333% 100%, 33.33333333333333% 100%, 33.33333333333333% 0%, 66.66666666666666% 0%, 66.66666666666666% 0%, 66.66666666666666% 100%, 66.66666666666666% 100%, 66.66666666666666% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 0%)',
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 33.33333333333333% 0%, 33.33333333333333% 100%, 0% 100%, 0% 0%, 33.33333333333333% 0%, 88.88888888888889% 0%, 88.88888888888889% 100%, 33.33333333333333% 100%, 33.33333333333333% 0%, 66.66666666666666% 0%, 166.66666666666666% 0%, 166.66666666666666% 100%, 66.66666666666666% 100%, 66.66666666666666% 0%, 100% 0%, 266.66666666666663% 0%, 266.66666666666663% 100%, 100% 100%, 100% 0%)',
            },
          ],
        },
      ];

      const result = ShuttersScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('staggered false', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { staggered: false, shutters: 2 } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 0% 0%, 0% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 0%)',
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 50% 0%, 50% 100%, 0% 100%, 0% 0%, 50% 0%, 100% 0%, 100% 100%, 50% 100%, 50% 0%, 100% 0%, 150% 0%, 150% 100%, 100% 100%, 100% 0%)',
            },
          ],
        },
      ];

      const result = ShuttersScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out', shutters: 2 } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath:
                'polygon(nonzero, 0% 0%, -200% 0%, -200% 100%, 0% 100%, 0% 0%, 50% 0%, -50% 0%, -50% 100%, 50% 100%, 50% 0%, 100% 0%, 50% 0%, 50% 100%, 100% 100%, 100% 0%)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 0% 0%, 0% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 0%)',
            },
          ],
        },
      ];

      const result = ShuttersScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous', shutters: 2 } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          keyframes: [
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 0% 0%, 0% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 0%)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 50% 0%, 50% 100%, 0% 100%, 0% 0%, 50% 0%, 150% 0%, 150% 100%, 50% 100%, 50% 0%, 100% 0%, 300% 0%, 300% 100%, 100% 100%, 100% 0%)',
              offset: 0.45,
            },
            {
              clipPath:
                'polygon(nonzero, 0% 0%, -200% 0%, -200% 100%, 0% 100%, 0% 0%, 50% 0%, -50% 0%, -50% 100%, 50% 100%, 50% 0%, 100% 0%, 50% 0%, 50% 100%, 100% 100%, 100% 0%)',
              offset: 0.55,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              clipPath:
                'polygon(nonzero, 0% 0%, 0% 0%, 0% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 0%)',
            },
          ],
        },
      ];

      const result = ShuttersScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous, staggered false', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous', staggered: false, shutters: 2 } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          keyframes: [
            {
              clipPath:
                'polygon(evenodd, -50% 0%, -50% 0%, -50% 100%, -50% 100%, -50% 0%, 0% 0%, 0% 0%, 0% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              clipPath:
                'polygon(evenodd, -50% 0%, 0% 0%, 0% 100%, -50% 100%, -50% 0%, 0% 0%, 50% 0%, 50% 100%, 0% 100%, 0% 0%, 50% 0%, 100% 0%, 100% 100%, 50% 100%, 50% 0%)',
              offset: 0.4,
            },
            {
              clipPath:
                'polygon(evenodd, -50% 0%, 0% 0%, 0% 100%, -50% 100%, -50% 0%, 0% 0%, 50% 0%, 50% 100%, 0% 100%, 0% 0%, 50% 0%, 100% 0%, 100% 100%, 50% 100%, 50% 0%)',
              offset: 0.6,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              clipPath:
                'polygon(evenodd, -50% 0%, 50% 0%, 50% 100%, -50% 100%, -50% 0%, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%, 150% 0%, 150% 100%, 50% 100%, 50% 0%)',
            },
          ],
        },
      ];

      const result = ShuttersScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { shutters: 2 } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          custom: {
            '--motion-shutters-clip-start':
              'polygon(nonzero, 0% 0%, 0% 0%, 0% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 0%)',
            '--motion-shutters-clip-end':
              'polygon(nonzero, 0% 0%, 50% 0%, 50% 100%, 0% 100%, 0% 0%, 50% 0%, 150% 0%, 150% 100%, 50% 100%, 50% 0%, 100% 0%, 300% 0%, 300% 100%, 100% 100%, 100% 0%)',
          },
          keyframes: [
            {
              clipPath: 'var(--motion-shutters-clip-start)',
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            { clipPath: 'var(--motion-shutters-clip-end)' },
          ],
        },
      ];

      const result = ShuttersScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous', shutters: 2 } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          custom: {
            '--motion-shutters-clip-start':
              'polygon(nonzero, 0% 0%, 0% 0%, 0% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 0%)',
            '--motion-shutters-clip-end':
              'polygon(nonzero, 0% 0%, 50% 0%, 50% 100%, 0% 100%, 0% 0%, 50% 0%, 150% 0%, 150% 100%, 50% 100%, 50% 0%, 100% 0%, 300% 0%, 300% 100%, 100% 100%, 100% 0%)',
            '--motion-shutters-clip-opp':
              'polygon(nonzero, 0% 0%, -200% 0%, -200% 100%, 0% 100%, 0% 0%, 50% 0%, -50% 0%, -50% 100%, 50% 100%, 50% 0%, 100% 0%, 50% 0%, 50% 100%, 100% 100%, 100% 0%)',
          },
          keyframes: [
            {
              clipPath: 'var(--motion-shutters-clip-start)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            { clipPath: 'var(--motion-shutters-clip-end)', offset: 0.45 },
            {
              clipPath: 'var(--motion-shutters-clip-opp)',
              offset: 0.55,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            { clipPath: 'var(--motion-shutters-clip-start)' },
          ],
        },
      ];

      const result = ShuttersScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
