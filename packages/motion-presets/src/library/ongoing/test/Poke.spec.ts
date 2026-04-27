import { describe, expect, test } from 'vitest';

import * as PokeAnimation from '../Poke';
import { Poke, TimeAnimationOptions, AnimationData } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Poke', () => {
  describe('web() method', () => {
    test('Poke animation with default options', () => {
      const duration = 1000;
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration,
        namedEffect: {} as Poke,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-poke-1',
          duration: 1000,
          custom: {
            '--motion-translate-x': 2.5,
            '--motion-translate-y': 0,
          },
          keyframes: [
            {
              offset: 0.17,
              translate: 'calc(2.5 * 7px) calc(0 * 7px)',
            },
            {
              offset: 0.32,
              translate: 'calc(2.5 * 25px) calc(0 * 25px)',
            },
            {
              offset: 0.48,
              translate: 'calc(2.5 * 8px) calc(0 * 8px)',
            },
            {
              offset: 0.56,
              translate: 'calc(2.5 * 11px) calc(0 * 11px)',
            },
            {
              offset: 0.66,
              translate: 'calc(2.5 * 25px) calc(0 * 25px)',
            },
            {
              offset: 0.83,
              translate: 'calc(2.5 * 4px) calc(0 * 4px)',
            },
            {
              offset: 1,
              translate: 'calc(2.5 * 0px) calc(0 * 0px)',
            },
          ],
        },
      ];

      const result = PokeAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Poke animation with custom duration and delay', () => {
      const duration = 1000;
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration,
        namedEffect: { iterationDelay: 500 } as Poke,
      };

      const result = PokeAnimation.web(mockOptions);

      expect(result[0].name).toBe('motion-poke-067');
      expect(result[0].duration).toBe(1500);
      expect(result[0].custom).toEqual({
        '--motion-translate-x': 2.5,
        '--motion-translate-y': 0,
      });
      expect(result[0].keyframes).toHaveLength(7);
      // Check approximate offset values due to floating point precision
      expect(result[0].keyframes[0].offset).toBeCloseTo(0.1139, 3);
      expect(result[0].keyframes[6].offset).toBeCloseTo(0.67, 2);
    });

    test('Poke animation with custom intensity', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { intensity: 0.8 } as Poke,
      };

      const result = PokeAnimation.web(mockOptions);

      expect(result[0].name).toBe('motion-poke-1');
      // Check the intensity calculation with tolerance for floating point precision
      expect(result[0].custom!['--motion-translate-x']).toBeCloseTo(3.4, 1);
      expect(result[0].custom!['--motion-translate-y']).toBe(0);
      expect(result[0].keyframes[0].translate).toContain('3.4');
    });

    test('Poke animation with custom direction - top', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { direction: 'top' } as Poke,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-poke-1',
          custom: {
            '--motion-translate-x': 0,
            '--motion-translate-y': -2.5,
          },
          keyframes: [
            {
              offset: 0.17,
              translate: 'calc(0 * 7px) calc(-2.5 * 7px)',
            },
            {
              offset: 0.32,
              translate: 'calc(0 * 25px) calc(-2.5 * 25px)',
            },
            {
              offset: 0.48,
              translate: 'calc(0 * 8px) calc(-2.5 * 8px)',
            },
            {
              offset: 0.56,
              translate: 'calc(0 * 11px) calc(-2.5 * 11px)',
            },
            {
              offset: 0.66,
              translate: 'calc(0 * 25px) calc(-2.5 * 25px)',
            },
            {
              offset: 0.83,
              translate: 'calc(0 * 4px) calc(-2.5 * 4px)',
            },
            {
              offset: 1,
              translate: 'calc(0 * 0px) calc(-2.5 * 0px)',
            },
          ],
        },
      ];

      const result = PokeAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Poke animation with custom direction - bottom', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { direction: 'bottom' } as Poke,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-poke-1',
          custom: {
            '--motion-translate-x': 0,
            '--motion-translate-y': 2.5,
          },
          keyframes: [
            {
              offset: 0.17,
              translate: 'calc(0 * 7px) calc(2.5 * 7px)',
            },
            {
              offset: 0.32,
              translate: 'calc(0 * 25px) calc(2.5 * 25px)',
            },
            {
              offset: 0.48,
              translate: 'calc(0 * 8px) calc(2.5 * 8px)',
            },
            {
              offset: 0.56,
              translate: 'calc(0 * 11px) calc(2.5 * 11px)',
            },
            {
              offset: 0.66,
              translate: 'calc(0 * 25px) calc(2.5 * 25px)',
            },
            {
              offset: 0.83,
              translate: 'calc(0 * 4px) calc(2.5 * 4px)',
            },
            {
              offset: 1,
              translate: 'calc(0 * 0px) calc(2.5 * 0px)',
            },
          ],
        },
      ];

      const result = PokeAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Poke animation with custom direction - left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { direction: 'left' } as Poke,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-poke-1',
          custom: {
            '--motion-translate-x': -2.5,
            '--motion-translate-y': 0,
          },
          keyframes: [
            {
              offset: 0.17,
              translate: 'calc(-2.5 * 7px) calc(0 * 7px)',
            },
            {
              offset: 0.32,
              translate: 'calc(-2.5 * 25px) calc(0 * 25px)',
            },
            {
              offset: 0.48,
              translate: 'calc(-2.5 * 8px) calc(0 * 8px)',
            },
            {
              offset: 0.56,
              translate: 'calc(-2.5 * 11px) calc(0 * 11px)',
            },
            {
              offset: 0.66,
              translate: 'calc(-2.5 * 25px) calc(0 * 25px)',
            },
            {
              offset: 0.83,
              translate: 'calc(-2.5 * 4px) calc(0 * 4px)',
            },
            {
              offset: 1,
              translate: 'calc(-2.5 * 0px) calc(0 * 0px)',
            },
          ],
        },
      ];

      const result = PokeAnimation.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style() method', () => {
    test('Poke.style animation with default options', () => {
      const duration = 1000;
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration,
        namedEffect: {} as Poke,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-poke-1',
          duration: 1000,
          custom: {
            '--motion-translate-x': 2.5,
            '--motion-translate-y': 0,
          },
          keyframes: [
            {
              offset: 0.17,
              translate:
                'calc(var(--motion-translate-x) * 7px) calc(var(--motion-translate-y) * 7px)',
            },
            {
              offset: 0.32,
              translate:
                'calc(var(--motion-translate-x) * 25px) calc(var(--motion-translate-y) * 25px)',
            },
            {
              offset: 0.48,
              translate:
                'calc(var(--motion-translate-x) * 8px) calc(var(--motion-translate-y) * 8px)',
            },
            {
              offset: 0.56,
              translate:
                'calc(var(--motion-translate-x) * 11px) calc(var(--motion-translate-y) * 11px)',
            },
            {
              offset: 0.66,
              translate:
                'calc(var(--motion-translate-x) * 25px) calc(var(--motion-translate-y) * 25px)',
            },
            {
              offset: 0.83,
              translate:
                'calc(var(--motion-translate-x) * 4px) calc(var(--motion-translate-y) * 4px)',
            },
            {
              offset: 1,
              translate:
                'calc(var(--motion-translate-x) * 0px) calc(var(--motion-translate-y) * 0px)',
            },
          ],
        },
      ];

      const result = PokeAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Poke.style animation with custom duration and delay', () => {
      const duration = 800;
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration,
        namedEffect: { iterationDelay: 200 } as Poke,
      };

      const result = PokeAnimation.style(mockOptions);

      expect(result[0].name).toBe('motion-poke-08');
      expect(result[0].duration).toBe(1000);
      expect(result[0].custom).toEqual({
        '--motion-translate-x': 2.5,
        '--motion-translate-y': 0,
      });
      expect(result[0].keyframes).toHaveLength(7);
      // Check approximate offset values due to floating point precision
      expect(result[0].keyframes[0].offset).toBeCloseTo(0.136, 3);
      expect(result[0].keyframes[3].offset).toBeCloseTo(0.448, 3);
      expect(result[0].keyframes[6].offset).toBe(0.8);
    });

    test('Poke.style animation with counter-clockwise direction', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { direction: 'top' } as Poke,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-poke-1',
          custom: {
            '--motion-translate-x': 0,
            '--motion-translate-y': -2.5,
          },
          keyframes: [
            {
              offset: 0.17,
              translate:
                'calc(var(--motion-translate-x) * 7px) calc(var(--motion-translate-y) * 7px)',
            },
            {
              offset: 0.32,
              translate:
                'calc(var(--motion-translate-x) * 25px) calc(var(--motion-translate-y) * 25px)',
            },
            {
              offset: 0.48,
              translate:
                'calc(var(--motion-translate-x) * 8px) calc(var(--motion-translate-y) * 8px)',
            },
            {
              offset: 0.56,
              translate:
                'calc(var(--motion-translate-x) * 11px) calc(var(--motion-translate-y) * 11px)',
            },
            {
              offset: 0.66,
              translate:
                'calc(var(--motion-translate-x) * 25px) calc(var(--motion-translate-y) * 25px)',
            },
            {
              offset: 0.83,
              translate:
                'calc(var(--motion-translate-x) * 4px) calc(var(--motion-translate-y) * 4px)',
            },
            {
              offset: 1,
              translate:
                'calc(var(--motion-translate-x) * 0px) calc(var(--motion-translate-y) * 0px)',
            },
          ],
        },
      ];

      const result = PokeAnimation.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('getNames() method', () => {
    test('Poke getNames with default options', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {} as Poke,
      };

      const result = PokeAnimation.getNames(mockOptions);

      expect(result).toEqual(['motion-poke-1']);
    });

    test('Poke getNames with custom duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 800,
        namedEffect: { iterationDelay: 200 } as Poke,
      };

      const result = PokeAnimation.getNames(mockOptions);

      expect(result).toEqual(['motion-poke-08']);
    });
  });
});
