import { describe, expect, test } from 'vitest';

import * as StretchScroll from '../StretchScroll';
import type { StretchScroll as StretchScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('StretchScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as StretchScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          easing: 'backInOut',
          keyframes: [
            {
              transform: 'translateY(0px) scale(1, 1) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'translateY(calc(-1 * 60%)) scale(0.4, 1.6) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
        {
          fill: 'forwards',
          easing:
            'linear(0 0%, 0 43.75%, 0.3927 50%, 0.7746 56.25%, 0.987 62.5%, 1 68.75%, 1 100%)',
          keyframes: [
            {
              opacity: 1,
            },
            {
              opacity: 0,
            },
          ],
        },
      ];

      const result = StretchScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom stretch value', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { stretch: 0.8 } as StretchScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          easing: 'backInOut',
          keyframes: [
            {
              transform: 'translateY(0px) scale(1, 1) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'translateY(calc(-1 * 80%)) scale(0.19999999999999996, 1.8) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
        {
          fill: 'forwards',
          easing:
            'linear(0 0%, 0 43.75%, 0.3927 50%, 0.7746 56.25%, 0.987 62.5%, 1 68.75%, 1 100%)',
          keyframes: [
            {
              opacity: 1,
            },
            {
              opacity: 0,
            },
          ],
        },
      ];

      const result = StretchScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - in', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'in' } as StretchScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'backInOut',
          keyframes: [
            {
              transform: 'translateY(60%) scale(0.4, 1.6) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform: 'translateY(0px) scale(1, 1) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
        {
          fill: 'backwards',
          easing:
            'linear(0 0%, 0 33.9%, 0.0472 35.6%, 0.1041 37.3%, 0.173 39%, 0.2557 40.7%, 0.3539 42.4%, 0.4681 44.1%, 0.5964 45.8%, 0.7335 47.5%, 0.871 49.2%, 1 50.9%, 1 100%)',
          keyframes: [
            {
              opacity: 0,
            },
            {
              opacity: 1,
            },
          ],
        },
      ];

      const result = StretchScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as StretchScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          keyframes: [
            {
              transform: 'translateY(60%) scale(0.4, 1.6) rotate(var(--motion-rotate, 0deg))',
              easing:
                'linear(0 0%, -0.0452 6.25%, -0.0774 12.5%, -0.0923 18.75%, -0.0828 25%, -0.0361 31.25%, 0.0725 37.5%, 0.2881 43.75%, 0.6067 50%, 0.8551 56.25%, 0.9919 62.5%, 1.0609 68.75%, 1.0892 75%, 1.0907 81.25%, 1.0734 87.5%, 1.0421 93.75%, 1 100%)',
            },
            {
              transform: 'translateY(0px) scale(1, 1) rotate(var(--motion-rotate, 0deg))',
              easing:
                'linear(0 0%, -0.0452 6.25%, -0.0774 12.5%, -0.0923 18.75%, -0.0828 25%, -0.0361 31.25%, 0.0725 37.5%, 0.2881 43.75%, 0.6067 50%, 0.8551 56.25%, 0.9919 62.5%, 1.0609 68.75%, 1.0892 75%, 1.0907 81.25%, 1.0734 87.5%, 1.0421 93.75%, 1 100%)',
            },
            {
              transform:
                'translateY(calc(-1 * 60%)) scale(0.4, 1.6) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
        {
          fill: 'both',
          easing:
            'linear(0 0%, 1 31.25%, 1 71.88%, 0.6073 75%, 0.2254 78.13%, 0.013 81.25%, 0 84.38%, 0 100%)',
          keyframes: [
            {
              opacity: 0,
            },
            {
              opacity: 1,
            },
          ],
        },
      ];

      const result = StretchScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as StretchScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          easing: 'backInOut',
          custom: {
            '--motion-stretch-scale-x-from': 1,
            '--motion-stretch-scale-y-from': 1,
            '--motion-stretch-scale-x-to': 0.4,
            '--motion-stretch-scale-y-to': 1.6,
            '--motion-stretch-trans-from': '0px',
            '--motion-stretch-trans-to': 'calc(-1 * 60%)',
          },
          keyframes: [
            {
              transform:
                'translateY(var(--motion-stretch-trans-from)) scale(var(--motion-stretch-scale-x-from), var(--motion-stretch-scale-y-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'translateY(var(--motion-stretch-trans-to)) scale(var(--motion-stretch-scale-x-to), var(--motion-stretch-scale-y-to)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
        {
          fill: 'forwards',
          easing:
            'linear(0 0%, 0 43.75%, 0.3927 50%, 0.7746 56.25%, 0.987 62.5%, 1 68.75%, 1 100%)',
          keyframes: [
            {
              opacity: 1,
            },
            {
              opacity: 0,
            },
          ],
        },
      ];

      const result = StretchScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - in', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'in' } as StretchScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'backInOut',
          custom: {
            '--motion-stretch-scale-x-from': 0.4,
            '--motion-stretch-scale-y-from': 1.6,
            '--motion-stretch-scale-x-to': 1,
            '--motion-stretch-scale-y-to': 1,
            '--motion-stretch-trans-from': '60%',
            '--motion-stretch-trans-to': '0px',
          },
          keyframes: [
            {
              transform:
                'translateY(var(--motion-stretch-trans-from)) scale(var(--motion-stretch-scale-x-from), var(--motion-stretch-scale-y-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'translateY(var(--motion-stretch-trans-to)) scale(var(--motion-stretch-scale-x-to), var(--motion-stretch-scale-y-to)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
        {
          fill: 'backwards',
          easing:
            'linear(0 0%, 0 33.9%, 0.0472 35.6%, 0.1041 37.3%, 0.173 39%, 0.2557 40.7%, 0.3539 42.4%, 0.4681 44.1%, 0.5964 45.8%, 0.7335 47.5%, 0.871 49.2%, 1 50.9%, 1 100%)',
          keyframes: [
            {
              opacity: 0,
            },
            {
              opacity: 1,
            },
          ],
        },
      ];

      const result = StretchScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as StretchScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          custom: {
            '--motion-stretch-scale-x-from': 0.4,
            '--motion-stretch-scale-y-from': 1.6,
            '--motion-stretch-scale-x-to': 0.4,
            '--motion-stretch-scale-y-to': 1.6,
            '--motion-stretch-trans-from': '60%',
            '--motion-stretch-trans-to': 'calc(-1 * 60%)',
          },
          keyframes: [
            {
              transform:
                'translateY(var(--motion-stretch-trans-from)) scale(var(--motion-stretch-scale-x-from), var(--motion-stretch-scale-y-from)) rotate(var(--motion-rotate, 0deg))',
              easing:
                'linear(0 0%, -0.0452 6.25%, -0.0774 12.5%, -0.0923 18.75%, -0.0828 25%, -0.0361 31.25%, 0.0725 37.5%, 0.2881 43.75%, 0.6067 50%, 0.8551 56.25%, 0.9919 62.5%, 1.0609 68.75%, 1.0892 75%, 1.0907 81.25%, 1.0734 87.5%, 1.0421 93.75%, 1 100%)',
            },
            {
              transform: 'translateY(0px) scale(1, 1) rotate(var(--motion-rotate, 0deg))',
              easing:
                'linear(0 0%, -0.0452 6.25%, -0.0774 12.5%, -0.0923 18.75%, -0.0828 25%, -0.0361 31.25%, 0.0725 37.5%, 0.2881 43.75%, 0.6067 50%, 0.8551 56.25%, 0.9919 62.5%, 1.0609 68.75%, 1.0892 75%, 1.0907 81.25%, 1.0734 87.5%, 1.0421 93.75%, 1 100%)',
            },
            {
              transform:
                'translateY(var(--motion-stretch-trans-to)) scale(var(--motion-stretch-scale-x-to), var(--motion-stretch-scale-y-to)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
        {
          fill: 'both',
          easing:
            'linear(0 0%, 1 31.25%, 1 71.88%, 0.6073 75%, 0.2254 78.13%, 0.013 81.25%, 0 84.38%, 0 100%)',
          keyframes: [
            {
              opacity: 0,
            },
            {
              opacity: 1,
            },
          ],
        },
      ];

      const result = StretchScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
