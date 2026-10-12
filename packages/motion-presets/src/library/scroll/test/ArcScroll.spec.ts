import { describe, expect, test } from 'vitest';
import * as ArcScroll from '../ArcScroll';
import { MOTION_3D_TRANSFORM_NAME } from '../../../transformUtils';
import { byName, scrollOptions } from './testUtils';

const arcOf = (namedEffect: Record<string, unknown>) =>
  byName(
    ArcScroll.style(scrollOptions({ type: 'ArcScroll', ...namedEffect }), true),
    MOTION_3D_TRANSFORM_NAME,
  ) as any;

describe('ArcScroll', () => {
  test('rotates around the axis perpendicular to the direction, around a fixed depth', () => {
    expect(arcOf({ direction: 'horizontal' }).custom['--motion-transform-3d-angle-y']).toBe(
      '68deg',
    );
    expect(arcOf({ direction: 'vertical' }).custom['--motion-transform-3d-angle-x']).toBe('-68deg');
    expect(arcOf({}).custom['--motion-transform-3d-origin-z']).toBe('-300px');
  });

  test("'out' continues the rotation of 'in'", () => {
    const arcIn = arcOf({ range: 'in' });
    const arcOut = arcOf({ range: 'out' });
    expect(arcOut.reversed).toBe(true);
    expect(arcOut.custom['--motion-transform-3d-from']).toBe(
      -arcIn.custom['--motion-transform-3d-from'],
    );
  });
});
