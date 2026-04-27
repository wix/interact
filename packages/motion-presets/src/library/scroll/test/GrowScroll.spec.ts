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
          endOffsetAdd: '0px',
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(0%, 0%) scale(0) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
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
          startOffsetAdd: '0px',
          endOffsetAdd: '0vh',
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(0%, 0%) scale(4) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top-right' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(50%, -50%) scale(0) translate(calc(-1 * 50%), calc(-1 * -50%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(50%, -50%) scale(1) translate(calc(-1 * 50%), calc(-1 * -50%)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - bottom-left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'bottom-left' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(-50%, 50%) scale(0) translate(calc(-1 * -50%), calc(-1 * 50%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(-50%, 50%) scale(1) translate(calc(-1 * -50%), calc(-1 * 50%)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - bottom-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'bottom-right' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(50%, 50%) scale(0) translate(calc(-1 * 50%), calc(-1 * 50%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(50%, 50%) scale(1) translate(calc(-1 * 50%), calc(-1 * 50%)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top-left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top-left' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(-50%, -50%) scale(0) translate(calc(-1 * -50%), calc(-1 * -50%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(-50%, -50%) scale(1) translate(calc(-1 * -50%), calc(-1 * -50%)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - bottom', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'bottom' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(0%, 50%) scale(0) translate(calc(-1 * 0%), calc(-1 * 50%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(0%, 50%) scale(1) translate(calc(-1 * 0%), calc(-1 * 50%)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(0%, -50%) scale(0) translate(calc(-1 * 0%), calc(-1 * -50%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(0%, -50%) scale(1) translate(calc(-1 * 0%), calc(-1 * -50%)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(-50%, 0%) scale(0) translate(calc(-1 * -50%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(-50%, 0%) scale(1) translate(calc(-1 * -50%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'right' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(0vh) translate(50%, 0%) scale(0) translate(calc(-1 * 50%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(50%, 0%) scale(1) translate(calc(-1 * 50%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
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
          startOffsetAdd: '-20vh',
          endOffsetAdd: '0px',
          keyframes: [
            {
              transform:
                'translateY(-20vh) translate(0%, 0%) scale(0) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(0vh) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
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
          endOffsetAdd: '0px',
          keyframes: [
            {
              transform:
                'translateY(var(--motion-travel-from)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y))) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(var(--motion-travel-to)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y))) rotate(var(--motion-rotate, 0))',
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
          startOffsetAdd: '0px',
          endOffsetAdd: '0vh',
          keyframes: [
            {
              transform:
                'translateY(var(--motion-travel-from)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y))) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(var(--motion-travel-to)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y))) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = GrowScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top-right' } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'translateY(var(--motion-travel-from)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y))) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(var(--motion-travel-to)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y))) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = GrowScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
