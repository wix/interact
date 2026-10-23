import { describe, expect, test } from 'vitest';

import * as Swing from '../Swing';
import { Swing as SwingType, TimeAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Swing', () => {
  describe('style function', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as SwingType,
      };

      const expectedResult = [
        {
          name: 'motion-swing-1',
          duration: 1,
          custom: {
            '--motion-swing-deg': '20deg',
            '--motion-trans-x': '0%',
            '--motion-trans-y': '-50%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.25,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(var(--motion-swing-deg)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 0.75,
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(calc(var(--motion-swing-deg) * -1)) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(var(--motion-trans-x), var(--motion-trans-y)) rotate(0deg) translate(calc(var(--motion-trans-x) * -1), calc(var(--motion-trans-y) * -1))',
            },
          ],
        },
      ];

      const result = Swing.style?.(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom swing, duration and easing', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        easing: 'linear',
        namedEffect: { angle: 30, iterationDelay: 500 } as SwingType,
      };

      const result = Swing.style(mockOptions);

      expect(result[0]).toMatchObject({
        name: 'motion-swing-067-linear',
        duration: 1500,
        custom: {
          '--motion-swing-deg': '30deg',
          '--motion-trans-x': '0%',
          '--motion-trans-y': '-50%',
        },
      });

      expect(result[0].keyframes.length).toBe(5);
      expect(result[0].keyframes.map(({ easing }: any) => easing)).toEqual([
        'linear',
        'linear',
        'linear',
        undefined,
        undefined,
      ]);
    });

    test('custom duration and delay - offsets and name', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { iterationDelay: 500 } as SwingType,
      };

      const result = Swing.style(mockOptions);

      expect(result[0]).toMatchObject({
        name: 'motion-swing-067',
        duration: 1500,
      });

      const keyframes = result[0].keyframes;
      expect(keyframes.map(({ offset }: any) => offset)).toEqual([
        0,
        0.25 * 0.67,
        0.75 * 0.67,
        0.67,
        1,
      ]);
    });

    test('custom pivot - right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'right' } as SwingType,
      };

      const result = Swing.style(mockOptions);

      expect(result[0].custom).toMatchObject({
        '--motion-trans-x': '50%',
        '--motion-trans-y': '0%',
      });

      expect(result[0].keyframes[0].transform).toContain(
        'translate(var(--motion-trans-x), var(--motion-trans-y))',
      );
    });

    test('custom pivot - left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'left' } as SwingType,
      };

      const result = Swing.style?.(mockOptions);

      expect(result[0].custom).toMatchObject({
        '--motion-trans-x': '-50%',
        '--motion-trans-y': '0%',
      });
    });

    test('custom pivot - bottom', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'bottom' } as SwingType,
      };

      const result = Swing.style?.(mockOptions);

      expect(result[0].custom).toMatchObject({
        '--motion-trans-x': '0%',
        '--motion-trans-y': '50%',
      });
    });
  });

  describe('web function', () => {
    test('default values with web output', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as SwingType,
      };

      const expectedResult = [
        {
          name: 'motion-swing-1',
          duration: 1,
          custom: {
            '--motion-swing-deg': '20deg',
            '--motion-trans-x': '0%',
            '--motion-trans-y': '-50%',
          },
          keyframes: [
            {
              offset: 0,
              easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(0deg) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.25,
              easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(20deg) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 0.75,
              easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
              transform:
                'rotate(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(calc(20deg * -1)) translate(calc(0% * -1), calc(-50% * -1))',
            },
            {
              offset: 1,
              transform:
                'rotateZ(var(--motion-rotate, 0deg)) translate(0%, -50%) rotate(0deg) translate(calc(0% * -1), calc(-50% * -1))',
            },
          ],
        },
      ];

      const result = Swing.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom swing, duration and easing with web output', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        easing: 'linear',
        namedEffect: { angle: 30, iterationDelay: 500 } as SwingType,
      };

      const result = Swing.web(mockOptions);

      expect(result[0]).toMatchObject({
        name: 'motion-swing-067-linear',
        duration: 1500,
        custom: {
          '--motion-swing-deg': '30deg',
          '--motion-trans-x': '0%',
          '--motion-trans-y': '-50%',
        },
      });

      // Check that keyframes contain actual computed values, not CSS variables
      const firstKeyframe = result[0].keyframes[0];
      expect(firstKeyframe.transform).toContain('translate(0%, -50%)');
      expect(firstKeyframe.transform).toContain('translate(calc(0% * -1), calc(-50% * -1))');
      expect(firstKeyframe.transform).not.toContain('var(--motion-trans-x)');
      expect(firstKeyframe.transform).not.toContain('var(--motion-trans-y)');

      const peakKeyframe = result[0].keyframes[1];
      expect(peakKeyframe.transform).toContain('rotate(30deg)');
      expect(peakKeyframe.transform).not.toContain('var(--motion-swing-deg)');

      // Check that all easing values are actual values, not CSS variables
      result[0].keyframes.forEach((keyframe: any) => {
        if (keyframe.easing) {
          expect(keyframe.easing).toBe('linear');
        }
      });
    });

    test('custom duration and delay - offsets and name with web output', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { iterationDelay: 500 } as SwingType,
      };

      const result = Swing.web(mockOptions);

      expect(result[0]).toMatchObject({
        name: 'motion-swing-067',
        duration: 1500,
      });

      const keyframes = result[0].keyframes;
      expect(keyframes.map(({ offset }: any) => offset)).toEqual([
        0,
        0.25 * 0.67,
        0.75 * 0.67,
        0.67,
        1,
      ]);
    });

    test('custom pivot - right with web output', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { pivot: 'right' } as SwingType,
      };

      const result = Swing.web(mockOptions);

      expect(result[0].keyframes[0].transform).toContain('translate(50%, 0%)');
      expect(result[0].keyframes[0].transform).toContain(
        'translate(calc(50% * -1), calc(0% * -1))',
      );
    });
  });
});

describe('Swing easings', () => {
  test.each([undefined, 'linear', 'quadInOut'])('CSS uses real easings for %s', (easing) => {
    const [animation] = Swing.style({
      ...baseMockOptions,
      easing,
      namedEffect: { iterationDelay: 500 } as SwingType,
    });
    const easings = animation.keyframes.map(({ easing }) => easing).filter(Boolean);
    expect(easings).toHaveLength(3);
    for (const value of easings) expect(value).not.toContain('var(');
    expect(Object.keys(animation.custom!).some((key) => key.includes('ease'))).toBe(false);
  });
});
