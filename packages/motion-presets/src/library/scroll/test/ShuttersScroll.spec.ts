import { describe, expect, test } from 'vitest';
import * as ShuttersScroll from '../ShuttersScroll';
import { getEasing } from '../../../utils';
import { mirrorEasing } from '../../../easingUtils';
import { scrollOptions } from './testUtils';

const shuttersOf = (namedEffect: Record<string, unknown>) =>
  ShuttersScroll.style(scrollOptions({ type: 'ShuttersScroll', ...namedEffect }), true)[0] as any;

describe('ShuttersScroll', () => {
  test('eases in with sineIn and out with sineOut', () => {
    expect(shuttersOf({ range: 'in' }).easing).toBe(getEasing('sineIn'));
    expect(shuttersOf({ range: 'out' }).easing).toBe(mirrorEasing('sineOut'));
  });

  test('continuous holds the revealed state in the middle', () => {
    const { easing } = shuttersOf({ range: 'continuous', staggered: false });
    expect(easing).toContain('0.5 40%, 0.5 60%');
  });

  test('staggered continuous leaves the timing to its keyframes', () => {
    const { easing, keyframes } = shuttersOf({ range: 'continuous', staggered: true });
    expect(easing).toBe('linear');
    expect(keyframes.map((keyframe: any) => keyframe.offset)).toEqual([0, 0.45, 0.55, 1]);
  });
});
