import { describe, expect, test } from 'vitest';
import * as StretchScroll from '../StretchScroll';
import { MOTION_FADE_NAME } from '../../../fadeBlurUtils';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_SCALE_NAME,
  MOTION_TRANS_ROT_NAME,
} from '../../../transformUtils';
import { getEasing } from '../../../utils';
import { byName, scrollOptions } from './testUtils';

const stretchOf = (namedEffect: Record<string, unknown>, asWeb = true) =>
  StretchScroll.style(scrollOptions({ type: 'StretchScroll', ...namedEffect }), asWeb) as any[];

describe('StretchScroll', () => {
  test('keeps the layout rotation last, so the stretch is along the screen axes', () => {
    expect(stretchOf({}).map((animation) => animation.name)).toEqual([
      MOTION_FADE_NAME,
      MOTION_TRANS_ROT_NAME,
      MOTION_SCALE_NAME,
      MOTION_LAYOUT_ROTATION_NAME,
    ]);
  });

  test('stretches by scaling x down and y up', () => {
    const custom = byName(stretchOf({ stretch: 0.5 }), MOTION_SCALE_NAME).custom;
    expect(custom['--motion-scale-scale-x']).toBe(0.5);
    expect(custom['--motion-scale-scale-y']).toBe(1.5);
  });

  test('moves up by the extra height - from the scale value or its custom-property in CSS', () => {
    const web = byName(stretchOf({ stretch: 0.5 }), MOTION_TRANS_ROT_NAME).custom;
    expect(web['--motion-trans-rot-direction']).toBe('90deg');
    expect(web['--motion-trans-rot-travel']).toBe('calc(100% * (1.5 - 1))');

    const css = stretchOf({}, false);
    const scaleY = Object.keys(byName(css, MOTION_SCALE_NAME).custom).find((key) =>
      key.endsWith('-scale-y'),
    );
    expect(byName(css, MOTION_TRANS_ROT_NAME).custom['--motion-trans-rot-travel']).toBe(
      `calc(100% * (var(${scaleY}, 1) - 1))`,
    );
  });

  test('fades with its own curves and moves with backInOut', () => {
    const [fadeIn, moveIn] = stretchOf({ range: 'in' });
    expect(fadeIn.easing).toMatch(/^linear\(0 0%, 0 33.9%/);
    expect(moveIn.easing).toBe(getEasing('backInOut'));
    expect(stretchOf({ range: 'continuous' })[0].easing).toMatch(/^linear\(/);
  });
});
