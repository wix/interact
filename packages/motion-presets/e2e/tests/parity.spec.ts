import { test, expect } from '@playwright/test';

// off-screen travel: WAAPI measures the distance to leave the viewport or container, CSS uses viewport-sized
// fallbacks around the measured position, so the two paths travel different distances (known, see #330)
const OFF_SCREEN = ['Cross', 'PanScroll', 'SkewPanScroll', 'TurnScroll'];

const VARIANTS = [
  {},
  { scroll: { range: 'out' } },
  { scroll: { range: 'continuous' } },
  { ongoing: { iterationDelay: 500 } },
];

test.describe('WAAPI and CSS parity', () => {
  for (const variant of VARIANTS) {
    test(`every preset looks the same on both paths ${JSON.stringify(variant)}`, async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForFunction(() => 'harness' in window);
      const results = await page.evaluate(
        (variant) => (window as any).harness.parity(variant),
        variant,
      );

      const names = results.map(({ name }: { name: string }) => name);
      expect(names.length).toBeGreaterThan(0);
      if (!('scroll' in variant || 'ongoing' in variant)) {
        expect(names).toEqual(expect.arrayContaining(OFF_SCREEN));
      }
      const different = results.filter(
        ({ name, difference }: { name: string; difference: number }) =>
          difference > 0.5 && !OFF_SCREEN.includes(name),
      );
      expect(different).toEqual([]);
    });
  }
});
