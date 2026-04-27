import { describe, expect, test } from 'vitest';

import * as CurveIn from '../CurveIn';
import type { AnimationData, CurveIn as CurveInType } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('CurveIn', () => {
  describe('web method', () => {
    test('CurveIn animation with default options', () => {
      const duration = 1000;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as CurveInType,
        duration,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          easing: 'quadOut',
          keyframes: [
            {
              transform:
                'perspective(200px) translateZ(calc(300px * -3)) rotateX(0deg) rotateY(180deg) translateZ(calc(300px * 3)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(200px) translateZ(calc(300px * -3)) rotateX(0deg) rotateY(0deg) translateZ(calc(300px * 3)) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
        {
          easing: 'quadOut',
          keyframes: [{ offset: 0, opacity: 0 }],
        },
      ];

      const result = CurveIn.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('CurveIn animation with left direction', () => {
      const duration = 1500;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as CurveInType,
        duration,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          easing: 'quadOut',
          keyframes: [
            {
              transform:
                'perspective(200px) translateZ(calc(300px * -3)) rotateX(0deg) rotateY(-180deg) translateZ(calc(300px * 3)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(200px) translateZ(calc(300px * -3)) rotateX(0deg) rotateY(0deg) translateZ(calc(300px * 3)) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
        {
          easing: 'quadOut',
          keyframes: [{ offset: 0, opacity: 0 }],
        },
      ];

      const result = CurveIn.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style method', () => {
    test('CurveIn style with default options', () => {
      const duration = 1000;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as CurveInType,
        duration,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-curveIn',
          easing: 'quadOut',
          custom: {
            '--motion-perspective': '200px',
            '--motion-rotate-x': '0deg',
            '--motion-rotate-y': '180deg',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(var(--motion-rotate-x)) rotateY(var(--motion-rotate-y)) translateZ(var(--motion-depth-positive)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(0deg) rotateY(0deg) translateZ(var(--motion-depth-positive)) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
        {
          name: 'motion-fadeIn',
          easing: 'quadOut',
          custom: {},
          keyframes: [{ offset: 0, opacity: 0 }],
        },
      ];

      const result = CurveIn.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('CurveIn style with left direction', () => {
      const duration = 1500;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as CurveInType,
        duration,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-curveIn',
          easing: 'quadOut',
          custom: {
            '--motion-perspective': '200px',
            '--motion-rotate-x': '0deg',
            '--motion-rotate-y': '-180deg',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(var(--motion-rotate-x)) rotateY(var(--motion-rotate-y)) translateZ(var(--motion-depth-positive)) rotateZ(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateZ(var(--motion-depth-negative)) rotateX(0deg) rotateY(0deg) translateZ(var(--motion-depth-positive)) rotateZ(var(--motion-rotate, 0deg))',
            },
          ],
        },
        {
          name: 'motion-fadeIn',
          easing: 'quadOut',
          custom: {},
          keyframes: [{ offset: 0, opacity: 0 }],
        },
      ];

      const result = CurveIn.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
