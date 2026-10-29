import { describe, expect, test } from 'vitest';

import * as Spin3dScroll from '../Spin3dScroll';
import type { Spin3dScroll as Spin3dScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Spin3dScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Spin3dScrollType,
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
                'perspective(1000px) translateY(calc(0 * (50% + 50vh))) rotateX(-100deg) rotateY(-100deg) rotateZ(-100deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(1000px) translateY(calc(0 * (50% + 50vh))) rotateX(0deg) rotateY(0deg) rotateZ(0deg) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom angle', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { angle: 50 } as Spin3dScrollType,
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
                'perspective(1000px) translateY(calc(0 * (50% + 50vh))) rotateX(-50deg) rotateY(-50deg) rotateZ(-50deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(1000px) translateY(calc(0 * (50% + 50vh))) rotateX(0deg) rotateY(0deg) rotateZ(0deg) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom perspective', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { perspective: 500 } as Spin3dScrollType,
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
                'perspective(500px) translateY(calc(0 * (50% + 50vh))) rotateX(-100deg) rotateY(-100deg) rotateZ(-100deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(500px) translateY(calc(0 * (50% + 50vh))) rotateX(0deg) rotateY(0deg) rotateZ(0deg) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as Spin3dScrollType,
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
                'perspective(1000px) translateY(calc(0 * (50% + 50vh))) rotateX(0deg) rotateY(0deg) rotateZ(0deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(1000px) translateY(calc(0 * (50% + 50vh))) rotateX(100deg) rotateY(100deg) rotateZ(100deg) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as Spin3dScrollType,
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
                'perspective(1000px) translateY(calc(0 * (100% + 100vh))) rotateX(-100deg) rotateY(-100deg) rotateZ(-100deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(1000px) translateY(calc(0 * (100% + 100vh))) rotateX(100deg) rotateY(100deg) rotateZ(100deg) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom speed', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { speed: 0.5 } as Spin3dScrollType,
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
                'perspective(1000px) translateY(calc(-1 * (50% + 50vh))) rotateX(-100deg) rotateY(-100deg) rotateZ(-100deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(1000px) translateY(calc(0 * (50% + 50vh))) rotateX(0deg) rotateY(0deg) rotateZ(0deg) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Spin3dScrollType,
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
            '--motion-perspective': '1000px',
            '--motion-travel-from': 'calc(0 * (50% + 50vh))',
            '--motion-travel-to': 'calc(0 * (50% + 50vh))',
            '--motion-rot-from': '-100deg',
            '--motion-rot-to': '0deg',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-from)) rotateX(var(--motion-rot-from)) rotateY(var(--motion-rot-from)) rotateZ(var(--motion-rot-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-to)) rotateX(var(--motion-rot-to)) rotateY(var(--motion-rot-to)) rotateZ(var(--motion-rot-to)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom angle', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { angle: 50 } as Spin3dScrollType,
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
            '--motion-perspective': '1000px',
            '--motion-travel-from': 'calc(0 * (50% + 50vh))',
            '--motion-travel-to': 'calc(0 * (50% + 50vh))',
            '--motion-rot-from': '-50deg',
            '--motion-rot-to': '0deg',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-from)) rotateX(var(--motion-rot-from)) rotateY(var(--motion-rot-from)) rotateZ(var(--motion-rot-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-to)) rotateX(var(--motion-rot-to)) rotateY(var(--motion-rot-to)) rotateZ(var(--motion-rot-to)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as Spin3dScrollType,
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
            '--motion-perspective': '1000px',
            '--motion-travel-from': 'calc(0 * (50% + 50vh))',
            '--motion-travel-to': 'calc(0 * (50% + 50vh))',
            '--motion-rot-from': '0deg',
            '--motion-rot-to': '100deg',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-from)) rotateX(var(--motion-rot-from)) rotateY(var(--motion-rot-from)) rotateZ(var(--motion-rot-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-to)) rotateX(var(--motion-rot-to)) rotateY(var(--motion-rot-to)) rotateZ(var(--motion-rot-to)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as Spin3dScrollType,
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
            '--motion-perspective': '1000px',
            '--motion-travel-from': 'calc(0 * (100% + 100vh))',
            '--motion-travel-to': 'calc(0 * (100% + 100vh))',
            '--motion-rot-from': '-100deg',
            '--motion-rot-to': '100deg',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-from)) rotateX(var(--motion-rot-from)) rotateY(var(--motion-rot-from)) rotateZ(var(--motion-rot-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-to)) rotateX(var(--motion-rot-to)) rotateY(var(--motion-rot-to)) rotateZ(var(--motion-rot-to)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom speed', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { speed: 0.5 } as Spin3dScrollType,
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
            '--motion-perspective': '1000px',
            '--motion-travel-from': 'calc(-1 * (50% + 50vh))',
            '--motion-travel-to': 'calc(0 * (50% + 50vh))',
            '--motion-rot-from': '-100deg',
            '--motion-rot-to': '0deg',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-from)) rotateX(var(--motion-rot-from)) rotateY(var(--motion-rot-from)) rotateZ(var(--motion-rot-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-to)) rotateX(var(--motion-rot-to)) rotateY(var(--motion-rot-to)) rotateZ(var(--motion-rot-to)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
