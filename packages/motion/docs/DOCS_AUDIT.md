# `@wix/motion` Documentation Audit

> **Scope:** This audit covers **only** `packages/motion/docs/` — the documentation for the `@wix/motion`
> package. It deliberately treats preset content (`@wix/motion-presets`) and the declarative
> interaction layer (`@wix/interact`) as **out of scope**: those packages own their own docs/rules
> (`packages/motion-presets/rules/`, `packages/interact/rules/`).
>
> **Method:** Every "inaccurate" claim below was checked against the current implementation in
> `packages/motion/src/` (commit on branch `docs_cleanup`). Source references are given as
> `file:line` so each finding is verifiable.
>
> **Date:** 2026-06-29

---

## 1. Executive summary

The `docs/` tree was generated from an early exploration plan (`PLAN_DOCS.md`) that targeted a
*combined* motion + presets surface ("82+ presets in 5 categories"). The package has since diverged
substantially, and most of the prose pre-dates the current API. The result:

- **A large fraction of the docs are inaccurate against the current implementation** — most damagingly,
  a fabricated `type: 'TimeAnimationOptions' | 'ScrubAnimationOptions'` discriminator that appears in
  **almost every code sample** and **does not exist in the types**.
- **A large fraction is out of scope** — the entire `categories/` tree and the "Named Effect Types"
  section of `api/types.md` document *presets*, which now live in `@wix/motion-presets` and are
  documented in `packages/motion-presets/rules/`.
- **The genuinely good, current material is small and isolated**: the package `README.md`,
  `api/sequence.md`, and `api/get-sequence.md` are accurate and match the code. They are the template
  the rest should be rebuilt against.
- **There are no LLM-facing rules** for motion, unlike its siblings. This is the highest-value gap to
  fill, because motion is the layer an agent reaches for when `@wix/interact`'s declarative config is
  not enough (custom render callbacks, manual scrub-scene driving, sequences, SSR CSS generation).

**Recommendation:** Delete the stale/out-of-scope material, rewrite the small accurate core to match
the `README`, and author a new `packages/motion/rules/` set modeled on
`motion-presets/rules/presets/presets-main.md` and `interact/rules/integration.md`.

---

## 2. Document inventory & verdict

| File | Intended purpose | Accuracy | Verdict |
| --- | --- | --- | --- |
| `PLAN_DOCS.md` | Original planning doc | n/a (stale plan) | **Delete** — historical artifact; describes a `presets/` tree that was never built / since removed. |
| `getting-started.md` | First animation in 10 min | Low | **Rewrite** — pervasive fake `type:` field, wrong easing names, wrong CDN path, misleading `play()` semantics. |
| `core-concepts.md` | Mental model | Low–Med | **Rewrite & trim** — good Sequence section; rest mixes preset content + fabricated APIs. |
| `api/README.md` | API index | Med | **Rewrite** — index is fine; embedded type snippets carry the fake `type:` field and fabricated unions. |
| `api/core-functions.md` | Core function reference | **Low (critical)** | **Rewrite** — `getCSSAnimation` documented as returning a `string` (it returns an array of descriptors); wrong return types; fake `type:` everywhere. |
| `api/animation-group.md` | `AnimationGroup` class | Med | **Revise** — method docs mostly correct but class surface is incomplete and examples use the fake `type:` field. |
| `api/sequence.md` | `Sequence` class | **High** | **Keep** (minor fix: `finished` is `Promise<Animation[]>`). Matches code. |
| `api/get-sequence.md` | `getSequence`/`createAnimationGroups` | **High** | **Keep**. Matches code; uses correct `keyframeEffect` shape. |
| `api/types.md` | Type reference | **Low (critical)** | **Split**: keep core motion types (rewritten); delete the "Named Effect Types" + fabricated helper sections. |
| `categories/README.md` | Category overview | Out of scope | **Move/Delete** — presets belong to `@wix/motion-presets`. |
| `categories/entrance-animations.md` | Entrance presets | Out of scope + inaccurate | **Delete**. |
| `categories/ongoing-animations.md` | Ongoing presets | Out of scope | **Delete**. |
| `categories/scroll-animations.md` | Scroll presets | Out of scope | **Delete**. |
| `categories/mouse-animations.md` | Mouse presets | Out of scope | **Delete**. |
| `categories/background-scroll-animations.md` | BG-scroll presets | Out of scope + stale category | **Delete** — `background-scroll` is no longer a preset category. |
| `guides/README.md` | Guide index | Low | **Rewrite/trim** — links to non-existent `testing.md`. |
| `guides/advanced-patterns.md` | Advanced patterns | Low | **Delete most** — ~1.4k lines of invented framework code (HammerJS controllers, animation pools, state machines) using fabricated APIs. Salvage only the "custom effect authoring" idea (rewritten & corrected). |
| `guides/framework-integration.md` | React/Vue/Angular | Low | **Trim to React** — Vue/Angular sections are speculative and contain `[TBD]` placeholders. |
| `guides/performance.md` | Performance | Med | **Trim** — real `fastdom`/CSS guidance is buried under invented profiler/debugger classes; repeats the `getCSSAnimation`-returns-string error. |
| `examples/README.md` | Examples index | Low | **Rewrite** — links to 3 files that don't exist + `../playground/` that doesn't exist. |

---

## 3. Critical inaccuracies (wrong vs. current implementation)

These are correctness bugs in the docs — code that, if copied, will not compile or will not behave as
described.

### 3.1 The fabricated `type: 'TimeAnimationOptions' | 'ScrubAnimationOptions'` discriminator (pervasive)

Nearly every example sets a top-level `type` field on the options object:

```typescript
getWebAnimation(el, { type: 'TimeAnimationOptions', namedEffect: { type: 'FadeIn' }, duration: 1000 });
```

**No such field exists.** `TimeAnimationOptions` (`src/types.ts:143`) and `ScrubAnimationOptions`
(`src/types.ts:179`) have no `type` property; the union `AnimationOptions` (`src/types.ts:113`) is
discriminated **structurally** — the engine branches on the *presence* of `keyframeEffect` /
`namedEffect` / `customEffect` (`src/api/common.ts:64-86`) and on the `trigger` argument, never on a
`type` string. The correct call is:

```typescript
getWebAnimation(el, { namedEffect: { type: 'FadeIn' }, duration: 1000 });
```

Appears in: `getting-started.md`, `core-concepts.md`, `api/README.md`, `api/core-functions.md`,
`api/animation-group.md`, `api/types.md`, `categories/*`, all three `guides/*`, `examples/README.md`.
This single error is the most important thing to fix and is the strongest signal the docs are stale.

### 3.2 `getCSSAnimation()` does **not** return a string

`api/core-functions.md:344-394` and `guides/performance.md:23-42` document the signature as
`): string` and show `style.insertRule(cssRules)`. The implementation (`src/api/cssAnimations.ts:51-80`)
returns **an array of descriptor objects**:

```typescript
{ target, animation, composition, custom, name, keyframes, id, animationTimeline, animationRange }[]
```

The package `README.md` and `getting-started.md` correctly iterate the array
(`cssAnimations.forEach(({ target, animation, keyframes }) => …)`). The core-functions/performance
docs contradict both reality and the rest of the docs. (The example also contains a `<sytle>` typo and
creates a `CSSStyleSheet` but calls `style.insertRule`, never defining `style`.)

### 3.3 Fabricated / non-exported types

`api/types.md`, `api/README.md`, and the guides reference many types that **the package does not
export** (verified by grep against `src/`):

- `EntranceAnimation`, `OngoingAnimation`, `ScrollAnimation`, `MouseAnimation`,
  `BackgroundScrollAnimation`, and a `NamedEffect` defined as their union. **Reality:**
  `NamedEffect = { type: string } & Record<string, unknown>` (`src/types.ts:99`). The per-effect types
  (`FadeIn`, `ArcIn`, `ScaleMouse`, `BgZoom`, …) are not in `@wix/motion` at all — they belong to
  `@wix/motion-presets`.
- `BaseDataItemLike<Type>` — does not exist anywhere in the repo; invented as a base for the fake
  effect types and reused in the guides' "custom effect" examples.
- `MouseEffectAxis = 'both' | 'horizontal' | 'vertical'` and `MousePivotAxis` — do not exist. The real
  axis type is `PointerMoveAxis = 'x' | 'y'` (`src/types.ts:158`), and it is set on the **trigger**
  object, not on the effect.
- `MotionKeyframeEffect` is documented (`api/types.md:672`) as
  `BaseDataItemLike<'KeyframeEffect'> & { name; keyframes }` with examples setting
  `type: 'KeyframeEffect'`. **Reality:** `MotionKeyframeEffect = { name: string; keyframes: Keyframe[] }`
  (`src/types.ts:138`) — no `type` field.
- The `isTimeAnimation` / `isScrubAnimation` type guards (`api/types.md:766-781`) test
  `options.type === …`, which is always `undefined` (see 3.1). The `createTimeAnimation` /
  `createScrubAnimation` / `TypedAnimationFactory` helpers do not exist in the library.

### 3.4 `customEffect` — wrong shape documented; the working shape omitted

`core-concepts.md:204-211` and `api/types.md:662-688` present `customEffect` exclusively as
`{ ranges: [{ name, min, max, step }] }` and call it "Full programmatic control."

**Reality** (`src/types.ts:101-105`): `CustomEffect` is a union — `{ ranges: … } | ((element, progress) => void)`.
Only the **function** form does anything at runtime: `getWebAnimation` builds a `CustomAnimation`
(driving a `requestAnimationFrame` loop) **only when `typeof customEffect === 'function'`**
(`src/api/webAnimations.ts:146`, `src/CustomAnimation.ts`). The `{ ranges }` object form is passed
through to a keyframe-less animation (`src/api/common.ts:82-84`) and produces no visible effect on its
own. The docs document the inert form as the primary one and never show the functional callback that
actually works.

### 3.5 "Animation Groups" example — `getWebAnimation` does not accept an array

`core-concepts.md:310-320` shows:

```typescript
const group = getWebAnimation(element, [{ namedEffect: … }, { namedEffect: … }]);
```

`getWebAnimation` takes a **single** `AnimationOptions` object (`src/api/webAnimations.ts:60-66`). An
`AnimationGroup` wraps the multiple `Animation`s produced by *one* options object; you do not pass an
array. To coordinate multiple elements/effects use `getSequence(options, AnimationGroupArgs[])`
(`src/motion.ts:261`).

### 3.6 Return types omit `null` and array variants

- `getWebAnimation` is documented as `: AnimationGroup | MouseAnimationInstance`
  (`api/core-functions.md:27`, `api/types.md:519`). Real signature returns
  `AnimationGroup | MouseAnimationInstance | null` (`src/api/webAnimations.ts:66`). Examples like
  `const animation: AnimationGroup = getWebAnimation(...)` won't type-check.
- `getScrubScene` is documented as `: ScrubScrollScene[] | ScrubPointerScene`
  (`api/core-functions.md:212`). Real return is
  `ScrubScrollScene[] | ScrubPointerScene | ScrubPointerScene[] | null` (`src/motion.ts:79`). The
  keyframe-driven pointer path returns a single scene while the named-effect path can differ, so docs
  that index `getScrubScene(...)[0]` for pointer scenes (`guides/advanced-patterns.md:1129`) are unsafe.

### 3.7 Easing names that don't exist

Docs reference easings that are **not** in the exported easing maps (`src/easings.ts`):

- `easeOutCubic` (`getting-started.md:90`) — not a key. Closest real keys: `cubicOut` (JS) or the CSS
  alias `easeOut` → `ease-out`.
- `elasticOut`, `bounceOut`, `bounceIn` (`core-concepts.md:223`, `categories/README.md:111`) — none
  exist. (`elastic` and `bounce` exist only as `ScrubTransitionEasing` values for pointer smoothing,
  `src/types.ts:131` — a different field.)

The real, exported sets are `jsEasings` (Penner functions, `src/easings.ts:187`) and `cssEasings`
(named → `cubic-bezier(...)`, `src/easings.ts:218`), resolved via `getEasing` / `getJsEasing`
(`src/utils.ts`). Valid named keys include `linear`, `ease`, `easeIn/Out/InOut`, and
`{sine,quad,cubic,quart,quint,expo,circ,back}{In,Out,InOut}`.

### 3.8 Angle/direction convention contradicts the presets convention

`core-concepts.md:247` and `categories/entrance-animations.md:87` state
`0° = up, 90° = right, 180° = down, 270° = left`. The authoritative presets rule states the opposite —
`0° = right (east), angles increase counter-clockwise` (`motion-presets/rules/presets/presets-main.md:107`).
Since angles are a **preset** parameter, this should not live in motion docs at all; while it does, it
is wrong.

### 3.9 `play()` resolution semantics misrepresented

`getting-started.md:94-97` implies `await animation.play()` resolves on **completion**
(`console.log('Animation completed!')`). `AnimationGroup.play` (`src/AnimationGroup.ts:39-53`) awaits
`ready` and each animation's `ready` — i.e. it resolves once playback has **started**, not finished.
Completion is observed via `onFinish(cb)` or the `finished` promise. Relatedly, `finished` is typed in
the docs as `Promise<Animation>` (`api/animation-group.md:527`, `api/types.md:541`) but is
`Promise<Animation[]>` (`Promise.all`, `src/AnimationGroup.ts:142-144`).

### 3.10 Smaller factual errors

- **CDN/import path:** `getting-started.md:25` imports from `…/dist/esm/index.js`. The published ESM
  entry is `dist/es/motion.js` (`package.json` `module`; confirmed in `dist/es/`).
- **Node version:** `getting-started.md:8` says "Node.js 16+". `package.json` `engines` requires
  `>=18` (and the repo pins a version via `nvm use`).
- **4th `options` argument:** `api/core-functions.md:96-101` claims it accepts `effectId` and
  `measurementCallback`. `effectId` is read from `animationOptions.effectId`
  (`src/api/webAnimations.ts:114`), not the 4th arg; `measurementCallback` is not a recognized key. The
  options bag that the engine actually reads is `{ reducedMotion }` (`src/api/webAnimations.ts:38`) and,
  for `getScrubScene`, `{ disabled, allowActiveEvent }` (`src/motion.ts:80`).
- **`getScrubScene` trigger object:** `api/core-functions.md:229-243` places `startOffset`/`endOffset`
  inside the `trigger` argument. Those are properties of the **animation options**
  (`ScrubAnimationOptions`, `src/types.ts:165-166`), not the trigger.
- **`NodeList.map`:** several examples call `.map` directly on `querySelectorAll(...)` results
  (`api/core-functions.md:455`, `examples/README.md:65`) — needs `Array.from(...)`.
- **`iterations: Infinity`:** works, but the engine's idiom is `iterations: 0` → `Infinity`
  (`src/api/common.ts:100`; CSS path `src/api/cssAnimations.ts:30`). Worth standardizing.

---

## 4. Out of scope — belongs to other packages

The motion docs repeatedly document things that are owned elsewhere. This is both redundant and a
drift hazard (two sources of truth that disagree — see 3.8).

### 4.1 Preset catalog → `@wix/motion-presets`

- The **entire `categories/` tree** (6 files, ~2,775 lines) documents preset names, parameters, and
  selection guidance. This is exactly what `packages/motion-presets/rules/presets/` now owns
  (`presets-main.md` + `entrance/scroll/ongoing/mouse-presets.md`), and the presets rules are current
  while these are not:
  - Counts disagree: motion docs claim **"82+ presets, 5 categories"** including **background-scroll**;
    the presets rules list **entrance 19, scroll 19, ongoing 13, mouse 11** and **no background-scroll
    category** (its docs were removed — see deleted files in `git status`).
  - Preset params here (`SlideIn`, `Spin direction:'clockwise'`, `BgFake3D`, `ScaleMouse`, etc.) are not
    defined by `@wix/motion` and several don't match the presets library.
- The **"Named Effect Types" section of `api/types.md`** (lines ~139-426) is the same problem in type
  form.

`@wix/motion`'s only contract with presets is the **registry** (`registerEffects`, `src/api/registry.ts`)
and the structural `EffectModule` shape (`src/types.ts:261`). Motion docs should document *that
contract* and link to the presets package for the catalog — not re-list presets.

### 4.2 Declarative/framework concerns → `@wix/interact`

- The Vue/Angular integration sections (`guides/framework-integration.md:314-965`) are speculative
  wrappers (with `[TBD]` placeholders) around motion's imperative API. Reactive lifecycle binding,
  triggers, and config-driven orchestration are `@wix/interact`'s job (`interact/rules/integration.md`).
  Motion docs should show the minimal framework-agnostic lifecycle (create → play → `cancel` on
  teardown) and point to `@wix/interact` for declarative usage.

---

## 5. Redundant / unnecessary / low-value content

- **`PLAN_DOCS.md`** — a planning transcript ("Switch to agent mode and type execute"). Not
  documentation. Delete.
- **`guides/advanced-patterns.md`** — ~1,400 lines of invented application code:
  `AdvancedParallaxSystem`, `ScrollManager`, `AnimationChoreographer`, `StateMachine`,
  `GestureAnimationController` (depends on HammerJS), `ScrollStorytellingEngine`, `AnimationPool`,
  `GlobalAnimationManager`. None of it is part of `@wix/motion`; it uses fabricated APIs
  (`progressFunction` on scroll data, `BaseDataItemLike`, `type:` discriminator, non-existent preset
  params like `DropIn.initialScale`, `SpinIn.spins`). It reads as "things you could build," not docs
  for this package. Salvage only the **custom-effect authoring** concept (rewritten — see §6).
- **`guides/performance.md`** — the genuinely useful guidance (prefer transform/opacity, batch via
  `fastdom`, CSS for fire-and-forget, pause off-screen loops) is ~20 lines, buried under invented
  `AnimationProfiler` / `AnimationDebugger` classes. Trim hard.
- **Cross-file duplication** — the same fade/slide/bounce examples and the same "CSS vs WAAPI" table are
  repeated across `README`, `getting-started`, `core-concepts`, `api/core-functions`, `categories`, and
  `guides/performance`. Consolidate to one canonical location each.

---

## 6. Missing — what motion docs *should* cover but don't

These are the topics unique to `@wix/motion` that an engineer or agent actually needs, and that are
currently absent, buried, or wrong. They should anchor the rewrite.

1. **The three effect-definition modes, accurately** (`src/api/common.ts:64-86`):
   - `keyframeEffect: { name, keyframes }` — inline, zero registration.
   - `customEffect: (element, progress) => void` — per-frame JS callback via `CustomAnimation`'s rAF
     loop; called with `null` on cancel (`src/CustomAnimation.ts:155-163`). **This is the only
     "programmatic" mode and is currently mis-documented.**
   - `namedEffect: { type, …params }` — requires registration.
2. **`registerEffects` + the `EffectModule` contract** (`src/api/registry.ts`, `src/types.ts:57-66,
   249-266`): the `{ web, getNames, style?, prepare? }` shape, what each returns (`AnimationData[]`),
   and how to author a custom registered effect. (`getting-started.md` shows the object shape correctly;
   the guides show it as loose free functions — reconcile.)
3. **Scrub-scene driving contract** for the polyfill path: `getScrubScene` returns scenes exposing
   `start` / `end` / `viewSource` / `ready` / `getProgress()` / `effect(_, progress)` / `destroy()`
   (`src/types.ts:222-245`, `src/motion.ts:95-195`). How to drive `effect()` from an
   IntersectionObserver/scroll or pointer listener, and that `@wix/interact` does this automatically via
   `fizban`. This is motion's most differentiated capability and is undocumented in practical terms.
4. **Native ViewTimeline vs. polyfill behavior** (`src/api/common.ts:106-120`,
   `src/api/webAnimations.ts:116-190`): when `window.ViewTimeline` exists, WAAPI is linked to the
   timeline with `duration: 'auto'`; otherwise duration becomes `99.99ms`/`delay 0.01ms` so progress is
   externally scrubbable. `getScrubScene` only emits scenes on the no-ViewTimeline branch
   (`src/motion.ts:90`).
5. **Pointer-move specifics:** `axis: 'x' | 'y'` lives on the **trigger** (`src/motion.ts:123-145`); the
   `Progress` payload `{ x, y, v?, active? }` (`src/types.ts:74`); `centeredToTarget`,
   `transitionDuration` / `transitionEasing` smoothing (`ScrubTransitionEasing`), and `allowActiveEvent`.
6. **Reduced-motion handling:** the `{ reducedMotion }` option collapses single-iteration animations to
   `duration: 1` and drops multi-iteration ones (`src/api/webAnimations.ts:38-44`); threaded through
   `getAnimation`/`getSequence` via `context.reducedMotion` (`src/motion.ts:198-267`).
7. **The easing system as an exported API:** `getEasing`/`getJsEasing` are public (`src/index.ts`),
   `getJsEasing` also parses `cubic-bezier(...)` and CSS `linear(...)` strings (`src/utils.ts:60-187`).
   Note the correct spelling is `cubic-bezier(...)` (hyphenated) — `api/types.md:854` writes
   `cubicBezier(...)`, which won't parse.
8. **`data-motion-part` targeting:** effects can target sub-parts via
   `[data-motion-part~="…"]` (`src/api/common.ts:19-24`, `src/api/cssAnimations.ts:10-12`). Undocumented.
9. **Full `AnimationGroup` surface:** `onAbort`, `hasAnimationName`, `hasAnimationId`,
   `getTimingOptions`, `isCSS`, `longestAnimation`, and the `playState` aggregation rule ("running if
   any is running," `src/AnimationGroup.ts:146-150`). Current `api/animation-group.md` omits these and
   the dispatched `animationend`/`animationcancel` CustomEvents (`src/AnimationGroup.ts:99-140`).
10. **SSR / CSS-generation contract:** `getCSSAnimation` descriptor fields and their meaning
    (`animationTimeline`, `animationRange`, `custom`, `composition`), and the `forCSS` flag forcing
    `duration: 'auto'` for scroll animations regardless of runtime ViewTimeline support
    (`src/api/common.ts:110-113`). This is how the layer above renders FOUC-free CSS.
11. **Package boundary / "when to use what":** a short map — use `@wix/interact` for declarative
    trigger→effect wiring; use `@wix/motion-presets` for the catalog; drop to `@wix/motion` directly for
    custom render callbacks, manual scrub driving, programmatic sequences, or custom CSS generation.

---

## 7. Broken links & structural issues

- `examples/README.md` links to `common-patterns.md`, `real-world-implementations.md`,
  `interactive-demos.md` — **none exist** (the `examples/` dir contains only `README.md`).
- `guides/README.md` links to `testing.md` — **does not exist** (only `advanced-patterns`,
  `framework-integration`, `performance`).
- `../playground/` and `../../playground/` are referenced from `getting-started.md`, `core-concepts.md`,
  `examples/README.md` — **no `playground/` directory exists** in the package.
- `framework-integration.md` ships `[TBD]` placeholders (lines 254, 311, 497, 527) — incomplete content
  in published docs.
- Category cross-links (`categories/entrance-animations.md` "Detailed Animation Guides" → per-preset
  files) point at a `presets/` tree that doesn't exist.

---

## 8. Recommended docs structure

Keep human-facing docs lean and accurate; let the rules (see §9) carry the dense, agent-facing detail.
Single source of truth per topic.

```
packages/motion/
├── README.md                      # KEEP — already accurate; canonical overview
├── docs/
│   ├── getting-started.md         # REWRITE — match README; one runnable example per mode
│   ├── core-concepts.md           # REWRITE+TRIM — effect modes, triggers, ViewTimeline/polyfill,
│   │                              #   easing, reduced motion, package boundary
│   ├── api/
│   │   ├── README.md              # REWRITE — index + accurate signatures only
│   │   ├── core-functions.md      # REWRITE — fix return types (esp. getCSSAnimation)
│   │   ├── animation-group.md     # REVISE — complete the class surface; drop fake `type:`
│   │   ├── sequence.md            # KEEP (minor fix)
│   │   ├── get-sequence.md        # KEEP
│   │   └── types.md               # REWRITE — motion-owned types only; delete preset/union/helper types
│   └── guides/
│       ├── custom-effects.md      # NEW — replaces advanced-patterns; registerEffects + EffectModule +
│       │                          #   customEffect callback + scrub-scene driving
│       ├── ssr-css.md             # NEW — getCSSAnimation descriptors + FOUC/SSR contract
│       └── performance.md         # TRIM — keep the real ~20 lines
│
├── rules/                         # NEW — see §9
│   ├── motion-main.md
│   ├── waapi.md
│   ├── scrub-scenes.md
│   ├── sequences.md
│   ├── custom-effects.md
│   └── css-generation.md
```

**Delete:** `PLAN_DOCS.md`, `categories/` (entire), `guides/advanced-patterns.md`,
`guides/framework-integration.md` (or reduce to a tiny React note), `examples/` (fold a couple of
verified snippets into `getting-started.md`).

---

## 9. LLM-facing rules: what they should contain & how to structure them

Motion is the one package in the monorepo with **no** `rules/`. Add `packages/motion/rules/`, modeled
on the two proven in-repo templates:

- `packages/motion-presets/rules/presets/presets-main.md` — frontmatter with a "read this when…"
  `description`, a Table of Contents, terminology table, dense parameter tables, and an explicit "LLM
  Guidance Principles" section.
- `packages/interact/rules/integration.md` — task-oriented, hub-and-spoke (a main file linking to
  trigger-specific files), heavy use of "MUST"/"Rules" callouts and signature tables.

### 9.1 Authoring principles (apply to every rule file)

1. **Accuracy is the contract.** Every signature, type, field, and default must be copied from
   `src/`, not paraphrased from memory. The current docs failed precisely here — do not repeat it.
2. **No fabrication.** Never invent types, fields, or easing names. If a value set is finite, list it
   verbatim from source. The structural `AnimationOptions` discrimination (no `type:` field) must be
   stated explicitly because it is counter-intuitive and was the #1 historical error.
3. **Stay in lane.** Presets → link to `@wix/motion-presets`. Declarative/triggers → link to
   `@wix/interact`. Motion rules cover the imperative engine only.
4. **Frontmatter routing.** Each file starts with `name` + a `description` that says *when to read it*
   (so the agent can select the right file), exactly like `presets-main.md`.
5. **Show the gotchas.** `play()` resolves on start; `getCSSAnimation` returns an array;
   `customEffect` must be a function to do anything; pointer `axis` is on the trigger; `0`→`Infinity`
   iterations. These are the things an agent gets wrong without being told.
6. **Link to `file:line` in `src/`** for the authoritative definition of each contract, so the rules
   can be re-verified when code changes (and add a drift check to CI if feasible, mirroring
   `interact-validate`'s schema drift guard).

### 9.2 Proposed file set & contents

**`rules/motion-main.md`** (entry point / router)
- Frontmatter: *"Read when working directly with `@wix/motion` — creating WAAPI/CSS/scroll/pointer
  animations imperatively, driving scrub scenes, building sequences, or generating CSS. For preset
  selection see `@wix/motion-presets`; for declarative trigger wiring see `@wix/interact`."*
- ToC + **package boundary** decision table (motion vs presets vs interact).
- **Core mental model:** options are discriminated structurally (`keyframeEffect` | `namedEffect` |
  `customEffect`) × trigger (`undefined` = time-based, `view-progress`, `pointer-move`). Explicit "there
  is no `type` field."
- **Function map** table: `getWebAnimation`, `getCSSAnimation`, `getScrubScene`, `getAnimation`,
  `prepareAnimation`, `getSequence`, `createAnimationGroups`, `registerEffects`, `getEasing` — with the
  *real* signatures and return types (including `| null`).
- **Easing reference:** the exact `jsEasings`/`cssEasings` key list + `cubic-bezier()`/`linear()` parsing.
- Links to the spoke files below.

**`rules/waapi.md`** — `getWebAnimation` + `AnimationGroup`
- Full `AnimationOptions` field tables (time vs scrub) from `src/types.ts`.
- Complete `AnimationGroup` surface incl. `onFinish`/`onAbort`, `finished` (`Promise<Animation[]>`),
  `playState` aggregation, dispatched `animationend`/`animationcancel` events.
- Gotchas: `play()` start-vs-finish; `iterations: 0` ⇒ infinite; `reducedMotion` behavior.

**`rules/scrub-scenes.md`** — `getScrubScene` (the differentiator)
- Native ViewTimeline vs. polyfill branch; when scenes are returned.
- `ScrubScrollScene` / `ScrubPointerScene` contracts; how to drive `effect(_, progress)`; pointer
  `Progress` payload; `axis` on trigger; `centeredToTarget`, transition smoothing, `allowActiveEvent`;
  cleanup via `destroy()`. Note `@wix/interact` + `fizban` automate this.

**`rules/sequences.md`** — `getSequence` / `Sequence`
- Largely portable from the already-accurate `api/sequence.md` + `api/get-sequence.md`: offset formula
  `easing(i/last) * last * offset | 0`, `addGroups`/`removeGroups`, target resolution, `reducedMotion`
  context.

**`rules/custom-effects.md`** — `registerEffects` + authoring
- `EffectModule` shape `{ web, getNames, style?, prepare? }` and `AnimationData[]` return; the
  `customEffect` callback form (and that the `{ ranges }` form is inert in motion alone);
  `data-motion-part` sub-target targeting.

**`rules/css-generation.md`** — `getCSSAnimation` / SSR
- Descriptor array fields and meanings; `forCSS` forcing `duration: 'auto'`; how the output is injected;
  relationship to `@wix/interact`'s `generate()` and FOUC prevention (link, don't duplicate).

### 9.3 Minimal-set fallback

If a 6-file set is too much to maintain, collapse to **two** files: `motion-main.md` (everything above,
condensed, the way `presets-main.md` packs a category) + `custom-effects.md` (authoring + scrub driving,
the parts most prone to agent error). Prefer the full set if the package keeps evolving.

---

## 10. Suggested remediation order

1. **Stop the bleeding (accuracy):** delete `PLAN_DOCS.md` and `categories/`; fix the
   `getCSSAnimation`-returns-string error and the `type:` discriminator across `getting-started.md`,
   `core-concepts.md`, `api/core-functions.md`, `api/README.md`, `api/types.md`. (Highest impact, since
   these are the most-copied snippets.)
2. **Author `rules/motion-main.md`** — gives agents a correct entry point immediately; it can ship
   before the human docs are fully rewritten.
3. **Rewrite the human docs** against `README.md` as the reference of truth; remove broken links and the
   `playground`/`examples`/`testing` references.
4. **Fill the gaps from §6** (scrub driving, custom effects, SSR/CSS, reduced motion) in the new
   `guides/` + remaining rule spokes.
5. **Add a drift guard** (optional) so rule/doc signatures are checked against exported types in CI,
   mirroring `@wix/interact-validate`'s approach.

---

### Appendix: files referenced as ground truth

`src/index.ts`, `src/motion.ts`, `src/types.ts`, `src/utils.ts`, `src/easings.ts`,
`src/AnimationGroup.ts`, `src/Sequence.ts`, `src/CustomAnimation.ts`, `src/api/common.ts`,
`src/api/webAnimations.ts`, `src/api/cssAnimations.ts`, `src/api/prepare.ts`, `src/api/registry.ts`,
`package.json`, `README.md`; plus the rule templates
`packages/motion-presets/rules/presets/presets-main.md` and `packages/interact/rules/integration.md`.
