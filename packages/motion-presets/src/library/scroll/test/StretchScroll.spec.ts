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
              scale: '1 1',
              translate: '0 0',
            },
            {
              scale: '0.4 1.6',
              translate: '0 calc(100% * (1 - 1.6))',
            },
          ],
        },
        {
          fill: 'forwards',
          easing:
            'linear(0 0%, 0 45.1%, 0.1458 46.9%, 0.2918 48.7%, 0.4315 50.5%, 0.5575 52.3%, 0.6668 54.1%, 0.7595 55.9%, 0.8372 57.7%, 0.902 59.5%, 0.9558 61.3%, 1 63%, 1 100%)',
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
          keyframes: [
            {
              scale: '1 1',
              translate: '0 0',
            },
            {
              scale: '0.2 1.8',
              translate: '0 calc(100% * (1 - 1.8))',
            },
          ],
        },
        {
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
          keyframes: [
            {
              scale: '0.4 1.6',
              translate: '0 calc(-100% * (1 - 1.6))',
            },
            {
              scale: '1 1',
              translate: '0 0',
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
        fill: 'both',
        namedEffect: { range: 'continuous' } as StretchScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          keyframes: [
            {
              scale: '0.4 1.6',
              translate: '0 calc(-100% * (1 - 1.6))',
              easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            },
            {
              scale: '1 1',
              translate: '0 0',
              easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            },
            {
              scale: '0.4 1.6',
              translate: '0 calc(100% * (1 - 1.6))',
            },
          ],
        },
        {
          fill: 'both',
          easing: 'linear',
          keyframes: [
            {
              opacity: 0,
              offset: 0,
            },
            {
              opacity: 1,
              offset: 0.325,
            },
            {
              opacity: 1,
              offset: 0.7,
            },
            {
              opacity: 0,
              offset: 1,
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
          keyframes: [
            {
              scale: 'var(--motion-stretch-scale-x-from) var(--motion-stretch-scale-y-from)',
              translate: '0 var(--motion-stretch-trans-from)',
            },
            {
              scale: 'var(--motion-stretch-scale-x-to) var(--motion-stretch-scale-y-to)',
              translate: '0 var(--motion-stretch-trans-to)',
            },
          ],
        },
        {
          fill: 'forwards',
          easing:
            'linear(0 0%, 0 45.1%, 0.1458 46.9%, 0.2918 48.7%, 0.4315 50.5%, 0.5575 52.3%, 0.6668 54.1%, 0.7595 55.9%, 0.8372 57.7%, 0.902 59.5%, 0.9558 61.3%, 1 63%, 1 100%)',
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
          keyframes: [
            {
              scale: 'var(--motion-stretch-scale-x-from) var(--motion-stretch-scale-y-from)',
              translate: '0 var(--motion-stretch-trans-from)',
            },
            {
              scale: 'var(--motion-stretch-scale-x-to) var(--motion-stretch-scale-y-to)',
              translate: '0 var(--motion-stretch-trans-to)',
            },
          ],
        },
        {
          fill: 'backwards',
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
        fill: 'both',
        namedEffect: { range: 'continuous' } as StretchScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          keyframes: [
            {
              scale: 'var(--motion-stretch-scale-x-from) var(--motion-stretch-scale-y-from)',
              translate: '0 var(--motion-stretch-trans-from)',
              easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            },
            {
              scale: 'var(--motion-stretch-scale-x-to) var(--motion-stretch-scale-y-to)',
              translate: '0 var(--motion-stretch-trans-to)',
              easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            },
            {
              scale: 'var(--motion-stretch-scale-x-from) var(--motion-stretch-scale-y-from)',
              translate: '0 calc(100% * (1 - var(--motion-stretch-scale-y-from)))',
            },
          ],
        },
        {
          fill: 'both',
          easing: 'linear',
          keyframes: [
            {
              opacity: 0,
              offset: 0,
            },
            {
              opacity: 1,
              offset: 0.325,
            },
            {
              opacity: 1,
              offset: 0.7,
            },
            {
              opacity: 0,
              offset: 1,
            },
          ],
        },
      ];

      const result = StretchScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
