import { describe, expect, test } from 'vitest';

import * as ShuttersScroll from '../ShuttersScroll';
import type { ShuttersScroll as ShuttersScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('ShuttersScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath:
                'polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%, 8% 0%, 8% 100%, 8% 100%, 8% 0%, 16% 0%, 16% 100%, 16% 100%, 16% 0%, 25% 0%, 25% 100%, 25% 100%, 25% 0%, 33% 0%, 33% 100%, 33% 100%, 33% 0%, 41% 0%, 41% 100%, 41% 100%, 41% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 58% 0%, 58% 100%, 58% 100%, 58% 0%, 66% 0%, 66% 100%, 66% 100%, 66% 0%, 75% 0%, 75% 100%, 75% 100%, 75% 0%, 83% 0%, 83% 100%, 83% 100%, 83% 0%, 91% 0%, 91% 100%, 91% 100%, 91% 0%)',
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            {
              clipPath:
                'polygon(0% 0%, 0% 100%, 8% 100%, 8% 0%, 8% 0%, 8% 100%, 18% 100%, 18% 0%, 16% 0%, 16% 100%, 29% 100%, 29% 0%, 25% 0%, 25% 100%, 41% 100%, 41% 0%, 33% 0%, 33% 100%, 55% 100%, 55% 0%, 41% 0%, 41% 100%, 70% 100%, 70% 0%, 50% 0%, 50% 100%, 87% 100%, 87% 0%, 58% 0%, 58% 100%, 105% 100%, 105% 0%, 66% 0%, 66% 100%, 124% 100%, 124% 0%, 75% 0%, 75% 100%, 145% 100%, 145% 0%, 83% 0%, 83% 100%, 168% 100%, 168% 0%, 91% 0%, 91% 100%, 191% 100%, 191% 0%)',
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
        namedEffect: { direction: 'left' } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath:
                'polygon(100% 0%, 100% 100%, 100% 100%, 100% 0%, 91% 0%, 91% 100%, 91% 100%, 91% 0%, 83% 0%, 83% 100%, 83% 100%, 83% 0%, 75% 0%, 75% 100%, 75% 100%, 75% 0%, 66% 0%, 66% 100%, 66% 100%, 66% 0%, 58% 0%, 58% 100%, 58% 100%, 58% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 41% 0%, 41% 100%, 41% 100%, 41% 0%, 33% 0%, 33% 100%, 33% 100%, 33% 0%, 25% 0%, 25% 100%, 25% 100%, 25% 0%, 16% 0%, 16% 100%, 16% 100%, 16% 0%, 8% 0%, 8% 100%, 8% 100%, 8% 0%)',
            },
            {
              clipPath:
                'polygon(100% 0%, 100% 100%, 91% 100%, 91% 0%, 91% 0%, 91% 100%, 81% 100%, 81% 0%, 83% 0%, 83% 100%, 70% 100%, 70% 0%, 75% 0%, 75% 100%, 58% 100%, 58% 0%, 66% 0%, 66% 100%, 44% 100%, 44% 0%, 58% 0%, 58% 100%, 29% 100%, 29% 0%, 50% 0%, 50% 100%, 12% 100%, 12% 0%, 41% 0%, 41% 100%, -5% 100%, -5% 0%, 33% 0%, 33% 100%, -24% 100%, -24% 0%, 25% 0%, 25% 100%, -45% 100%, -45% 0%, 16% 0%, 16% 100%, -68% 100%, -68% 0%, 8% 0%, 8% 100%, -91% 100%, -91% 0%)',
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
        namedEffect: { direction: 'top' } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath:
                'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%, 0% 91%, 100% 91%, 100% 91%, 0% 91%, 0% 83%, 100% 83%, 100% 83%, 0% 83%, 0% 75%, 100% 75%, 100% 75%, 0% 75%, 0% 66%, 100% 66%, 100% 66%, 0% 66%, 0% 58%, 100% 58%, 100% 58%, 0% 58%, 0% 50%, 100% 50%, 100% 50%, 0% 50%, 0% 41%, 100% 41%, 100% 41%, 0% 41%, 0% 33%, 100% 33%, 100% 33%, 0% 33%, 0% 25%, 100% 25%, 100% 25%, 0% 25%, 0% 16%, 100% 16%, 100% 16%, 0% 16%, 0% 8%, 100% 8%, 100% 8%, 0% 8%)',
            },
            {
              clipPath:
                'polygon(0% 100%, 100% 100%, 100% 91%, 0% 91%, 0% 91%, 100% 91%, 100% 81%, 0% 81%, 0% 83%, 100% 83%, 100% 70%, 0% 70%, 0% 75%, 100% 75%, 100% 58%, 0% 58%, 0% 66%, 100% 66%, 100% 44%, 0% 44%, 0% 58%, 100% 58%, 100% 29%, 0% 29%, 0% 50%, 100% 50%, 100% 12%, 0% 12%, 0% 41%, 100% 41%, 100% -5%, 0% -5%, 0% 33%, 100% 33%, 100% -24%, 0% -24%, 0% 25%, 100% 25%, 100% -45%, 0% -45%, 0% 16%, 100% 16%, 100% -68%, 0% -68%, 0% 8%, 100% 8%, 100% -91%, 0% -91%)',
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
        namedEffect: { direction: 'bottom' } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath:
                'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%, 0% 8%, 100% 8%, 100% 8%, 0% 8%, 0% 16%, 100% 16%, 100% 16%, 0% 16%, 0% 25%, 100% 25%, 100% 25%, 0% 25%, 0% 33%, 100% 33%, 100% 33%, 0% 33%, 0% 41%, 100% 41%, 100% 41%, 0% 41%, 0% 50%, 100% 50%, 100% 50%, 0% 50%, 0% 58%, 100% 58%, 100% 58%, 0% 58%, 0% 66%, 100% 66%, 100% 66%, 0% 66%, 0% 75%, 100% 75%, 100% 75%, 0% 75%, 0% 83%, 100% 83%, 100% 83%, 0% 83%, 0% 91%, 100% 91%, 100% 91%, 0% 91%)',
            },
            {
              clipPath:
                'polygon(0% 0%, 100% 0%, 100% 8%, 0% 8%, 0% 8%, 100% 8%, 100% 18%, 0% 18%, 0% 16%, 100% 16%, 100% 29%, 0% 29%, 0% 25%, 100% 25%, 100% 41%, 0% 41%, 0% 33%, 100% 33%, 100% 55%, 0% 55%, 0% 41%, 100% 41%, 100% 70%, 0% 70%, 0% 50%, 100% 50%, 100% 87%, 0% 87%, 0% 58%, 100% 58%, 100% 105%, 0% 105%, 0% 66%, 100% 66%, 100% 124%, 0% 124%, 0% 75%, 100% 75%, 100% 145%, 0% 145%, 0% 83%, 100% 83%, 100% 168%, 0% 168%, 0% 91%, 100% 91%, 100% 191%, 0% 191%)',
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
        namedEffect: { shutters: 6 } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath:
                'polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%, 16% 0%, 16% 100%, 16% 100%, 16% 0%, 33% 0%, 33% 100%, 33% 100%, 33% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 66% 0%, 66% 100%, 66% 100%, 66% 0%, 83% 0%, 83% 100%, 83% 100%, 83% 0%)',
            },
            {
              clipPath:
                'polygon(0% 0%, 0% 100%, 16% 100%, 16% 0%, 16% 0%, 16% 100%, 38% 100%, 38% 0%, 33% 0%, 33% 100%, 66% 100%, 66% 0%, 50% 0%, 50% 100%, 99% 100%, 99% 0%, 66% 0%, 66% 100%, 138% 100%, 138% 0%, 83% 0%, 83% 100%, 183% 100%, 183% 0%)',
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
        namedEffect: { staggered: false } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath:
                'polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%, 8% 0%, 8% 100%, 8% 100%, 8% 0%, 16% 0%, 16% 100%, 16% 100%, 16% 0%, 25% 0%, 25% 100%, 25% 100%, 25% 0%, 33% 0%, 33% 100%, 33% 100%, 33% 0%, 41% 0%, 41% 100%, 41% 100%, 41% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 58% 0%, 58% 100%, 58% 100%, 58% 0%, 66% 0%, 66% 100%, 66% 100%, 66% 0%, 75% 0%, 75% 100%, 75% 100%, 75% 0%, 83% 0%, 83% 100%, 83% 100%, 83% 0%, 91% 0%, 91% 100%, 91% 100%, 91% 0%)',
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            {
              clipPath:
                'polygon(0% 0%, 0% 100%, 8% 100%, 8% 0%, 8% 0%, 8% 100%, 16% 100%, 16% 0%, 16% 0%, 16% 100%, 25% 100%, 25% 0%, 25% 0%, 25% 100%, 33% 100%, 33% 0%, 33% 0%, 33% 100%, 41% 100%, 41% 0%, 41% 0%, 41% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 58% 100%, 58% 0%, 58% 0%, 58% 100%, 66% 100%, 66% 0%, 66% 0%, 66% 100%, 75% 100%, 75% 0%, 75% 0%, 75% 100%, 83% 100%, 83% 0%, 83% 0%, 83% 100%, 91% 100%, 91% 0%, 91% 0%, 91% 100%, 100% 100%, 100% 0%)',
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
        namedEffect: { range: 'out' } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              clipPath:
                'polygon(100% 0%, 100% 100%, 91% 100%, 91% 0%, 91% 0%, 91% 100%, 81% 100%, 81% 0%, 83% 0%, 83% 100%, 70% 100%, 70% 0%, 75% 0%, 75% 100%, 58% 100%, 58% 0%, 66% 0%, 66% 100%, 44% 100%, 44% 0%, 58% 0%, 58% 100%, 29% 100%, 29% 0%, 50% 0%, 50% 100%, 12% 100%, 12% 0%, 41% 0%, 41% 100%, -5% 100%, -5% 0%, 33% 0%, 33% 100%, -24% 100%, -24% 0%, 25% 0%, 25% 100%, -45% 100%, -45% 0%, 16% 0%, 16% 100%, -68% 100%, -68% 0%, 8% 0%, 8% 100%, -91% 100%, -91% 0%)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              clipPath:
                'polygon(100% 0%, 100% 100%, 100% 100%, 100% 0%, 91% 0%, 91% 100%, 91% 100%, 91% 0%, 83% 0%, 83% 100%, 83% 100%, 83% 0%, 75% 0%, 75% 100%, 75% 100%, 75% 0%, 66% 0%, 66% 100%, 66% 100%, 66% 0%, 58% 0%, 58% 100%, 58% 100%, 58% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 41% 0%, 41% 100%, 41% 100%, 41% 0%, 33% 0%, 33% 100%, 33% 100%, 33% 0%, 25% 0%, 25% 100%, 25% 100%, 25% 0%, 16% 0%, 16% 100%, 16% 100%, 16% 0%, 8% 0%, 8% 100%, 8% 100%, 8% 0%)',
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
        fill: 'both',
        namedEffect: { range: 'continuous' } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          keyframes: [
            {
              clipPath:
                'polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%, 8% 0%, 8% 100%, 8% 100%, 8% 0%, 16% 0%, 16% 100%, 16% 100%, 16% 0%, 25% 0%, 25% 100%, 25% 100%, 25% 0%, 33% 0%, 33% 100%, 33% 100%, 33% 0%, 41% 0%, 41% 100%, 41% 100%, 41% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 58% 0%, 58% 100%, 58% 100%, 58% 0%, 66% 0%, 66% 100%, 66% 100%, 66% 0%, 75% 0%, 75% 100%, 75% 100%, 75% 0%, 83% 0%, 83% 100%, 83% 100%, 83% 0%, 91% 0%, 91% 100%, 91% 100%, 91% 0%)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            },
            {
              clipPath:
                'polygon(0% 0%, 0% 100%, 8% 100%, 8% 0%, 8% 0%, 8% 100%, 18% 100%, 18% 0%, 16% 0%, 16% 100%, 29% 100%, 29% 0%, 25% 0%, 25% 100%, 41% 100%, 41% 0%, 33% 0%, 33% 100%, 55% 100%, 55% 0%, 41% 0%, 41% 100%, 70% 100%, 70% 0%, 50% 0%, 50% 100%, 87% 100%, 87% 0%, 58% 0%, 58% 100%, 105% 100%, 105% 0%, 66% 0%, 66% 100%, 124% 100%, 124% 0%, 75% 0%, 75% 100%, 145% 100%, 145% 0%, 83% 0%, 83% 100%, 168% 100%, 168% 0%, 91% 0%, 91% 100%, 191% 100%, 191% 0%)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0.45,
            },
            {
              clipPath:
                'polygon(0% 0%, 0% 100%, 8% 100%, 8% 0%, 8% 0%, 8% 100%, 18% 100%, 18% 0%, 16% 0%, 16% 100%, 29% 100%, 29% 0%, 25% 0%, 25% 100%, 41% 100%, 41% 0%, 33% 0%, 33% 100%, 55% 100%, 55% 0%, 41% 0%, 41% 100%, 70% 100%, 70% 0%, 50% 0%, 50% 100%, 87% 100%, 87% 0%, 58% 0%, 58% 100%, 105% 100%, 105% 0%, 66% 0%, 66% 100%, 124% 100%, 124% 0%, 75% 0%, 75% 100%, 145% 100%, 145% 0%, 83% 0%, 83% 100%, 168% 100%, 168% 0%, 91% 0%, 91% 100%, 191% 100%, 191% 0%)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0.55,
            },
            {
              clipPath:
                'polygon(8% 0%, 8% 100%, -91% 100%, -91% 0%, 16% 0%, 16% 100%, -68% 100%, -68% 0%, 25% 0%, 25% 100%, -45% 100%, -45% 0%, 33% 0%, 33% 100%, -24% 100%, -24% 0%, 41% 0%, 41% 100%, -5% 100%, -5% 0%, 50% 0%, 50% 100%, 12% 100%, 12% 0%, 58% 0%, 58% 100%, 29% 100%, 29% 0%, 66% 0%, 66% 100%, 44% 100%, 44% 0%, 75% 0%, 75% 100%, 58% 100%, 58% 0%, 83% 0%, 83% 100%, 70% 100%, 70% 0%, 91% 0%, 91% 100%, 81% 100%, 81% 0%, 100% 0%, 100% 100%, 91% 100%, 91% 0%)',
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              offset: 0.55,
            },
            {
              clipPath:
                'polygon(8% 0%, 8% 100%, 8% 100%, 8% 0%, 16% 0%, 16% 100%, 16% 100%, 16% 0%, 25% 0%, 25% 100%, 25% 100%, 25% 0%, 33% 0%, 33% 100%, 33% 100%, 33% 0%, 41% 0%, 41% 100%, 41% 100%, 41% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0%, 58% 0%, 58% 100%, 58% 100%, 58% 0%, 66% 0%, 66% 100%, 66% 100%, 66% 0%, 75% 0%, 75% 100%, 75% 100%, 75% 0%, 83% 0%, 83% 100%, 83% 100%, 83% 0%, 91% 0%, 91% 100%, 91% 100%, 91% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 0%)',
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
        namedEffect: {} as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath: 'var(--motion-shutters-clip-start)',
            },
            {
              clipPath: 'var(--motion-shutters-clip-end)',
            },
          ],
        },
      ];

      const result = ShuttersScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'var(--motion-shutters-clip-start)',
            },
            {
              clipPath: 'var(--motion-shutters-clip-end)',
            },
          ],
        },
      ];

      const result = ShuttersScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as ShuttersScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              clipPath: 'var(--motion-shutters-clip-start)',
            },
            {
              clipPath: 'var(--motion-shutters-clip-end)',
            },
          ],
        },
      ];

      const result = ShuttersScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
