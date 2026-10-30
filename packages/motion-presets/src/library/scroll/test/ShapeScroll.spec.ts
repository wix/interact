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
            { clipPath: 'circle(37.5%)', easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)' },
            { clipPath: 'circle(75%)' },
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
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
            },
            { clipPath: 'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)' },
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
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            { clipPath: 'ellipse(37.5% 37.5%)', easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)' },
            { clipPath: 'ellipse(75% 75%)' },
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
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              clipPath: 'inset(15% round 50% 50% 0% 0%)',
              easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
            },
            { clipPath: 'inset(-20% round 50% 50% 0% 0%)' },
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
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            { clipPath: 'inset(25%)', easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)' },
            { clipPath: 'inset(0%)' },
          ],
        },
      ];

      const result = ShapeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom start', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { start: 0.25 } as ShapeScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            { clipPath: 'circle(18.75%)', easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)' },
            { clipPath: 'circle(75%)' },
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
          easing: 'linear',
          keyframes: [
            { clipPath: 'circle(75%)', easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)' },
            { clipPath: 'circle(37.5%)' },
          ],
        },
      ];

      const result = ShapeScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as ShapeScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          keyframes: [
            { clipPath: 'circle(37.5%)', easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)' },
            { clipPath: 'circle(75%)', easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)' },
            { clipPath: 'circle(37.5%)' },
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
          custom: { '--motion-clip-from': 'circle(37.5%)', '--motion-clip-to': 'circle(75%)' },
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from)',
              easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
            },
            { clipPath: 'var(--motion-clip-to)' },
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
          fill: 'backwards',
          easing: 'linear',
          custom: {
            '--motion-clip-from': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            '--motion-clip-to': 'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)',
          },
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from)',
              easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
            },
            { clipPath: 'var(--motion-clip-to)' },
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
          easing: 'linear',
          custom: { '--motion-clip-from': 'circle(75%)', '--motion-clip-to': 'circle(37.5%)' },
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from)',
              easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
            },
            { clipPath: 'var(--motion-clip-to)' },
          ],
        },
      ];

      const result = ShapeScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as ShapeScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          custom: { '--motion-clip-from': 'circle(37.5%)', '--motion-clip-to': 'circle(75%)' },
          keyframes: [
            {
              clipPath: 'var(--motion-clip-from)',
              easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
            },
            { clipPath: 'var(--motion-clip-to)', easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)' },
            { clipPath: 'var(--motion-clip-from)' },
          ],
        },
      ];

      const result = ShapeScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
