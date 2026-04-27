import { describe, expect, test } from 'vitest';

import * as BounceIn from '../BounceIn';
import { baseMockOptions } from './testUtils';
import type { BounceIn as BounceInType, AnimationData } from '../../../types';

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
      },
      {
        keyframes: [
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0,
            transform:
              ' translate3d(calc(0 * 1 * 50px), calc(1 * 1 * 50px), calc(0 * 1 * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.3,
            transform:
              ' translate3d(calc(0 * 1 * 0px), calc(1 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.42,
            transform:
              ' translate3d(calc(0 * 1 * 17.5px), calc(1 * 1 * 17.5px), calc(0 * 1 * 17.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.54,
            transform:
              ' translate3d(calc(0 * 1 * 0px), calc(1 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.62,
            transform:
              ' translate3d(calc(0 * 1 * 10.5px), calc(1 * 1 * 10.5px), calc(0 * 1 * 10.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.74,
            transform:
              ' translate3d(calc(0 * 1 * 0px), calc(1 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.82,
            transform:
              ' translate3d(calc(0 * 1 * 4.5px), calc(1 * 1 * 4.5px), calc(0 * 1 * 4.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.9,
            transform:
              ' translate3d(calc(0 * 1 * 0px), calc(1 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.95,
            transform:
              ' translate3d(calc(0 * 1 * 1px), calc(1 * 1 * 1px), calc(0 * 1 * 1px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 1,
            transform:
              ' translate3d(calc(0 * 1 * 0px), calc(1 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn animation with custom distance factor', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { distanceFactor: 2 } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        keyframes: [
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0,
            transform:
              ' translate3d(calc(0 * 2 * 50px), calc(1 * 2 * 50px), calc(0 * 2 * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.3,
            transform:
              ' translate3d(calc(0 * 2 * 0px), calc(1 * 2 * 0px), calc(0 * 2 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.42,
            transform:
              ' translate3d(calc(0 * 2 * 17.5px), calc(1 * 2 * 17.5px), calc(0 * 2 * 17.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.54,
            transform:
              ' translate3d(calc(0 * 2 * 0px), calc(1 * 2 * 0px), calc(0 * 2 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.62,
            transform:
              ' translate3d(calc(0 * 2 * 10.5px), calc(1 * 2 * 10.5px), calc(0 * 2 * 10.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.74,
            transform:
              ' translate3d(calc(0 * 2 * 0px), calc(1 * 2 * 0px), calc(0 * 2 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.82,
            transform:
              ' translate3d(calc(0 * 2 * 4.5px), calc(1 * 2 * 4.5px), calc(0 * 2 * 4.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.9,
            transform:
              ' translate3d(calc(0 * 2 * 0px), calc(1 * 2 * 0px), calc(0 * 2 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.95,
            transform:
              ' translate3d(calc(0 * 2 * 1px), calc(1 * 2 * 1px), calc(0 * 2 * 1px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 1,
            transform:
              ' translate3d(calc(0 * 2 * 0px), calc(1 * 2 * 0px), calc(0 * 2 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn animation with top direction', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction: 'top' } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        keyframes: [
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0,
            transform:
              ' translate3d(calc(0 * 1 * 50px), calc(-1 * 1 * 50px), calc(0 * 1 * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.3,
            transform:
              ' translate3d(calc(0 * 1 * 0px), calc(-1 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.42,
            transform:
              ' translate3d(calc(0 * 1 * 17.5px), calc(-1 * 1 * 17.5px), calc(0 * 1 * 17.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.54,
            transform:
              ' translate3d(calc(0 * 1 * 0px), calc(-1 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.62,
            transform:
              ' translate3d(calc(0 * 1 * 10.5px), calc(-1 * 1 * 10.5px), calc(0 * 1 * 10.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.74,
            transform:
              ' translate3d(calc(0 * 1 * 0px), calc(-1 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.82,
            transform:
              ' translate3d(calc(0 * 1 * 4.5px), calc(-1 * 1 * 4.5px), calc(0 * 1 * 4.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.9,
            transform:
              ' translate3d(calc(0 * 1 * 0px), calc(-1 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.95,
            transform:
              ' translate3d(calc(0 * 1 * 1px), calc(-1 * 1 * 1px), calc(0 * 1 * 1px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 1,
            transform:
              ' translate3d(calc(0 * 1 * 0px), calc(-1 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn animation with right direction', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction: 'right' } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        keyframes: [
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0,
            transform:
              ' translate3d(calc(1 * 1 * 50px), calc(0 * 1 * 50px), calc(0 * 1 * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.3,
            transform:
              ' translate3d(calc(1 * 1 * 0px), calc(0 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.42,
            transform:
              ' translate3d(calc(1 * 1 * 17.5px), calc(0 * 1 * 17.5px), calc(0 * 1 * 17.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.54,
            transform:
              ' translate3d(calc(1 * 1 * 0px), calc(0 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.62,
            transform:
              ' translate3d(calc(1 * 1 * 10.5px), calc(0 * 1 * 10.5px), calc(0 * 1 * 10.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.74,
            transform:
              ' translate3d(calc(1 * 1 * 0px), calc(0 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.82,
            transform:
              ' translate3d(calc(1 * 1 * 4.5px), calc(0 * 1 * 4.5px), calc(0 * 1 * 4.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.9,
            transform:
              ' translate3d(calc(1 * 1 * 0px), calc(0 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.95,
            transform:
              ' translate3d(calc(1 * 1 * 1px), calc(0 * 1 * 1px), calc(0 * 1 * 1px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 1,
            transform:
              ' translate3d(calc(1 * 1 * 0px), calc(0 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn animation with left direction', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction: 'left' } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        keyframes: [
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0,
            transform:
              ' translate3d(calc(-1 * 1 * 50px), calc(0 * 1 * 50px), calc(0 * 1 * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.3,
            transform:
              ' translate3d(calc(-1 * 1 * 0px), calc(0 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.42,
            transform:
              ' translate3d(calc(-1 * 1 * 17.5px), calc(0 * 1 * 17.5px), calc(0 * 1 * 17.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.54,
            transform:
              ' translate3d(calc(-1 * 1 * 0px), calc(0 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.62,
            transform:
              ' translate3d(calc(-1 * 1 * 10.5px), calc(0 * 1 * 10.5px), calc(0 * 1 * 10.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.74,
            transform:
              ' translate3d(calc(-1 * 1 * 0px), calc(0 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.82,
            transform:
              ' translate3d(calc(-1 * 1 * 4.5px), calc(0 * 1 * 4.5px), calc(0 * 1 * 4.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.9,
            transform:
              ' translate3d(calc(-1 * 1 * 0px), calc(0 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.95,
            transform:
              ' translate3d(calc(-1 * 1 * 1px), calc(0 * 1 * 1px), calc(0 * 1 * 1px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 1,
            transform:
              ' translate3d(calc(-1 * 1 * 0px), calc(0 * 1 * 0px), calc(0 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn animation with center direction', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction: 'center' } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {},
      {
        keyframes: [
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0,
            transform:
              'perspective(800px) translate3d(calc(0 * 1 * 50px), calc(0 * 1 * 50px), calc(-1 * 1 * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.3,
            transform:
              'perspective(800px) translate3d(calc(0 * 1 * 0px), calc(0 * 1 * 0px), calc(-1 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.42,
            transform:
              'perspective(800px) translate3d(calc(0 * 1 * 17.5px), calc(0 * 1 * 17.5px), calc(-1 * 1 * 17.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.54,
            transform:
              'perspective(800px) translate3d(calc(0 * 1 * 0px), calc(0 * 1 * 0px), calc(-1 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.62,
            transform:
              'perspective(800px) translate3d(calc(0 * 1 * 10.5px), calc(0 * 1 * 10.5px), calc(-1 * 1 * 10.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.74,
            transform:
              'perspective(800px) translate3d(calc(0 * 1 * 0px), calc(0 * 1 * 0px), calc(-1 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.82,
            transform:
              'perspective(800px) translate3d(calc(0 * 1 * 4.5px), calc(0 * 1 * 4.5px), calc(-1 * 1 * 4.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 0.9,
            transform:
              'perspective(800px) translate3d(calc(0 * 1 * 0px), calc(0 * 1 * 0px), calc(-1 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            offset: 0.95,
            transform:
              'perspective(800px) translate3d(calc(0 * 1 * 1px), calc(0 * 1 * 1px), calc(-1 * 1 * 1px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            offset: 1,
            transform:
              'perspective(800px) translate3d(calc(0 * 1 * 0px), calc(0 * 1 * 0px), calc(-1 * 1 * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});

describe('BounceIn style method', () => {
  test('BounceIn style with default options', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: {} as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        duration: 540,
        name: 'motion-fadeIn',
        easing: 'quadOut',
        custom: {},
        keyframes: [{ offset: 0, opacity: 0 }],
      },
      {
        name: 'motion-bounceIn',
        easing: 'linear',
        custom: {
          '--motion-direction-x': 0,
          '--motion-direction-y': 1,
          '--motion-direction-z': 0,
          '--motion-distance-factor': 1,
          '--motion-perspective': ' ',
          '--motion-ease-in': 'cubic-bezier(0.39, 0.575, 0.565, 1)',
          '--motion-ease-out': 'cubic-bezier(0.47, 0, 0.745, 0.715)',
        },
        keyframes: [
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 50px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 50px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.3,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.42,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 17.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 17.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 17.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.54,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.62,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 10.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 10.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 10.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.74,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.82,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 4.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 4.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 4.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.9,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.95,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 1px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 1px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 1px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 1,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn style with custom distance factor', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { distanceFactor: 2 } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        custom: {},
      },
      {
        name: 'motion-bounceIn',
        custom: {
          '--motion-direction-x': 0,
          '--motion-direction-y': 1,
          '--motion-direction-z': 0,
          '--motion-distance-factor': 2,
          '--motion-perspective': ' ',
          '--motion-ease-in': 'cubic-bezier(0.39, 0.575, 0.565, 1)',
          '--motion-ease-out': 'cubic-bezier(0.47, 0, 0.745, 0.715)',
        },
        keyframes: [
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 50px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 50px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.3,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.42,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 17.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 17.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 17.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.54,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.62,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 10.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 10.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 10.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.74,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.82,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 4.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 4.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 4.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.9,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.95,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 1px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 1px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 1px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 1,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn style with top direction', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction: 'top' } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        custom: {},
      },
      {
        name: 'motion-bounceIn',
        custom: {
          '--motion-direction-x': 0,
          '--motion-direction-y': -1,
          '--motion-direction-z': 0,
          '--motion-distance-factor': 1,
          '--motion-perspective': ' ',
          '--motion-ease-in': 'cubic-bezier(0.39, 0.575, 0.565, 1)',
          '--motion-ease-out': 'cubic-bezier(0.47, 0, 0.745, 0.715)',
        },
        keyframes: [
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 50px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 50px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.3,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.42,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 17.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 17.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 17.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.54,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.62,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 10.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 10.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 10.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.74,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.82,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 4.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 4.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 4.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.9,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.95,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 1px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 1px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 1px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 1,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn style with right direction', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction: 'right' } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        custom: {},
      },
      {
        name: 'motion-bounceIn',
        custom: {
          '--motion-direction-x': 1,
          '--motion-direction-y': 0,
          '--motion-direction-z': 0,
          '--motion-distance-factor': 1,
          '--motion-perspective': ' ',
          '--motion-ease-in': 'cubic-bezier(0.39, 0.575, 0.565, 1)',
          '--motion-ease-out': 'cubic-bezier(0.47, 0, 0.745, 0.715)',
        },
        keyframes: [
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 50px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 50px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.3,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.42,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 17.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 17.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 17.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.54,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.62,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 10.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 10.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 10.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.74,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.82,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 4.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 4.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 4.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.9,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.95,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 1px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 1px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 1px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 1,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn style with left direction', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction: 'left' } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        custom: {},
      },
      {
        name: 'motion-bounceIn',
        custom: {
          '--motion-direction-x': -1,
          '--motion-direction-y': 0,
          '--motion-direction-z': 0,
          '--motion-distance-factor': 1,
          '--motion-perspective': ' ',
          '--motion-ease-in': 'cubic-bezier(0.39, 0.575, 0.565, 1)',
          '--motion-ease-out': 'cubic-bezier(0.47, 0, 0.745, 0.715)',
        },
        keyframes: [
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 50px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 50px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.3,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.42,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 17.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 17.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 17.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.54,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.62,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 10.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 10.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 10.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.74,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.82,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 4.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 4.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 4.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.9,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.95,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 1px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 1px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 1px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 1,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('BounceIn style with center direction', () => {
    const duration = 1000;
    const mockOptions = {
      ...baseMockOptions,
      duration,
      namedEffect: { direction: 'center' } as BounceInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-fadeIn',
        custom: {},
      },
      {
        name: 'motion-bounceIn',
        custom: {
          '--motion-direction-x': 0,
          '--motion-direction-y': 0,
          '--motion-direction-z': -1,
          '--motion-distance-factor': 1,
          '--motion-perspective': 'perspective(800px)',
          '--motion-ease-in': 'cubic-bezier(0.39, 0.575, 0.565, 1)',
          '--motion-ease-out': 'cubic-bezier(0.47, 0, 0.745, 0.715)',
        },
        keyframes: [
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 50px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 50px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 50px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.3,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.42,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 17.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 17.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 17.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.54,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.62,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 10.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 10.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 10.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.74,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.82,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 4.5px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 4.5px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 4.5px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 0.9,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-out)',
            offset: 0.95,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 1px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 1px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 1px)) rotateZ(var(--motion-rotate, 0deg))',
          },
          {
            animationTimingFunction: 'var(--motion-ease-in)',
            offset: 1,
            transform:
              'var(--motion-perspective, ) translate3d(calc(var(--motion-direction-x) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-y) * var(--motion-distance-factor) * 0px), calc(var(--motion-direction-z) * var(--motion-distance-factor) * 0px)) rotateZ(var(--motion-rotate, 0deg))',
          },
        ],
      },
    ];

    const result = BounceIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
