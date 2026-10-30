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
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 0,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '0vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '50vh',
          keyframes: [
            {
              transform:
                'perspective(400px) translateY(calc(0 * (50% + 50vh))) rotateX(-10deg) rotateY(-25deg)',
            },
            {
              transform:
                'perspective(400px) translateY(calc(0 * (50% + 50vh))) rotateX(0deg) rotateY(0deg)',
            },
          ],
        },
        {
          fill: 'backwards',
          easing: 'linear',
          composite: 'add',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 0,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '0vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '50vh',
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 25deg))',
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
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
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '50vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 100,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform:
                'perspective(400px) translateY(calc(0 * (50% + 50vh))) rotateX(0deg) rotateY(0deg)',
            },
            {
              transform:
                'perspective(400px) translateY(calc(0 * (50% + 50vh))) rotateX(-10deg) rotateY(-25deg)',
            },
          ],
        },
        {
          fill: 'forwards',
          easing: 'linear',
          composite: 'add',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '50vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 100,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 0deg))',
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
            },
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + -25deg))',
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
        namedEffect: { range: 'continuous' } as TiltScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 0,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '0vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 100,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform:
                'perspective(400px) translateY(calc(0 * (100% + 100vh))) rotateX(-10deg) rotateY(-25deg)',
            },
            {
              transform:
                'perspective(400px) translateY(calc(0 * (100% + 100vh))) rotateX(10deg) rotateY(25deg)',
            },
          ],
        },
        {
          fill: 'both',
          easing: 'linear',
          composite: 'add',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 0,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '0vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 100,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '100vh',
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 25deg))',
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
            },
            {
              transform: 'rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
            },
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + -25deg))',
            },
          ],
        },
      ];

      const result = TiltScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - clockwise', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'clockwise' } as TiltScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 0,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '0vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '50vh',
          keyframes: [
            {
              transform:
                'perspective(400px) translateY(calc(0 * (50% + 50vh))) rotateX(-10deg) rotateY(-25deg)',
            },
            {
              transform:
                'perspective(400px) translateY(calc(0 * (50% + 50vh))) rotateX(0deg) rotateY(0deg)',
            },
          ],
        },
        {
          fill: 'backwards',
          easing: 'linear',
          composite: 'add',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 0,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '0vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '50vh',
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + -25deg))',
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
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

    test('custom speed', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { speed: 0.5 } as TiltScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: -50,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '-50vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '50vh',
          keyframes: [
            {
              transform:
                'perspective(400px) translateY(calc(-1 * (50% + 50vh))) rotateX(-10deg) rotateY(-25deg)',
            },
            {
              transform:
                'perspective(400px) translateY(calc(0 * (50% + 50vh))) rotateX(0deg) rotateY(0deg)',
            },
          ],
        },
        {
          fill: 'backwards',
          easing: 'linear',
          composite: 'add',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: -50,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '-50vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '50vh',
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + 25deg))',
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
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
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 0,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '0vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '50vh',
          custom: {
            '--motion-perspective': '400px',
            '--motion-tilt-y-from': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-y-to': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-x-from': '-10deg',
            '--motion-tilt-x-to': '0deg',
            '--motion-tilt-y-rot-from': '-25deg',
            '--motion-tilt-y-rot-to': '0deg',
            '--motion-tilt-z-from': '25deg',
            '--motion-tilt-z-to': '0deg',
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
          easing: 'linear',
          composite: 'add',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 0,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '0vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '50vh',
          custom: {
            '--motion-perspective': '400px',
            '--motion-tilt-y-from': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-y-to': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-x-from': '-10deg',
            '--motion-tilt-x-to': '0deg',
            '--motion-tilt-y-rot-from': '-25deg',
            '--motion-tilt-y-rot-to': '0deg',
            '--motion-tilt-z-from': '25deg',
            '--motion-tilt-z-to': '0deg',
          },
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-from)))',
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
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
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '50vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 100,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '100vh',
          custom: {
            '--motion-perspective': '400px',
            '--motion-tilt-y-from': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-y-to': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-x-from': '0deg',
            '--motion-tilt-x-to': '-10deg',
            '--motion-tilt-y-rot-from': '0deg',
            '--motion-tilt-y-rot-to': '-25deg',
            '--motion-tilt-z-from': '0deg',
            '--motion-tilt-z-to': '-25deg',
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
          easing: 'linear',
          composite: 'add',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '50vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 100,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '100vh',
          custom: {
            '--motion-perspective': '400px',
            '--motion-tilt-y-from': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-y-to': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-x-from': '0deg',
            '--motion-tilt-x-to': '-10deg',
            '--motion-tilt-y-rot-from': '0deg',
            '--motion-tilt-y-rot-to': '-25deg',
            '--motion-tilt-z-from': '0deg',
            '--motion-tilt-z-to': '-25deg',
          },
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-from)))',
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
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
        namedEffect: { range: 'continuous' } as TiltScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 0,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '0vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 100,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '100vh',
          custom: {
            '--motion-perspective': '400px',
            '--motion-tilt-y-from': 'calc(0 * (100% + 100vh))',
            '--motion-tilt-y-to': 'calc(0 * (100% + 100vh))',
            '--motion-tilt-x-from': '-10deg',
            '--motion-tilt-x-to': '10deg',
            '--motion-tilt-y-rot-from': '-25deg',
            '--motion-tilt-y-rot-to': '25deg',
            '--motion-tilt-z-from': '25deg',
            '--motion-tilt-z-to': '-25deg',
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
          easing: 'linear',
          composite: 'add',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 0,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '0vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 100,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '100vh',
          custom: {
            '--motion-perspective': '400px',
            '--motion-tilt-y-from': 'calc(0 * (100% + 100vh))',
            '--motion-tilt-y-to': 'calc(0 * (100% + 100vh))',
            '--motion-tilt-x-from': '-10deg',
            '--motion-tilt-x-to': '10deg',
            '--motion-tilt-y-rot-from': '-25deg',
            '--motion-tilt-y-rot-to': '25deg',
            '--motion-tilt-z-from': '25deg',
            '--motion-tilt-z-to': '-25deg',
          },
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-from)))',
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
            },
            {
              transform: 'rotate(var(--motion-rotate, 0deg))',
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
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

    test('custom direction - clockwise', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'clockwise' } as TiltScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 0,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '0vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '50vh',
          custom: {
            '--motion-perspective': '400px',
            '--motion-tilt-y-from': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-y-to': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-x-from': '-10deg',
            '--motion-tilt-x-to': '0deg',
            '--motion-tilt-y-rot-from': '-25deg',
            '--motion-tilt-y-rot-to': '0deg',
            '--motion-tilt-z-from': '-25deg',
            '--motion-tilt-z-to': '0deg',
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
          easing: 'linear',
          composite: 'add',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 0,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '0vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '50vh',
          custom: {
            '--motion-perspective': '400px',
            '--motion-tilt-y-from': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-y-to': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-x-from': '-10deg',
            '--motion-tilt-x-to': '0deg',
            '--motion-tilt-y-rot-from': '-25deg',
            '--motion-tilt-y-rot-to': '0deg',
            '--motion-tilt-z-from': '-25deg',
            '--motion-tilt-z-to': '0deg',
          },
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-from)))',
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
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

    test('custom speed', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { speed: 0.5 } as TiltScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: -50,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '-50vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '50vh',
          custom: {
            '--motion-perspective': '400px',
            '--motion-tilt-y-from': 'calc(-1 * (50% + 50vh))',
            '--motion-tilt-y-to': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-x-from': '-10deg',
            '--motion-tilt-x-to': '0deg',
            '--motion-tilt-y-rot-from': '-25deg',
            '--motion-tilt-y-rot-to': '0deg',
            '--motion-tilt-z-from': '25deg',
            '--motion-tilt-z-to': '0deg',
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
          easing: 'linear',
          composite: 'add',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: -50,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '-50vh',
          endOffset: {
            name: 'entry-crossing',
            offset: {
              value: 50,
              unit: 'percentage',
            },
          },
          endOffsetAdd: '50vh',
          custom: {
            '--motion-perspective': '400px',
            '--motion-tilt-y-from': 'calc(-1 * (50% + 50vh))',
            '--motion-tilt-y-to': 'calc(0 * (50% + 50vh))',
            '--motion-tilt-x-from': '-10deg',
            '--motion-tilt-x-to': '0deg',
            '--motion-tilt-y-rot-from': '-25deg',
            '--motion-tilt-y-rot-to': '0deg',
            '--motion-tilt-z-from': '25deg',
            '--motion-tilt-z-to': '0deg',
          },
          keyframes: [
            {
              transform: 'rotate(calc(var(--motion-rotate, 0deg) + var(--motion-tilt-z-from)))',
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
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
  });
});
