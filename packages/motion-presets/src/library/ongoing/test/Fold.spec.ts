import { describe, expect, test } from 'vitest';

import * as FoldAnimation from '../Fold';
import { Fold, TimeAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Fold', () => {
  describe('web() method', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Fold,
      };

      expect(FoldAnimation.web(mockOptions)).toMatchObject([
        {
          name: 'motion-fold',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-perspective': '800px',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              offset: 0,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.08410428931875526,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * 1 * 15deg)) rotateY(calc(0 * 1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.25399495374264086,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * -0.7 * 15deg)) rotateY(calc(0 * -0.7 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.4238856181665265,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0.6 * 15deg)) rotateY(calc(0 * 0.6 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.5769554247266611,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * -0.3 * 15deg)) rotateY(calc(0 * -0.3 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.712363330529857,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0.2 * 15deg)) rotateY(calc(0 * 0.2 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.8822539949537426,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * -0.05 * 15deg)) rotateY(calc(0 * -0.05 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
          ],
        },
      ]);
    });

    test('custom duration, delay and easing', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        easing: 'linear',
        namedEffect: {
          iterationDelay: 500,
        } as Fold,
      };

      expect(FoldAnimation.web(mockOptions)).toMatchObject([
        {
          duration: 1500,
          easing: 'linear',
          name: 'motion-fold-067',
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-perspective': '800px',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'linear',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.0560695262125035,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * 1 * 15deg)) rotateY(calc(0 * 1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.16932996916176057,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * -0.7 * 15deg)) rotateY(calc(0 * -0.7 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.28259041211101765,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0.6 * 15deg)) rotateY(calc(0 * 0.6 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.384636949817774,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * -0.3 * 15deg)) rotateY(calc(0 * -0.3 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.47490888701990464,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0.2 * 15deg)) rotateY(calc(0 * 0.2 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.5881693299691617,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * -0.05 * 15deg)) rotateY(calc(0 * -0.05 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.6666666666666666,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
          ],
        },
      ]);
    });

    test('custom pivot - right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          pivot: 'right',
        } as Fold,
      };

      expect(FoldAnimation.web(mockOptions)).toMatchObject([
        {
          name: 'motion-fold',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-origin-x': '50%',
            '--motion-origin-y': '0%',
            '--motion-perspective': '800px',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '0',
            '--motion-rotate-y': '1',
          },
          keyframes: [
            {
              offset: 0,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(50%) translateY(0%) rotateX(calc(0 * 0 * 15deg)) rotateY(calc(1 * 0 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 0.08410428931875526,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(50%) translateY(0%) rotateX(calc(0 * 1 * 15deg)) rotateY(calc(1 * 1 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 0.25399495374264086,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(50%) translateY(0%) rotateX(calc(0 * -0.7 * 15deg)) rotateY(calc(1 * -0.7 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 0.4238856181665265,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(50%) translateY(0%) rotateX(calc(0 * 0.6 * 15deg)) rotateY(calc(1 * 0.6 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 0.5769554247266611,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(50%) translateY(0%) rotateX(calc(0 * -0.3 * 15deg)) rotateY(calc(1 * -0.3 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 0.712363330529857,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(50%) translateY(0%) rotateX(calc(0 * 0.2 * 15deg)) rotateY(calc(1 * 0.2 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 0.8822539949537426,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(50%) translateY(0%) rotateX(calc(0 * -0.05 * 15deg)) rotateY(calc(1 * -0.05 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(50%) translateY(0%) rotateX(calc(0 * 0 * 15deg)) rotateY(calc(1 * 0 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(50%) translateY(0%) rotateX(calc(0 * 0 * 15deg)) rotateY(calc(1 * 0 * 15deg)) translateX(calc(-1 * 50%)) translateY(calc(-1 * 0%))',
            },
          ],
        },
      ]);
    });

    test('custom pivot - bottom', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          pivot: 'bottom',
        } as Fold,
      };

      expect(FoldAnimation.web(mockOptions)).toMatchObject([
        {
          name: 'motion-fold',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '50%',
            '--motion-perspective': '800px',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '-1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              offset: 0,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(50%) rotateX(calc(-1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              offset: 0.08410428931875526,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(50%) rotateX(calc(-1 * 1 * 15deg)) rotateY(calc(0 * 1 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              offset: 0.25399495374264086,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(50%) rotateX(calc(-1 * -0.7 * 15deg)) rotateY(calc(0 * -0.7 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              offset: 0.4238856181665265,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(50%) rotateX(calc(-1 * 0.6 * 15deg)) rotateY(calc(0 * 0.6 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              offset: 0.5769554247266611,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(50%) rotateX(calc(-1 * -0.3 * 15deg)) rotateY(calc(0 * -0.3 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              offset: 0.712363330529857,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(50%) rotateX(calc(-1 * 0.2 * 15deg)) rotateY(calc(0 * 0.2 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              offset: 0.8822539949537426,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(50%) rotateX(calc(-1 * -0.05 * 15deg)) rotateY(calc(0 * -0.05 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(50%) rotateX(calc(-1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(800px) translateX(0%) translateY(50%) rotateX(calc(-1 * 0 * 15deg)) rotateY(calc(0 * 0 * 15deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * 50%))',
            },
          ],
        },
      ]);
    });

    test('custom angle and perspective', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          angle: 30,
          perspective: 400,
        } as Fold,
      };

      expect(FoldAnimation.web(mockOptions)).toMatchObject([
        {
          name: 'motion-fold',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-perspective': '400px',
            '--motion-rotate-angle': '30deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              offset: 0,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(400px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0 * 30deg)) rotateY(calc(0 * 0 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.08410428931875526,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(400px) translateX(0%) translateY(-50%) rotateX(calc(1 * 1 * 30deg)) rotateY(calc(0 * 1 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.25399495374264086,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(400px) translateX(0%) translateY(-50%) rotateX(calc(1 * -0.7 * 30deg)) rotateY(calc(0 * -0.7 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.4238856181665265,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(400px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0.6 * 30deg)) rotateY(calc(0 * 0.6 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.5769554247266611,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(400px) translateX(0%) translateY(-50%) rotateX(calc(1 * -0.3 * 30deg)) rotateY(calc(0 * -0.3 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.712363330529857,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(400px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0.2 * 30deg)) rotateY(calc(0 * 0.2 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 0.8822539949537426,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(400px) translateX(0%) translateY(-50%) rotateX(calc(1 * -0.05 * 30deg)) rotateY(calc(0 * -0.05 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(400px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0 * 30deg)) rotateY(calc(0 * 0 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(400px) translateX(0%) translateY(-50%) rotateX(calc(1 * 0 * 30deg)) rotateY(calc(0 * 0 * 30deg)) translateX(calc(-1 * 0%)) translateY(calc(-1 * -50%))',
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
        namedEffect: {} as Fold,
      };

      expect(FoldAnimation.style(mockOptions)).toMatchObject([
        {
          name: 'motion-fold',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-perspective': '800px',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              offset: 0,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.08410428931875526,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 1 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 1 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.25399495374264086,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.7 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.7 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.4238856181665265,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0.6 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0.6 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.5769554247266611,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.3 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.3 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.712363330529857,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0.2 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0.2 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.8822539949537426,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.05 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.05 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
          ],
        },
      ]);
    });

    test('custom duration, delay and easing', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        easing: 'linear',
        namedEffect: {
          iterationDelay: 500,
        } as Fold,
      };

      expect(FoldAnimation.style(mockOptions)).toMatchObject([
        {
          duration: 1500,
          easing: 'linear',
          name: 'motion-fold-067',
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-perspective': '800px',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'linear',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.0560695262125035,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 1 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 1 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.16932996916176057,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.7 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.7 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.28259041211101765,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0.6 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0.6 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.384636949817774,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.3 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.3 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.47490888701990464,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0.2 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0.2 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.5881693299691617,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.05 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.05 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.6666666666666666,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
          ],
        },
      ]);
    });

    test('custom pivot - right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          pivot: 'right',
        } as Fold,
      };

      expect(FoldAnimation.style(mockOptions)).toMatchObject([
        {
          name: 'motion-fold',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-origin-x': '50%',
            '--motion-origin-y': '0%',
            '--motion-perspective': '800px',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '0',
            '--motion-rotate-y': '1',
          },
          keyframes: [
            {
              offset: 0,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.08410428931875526,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 1 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 1 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.25399495374264086,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.7 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.7 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.4238856181665265,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0.6 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0.6 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.5769554247266611,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.3 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.3 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.712363330529857,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0.2 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0.2 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.8822539949537426,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.05 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.05 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
          ],
        },
      ]);
    });

    test('custom pivot - bottom', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          pivot: 'bottom',
        } as Fold,
      };

      expect(FoldAnimation.style(mockOptions)).toMatchObject([
        {
          name: 'motion-fold',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '50%',
            '--motion-perspective': '800px',
            '--motion-rotate-angle': '15deg',
            '--motion-rotate-x': '-1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              offset: 0,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.08410428931875526,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 1 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 1 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.25399495374264086,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.7 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.7 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.4238856181665265,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0.6 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0.6 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.5769554247266611,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.3 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.3 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.712363330529857,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0.2 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0.2 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.8822539949537426,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.05 * 15deg)) rotateY(calc(var(--motion-rotate-y) * -0.05 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 15deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 15deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
          ],
        },
      ]);
    });

    test('custom angle and perspective', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          angle: 30,
          perspective: 400,
        } as Fold,
      };

      expect(FoldAnimation.style(mockOptions)).toMatchObject([
        {
          name: 'motion-fold',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-origin-x': '0%',
            '--motion-origin-y': '-50%',
            '--motion-perspective': '400px',
            '--motion-rotate-angle': '30deg',
            '--motion-rotate-x': '1',
            '--motion-rotate-y': '0',
          },
          keyframes: [
            {
              offset: 0,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 30deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 30deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.08410428931875526,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 1 * 30deg)) rotateY(calc(var(--motion-rotate-y) * 1 * 30deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.25399495374264086,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.7 * 30deg)) rotateY(calc(var(--motion-rotate-y) * -0.7 * 30deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.4238856181665265,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0.6 * 30deg)) rotateY(calc(var(--motion-rotate-y) * 0.6 * 30deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.5769554247266611,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.3 * 30deg)) rotateY(calc(var(--motion-rotate-y) * -0.3 * 30deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.712363330529857,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0.2 * 30deg)) rotateY(calc(var(--motion-rotate-y) * 0.2 * 30deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 0.8822539949537426,
              easing: expect.stringMatching(/^linear\(/),
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * -0.05 * 30deg)) rotateY(calc(var(--motion-rotate-y) * -0.05 * 30deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 30deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 30deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) perspective(var(--motion-perspective)) translateX(var(--motion-origin-x)) translateY(var(--motion-origin-y)) rotateX(calc(var(--motion-rotate-x) * 0 * 30deg)) rotateY(calc(var(--motion-rotate-y) * 0 * 30deg)) translateX(calc(-1 * var(--motion-origin-x))) translateY(calc(-1 * var(--motion-origin-y)))',
            },
          ],
        },
      ]);
    });
  });

  test('getNames', () => {
    expect(FoldAnimation.getNames({ ...baseMockOptions, namedEffect: {} as Fold })).toEqual([
      'motion-fold',
    ]);
  });

  test('schema', () => {
    expect(FoldAnimation.schema).toEqual({
      angle: {
        type: 'number',
        min: 0,
        default: 15,
      },
      iterationDelay: {
        type: 'number',
        min: 0,
        default: 0,
      },
      perspective: {
        type: 'number',
        min: 0,
        default: 800,
      },
      pivot: {
        type: 'enum',
        values: ['top', 'right', 'bottom', 'left'],
        default: 'top',
      },
    });
  });
});
