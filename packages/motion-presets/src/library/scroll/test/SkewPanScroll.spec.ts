import { describe, expect, test } from 'vitest';
import * as SkewPanScroll from '../SkewPanScroll';
import { getOffscreenTravels } from '../../../layoutUtils';
import { byName, scrollOptions } from './testUtils';

const skewPanOf = (namedEffect: Record<string, unknown>) =>
  byName(
    SkewPanScroll.style(scrollOptions({ type: 'SkewPanScroll', ...namedEffect }), true),
    'motion-trans-rot',
  ).custom!;

describe('SkewPanScroll', () => {
  test('leans into the movement', () => {
    expect(skewPanOf({ skew: 10 })['--motion-trans-rot-skew-x']).toBe('-10deg');
    expect(skewPanOf({ skew: 10 })['--motion-trans-rot-skew-y']).toBe('0deg');
  });

  test('always moves between offscreen positions', () => {
    const { travel, toTravel } = getOffscreenTravels('right');
    const custom = skewPanOf({ direction: 'right' });
    expect(custom['--motion-trans-rot-travel']).toBe(travel);
    expect(custom['--motion-trans-rot-to-travel']).toBe(toTravel);
  });
});
