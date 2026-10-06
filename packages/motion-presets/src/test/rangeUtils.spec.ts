import { describe, expect, test } from 'vitest';

import {
  BACK_AND_FORTH_EASING,
  completeScrollOffsets,
  getFillOverrides,
  getLinearScrollEasing,
  getScrollOverrides,
  parseRange,
  withSharedScrollRange,
} from '../rangeUtils';

const cover = (value: number) => ({ name: 'cover', offset: { value, unit: 'percentage' } });

describe('parseRange', () => {
  test('reads the range keyword, or falls back to the default range', () => {
    expect(parseRange({ range: ' OUT ' })).toBe('out');
    expect(parseRange({ range: 'nope' }, 'continuous')).toBe('continuous');
    expect(parseRange(undefined)).toBe('in');
  });
});

describe('getFillOverrides', () => {
  test('fills the rest state outside the animation, keeping an explicit fill', () => {
    expect(getFillOverrides({} as any, 'in')).toEqual({ fill: 'backwards' });
    expect(getFillOverrides({} as any, 'continuous')).toEqual({ fill: 'both' });
    expect(getFillOverrides({ fill: 'none' } as any, 'in')).toEqual({ fill: 'none' });
  });

  test('out is reversed, flipping an already reversed animation', () => {
    expect(getFillOverrides({} as any, 'out')).toEqual({ fill: 'forwards', reversed: true });
    expect(getFillOverrides({ reversed: true } as any, 'out').reversed).toBe(false);
  });
});

describe('completeScrollOffsets', () => {
  test('in: cover 0% - 50%, out: cover 50% - 100%, continuous: cover 0% - 100%', () => {
    expect(completeScrollOffsets({} as any, 'in')).toEqual({
      startOffset: cover(0),
      endOffset: cover(50),
    });
    expect(completeScrollOffsets({} as any, 'out')).toEqual({
      startOffset: cover(50),
      endOffset: cover(100),
    });
    expect(completeScrollOffsets({} as any, 'continuous')).toEqual({
      startOffset: cover(0),
      endOffset: cover(100),
    });
  });

  test('completes partial user offsets', () => {
    expect(
      completeScrollOffsets(
        { startOffset: { name: 'cover' }, endOffset: { offset: { value: 80 } } } as any,
        'out',
      ),
    ).toEqual({ startOffset: cover(50), endOffset: cover(80) });
  });

  test('non-cover ranges default to 0% and the end range name to the start one', () => {
    const contain0 = { name: 'contain', offset: { value: 0, unit: 'percentage' } };
    expect(
      completeScrollOffsets({ startOffset: { name: 'contain' }, endOffset: {} } as any, 'in'),
    ).toEqual({ startOffset: contain0, endOffset: contain0 });
  });

  test('does not change the user offsets', () => {
    const startOffset = { name: 'cover' };
    completeScrollOffsets({ startOffset } as any, 'in');
    expect(startOffset).toEqual({ name: 'cover' });
  });
});

describe('getLinearScrollEasing', () => {
  test('directional motion continues through continuous, other motion goes back and forth', () => {
    expect(getLinearScrollEasing('in', false)).toBe('linear');
    expect(getLinearScrollEasing('out', false)).toBe('linear');
    expect(getLinearScrollEasing('continuous', true)).toBe('linear');
    expect(getLinearScrollEasing('continuous', false)).toBe(BACK_AND_FORTH_EASING);
    expect(BACK_AND_FORTH_EASING).toBe('linear(0 0%, 1 50%, 1 50%, 0 100%)');
  });
});

describe('getScrollOverrides', () => {
  test('sets the fill, the given easing and the scroll range', () => {
    expect(getScrollOverrides({ easing: 'user-easing' } as any, 'out', 'linear')).toEqual({
      fill: 'forwards',
      reversed: true,
      easing: 'linear',
      startOffset: cover(50),
      endOffset: cover(100),
    });
  });
});

describe('withSharedScrollRange', () => {
  test('copies the defined scroll range keys of the first animation to the rest', () => {
    const [first, second, third]: any[] = withSharedScrollRange([
      { keyframes: [], startOffset: cover(10), endOffset: cover(90), startOffsetAdd: '5vh' } as any,
      { keyframes: [], startOffset: cover(0), endOffset: cover(100), endOffsetAdd: '1px' } as any,
      { keyframes: [], name: 'third' } as any,
    ]);
    expect(first.startOffset).toEqual(cover(10));
    expect(second).toMatchObject({
      startOffset: cover(10),
      endOffset: cover(90),
      startOffsetAdd: '5vh',
      endOffsetAdd: '1px',
    });
    expect(third).toMatchObject({
      name: 'third',
      startOffset: cover(10),
      endOffset: cover(90),
      startOffsetAdd: '5vh',
    });
    expect('endOffsetAdd' in third).toBe(false);
  });
});
