import { describe, expect, test } from 'vitest';

import * as MoveScroll from '../MoveScroll';
import type { MoveScroll as MoveScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('MoveScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as MoveScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          startOffsetAdd: '',
          endOffsetAdd: '',
          keyframes: [
            {
              transform: 'translate(-200px, 346px) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = MoveScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom distance', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          distance: { value: 200, unit: 'percentage' },
        } as MoveScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '',
          endOffsetAdd: '',
          keyframes: [
            {
              transform: 'translate(-100%, 173%) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translate(0%, 0%) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = MoveScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom angle', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { angle: 45 } as MoveScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform: 'translate(283px, 283px) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = MoveScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as MoveScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          startOffsetAdd: '',
          endOffsetAdd: '346.4101615137755px',
          keyframes: [
            {
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translate(-200px, 346px) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = MoveScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'continuous' } as MoveScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '',
          endOffsetAdd: '',
          keyframes: [
            {
              transform: 'translate(-200px, 346px) rotate(var(--motion-rotate, 0))',
            },
            {
              transform: 'translate(200px, -346px) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = MoveScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as MoveScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          startOffsetAdd: '',
          endOffsetAdd: '',
          keyframes: [
            {
              transform:
                'translate(var(--motion-move-from-x), var(--motion-move-from-y)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translate(var(--motion-move-to-x), var(--motion-move-to-y)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = MoveScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom distance', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          distance: { value: 200, unit: 'percentage' },
        } as MoveScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '',
          endOffsetAdd: '',
          keyframes: [
            {
              transform:
                'translate(var(--motion-move-from-x), var(--motion-move-from-y)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translate(var(--motion-move-to-x), var(--motion-move-to-y)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = MoveScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as MoveScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          keyframes: [
            {
              transform:
                'translate(var(--motion-move-from-x), var(--motion-move-from-y)) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translate(var(--motion-move-to-x), var(--motion-move-to-y)) rotate(var(--motion-rotate, 0))',
            },
          ],
        },
      ];

      const result = MoveScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
