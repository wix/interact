import { describe, expect, test } from 'vitest';

import * as GrowScroll from '../GrowScroll';
import type { GrowScroll as GrowScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('GrowScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as GrowScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          startOffsetAdd: '0vh',
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(0.25) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as GrowScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          startOffsetAdd: '0vh',
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform:
                'translateY(calc(0 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc((0 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(4) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - top-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'top-right' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(50%, -50%) scale(0.25) translate(calc(-1 * 50%), calc(-1 * -50%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(50%, -50%) scale(1) translate(calc(-1 * 50%), calc(-1 * -50%))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - bottom-left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'bottom-left' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(-50%, 50%) scale(0.25) translate(calc(-1 * -50%), calc(-1 * 50%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(-50%, 50%) scale(1) translate(calc(-1 * -50%), calc(-1 * 50%))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - bottom-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'bottom-right' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(50%, 50%) scale(0.25) translate(calc(-1 * 50%), calc(-1 * 50%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(50%, 50%) scale(1) translate(calc(-1 * 50%), calc(-1 * 50%))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - top-left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'top-left' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(-50%, -50%) scale(0.25) translate(calc(-1 * -50%), calc(-1 * -50%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(-50%, -50%) scale(1) translate(calc(-1 * -50%), calc(-1 * -50%))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - bottom', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'bottom' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 50%) scale(0.25) translate(calc(-1 * 0%), calc(-1 * 50%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 50%) scale(1) translate(calc(-1 * 0%), calc(-1 * 50%))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - top', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'top' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, -50%) scale(0.25) translate(calc(-1 * 0%), calc(-1 * -50%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, -50%) scale(1) translate(calc(-1 * 0%), calc(-1 * -50%))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'left' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(-50%, 0%) scale(0.25) translate(calc(-1 * -50%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(-50%, 0%) scale(1) translate(calc(-1 * -50%), calc(-1 * 0%))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'right' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(50%, 0%) scale(0.25) translate(calc(-1 * 50%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(50%, 0%) scale(1) translate(calc(-1 * 50%), calc(-1 * 0%))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom speed', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { speed: 0.5 } as GrowScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-100vh',
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 2) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(0.25) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 2) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
          ],
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: -100,
              unit: 'percentage',
            },
          },
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as GrowScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          startOffsetAdd: '0vh',
          endOffsetAdd: '100vh',
          custom: {
            '--motion-grow-from': 4,
            '--motion-grow-to': 4,
          },
          keyframes: [
            {
              transform:
                'translateY(calc(0.5 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(4) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc((calc(0.5 * (1 - 1) * (100% + 100vh)) + calc((0.5 - 1) * (1 - 1) * (100% + 100vh))) / 2)) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc((0.5 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(4) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as GrowScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          startOffsetAdd: '0vh',
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform:
                'translateY(var(--motion-grow-parallax-from)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(var(--motion-grow-parallax-to)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
          ],
        },
      ];

      const result = GrowScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as GrowScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          startOffsetAdd: '0vh',
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform:
                'translateY(var(--motion-grow-parallax-from)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(var(--motion-grow-parallax-to)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
          ],
        },
      ];

      const result = GrowScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - top-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'top-right' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(var(--motion-grow-parallax-from)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(var(--motion-grow-parallax-to)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
          ],
          custom: {
            '--motion-trans-x': '50%',
            '--motion-trans-y': '-50%',
          },
        },
      ];

      const result = GrowScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as GrowScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          custom: {
            '--motion-grow-from': 4,
            '--motion-grow-to': 4,
          },
          keyframes: [
            {
              transform:
                'translateY(var(--motion-grow-parallax-from)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(calc((var(--motion-grow-parallax-from) + var(--motion-grow-parallax-to)) / 2)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(1) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(var(--motion-grow-parallax-to)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
          ],
        },
      ];

      const result = GrowScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
