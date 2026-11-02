import { describe, expect, test } from 'vitest';
import * as SlideScroll from '../SlideScroll';
import { resolveDefaults } from '../../../test/resolveDefaults';
import { MOTION_LAYOUT_ROTATION_NAME, MOTION_TRANS_ROT_NAME } from '../../../transformUtils';
import { MOTION_REVEAL_NAME } from '../../../clipUtils';
import { scrollOptions } from './testUtils';

describe('SlideScroll', () => {
  test('moves along the rotated axes - the layout rotation replaces and the motion adds', () => {
    const [rotation, motion, reveal] = resolveDefaults(
      SlideScroll.layers(scrollOptions({ type: 'SlideScroll' }), true),
      SlideScroll.layers(scrollOptions({ type: 'SlideScroll' })),
    ) as any[];
    expect([rotation.name, motion.name, reveal.name]).toEqual([
      MOTION_LAYOUT_ROTATION_NAME,
      MOTION_TRANS_ROT_NAME,
      MOTION_REVEAL_NAME,
    ]);
    expect(rotation.composite).toBe('replace');
    expect(motion.composite).toBe('add');
  });

  test('reveals from the side opposite to the movement', () => {
    const [, motion, reveal] = resolveDefaults(
      SlideScroll.layers(scrollOptions({ type: 'SlideScroll', direction: 'left' }), true),
      SlideScroll.layers(scrollOptions({ type: 'SlideScroll', direction: 'left' })),
    ) as any[];
    expect(motion.custom['--motion-trans-rot-travel']).toBe('100%');
    expect(motion.custom['--motion-trans-rot-from']).toBe(-reveal.custom['--motion-reveal-from']);
  });
});
