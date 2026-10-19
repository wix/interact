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

    test('custom direction', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: -135 } as MoveScrollType,
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
        namedEffect: { range: 'out', direction: 120 } as MoveScrollType,
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
        namedEffect: { range: 'out', direction: 120 } as MoveScrollType,
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

  describe('calc() travel', () => {
    const travel = 'calc(10vh + 20px)';
    const sinIn = Math.sin((240 * Math.PI) / 180);
    const sinOut = Math.sin((60 * Math.PI) / 180);

    test.each([
      ['in', `calc(${sinIn} * ${travel})`, ''],
      ['continuous', `calc(${sinIn} * ${travel})`, `calc(${-sinIn} * ${travel})`],
      ['out', '', `calc(${sinOut} * ${travel})`],
    ])(
      'range %s derives offset adds from the angle sign',
      (range, startOffsetAdd, endOffsetAdd) => {
        const result = MoveScroll.style({
          ...baseMockOptions,
          namedEffect: { travel, direction: 60, range } as unknown as MoveScrollType,
        });

        expect(result[0]).toMatchObject({ startOffsetAdd, endOffsetAdd });
      },
    );

    test('translate values are scaled calc() expressions', () => {
      const result = MoveScroll.style({
        ...baseMockOptions,
        namedEffect: { travel, direction: 60, range: 'continuous' } as unknown as MoveScrollType,
      });

      expect(result[0].custom).toEqual({
        '--motion-move-from-x': `calc(${Math.cos((240 * Math.PI) / 180)} * ${travel})`,
        '--motion-move-from-y': `calc(${sinIn} * ${travel})`,
        '--motion-move-to-x': `calc(${-Math.cos((240 * Math.PI) / 180)} * ${travel})`,
        '--motion-move-to-y': `calc(${-sinIn} * ${travel})`,
      });
    });

    test('numeric travel keeps rounded output', () => {
      const result = MoveScroll.style({
        ...baseMockOptions,
        namedEffect: { travel: { value: 200, unit: 'px' }, direction: 60 } as MoveScrollType,
      });

      expect(result[0]).toMatchObject({
        startOffsetAdd: `${200 * sinIn}px`,
        custom: { '--motion-move-from-x': '-100px', '--motion-move-from-y': '-173px' },
      });
    });
  });
});
