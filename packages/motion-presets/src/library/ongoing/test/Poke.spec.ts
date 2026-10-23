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
            '--motion-poke-travel-17': '17.5px',
            '--motion-poke-travel-32': '62.5px',
            '--motion-poke-travel-48': '20px',
            '--motion-poke-travel-56': '27.5px',
            '--motion-poke-travel-66': '62.5px',
            '--motion-poke-travel-83': '10px',
          },
          keyframes: [
            {
              offset: 0.17,
              translate: 'calc(1 * 17.5px) calc(0 * 17.5px)',
            },
            {
              offset: 0.32,
              translate: 'calc(1 * 62.5px) calc(0 * 62.5px)',
            },
            {
              offset: 0.48,
              translate: 'calc(1 * 20px) calc(0 * 20px)',
            },
            {
              offset: 0.56,
              translate: 'calc(1 * 27.5px) calc(0 * 27.5px)',
            },
            {
              offset: 0.66,
              translate: 'calc(1 * 62.5px) calc(0 * 62.5px)',
            },
            {
              offset: 0.83,
              translate: 'calc(1 * 10px) calc(0 * 10px)',
            },
            {
              offset: 1,
              translate: '0px 0px',
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
        '--motion-poke-travel-17': '17.5px',
        '--motion-poke-travel-32': '62.5px',
        '--motion-poke-travel-48': '20px',
        '--motion-poke-travel-56': '27.5px',
        '--motion-poke-travel-66': '62.5px',
        '--motion-poke-travel-83': '10px',
      });
      expect(result[0].keyframes).toHaveLength(8);
      // Check approximate offset values due to floating point precision
      expect(result[0].keyframes[0].offset).toBeCloseTo(0.1139, 3);
      expect(result[0].keyframes[6].offset).toBeCloseTo(0.67, 2);
      expect(result[0].keyframes[7]).toMatchObject({ offset: 1, translate: '0px 0px' });
    });

    test('Poke animation with custom travel', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { travel: 85 } as Poke,
      };

      const result = PokeAnimation.web(mockOptions);

      expect(result[0].name).toBe('motion-poke-1');
      expect(result[0].custom!['--motion-poke-travel-32']).toBe('85px');
      expect(result[0].keyframes[1].translate).toBe('calc(1 * 85px) calc(0 * 85px)');
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
            '--motion-poke-travel-17': '17.5px',
            '--motion-poke-travel-32': '62.5px',
            '--motion-poke-travel-48': '20px',
            '--motion-poke-travel-56': '27.5px',
            '--motion-poke-travel-66': '62.5px',
            '--motion-poke-travel-83': '10px',
          },
          keyframes: [
            {
              offset: 0.17,
              translate: 'calc(0 * 17.5px) calc(-1 * 17.5px)',
            },
            {
              offset: 0.32,
              translate: 'calc(0 * 62.5px) calc(-1 * 62.5px)',
            },
            {
              offset: 0.48,
              translate: 'calc(0 * 20px) calc(-1 * 20px)',
            },
            {
              offset: 0.56,
              translate: 'calc(0 * 27.5px) calc(-1 * 27.5px)',
            },
            {
              offset: 0.66,
              translate: 'calc(0 * 62.5px) calc(-1 * 62.5px)',
            },
            {
              offset: 0.83,
              translate: 'calc(0 * 10px) calc(-1 * 10px)',
            },
            {
              offset: 1,
              translate: '0px 0px',
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
            '--motion-poke-travel-17': '17.5px',
            '--motion-poke-travel-32': '62.5px',
            '--motion-poke-travel-48': '20px',
            '--motion-poke-travel-56': '27.5px',
            '--motion-poke-travel-66': '62.5px',
            '--motion-poke-travel-83': '10px',
          },
          keyframes: [
            {
              offset: 0.17,
              translate: 'calc(0 * 17.5px) calc(1 * 17.5px)',
            },
            {
              offset: 0.32,
              translate: 'calc(0 * 62.5px) calc(1 * 62.5px)',
            },
            {
              offset: 0.48,
              translate: 'calc(0 * 20px) calc(1 * 20px)',
            },
            {
              offset: 0.56,
              translate: 'calc(0 * 27.5px) calc(1 * 27.5px)',
            },
            {
              offset: 0.66,
              translate: 'calc(0 * 62.5px) calc(1 * 62.5px)',
            },
            {
              offset: 0.83,
              translate: 'calc(0 * 10px) calc(1 * 10px)',
            },
            {
              offset: 1,
              translate: '0px 0px',
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
            '--motion-poke-travel-17': '17.5px',
            '--motion-poke-travel-32': '62.5px',
            '--motion-poke-travel-48': '20px',
            '--motion-poke-travel-56': '27.5px',
            '--motion-poke-travel-66': '62.5px',
            '--motion-poke-travel-83': '10px',
          },
          keyframes: [
            {
              offset: 0.17,
              translate: 'calc(-1 * 17.5px) calc(0 * 17.5px)',
            },
            {
              offset: 0.32,
              translate: 'calc(-1 * 62.5px) calc(0 * 62.5px)',
            },
            {
              offset: 0.48,
              translate: 'calc(-1 * 20px) calc(0 * 20px)',
            },
            {
              offset: 0.56,
              translate: 'calc(-1 * 27.5px) calc(0 * 27.5px)',
            },
            {
              offset: 0.66,
              translate: 'calc(-1 * 62.5px) calc(0 * 62.5px)',
            },
            {
              offset: 0.83,
              translate: 'calc(-1 * 10px) calc(0 * 10px)',
            },
            {
              offset: 1,
              translate: '0px 0px',
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
            '--motion-poke-travel-17': '17.5px',
            '--motion-poke-travel-32': '62.5px',
            '--motion-poke-travel-48': '20px',
            '--motion-poke-travel-56': '27.5px',
            '--motion-poke-travel-66': '62.5px',
            '--motion-poke-travel-83': '10px',
          },
          keyframes: [
            {
              offset: 0.17,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-poke-travel-17)) calc(var(--motion-translate-y) * var(--motion-poke-travel-17))',
            },
            {
              offset: 0.32,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-poke-travel-32)) calc(var(--motion-translate-y) * var(--motion-poke-travel-32))',
            },
            {
              offset: 0.48,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-poke-travel-48)) calc(var(--motion-translate-y) * var(--motion-poke-travel-48))',
            },
            {
              offset: 0.56,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-poke-travel-56)) calc(var(--motion-translate-y) * var(--motion-poke-travel-56))',
            },
            {
              offset: 0.66,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-poke-travel-66)) calc(var(--motion-translate-y) * var(--motion-poke-travel-66))',
            },
            {
              offset: 0.83,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-poke-travel-83)) calc(var(--motion-translate-y) * var(--motion-poke-travel-83))',
            },
            {
              offset: 1,
              translate: '0px 0px',
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
        '--motion-poke-travel-17': '17.5px',
        '--motion-poke-travel-32': '62.5px',
        '--motion-poke-travel-48': '20px',
        '--motion-poke-travel-56': '27.5px',
        '--motion-poke-travel-66': '62.5px',
        '--motion-poke-travel-83': '10px',
      });
      expect(result[0].keyframes).toHaveLength(8);
      // Check approximate offset values due to floating point precision
      expect(result[0].keyframes[0].offset).toBeCloseTo(0.136, 3);
      expect(result[0].keyframes[3].offset).toBeCloseTo(0.448, 3);
      expect(result[0].keyframes[6].offset).toBe(0.8);
      expect(result[0].keyframes[7]).toMatchObject({ offset: 1, translate: '0px 0px' });
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
            '--motion-translate-y': -1,
            '--motion-poke-travel-17': '17.5px',
            '--motion-poke-travel-32': '62.5px',
            '--motion-poke-travel-48': '20px',
            '--motion-poke-travel-56': '27.5px',
            '--motion-poke-travel-66': '62.5px',
            '--motion-poke-travel-83': '10px',
          },
          keyframes: [
            {
              offset: 0.17,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-poke-travel-17)) calc(var(--motion-translate-y) * var(--motion-poke-travel-17))',
            },
            {
              offset: 0.32,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-poke-travel-32)) calc(var(--motion-translate-y) * var(--motion-poke-travel-32))',
            },
            {
              offset: 0.48,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-poke-travel-48)) calc(var(--motion-translate-y) * var(--motion-poke-travel-48))',
            },
            {
              offset: 0.56,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-poke-travel-56)) calc(var(--motion-translate-y) * var(--motion-poke-travel-56))',
            },
            {
              offset: 0.66,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-poke-travel-66)) calc(var(--motion-translate-y) * var(--motion-poke-travel-66))',
            },
            {
              offset: 0.83,
              translate:
                'calc(var(--motion-translate-x) * var(--motion-poke-travel-83)) calc(var(--motion-translate-y) * var(--motion-poke-travel-83))',
            },
            {
              offset: 1,
              translate: '0px 0px',
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

describe('Poke travel', () => {
  test.each([62.5, 25, 85])('the peak is the travel %spx', (travel) => {
    const { keyframes } = PokeAnimation.web({
      ...baseMockOptions,
      namedEffect: { travel: { value: travel, unit: 'px' } } as Poke,
    })[0];
    const xs = keyframes.map(({ translate }) =>
      parseFloat((translate as string).match(/^calc\(1 \* (-?[\d.]+)px\)/)?.[1] ?? '0'),
    );
    expect(Math.max(...xs)).toBe(travel);
  });
});
