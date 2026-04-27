import { describe, expect, test } from 'vitest';

import * as FadeIn from '../FadeIn';
import { baseMockOptions } from './testUtils';
import type { FadeIn as FadeInType, AnimationData } from '../../../types';

describe('FadeIn', () => {
  test('FadeIn animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as FadeInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'sineInOut',
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = FadeIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('FadeIn style animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as FadeInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'sineInOut',
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = FadeIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
