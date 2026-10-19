import { describe, expect, test } from 'vitest';

import * as StretchScroll from '../StretchScroll';
import type {
  AnimationData,
  StretchScroll as StretchScrollType,
  ScrubAnimationOptions,
} from '../../../types';
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
          easing: 'backInOut',
          keyframes: [
            {
              opacity: 1,
              offset: 0.35,
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
              offset: 0.35,
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
          keyframes: [
            {
              opacity: 0,
              offset: 0,
            },
            {
              opacity: 1,
              offset: 0.65,
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
          easing: expect.stringMatching(/^linear\(0 0%, 0 45.1%, .*, 1 63%, 1 100%\)$/),
          keyframes: [{ opacity: 1 }, { opacity: 0 }],
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
          easing: expect.stringMatching(/^linear\(0 0%, 0 33.9%, .*, 1 50.9%, 1 100%\)$/),
          keyframes: [{ opacity: 0 }, { opacity: 1 }],
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

    const styleOf = (namedEffect: Partial<StretchScrollType>, suffix?: string) =>
      StretchScroll.style({
        ...baseMockOptions,
        suffix,
        namedEffect: namedEffect as StretchScrollType,
      }) as AnimationData[];

    const getVarNames = (keyframes: Keyframe[]) =>
      keyframes.flatMap((frame) =>
        Object.values(frame).flatMap((value) =>
          [...String(value).matchAll(/var\((--[\w-]+)/g)].map(([, name]) => name),
        ),
      );

    test.each([
      [{}, { x: 0.4, y: 1.6 }],
      [{ stretch: 0.2 }, { x: 0.8, y: 1.2 }],
      [
        { stretch: -0.5, range: 'in' },
        { x: 1.5, y: 0.5 },
      ],
    ])('declares every custom property its keyframes use - %o', (namedEffect, scale) => {
      const [stretch, fade] = styleOf(namedEffect as Partial<StretchScrollType>);
      const custom = stretch.custom!;

      expect(getVarNames(stretch.keyframes).every((name) => name in custom)).toBe(true);
      expect(getVarNames(fade.keyframes)).toEqual([]);
      expect(Object.values(custom).every((value) => !String(value).includes('var('))).toBe(true);
      expect(Object.values(custom)).toEqual(expect.arrayContaining([scale.x, scale.y]));
      expect(fade.keyframes.every((frame) => !('offset' in frame))).toBe(true);
    });

    test('custom stretch value', () => {
      const [stretch] = styleOf({ stretch: 0.8 });

      expect(stretch.custom).toEqual({
        '--motion-stretch-scale-x-from': 1,
        '--motion-stretch-scale-y-from': 1,
        '--motion-stretch-scale-x-to': 0.2,
        '--motion-stretch-scale-y-to': 1.8,
        '--motion-stretch-trans-from': 0,
        '--motion-stretch-trans-to': 'calc(100% * (1 - 1.8))',
      });
    });

    test('suffixes its custom properties, so effects in other keyframe slots keep their own values', () => {
      const [stretch] = styleOf({ stretch: 0.2, range: 'in' }, '-1');

      expect(stretch.name).toBe('motion-stretchScrollScale-1');
      expect(
        Object.keys(stretch.custom!).every((name) => name.startsWith('--motion-stretch-1-')),
      ).toBe(true);
      expect(getVarNames(stretch.keyframes).every((name) => name in stretch.custom!)).toBe(true);
    });
  });
});
