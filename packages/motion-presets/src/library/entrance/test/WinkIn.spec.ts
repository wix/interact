import { describe, expect, test } from 'vitest';

import * as WinkIn from '../WinkIn';
import { baseMockOptions } from './testUtils';
import type { WinkIn as WinkInType, AnimationData } from '../../../types';

describe('WinkIn', () => {
  test('WinkIn animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as WinkInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
      },
      {
        easing: 'quintInOut',
        name: 'motion-winkInClip',
        keyframes: [
          {
            clipPath: `var(--motion-clip-start, polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%))`,
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        easing: 'quintInOut',
        name: 'motion-winkInRotate',
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x, 0), var(--motion-scale-y, 1))',
          },
          {
            transform: 'rotate(var(--motion-rotate, 0deg)) scale(1, 1)',
          },
        ],
      },
    ];

    const result = WinkIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('WinkIn animation with vertical direction', () => {
    const direction = 'vertical';
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction } as WinkIn,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
      },
      {
        easing: 'quintInOut',
        name: 'motion-winkInClip',
        keyframes: [
          {
            clipPath: `var(--motion-clip-start, polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%))`,
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        easing: 'quintInOut',
        name: 'motion-winkInRotate',
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x, 1), var(--motion-scale-y, 0))',
          },
          {
            transform: 'rotate(var(--motion-rotate, 0deg)) scale(1, 1)',
          },
        ],
      },
    ];

    const result = WinkIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('WinkIn animation with custom easing', () => {
    const customEasing = 'circInOut';
    const mockOptions = {
      ...baseMockOptions,
      easing: customEasing,
      namedEffect: {} as WinkIn,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
      },
      {
        name: 'motion-winkInClip',
        easing: 'circInOut',
        keyframes: [
          {
            clipPath: `var(--motion-clip-start, polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%))`,
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        name: 'motion-winkInRotate',
        easing: customEasing,
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x, 0), var(--motion-scale-y, 1))',
          },
          {
            transform: 'rotate(var(--motion-rotate, 0deg)) scale(1, 1)',
          },
        ],
      },
    ];

    const result = WinkIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('WinkIn.style animation with default options', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: {} as WinkIn,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        easing: 'quadOut',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-winkInClip',
        easing: 'quintInOut',
        custom: {
          '--motion-scale-x': 0,
          '--motion-scale-y': 1,
          '--motion-clip-start': 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)',
        },
        keyframes: [
          {
            clipPath: 'var(--motion-clip-start, polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%))',
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        name: 'motion-winkInRotate',
        easing: 'quintInOut',
        duration: duration * 0.85,
        custom: {
          '--motion-scale-x': 0,
          '--motion-scale-y': 1,
          '--motion-clip-start': 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)',
        },
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x, 0), var(--motion-scale-y, 1))',
          },
          {
            transform: 'rotate(var(--motion-rotate, 0deg)) scale(1, 1)',
          },
        ],
      },
    ];

    const result = WinkIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('WinkIn.style animation with vertical direction', () => {
    const direction = 'vertical';
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction } as WinkIn,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        easing: 'quadOut',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-winkInClip',
        easing: 'quintInOut',
        custom: {
          '--motion-scale-x': 1,
          '--motion-scale-y': 0,
          '--motion-clip-start': 'polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%)',
        },
        keyframes: [
          {
            clipPath: 'var(--motion-clip-start, polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%))',
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        name: 'motion-winkInRotate',
        easing: 'quintInOut',
        duration: duration * 0.85,
        custom: {
          '--motion-scale-x': 1,
          '--motion-scale-y': 0,
          '--motion-clip-start': 'polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%)',
        },
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x, 1), var(--motion-scale-y, 0))',
          },
          {
            transform: 'rotate(var(--motion-rotate, 0deg)) scale(1, 1)',
          },
        ],
      },
    ];

    const result = WinkIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('WinkIn.style animation with custom easing', () => {
    const customEasing = 'circInOut';
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      easing: customEasing,
      namedEffect: {} as WinkIn,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        easing: 'quadOut',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-winkInClip',
        easing: customEasing,
        custom: {
          '--motion-scale-x': 0,
          '--motion-scale-y': 1,
          '--motion-clip-start': 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)',
        },
        keyframes: [
          {
            clipPath: 'var(--motion-clip-start, polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%))',
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        name: 'motion-winkInRotate',
        easing: customEasing,
        duration: duration * 0.85,
        custom: {
          '--motion-scale-x': 0,
          '--motion-scale-y': 1,
          '--motion-clip-start': 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)',
        },
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x, 0), var(--motion-scale-y, 1))',
          },
          {
            transform: 'rotate(var(--motion-rotate, 0deg)) scale(1, 1)',
          },
        ],
      },
    ];

    const result = WinkIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
