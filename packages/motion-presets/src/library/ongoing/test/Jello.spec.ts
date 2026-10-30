import { describe, expect, test } from 'vitest';

import * as JelloAnimation from '../Jello';
import { Jello, TimeAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Jello', () => {
  describe('web() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Jello,
      };

      expect(JelloAnimation.web(mockOptions)).toMatchObject([
        {
          name: 'motion-jello-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-skew-y': '12.25deg',
          },
          keyframes: [
            {
              offset: 0,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(12.25deg * 0))',
            },
            {
              offset: 0.24,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(12.25deg * 1))',
            },
            {
              offset: 0.38,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(12.25deg * -0.2857142857142857))',
            },
            {
              offset: 0.58,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(12.25deg * 0.5714285714285714))',
            },
            {
              offset: 0.8,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(12.25deg * -0.2857142857142857))',
            },
            {
              offset: 1,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(12.25deg * 0))',
            },
          ],
        },
      ]);
    });

    test('custom skew, duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {
          skew: 20,
          iterationDelay: 500,
        } as Jello,
      };

      expect(JelloAnimation.web(mockOptions)).toMatchObject([
        {
          duration: 1500,
          name: 'motion-jello-067',
          easing: 'linear',
          custom: {
            '--motion-skew-y': '20deg',
          },
          keyframes: [
            {
              offset: 0,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(20deg * 0))',
            },
            {
              offset: 0.15999999999999998,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(20deg * 1))',
            },
            {
              offset: 0.2533333333333333,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(20deg * -0.2857142857142857))',
            },
            {
              offset: 0.3866666666666666,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(20deg * 0.5714285714285714))',
            },
            {
              offset: 0.5333333333333333,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(20deg * -0.2857142857142857))',
            },
            {
              offset: 0.6666666666666666,
              transform: 'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(20deg * 0))',
            },
          ],
        },
      ]);
    });
  });

  describe('style() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Jello,
      };

      expect(JelloAnimation.style(mockOptions)).toMatchObject([
        {
          name: 'motion-jello-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-skew-y': '12.25deg',
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 0))',
            },
            {
              offset: 0.24,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 1))',
            },
            {
              offset: 0.38,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * -0.2857142857142857))',
            },
            {
              offset: 0.58,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 0.5714285714285714))',
            },
            {
              offset: 0.8,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * -0.2857142857142857))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 0))',
            },
          ],
        },
      ]);
    });

    test('custom skew, duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {
          skew: 20,
          iterationDelay: 500,
        } as Jello,
      };

      expect(JelloAnimation.style(mockOptions)).toMatchObject([
        {
          duration: 1500,
          name: 'motion-jello-067',
          easing: 'linear',
          custom: {
            '--motion-skew-y': '20deg',
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 0))',
            },
            {
              offset: 0.15999999999999998,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 1))',
            },
            {
              offset: 0.2533333333333333,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * -0.2857142857142857))',
            },
            {
              offset: 0.3866666666666666,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 0.5714285714285714))',
            },
            {
              offset: 0.5333333333333333,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * -0.2857142857142857))',
            },
            {
              offset: 0.6666666666666666,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) skewY(calc(var(--motion-skew-y) * 0))',
            },
          ],
        },
      ]);
    });
  });

  test('getNames', () => {
    expect(JelloAnimation.getNames({ ...baseMockOptions, namedEffect: {} as Jello })).toEqual([
      'motion-jello-1',
    ]);
  });

  test('schema', () => {
    expect(JelloAnimation.schema).toEqual({
      iterationDelay: {
        type: 'number',
        min: 0,
        default: 0,
      },
      skew: {
        type: 'number',
        default: 12.25,
      },
    });
  });
});
