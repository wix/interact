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
                'translateY(calc(0 * (50% + 50vh))) rotate(var(--motion-rotate, 0deg)) translate(0%, 0%) scale(1.2) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc(0 * (50% + 50vh))) rotate(var(--motion-rotate, 0deg)) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%))',
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
                'translateY(calc(0 * (50% + 50vh))) rotate(var(--motion-rotate, 0deg)) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc(0 * (50% + 50vh))) rotate(var(--motion-rotate, 0deg)) translate(0%, 0%) scale(0.8333333333333334) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
          ],
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
                'translateY(calc(0 * (100% + 100vh))) rotate(var(--motion-rotate, 0deg)) translate(0%, 0%) scale(0.8333333333333334) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(0px) rotate(var(--motion-rotate, 0deg)) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc(0 * (100% + 100vh))) rotate(var(--motion-rotate, 0deg)) translate(0%, 0%) scale(0.8333333333333334) translate(calc(-1 * 0%), calc(-1 * 0%))',
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
                'translateY(calc(0 * (50% + 50vh))) rotate(var(--motion-rotate, 0deg)) translate(50%, -50%) scale(1.2) translate(calc(-1 * 50%), calc(-1 * -50%))',
            },
            {
              transform:
                'translateY(calc(0 * (50% + 50vh))) rotate(var(--motion-rotate, 0deg)) translate(50%, -50%) scale(1) translate(calc(-1 * 50%), calc(-1 * -50%))',
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
        namedEffect: { scale: 0.8 } as ShrinkScrollType,
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
                'translateY(calc(0 * (50% + 50vh))) rotate(var(--motion-rotate, 0deg)) translate(0%, 0%) scale(1.25) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc(0 * (50% + 50vh))) rotate(var(--motion-rotate, 0deg)) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%))',
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
        namedEffect: { speed: 1.5 } as ShrinkScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: {
              value: 16.666666666666668,
              unit: 'percentage',
            },
          },
          startOffsetAdd: '16.666666666666668vh',
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
                'translateY(calc(0.33333333333333337 * (50% + 50vh))) rotate(var(--motion-rotate, 0deg)) translate(0%, 0%) scale(1.2) translate(calc(-1 * 0%), calc(-1 * 0%))',
            },
            {
              transform:
                'translateY(calc(0 * (50% + 50vh))) rotate(var(--motion-rotate, 0deg)) translate(0%, 0%) scale(1) translate(calc(-1 * 0%), calc(-1 * 0%))',
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
            '--motion-travel-from': 'calc(0 * (50% + 50vh))',
            '--motion-travel-to': 'calc(0 * (50% + 50vh))',
            '--motion-shrink-from': 1.2,
            '--motion-shrink-to': 1,
            '--motion-trans-x': '0%',
            '--motion-trans-y': '0%',
          },
          keyframes: [
            {
              transform:
                'translateY(var(--motion-travel-from)) rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(var(--motion-travel-to)) rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
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
            '--motion-travel-from': 'calc(0 * (50% + 50vh))',
            '--motion-travel-to': 'calc(0 * (50% + 50vh))',
            '--motion-shrink-from': 1,
            '--motion-shrink-to': 0.8333333333333334,
            '--motion-trans-x': '0%',
            '--motion-trans-y': '0%',
          },
          keyframes: [
            {
              transform:
                'translateY(var(--motion-travel-from)) rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(var(--motion-travel-to)) rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
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
            '--motion-travel-from': 'calc(0 * (50% + 50vh))',
            '--motion-travel-to': 'calc(0 * (50% + 50vh))',
            '--motion-shrink-from': 1.2,
            '--motion-shrink-to': 1,
            '--motion-trans-x': '50%',
            '--motion-trans-y': '-50%',
          },
          keyframes: [
            {
              transform:
                'translateY(var(--motion-travel-from)) rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-from)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
            {
              transform:
                'translateY(var(--motion-travel-to)) rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) scale(var(--motion-shrink-to)) translate(calc(-1 * var(--motion-trans-x)), calc(-1 * var(--motion-trans-y)))',
            },
          ],
        },
      ];

      const result = ShrinkScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
