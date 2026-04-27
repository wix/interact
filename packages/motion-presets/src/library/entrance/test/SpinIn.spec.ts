import { describe, expect, test } from 'vitest';

import * as SpinIn from '../SpinIn';
import { baseMockOptions } from './testUtils';
import { SpinIn as SpinInType, AnimationData } from '../../../types';

describe('SpinIn', () => {
  test('SpinIn animation with default options', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: {} as SpinInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        duration: 0,
      },
      {
        easing: 'cubicInOut',
        keyframes: [
          {
            scale: '0',
            rotate: '-180deg',
          },
          {},
        ],
      },
    ];

    const result = SpinIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('SpinIn animation with custom options', () => {
    const duration = 1000;
    const easing = 'backOut';
    const mockOptions = {
      ...baseMockOptions,
      duration,
      easing,
      namedEffect: {
        direction: 'counter-clockwise',
        spins: 2,
        initialScale: 1,
      } as SpinInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        duration: 1000,
      },
      {
        easing,
        keyframes: [
          {
            scale: '1',
            rotate: '720deg',
          },
          {},
        ],
      },
    ];

    const result = SpinIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('SpinIn.style animation with default options', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: {} as SpinInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        easing: 'cubicIn',
        duration: 0,
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-spinIn',
        easing: 'cubicInOut',
        custom: {
          '--motion-scale': '0',
          '--motion-rotate': '-180deg',
        },
        keyframes: [
          {
            scale: 'var(--motion-scale)',
            rotate: 'var(--motion-rotate)',
          },
          {
            scale: '1',
            rotate: '0deg',
          },
        ],
      },
    ];

    const result = SpinIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('SpinIn.style animation with custom options', () => {
    const duration = 1000;
    const easing = 'backOut';
    const mockOptions = {
      ...baseMockOptions,
      duration,
      easing,
      namedEffect: {
        direction: 'counter-clockwise',
        spins: 2,
        initialScale: 1,
      } as SpinInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        easing: 'cubicIn',
        duration: 1000,
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-spinIn',
        easing,
        custom: {
          '--motion-scale': '1',
          '--motion-rotate': '720deg',
        },
        keyframes: [
          {
            scale: 'var(--motion-scale)',
            rotate: 'var(--motion-rotate)',
          },
          {
            scale: '1',
            rotate: '0deg',
          },
        ],
      },
    ];

    const result = SpinIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
