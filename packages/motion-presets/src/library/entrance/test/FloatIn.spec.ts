import { describe, expect, test } from 'vitest';

import * as FloatIn from '../FloatIn';
import { baseMockOptions } from './testUtils';
import type { FloatIn as FloatInType, AnimationData } from '../../../types';

describe('FloatIn', () => {
  test('FloatIn animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as FloatInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'sineInOut',
        keyframes: [
          {
            transform: 'translate(-120px, 0px) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        easing: 'sineInOut',
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = FloatIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('FloatIn animation with custom direction', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction: 'top' } as FloatInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        keyframes: [
          {
            transform: 'translate(0px, -120px) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = FloatIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('FloatIn style animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as FloatInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'sineInOut',
        name: 'motion-floatIn',
        custom: {
          '--motion-translate-x': '-120px',
          '--motion-translate-y': '0px',
        },
        keyframes: [
          {
            transform:
              'translate(var(--motion-translate-x), var(--motion-translate-y)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        easing: 'sineInOut',
        name: 'motion-fadeIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = FloatIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('FloatIn style animation with custom direction', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction: 'top' } as FloatInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-floatIn',
        custom: {
          '--motion-translate-x': '0px',
          '--motion-translate-y': '-120px',
        },
        keyframes: [
          {
            transform:
              'translate(var(--motion-translate-x), var(--motion-translate-y)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        name: 'motion-fadeIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = FloatIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
