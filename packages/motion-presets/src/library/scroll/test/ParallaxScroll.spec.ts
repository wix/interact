import { describe, expect, test } from 'vitest';

import * as ParallaxScroll from '../ParallaxScroll';
import type { ParallaxScroll as ParallaxScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

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
          startOffsetAdd: '-25vh',
          endOffsetAdd: '25vh',
          keyframes: [
            {
              transform: 'translateY(calc(-1 * 25vh)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translateY(25vh) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = ParallaxScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom parallaxFactor', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { parallaxFactor: 0.75 } as ParallaxScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-37.5vh',
          endOffsetAdd: '37.5vh',
          keyframes: [
            {
              transform: 'translateY(calc(-1 * 37.5vh)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translateY(37.5vh) rotate(var(--motion-rotate, 0))',
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
          startOffsetAdd: '-25vh',
          endOffsetAdd: '25vh',
          keyframes: [
            {
              transform:
                'translateY(calc(-1 * var(--motion-parallax-to))) rotate(var(--motion-rotate, 0))',
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

    test('custom parallaxFactor', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { parallaxFactor: 0.75 } as ParallaxScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-37.5vh',
          endOffsetAdd: '37.5vh',
          keyframes: [
            {
              transform:
                'translateY(calc(-1 * var(--motion-parallax-to))) rotate(var(--motion-rotate, 0))',
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
