import { describe, expect, test } from 'vitest';

import * as GlideIn from '../GlideIn';
import { baseMockOptions } from './testUtils';
import type { GlideIn as GlideInType, AnimationData } from '../../../types';

describe('GlideIn', () => {
  test('GlideIn animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as GlideInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'quintInOut',
        keyframes: [
          {
            transform: 'translate(-100%, 0%) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        keyframes: [{ opacity: 0, offset: 0, easing: 'step-start' }],
      },
    ];

    const result = GlideIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('GlideIn animation with custom direction and distance', () => {
    const direction = 45;
    const distance = { value: 200, unit: 'px' };
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction, distance } as GlideInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        keyframes: [
          {
            transform: 'translate(141px, -141px) rotate(var(--motion-rotate, 0deg))',
          },
          {
            transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
          },
        ],
      },
      {
        keyframes: [{ opacity: 0, offset: 0, easing: 'step-start' }],
      },
    ];

    const result = GlideIn.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('GlideIn style animation with default options', () => {
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: {} as GlideInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        easing: 'quintInOut',
        name: 'motion-glideIn',
        custom: {
          '--motion-translate-x': '-100%',
          '--motion-translate-y': '0%',
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
        keyframes: [{ opacity: 0, offset: 0, easing: 'step-start' }],
      },
    ];

    const result = GlideIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('GlideIn style animation with custom direction and distance', () => {
    const direction = 45;
    const distance = { value: 200, unit: 'px' };
    const mockOptions = {
      ...baseMockOptions,
      namedEffect: { direction, distance } as GlideInType,
    };

    const expectedResult: Partial<AnimationData>[] = [
      {
        name: 'motion-glideIn',
        custom: {
          '--motion-translate-x': '141px',
          '--motion-translate-y': '-141px',
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
        keyframes: [{ opacity: 0, offset: 0, easing: 'step-start' }],
      },
    ];

    const result = GlideIn.style?.(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
