import { describe, expect, test } from 'vitest';

import * as BgZoom from '../BgZoom';
import { baseMockOptions } from './testUtils';
import type { BgZoom as BgZoomType, AnimationData } from '../../../types';

describe('BgZoom', () => {
  describe('web', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { type: 'BgZoom' } as BgZoomType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {},
        {
          keyframes: [
            {
              transform: `translateY(20svh)`,
            },
            {
              transform: `translateY(calc(1.67 * (-0.2 * var(--motion-comp-height, 0px) + 0.2 * max(0px, 100lvh - var(--motion-comp-height, 0px)))))`,
            },
          ],
        },
        {
          part: 'BG_IMG',
          composite: 'add',
          keyframes: [
            {
              transform: `perspective(100px) translateZ(0px)`,
            },
            {
              transform: `perspective(100px) translateZ(40px)`,
            },
          ],
        },
      ];

      const result = BgZoom.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom zoom', () => {
      const zoom = 40;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { zoom, type: 'BgZoom' } as BgZoomType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {},
        {
          keyframes: [
            {
              transform: `translateY(20svh)`,
            },
            {
              transform: `translateY(calc(1.67 * (-0.2 * var(--motion-comp-height, 0px) + 0.2 * max(0px, 100lvh - var(--motion-comp-height, 0px)))))`,
            },
          ],
        },
        {
          part: 'BG_IMG',
          composite: 'add',
          keyframes: [
            {
              transform: `perspective(100px) translateZ(0px)`,
            },
            {
              transform: `perspective(100px) translateZ(40px)`,
            },
          ],
        },
      ];

      const result = BgZoom.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom direction - out', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'out', type: 'BgZoom' } as BgZoomType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {},
        {
          part: 'BG_IMG',
          composite: 'replace',
          keyframes: [
            {
              transform: `perspective(100px) translateZ(11.54px)`,
            },
            {
              transform: `perspective(100px) translateZ(-15px)`,
            },
          ],
        },
      ];

      const result = BgZoom.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgZoomType,
      };

      const expectedResult = [
        {},
        {
          keyframes: [
            {
              transform: `translateY(var(--motion-trans-y-from))`,
            },
            {
              transform: `translateY(calc(var(--motion-scale-to) * (-0.2 * var(--motion-comp-height, 0px) + var(--motion-zoom-over-pers) * max(0px, 100lvh - var(--motion-comp-height, 0px)))))`,
            },
          ],
        },
        {
          part: 'BG_IMG',
          composite: 'add',
          keyframes: [
            {
              transform: `perspective(100px) translateZ(var(--motion-trans-z-from))`,
            },
            {
              transform: `perspective(100px) translateZ(var(--motion-trans-z-to))`,
            },
          ],
        },
      ];

      const result = BgZoom.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom zoom', () => {
      const zoom = 40;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { zoom } as BgZoomType,
      };

      const expectedResult = [
        {},
        {
          keyframes: [
            {
              transform: `translateY(var(--motion-trans-y-from))`,
            },
            {
              transform: `translateY(calc(var(--motion-scale-to) * (-0.2 * var(--motion-comp-height, 0px) + var(--motion-zoom-over-pers) * max(0px, 100lvh - var(--motion-comp-height, 0px)))))`,
            },
          ],
        },
        {
          part: 'BG_IMG',
          composite: 'add',
          keyframes: [
            {
              transform: `perspective(100px) translateZ(var(--motion-trans-z-from))`,
            },
            {
              transform: `perspective(100px) translateZ(var(--motion-trans-z-to))`,
            },
          ],
        },
      ];

      const result = BgZoom.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom direction - out', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'out' } as BgZoomType,
      };

      const expectedResult = [
        {},
        {
          part: 'BG_IMG',
          composite: 'replace',
          keyframes: [
            {
              transform: `perspective(100px) translateZ(var(--motion-trans-z-from))`,
            },
            {
              transform: `perspective(100px) translateZ(var(--motion-trans-z-to))`,
            },
          ],
        },
      ];

      const result = BgZoom.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
