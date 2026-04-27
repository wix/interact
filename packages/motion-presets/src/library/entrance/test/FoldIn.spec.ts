import { describe, expect, test } from 'vitest';

import * as FoldIn from '../FoldIn';
import { baseMockOptions } from './testUtils';
import type { FoldIn as FoldInType, AnimationData } from '../../../types';

describe('FoldIn', () => {
  test('FoldIn animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as FoldInType,
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
            transform:
              'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-origin-x, 0%), var(--motion-origin-y, -50%)) perspective(800px) rotateX(var(--motion-rotate-x, -90deg)) rotateY(var(--motion-rotate-y, 0deg)) translate(calc(-1 * var(--motion-origin-x, 0%)), calc(-1 * var(--motion-origin-y, -50%)))',
          },
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-origin-x, 0%), var(--motion-origin-y, -50%)) perspective(800px) rotateX(0deg) rotateY(0deg) translate(calc(-1 * var(--motion-origin-x, 0%)), calc(-1 * var(--motion-origin-y, -50%)))',
          },
        ],
      },
    ];

    const result = FoldIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('FoldIn animation with custom direction and easing', () => {
    const mockOptions = {
      ...baseMockOptions,
      easing: 'cubicInOut',
      namedEffect: {
        direction: 'left',
        initialRotate: 45,
      } as FoldInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'quadOut',
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        easing: 'cubicInOut',
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-origin-x, -50%), var(--motion-origin-y, 0%)) perspective(800px) rotateX(var(--motion-rotate-x, 0deg)) rotateY(var(--motion-rotate-y, 45deg)) translate(calc(-1 * var(--motion-origin-x, -50%)), calc(-1 * var(--motion-origin-y, 0%)))',
          },
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-origin-x, -50%), var(--motion-origin-y, 0%)) perspective(800px) rotateX(0deg) rotateY(0deg) translate(calc(-1 * var(--motion-origin-x, -50%)), calc(-1 * var(--motion-origin-y, 0%)))',
          },
        ],
      },
    ];

    const result = FoldIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('FoldIn style animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as FoldInType,
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
        name: 'motion-foldIn',
        custom: {
          '--motion-perspective': '800px',
          '--motion-origin-x': '0%',
          '--motion-origin-y': '-50%',
          '--motion-rotate-x': '-90deg',
          '--motion-rotate-y': '0deg',
        },
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-origin-x, 0%), var(--motion-origin-y, -50%)) perspective(var(--motion-perspective)) rotateX(var(--motion-rotate-x, -90deg)) rotateY(var(--motion-rotate-y, 0deg)) translate(calc(-1 * var(--motion-origin-x, 0%)), calc(-1 * var(--motion-origin-y, -50%)))',
          },
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-origin-x, 0%), var(--motion-origin-y, -50%)) perspective(var(--motion-perspective)) rotateX(0deg) rotateY(0deg) translate(calc(-1 * var(--motion-origin-x, 0%)), calc(-1 * var(--motion-origin-y, -50%)))',
          },
        ],
      },
    ];

    const result = FoldIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('FoldIn style animation with custom direction and easing', () => {
    const mockOptions = {
      ...baseMockOptions,
      easing: 'cubicInOut',
      namedEffect: {
        direction: 'left',
        initialRotate: 45,
      } as FoldInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'quadOut',
        name: 'motion-fadeIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        easing: 'cubicInOut',
        name: 'motion-foldIn',
        custom: {
          '--motion-perspective': '800px',
          '--motion-origin-x': '-50%',
          '--motion-origin-y': '0%',
          '--motion-rotate-x': '0deg',
          '--motion-rotate-y': '45deg',
        },
        keyframes: [
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-origin-x, -50%), var(--motion-origin-y, 0%)) perspective(var(--motion-perspective)) rotateX(var(--motion-rotate-x, 0deg)) rotateY(var(--motion-rotate-y, 45deg)) translate(calc(-1 * var(--motion-origin-x, -50%)), calc(-1 * var(--motion-origin-y, 0%)))',
          },
          {
            transform:
              'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-origin-x, -50%), var(--motion-origin-y, 0%)) perspective(var(--motion-perspective)) rotateX(0deg) rotateY(0deg) translate(calc(-1 * var(--motion-origin-x, -50%)), calc(-1 * var(--motion-origin-y, 0%)))',
          },
        ],
      },
    ];

    const result = FoldIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
