import { describe, expect, test } from 'vitest';
import * as MoveScroll from '../MoveScroll';
import { scrollOptions } from './testUtils';

const offsetsOf = (namedEffect: Record<string, unknown>) =>
  MoveScroll.style(scrollOptions({ type: 'MoveScroll', ...namedEffect }), true).map(
    (animation: any) => [animation.startOffsetAdd, animation.endOffsetAdd],
  );

describe('MoveScroll', () => {
  test('does not widen the range when moving with the scroll', () => {
    expect(offsetsOf({ direction: -60 })).toEqual([
      ['', ''],
      ['', ''],
    ]);
  });

  test('widens the range by the vertical travel when moving against the scroll', () => {
    const travelY = 100 * Math.sin(Math.PI / 6);
    expect(offsetsOf({ direction: 30, travel: '100px', range: 'in' })).toEqual([
      [`${-travelY}px`, ''],
      [`${-travelY}px`, ''],
    ]);
    expect(offsetsOf({ direction: 30, travel: '100px', range: 'out' })[0]).toEqual([
      '',
      `${travelY}px`,
    ]);
    expect(offsetsOf({ direction: 30, travel: '100px', range: 'continuous' })[0]).toEqual([
      `${-travelY}px`,
      `${travelY}px`,
    ]);
  });
});
