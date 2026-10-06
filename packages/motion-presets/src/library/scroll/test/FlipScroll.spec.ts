import { describe, expect, test } from 'vitest';
import * as FlipScroll from '../FlipScroll';
import { MOTION_3D_TRANSFORM_NAME } from '../../../transformUtils';
import { byName, scrollOptions } from './testUtils';

const flipOf = (namedEffect: Record<string, unknown>) =>
  byName(
    FlipScroll.style(scrollOptions({ type: 'FlipScroll', ...namedEffect }), true),
    MOTION_3D_TRANSFORM_NAME,
  ) as any;

describe('FlipScroll', () => {
  test('flips around the axis perpendicular to the direction', () => {
    expect(
      flipOf({ direction: 'horizontal', angle: 120 }).custom['--motion-transform-3d-angle-y'],
    ).toBe('120deg');
    expect(
      flipOf({ direction: 'vertical', angle: 120 }).custom['--motion-transform-3d-angle-x'],
    ).toBe('-120deg');
  });

  test("'out' continues the rotation of 'in'", () => {
    const flipIn = flipOf({ range: 'in' });
    const flipOut = flipOf({ range: 'out' });
    expect(flipOut.reversed).toBe(true);
    expect(flipOut.custom['--motion-transform-3d-from']).toBe(
      -flipIn.custom['--motion-transform-3d-from'],
    );
  });
});
