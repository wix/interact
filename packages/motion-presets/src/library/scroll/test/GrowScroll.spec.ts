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
                'translateY(0vh) translate(0%, 0%) scale(0.25) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
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

    test('custom pivot - top-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'top-right', scale: 0 } as GrowScrollType,
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

    test('custom pivot - bottom-left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'bottom-left', scale: 0 } as GrowScrollType,
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

    test('custom pivot - bottom-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'bottom-right', scale: 0 } as GrowScrollType,
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

    test('custom pivot - top-left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'top-left', scale: 0 } as GrowScrollType,
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

    test('custom pivot - bottom', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'bottom', scale: 0 } as GrowScrollType,
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

    test('custom pivot - top', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'top', scale: 0 } as GrowScrollType,
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

    test('custom pivot - left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'left', scale: 0 } as GrowScrollType,
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

    test('custom pivot - right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'right', scale: 0 } as GrowScrollType,
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
        namedEffect: { speed: 0.5, scale: 0 } as GrowScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-40vh',
          endOffsetAdd: '0px',
          keyframes: [
            {
              transform:
                'translateY(-40vh) translate(0%, 0%) scale(0) translate(calc(-1 * 0%), calc(-1 * 0%)) rotate(var(--motion-rotate, 0))',
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

    test('custom pivot - top-right', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'top-right', scale: 0 } as GrowScrollType,
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
