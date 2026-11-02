import { describe, expect, test } from 'vitest';
import * as ParallaxScroll from '../ParallaxScroll';
import { resolveDefaults } from '../../../test/resolveDefaults';
import { scrollOptions } from './testUtils';

describe('ParallaxScroll', () => {
  test('is always continuous', () => {
    const options = scrollOptions({ type: 'ParallaxScroll', range: 'in' });
    const [parallax] = resolveDefaults(
      ParallaxScroll.style(options, true),
      ParallaxScroll.style(options),
    ) as any[];
    expect(parallax.fill).toBe('both');
    expect(parallax.custom['--motion-trans-rot-to']).toBe(1);
  });

  test('passes center and speed to the parallax', () => {
    const [parallax] = ParallaxScroll.style(
      scrollOptions({ type: 'ParallaxScroll', center: 0.2, speed: 0.5 }),
    ) as any[];
    expect(parallax.custom['--motion-trans-rot-parallax-center']).toBe(0.2);
    expect(parallax.custom['--motion-trans-rot-parallax-inv-speed']).toBe(2);
  });
});
