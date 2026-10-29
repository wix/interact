import { describe, expect, test } from 'vitest';

import * as TurnScroll from '../TurnScroll';
import type { TurnScroll as TurnScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('TurnScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'translateX(calc(100vw - var(--motion-left, 0px))) scale(1) rotate(calc(var(--motion-rotate, 0deg) + -45deg))',
            },
            {
              transform: 'translateX(0px) scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
          ],
        },
      ];

      const result = TurnScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom spin - counter-clockwise', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { spin: 'counter-clockwise' } as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'translateX(calc(100vw - var(--motion-left, 0px))) scale(1) rotate(calc(var(--motion-rotate, 0deg) + 45deg))',
            },
            {
              transform: 'translateX(0px) scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
          ],
        },
      ];

      const result = TurnScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'right' } as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'translateX(calc(-1 * var(--motion-left, calc(100vw - 100%)) - 100%)) scale(1) rotate(calc(var(--motion-rotate, 0deg) + -45deg))',
            },
            {
              transform: 'translateX(0px) scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
          ],
        },
      ];

      const result = TurnScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom angle', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { angle: 90 } as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'translateX(calc(100vw - var(--motion-left, 0px))) scale(1) rotate(calc(var(--motion-rotate, 0deg) + -90deg))',
            },
            {
              transform: 'translateX(0px) scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
          ],
        },
      ];

      const result = TurnScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom scale', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { scale: 1.5 } as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'translateX(calc(100vw - var(--motion-left, 0px))) scale(1.5) rotate(calc(var(--motion-rotate, 0deg) + -45deg))',
            },
            {
              transform: 'translateX(0px) scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
          ],
        },
      ];

      const result = TurnScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          easing: 'linear',
          keyframes: [
            {
              transform: 'translateX(0px) scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
            {
              transform:
                'translateX(calc(-1 * var(--motion-left, calc(100vw - 100%)) - 100%)) scale(1) rotate(calc(var(--motion-rotate, 0deg) + 45deg))',
            },
          ],
        },
      ];

      const result = TurnScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'translateX(calc(100vw - var(--motion-left, 0px))) scale(1) rotate(calc(var(--motion-rotate, 0deg) + -45deg))',
            },
            {
              transform:
                'translateX(calc((calc(100vw - var(--motion-left, 0px)) + calc(-1 * var(--motion-left, calc(100vw - 100%)) - 100%)) / 2)) scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
            {
              transform:
                'translateX(calc(-1 * var(--motion-left, calc(100vw - 100%)) - 100%)) scale(1) rotate(calc(var(--motion-rotate, 0deg) + 45deg))',
            },
          ],
        },
      ];

      const result = TurnScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          custom: {
            '--motion-turn-translate-from': 'calc(100vw - var(--motion-left, 0px))',
            '--motion-turn-translate-to': '0px',
            '--motion-turn-scale-from': 1,
            '--motion-turn-scale-to': 1,
            '--motion-turn-rotation-from': '-45deg',
            '--motion-turn-rotation-to': '0deg',
          },
          keyframes: [
            {
              transform:
                'translateX(var(--motion-turn-translate-from)) scale(var(--motion-turn-scale-from)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-turn-rotation-from)))',
            },
            {
              transform:
                'translateX(var(--motion-turn-translate-to)) scale(var(--motion-turn-scale-to)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-turn-rotation-to)))',
            },
          ],
        },
      ];

      const result = TurnScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom spin - counter-clockwise', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { spin: 'counter-clockwise' } as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          custom: {
            '--motion-turn-translate-from': 'calc(100vw - var(--motion-left, 0px))',
            '--motion-turn-translate-to': '0px',
            '--motion-turn-scale-from': 1,
            '--motion-turn-scale-to': 1,
            '--motion-turn-rotation-from': '45deg',
            '--motion-turn-rotation-to': '0deg',
          },
          keyframes: [
            {
              transform:
                'translateX(var(--motion-turn-translate-from)) scale(var(--motion-turn-scale-from)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-turn-rotation-from)))',
            },
            {
              transform:
                'translateX(var(--motion-turn-translate-to)) scale(var(--motion-turn-scale-to)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-turn-rotation-to)))',
            },
          ],
        },
      ];

      const result = TurnScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'right' } as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          custom: {
            '--motion-turn-translate-from':
              'calc(-1 * var(--motion-left, calc(100vw - 100%)) - 100%)',
            '--motion-turn-translate-to': '0px',
            '--motion-turn-scale-from': 1,
            '--motion-turn-scale-to': 1,
            '--motion-turn-rotation-from': '-45deg',
            '--motion-turn-rotation-to': '0deg',
          },
          keyframes: [
            {
              transform:
                'translateX(var(--motion-turn-translate-from)) scale(var(--motion-turn-scale-from)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-turn-rotation-from)))',
            },
            {
              transform:
                'translateX(var(--motion-turn-translate-to)) scale(var(--motion-turn-scale-to)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-turn-rotation-to)))',
            },
          ],
        },
      ];

      const result = TurnScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom scale', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { scale: 1.5 } as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          custom: {
            '--motion-turn-translate-from': 'calc(100vw - var(--motion-left, 0px))',
            '--motion-turn-translate-to': '0px',
            '--motion-turn-scale-from': 1.5,
            '--motion-turn-scale-to': 1,
            '--motion-turn-rotation-from': '-45deg',
            '--motion-turn-rotation-to': '0deg',
          },
          keyframes: [
            {
              transform:
                'translateX(var(--motion-turn-translate-from)) scale(var(--motion-turn-scale-from)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-turn-rotation-from)))',
            },
            {
              transform:
                'translateX(var(--motion-turn-translate-to)) scale(var(--motion-turn-scale-to)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-turn-rotation-to)))',
            },
          ],
        },
      ];

      const result = TurnScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          easing: 'linear',
          custom: {
            '--motion-turn-translate-from': '0px',
            '--motion-turn-translate-to':
              'calc(-1 * var(--motion-left, calc(100vw - 100%)) - 100%)',
            '--motion-turn-scale-from': 1,
            '--motion-turn-scale-to': 1,
            '--motion-turn-rotation-from': '0deg',
            '--motion-turn-rotation-to': '45deg',
          },
          keyframes: [
            {
              transform:
                'translateX(var(--motion-turn-translate-from)) scale(var(--motion-turn-scale-from)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-turn-rotation-from)))',
            },
            {
              transform:
                'translateX(var(--motion-turn-translate-to)) scale(var(--motion-turn-scale-to)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-turn-rotation-to)))',
            },
          ],
        },
      ];

      const result = TurnScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as TurnScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          custom: {
            '--motion-turn-translate-from': 'calc(100vw - var(--motion-left, 0px))',
            '--motion-turn-translate-to':
              'calc(-1 * var(--motion-left, calc(100vw - 100%)) - 100%)',
            '--motion-turn-scale-from': 1,
            '--motion-turn-scale-to': 1,
            '--motion-turn-rotation-from': '-45deg',
            '--motion-turn-rotation-to': '45deg',
          },
          keyframes: [
            {
              transform:
                'translateX(var(--motion-turn-translate-from)) scale(var(--motion-turn-scale-from)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-turn-rotation-from)))',
            },
            {
              transform:
                'translateX(calc((var(--motion-turn-translate-from) + var(--motion-turn-translate-to)) / 2)) scale(1) rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
            {
              transform:
                'translateX(var(--motion-turn-translate-to)) scale(var(--motion-turn-scale-to)) rotate(calc(var(--motion-rotate, 0deg) + var(--motion-turn-rotation-to)))',
            },
          ],
        },
      ];

      const result = TurnScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
