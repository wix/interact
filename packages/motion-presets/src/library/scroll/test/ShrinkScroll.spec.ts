import { describe, expect, test } from 'vitest';

import * as ShrinkScroll from '../ShrinkScroll';
import type { ShrinkScroll as ShrinkScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('ShrinkScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as ShrinkScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          startOffsetAdd: '0vh',
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(1.2) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
          ],
        },
      ];

      const result = ShrinkScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as ShrinkScrollType,
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
                'translateY(calc((0 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(0.8333333333333334) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
          ],
        },
      ];

      const result = ShrinkScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - top-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'top-right' } as ShrinkScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(50%, -50%) scale(1.2) translate(calc(-1 * 50%), calc(-1 * -50%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(50%, -50%) scale(1) translate(calc(-1 * 50%), calc(-1 * -50%))',
            },
          ],
        },
      ];

      const result = ShrinkScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom scale', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { scale: 1.5 } as ShrinkScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(1.5) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc((1 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
          ],
        },
      ];

      const result = ShrinkScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom speed', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { speed: 0.5 } as ShrinkScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-100vh',
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform:
                'translateY(calc(1 * (1 - 2) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(1.2) translate(calc(-1 * 0%), calc(-1 * 0%))',
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

      const result = ShrinkScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as ShrinkScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          startOffsetAdd: '0vh',
          endOffsetAdd: '100vh',
          custom: {
            '--motion-shrink-from': 0.8333333333333334,
            '--motion-shrink-to': 0.8333333333333334,
          },
          keyframes: [
            {
              transform:
                'translateY(calc(0.5 * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(0.8333333333333334) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc((calc(0.5 * (1 - 1) * (100% + 100vh)) + calc((0.5 - 1) * (1 - 1) * (100% + 100vh))) / 2)) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc((0.5 - 1) * (1 - 1) * (100% + 100vh))) rotate(var(--motion-rotate, 0)) translate(0%, 0%) scale(0.8333333333333334) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
          ],
        },
      ];

      const result = ShrinkScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as ShrinkScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          startOffsetAdd: '0vh',
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform:
                'translateY(var(--motion-shrink-parallax-from)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(var(--motion-shrink-parallax-to)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
          ],
        },
      ];

      const result = ShrinkScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as ShrinkScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          startOffsetAdd: '0vh',
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform:
                'translateY(var(--motion-shrink-parallax-from)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(var(--motion-shrink-parallax-to)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
          ],
        },
      ];

      const result = ShrinkScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom pivot - top-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'top-right' } as ShrinkScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(var(--motion-shrink-parallax-from)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(var(--motion-shrink-parallax-to)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
          ],
          custom: {
            '--motion-trans-x': '50%',
            '--motion-trans-y': '-50%',
          },
        },
      ];

      const result = ShrinkScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as ShrinkScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          custom: {
            '--motion-shrink-from': 0.8333333333333334,
            '--motion-shrink-to': 0.8333333333333334,
          },
          keyframes: [
            {
              transform:
                'translateY(var(--motion-shrink-parallax-from)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(calc((var(--motion-shrink-parallax-from) + var(--motion-shrink-parallax-to)) / 2)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(1) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(var(--motion-shrink-parallax-to)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
          ],
        },
      ];

      const result = ShrinkScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
