import { describe, expect, test } from 'vitest';

import * as BlurIn from '../BlurIn';
import { baseMockOptions } from './testUtils';
import type { BlurIn as BlurInType, AnimationData } from '../../../types';

describe('BlurIn', () => {
  test('BlurIn animation with default options', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: {} as BlurInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        duration: duration! * 0.7,
      },
      {
        easing: 'linear',
        keyframes: [{ filter: 'blur(6px)' }, {}],
      },
    ];

    const result = BlurIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BlurIn animation with custom blur value', () => {
    const duration = 1000;
    const blur = 10;
    const easing = 'sineIn';
    const mockOptions = {
      ...baseMockOptions,
      duration,
      easing,
      namedEffect: { blur } as BlurInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        easing,
        keyframes: [{ filter: `blur(10px)` }, {}],
      },
    ];

    const result = BlurIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BlurIn style animation with default options', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: {} as BlurInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        duration: duration! * 0.7,
        easing: 'sineIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-blurIn',
        easing: 'linear',
        custom: {
          '--motion-blur': '6px',
        },
        keyframes: [{ filter: 'blur(var(--motion-blur))' }, { filter: 'blur(0px)' }],
      },
    ];

    const result = BlurIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BlurIn style animation with custom blur value', () => {
    const duration = 1000;
    const blur = 10;
    const easing = 'sineIn';
    const mockOptions = {
      ...baseMockOptions,
      duration,
      easing,
      namedEffect: { blur } as BlurInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        duration: duration! * 0.7,
        easing: 'sineIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-blurIn',
        easing,
        custom: {
          '--motion-blur': '10px',
        },
        keyframes: [{ filter: 'blur(var(--motion-blur))' }, { filter: 'blur(0px)' }],
      },
    ];

    const result = BlurIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
