import { test, expect } from '@playwright/test';
import type { Effect } from '@wix/interact/web';
import { FixturePage } from '../pages/fixture-page';
import type { Mode } from '../pages/fixture-page';
import { WIDE, NARROW, conditions, TARGET, kf, click } from '../utils/config';

const PARTS = `<interact-element data-interact-key="a"><section id="a"><div data-motion-part="MEDIA_CLIP"><div data-motion-part="MEDIA_WRAPPER"></div></div></section></interact-element>`;

for (const mode of ['css', 'runtime'] as Mode[]) {
  test.describe(`static styles of effects (${mode})`, () => {
    let fixture: FixturePage;

    test.beforeEach(async ({ page }) => {
      fixture = new FixturePage(page, mode);
    });

    const outlines = click([
      kf('e0', { style: { outlineStyle: 'dashed' } }),
      kf('e1', { conditions: ['narrow'], style: { outlineStyle: 'dotted' } }),
    ]);

    for (const [width, outline] of [
      [WIDE, 'dashed'],
      [NARROW, 'dotted'],
    ] as const) {
      test(`applies the style of the active effect to its target @${width}`, async () => {
        await fixture.mount(outlines, TARGET, width);
        expect(await fixture.style('#a', 'outline-style')).toBe(outline);
      });
    }

    test('switches the style when the active effect changes', async () => {
      await fixture.mount(outlines, TARGET, WIDE);
      await fixture.resize(NARROW);
      expect(await fixture.style('#a', 'outline-style')).toBe('dotted');
      await fixture.resize(WIDE);
      expect(await fixture.style('#a', 'outline-style')).toBe('dashed');
    });

    test('removes the style of an overridden effect', async () => {
      await fixture.mount(
        click([
          kf('e0', { style: { outlineStyle: 'dashed' } }),
          kf('e1', { conditions: ['narrow'] }),
        ]),
        TARGET,
        NARROW,
      );
      expect(await fixture.style('#a', 'outline-style')).toBe('none');
    });

    test('applies the style only to the elements matching its selector condition', async () => {
      await fixture.mount(
        click([
          kf('e0', { selector: '.x', conditions: ['on'], style: { outlineStyle: 'dashed' } }),
        ]),
        `<interact-element data-interact-key="a"><div id="a"><p class="x on"></p><p class="x"></p></div></interact-element>`,
        WIDE,
      );
      expect(await fixture.style('.x.on', 'outline-style')).toBe('dashed');
      expect(await fixture.style('.x:not(.on)', 'outline-style')).toBe('none');
    });

    for (const [width, clip, wrapper, target] of [
      [WIDE, 'clip', 'dashed', 'double'],
      [NARROW, 'visible', 'none', 'none'],
    ] as const) {
      test(`applies the styles of a preset to its parts while it's active @${width}`, async () => {
        await fixture.mount(
          {
            conditions,
            interactions: [
              {
                key: 'a',
                trigger: 'viewProgress',
                effects: [
                  {
                    effectId: 'static',
                    namedEffect: { type: 'StaticParts' },
                    style: { outlineStyle: 'double' },
                  },
                  {
                    effectId: 'parallax',
                    namedEffect: { type: 'BgParallax' },
                    conditions: ['narrow'],
                  },
                ] as Effect[],
              },
            ],
          },
          PARTS,
          width,
        );
        expect(await fixture.style('[data-motion-part="MEDIA_CLIP"]', 'overflow')).toBe(clip);
        expect(await fixture.style('[data-motion-part="MEDIA_CLIP"]', 'outline-style')).toBe(
          'none',
        );
        expect(await fixture.style('[data-motion-part="MEDIA_WRAPPER"]', 'outline-style')).toBe(
          wrapper,
        );
        expect(await fixture.style('#a', 'outline-style')).toBe(target);
      });
    }
  });
}
