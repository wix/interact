import { test, expect } from '@playwright/test';
import type { InteractConfig, Effect } from '@wix/interact/web';
import { FixturePage } from '../pages/fixture-page';
import type { Mode } from '../pages/fixture-page';

const WIDE = 800;
const NARROW = 500;

const conditions: InteractConfig['conditions'] = {
  narrow: { type: 'media', predicate: '(max-width: 600px)' },
  on: { type: 'selector', predicate: '.on' },
};

const TARGET = `<interact-element data-interact-key="a"><div id="a"></div></interact-element>`;

const kf = (effectId: string, extra: Partial<Effect> = {}): Effect =>
  ({
    effectId,
    duration: 100000,
    fill: 'both',
    keyframeEffect: { name: effectId, keyframes: [{ opacity: 0.5 }, { opacity: 0.5 }] },
    ...extra,
  }) as Effect;

const tr = (effectId: string, color: string, extra: Partial<Effect> = {}): Effect =>
  ({
    effectId,
    transition: { duration: 0, styleProperties: [{ name: 'backgroundColor', value: color }] },
    ...extra,
  }) as Effect;

const click = (
  effects: Effect[],
  sequences?: InteractConfig['interactions'][number]['sequences'],
) => ({
  conditions,
  interactions: [{ key: 'a', trigger: 'click' as const, effects, sequences }],
});

const sorted = (lists: string[][]) => lists.map((list) => [...list].sort());

for (const mode of ['css', 'runtime'] as Mode[]) {
  test.describe(`cascade of effects on a target (${mode})`, () => {
    let fixture: FixturePage;

    test.beforeEach(async ({ page }) => {
      fixture = new FixturePage(page, mode);
    });

    // the generated CSS shows a transition's state when its effect is toggled on the source
    const activate = async (effectId: string) => {
      if (mode === 'css') {
        await fixture.page.evaluate(
          (effectId) =>
            document
              .querySelector('interact-element')!
              .setAttribute('data-interact-effect', effectId),
          effectId,
        );
      } else {
        await fixture.click('#a');
      }
    };
    const play = async () => {
      if (mode === 'runtime') {
        await fixture.click('#a');
      }
    };

    for (const [width, expected] of [
      [WIDE, ['e0']],
      [NARROW, ['e1']],
    ] as const) {
      test(`the last effect whose media conditions hold wins @${width}`, async () => {
        await fixture.mount(click([kf('e0'), kf('e1', { conditions: ['narrow'] })]), TARGET, width);
        await play();
        expect(await fixture.animations('#a')).toEqual([expected]);
      });
    }

    test('switches the winning effect when its media conditions change', async () => {
      await fixture.mount(click([kf('e0'), kf('e1', { conditions: ['narrow'] })]), TARGET, WIDE);
      await fixture.resize(NARROW);
      await play();
      expect(await fixture.animations('#a')).toEqual([['e1']]);
    });

    for (const [width, animations, color] of [
      [WIDE, ['e0'], 'rgba(0, 0, 0, 0)'],
      [NARROW, [], 'rgb(255, 0, 0)'],
    ] as const) {
      test(`an animation and a transition override each other @${width}`, async () => {
        await fixture.mount(
          click([kf('e0'), tr('t1', 'red', { conditions: ['narrow'] })]),
          TARGET,
          width,
        );
        await activate('t1');
        expect(await fixture.animations('#a')).toEqual([animations]);
        expect(await fixture.style('#a', 'background-color')).toBe(color);
      });
    }

    for (const [width, effectId, color] of [
      [WIDE, 't0', 'rgb(255, 0, 0)'],
      [NARROW, 't1', 'rgb(0, 0, 255)'],
    ] as const) {
      test(`transitions override each other @${width}`, async () => {
        await fixture.mount(
          click([tr('t0', 'red'), tr('t1', 'blue', { conditions: ['narrow'] })]),
          TARGET,
          width,
        );
        await activate(effectId);
        expect(await fixture.style('#a', 'background-color')).toBe(color);
      });
    }

    test('a selector condition filters the elements of the winning effect, without falling back', async () => {
      await fixture.mount(
        click([kf('e0', { selector: '.x' }), kf('e1', { selector: '.x', conditions: ['on'] })]),
        `<interact-element data-interact-key="a"><div id="a"><p class="x on"></p><p class="x"></p></div></interact-element>`,
        WIDE,
      );
      await play();
      expect(await fixture.animations('.x')).toEqual([['e1'], []]);
    });

    test("a sequence plays with the interaction's effects", async () => {
      await fixture.mount(click([kf('e0')], [{ effects: [kf('s0')] }]), TARGET, WIDE);
      await play();
      expect(sorted(await fixture.animations('#a'))).toEqual([['e0', 's0']]);
    });

    for (const [width, expected] of [
      [WIDE, ['s0']],
      [NARROW, ['s0', 's1']],
    ] as const) {
      test(`sequences play with each other @${width}`, async () => {
        await fixture.mount(
          click([], [{ effects: [kf('s0')] }, { conditions: ['narrow'], effects: [kf('s1')] }]),
          TARGET,
          width,
        );
        await play();
        expect(sorted(await fixture.animations('#a'))).toEqual([expected]);
      });
    }

    for (const [width, expected] of [
      [WIDE, ['e0']],
      [NARROW, []],
    ] as const) {
      test(`an effect CSS cannot animate still overrides the others @${width}`, async ({
        page,
      }) => {
        await fixture.mount(
          {
            conditions,
            interactions: [
              {
                key: 'a',
                trigger: 'pointerMove',
                effects: [
                  { effectId: 'e0', keyframeEffect: { name: 'e0', keyframes: [{ opacity: 0.5 }] } },
                  {
                    effectId: 'tilt',
                    namedEffect: { type: 'Tilt3DMouse' },
                    conditions: ['narrow'],
                  },
                ] as Effect[],
              },
            ],
          },
          TARGET,
          width,
        );
        if (mode === 'runtime') {
          await page.mouse.move(10, 10);
          await page.mouse.move(60, 30, { steps: 5 });
          await page.waitForTimeout(100);
        }
        expect(await fixture.animations('#a')).toEqual([expected]);
      });
    }

    for (const [width, clip, wrapper, transZ] of [
      [
        WIDE,
        { css: ['motion-bgCloseUpOpacity'], runtime: ['closeUp'] },
        { css: ['motion-bgCloseUpZoom'], runtime: ['closeUp'] },
        '80px',
      ],
      [NARROW, { css: [], runtime: [] }, { css: ['motion-bgParallax'], runtime: ['parallax'] }, ''],
    ] as const) {
      test(`all parts of an overridden effect stop @${width}`, async ({ page }) => {
        test.skip(
          mode === 'css' &&
            !(await page.evaluate(() => CSS.supports('animation-timeline', 'view()'))),
          'scroll-driven CSS animations are not supported',
        );
        await fixture.mount(
          {
            conditions,
            interactions: [
              {
                key: 'a',
                trigger: 'viewProgress',
                effects: [
                  { effectId: 'closeUp', namedEffect: { type: 'BgCloseUp' } },
                  {
                    effectId: 'parallax',
                    namedEffect: { type: 'BgParallax' },
                    conditions: ['narrow'],
                  },
                ] as Effect[],
              },
            ],
          },
          `<interact-element data-interact-key="a"><section id="a"><div data-motion-part="MEDIA_CLIP"><div data-motion-part="MEDIA_WRAPPER"></div></div></section></interact-element>`,
          width,
        );
        expect(await fixture.animations('[data-motion-part="MEDIA_CLIP"]')).toEqual([clip[mode]]);
        expect(await fixture.animations('[data-motion-part="MEDIA_WRAPPER"]')).toEqual([
          wrapper[mode],
        ]);
        if (mode === 'css') {
          expect(
            await fixture.style('[data-motion-part="MEDIA_WRAPPER"]', '--motion-trans-z'),
          ).toBe(transZ);
        }
      });
    }
  });
}
