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
          startOffsetAdd: '-19.842156725799697vh',
          endOffsetAdd: '119.8421567257997vh',
          keyframes: [
            {
              transform:
                'translateY(calc(0.5 * (1 - 1.396843134515994) * (100% + 100vh))) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(calc((0.5 - 1) * (1 - 1.396843134515994) * (100% + 100vh))) rotate(var(--motion-rotate, 0))',
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
          startOffsetAdd: '-50vh',
          endOffsetAdd: '150vh',
          keyframes: [
            {
              transform:
                'translateY(calc(0.5 * (1 - 2) * (100% + 100vh))) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(calc((0.5 - 1) * (1 - 2) * (100% + 100vh))) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = ParallaxScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom center', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { center: 0 } as ParallaxScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '0vh',
          endOffsetAdd: '139.6843134515994vh',
          keyframes: [
            {
              transform:
                'translateY(calc(0 * (1 - 1.396843134515994) * (100% + 100vh))) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(calc((0 - 1) * (1 - 1.396843134515994) * (100% + 100vh))) rotate(var(--motion-rotate, 0))',
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
          startOffsetAdd: '-19.842156725799697vh',
          endOffsetAdd: '119.8421567257997vh',
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

    test('custom speed', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { speed: 0.5 } as ParallaxScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-50vh',
          endOffsetAdd: '150vh',
          custom: {
            '--motion-parallax-inv-speed': 2,
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
