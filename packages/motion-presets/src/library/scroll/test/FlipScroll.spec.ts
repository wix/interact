import { describe, expect, test } from 'vitest';

import * as FlipScroll from '../FlipScroll';
import type { FlipScroll as FlipScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('FlipScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as FlipScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform: 'perspective(800px) rotateY(-240deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform: 'perspective(800px) rotateY(240deg) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = FlipScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom rotate value', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { rotate: 180 } as FlipScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform: 'perspective(800px) rotateY(-180deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform: 'perspective(800px) rotateY(180deg) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = FlipScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - vertical', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'vertical' } as FlipScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform: 'perspective(800px) rotateX(-240deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform: 'perspective(800px) rotateX(240deg) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = FlipScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - in', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'in' } as FlipScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          keyframes: [
            {
              transform: 'perspective(800px) rotateY(-240deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform: 'perspective(800px) rotateY(0deg) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = FlipScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as FlipScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              transform: 'perspective(800px) rotateY(0deg) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform: 'perspective(800px) rotateY(240deg) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = FlipScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as FlipScrollType,
      };

      const expectedResult = [
        {
          custom: {
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) var(--motion-flip-from) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) var(--motion-flip-to) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = FlipScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom rotate value', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { rotate: 180 } as FlipScrollType,
      };

      const expectedResult = [
        {
          custom: {
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) var(--motion-flip-from) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) var(--motion-flip-to) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = FlipScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - vertical', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'vertical' } as FlipScrollType,
      };

      const expectedResult = [
        {
          custom: {
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) var(--motion-flip-from) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) var(--motion-flip-to) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = FlipScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - in', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'in' } as FlipScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          custom: {
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) var(--motion-flip-from) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) var(--motion-flip-to) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = FlipScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as FlipScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          custom: {
            '--motion-perspective': '800px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) var(--motion-flip-from) rotate(var(--motion-rotate, 0deg))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) var(--motion-flip-to) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = FlipScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
