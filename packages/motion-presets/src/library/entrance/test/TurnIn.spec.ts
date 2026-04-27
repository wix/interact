import { describe, expect, test } from 'vitest';

import * as TurnIn from '../TurnIn';
import { baseMockOptions } from './testUtils';
import type { TurnIn as TurnInType, AnimationData } from '../../../types';

describe('TurnIn', () => {
  const duration = 1000;

  test('TurnIn animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: {} as TurnInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        duration: 600,
      },
      {
        easing: 'backOut',
        keyframes: [
          {
            transform: `translate(-50%, -50%) rotate(-50deg) translate(50%, 50%) rotate(var(--motion-rotate, 0deg))`,
          },
          {
            transform: `translate(-50%, -50%) rotate(0deg) translate(50%, 50%) rotate(var(--motion-rotate, 0deg))`,
          },
        ],
      },
    ];

    const result = TurnIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('TurnIn animation with bottom-right direction', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction: 'bottom-right' } as TurnInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        easing: 'backOut',
        keyframes: [
          {
            transform: `translate(50%, 50%) rotate(50deg) translate(-50%, -50%) rotate(var(--motion-rotate, 0deg))`,
          },
          {
            transform: `translate(50%, 50%) rotate(0deg) translate(-50%, -50%) rotate(var(--motion-rotate, 0deg))`,
          },
        ],
      },
    ];

    const result = TurnIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('TurnIn animation with top-right direction', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction: 'top-right' } as TurnInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        easing: 'backOut',
        keyframes: [
          {
            transform: `translate(50%, -50%) rotate(50deg) translate(-50%, 50%) rotate(var(--motion-rotate, 0deg))`,
          },
          {
            transform: `translate(50%, -50%) rotate(0deg) translate(-50%, 50%) rotate(var(--motion-rotate, 0deg))`,
          },
        ],
      },
    ];

    const result = TurnIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('TurnIn animation with bottom-left direction', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction: 'bottom-left' } as TurnInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        easing: 'backOut',
        keyframes: [
          {
            transform: `translate(-50%, 50%) rotate(-50deg) translate(50%, -50%) rotate(var(--motion-rotate, 0deg))`,
          },
          {
            transform: `translate(-50%, 50%) rotate(0deg) translate(50%, -50%) rotate(var(--motion-rotate, 0deg))`,
          },
        ],
      },
    ];

    const result = TurnIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('TurnIn animation with custom easing', () => {
    const customEasing = 'circInOut';
    const mockOptions = {
      ...baseMockOptions,
      easing: customEasing,
      namedEffect: {} as TurnInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        easing: customEasing,
        keyframes: [
          {
            transform: `translate(-50%, -50%) rotate(-50deg) translate(50%, 50%) rotate(var(--motion-rotate, 0deg))`,
          },
          {
            transform: `translate(-50%, -50%) rotate(0deg) translate(50%, 50%) rotate(var(--motion-rotate, 0deg))`,
          },
        ],
      },
    ];

    const result = TurnIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('TurnIn.style animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: {} as TurnInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        duration: 600,
        easing: 'sineIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-turnIn',
        easing: 'backOut',
        custom: {
          '--motion-origin': '-50%, -50%',
          '--motion-origin-invert': '50%, 50%',
          '--motion-rotate-z': '-50deg',
        },
        keyframes: [
          {
            transform: `translate(var(--motion-origin)) rotate(var(--motion-rotate-z)) translate(var(--motion-origin-invert)) rotate(var(--motion-rotate, 0deg))`,
          },
          {
            transform: `translate(var(--motion-origin)) rotate(0deg) translate(var(--motion-origin-invert)) rotate(var(--motion-rotate, 0deg))`,
          },
        ],
      },
    ];

    const result = TurnIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('TurnIn.style animation with bottom-right direction', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction: 'bottom-right' } as TurnInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        easing: 'sineIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-turnIn',
        easing: 'backOut',
        custom: {
          '--motion-origin': '50%, 50%',
          '--motion-origin-invert': '-50%, -50%',
          '--motion-rotate-z': '50deg',
        },
        keyframes: [
          {
            transform: `translate(var(--motion-origin)) rotate(var(--motion-rotate-z)) translate(var(--motion-origin-invert)) rotate(var(--motion-rotate, 0deg))`,
          },
          {
            transform: `translate(var(--motion-origin)) rotate(0deg) translate(var(--motion-origin-invert)) rotate(var(--motion-rotate, 0deg))`,
          },
        ],
      },
    ];

    const result = TurnIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('TurnIn.style animation with custom easing', () => {
    const customEasing = 'circInOut';
    const mockOptions = {
      ...baseMockOptions,
      easing: customEasing,
      namedEffect: {} as TurnInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        easing: 'sineIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-turnIn',
        easing: customEasing,
        custom: {
          '--motion-origin': '-50%, -50%',
          '--motion-origin-invert': '50%, 50%',
          '--motion-rotate-z': '-50deg',
        },
        keyframes: [
          {
            transform: `translate(var(--motion-origin)) rotate(var(--motion-rotate-z)) translate(var(--motion-origin-invert)) rotate(var(--motion-rotate, 0deg))`,
          },
          {
            transform: `translate(var(--motion-origin)) rotate(0deg) translate(var(--motion-origin-invert)) rotate(var(--motion-rotate, 0deg))`,
          },
        ],
      },
    ];

    const result = TurnIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
