import { describe, expect, test } from 'vitest';

import * as BgParallax from '../BgParallax';
import { baseMockOptions } from './testUtils';
import type { BgParallax as BgParallaxType, AnimationData } from '../../../types';

describe('BgParallax', () => {
  describe('web', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgParallaxType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          ...baseMockOptions,
          keyframes: [
            { transform: 'translateY(calc(0.2 * 100svh))' },
            {
              transform: 'translateY(calc((200lvh - 100%) * 0.2))',
            },
          ],
        },
      ];

      const result = BgParallax.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom speed', () => {
      const speed = 0.5;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { speed } as BgParallaxType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          ...baseMockOptions,
          keyframes: [
            { transform: 'translateY(calc(0.5 * 100svh))' },
            {
              transform: 'translateY(calc((200lvh - 100%) * 0.5))',
            },
          ],
        },
      ];

      const result = BgParallax.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgParallaxType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          keyframes: [
            {
              transform: 'translateY(calc(var(--motion-parallax-speed) * 100svh))',
            },
            {
              transform: 'translateY(calc((200lvh - 100%) * var(--motion-parallax-speed)))',
            },
          ],
        },
      ];

      const result = BgParallax.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom speed', () => {
      const speed = 0.5;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { speed } as BgParallaxType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          keyframes: [
            {
              transform: 'translateY(calc(var(--motion-parallax-speed) * 100svh))',
            },
            {
              transform: 'translateY(calc((200lvh - 100%) * var(--motion-parallax-speed)))',
            },
          ],
        },
      ];

      const result = BgParallax.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
