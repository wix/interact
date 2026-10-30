import { describe, expect, test } from 'vitest';

import * as GrowScroll from '../GrowScroll';
import type { GrowScroll as GrowScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

const transform = (travel: string, pivot: [string, string], scale: number) =>
  `translateY(${travel}) rotate(var(--motion-rotate, 0)) translate(${pivot[0]}, ${pivot[1]}) scale(${scale}) translate(calc(-1 * ${pivot[0]}), calc(-1 * ${pivot[1]}))`;

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
          easing: 'linear',
          startOffset: { name: 'entry-crossing', offset: { value: 0, unit: 'percentage' } },
          startOffsetAdd: '0vh',
          endOffset: { name: 'entry-crossing', offset: { value: 50, unit: 'percentage' } },
          endOffsetAdd: '50vh',
          keyframes: [
            { transform: transform('calc(0 * (50% + 50vh))', ['0%', '0%'], 0.25) },
            { transform: transform('calc(0 * (50% + 50vh))', ['0%', '0%'], 1) },
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
          startOffset: { name: 'entry-crossing', offset: { value: 50, unit: 'percentage' } },
          startOffsetAdd: '50vh',
          endOffset: { name: 'entry-crossing', offset: { value: 100, unit: 'percentage' } },
          endOffsetAdd: '100vh',
          keyframes: [
            { transform: transform('calc(0 * (50% + 50vh))', ['0%', '0%'], 1) },
            { transform: transform('calc(0 * (50% + 50vh))', ['0%', '0%'], 4) },
          ],
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
          easing: 'linear',
          keyframes: [
            { transform: transform('calc(0 * (100% + 100vh))', ['0%', '0%'], 4) },
            {
              offset: 0.5,
              transform: transform(
                'calc((calc(0 * (100% + 100vh)) + calc(0 * (100% + 100vh))) / 2)',
                ['0%', '0%'],
                1,
              ),
            },
            { transform: transform('calc(0 * (100% + 100vh))', ['0%', '0%'], 4) },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test.each([
      ['top', '0%', '-50%'],
      ['top-right', '50%', '-50%'],
      ['right', '50%', '0%'],
      ['bottom-right', '50%', '50%'],
      ['bottom', '0%', '50%'],
      ['bottom-left', '-50%', '50%'],
      ['left', '-50%', '0%'],
      ['top-left', '-50%', '-50%'],
    ] as const)('custom pivot - %s', (pivot, x, y) => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            { transform: transform('calc(0 * (50% + 50vh))', [x, y], 0.25) },
            { transform: transform('calc(0 * (50% + 50vh))', [x, y], 1) },
          ],
        },
      ];

      const result = GrowScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom scale - inverted to grow', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { scale: 4 } as GrowScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            { transform: transform('calc(0 * (50% + 50vh))', ['0%', '0%'], 0.25) },
            { transform: transform('calc(0 * (50% + 50vh))', ['0%', '0%'], 1) },
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
          startOffset: { name: 'entry-crossing', offset: { value: -50, unit: 'percentage' } },
          startOffsetAdd: '-50vh',
          endOffset: { name: 'entry-crossing', offset: { value: 50, unit: 'percentage' } },
          endOffsetAdd: '50vh',
          keyframes: [
            { transform: transform('calc(-1 * (50% + 50vh))', ['0%', '0%'], 0.25) },
            { transform: transform('calc(0 * (50% + 50vh))', ['0%', '0%'], 1) },
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
          custom: {
            '--motion-travel-from': 'calc(0 * (50% + 50vh))',
            '--motion-travel-to': 'calc(0 * (50% + 50vh))',
            '--motion-grow-from': 0.25,
            '--motion-grow-to': 1,
            '--motion-trans-x': '0%',
            '--motion-trans-y': '0%',
          },
          keyframes: [
            {
              transform:
                'translateY(var(--motion-travel-from)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(var(--motion-travel-to)) rotate(var(--motion-rotate, 0)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-grow-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
          ],
        },
      ];

      const result = GrowScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
