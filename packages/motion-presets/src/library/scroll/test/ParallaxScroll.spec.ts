import { describe, expect, test } from 'vitest';

import * as ParallaxScroll from '../ParallaxScroll';
import type { ParallaxScroll as ParallaxScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

const DEFAULT_SHIFT = 0.5 * (1 - 1 / 0.7159) * 100;

describe('ParallaxScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as ParallaxScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: { value: DEFAULT_SHIFT, unit: 'percentage' },
          },
          startOffsetAdd: `${DEFAULT_SHIFT}vh`,
          endOffset: {
            name: 'entry-crossing',
            offset: { value: 100 - DEFAULT_SHIFT, unit: 'percentage' },
          },
          endOffsetAdd: `${100 - DEFAULT_SHIFT}vh`,
          keyframes: [
            {
              transform: `translateY(calc(${DEFAULT_SHIFT}% + ${DEFAULT_SHIFT}vh)) rotate(var(--motion-rotate, 0))`,
            },
            {
              transform: `translateY(calc(${-DEFAULT_SHIFT}% + ${-DEFAULT_SHIFT}vh)) rotate(var(--motion-rotate, 0))`,
            },
          ],
        },
      ];

      const result = ParallaxScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom speed', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { speed: 0.5 } as ParallaxScrollType,
      };

      const expectedResult = [
        {
          startOffset: { name: 'entry-crossing', offset: { value: -50, unit: 'percentage' } },
          startOffsetAdd: '-50vh',
          endOffset: { name: 'entry-crossing', offset: { value: 150, unit: 'percentage' } },
          endOffsetAdd: '150vh',
          keyframes: [
            {
              transform: 'translateY(calc(-50% + -50vh)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translateY(calc(50% + 50vh)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = ParallaxScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as ParallaxScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          startOffsetAdd: `${DEFAULT_SHIFT}vh`,
          endOffsetAdd: `${100 - DEFAULT_SHIFT}vh`,
          custom: {
            '--motion-parallax-from': `calc(${DEFAULT_SHIFT}% + ${DEFAULT_SHIFT}vh)`,
            '--motion-parallax-to': `calc(${-DEFAULT_SHIFT}% + ${-DEFAULT_SHIFT}vh)`,
          },
          keyframes: [
            {
              transform: 'translateY(var(--motion-parallax-from)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translateY(var(--motion-parallax-to)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = ParallaxScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom center', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { center: 0.25, speed: 0.5 } as ParallaxScrollType,
      };

      const expectedResult = [
        {
          startOffset: { name: 'entry-crossing', offset: { value: -25, unit: 'percentage' } },
          startOffsetAdd: '-25vh',
          endOffset: { name: 'entry-crossing', offset: { value: 175, unit: 'percentage' } },
          endOffsetAdd: '175vh',
          custom: {
            '--motion-parallax-from': 'calc(-25% + -25vh)',
            '--motion-parallax-to': 'calc(75% + 75vh)',
          },
          keyframes: [
            {
              transform: 'translateY(var(--motion-parallax-from)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translateY(var(--motion-parallax-to)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = ParallaxScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
