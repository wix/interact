import { describe, expect, test } from 'vitest';

import * as TiltIn from '../TiltIn';
import { baseMockOptions } from './testUtils';
import type { TiltIn as TiltInType, AnimationData } from '../../../types';

describe('TiltIn', () => {
  test('TiltIn animation with default options', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: {} as TiltInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        duration: 200,
      },
      {
        easing: 'cubicOut',
      },
      {
        easing: 'cubicOut',
        duration: 800,
        keyframes: [
          {
            clipPath: 'var(--motion-clip-start, polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%))',
            transform: `rotateZ(30deg)`,
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            transform: 'rotateZ(0deg)',
          },
        ],
      },
    ];

    const result = TiltIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('TiltIn animation with custom direction', () => {
    const duration = 1000;
    const easing = 'cubicIn';
    const mockOptions = {
      ...baseMockOptions,
      easing,
      duration,
      namedEffect: { direction: 'right' } as TiltInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        duration: 200,
      },
      { easing },
      {
        easing,
        duration: 800,
        keyframes: [
          {
            clipPath: 'var(--motion-clip-start, polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%))',
            transform: `rotateZ(-30deg)`,
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
        ],
      },
    ];

    const result = TiltIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('TiltIn.style animation with default options', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: {} as TiltInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        duration: 200,
        easing: 'cubicOut',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-tiltInRotate',
        easing: 'cubicOut',
        custom: {
          '--motion-perspective': '800px',
          '--motion-depth-negative': 'calc(200px / 2 * -1)',
          '--motion-depth-positive': 'calc(200px / 2)',
        },
        keyframes: [
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(-90deg) translateZ(var(--motion-depth-positive)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(0deg) translateZ(var(--motion-depth-positive)) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        name: 'motion-tiltInClip',
        easing: 'cubicOut',
        duration: 800,
        composite: 'add',
        custom: {
          '--motion-rotate-z': '30deg',
          '--motion-clip-start': 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        },
        keyframes: [
          {
            clipPath: 'var(--motion-clip-start, polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%))',
            transform: 'rotateZ(var(--motion-rotate-z))',
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            transform: 'rotateZ(0deg)',
          },
        ],
      },
    ];

    const result = TiltIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('TiltIn.style animation with custom direction', () => {
    const duration = 1000;
    const easing = 'cubicIn';
    const mockOptions = {
      ...baseMockOptions,
      easing,
      duration,
      namedEffect: { direction: 'right' } as TiltInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        duration: 200,
        easing: 'cubicOut',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-tiltInRotate',
        easing,
        custom: {
          '--motion-perspective': '800px',
          '--motion-depth-negative': 'calc(200px / 2 * -1)',
          '--motion-depth-positive': 'calc(200px / 2)',
        },
        keyframes: [
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(-90deg) translateZ(var(--motion-depth-positive)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(0deg) translateZ(var(--motion-depth-positive)) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        name: 'motion-tiltInClip',
        easing,
        duration: 800,
        composite: 'add',
        custom: {
          '--motion-rotate-z': '-30deg',
          '--motion-clip-start': 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        },
        keyframes: [
          {
            clipPath: 'var(--motion-clip-start, polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%))',
            transform: 'rotateZ(var(--motion-rotate-z))',
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            transform: 'rotateZ(0deg)',
          },
        ],
      },
    ];

    const result = TiltIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
