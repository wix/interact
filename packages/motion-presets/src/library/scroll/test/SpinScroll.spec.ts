import { describe, expect, test } from 'vitest';

import * as SpinScroll from '../SpinScroll';
import type { SpinScroll as SpinScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('SpinScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as SpinScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              transform: 'scale(1) rotate(calc(var(--motion-rotate, 0deg) + -54deg))',
            },
            {
              transform: 'scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
          ],
        },
      ];

      const result = SpinScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom spins', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { spins: 0.5 } as SpinScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform: 'scale(1) rotate(calc(var(--motion-rotate, 0deg) + -180deg))',
            },
            {
              transform: 'scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
          ],
        },
      ];

      const result = SpinScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom scale', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { scale: 0.5 } as SpinScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform: 'scale(0.5) rotate(calc(var(--motion-rotate, 0deg) + -54deg))',
            },
            {
              transform: 'scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
          ],
        },
      ];

      const result = SpinScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - counter-clockwise', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'counter-clockwise' } as SpinScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform: 'scale(1) rotate(calc(var(--motion-rotate, 0deg) + 54deg))',
            },
            {
              transform: 'scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
          ],
        },
      ];

      const result = SpinScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as SpinScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              transform: 'scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
            {
              transform: 'scale(1) rotate(calc(var(--motion-rotate, 0deg) + 54deg))',
            },
          ],
        },
      ];

      const result = SpinScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as SpinScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform: 'scale(1) rotate(calc(var(--motion-rotate, 0deg) + -27deg))',
            },
            {
              transform: 'scale(1) rotate(calc(var(--motion-rotate, 0deg) + 27deg))',
            },
          ],
        },
      ];

      const result = SpinScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as SpinScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'scale(var(--motion-spin-scale-from)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-spin-from)))',
            },
            {
              transform:
                'scale(var(--motion-spin-scale-to)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-spin-to)))',
            },
          ],
        },
      ];

      const result = SpinScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom spins', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { spins: 0.5 } as SpinScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'scale(var(--motion-spin-scale-from)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-spin-from)))',
            },
            {
              transform:
                'scale(var(--motion-spin-scale-to)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-spin-to)))',
            },
          ],
        },
      ];

      const result = SpinScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom scale', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { scale: 0.5 } as SpinScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'scale(var(--motion-spin-scale-from)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-spin-from)))',
            },
            {
              transform:
                'scale(var(--motion-spin-scale-to)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-spin-to)))',
            },
          ],
        },
      ];

      const result = SpinScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - counter-clockwise', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'counter-clockwise' } as SpinScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'scale(var(--motion-spin-scale-from)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-spin-from)))',
            },
            {
              transform:
                'scale(var(--motion-spin-scale-to)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-spin-to)))',
            },
          ],
        },
      ];

      const result = SpinScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as SpinScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              transform:
                'scale(var(--motion-spin-scale-from)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-spin-from)))',
            },
            {
              transform:
                'scale(var(--motion-spin-scale-to)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-spin-to)))',
            },
          ],
        },
      ];

      const result = SpinScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as SpinScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'scale(var(--motion-spin-scale-from)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-spin-from)))',
            },
            {
              transform:
                'scale(var(--motion-spin-scale-to)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-spin-to)))',
            },
          ],
        },
      ];

      const result = SpinScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
