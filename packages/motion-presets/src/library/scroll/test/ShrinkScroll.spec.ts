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
          endOffsetAdd: '0px',
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(0%, 0%) scale(1.2) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
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
          startOffsetAdd: '0px',
          endOffsetAdd: '0vh',
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(0%, 0%) scale(0.8) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = ShrinkScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top-right' } as ShrinkScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(50%, -50%) scale(1.2) translate(calc(-1 * 50%), calc(-1 * -50%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(50%, -50%) scale(1) translate(calc(-1 * 50%), calc(-1 * -50%)) rotate(var(--motion-rotate, 0))',
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
                'translateY(0vh) translate(0%, 0%) scale(1.5) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
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
          startOffsetAdd: '-20vh',
          endOffsetAdd: '0px',
          keyframes: [
            {
              transform:
                'translateY(-20vh) translate(0%, 0%) scale(1.2) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
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
          endOffsetAdd: '0px',
          keyframes: [
            {
              transform:
                'translateY(var(--motion-travel-from)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y))) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(var(--motion-travel-to)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y))) rotate(var(--motion-rotate, 0))',
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
          startOffsetAdd: '0px',
          endOffsetAdd: '0vh',
          keyframes: [
            {
              transform:
                'translateY(var(--motion-travel-from)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y))) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(var(--motion-travel-to)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y))) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = ShrinkScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top-right' } as ShrinkScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(var(--motion-travel-from)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y))) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(var(--motion-travel-to)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y))) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = ShrinkScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
