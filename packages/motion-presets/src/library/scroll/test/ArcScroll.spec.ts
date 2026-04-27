import { describe, expect, test } from 'vitest';

import * as ArcScroll from '../ArcScroll';
import type { ArcScroll as ArcScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('ArcScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as ArcScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          keyframes: [
            {
              transform:
                'perspective(500px) translateZ(-300px) rotateY(-68deg) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(500px) translateZ(-300px) rotateY(0deg) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = ArcScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('vertical direction', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'vertical' } as ArcScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'perspective(500px) translateZ(-300px) rotateX(-68deg) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(500px) translateZ(-300px) rotateX(0deg) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = ArcScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as ArcScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'perspective(500px) translateZ(-300px) rotateY(0deg) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(500px) translateZ(-300px) rotateY(68deg) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = ArcScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        fill: 'forwards',
        namedEffect: { range: 'continuous' } as ArcScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              transform:
                'perspective(500px) translateZ(-300px) rotateY(-68deg) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(500px) translateZ(-300px) rotateY(68deg) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = ArcScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as ArcScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          custom: {
            '--motion-perspective': '500px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateZ(-300px) var(--motion-arc-from) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateZ(-300px) var(--motion-arc-to) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = ArcScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('vertical direction', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'vertical' } as ArcScrollType,
      };

      const expectedResult = [
        {
          custom: {
            '--motion-perspective': '500px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateZ(-300px) var(--motion-arc-from) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateZ(-300px) var(--motion-arc-to) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = ArcScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as ArcScrollType,
      };

      const expectedResult = [
        {
          custom: {
            '--motion-perspective': '500px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateZ(-300px) var(--motion-arc-from) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateZ(-300px) var(--motion-arc-to) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = ArcScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        fill: 'forwards',
        namedEffect: { range: 'continuous' } as ArcScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          custom: {
            '--motion-perspective': '500px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateZ(-300px) var(--motion-arc-from) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateZ(-300px) var(--motion-arc-to) translateZ(300px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = ArcScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
