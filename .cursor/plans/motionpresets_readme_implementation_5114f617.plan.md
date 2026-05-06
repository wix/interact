---
name: MotionPresets README Implementation
overview: Create a new README.md for the @wix/motion-presets package, positioned as a catalog gateway that summarizes all 73 presets across 5 categories, shows registration and usage patterns with both @wix/motion and @wix/interact, and links to detailed reference docs and agent rules.
todos:
  - id: write-readme
    content: Write the new packages/motion-presets/README.md following the 13-section structure above
    status: pending
  - id: verify-examples
    content: Verify code examples compile against actual API signatures (registerEffects from @wix/motion, namedEffect shape, getScrubScene trigger options)
    status: pending
  - id: verify-preset-counts
    content: Cross-check final preset name lists in the README against src/library/*/index.ts barrel files to ensure accuracy
    status: pending
isProject: false
---

# MotionPresets README Implementation Plan

## Context

[`packages/motion-presets/`](packages/motion-presets/) has no `README.md`. Both research specs ([readme-spec-1.md](readme-spec-1.md), [readme-spec-2.md](readme-spec-2.md)) call for creating one, positioning it as a **catalog gateway** -- the entry point for discovering and using ready-made animation presets.

The package exports **73 presets** across 5 categories (verified from source and rules):

- **Entrance** (19): FadeIn, ArcIn, BlurIn, BounceIn, CurveIn, DropIn, ExpandIn, FlipIn, FloatIn, FoldIn, GlideIn, RevealIn, ShapeIn, ShuttersIn, SlideIn, SpinIn, TiltIn, TurnIn, WinkIn
- **Scroll** (19): ArcScroll, BlurScroll, FadeScroll, FlipScroll, GrowScroll, MoveScroll, PanScroll, ParallaxScroll, RevealScroll, ShapeScroll, ShrinkScroll, ShuttersScroll, SkewPanScroll, SlideScroll, Spin3dScroll, SpinScroll, StretchScroll, TiltScroll, TurnScroll
- **Ongoing** (14): Bounce, Breathe, Cross, DVD, Flash, Flip, Fold, Jello, Poke, Pulse, Rubber, Spin, Swing, Wiggle
- **Mouse** (9): AiryMouse, BlobMouse, BlurMouse, ScaleMouse, SkewMouse, SwivelMouse, Tilt3DMouse, Track3DMouse, TrackMouse
- **Background Scroll** (12): BgCloseUp, BgFade, BgFadeBack, BgFake3D, BgPan, BgParallax, BgPullBack, BgReveal, BgRotate, BgSkew, BgZoom, ImageParallax

Key architectural note: `registerEffects()` lives in **`@wix/motion`**, not this package. This package exports preset modules that you pass _into_ `registerEffects()`.

## Proposed Section Structure

### 1. Title + One-Liner + Badges

```markdown
# @wix/motion-presets

Ready-made animation presets for @wix/motion -- entrance, scroll, pointer, loop, and background effects.
```

Badges: npm version, bundle size, MIT license.

### 2. What's Included (Catalog Overview)

Summary paragraph + category count table. Each category gets a one-line description and a count. This gives immediate scannability.

### 3. Install

```bash
npm install @wix/motion-presets
```

Note the `@wix/motion` peer dependency.

### 4. Quick Start -- Registration

Show the critical first step: importing presets and registering them with `registerEffects()` from `@wix/motion`. Two patterns:

- **Register all** -- import all category exports and register at once
- **Selective registration** -- import only the categories/presets you need (for bundle size)

Based on actual source: `src/index.ts` exports 5 namespace re-exports (`entrance`, `ongoing`, `scroll`, `mouse`, `backgroundScroll`).

### 5. Usage with @wix/interact

Show how presets are consumed via `namedEffect` in an Interact config. One concise example: a `viewEnter` trigger with `FadeIn`.

### 6. Usage with @wix/motion

Show direct usage with `getWebAnimation()` and `getScrubScene()`. Two examples:

- Time-based entrance with `namedEffect`
- Scroll-driven with `namedEffect`

### 7. Preset Categories (5 subsections)

This is the catalog. For each category:

- One-line description of what it does
- How it's triggered / implemented (from [presets-main.md](packages/motion-presets/rules/presets/presets-main.md))
- Full preset list (names only, as a comma-separated line)
- Link to detailed reference docs

Categories: **Entrance**, **Scroll**, **Ongoing**, **Mouse**, **Background Scroll**

Source for preset lists:

- Entrance, Scroll, Ongoing, Mouse: from [`rules/presets/presets-main.md`](packages/motion-presets/rules/presets/presets-main.md)
- Background Scroll: from [`src/library/backgroundScroll/index.ts`](packages/motion-presets/src/library/backgroundScroll/index.ts)

### 8. Choosing a Preset

Brief guidance section:

- "Choose by intent" table mapping intents (reveal, attention, parallax, pointer tracking, background media) to recommended categories and example presets
- Link to the full "Selection by Atmosphere" guide in [`presets-main.md`](packages/motion-presets/rules/presets/presets-main.md)

### 9. Parameter Conventions

Brief section covering:

- `direction` parameter accepts different value sets depending on the preset (cardinal, axis, rotation, angle)
- Distance units: `{ value, type }` object notation
- Link to full parameter standards in `presets-main.md`

### 10. Accessibility

Concise section noting:

- Reduced-motion handling via Interact's `conditions` system
- Preset risk levels (high/medium/low) with examples
- Reduced-motion fallback table (subset)
- Link to full accessibility guidance in `presets-main.md`

### 11. AI / Agent Support

- Link to [`rules/presets/presets-main.md`](packages/motion-presets/rules/presets/presets-main.md) and per-category rule files
- Note: rely on preset defaults when unsure
- Note: presets are JSON-serializable config objects

### 12. Related Packages

- `@wix/motion` -- the animation engine (required peer dependency)
- `@wix/interact` -- declarative interaction layer

### 13. License

MIT (from [`package.json`](packages/motion-presets/package.json)).

## Style Guidelines (from Specs)

- No emoji in headers (spec-2 cross-cutting recommendation #1)
- Clean badges row (spec-2 recommendation #2)
- Concise -- link to docs, don't replicate full API (spec-2 recommendation #6)
- Consistent structure matching the Motion and Interact README templates
- Show, don't tell -- minimal working code examples

## Discrepancy Notes

The existing [`docs/presets/README.md`](packages/motion-presets/docs/presets/README.md) claims "82+ presets", "16 ongoing", and "12 mouse" -- these counts are inaccurate vs. the source and rules. The new README will use verified counts (73 total: 19 entrance + 19 scroll + 14 ongoing + 9 mouse + 12 background-scroll). This discrepancy should be noted but fixing the docs README is out of scope for this task.
