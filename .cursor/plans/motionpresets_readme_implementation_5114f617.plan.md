---
name: MotionPresets README Implementation
overview: Create a new README.md for the @wix/motion-presets package, positioned as a catalog gateway that summarizes all 75 presets across 5 categories, shows registration and usage patterns with both @wix/motion and @wix/interact, and links to detailed reference docs and agent rules.
todos:
  - id: write-readme
    content: Write the new packages/motion-presets/README.md following the 13-section structure above
    status: completed
  - id: verify-examples
    content: Verify code examples compile against actual API signatures (registerEffects from @wix/motion, namedEffect shape, getScrubScene trigger options)
    status: completed
  - id: verify-preset-counts
    content: Cross-check final preset name lists in the README against src/library/*/index.ts barrel files to ensure accuracy
    status: completed
  - id: fix-dvd-export
    content: Fix missing barrel export — add DVD to packages/motion-presets/src/library/ongoing/index.ts (the preset is fully implemented and documented but was accidentally omitted from the barrel)
    status: completed
  - id: phase2-rules-audit
    content: '[Phase 2] After the README is complete, audit rules/presets/ files for any discrepancies surfaced during README preparation and update them to match verified ground truth'
    status: completed
  - id: phase2-mouse-rules
    content: '[Phase 2] Add BounceMouse and SpinMouse entries to mouse-presets.md (currently only 9 of 11 user-facing mouse presets are documented there)'
    status: completed
  - id: phase2-npm-publish
    content: "[Phase 2] Add 'rules' and 'docs' to packages/motion-presets/package.json files array once rule files are verified — consistent with @wix/interact npm publishing pattern"
    status: pending
  - id: phase3-extend-script
    content: '[Phase 3] Extend scripts/generate-llms.mjs to also read packages/motion-presets/rules/presets/ and include those files in both llms.txt and llms-full.txt'
    status: pending
  - id: phase3-docs-section
    content: '[Phase 3] Add presets-main.md under the ## Docs section of llms.txt (below full-lean.md and integration.md)'
    status: pending
  - id: phase3-presets-section
    content: '[Phase 3] Add a new ## Presets section to llms.txt containing the 4 category rule files (entrance, scroll, ongoing, mouse)'
    status: pending
  - id: phase3-verify
    content: '[Phase 3] Re-run scripts/generate-llms.mjs and verify both outputs are correct'
    status: pending
isProject: false
---

# MotionPresets README Implementation Plan

## Context

`[packages/motion-presets/](packages/motion-presets/)` has no `README.md`. Both research specs ([readme-spec-1.md](readme-spec-1.md), [readme-spec-2.md](readme-spec-2.md)) call for creating one, positioning it as a **catalog gateway** -- the entry point for discovering and using ready-made animation presets.

The package exports **75 presets** across 5 categories:

- **Entrance** (19): FadeIn, ArcIn, BlurIn, BounceIn, CurveIn, DropIn, ExpandIn, FlipIn, FloatIn, FoldIn, GlideIn, RevealIn, ShapeIn, ShuttersIn, SlideIn, SpinIn, TiltIn, TurnIn, WinkIn
- **Scroll** (19): ArcScroll, BlurScroll, FadeScroll, FlipScroll, GrowScroll, MoveScroll, PanScroll, ParallaxScroll, RevealScroll, ShapeScroll, ShrinkScroll, ShuttersScroll, SkewPanScroll, SlideScroll, Spin3dScroll, SpinScroll, StretchScroll, TiltScroll, TurnScroll
- **Ongoing** (14): Bounce, Breathe, Cross, DVD, Flash, Flip, Fold, Jello, Poke, Pulse, Rubber, Spin, Swing, Wiggle _(DVD is fully implemented and documented but accidentally missing from the barrel — see `fix-dvd-export` todo)_
- **Mouse** (11): AiryMouse, BlobMouse, BlurMouse, BounceMouse, ScaleMouse, SkewMouse, SpinMouse, SwivelMouse, Tilt3DMouse, Track3DMouse, TrackMouse _(`CustomMouse` is excluded — it is internal infrastructure used to implement `customEffect` for the `pointerMove` trigger, not a user-facing preset)_
- **Background Scroll** (12): BgCloseUp, BgFade, BgFadeBack, BgFake3D, BgPan, BgParallax, BgPullBack, BgReveal, BgRotate, BgSkew, BgZoom, ImageParallax

Key architectural note: `registerEffects()` lives in `**@wix/motion`\**, not this package. This package exports preset modules that you pass *into\* `registerEffects()`.

> **SSOT:** This README and the rules files will eventually be migrated to generated templates under `context/` in Phase 3 of the [SSOT restructure plan](https://github.com/wix/interact/pull/210/changes#diff-a68c779a9afdb459ce4130f6f8d9fa811df80d04b64ef7c7a6232051048a6ecb). Write it as a static file for now.

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

Source strategy (layered):

- **Which presets exist**: barrel exports (`src/library/*/index.ts`) are ground truth — not the rules files.
- **Param names, types, defaults**: TypeScript source files. When code and rules conflict on structured data, the code wins — unless the discrepancy looks like a code omission (e.g., DVD missing from barrel), in which case fix the code.
- **Verbal descriptions, atmosphere tables, selection guidance**: `[presets-main.md](packages/motion-presets/rules/presets/presets-main.md)` and the category rule files. This prose has no equivalent in the code — use it as-is, and log any structural mismatches found for Phase 2 correction.

### 8. Choosing a Preset

Brief guidance section:

- "Choose by intent" table mapping intents (reveal, attention, parallax, pointer tracking, background media) to recommended categories and example presets
- Link to the full "Selection by Atmosphere" guide in `[presets-main.md](packages/motion-presets/rules/presets/presets-main.md)`

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

### 11. AI & Agent Support

Match the pattern used in the other package READMEs: list rule files with one-line descriptions, then generation constraints.

**Rules files** ship with the package under `[rules/presets/](packages/motion-presets/rules/presets/)`:

- `[presets-main.md](packages/motion-presets/rules/presets/presets-main.md)` — overview, parameter standards, atmosphere guide, accessibility
- `[entrance-presets.md](packages/motion-presets/rules/presets/entrance-presets.md)` — entrance preset parameters
- `[scroll-presets.md](packages/motion-presets/rules/presets/scroll-presets.md)` — scroll preset parameters
- `[ongoing-presets.md](packages/motion-presets/rules/presets/ongoing-presets.md)` — ongoing preset parameters
- `[mouse-presets.md](packages/motion-presets/rules/presets/mouse-presets.md)` — mouse preset parameters

**Generation constraints** for agents:

- Use only the registered preset names listed in this README as `namedEffect.type` values — do not invent types.
- When uncertain about a preset's parameters, omit them — the defaults will apply.
- Presets are JSON-serializable config objects.

### 12. Related Packages

- `@wix/motion` -- the animation engine (required peer dependency)
- `@wix/interact` -- declarative interaction layer

### 13. License

MIT (from `[package.json](packages/motion-presets/package.json)`).

## Style Guidelines (from Specs)

- No emoji in headers (spec-2 cross-cutting recommendation #1)
- Clean badges row (spec-2 recommendation #2)
- Concise -- link to docs, don't replicate full API (spec-2 recommendation #6)
- Consistent structure matching the Motion and Interact README templates
- Show, don't tell -- minimal working code examples

## Discrepancy Notes

**Docs README:** The existing `[docs/presets/README.md](packages/motion-presets/docs/presets/README.md)` claims "82+ presets", "16 ongoing", and "12 mouse" — these counts are inaccurate. The new README uses verified counts (75 total: 19 entrance + 19 scroll + 14 ongoing + 11 mouse + 12 background-scroll). Fixing the docs README is out of scope for this task but should be addressed in Phase 2.

**Rules files:** `presets-main.md` lists mouse as 9 presets and omits BounceMouse and SpinMouse — Phase 2 will add these entries to `mouse-presets.md`.

**Known param discrepancies to watch for when verifying code examples (verify-examples todo):**

- `ParallaxScroll`: the param is `parallaxFactor` (not `speed`) — critical, would break integrations.
- `ArcIn`: default direction is `'right'` (not `'bottom'`).
- `Pulse`: intensity default is `0` (not `1.0`).
- Angle convention: `0° = right` — `presets-main.md` documents this correctly; `_template.md` may differ. Code is authoritative.
- `TurnScroll.rotation` and `ParallaxScroll.range`: typed in source but unused at runtime — do not document them as functional parameters.

## Phase 2: Fix Rules Files

After the README is complete, the research done during preparation will have surfaced discrepancies between source code and `rules/presets/`. Phase 2 corrects those files.

**Known items to address (seed list — extend with anything found during Phase 1):**

- `mouse-presets.md`: Add BounceMouse and SpinMouse entries (see `phase2-mouse-rules` todo).
- `presets-main.md`: Update mouse count from 9 to 11; update total from 74 to 75 (once `fix-dvd-export` lands).
- Any param name / default mismatches found during the `verify-examples` step.
- Add `"rules"` and `"docs"` to `packages/motion-presets/package.json` `"files"` array (see `phase2-npm-publish` todo) — currently only `dist` is shipped; adding rules enables local agent access via `node_modules/@wix/motion-presets/rules/`.

Phase 2 is a separate task. Do not attempt it during README preparation.

## Phase 3: Extend llms.txt and llms-full.txt

Once Phase 2 is complete and the rules files are accurate, incorporate the preset rules into the existing `llms.txt` / `llms-full.txt` generation. There is no separate llms.txt for `@wix/motion-presets` — the one docs site (`wix.github.io/interact`) is the canonical home for all packages in this monorepo, and the two packages are always installed together.

### What to change in `scripts/generate-llms.mjs`

The script currently only reads `packages/interact/rules/`. It needs to:

1. Also read `packages/motion-presets/rules/presets/` and load those 5 files.
2. Route `presets-main.md` into the `## Docs` section (below `full-lean.md` and `integration.md`), using a display title like `"Presets Reference"`.
3. Route the 4 category files (`entrance-presets.md`, `scroll-presets.md`, `ongoing-presets.md`, `mouse-presets.md`) into a new `**## Presets`\*\* section inserted between `## Docs` and `## Optional`.
4. Include all 5 preset files in the `llms-full.txt` concatenation (after the interact files).

### Resulting `llms.txt` structure

```markdown
# @wix/interact

> ...

- Install: ...

## Docs

- [Full Reference](...full-lean.md): ...
- [Integration Guide](...integration.md): ...
- [Presets Reference](...presets-main.md): ... ← new

## Presets

- [Entrance Presets](...entrance-presets.md): ... ← new
- [Scroll Presets](...scroll-presets.md): ... ← new
- [Ongoing Presets](...ongoing-presets.md): ... ← new
- [Mouse Presets](...mouse-presets.md): ... ← new

## Optional

- [Click Trigger Rules...](...click.md): ...
- ...
- [All rules in one file](...llms-full.txt): ...
```

### Size impact

Current `llms-full.txt`: ~2,141 lines. The 5 preset files add ~1,614 lines, bringing the total to ~3,755 lines — well within modern context window limits.

### Timing

Do this after Phase 2 (so the rules files being added are already accurate). The [llms-txt plan](.cursor/plans/llms-txt_web_presence_c57a751b.plan.md) is fully complete — the generation script, workflow deployment, and npm packaging are all in place. Phase 3 only needs to extend the existing script.
