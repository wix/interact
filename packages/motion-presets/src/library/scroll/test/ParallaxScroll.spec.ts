import { describe, expect, test } from 'vitest';

import * as ParallaxScroll from '../ParallaxScroll';
import type { ParallaxScroll as ParallaxScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('ParallaxScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as ParallaxScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          startOffset: {
            name: 'entry-crossing',
            offset: { value: -19.842156725799697, unit: 'percentage' },
          },
          startOffsetAdd: '-19.842156725799697vh',
          endOffset: {
            name: 'entry-crossing',
            offset: { value: 119.8421567257997, unit: 'percentage' },
          },
          endOffsetAdd: '119.8421567257997vh',
          keyframes: [
            {
              transform:
                'translateY(calc(-0.19842156725799698 * (100% + 100vh))) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(calc(0.19842156725799698 * (100% + 100vh))) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = ParallaxScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom speed and center', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { speed: 0.5, center: 0.25 } as ParallaxScrollType,
      };

      const expectedResult = [
        {
          startOffset: { name: 'entry-crossing', offset: { value: -25, unit: 'percentage' } },
          startOffsetAdd: '-25vh',
          endOffset: { name: 'entry-crossing', offset: { value: 175, unit: 'percentage' } },
          endOffsetAdd: '175vh',
          keyframes: [
            {
              transform: 'translateY(calc(-0.25 * (100% + 100vh))) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translateY(calc(0.75 * (100% + 100vh))) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = ParallaxScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('scroll range with an absolute offset', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        startOffset: { name: 'cover', offset: { value: 100, unit: 'px' } },
        endOffset: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
        namedEffect: { speed: 0.5 } as ParallaxScrollType,
      };

      const expectedResult = [
        {
          startOffset: { name: 'entry-crossing', offset: { value: -50, unit: 'percentage' } },
          startOffsetAdd: 'calc(-50vh + 150px)',
          endOffset: { name: 'entry-crossing', offset: { value: 150, unit: 'percentage' } },
          endOffsetAdd: 'calc(150vh + -50px)',
          keyframes: [
            {
              transform:
                'translateY(calc(-0.5 * (100% + 100vh + -100px))) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translateY(calc(0.5 * (100% + 100vh + -100px))) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = ParallaxScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as ParallaxScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          easing: 'linear',
          custom: {
            '--motion-parallax-from': 'calc(-0.19842156725799698 * (100% + 100vh))',
            '--motion-parallax-to': 'calc(0.19842156725799698 * (100% + 100vh))',
          },
          keyframes: [
            {
              transform: 'translateY(var(--motion-parallax-from)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translateY(var(--motion-parallax-to)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = ParallaxScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
