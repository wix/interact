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
              transform:
                'translate(-200.00000000000006px, 346.41016151377545px) rotate(var(--motion-rotate, 0))',
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

    test('custom travel', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          travel: { value: 200, unit: 'percentage' },
        } as MoveScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '',
          endOffsetAdd: '',
          keyframes: [
            {
              transform:
                'translate(-100.00000000000003%, 173.20508075688772%) rotate(var(--motion-rotate, 0))',
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

    test('custom direction - moving down widens the range', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 45 } as MoveScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-282.84271247461896px',
          endOffsetAdd: '',
          keyframes: [
            {
              transform:
                'translate(-282.842712474619px, -282.84271247461896px) rotate(var(--motion-rotate, 0))',
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
        namedEffect: { range: 'out', direction: 45 } as MoveScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          startOffsetAdd: '',
          endOffsetAdd: '282.84271247461896px',
          keyframes: [
            {
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translate(282.842712474619px, 282.84271247461896px) rotate(var(--motion-rotate, 0))',
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
              transform:
                'translate(-200.00000000000006px, 346.41016151377545px) rotate(var(--motion-rotate, 0))',
            },
            {
              transform:
                'translate(200.00000000000006px, -346.41016151377545px) rotate(var(--motion-rotate, 0))',
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

    test('custom travel', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {
          travel: { value: 200, unit: 'percentage' },
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
