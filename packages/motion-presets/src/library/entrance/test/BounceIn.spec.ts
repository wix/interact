import { describe, expect, test } from 'vitest';

import * as BounceIn from '../BounceIn';
import { baseMockOptions } from './testUtils';
import type { BounceIn as BounceInType, AnimationData } from '../../../types';

const bounceEasing = expect.stringMatching(/^linear\(0, 0\.0129 3\.25%, .*, 0\.98 95%, 1\)$/);

describe('BounceIn', () => {
  test('BounceIn animation with default options', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: {} as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        duration: 540,
        easing: 'quadOut',
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        easing: bounceEasing,
        keyframes: [
          {
            transform:
              'translate(calc(0 * 50px), calc(1 * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          { transform: 'translate(0px, 0px) rotateZ(var(--motion-rotate, 0deg))' },
        ],
      },
    ];

    const result = BounceIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn animation from top with custom travel', () => {
    const mockOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: { from: 'top', travel: { value: 30, unit: 'percentage' } } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        keyframes: [
          {
            transform:
              'translate(calc(0 * 30%), calc(-1 * 30%)) rotateZ(var(--motion-rotate, 0deg))',
          },
          { transform: 'translate(0px, 0px) rotateZ(var(--motion-rotate, 0deg))' },
        ],
      },
    ];

    const result = BounceIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn animation from left', () => {
    const mockOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: { from: 'left' } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        keyframes: [
          {
            transform:
              'translate(calc(-1 * 50px), calc(0 * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          { transform: 'translate(0px, 0px) rotateZ(var(--motion-rotate, 0deg))' },
        ],
      },
    ];

    const result = BounceIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn animation from back', () => {
    const mockOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: { from: 'back', perspective: 400 } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        easing: bounceEasing,
        keyframes: [
          {
            transform:
              'perspective(400px) translateZ(calc(-1 * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'perspective(400px) translateZ(0px) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn style with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: {} as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        easing: 'quadOut',
        duration: 540,
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-bounceIn',
        easing: bounceEasing,
        custom: {
          '--motion-direction-x': 0,
          '--motion-direction-y': 1,
          '--motion-travel': '50px',
        },
        keyframes: [
          {
            transform:
              'translate(calc(var(--motion-direction-x) * var(--motion-travel)), calc(var(--motion-direction-y) * var(--motion-travel))) rotateZ(var(--motion-rotate, 0deg))',
          },
          { transform: 'translate(0px, 0px) rotateZ(var(--motion-rotate, 0deg))' },
        ],
      },
    ];

    const result = BounceIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn style from back', () => {
    const mockOptions = {
      ...baseMockOptions,
      duration: 1000,
      namedEffect: { from: 'back' } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        name: 'motion-bounceIn',
        custom: {
          '--motion-perspective': '800px',
          '--motion-travel': '50px',
        },
        keyframes: [
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(calc(-1 * var(--motion-travel))) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            transform:
              'perspective(var(--motion-perspective)) translateZ(0px) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
