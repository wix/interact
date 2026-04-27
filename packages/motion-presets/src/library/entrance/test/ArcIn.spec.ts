import { describe, expect, test } from 'vitest';

import * as ArcIn from '../ArcIn';
import { baseMockOptions } from './testUtils';
import type { ArcIn as ArcInType, AnimationData } from '../../../types';

describe('ArcIn', () => {
  test('ArcIn animation with left direction', () => {
    const duration = 1000;
    const direction = 'left';
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction } as ArcInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      { duration: 0.7 * duration },
      {
        easing: 'quintInOut',
        keyframes: [
          {
            transform:
              'perspective(800px) translateZ(calc(-1 * 200px / 2)) rotateX(calc(0 * -1 * 80deg)) rotateY(calc(1 * -1 * 80deg)) translateZ(calc(200px / 2)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform:
              'perspective(800px) translateZ(calc(-1 * 200px / 2)) rotateX(0deg) rotateY(0deg) translateZ(calc(200px / 2)) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = ArcIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('ArcIn animation with top direction', () => {
    const duration = 1000;
    const direction = 'top';
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction } as ArcInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      { duration: 0.7 * duration },
      {
        easing: 'quintInOut',
        keyframes: [
          {
            transform:
              'perspective(800px) translateZ(calc(-1 * 200px / 2)) rotateX(calc(1 * 1 * 80deg)) rotateY(calc(0 * 1 * 80deg)) translateZ(calc(200px / 2)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform:
              'perspective(800px) translateZ(calc(-1 * 200px / 2)) rotateX(0deg) rotateY(0deg) translateZ(calc(200px / 2)) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = ArcIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('ArcIn animation with bottom direction', () => {
    const duration = 1000;
    const direction = 'bottom';
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction } as ArcInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      { duration: 0.7 * duration },
      {
        easing: 'quintInOut',
        keyframes: [
          {
            transform:
              'perspective(800px) translateZ(calc(-1 * 200px / 2)) rotateX(calc(1 * -1 * 80deg)) rotateY(calc(0 * -1 * 80deg)) translateZ(calc(200px / 2)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform:
              'perspective(800px) translateZ(calc(-1 * 200px / 2)) rotateX(0deg) rotateY(0deg) translateZ(calc(200px / 2)) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = ArcIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('ArcIn animation with default values', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as ArcInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      { duration: expect.any(Number) },
      {
        easing: 'quintInOut',
        keyframes: [
          {
            transform:
              'perspective(800px) translateZ(calc(-1 * 200px / 2)) rotateX(calc(0 * 1 * 80deg)) rotateY(calc(1 * 1 * 80deg)) translateZ(calc(200px / 2)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform:
              'perspective(800px) translateZ(calc(-1 * 200px / 2)) rotateX(0deg) rotateY(0deg) translateZ(calc(200px / 2)) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = ArcIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('ArcIn style animation with left direction', () => {
    const duration = 1000;
    const direction = 'left';
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction } as ArcInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        duration: duration * 0.7,
        easing: 'sineIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-arcIn',
        easing: 'quintInOut',
        custom: {
          '--motion-perspective': '800px',
          '--motion-arc-x': '0',
          '--motion-arc-y': '1',
          '--motion-arc-sign': '-1',
          '--motion-depth-negative': 'calc(-1 * 200px / 2)',
          '--motion-depth-positive': 'calc(200px / 2)',
        },
        keyframes: [
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(calc(var(--motion-arc-x) * var(--motion-arc-sign) * 80deg)) rotateY(calc(var(--motion-arc-y) * var(--motion-arc-sign) * 80deg)) translateZ(var(--motion-depth-positive)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(0deg) rotateY(0deg) translateZ(var(--motion-depth-positive)) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = ArcIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('ArcIn style animation with top direction', () => {
    const duration = 1000;
    const direction = 'top';
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction } as ArcInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        duration: duration * 0.7,
        easing: 'sineIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-arcIn',
        easing: 'quintInOut',
        custom: {
          '--motion-perspective': '800px',
          '--motion-arc-x': '1',
          '--motion-arc-y': '0',
          '--motion-arc-sign': '1',
          '--motion-depth-negative': 'calc(-1 * 200px / 2)',
          '--motion-depth-positive': 'calc(200px / 2)',
        },
        keyframes: [
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(calc(var(--motion-arc-x) * var(--motion-arc-sign) * 80deg)) rotateY(calc(var(--motion-arc-y) * var(--motion-arc-sign) * 80deg)) translateZ(var(--motion-depth-positive)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(0deg) rotateY(0deg) translateZ(var(--motion-depth-positive)) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = ArcIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('ArcIn style animation with default values', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as ArcInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        duration: expect.any(Number),
        easing: 'sineIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-arcIn',
        easing: 'quintInOut',
        custom: {
          '--motion-perspective': '800px',
          '--motion-arc-x': '0',
          '--motion-arc-y': '1',
          '--motion-arc-sign': '1',
          '--motion-depth-negative': 'calc(-1 * 200px / 2)',
          '--motion-depth-positive': 'calc(200px / 2)',
        },
        keyframes: [
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(calc(var(--motion-arc-x) * var(--motion-arc-sign) * 80deg)) rotateY(calc(var(--motion-arc-y) * var(--motion-arc-sign) * 80deg)) translateZ(var(--motion-depth-positive)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(0deg) rotateY(0deg) translateZ(var(--motion-depth-positive)) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = ArcIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('ArcIn style animation with bottom direction', () => {
    const duration = 1000;
    const direction = 'bottom';
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction } as ArcInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        duration: duration * 0.7,
        easing: 'sineIn',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-arcIn',
        easing: 'quintInOut',
        custom: {
          '--motion-perspective': '800px',
          '--motion-arc-x': '1',
          '--motion-arc-y': '0',
          '--motion-arc-sign': '-1',
          '--motion-depth-negative': 'calc(-1 * 200px / 2)',
          '--motion-depth-positive': 'calc(200px / 2)',
        },
        keyframes: [
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(calc(var(--motion-arc-x) * var(--motion-arc-sign) * 80deg)) rotateY(calc(var(--motion-arc-y) * var(--motion-arc-sign) * 80deg)) translateZ(var(--motion-depth-positive)) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(0deg) rotateY(0deg) translateZ(var(--motion-depth-positive)) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = ArcIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
