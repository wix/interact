import { describe, expect, test } from 'vitest';
import * as PanScroll from '../PanScroll';
import { getOffscreenTravels } from '../../../layoutUtils';
import { byName, fakeDom, scrollOptions } from './testUtils';

const panOf = (namedEffect: Record<string, unknown>) =>
  byName(
    PanScroll.style(scrollOptions({ type: 'PanScroll', ...namedEffect }), true),
    'motion-trans-rot',
  ).custom!;

describe('PanScroll', () => {
  test('moves between offscreen positions by default', () => {
    const { travel, toTravel } = getOffscreenTravels('left');
    const custom = panOf({ direction: 'left' });
    expect(custom['--motion-trans-rot-travel']).toBe(travel);
    expect(custom['--motion-trans-rot-to-travel']).toBe(toTravel);
  });

  test('moves by distance when not starting offscreen', () => {
    expect(panOf({ startFromOffScreen: false })['--motion-trans-rot-travel']).toBe('400px');
    expect(panOf({ startFromOffScreen: false, distance: '20%' })['--motion-trans-rot-travel']).toBe(
      '20%',
    );
  });

  test('prepare measures only when starting offscreen', () => {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => ({ left: 50, top: 0 }) as DOMRect;
    PanScroll.prepare(
      scrollOptions({ type: 'PanScroll', startFromOffScreen: false }),
      fakeDom(element),
    );
    expect(element.style.getPropertyValue('--motion-left')).toBe('');
    PanScroll.prepare(scrollOptions({ type: 'PanScroll' }), fakeDom(element));
    expect(element.style.getPropertyValue('--motion-left')).toBe('50px');
  });
});
