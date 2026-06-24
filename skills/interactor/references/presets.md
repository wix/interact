# Preset catalog (@wix/motion-presets)

The 62 production presets, by category, with parameters and defaults — plus an
accessibility risk guide and an "atmosphere → preset" selection map. A preset is
referenced as `namedEffect: { type: 'Name', ...params }`. The `type` string must
exactly match a name below (PascalCase). Register presets before use:

```ts
// Preferred in bundled apps (Vite/Webpack/Next): import only the presets you use,
// so the bundler tree-shakes the rest out.
import { FadeIn, ParallaxScroll, Tilt3DMouse } from '@wix/motion-presets';
Interact.registerEffects({ FadeIn, ParallaxScroll, Tilt3DMouse });

// Convenient for quick-start / CDN / when you use many presets (no tree-shaking benefit there):
import * as presets from '@wix/motion-presets';
Interact.registerEffects(presets);
```

Default to the selective form in bundled apps; reach for `import *` only for
CDN/quick-start or when you genuinely use most of the catalog.

## Two parameter layers (don't confuse them)

- **Animation options** go on the **effect** (outside `namedEffect`): `duration`, `delay`, `easing`, `iterations`, `alternate`, `fill`, `reversed`; for scroll add `rangeStart`/`rangeEnd`, `transition*`.
- **Preset parameters** go **inside `namedEffect`**: the per-preset knobs below (`direction`, `distance`, `blur`, `intensity`, …).

**If you don't know a param's name/type, omit it — defaults apply.** Guessing
produces silently-wrong output. Never invent a `type`.

## Hard exclusions

- **Never emit `DVD`** — it exists in the TypeScript types but is *not* registered, so it warns and no-ops at runtime.
- **Never emit `Bg*` or `ImageParallax`** (the "background-scroll" category: `BgCloseUp`, `BgFade`, `BgFadeBack`, `BgFake3D`, `BgPan`, `BgParallax`, `BgPullBack`, `BgReveal`, `BgRotate`, `BgSkew`, `BgZoom`, `ImageParallax`). They are **experimental, not production-ready** — the source and docs explicitly forbid using them, even though they're importable. For a background-parallax look, use the public **`ParallaxScroll`** on the image element with `viewProgress`.

## Conventions

- **Suffix encodes category:** `…In` = entrance, `…Scroll` = scroll, `…Mouse` = mouse, **no suffix** = ongoing.
- **`direction` is overloaded** — the accepted set depends on the preset (cardinal `top/right/bottom/left`, `+center`, two-sided `left/right`, corners, 8-way, 9-way, axis `horizontal/vertical`, rotation `clockwise/counter-clockwise`, or a `0–360` number). Use the value set listed per preset.
- **Angle convention** (numeric directions/angles): `0° = right`, increasing **counter-clockwise** → `90° = top`, `180° = left`, `270° = bottom`.
- **Distances** use `{ value, unit }` with unit ∈ `px | em | rem | vh | vw | vmin | vmax | percentage`. Strings like `'120px'` also parse, but be consistent — don't mix forms in one config.

---

## Entrance (19) — for `viewEnter` (time-based)

`triggerType: 'once'` for the classic entrance. Default easing is per-preset.

| Preset | Params (default) | Look |
| :-- | :-- | :-- |
| `FadeIn` | — | transparent → opaque |
| `GlideIn` | `direction` 0–360 \| cardinal (`180`/left), `distance` (`{100,'percentage'}`) | glides in from off-screen |
| `SlideIn` | `direction` cardinal (`'left'`), `initialTranslate` 0–1 (`1`) | slides in behind a clip mask |
| `FloatIn` | `direction` cardinal (`'left'`) | gentle drift + fade |
| `RevealIn` | `direction` cardinal (`'left'`) | clip-path reveal from an edge |
| `ExpandIn` | `initialScale` (`0`), `direction` number\|cardinal (`90`), `distance` (`{120,'percentage'}`) | expands from a point + fade |
| `BlurIn` | `blur` px (`6`) | blurred → sharp + fade |
| `FlipIn` | `direction` cardinal (`'top'`), `initialRotate` deg (`90`), `perspective` (`800`) | 3D flip into place |
| `ArcIn` | `direction` cardinal (`'right'`), `depth` (`{200,'px'}`), `perspective` (`800`) | swings in along a 3D arc |
| `ShuttersIn` | `direction` cardinal (`'right'`), `shutters` (`12`), `staggered` (`true`) | shutter strips open |
| `CurveIn` | `direction` `left\|right\|pseudoLeft\|pseudoRight` (`'right'`), `depth` (`{300,'px'}`), `perspective` (`200`) | 180° swing arc |
| `DropIn` | `initialScale` (`1.6`) | shrinks from larger to natural size |
| `FoldIn` | `direction` cardinal (`'top'`), `initialRotate` deg (`90`), `perspective` (`800`) | unfolds at a hinged edge |
| `ShapeIn` | `shape` `circle\|ellipse\|rectangle\|diamond\|window` (`'rectangle'`) | expanding clip-path shape |
| `TiltIn` | `direction` `left\|right` (`'left'`), `depth` (`{200,'px'}`), `perspective` (`800`) | 3D tilt + clip reveal |
| `WinkIn` | `direction` `horizontal\|vertical` (`'horizontal'`) | expands from the center axis |
| `SpinIn` | `spins` (`0.5`), `direction` `clockwise\|counter-clockwise` (`'clockwise'`), `initialScale` (`0`) | spins + scales in |
| `TurnIn` | `direction` corner (`'top-left'`) | rotates around a corner pivot |
| `BounceIn` | `direction` cardinal\|`center` (`'bottom'`), `distanceFactor` (`1`), `perspective` (`800`) | elastic bounce in |

---

## Scroll (19) — for `viewProgress` (ViewTimeline)

**All share `range: 'in' | 'out' | 'continuous'`** (in = animate in on enter, out =
animate out on exit, continuous = pass through idle across the full range; prefer
`'continuous'`) — **except `ParallaxScroll`**. Use `fill: 'both'`.

> **Two different "range"s — don't confuse them.** The `range` above is a **preset
> option** that lives *inside* `namedEffect` (e.g. `namedEffect: { type: 'FadeScroll',
> range: 'continuous' }`). It is unrelated to the effect-level **`rangeStart`/
> `rangeEnd`** (the ViewTimeline scroll *window*, a `RangeOffset` — see
> `config-schema.md`). Every `viewProgress` effect — including `ParallaxScroll` —
> still takes `rangeStart`/`rangeEnd` to define its scroll window; `ParallaxScroll`
> just doesn't accept the `range` *option* (it uses `parallaxFactor`).

| Preset | Params (default) |
| :-- | :-- |
| `FadeScroll` | `opacity` (`0`), `range` (`'in'`) |
| `RevealScroll` | `direction` cardinal (`'bottom'`), `range` (`'in'`) |
| `ParallaxScroll` | `parallaxFactor` (`0.5`) — **no `range`** |
| `MoveScroll` | `angle` deg (`120`), `distance` (`{400,'px'}`), `range` (`'in'`) |
| `SlideScroll` | `direction` cardinal (`'bottom'`), `range` (`'in'`) |
| `GrowScroll` | `direction` 9-way (`'center'`), `scale` (`0` in / `4` out), `speed` (`0`), `range` (`'in'`) |
| `ShrinkScroll` | `direction` 9-way (`'center'`), `scale` (`1.2` in / `0.8` out), `speed` (`0`), `range` (`'in'`) |
| `TiltScroll` | `direction` `left\|right` (`'right'`), `parallaxFactor` (`0`), `perspective` (`400`), `range` (`'in'`) |
| `PanScroll` | `direction` `left\|right` (`'left'`), `distance` (`{400,'px'}`), `startFromOffScreen` (`true`), `range` (`'in'`) |
| `BlurScroll` | `blur` (`6`), `range` (`'in'`) |
| `FlipScroll` | `direction` `vertical\|horizontal` (`'horizontal'`), `rotate` deg (`240`), `perspective` (`800`), `range` (`'continuous'`) |
| `SpinScroll` | `direction` `clockwise\|counter-clockwise` (`'clockwise'`), `spins` (`0.15`), `scale` (`1`), `range` (`'in'`) |
| `ArcScroll` | `direction` `vertical\|horizontal` (`'horizontal'`), `perspective` (`500`), `range` (`'in'`) |
| `ShapeScroll` | `shape` (`'circle'`), `intensity` (`0.5`), `range` (`'in'`) |
| `ShuttersScroll` | `direction` cardinal (`'right'`), `shutters` (`12`), `staggered` (`true`), `range` (`'in'`) |
| `SkewPanScroll` | `direction` `left\|right` (`'right'`), `skew` deg (`10`), `range` (`'in'`) |
| `Spin3dScroll` | `rotate` deg (`-100`), `speed` (`0`), `perspective` (`1000`), `range` (`'in'`) |
| `StretchScroll` | `stretch` (`0.6`), `range` (`'out'`) |
| `TurnScroll` | `direction` `left\|right` (`'right'`), `spin` `clockwise\|counter-clockwise` (`'clockwise'`), `scale` (`1`), `range` (`'in'`) |

---

## Ongoing (13) — continuous loops, any trigger

Run with `iterations: Infinity` (or large) for a perpetual loop, or attach to a
trigger. **All accept `iterationDelay`** (ms, default `0`) inside `namedEffect` — an
idle pause appended after each cycle.

| Preset | Params (default) |
| :-- | :-- |
| `Pulse` | `intensity` 0–1 (`0`) |
| `Spin` | `direction` `clockwise\|counter-clockwise` (`'clockwise'`) |
| `Breathe` | `direction` `vertical\|horizontal\|center` (`'vertical'`), `distance` (`{25,'px'}`), `perspective` (`800`) |
| `Bounce` | `intensity` 0–1 (`0`) |
| `Wiggle` | `intensity` 0–1 (`0.5`) |
| `Flash` | — (only `iterationDelay`) |
| `Flip` | `direction` `vertical\|horizontal` (`'horizontal'`), `perspective` (`800`) |
| `Fold` | `direction` cardinal (`'top'`), `angle` deg (`15`) |
| `Jello` | `intensity` 0–1 (`0.25`) |
| `Poke` | `direction` cardinal (`'right'`), `intensity` 0–1 (`0.5`) |
| `Rubber` | `intensity` 0–1 (`0.5`) |
| `Swing` | `direction` cardinal pivot (`'top'`), `swing` deg (`20`) |
| `Cross` | `direction` 8-way (`'right'`) |

---

## Mouse (11) — for `pointerMove`

Cursor-position-driven transforms (`x:0.5, y:0.5` = center). **All share `inverted`
boolean (`false`)**; where present, `axis` ∈ `both | horizontal | vertical`
(default `'both'`). Use a scrub effect with `rangeStart`/`rangeEnd` and `fill:
'both'`; gate with a `(hover: hover)` condition.

| Preset | Params (default) |
| :-- | :-- |
| `TrackMouse` | `distance` (`{200,'px'}`), `axis` (`'both'`) — element follows the cursor |
| `Tilt3DMouse` | `angle` deg (`5`), `perspective` (`800`) — 3D tilt toward cursor |
| `Track3DMouse` | `distance` (`{200,'px'}`), `angle` deg (`5`), `perspective` (`800`), `axis` (`'both'`) |
| `SwivelMouse` | `angle` deg (`5`), `perspective` (`800`), `pivotAxis` (`'center-horizontal'`) |
| `AiryMouse` | `distance` (`{200,'px'}`), `angle` deg (`30`), `axis` (`'both'`) |
| `ScaleMouse` | `distance` (`{80,'px'}`), `scale` (`1.4`), `axis` (`'both'`) |
| `BlurMouse` | `distance` (`{80,'px'}`), `angle` deg (`5`), `scale` (`0.3`), `blur` px (`20`), `perspective` (`600`) |
| `SkewMouse` | `distance` (`{200,'px'}`), `angle` deg (`25`), `axis` (`'both'`) |
| `BlobMouse` | `distance` (`{200,'px'}`), `scale` (`1.4`) |
| `BounceMouse` | `distance` (`{80,'px'}`), `axis` (`'both'`) — elastic follow |
| `SpinMouse` | `axis` (`'both'`) |

> Advanced: `CustomMouse` is a 12th mouse export — a programmatic escape hatch that
> needs a `customEffect(target, progress)` callback you supply. Not config-only; use
> only when no preset fits.

---

## Choosing a preset — atmosphere guide

When the user describes a *feel* rather than a named effect, map it:

| Atmosphere | Entrance | Scroll | Ongoing |
| :-- | :-- | :-- | :-- |
| Playful / energetic | `BounceIn`, `SpinIn` | `SpinScroll`, `GrowScroll` | `Bounce`, `Jello`, `Wiggle` |
| Elegant / refined | `FadeIn`, `FloatIn`, `RevealIn` | `FadeScroll`, `RevealScroll` | `Breathe`, `Pulse` (subtle) |
| Bold / dramatic | `FlipIn`, `ArcIn`, `CurveIn` | `FlipScroll`, `ArcScroll`, `Spin3dScroll` | `Flip`, `Swing` |
| Soft / calm | `FadeIn`, `BlurIn`, `FloatIn` | `BlurScroll`, `FadeScroll` | `Breathe` |
| Modern / clean | `SlideIn`, `GlideIn` | `SlideScroll`, `MoveScroll`, `ParallaxScroll` | `Pulse` |
| Creative / unexpected | `ShuttersIn`, `ShapeIn`, `WinkIn`, `TurnIn` | `ShuttersScroll`, `ShapeScroll`, `SkewPanScroll` | `Cross`, `Fold` |

"Give me the scroll version of X" — same root name with the `Scroll` suffix where
one exists (`FadeIn`↔`FadeScroll`, `SlideIn`↔`SlideScroll`, `RevealIn`↔`RevealScroll`,
`FlipIn`↔`FlipScroll`, `SpinIn`↔`SpinScroll`, `ArcIn`↔`ArcScroll`, `ShapeIn`↔`ShapeScroll`,
`ShuttersIn`↔`ShuttersScroll`).

---

## Accessibility & reduced motion

Motion is a host responsibility: gate risky effects with a
`(prefers-reduced-motion: reduce)` condition and swap to a calmer effect (conditions
re-evaluate when the preference changes). Apply constraints **only when the user
asks** for "accessible" / "reduced-motion safe" / "subtle" / "tone it down" — don't
limit creativity by default.

- **High-risk** (spin/bounce/flash/3D/large parallax): `SpinIn`, `Spin`, `SpinScroll`, `Spin3dScroll`, `BounceIn`, `Bounce`, `ArcIn`, `ArcScroll`, `FlipIn`, `FlipScroll`, `Tilt3DMouse`, `Flash`, `Jello`, `Wiggle`.
- **Safe**: `FadeIn`, `FadeScroll`, `BlurIn`, `BlurScroll`, `Pulse` (subtle), `Breathe`, `SlideIn`/`GlideIn` (subtle).
- **Reduced-motion fallbacks:** `BounceIn`/`SpinIn`/`ArcIn`/`FlipIn`/`TurnIn` → `FadeIn`; `Spin`/`Bounce`/`Wiggle` → stop or subtle `Pulse`; `Flash` → reduce to <3/sec; `ParallaxScroll` → static; `*Scroll` → `FadeScroll` or disable; mouse presets → static state.

Reduced-motion pattern with conditions:

```ts
{ interactions: [
    { key: 'hero', trigger: 'viewEnter', conditions: ['ok'],  effects: [{ effectId: 'spin-in' }] },
    { key: 'hero', trigger: 'viewEnter', conditions: ['rm'],  effects: [{ effectId: 'fade-in' }] },
  ],
  effects: {
    'spin-in': { duration: 800, namedEffect: { type: 'SpinIn' }, triggerType: 'once' },
    'fade-in': { duration: 400, namedEffect: { type: 'FadeIn' }, triggerType: 'once' },
  },
  conditions: { ok: { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
                rm: { type: 'media', predicate: '(prefers-reduced-motion: reduce)' } } }
```

## Duration guidance

Functional UI feedback < 500ms · decorative entrances up to ~1200ms · hero / showcase
moments up to ~2000ms. Don't combine two presets that touch the same CSS property
(e.g. two `transform` effects) on one element — prefer nested wrapper elements, and
remember later effects override earlier on shared properties.

## Placement rules

- Don't put entrance presets (anything starting at opacity 0) on first-fold `<h1>` / above-the-fold hero text — it's invisible on load.
- No scroll-in animations in the first fold (nothing has scrolled yet) and no scroll-out animations in the last fold (can't scroll past).
