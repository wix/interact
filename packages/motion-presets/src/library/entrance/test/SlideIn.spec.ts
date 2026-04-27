import { describe, expect, test } from 'vitest';

import * as SlideIn from '../SlideIn';
import { baseMockOptions } from './testUtils';
import type { SlideIn as SlideInType, AnimationData } from '../../../types';

describe('SlideIn', () => {
  test('SlideIn animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as SlideInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-slideIn',
        easing: 'cubicInOut',
        custom: {
          '--motion-clip-start': 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
          '--motion-translate-x': '-100%',
          '--motion-translate-y': '0%',
        },
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-translate-x, -100%), var(--motion-translate-y, 0%))',
            clipPath: 'var(--motion-clip-start, polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%))',
          },
          {
            transform: 'rotate(var(--motion-rotate, 0deg)) translate(0px, 0px)',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        name: 'motion-fadeIn',
        easing: 'cubicInOut',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = SlideIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('SlideIn animation with custom direction', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction: 'right', initialTranslate: 1 } as SlideInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-slideIn',
        easing: 'cubicInOut',
        custom: {
          '--motion-clip-start': 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
          '--motion-translate-x': '100%',
          '--motion-translate-y': '0%',
        },
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-translate-x, 100%), var(--motion-translate-y, 0%))',
            clipPath: 'var(--motion-clip-start, polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%))',
          },
          {
            transform: 'rotate(var(--motion-rotate, 0deg)) translate(0px, 0px)',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        name: 'motion-fadeIn',
        easing: 'cubicInOut',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = SlideIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('SlideIn style with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as SlideInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-slideIn',
        easing: 'cubicInOut',
        custom: {
          '--motion-clip-start': 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
          '--motion-translate-x': '-100%',
          '--motion-translate-y': '0%',
        },
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-translate-x, -100%), var(--motion-translate-y, 0%))',
            clipPath: 'var(--motion-clip-start, polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%))',
          },
          {
            transform: 'rotate(var(--motion-rotate, 0deg)) translate(0px, 0px)',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        name: 'motion-fadeIn',
        easing: 'cubicInOut',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = SlideIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('SlideIn style with custom direction', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction: 'right', initialTranslate: 1 } as SlideInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-slideIn',
        easing: 'cubicInOut',
        custom: {
          '--motion-clip-start': 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
          '--motion-translate-x': '100%',
          '--motion-translate-y': '0%',
        },
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-translate-x, 100%), var(--motion-translate-y, 0%))',
            clipPath: 'var(--motion-clip-start, polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%))',
          },
          {
            transform: 'rotate(var(--motion-rotate, 0deg)) translate(0px, 0px)',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
      {
        name: 'motion-fadeIn',
        easing: 'cubicInOut',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
    ];

    const result = SlideIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
