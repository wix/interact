import { describe, expect, test } from 'vitest';

import * as FlashAnimation from '../Flash';
import { TimeAnimationOptions, Flash, AnimationData } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Flash', () => {
  describe('web() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Flash,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-flash-1',
          duration: 1,
          keyframes: [
            {
              offset: 0,
              opacity: 1,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
            },
            {
              offset: 0.5,
              opacity: 0,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
            },
            { offset: 1, opacity: 1 },
            { offset: 1, opacity: 1 },
          ],
        },
      ];

      const result = FlashAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { iterationDelay: 500 } as Flash,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-flash-067',
          duration: 1500,
          keyframes: [
            {
              offset: 0,
              opacity: 1,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
            },
            { offset: 0.335, opacity: 0 },
            { offset: 0.67, opacity: 1 },
            { offset: 1, opacity: 1 },
          ],
        },
      ];

      const result = FlashAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom easing', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        easing: 'sineIn',
        namedEffect: {} as Flash,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-flash-1',
          duration: 1,
          keyframes: [
            {
              offset: 0,
              opacity: 1,
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            {
              offset: 0.5,
              opacity: 0,
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            { offset: 1, opacity: 1 },
            { offset: 1, opacity: 1 },
          ],
        },
      ];

      const result = FlashAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Flash,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-flash-1',
          duration: 1,
          keyframes: [
            {
              offset: 0,
              opacity: 1,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
            },
            {
              offset: 0.5,
              opacity: 0,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
            },
            { offset: 1, opacity: 1 },
            { offset: 1, opacity: 1 },
          ],
        },
      ];

      const result = FlashAnimation.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { iterationDelay: 500 } as Flash,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-flash-067',
          duration: 1500,
          keyframes: [
            {
              offset: 0,
              opacity: 1,
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
            },
            { offset: 0.335, opacity: 0 },
            { offset: 0.67, opacity: 1 },
            { offset: 1, opacity: 1 },
          ],
        },
      ];

      const result = FlashAnimation.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom easing', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        easing: 'sineIn',
        namedEffect: {} as Flash,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-flash-1',
          duration: 1,
          keyframes: [
            {
              offset: 0,
              opacity: 1,
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            {
              offset: 0.5,
              opacity: 0,
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            },
            { offset: 1, opacity: 1 },
            { offset: 1, opacity: 1 },
          ],
        },
      ];

      const result = FlashAnimation.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('style and web methods should produce identical results for Flash', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 500,
        namedEffect: { iterationDelay: 250 } as Flash,
      };

      const styleResult = FlashAnimation.style(mockOptions);
      const webResult = FlashAnimation.web(mockOptions);

      // Flash doesn't use custom properties, so style and web methods should be identical
      expect(styleResult).toEqual(webResult);
    });

    test('getNames should generate consistent animation names', () => {
      const mockOptions1: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 500,
        namedEffect: { iterationDelay: 250 } as Flash,
      };

      const mockOptions2: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 500,
        namedEffect: { iterationDelay: 250 } as Flash,
      };

      const result1 = FlashAnimation.style?.(mockOptions1);
      const result2 = FlashAnimation.style?.(mockOptions2);

      expect(result1[0].name).toBe(result2[0].name);
      expect(result1[0].name).toBe('motion-flash-067');
    });
  });
});
