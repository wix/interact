import { describe, expect, test } from 'vitest';

import * as BlurScroll from '../BlurScroll';
import type { BlurScroll as BlurScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('BlurScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as BlurScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          keyframes: [
            {
              filter: 'blur(6px)',
            },
            {
              filter: 'blur(0px)',
            },
          ],
        },
      ];

      const result = BlurScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom blur value', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { blur: 10 } as BlurScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              filter: 'blur(10px)',
            },
            {
              filter: 'blur(0px)',
            },
          ],
        },
      ];

      const result = BlurScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as BlurScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              filter: 'blur(0px)',
            },
            {
              filter: 'blur(6px)',
            },
          ],
        },
      ];

      const result = BlurScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        fill: 'both',
        namedEffect: { range: 'continuous' } as BlurScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          keyframes: [
            {
              filter: 'blur(6px)',
            },
            {
              filter: 'blur(0px)',
            },
          ],
        },
      ];

      const result = BlurScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as BlurScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          keyframes: [
            {
              filter: 'blur(var(--motion-blur-from))',
            },
            {
              filter: 'blur(var(--motion-blur-to))',
            },
          ],
        },
      ];

      const result = BlurScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom blur value', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { blur: 10 } as BlurScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              filter: 'blur(var(--motion-blur-from))',
            },
            {
              filter: 'blur(var(--motion-blur-to))',
            },
          ],
        },
      ];

      const result = BlurScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as BlurScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              filter: 'blur(var(--motion-blur-from))',
            },
            {
              filter: 'blur(var(--motion-blur-to))',
            },
          ],
        },
      ];

      const result = BlurScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        fill: 'both',
        namedEffect: { range: 'continuous' } as BlurScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          keyframes: [
            {
              filter: 'blur(var(--motion-blur-from))',
            },
            {
              filter: 'blur(var(--motion-blur-to))',
            },
          ],
        },
      ];

      const result = BlurScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
