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
            '--motion-translate-x': 1,
            '--motion-translate-y': 0,
            '--motion-travel': '62.5px',
          },
          keyframes: [
            {
              offset: 0.17,
              translate: 'calc(1 * 62.5px * 7 / 25) calc(0 * 62.5px * 7 / 25)',
            },
            {
              offset: 0.32,
              translate: 'calc(1 * 62.5px * 25 / 25) calc(0 * 62.5px * 25 / 25)',
            },
            {
              offset: 0.48,
              translate: 'calc(1 * 62.5px * 8 / 25) calc(0 * 62.5px * 8 / 25)',
            },
            {
              offset: 0.56,
              translate: 'calc(1 * 62.5px * 11 / 25) calc(0 * 62.5px * 11 / 25)',
            },
            {
              offset: 0.66,
              translate: 'calc(1 * 62.5px * 25 / 25) calc(0 * 62.5px * 25 / 25)',
            },
            {
              offset: 0.83,
              translate: 'calc(1 * 62.5px * 4 / 25) calc(0 * 62.5px * 4 / 25)',
            },
            {
              offset: 1,
              translate: 'calc(1 * 62.5px * 0 / 25) calc(0 * 62.5px * 0 / 25)',
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
        '--motion-translate-x': 1,
        '--motion-translate-y': 0,
        '--motion-travel': '62.5px',
      });
      expect(result[0].keyframes).toHaveLength(7);
      // Check approximate offset values due to floating point precision
      expect(result[0].keyframes[0].offset).toBeCloseTo(0.1139, 3);
      expect(result[0].keyframes[6].offset).toBeCloseTo(0.67, 2);
    });

    test('Poke animation with custom travel', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { travel: { value: 85, unit: 'px' } } as Poke,
      };

      const result = PokeAnimation.web(mockOptions);

      expect(result[0].name).toBe('motion-poke-1');
      expect(result[0].custom).toEqual({
        '--motion-translate-x': 1,
        '--motion-translate-y': 0,
        '--motion-travel': '85px',
      });
      expect(result[0].keyframes[0].translate).toBe(
        'calc(1 * 85px * 7 / 25) calc(0 * 85px * 7 / 25)',
      );
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
            '--motion-translate-y': -1,
            '--motion-travel': '62.5px',
          },
          keyframes: [
            {
              offset: 0.17,
              translate: 'calc(0 * 62.5px * 7 / 25) calc(-1 * 62.5px * 7 / 25)',
            },
            {
              offset: 0.32,
              translate: 'calc(0 * 62.5px * 25 / 25) calc(-1 * 62.5px * 25 / 25)',
            },
            {
              offset: 0.48,
              translate: 'calc(0 * 62.5px * 8 / 25) calc(-1 * 62.5px * 8 / 25)',
            },
            {
              offset: 0.56,
              translate: 'calc(0 * 62.5px * 11 / 25) calc(-1 * 62.5px * 11 / 25)',
            },
            {
              offset: 0.66,
              translate: 'calc(0 * 62.5px * 25 / 25) calc(-1 * 62.5px * 25 / 25)',
            },
            {
              offset: 0.83,
              translate: 'calc(0 * 62.5px * 4 / 25) calc(-1 * 62.5px * 4 / 25)',
            },
            {
              offset: 1,
              translate: 'calc(0 * 62.5px * 0 / 25) calc(-1 * 62.5px * 0 / 25)',
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
            '--motion-translate-y': 1,
            '--motion-travel': '62.5px',
          },
          keyframes: [
            {
              offset: 0.17,
              translate: 'calc(0 * 62.5px * 7 / 25) calc(1 * 62.5px * 7 / 25)',
            },
            {
              offset: 0.32,
              translate: 'calc(0 * 62.5px * 25 / 25) calc(1 * 62.5px * 25 / 25)',
            },
            {
              offset: 0.48,
              translate: 'calc(0 * 62.5px * 8 / 25) calc(1 * 62.5px * 8 / 25)',
            },
            {
              offset: 0.56,
              translate: 'calc(0 * 62.5px * 11 / 25) calc(1 * 62.5px * 11 / 25)',
            },
            {
              offset: 0.66,
              translate: 'calc(0 * 62.5px * 25 / 25) calc(1 * 62.5px * 25 / 25)',
            },
            {
              offset: 0.83,
              translate: 'calc(0 * 62.5px * 4 / 25) calc(1 * 62.5px * 4 / 25)',
            },
            {
              offset: 1,
              translate: 'calc(0 * 62.5px * 0 / 25) calc(1 * 62.5px * 0 / 25)',
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
            '--motion-translate-x': -1,
            '--motion-translate-y': 0,
            '--motion-travel': '62.5px',
          },
          keyframes: [
            {
              offset: 0.17,
              translate: 'calc(-1 * 62.5px * 7 / 25) calc(0 * 62.5px * 7 / 25)',
            },
            {
              offset: 0.32,
              translate: 'calc(-1 * 62.5px * 25 / 25) calc(0 * 62.5px * 25 / 25)',
            },
            {
              offset: 0.48,
              translate: 'calc(-1 * 62.5px * 8 / 25) calc(0 * 62.5px * 8 / 25)',
            },
            {
              offset: 0.56,
              translate: 'calc(-1 * 62.5px * 11 / 25) calc(0 * 62.5px * 11 / 25)',
            },
            {
              offset: 0.66,
              translate: 'calc(-1 * 62.5px * 25 / 25) calc(0 * 62.5px * 25 / 25)',
            },
            {
              offset: 0.83,
              translate: 'calc(-1 * 62.5px * 4 / 25) calc(0 * 62.5px * 4 / 25)',
            },
            {
              offset: 1,
              translate: 'calc(-1 * 62.5px * 0 / 25) calc(0 * 62.5px * 0 / 25)',
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
            '--motion-translate-x': 1,
            '--motion-translate-y': 0,
            '--motion-travel': '62.5px',
          },
          keyframes: [
            {
              offset: 0.17,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 7 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 7 / 25)',
            },
            {
              offset: 0.32,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 25 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 25 / 25)',
            },
            {
              offset: 0.48,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 8 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 8 / 25)',
            },
            {
              offset: 0.56,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 11 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 11 / 25)',
            },
            {
              offset: 0.66,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 25 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 25 / 25)',
            },
            {
              offset: 0.83,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 4 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 4 / 25)',
            },
            {
              offset: 1,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 0 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 0 / 25)',
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
        '--motion-translate-x': 1,
        '--motion-translate-y': 0,
        '--motion-travel': '62.5px',
      });
      expect(result[0].keyframes).toHaveLength(7);
      // Check approximate offset values due to floating point precision
      expect(result[0].keyframes[0].offset).toBeCloseTo(0.136, 3);
      expect(result[0].keyframes[3].offset).toBeCloseTo(0.448, 3);
      expect(result[0].keyframes[6].offset).toBe(0.8);
    });

    test('Poke.style animation with custom direction - top', () => {
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
            '--motion-translate-y': -1,
            '--motion-travel': '62.5px',
          },
          keyframes: [
            {
              offset: 0.17,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 7 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 7 / 25)',
            },
            {
              offset: 0.32,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 25 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 25 / 25)',
            },
            {
              offset: 0.48,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 8 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 8 / 25)',
            },
            {
              offset: 0.56,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 11 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 11 / 25)',
            },
            {
              offset: 0.66,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 25 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 25 / 25)',
            },
            {
              offset: 0.83,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 4 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 4 / 25)',
            },
            {
              offset: 1,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-travel) * 0 / 25) calc(var(--motion-translate-y) * var(--motion-travel) * 0 / 25)',
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
