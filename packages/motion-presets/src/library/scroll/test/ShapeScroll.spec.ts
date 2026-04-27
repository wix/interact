import { describe, expect, test } from 'vitest';

import * as ShapeScroll from '../ShapeScroll';
import type { ShapeScroll as ShapeScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('ShapeScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as ShapeScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath: 'circle(50%)',
              easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
            },
            {
              clipPath: 'circle(75%)',
            },
          ],
        },
      ];

      const result = ShapeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom shape - diamond', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { shape: 'diamond' } as ShapeScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'polygon(50% 25%, 75% 50%, 50% 75%, 25% 50%)',
            },
            {
              clipPath: 'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)',
            },
          ],
        },
      ];

      const result = ShapeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom shape - ellipse', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { shape: 'ellipse' } as ShapeScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'ellipse(25% 25%)',
            },
            {
              clipPath: 'ellipse(75% 75%)',
            },
          ],
        },
      ];

      const result = ShapeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom shape - window', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { shape: 'window' } as ShapeScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'inset(25% round 50% 50% 0% 0%)',
            },
            {
              clipPath: 'inset(-20% round 50% 50% 0% 0%)',
            },
          ],
        },
      ];

      const result = ShapeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom shape - rectangle', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { shape: 'rectangle' } as ShapeScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'inset(50%)',
            },
            {
              clipPath: 'inset(0%)',
            },
          ],
        },
      ];

      const result = ShapeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom intensity', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { intensity: 0.75 } as ShapeScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'circle(25%)',
            },
            {
              clipPath: 'circle(75%)',
            },
          ],
        },
      ];

      const result = ShapeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as ShapeScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              clipPath: 'circle(75%)',
            },
            {
              clipPath: 'circle(50%)',
            },
          ],
        },
      ];

      const result = ShapeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        fill: 'both',
        namedEffect: { range: 'continuous' } as ShapeScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          keyframes: [
            {
              clipPath: 'circle(50%)',
            },
            {
              clipPath: 'circle(75%)',
            },
            {
              clipPath: 'circle(50%)',
            },
          ],
        },
      ];

      const result = ShapeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as ShapeScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from)',
            },
            {
              clipPath: 'var(--motion-clip-to)',
            },
          ],
        },
      ];

      const result = ShapeScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom shape - diamond', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { shape: 'diamond' } as ShapeScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from)',
            },
            {
              clipPath: 'var(--motion-clip-to)',
            },
          ],
        },
      ];

      const result = ShapeScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as ShapeScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from)',
            },
            {
              clipPath: 'var(--motion-clip-to)',
            },
          ],
        },
      ];

      const result = ShapeScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        fill: 'both',
        namedEffect: { range: 'continuous' } as ShapeScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from)',
            },
            {
              clipPath: 'var(--motion-clip-to)',
            },
            {
              clipPath: 'var(--motion-clip-from)',
            },
          ],
        },
      ];

      const result = ShapeScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
