import { describe, expect, test } from 'vitest';

import * as BgSkew from '../BgSkew';
import { baseMockOptions } from './testUtils';
import type { BgSkew as BgSkewType, AnimationData } from '../../../types';

describe('BgSkew', () => {
  describe('web', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { type: 'BgSkew' } as BgSkewType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          keyframes: [{ transform: `skewY(20deg)` }, { transform: `skewY(calc(-1 * 20deg))` }],
        },
      ];

      const result = BgSkew.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom angle', () => {
      const angle = 20;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { angle, type: 'BgSkew' } as BgSkewType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          keyframes: [{ transform: `skewY(20deg)` }, { transform: `skewY(calc(-1 * 20deg))` }],
        },
      ];

      const result = BgSkew.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom direction - clockwise', () => {
      const direction = 'clockwise';
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { direction, type: 'BgSkew' } as BgSkewType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          keyframes: [{ transform: `skewY(-20deg)` }, { transform: `skewY(calc(-1 * -20deg))` }],
        },
      ];

      const result = BgSkew.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgSkewType,
      };

      const expectedResult = [
        {
          keyframes: [
            { transform: `skewY(var(--motion-skew))` },
            { transform: `skewY(calc(-1 * var(--motion-skew)))` },
          ],
        },
      ];

      const result = BgSkew.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom angle', () => {
      const angle = 20;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { angle } as BgSkewType,
      };

      const expectedResult = [
        {
          keyframes: [
            { transform: `skewY(var(--motion-skew))` },
            { transform: `skewY(calc(-1 * var(--motion-skew)))` },
          ],
        },
      ];

      const result = BgSkew.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom direction - clockwise', () => {
      const direction = 'clockwise';
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { direction } as BgSkewType,
      };

      const expectedResult = [
        {
          keyframes: [
            { transform: `skewY(var(--motion-skew))` },
            { transform: `skewY(calc(-1 * var(--motion-skew)))` },
          ],
        },
      ];

      const result = BgSkew.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
