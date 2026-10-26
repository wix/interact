import { test, expect } from '@playwright/test';
import type { Effect, InteractConfig } from '@wix/interact/web';
import { FixturePage } from '../pages/fixture-page';
import type { Mode } from '../pages/fixture-page';
import { WIDE, NARROW, conditions } from '../utils/config';

const VIEWPORT_HEIGHT = 600;

const BACKGROUND = `<div style="height: 150vh"></div>
<interact-element data-interact-key="a">
  <section id="a" style="position: relative; width: 400px; height: 300px">
    <div data-motion-part="MEDIA_CLIP" style="position: absolute; inset: 0">
      <div data-motion-part="MEDIA_WRAPPER"><div data-motion-part="MEDIA"></div></div>
    </div>
  </section>
</interact-element>
<div style="height: 150vh"></div>`;

const background = (effects: Effect[]): InteractConfig => ({
  conditions,
  interactions: [{ key: 'a', trigger: 'viewProgress', effects }],
});

const PARTS = ['MEDIA_CLIP', 'MEDIA_WRAPPER', 'MEDIA'] as const;
type Rect = { top: number; left: number; width: number; height: number };

for (const mode of ['css', 'runtime'] as Mode[]) {
  test.describe(`background scroll styles (${mode})`, () => {
    let fixture: FixturePage;

    test.beforeEach(async ({ page }) => {
      fixture = new FixturePage(page, mode);
    });

    // scrolls the section's top to the given offset in the viewport, and measures its parts
    const rectsAt = async (sectionTop: number) =>
      fixture.page.evaluate(
        ([sectionTop, parts]) => {
          const section = document.getElementById('a')!;
          window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY - sectionTop);
          return Object.fromEntries(
            parts.map((part) => {
              const { top, left, width, height } = document
                .querySelector(`[data-motion-part="${part}"]`)!
                .getBoundingClientRect();
              return [part, { top, left, width, height }];
            }),
          ) as Record<(typeof PARTS)[number], Rect>;
        },
        [sectionTop, PARTS] as const,
      );

    test('keeps the media of BgReveal fixed to the viewport while scrolling its section', async () => {
      await fixture.mount(
        background([{ namedEffect: { type: 'BgReveal' } } as Effect]),
        BACKGROUND,
        WIDE,
      );

      for (const sectionTop of [400, 150, -200]) {
        const { MEDIA } = await rectsAt(sectionTop);
        expect(MEDIA.top).toBeCloseTo(0, 0);
        expect(MEDIA.height).toBeCloseTo(VIEWPORT_HEIGHT, 0);
      }
      expect(await fixture.style('[data-motion-part="MEDIA_CLIP"]', 'overflow')).toBe('clip');
    });

    test('stops keeping the media fixed when another effect overrides BgReveal', async () => {
      await fixture.mount(
        background([
          { namedEffect: { type: 'BgReveal' } },
          { namedEffect: { type: 'BgPan' }, conditions: ['narrow'] },
        ] as Effect[]),
        BACKGROUND,
        NARROW,
      );

      expect(await fixture.style('[data-motion-part="MEDIA"]', 'position')).toBe('static');
      expect(await fixture.style('[data-motion-part="MEDIA_WRAPPER"]', 'width')).toBe('480px');
    });

    test('heightens the media of ImageParallax by its speed', async () => {
      await fixture.mount(
        background([{ namedEffect: { type: 'ImageParallax', speed: 2 } } as Effect]),
        BACKGROUND,
        WIDE,
      );

      const { MEDIA_CLIP, MEDIA_WRAPPER, MEDIA } = await rectsAt(100);
      expect(MEDIA_WRAPPER.height).toBeCloseTo(2 * MEDIA_CLIP.height, 0);
      expect(MEDIA).toEqual(MEDIA_WRAPPER);
    });

    test('widens the media of BgPan by its speed, centered on its layer', async () => {
      await fixture.mount(
        background([{ namedEffect: { type: 'BgPan', speed: 0.5 } } as Effect]),
        BACKGROUND,
        WIDE,
      );

      const { MEDIA_CLIP, MEDIA_WRAPPER } = await rectsAt(100);
      expect(MEDIA_WRAPPER.width).toBeCloseTo(1.5 * MEDIA_CLIP.width, 0);
      expect(MEDIA_WRAPPER.left).toBeCloseTo(MEDIA_CLIP.left - 0.25 * MEDIA_CLIP.width, 0);
    });

    test('sizes the media of BgRotate to cover its rotated layer, centered on it', async () => {
      await fixture.mount(
        background([{ namedEffect: { type: 'BgRotate', angle: 45 } } as Effect]),
        BACKGROUND,
        WIDE,
      );

      const { MEDIA_CLIP } = await rectsAt(100);
      // the wrapper is rotated, so its size is measured without its transform
      const size = await fixture.page.evaluate(() => {
        const wrapper = document.querySelector<HTMLElement>('[data-motion-part="MEDIA_WRAPPER"]')!;
        return { width: wrapper.offsetWidth, height: wrapper.offsetHeight };
      });
      const side = Math.SQRT1_2 * (MEDIA_CLIP.width + MEDIA_CLIP.height);
      expect(size.width).toBeCloseTo(side, 0);
      expect(size.height).toBeCloseTo(side, 0);

      const { MEDIA_WRAPPER } = await rectsAt(100);
      expect(MEDIA_WRAPPER.left + MEDIA_WRAPPER.width / 2).toBeCloseTo(
        MEDIA_CLIP.left + MEDIA_CLIP.width / 2,
        0,
      );
      expect(MEDIA_WRAPPER.top + MEDIA_WRAPPER.height / 2).toBeCloseTo(
        MEDIA_CLIP.top + MEDIA_CLIP.height / 2,
        0,
      );
    });
  });
}
