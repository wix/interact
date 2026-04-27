import { describe, expect, test } from 'vitest';

import * as BgPan from '../BgPan';
import { baseMockOptions } from './testUtils';
import type { BgPan as BgPanType, AnimationData } from '../../../types';

describe('BgPan', () => {
  describe('web', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgPanType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          ...baseMockOptions,
          keyframes: [{ transform: 'translateX(8%)' }, { transform: 'translateX(calc(-1 * 8%))' }],
        },
      ];

      const result = BgPan.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - right', () => {
      const direction = 'right';
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { direction } as BgPanType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          keyframes: [
            { transform: 'translateX(-8%)' },
            { transform: 'translateX(calc(-1 * -8%))' },
          ],
        },
      ];

      const result = BgPan.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom speed', () => {
      const speed = 0.5;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { speed } as BgPanType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          keyframes: [
            { transform: 'translateX(16%)' },
            { transform: 'translateX(calc(-1 * 16%))' },
          ],
        },
      ];

      const result = BgPan.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgPanType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          keyframes: [
            { transform: 'translateX(var(--motion-trans-x))' },
            { transform: 'translateX(calc(-1 * var(--motion-trans-x)))' },
          ],
        },
      ];

      const result = BgPan.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - right', () => {
      const direction = 'right';
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { direction } as BgPanType,
      };

      const expectedResult = [
        {
          keyframes: [
            { transform: 'translateX(var(--motion-trans-x))' },
            { transform: 'translateX(calc(-1 * var(--motion-trans-x)))' },
          ],
        },
      ];

      const result = BgPan.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom speed', () => {
      const speed = 0.5;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { speed } as BgPanType,
      };

      const expectedResult = [
        {
          keyframes: [
            { transform: 'translateX(var(--motion-trans-x))' },
            { transform: 'translateX(calc(-1 * var(--motion-trans-x)))' },
          ],
        },
      ];

      const result = BgPan.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
