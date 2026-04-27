import { describe, expect, test } from 'vitest';

import * as ImageParallax from '../ImageParallax';
import { baseMockOptions } from './testUtils';
import type { ImageParallax as ImageParallaxType, AnimationData } from '../../../types';

describe('ImageParallax', () => {
  describe('web', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { type: 'ImageParallax' } as ImageParallaxType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          keyframes: [{ transform: 'translateY(-33%)' }, { transform: 'translateY(0%)' }],
        },
      ];

      const result = ImageParallax.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Reversed', () => {
      const reverse = true;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { reverse, type: 'ImageParallax' } as ImageParallaxType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          keyframes: [{ transform: 'translateY(0%)' }, { transform: 'translateY(-33%)' }],
        },
      ];

      const result = ImageParallax.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom speed', () => {
      const speed = 2;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { speed, type: 'ImageParallax' } as ImageParallaxType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          keyframes: [{ transform: 'translateY(-50%)' }, { transform: 'translateY(0%)' }],
        },
      ];

      const result = ImageParallax.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as ImageParallaxType,
      };

      const expectedResult = [
        {
          keyframes: [
            { transform: 'translateY(var(--motion-trans-y-from))' },
            { transform: 'translateY(var(--motion-trans-y-to))' },
          ],
        },
      ];

      const result = ImageParallax.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Reversed', () => {
      const reverse = true;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { reverse } as ImageParallaxType,
      };

      const expectedResult = [
        {
          keyframes: [
            { transform: 'translateY(var(--motion-trans-y-from))' },
            { transform: 'translateY(var(--motion-trans-y-to))' },
          ],
        },
      ];

      const result = ImageParallax.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom speed', () => {
      const speed = 2;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { speed } as ImageParallaxType,
      };

      const expectedResult = [
        {
          keyframes: [
            { transform: 'translateY(var(--motion-trans-y-from))' },
            { transform: 'translateY(var(--motion-trans-y-to))' },
          ],
        },
      ];

      const result = ImageParallax.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
