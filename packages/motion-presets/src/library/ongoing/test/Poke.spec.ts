import { describe, expect, test } from 'vitest';

import * as PokeAnimation from '../Poke';
import { Poke, TimeAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Poke', () => {
  describe('web() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Poke,
      };

      expect(PokeAnimation.web(mockOptions)).toMatchObject([
        {
          name: 'motion-poke-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-poke-travel': '62.5px',
            '--motion-translate-x': 1,
            '--motion-translate-y': 0,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'translate(calc(1 * 62.5px * 0), calc(0 * 62.5px * 0)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.17,
              transform:
                'translate(calc(1 * 62.5px * 0.28), calc(0 * 62.5px * 0.28)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.32,
              transform:
                'translate(calc(1 * 62.5px * 1), calc(0 * 62.5px * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.48,
              transform:
                'translate(calc(1 * 62.5px * 0.32), calc(0 * 62.5px * 0.32)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.56,
              transform:
                'translate(calc(1 * 62.5px * 0.44), calc(0 * 62.5px * 0.44)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.66,
              transform:
                'translate(calc(1 * 62.5px * 1), calc(0 * 62.5px * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.83,
              transform:
                'translate(calc(1 * 62.5px * 0.16), calc(0 * 62.5px * 0.16)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'translate(calc(1 * 62.5px * 0), calc(0 * 62.5px * 0)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ]);
    });

    test('custom duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {
          iterationDelay: 500,
        } as Poke,
      };

      expect(PokeAnimation.web(mockOptions)).toMatchObject([
        {
          duration: 1500,
          name: 'motion-poke-067',
          easing: 'linear',
          custom: {
            '--motion-poke-travel': '62.5px',
            '--motion-translate-x': 1,
            '--motion-translate-y': 0,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'translate(calc(1 * 62.5px * 0), calc(0 * 62.5px * 0)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.11333333333333334,
              transform:
                'translate(calc(1 * 62.5px * 0.28), calc(0 * 62.5px * 0.28)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.21333333333333332,
              transform:
                'translate(calc(1 * 62.5px * 1), calc(0 * 62.5px * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.31999999999999995,
              transform:
                'translate(calc(1 * 62.5px * 0.32), calc(0 * 62.5px * 0.32)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.37333333333333335,
              transform:
                'translate(calc(1 * 62.5px * 0.44), calc(0 * 62.5px * 0.44)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.44,
              transform:
                'translate(calc(1 * 62.5px * 1), calc(0 * 62.5px * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5533333333333332,
              transform:
                'translate(calc(1 * 62.5px * 0.16), calc(0 * 62.5px * 0.16)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.6666666666666666,
              transform:
                'translate(calc(1 * 62.5px * 0), calc(0 * 62.5px * 0)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ]);
    });

    test('custom travel', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          travel: {
            value: 30,
            unit: 'percentage',
          },
        } as Poke,
      };

      expect(PokeAnimation.web(mockOptions)).toMatchObject([
        {
          name: 'motion-poke-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-poke-travel': '30%',
            '--motion-translate-x': 1,
            '--motion-translate-y': 0,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'translate(calc(1 * 30% * 0), calc(0 * 30% * 0)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.17,
              transform:
                'translate(calc(1 * 30% * 0.28), calc(0 * 30% * 0.28)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.32,
              transform:
                'translate(calc(1 * 30% * 1), calc(0 * 30% * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.48,
              transform:
                'translate(calc(1 * 30% * 0.32), calc(0 * 30% * 0.32)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.56,
              transform:
                'translate(calc(1 * 30% * 0.44), calc(0 * 30% * 0.44)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.66,
              transform:
                'translate(calc(1 * 30% * 1), calc(0 * 30% * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.83,
              transform:
                'translate(calc(1 * 30% * 0.16), calc(0 * 30% * 0.16)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'translate(calc(1 * 30% * 0), calc(0 * 30% * 0)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ]);
    });

    test('custom direction - top', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          direction: 'top',
        } as Poke,
      };

      expect(PokeAnimation.web(mockOptions)).toMatchObject([
        {
          name: 'motion-poke-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-poke-travel': '62.5px',
            '--motion-translate-x': 0,
            '--motion-translate-y': -1,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'translate(calc(0 * 62.5px * 0), calc(-1 * 62.5px * 0)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.17,
              transform:
                'translate(calc(0 * 62.5px * 0.28), calc(-1 * 62.5px * 0.28)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.32,
              transform:
                'translate(calc(0 * 62.5px * 1), calc(-1 * 62.5px * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.48,
              transform:
                'translate(calc(0 * 62.5px * 0.32), calc(-1 * 62.5px * 0.32)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.56,
              transform:
                'translate(calc(0 * 62.5px * 0.44), calc(-1 * 62.5px * 0.44)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.66,
              transform:
                'translate(calc(0 * 62.5px * 1), calc(-1 * 62.5px * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.83,
              transform:
                'translate(calc(0 * 62.5px * 0.16), calc(-1 * 62.5px * 0.16)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'translate(calc(0 * 62.5px * 0), calc(-1 * 62.5px * 0)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ]);
    });

    test('custom direction - left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          direction: 'left',
        } as Poke,
      };

      expect(PokeAnimation.web(mockOptions)).toMatchObject([
        {
          name: 'motion-poke-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-poke-travel': '62.5px',
            '--motion-translate-x': -1,
            '--motion-translate-y': 0,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'translate(calc(-1 * 62.5px * 0), calc(0 * 62.5px * 0)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.17,
              transform:
                'translate(calc(-1 * 62.5px * 0.28), calc(0 * 62.5px * 0.28)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.32,
              transform:
                'translate(calc(-1 * 62.5px * 1), calc(0 * 62.5px * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.48,
              transform:
                'translate(calc(-1 * 62.5px * 0.32), calc(0 * 62.5px * 0.32)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.56,
              transform:
                'translate(calc(-1 * 62.5px * 0.44), calc(0 * 62.5px * 0.44)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.66,
              transform:
                'translate(calc(-1 * 62.5px * 1), calc(0 * 62.5px * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.83,
              transform:
                'translate(calc(-1 * 62.5px * 0.16), calc(0 * 62.5px * 0.16)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'translate(calc(-1 * 62.5px * 0), calc(0 * 62.5px * 0)) rotate(var(--motion-rotate, 0deg))',
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
        namedEffect: {} as Poke,
      };

      expect(PokeAnimation.style(mockOptions)).toMatchObject([
        {
          name: 'motion-poke-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-poke-travel': '62.5px',
            '--motion-translate-x': 1,
            '--motion-translate-y': 0,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.17,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.28), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.28)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.32,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 1), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.48,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.32), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.32)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.56,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.44), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.44)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.66,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 1), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.83,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.16), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.16)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ]);
    });

    test('custom duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: {
          iterationDelay: 500,
        } as Poke,
      };

      expect(PokeAnimation.style(mockOptions)).toMatchObject([
        {
          duration: 1500,
          name: 'motion-poke-067',
          easing: 'linear',
          custom: {
            '--motion-poke-travel': '62.5px',
            '--motion-translate-x': 1,
            '--motion-translate-y': 0,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.11333333333333334,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.28), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.28)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.21333333333333332,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 1), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.31999999999999995,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.32), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.32)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.37333333333333335,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.44), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.44)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.44,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 1), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5533333333333332,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.16), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.16)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.6666666666666666,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ]);
    });

    test('custom travel', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          travel: {
            value: 30,
            unit: 'percentage',
          },
        } as Poke,
      };

      expect(PokeAnimation.style(mockOptions)).toMatchObject([
        {
          name: 'motion-poke-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-poke-travel': '30%',
            '--motion-translate-x': 1,
            '--motion-translate-y': 0,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.17,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.28), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.28)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.32,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 1), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.48,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.32), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.32)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.56,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.44), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.44)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.66,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 1), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.83,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.16), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.16)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ]);
    });

    test('custom direction - top', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          direction: 'top',
        } as Poke,
      };

      expect(PokeAnimation.style(mockOptions)).toMatchObject([
        {
          name: 'motion-poke-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-poke-travel': '62.5px',
            '--motion-translate-x': 0,
            '--motion-translate-y': -1,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.17,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.28), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.28)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.32,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 1), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.48,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.32), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.32)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.56,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.44), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.44)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.66,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 1), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.83,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.16), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.16)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ]);
    });

    test('custom direction - left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          direction: 'left',
        } as Poke,
      };

      expect(PokeAnimation.style(mockOptions)).toMatchObject([
        {
          name: 'motion-poke-1',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-poke-travel': '62.5px',
            '--motion-translate-x': -1,
            '--motion-translate-y': 0,
          },
          keyframes: [
            {
              offset: 0,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.17,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.28), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.28)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.32,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 1), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.48,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.32), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.32)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.56,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.44), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.44)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.66,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 1), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.83,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0.16), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0.16)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform:
                'translate(calc(var(--motion-translate-x) * var(--motion-poke-travel) * 0), calc(var(--motion-translate-y) * var(--motion-poke-travel) * 0)) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ]);
    });
  });

  test('getNames', () => {
    expect(PokeAnimation.getNames({ ...baseMockOptions, namedEffect: {} as Poke })).toEqual([
      'motion-poke-1',
    ]);
  });

  test('schema', () => {
    expect(PokeAnimation.schema).toEqual({
      direction: {
        type: 'enum',
        values: ['top', 'right', 'bottom', 'left'],
        default: 'right',
      },
      iterationDelay: {
        type: 'number',
        min: 0,
        default: 0,
      },
      travel: {
        type: 'length',
        default: {
          value: 62.5,
          unit: 'px',
        },
      },
    });
  });
});
