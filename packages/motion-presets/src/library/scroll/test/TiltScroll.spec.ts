import { describe, expect, test } from 'vitest';
import * as TiltScroll from '../TiltScroll';
import { MOTION_3D_TRANSFORM_NAME, MOTION_TRANS_ROT_NAME } from '../../../transformUtils';
import { getEasing } from '../../../utils';
import { byName, scrollOptions } from './testUtils';

const tiltOf = (namedEffect: Record<string, unknown>) =>
  TiltScroll.style(scrollOptions({ type: 'TiltScroll', ...namedEffect }), true) as any[];

describe('TiltScroll', () => {
  test("'out' is 'in' reversed with the same 3d tilt", () => {
    const tiltIn = byName(tiltOf({ range: 'in' }), MOTION_3D_TRANSFORM_NAME);
    const tiltOut = byName(tiltOf({ range: 'out' }), MOTION_3D_TRANSFORM_NAME);
    expect(tiltOut.reversed).toBe(true);
    expect(tiltOut.custom['--motion-transform-3d-from']).toBe(
      tiltIn.custom['--motion-transform-3d-from'],
    );
  });

  test('the z-rotation follows the direction with its own easing', () => {
    const cw = byName(tiltOf({ direction: 'clockwise' }), MOTION_TRANS_ROT_NAME);
    const ccw = byName(tiltOf({ direction: 'counter-clockwise' }), MOTION_TRANS_ROT_NAME);
    expect(cw.custom['--motion-trans-rot-from']).toBe(-ccw.custom['--motion-trans-rot-from']);
    expect(cw.easing).toBe(getEasing('sineInOut'));
    expect(cw.composite).toBe('add');
  });
});
