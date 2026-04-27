import { describe, expect, test } from 'vitest';

import * as FlipIn from '../FlipIn';
import { baseMockOptions } from './testUtils';
import type { FlipIn as FlipInType, AnimationData } from '../../../types';

describe('FlipIn', () => {
  test('FlipIn animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as FlipInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'quadOut',
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        easing: 'backOut',
        keyframes: [
          {
            transform: `perspective(800px) rotate(var(--motion-rotate, 0deg)) rotateX(var(--motion-rotate-x, 90deg)) rotateY(var(--motion-rotate-y, 0deg))`,
          },
          {
            transform: `perspective(800px) rotate(var(--motion-rotate, 0deg)) rotateX(0deg) rotateY(0deg)`,
          },
        ],
      },
    ];

    const result = FlipIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('FlipIn animation with custom values', () => {
    const easing = 'backIn';
    const direction = 'right';
    const mockOptions = {
      ...baseMockOptions,
      easing,
      namedEffect: {
        direction,
        initialRotate: 50,
      } as FlipInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'quadOut',
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        easing,
        keyframes: [
          {
            transform: `perspective(800px) rotate(var(--motion-rotate, 0deg)) rotateX(var(--motion-rotate-x, 0deg)) rotateY(var(--motion-rotate-y, 50deg))`,
          },
          {
            transform: `perspective(800px) rotate(var(--motion-rotate, 0deg)) rotateX(0deg) rotateY(0deg)`,
          },
        ],
      },
    ];

    const result = FlipIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('FlipIn style with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as FlipInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'quadOut',
        name: 'motion-fadeIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        easing: 'backOut',
        name: 'motion-flipIn',
        custom: {
          '--motion-perspective': '800px',
          '--motion-rotate-x': '90deg',
          '--motion-rotate-y': '0deg',
        },
        keyframes: [
          {
            transform: `perspective(var(--motion-perspective)) rotate(var(--motion-rotate, 0deg)) rotateX(var(--motion-rotate-x, 90deg)) rotateY(var(--motion-rotate-y, 0deg))`,
          },
          {
            transform: `perspective(var(--motion-perspective)) rotate(var(--motion-rotate, 0deg)) rotateX(0deg) rotateY(0deg)`,
          },
        ],
      },
    ];

    const result = FlipIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('FlipIn style with custom values', () => {
    const easing = 'backIn';
    const direction = 'right';
    const mockOptions = {
      ...baseMockOptions,
      easing,
      namedEffect: {
        direction,
        initialRotate: 50,
      } as FlipInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'quadOut',
        name: 'motion-fadeIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        easing,
        name: 'motion-flipIn',
        custom: {
          '--motion-perspective': '800px',
          '--motion-rotate-x': '0deg',
          '--motion-rotate-y': '50deg',
        },
        keyframes: [
          {
            transform: `perspective(var(--motion-perspective)) rotate(var(--motion-rotate, 0deg)) rotateX(var(--motion-rotate-x, 0deg)) rotateY(var(--motion-rotate-y, 50deg))`,
          },
          {
            transform: `perspective(var(--motion-perspective)) rotate(var(--motion-rotate, 0deg)) rotateX(0deg) rotateY(0deg)`,
          },
        ],
      },
    ];

    const result = FlipIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
