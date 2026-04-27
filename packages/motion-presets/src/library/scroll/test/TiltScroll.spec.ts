import { describe, expect, test } from 'vitest';

import * as TiltScroll from '../TiltScroll';
import type { TiltScroll as TiltScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('TiltScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as TiltScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          startOffsetAdd: '0vh',
          endOffsetAdd: '0px',
          keyframes: [
            {
              transform: 'perspective(400px) translateY(0vh) rotateX(-10deg) rotateY(-25deg)',
            },
            {
              transform: 'perspective(400px) translateY(0vh) rotateX(0deg) rotateY(0deg)',
            },
          ],
        },
        {
          fill: 'backwards',
          easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
          startOffsetAdd: '0vh',
          endOffsetAdd: '0px',
          composite: 'add',
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 25deg))',
            },
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
          ],
        },
      ];

      const result = TiltScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as TiltScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          startOffsetAdd: '0px',
          endOffsetAdd: '0vh',
          keyframes: [
            {
              transform: 'perspective(400px) translateY(0vh) rotateX(0deg) rotateY(0deg)',
            },
            {
              transform: 'perspective(400px) translateY(0vh) rotateX(-10deg) rotateY(-25deg)',
            },
          ],
        },
        {
          fill: 'forwards',
          startOffsetAdd: '0px',
          endOffsetAdd: '0vh',
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 25deg))',
            },
          ],
        },
      ];

      const result = TiltScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        fill: 'both',
        namedEffect: { range: 'continuous' } as TiltScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          startOffsetAdd: '0vh',
          endOffsetAdd: '0vh',
          keyframes: [
            {
              transform: 'perspective(400px) translateY(0vh) rotateX(-10deg) rotateY(-25deg)',
            },
            {
              transform: 'perspective(400px) translateY(0vh) rotateX(10deg) rotateY(12.5deg)',
            },
          ],
        },
        {
          fill: 'both',
          startOffsetAdd: '0vh',
          endOffsetAdd: '0vh',
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + -25deg))',
            },
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 31.25deg))',
            },
          ],
        },
      ];

      const result = TiltScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as TiltScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform: 'perspective(400px) translateY(0vh) rotateX(-10deg) rotateY(-25deg)',
            },
            {
              transform: 'perspective(400px) translateY(0vh) rotateX(0deg) rotateY(0deg)',
            },
          ],
        },
        {
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + -25deg))',
            },
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
            },
          ],
        },
      ];

      const result = TiltScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom parallaxFactor', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { parallaxFactor: 0.5 } as TiltScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-20vh',
          endOffsetAdd: '0px',
          keyframes: [
            {
              transform: 'perspective(400px) translateY(20vh) rotateX(-10deg) rotateY(-25deg)',
            },
            {
              transform: 'perspective(400px) translateY(0vh) rotateX(0deg) rotateY(0deg)',
            },
          ],
        },
        {
          startOffsetAdd: '-20vh',
          endOffsetAdd: '0px',
        },
      ];

      const result = TiltScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as TiltScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          startOffsetAdd: '0vh',
          endOffsetAdd: '0px',
          custom: {
            '--motion-perspective': '400px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-tilt-y-from)) rotateX(var(--motion-tilt-x-from)) rotateY(var(--motion-tilt-y-rot-from))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-tilt-y-to)) rotateX(var(--motion-tilt-x-to)) rotateY(var(--motion-tilt-y-rot-to))',
            },
          ],
        },
        {
          fill: 'backwards',
          easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
          startOffsetAdd: '0vh',
          endOffsetAdd: '0px',
          composite: 'add',
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-from)))',
            },
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-to)))',
            },
          ],
        },
      ];

      const result = TiltScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as TiltScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          startOffsetAdd: '0px',
          endOffsetAdd: '0vh',
          custom: {
            '--motion-perspective': '400px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-tilt-y-from)) rotateX(var(--motion-tilt-x-from)) rotateY(var(--motion-tilt-y-rot-from))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-tilt-y-to)) rotateX(var(--motion-tilt-x-to)) rotateY(var(--motion-tilt-y-rot-to))',
            },
          ],
        },
        {
          fill: 'forwards',
          startOffsetAdd: '0px',
          endOffsetAdd: '0vh',
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-from)))',
            },
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-to)))',
            },
          ],
        },
      ];

      const result = TiltScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        fill: 'both',
        namedEffect: { range: 'continuous' } as TiltScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          startOffsetAdd: '0vh',
          endOffsetAdd: '0vh',
          custom: {
            '--motion-perspective': '400px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-tilt-y-from)) rotateX(var(--motion-tilt-x-from)) rotateY(var(--motion-tilt-y-rot-from))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-tilt-y-to)) rotateX(var(--motion-tilt-x-to)) rotateY(var(--motion-tilt-y-rot-to))',
            },
          ],
        },
        {
          fill: 'both',
          startOffsetAdd: '0vh',
          endOffsetAdd: '0vh',
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-from)))',
            },
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-to)))',
            },
          ],
        },
      ];

      const result = TiltScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - left', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as TiltScrollType,
      };

      const expectedResult = [
        {
          custom: {
            '--motion-perspective': '400px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-tilt-y-from)) rotateX(var(--motion-tilt-x-from)) rotateY(var(--motion-tilt-y-rot-from))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-tilt-y-to)) rotateX(var(--motion-tilt-x-to)) rotateY(var(--motion-tilt-y-rot-to))',
            },
          ],
        },
        {
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-from)))',
            },
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-to)))',
            },
          ],
        },
      ];

      const result = TiltScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom parallaxFactor', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { parallaxFactor: 0.5 } as TiltScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-20vh',
          endOffsetAdd: '0px',
          custom: {
            '--motion-perspective': '400px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-tilt-y-from)) rotateX(var(--motion-tilt-x-from)) rotateY(var(--motion-tilt-y-rot-from))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-tilt-y-to)) rotateX(var(--motion-tilt-x-to)) rotateY(var(--motion-tilt-y-rot-to))',
            },
          ],
        },
        {
          startOffsetAdd: '-20vh',
          endOffsetAdd: '0px',
        },
      ];

      const result = TiltScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
