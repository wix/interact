import { describe, expect, test } from 'vitest';

import * as RevealIn from '../RevealIn';
import { baseMockOptions } from './testUtils';
import type { RevealIn as RevealInType, AnimationData } from '../../../types';

describe('RevealIn', () => {
  test('RevealIn animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as RevealInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'cubicInOut',
        name: 'motion-revealIn',
        keyframes: [
          {
            clipPath: 'var(--motion-clip-start, polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%))',
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        easing: 'cubicInOut',
        name: 'motion-fadeIn',
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = RevealIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('RevealIn animation with custom direction', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction: 'right' } as RevealInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-revealIn',
        keyframes: [
          {
            clipPath: 'var(--motion-clip-start, polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%))',
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        name: 'motion-fadeIn',
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = RevealIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('RevealIn style with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as RevealInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'cubicInOut',
        name: 'motion-revealIn',
        custom: {
          '--motion-clip-start': 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
        },
        keyframes: [
          {
            clipPath: 'var(--motion-clip-start, polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%))',
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        easing: 'cubicInOut',
        name: 'motion-fadeIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = RevealIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('RevealIn style with custom direction', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction: 'right' } as RevealInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-revealIn',
        custom: {
          '--motion-clip-start': 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
        },
        keyframes: [
          {
            clipPath: 'var(--motion-clip-start, polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%))',
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        name: 'motion-fadeIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = RevealIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
