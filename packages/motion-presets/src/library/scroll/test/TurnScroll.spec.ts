import { describe, expect, test } from 'vitest';
import * as TurnScroll from '../TurnScroll';
import { getOffscreenTravels } from '../../../layoutUtils';
import { MOTION_TRANS_ROT_NAME } from '../../../transformUtils';
import { byName, fakeDom, scrollOptions } from './testUtils';

const turnOf = (namedEffect: Record<string, unknown>) =>
  byName(
    TurnScroll.style(scrollOptions({ type: 'TurnScroll', ...namedEffect }), true),
    MOTION_TRANS_ROT_NAME,
  ).custom!;

describe('TurnScroll', () => {
  test('the angle sign combines the spin with the direction of the movement', () => {
    expect(turnOf({ direction: 'right', spin: 'clockwise' })['--motion-trans-rot-angle']).toBe(
      '45deg',
    );
    expect(turnOf({ direction: 'left', spin: 'clockwise' })['--motion-trans-rot-angle']).toBe(
      '-45deg',
    );
    expect(
      turnOf({ direction: 'left', spin: 'counter-clockwise', angle: 90 })[
        '--motion-trans-rot-angle'
      ],
    ).toBe('90deg');
  });

  test('moves from offscreen on one side to offscreen on the other', () => {
    const { travel, toTravel } = getOffscreenTravels('right');
    const custom = turnOf({ direction: 'right' });
    expect(custom['--motion-trans-rot-travel']).toBe(travel);
    expect(custom['--motion-trans-rot-to-travel']).toBe(toTravel);
  });

  test('prepare measures the layout position', () => {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => ({ left: 120, top: 30 }) as DOMRect;
    TurnScroll.prepare(scrollOptions({ type: 'TurnScroll' }), fakeDom(element));
    expect(element.style.getPropertyValue('--motion-left')).toBe('120px');
    expect(element.style.getPropertyValue('--motion-top')).toBe('30px');
  });
});
