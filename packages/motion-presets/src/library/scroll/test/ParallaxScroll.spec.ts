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
              transform: 'translateY(-25vh) rotate(var(--motion-rotate, 0))',
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

    test('custom speed', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { speed: 0.5 } as ParallaxScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-62.9971840901091vh',
          endOffsetAdd: '62.9971840901091vh',
          keyframes: [
            {
              transform: 'translateY(-62.9971840901091vh) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translateY(62.9971840901091vh) rotate(var(--motion-rotate, 0))',
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
        namedEffect: { center: 0.25 } as ParallaxScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-12.5vh',
          endOffsetAdd: '37.5vh',
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
