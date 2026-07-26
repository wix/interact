# Audit — `interact-documentation-site.md`

**Audited file:** `interact-documentation-site.md` (4,733 lines, 27 pages)
**Audited against:** `packages/interact/src/**` (v2.5.4), `packages/interact/rules/full-lean.md`, `packages/interact/rules/{click,hover,viewenter,viewprogress,pointermove,integration,validate}.md`, `packages/interact/README.md`, `packages/interact-validate/src/**`, `packages/motion-presets/src/**`, `packages/motion/src/types.ts`
**Date:** 2026-07-26

Every technical claim below was checked against source. Where a claim was verified by running code, it is marked **[verified by execution]**. Where the shipped agent rules (`rules/*.md`) and the source disagree, the source is treated as truth and the rules are listed for a separate fix in [Appendix A](#appendix-a--upstream-fixes-outside-this-file).

Line numbers refer to the current state of `interact-documentation-site.md`.

---

## Table of contents

1. [Summary](#1-summary)
2. [Blocking issues](#2-blocking-issues--must-be-fixed-before-publishing)
3. [Technical errors](#3-technical-errors)
4. [Missing information](#4-missing-information)
5. [Content to remove](#5-content-to-remove-authoring-residue)
6. [Structure and navigation](#6-structure-and-navigation)
7. [Authoring style — the house style decision](#7-authoring-style--the-house-style-decision)
8. [Terminology consistency](#8-terminology-consistency)
9. [Code-sample consistency](#9-code-sample-consistency)
10. [Markdown and formatting defects](#10-markdown-and-formatting-defects)
11. [Per-page action list](#11-per-page-action-list)
12. [Appendix A — upstream fixes outside this file](#appendix-a--upstream-fixes-outside-this-file)
13. [Appendix B — verification notes](#appendix-b--verification-notes)

---

## 1. Summary

The documentation is structurally sound — the page inventory and the order of pages are right and should not change. The problems fall into five buckets:

| Bucket | Count | Severity |
| :---- | :---- | :---- |
| Technical errors (wrong, will mislead or break user code) | 22 | Blocking / High |
| Missing information (correct but incomplete) | 24 | Medium |
| Authoring residue (owners, TODOs, Google Docs artifacts, dead links) | ~90 instances across 12 classes | Blocking (cosmetic but public-facing) |
| Structural / navigation defects | 14 | High |
| Style & consistency (authoring voice, terminology, code style, markdown) | 11 classes | Medium |

Two pages are not shippable at all in their current state: **"The final result + examples links"** (an unwritten outline) and **"Using lists"** (all code samples are rendered as single-cell Markdown tables).

The single most damaging technical error is the **camelCase guidance for state-effect `styleProperties`** (§3.1) — it is repeated on two pages across five examples, and every one of those examples produces CSS that browsers silently discard.

---

## 2. Blocking issues — must be fixed before publishing

These must be resolved; everything else can be triaged.

| # | Issue | Location |
| :---- | :---- | :---- |
| B1 | State-effect `styleProperties` documented as camelCase — produces invalid CSS | L2341, L2352-2353, L3096-3098, L3113-3127, L3146-3148 |
| B2 | Owner/Reviewer attribution lines with internal Wix email addresses | 27 lines (see §5.1) |
| B3 | Link to an internal Google Docs document | L1093 |
| B4 | 25 `http://ADDLINK` / `ADDLINK` placeholder links, plus 3 `google.com/search?q=ADDLINK` links | §5.3 |
| B5 | "The final result + examples links" page is an unwritten outline | L827-842 |
| B6 | "Using lists" code samples rendered as single-cell Markdown tables | L4473-4505 |
| B7 | `data-interact-initial="true"` — an attribute that does not exist | L2812 |
| B8 | Vanilla `generate(config)` example contradicts the page's own `useFirstChild` table | L699, L4481 |
| B9 | Empty stub sections: "Combining triggers", several bare `##` / `#` headings | L977, L1000, L2067, L2589, L3070, L3998 |
| B10 | `pageVisible` listed as a trigger — no such trigger exists | L3218 |
| B11 | Element-resolution rules contradict each other across three pages and are wrong on two counts | L3601-3638, L3621, L4356-4358, L4374-4382 |
| B12 | Unwritten placeholders in body copy: "TO DO ADD VISUAL DEMONSTRATION", `[Explain that…]`, `[Add link to…]`, `[ A very cool visual example… ]` | L13, L29, L452, L3337, L3341, L4298 |

---

## 3. Technical errors

### 3.1 State-effect style property names must be kebab-case, not camelCase — **BLOCKING**

**Where:** L2341 (`What are effects?` → State Effects), L2352-2353 (same page, example), L3096-3098, L3113-3127, L3146-3148 (`transition Effects` page, all three examples).

**What the docs say:** "CSS property names use **camelCase** (`backgroundColor`, `borderRadius`)."

**What is true:** `styleProperties[].name` and `transitionProperties[].name` are written **verbatim** into the generated stylesheet — both into the state rule and into the `transition:` shorthand. `camelToKebabCase()` is applied only to the trigger name (`src/core/css.ts:458`), never to style property names (`src/core/cssUtils.ts:148`, `src/utils.ts:77-93`).

**[verified by execution]** Running `generate()` on a config containing both spellings emits:

```css
[data-interact-key="btn"] > :first-child {
  --transition-0-…: backgroundColor 200ms ease, background-color 200ms ease;
}
[data-interact-key="btn"]:is(:state(…), :--…, [data-interact-effect~="…"]) > :first-child {
  backgroundColor: #111;    /* invalid — dropped by the browser */
  background-color: #222;   /* works */
}
```

`packages/interact/README.md:326` uses `box-shadow` (kebab-case), confirming kebab-case is the intended convention.

**Fix:**
- L2341 — replace with: "State-effect property names are written straight into CSS, so they use standard **kebab-case** CSS property names (`background-color`, `border-radius`). This is the opposite of `keyframeEffect` keyframes, which use **camelCase** (WAAPI)."
- Rewrite all five examples to kebab-case.
- Add the camelCase-vs-kebab-case contrast as an explicit callout on both the `What are effects?` page and the `transition Effects` page — it is the single easiest thing to get wrong.
- L1450-1457 (`click & hover` page) already uses kebab-case correctly — keep it, and make it the reference example.

### 3.2 `listItemSelector` does not filter runtime source/target binding — **BLOCKING**

**Where:** L3601-3618 (`source and target resolving`), L3634-3635 (recap step 2), L4358 (`what is a list?`), L4366-4369 (example).

**What the docs say:** "`listItemSelector` is an **optional** filter. Use it only when a subset of the container's children should participate… only `.active` children become sources/targets."

**What is true:** `listItemSelector` is never consulted during element resolution. `_getElementsFromData()` (`src/core/add.ts:43-77`) branches only on `listContainer` and `selector`; with `listContainer` alone it returns `Array.from(container.children)` — **all** immediate children. The MutationObserver path (`InteractionController._childListChangeHandler`) likewise processes every added/removed `HTMLElement` child with no filter.

`listItemSelector` is used in exactly three places:
1. CSS selector generation — `getSelector(…, { addItemFilter: true })` emits `${listContainer} > ${listItemSelector}` (`src/core/Interact.ts:340`);
2. the `closest()` lookup for **state effects** on lists (`src/handlers/effectHandlers.ts:112`);
3. the element-identity hash (`src/core/utilities.ts:31-33`).

**Fix:** Replace the "filters which children participate" framing everywhere with the accurate description — which the `Using lists` page (L4462) already has: *"Narrows which direct children count as list items when Interact generates CSS (for `transition` / state effects). Use it when the container also holds elements that are not items."* Add an explicit warning: **`listItemSelector` does not restrict which children receive JS-driven triggers or animations — all immediate children of `listContainer` are bound.** Delete or rewrite the `.active` example at L3603-3618, which teaches behaviour the runtime does not implement.

### 3.3 `selector` resolves with `querySelectorAll`, not `querySelector` — **BLOCKING**

**Where:** L3637 (`source and target resolving`, recap step 3) says: "use `querySelector` within the root to select **first matching descendant**."

**What is true:** `src/core/add.ts:64-72` — `root.querySelectorAll(data.selector)` returns **every** match, and each becomes a source/target.

This directly contradicts L4374-4382 on the `what is a list?` page ("a `selector` alone matches via `querySelectorAll`"), which is correct.

**Fix:** Correct recap step 3. Reconcile the two pages so they state the same rule. Note the practical consequence: `selector: '.card'` on an interaction attaches the trigger to *every* `.card` in the root, not just the first.

### 3.4 `listContainer` + `selector` resolution is described wrongly

**Where:** L3621 and L3635 (`source and target resolving`): "Interact runs `querySelector` inside each direct child of the container."

**What is true:** at bind time, `src/core/add.ts:57-59` runs `container.querySelectorAll(selector)` — a single query scoped to the *container*, matching any depth. The per-child `element.querySelector(selector)` form (`_queryItemElement`, `src/core/add.ts:79-85`) is used **only** for items discovered later by the MutationObserver.

This is a real behavioural difference: `listContainer: '.grid', selector: 'img'` binds to *all* images inside `.grid`, including two images inside the same card, whereas a dynamically appended card contributes only its first `img`.

**Fix:** State the container-scoped `querySelectorAll` rule as the primary behaviour. Either document the per-item difference for dynamically-added children, or (preferred) file it as a runtime inconsistency and document only the stable rule — see [Appendix A](#appendix-a--upstream-fixes-outside-this-file). The `Using lists` page (L4461) is already correct.

### 3.5 `data-interact-initial="true"` does not exist — **BLOCKING**

**Where:** L2812 (`Named Effects` → Entrance).

**What the docs say:** "pre-render the CSS with `generate(config)` and mark the element with `data-interact-initial="true"`."

**What is true:** the attribute is `data-interact-enter`, and it is **written by the runtime, never by the author**. `generate()` emits two guarded rules (`src/core/css.ts:246-263`):
- `…:not([data-interact-enter])` → applies `DEFAULT_INITIAL` (`visibility: hidden; transform: none; translate: none; scale: none; rotate: none`);
- `…:not([data-interact-enter="done"])` → applies the animation custom properties.

The runtime sets `data-interact-enter="start"` when the animation plays and `"done"` when it finishes/aborts (`src/handlers/viewEnter.ts:216-237`).

**Fix:** Remove the instruction entirely. Replace with: "Entrance FOUC prevention is fully automatic — `generate()` emits the initial-state rules and the runtime manages the `data-interact-enter` attribute. You do not add any attribute yourself." Document `data-interact-enter` (read-only, for debugging) on the FOUC page.

### 3.6 Vanilla `generate(config)` contradicts the page's own table — **BLOCKING**

**Where:** L699 (`HTML integration` → Vanilla JS), L4481 (`Using lists`).

**What the docs say:** the table at L767 correctly states `useFirstChild` is `true` for web and `false` for vanilla and React. But the Vanilla JS code sample calls `generate(config)` with no second argument.

**What is true:** `generate(config, useFirstChild = true)` (`src/core/css.ts:547`) — the default is `true`. Calling `generate(config)` in a vanilla integration emits `> :first-child` selectors that will not match, so no CSS applies.

**Fix:** L699 → `generate(config, false)`. L4481 → `generate(config, false)` (or make the surrounding example explicitly a web integration). Audit every `generate(` call in the file and make the second argument explicit everywhere, including the `Named Effects` and `Using lists` pages. Add a note to the argument table: "The default is `true`; always pass it explicitly."

### 3.7 `pageVisible` is not a trigger — **BLOCKING**

**Where:** L3218 (`custom Effects`): "For `viewEnter`, `pageVisible`, `hover`, `click`, `activate`, `interest`, and `animationEnd`…"

**What is true:** `TriggerType` (`src/types/triggers.ts:7-15`) is exactly `hover | click | viewEnter | animationEnd | viewProgress | pointerMove | activate | interest`. There is no `pageVisible` anywhere in the codebase.

**Fix:** Delete `pageVisible` from the list.

### 3.8 `hitArea` values described incorrectly

**Where:** L3021 (`keyframe Effects` → Advanced pointer properties): "`hitArea` chooses which element's pointer events drive the effect (`'self'` the **target element itself**, `'root'` its **nearest positioned ancestor**)."

**What is true:** `src/handlers/pointerMove.ts:39` — `root: options.hitArea === 'self' ? source : undefined`. `'self'` is the **source** element (not the target); `'root'` (the default, since `undefined` root falls through to kuliso's viewport default) tracks the **viewport**, not any ancestor.

The `pointerMove` page (L1896-1898) states this correctly.

**Fix:** Correct L3021 to match the `pointerMove` page. Better: delete the duplicated pointer reference from the `keyframe Effects` page and cross-link to the `pointerMove` chapter (see §6.5).

### 3.9 `container` conditions are accepted but not implemented

**Where:** L4155-4158 (`responsive animation design`) presents `{ type: 'container', predicate: '(min-width: 600px)' }` as a working feature, and the page body advertises "container conditions" (L4142).

**What is true:** `type: 'container'` is in the TypeScript type (`src/types/config.ts:5`) and in the validator schema (`interact-validate/src/schema/primitives.ts:41`), but nothing consumes it:
- `generate()` only ever calls `getFullPredicateByType(…, 'media')` — no `@container` rule is ever emitted;
- runtime gating uses `getMediaQuery()`, which is also media-only (`src/utils.ts:170-178`).

A `container` condition is therefore **silently dropped** — the gated interaction runs unconditionally. The L4165 example (`conditions: ['desktop', 'motion-ok', 'wide-container']`) does not do what the surrounding prose claims.

**Fix (pick one, then apply consistently):**
- **Recommended:** remove container conditions from the docs entirely. Rewrite the L4145-4197 example using only `media` conditions, and drop "container sizes" from L4046 and L4142.
- **Alternative:** keep them but add an explicit "not yet implemented — reserved" note. This is worse for a public docs launch.

Either way, resolve the inconsistency with the `understanding conditions` page (L3918), whose type table lists only `media` and `selector`.

### 3.10 "unused condition definitions … are reported as errors"

**Where:** L4031 (`understanding conditions` → Validation).

**What is true:** `UNUSED_CONDITION` is emitted as a **warning** (`interact-validate/src/structural.ts:75` — warnings default to `severity: 'warning'`), so `validateInteractConfig()` still returns `valid: true` and `assertValidInteractConfig()` does **not** throw. Only `INVALID_MEDIA_QUERY` (a schema issue) is an error.

**Fix:** "Invalid `media` predicates are reported as **errors**; unreferenced condition definitions are reported as **warnings**. Use `strict: true` to promote warnings to errors, or `severityOverrides` to tune them."

### 3.11 `assertValidInteractConfig` overstated

**Where:** L4723 (`using sequences` §5): "This catches dangling `sequenceId`/`effectId` references, negative `offset`/`delay` values, and unused sequence definitions (`UNUSED_SEQUENCE`) before they reach the runtime."

**What is true:** `assertValidInteractConfig` throws only when `result.valid === false`, i.e. only on **errors** (`interact-validate/src/structural.ts:83-88`). Of the four items listed, only `SEQUENCE_ID_NOT_FOUND` and the negative `offset`/`delay` checks are errors. `EFFECT_ID_NOT_FOUND` and `UNUSED_SEQUENCE` are warnings and will **not** throw.

**Fix:** Split the sentence by severity, and show `validateInteractConfig(config)` (which returns everything) alongside `assertValidInteractConfig(config)` (which throws on errors only).

### 3.12 `SequenceConfig` type is incomplete

**Where:** L4534-4539 (`what is a sequence?`).

**What is true** (`src/types/config.ts:9-20`):

```ts
type SequenceConfig = {
  effects: (Effect | EffectRef)[];              // REQUIRED
  delay?: number;                                // ms before the whole sequence starts
  offset?: number;                               // ms between consecutive participants
  offsetEasing?: string | ((p: number) => number); // distributes the offsets
  sequenceId?: string;                           // id for referencing / caching
  conditions?: string[];                         // gate the whole sequence
  triggerType?: TimeAnimationTriggerType;        // playback behaviour for the sequence
};
```

The doc's snippet omits `delay`, `sequenceId`, `conditions` and `triggerType`, and types `offsetEasing` as `string` only. `triggerType` in particular is important — it is documented on the *other* sequences page (L4686) but missing from the type on this one.

**Fix:** Replace the snippet with the full type and annotate each field. Defaults from `resolveSequenceForCSS` (`src/core/resolvers.ts:118-129`): `delay = 0`, `offset = 0`, `offsetEasing = 'linear'`, `triggerType` falls back to the trigger's default (`once` for `viewEnter`/`animationEnd`, `alternate` for `hover`/`click`/`interest`/`activate`).

### 3.13 Reduced motion is not detected automatically

**Where:** L3023 (`keyframe Effects`): "The library skips pointer-driven effects entirely when reduced motion is preferred." L1867 (`pointerMove`): "`pointerMove` effects are skipped when reduced-motion mode is enabled."

**What is true:** the runtime reduced-motion flag is **only** `Interact.forceReducedMotion` (`src/core/add.ts` — every handler call site passes `reducedMotion: Interact.forceReducedMotion`). Nothing in `@wix/interact` reads `prefers-reduced-motion` on its own. The OS preference reaches the config only through a `media` condition you write, or by assigning `Interact.forceReducedMotion` yourself (as L2585 correctly shows).

**Fix:** Rewrite both statements as: "`pointerMove` effects are skipped when `Interact.forceReducedMotion` is `true`. Interact does **not** read the OS `prefers-reduced-motion` setting automatically — either set `Interact.forceReducedMotion` yourself before `Interact.create()`, or gate effects with a `prefers-reduced-motion` media condition." Add the same clarification to the reduced-motion sections at L2550-2585, L2868-2891 and L4000-4027.

### 3.14 `viewProgress` is also skipped under forced reduced motion

**Where:** the `viewProgress` chapter never mentions it.

**What is true:** `src/handlers/viewProgress.ts:25-27` returns early when `reducedMotion` is set — identical to `pointerMove`.

**Fix:** Add the same "skipped under forced reduced motion" note to the `viewProgress` chapter, mirroring L1867 so the two continuous-trigger chapters are parallel.

### 3.15 The `contain` range definition is imprecise

**Where:** L1621: "`contain` — While the element is fully contained in the viewport (great with sticky)."

**What is true:** per the CSS spec (and `rules/full-lean.md:429`), `contain` covers the period during which the subject is fully contained by **or fully contains** the scrollport. The second half matters precisely for the sticky/scrolly-telling pattern the same page teaches, where the subject is taller than the viewport.

**Fix:** "While the element is fully inside the viewport — or, for elements taller than the viewport, while it fully covers it. This is the phase a `position: sticky` child stays pinned, which is why it pairs with scrolly-telling."

### 3.16 Sequence trigger support omits `animationEnd`

**Where:** L4678 (`using sequences`): "Sequences work with the same triggers as single effects: `viewEnter`, `hover`, `click`, `interest`, `activate`." L2071 (`animationEnd`): "`animationEnd` starts an effect **or sequence** after another animation finishes."

**What is true:** `_attachSequenceTriggers` (`src/core/add.ts:376-399`) dispatches through `TRIGGER_TO_HANDLER_MODULE_MAP[interaction.trigger]` and passes the sequence as `animation`. The `animationEnd` handler accepts `preCreatedAnimation` (`src/handlers/animationEnd.ts:24`), so sequences do work with `animationEnd`. `viewProgress` and `pointerMove` ignore the pre-created animation, so sequences are meaningless there — which the `viewProgress` chapter (L1751) already explains correctly.

**Fix:** Add `animationEnd` to the L4678 list, and state explicitly that sequences are not supported on `viewProgress` / `pointerMove` (with the L1751 rationale), so the two pages agree.

### 3.17 `animationEnd` chain isolation is conditional

**Where:** L2161: "Unrelated animations finishing on the same element do not activate the chain."

**What is true:** the handler filters on `sourceAnimationOptions` (`src/handlers/animationEnd.ts:45-60`). When the source's preceding effect resolves to a CSS animation, the filter checks `hasAnimationName` / `hasAnimationId` and the claim holds. When `sourceAnimationOptions` is absent (e.g. the awaited effect is not a CSS animation on that element), `sourceAnimationGroup` is `null` and the handler plays on **any** `animationend` from the source.

**Fix:** Soften to: "When the awaited effect resolves to a CSS animation on the source, unrelated animations finishing on that element are filtered out. Keep the awaited `effectId` on a CSS-backed effect (`keyframeEffect` or `namedEffect`) for reliable chaining."

### 3.18 Ongoing presets: `iterations: Infinity` is not valid on scrub triggers

**Where:** L2633 (`Named Effects` category table): Ongoing → "any trigger, with `iterations: Infinity`". L2833: "Start one with any trigger and set `iterations: Infinity`."

**What is true:** `iterations` on a scrub effect must be finite (`rules/full-lean.md:403` — "NOT Infinity"); an infinite iteration count has no meaning on a scrubbed timeline.

**Fix:** "any **time-based** trigger (`viewEnter`, `hover`, `click`, `animationEnd`), with `iterations: Infinity`."

### 3.19 `transition` and `transitionProperties` are mutually exclusive, `transition` wins

**Where:** L2319-2331 (`What are effects?`) presents them as "OR"; L3108 (`transition Effects`) explains when to reach for each. Neither states what happens if both are set.

**What is true:** `src/utils.ts:62-95` — if `transition?.styleProperties` is present, `transitionProperties` is ignored entirely. (`rules/full-lean.md:452` claims per-property entries take precedence — that is wrong; see [Appendix A](#appendix-a--upstream-fixes-outside-this-file).)

**Fix:** Add: "Set one or the other. If both are present, `transition` wins and `transitionProperties` is ignored."

### 3.20 A transition with no `duration` produces no transition

**Where:** the `transition` type is shown with `duration?: number` (optional) at L2326 and L3091, with no note.

**What is true:** `transitionEffectToTransitionsList` (`src/utils.ts:65`, `:89`) emits nothing when `duration` is falsy — for `transition` the whole block is skipped, and `transitionProperties` entries without `duration` are filtered out. The state still applies, but instantly, with no animation.

**Fix:** Annotate `duration` in both type snippets: "Optional in the type, but required in practice — without it the state change is applied with no transition."

### 3.21 The first tutorial teaches an anti-pattern the docs later forbid

**Where:** L266-290, L352-378, L411-440 (`My first interaction`) — a `hover` trigger scaling the hovered element itself (`keyframes: [{ scale: 2 }]`, no `selector`, no separate target `key`).

**Why this is a problem:** the same documentation set marks this CRITICAL elsewhere — L1262-1263 ("Keep the hover hit area stable"), L2440, L3497 — and `@wix/interact-validate` has a dedicated `HIT_AREA_SHIFT` rule for it. A `scale(2)` on the hovered element is the textbook case: the element grows out from under the pointer, `mouseleave` fires, the animation reverses, the element shrinks back under the pointer, and it flickers.

(Note: the validator's `checkHitAreaShift` only inspects `transform` **strings** for `translate|scale|matrix` (`interact-validate/src/semantic/fouc.ts:59-64`), so the bare `scale: 2` keyframe property used here escapes detection — the example is unsafe *and* invisible to the linter.)

**Fix:** Change the first tutorial to a safe pattern — either a modest, non-geometry effect on the element itself (e.g. `opacity` / `filter` / `boxShadow`), or keep the scale but move it to a child via `selector`. Also reduce `scale: 2` to something realistic (`1.05`). This is the first code a reader ever runs; it should model the house rules.

### 3.22 Dangling `effectId` references in the landing-page examples

**Where:** L59-89 and L119-148 (`About Interact`) — configs reference `effectId: "headline-reveal"`, `"hero-image-animate"`, `"card-reveal"`, `"image-animate"` with no top-level `effects` registry.

**Why this matters:** these are the first configs a reader sees, they are typed as `InteractConfig`, and they would produce `EFFECT_ID_NOT_FOUND` warnings and animate nothing.

**Fix:** Either add a minimal `effects` registry to make them runnable, or replace `effectId` with inline `namedEffect` payloads. Also add the missing `listContainer`/`listItemSelector` consistency between the two examples (L74-86 has them, L135-144 does not, for the same described behaviour).

---

## 4. Missing information

Ordered by impact.

| # | Missing | Where it belongs |
| :---- | :---- | :---- |
| M1 | **FOUC chapter does not exist.** L1093 points at a Google Doc instead. FOUC is referenced from 6 pages (L515, L771-777, L1091, L2812, L3490-3492, L4481) but never explained in one canonical place. | New/expanded page; the `HTML integration` §"Generating CSS & preventing FOUC" (L754-777) is the best existing draft and should be promoted. |
| M2 | **The named-easing catalogue is never listed.** Examples use `backOut` (L2607, L4085) with no reference. `@wix/motion` accepts `sineIn/Out/InOut`, `quadIn/Out/InOut`, `cubicIn/Out/InOut`, `quartIn/…`, `quintIn/…`, `expoIn/…`, `circIn/…`, `backIn/Out/InOut`, plus all CSS easings and `linear(…)`. | `What are effects?` → Timing & easing reference (L2591-2607). |
| M3 | **FOUC guidance for non-`once` effects.** The rules state: for `repeat`/`alternate`/`state`, apply the starting keyframe manually (inline styles or stylesheet) and use `fill: 'both'`. Only hinted at (L1350, L3528). | FOUC chapter + `viewEnter` chapter. |
| M4 | **`data-interact-enter`** — the attribute that drives FOUC (`start` / `done`) is undocumented, yet users will see it in DevTools. | FOUC chapter. |
| M5 | **CSS embedding options.** `rules/full-lean.md:634-658` documents three placements including `<style blocking="render">`, which is the strongest FOUC guard. Not in the docs. | `HTML integration`. |
| M6 | **`Interact.create(config, options)`** — `options.useCustomElement` is undocumented (L787 shows `options?` but never explains it). | `HTML integration` → Static API reference. |
| M7 | **`Interact.setup()` replaces rather than merges** `viewEnter` options across calls (`src/handlers/viewEnter.ts:60-62` assigns). | `HTML integration` → `Interact.setup`. |
| M8 | **`Interact.forceReducedMotion` must be set before `Interact.create()`** — it is read at handler-attach time, not re-read afterwards. | Reduced-motion sections (L2585, L4026). |
| M9 | **`transitionDelay`** is a valid scrub/pointer smoothing option (`src/types/effects.ts:53`) — omitted from L1908-1911 and L2278. | `pointerMove`, `What are effects?`. |
| M10 | **Scrub effects also accept `iterations`, `alternate`, `reversed`** (`src/types/effects.ts:42-55`) — omitted from the scrub snippet at L2271-2282. | `What are effects?`. |
| M11 | **`iterations: 0` is treated as `Infinity`** (per rules). | `What are effects?` → Time Effects. |
| M12 | **Selector conditions support `&`** — the predicate may contain `&`, replaced by the base selector (`src/utils.ts:41-46`). Without it, the predicate is appended. Documented in the rules, missing here. | `understanding conditions` → Selector conditions. |
| M13 | **Perspective guidance** — prefer `transform: perspective(…)` inside keyframes; use the CSS `perspective` property only when multiple children share a `perspective-origin` (`rules/full-lean.md:42`). Relevant to the 3D tilt examples (L1934, L3815). | `What are effects?` → Performance, and `pointerMove`. |
| M14 | **`interest` and `activate` have no chapter**, although the trigger overview (L994-996) promises "Each trigger has its own chapter". | Either add a short chapter, or change the overview to say they are covered inside `click & hover`. |
| M15 | **`hover`/`click`/`interest`/`activate` take no `params`** — stated only obliquely (L1029). | Trigger overview table. |
| M16 | **`customEffect` makes a config non-JSON-serializable** — worth stating given the "LLM-friendly / JSON config" positioning on the About page. | `custom Effects` + About. |
| M17 | **`@wix/motion-presets` also exports experimental `Bg*` background-scroll presets** (marked "NOT PRODUCTION READY" in source) which `import * as presets` will pull in. | `Named Effects`. |
| M18 | **`CustomMouse`** is exported from the mouse category (12 exports, 11 documented). Either document it or state that it is excluded. | `Named Effects` → Mouse. |
| M19 | **`generate()` must be re-run after `registerEffects()`** for each config — and presets must be registered in **both** the build/SSR process and the client bundle. | `HTML integration` → Named effects. |
| M20 | **Inline state effects get a generated id** — L1476 explains this well, but the consequence (pre-generated CSS from a separate build will not match the client's generated ids) deserves promotion to a callout rather than a paragraph. | `click & hover`, `transition Effects`. |
| M21 | **`remove(key)` tears down the whole controller for that key** — all interactions bound to that element, not a single interaction. L719 is right but terse; add that re-binding requires `add()` again. | `HTML integration` → Vanilla JS API. |
| M22 | **`useSafeViewEnter`** is mentioned only in passing (L1075) and is missing from the `params` list at L1070-1073 and from the `Interact.setup({ viewEnter })` description. | `viewEnter`. |
| M23 | **Browser support** — no statement anywhere. `ViewTimeline` is feature-detected with a `fizban` fallback (`src/handlers/viewProgress.ts:36-53`); `:state()` / `:--` state selectors have a `[data-interact-effect~=…]` fallback; custom elements are required (`Interact.init` bails when `window.customElements` is absent). | New short section on the `HTML integration` page. |
| M24 | **SSR caveat** — `Interact.init()` returns immediately when `typeof window === 'undefined'` (`src/core/Interact.ts:61-63`). Worth stating explicitly next to the React `useEffect` guidance. | `HTML integration` → React. |

---

## 5. Content to remove (authoring residue)

### 5.1 Owner / Reviewer attribution lines — 27 instances

L3, L184, L250, L458, L829, L847, L959, L1004, L1184, L1560, L1859, L2065, L2171, L2611, L2895, L3066, L3169, L3335, L3391, L3644, L3766, L3881, L4042, L4304, L4448, L4514, L4622.

All contain internal Wix email addresses. **Delete every one.** If attribution is wanted, move it to repository metadata, not the published page.

### 5.2 Emoji role markers in page headings

Every page heading is prefixed with 🧑‍🌾 or 🧑‍💻 (apparently marking content-writer vs. developer authorship). Strip all of them from the published titles.

### 5.3 Placeholder and dead links

| Type | Count | Lines |
| :---- | :---- | :---- |
| `http://ADDLINK` / `(ADDLINK)` | 22 | L174-176, L295, L388, L462 (×3), L470, L478, L514, L822-825, L1918-1919 area, L2811, L3946, L4031, L4035-4038 |
| `https://www.google.com/search?q=ADDLINK` | 3 | L4616-4618 |
| Empty `()` links | 5 | L865, L874, L878, L882, L1000, L1203, L1865, L3243 |
| Fake internal URLs `http://Configuration/...` | 8 | L1736, L1749, L3438, L3623, L3697, L3714, L3762, L3770, L3859, L3875 |
| Internal Google Docs link | 1 | **L1093** |
| In-page anchors to sections that may not survive the site build | 2 | L3482 (`#when-source-and-target-differ-fouc-and-refined-targets`, `#lists-listcontainer-and-listitemselector`), L514 (`#named-effects-registereffects`) |

**Action:** build a link map (page slug ↔ target) and resolve all of them. Nothing with `ADDLINK`, `google.com/search`, `docs.google.com`, or `http://Configuration/` may ship.

### 5.4 Editorial notes and TODOs left in body copy

| Line | Content |
| :---- | :---- |
| L13 | `## [ A very cool visual example should be added here for a capabilities showoff]` |
| L29 | `[Add link to Rules and/or Skills]` |
| L452 | `TO DO ADD VISUAL DEMONSTRATION` |
| L994 | `*(In the live page, each trigger name links to its own chapter — a ↗ icon appears to its left and it underlines on hover.)*` — a note to the site builder |
| L1180 | "Because of the current threshold limitation above, do not describe `threshold: 0.5` as a guaranteed 50%-visible gate yet." — reviewer note; also a **dangling reference** (no threshold limitation is described above) |
| L1730 | `(maybe next to it an 'out' animation for visual comparison)` |
| L3337 | `[Explain that interaction is the connection between a trigger and effects.]` |
| L3341 | `*[Visual example: A scroll-based interaction…]*` |
| L4298 | `(see reduced motion <add link to understanding condition - reduced motion>)` |
| L4612 | "Overshooting durations: If your sequence contains structural loops or heavy offsets…" — "structural loops" is not a concept in this library; the sentence is not actionable |

### 5.5 Google Docs export artifacts

| Artifact | Instances | Example |
| :---- | :---- | :---- |
| Backslash-escaped Markdown (`\-`, `\+`, `\[`, `\*\*`, `` \` ``, `\<`, `\#`) | ~60 | L23, L94, L454, L833-839, L1207-1212, L2183, L2232, L2674, L2790-2793, L2812, L2831, L2864, L3078-3080, L3159-3161, L4304 |
| Smart quotes (`'`, `"`) — including **inside code-like text** | 18 | L1863-1872, L2921, L2971, L3002-3003, L3021-3023, L3078-3080, L3108, L3161 |
| Callout/admonition text merged into a heading | 4 | L454, L2674, L2812, L2831 |
| YAML frontmatter rendered as a heading | 3 | L2899, L2973, L3173 |
| Code samples rendered as single-cell tables | 5 | L4473-4477, L4487-4491, L4504-4505 |
| Stray label lines (`TypeScript`, `HTML`) outside fences | 4 | L4532, L4555, L4597 |
| Duplicated nav markers | 2 | L178-180 (`# Getting Started` / `# Getting Started Tab`) |
| Orphan MDX components inside plain fences | 2 blocks | L260-322 (`<Steps>` / `<Step>`), L345 & L408 (stray `</Step>`) |
| Empty headings | 6 | L252, L853, L977, L2067, L2589, L3070, L3998 |
| Empty blockquote / stray bullet | 2 | L2263 (`>`), L3315 (`*`) |
| Bare URL as page content | 1 | L5 |

### 5.6 Content that duplicates other pages and should be cut or cross-linked

| Duplicate | Lines | Recommendation |
| :---- | :---- | :---- |
| Install instructions appear twice, with different wording | L188-206 and L472-484 | Keep the `Installation and Entry points` version as canonical; on `HTML integration`, replace with a one-line pointer. |
| Entry-point table appears twice, with different "use when" columns | L212-216 and L465-468 | Merge into one table; use it on the Installation page and link from Integration. |
| `registerEffects` setup appears three times | L496, L728-750, L2650-2674 | Canonical: `Named Effects` page. Others link to it. |
| `triggerType` table appears four times with different wording | L1031-1036, L1248-1253, L1356-1361, L2256-2261 | Keep the per-trigger tables (they legitimately differ per trigger) but make the wording of each row identical across pages. Add the `viewEnter` column to the effects-page table only. |
| `stateAction` table appears twice | L1465-1470, L2334-2339 | Same treatment. |
| `composite` explanation appears three times | L2228-2232, L3863-3873, L1023 | Canonical: `multi-interaction compositions`. Others summarise in one line + link. |
| Reduced motion appears four times | L2550-2585, L2868-2891, L4000-4027, L4296-4298 | Canonical: `understanding conditions` → Reduced motion. Others link. |
| `overflow: hidden` caveat appears three times | L1581-1601, L2311, L2831 | Canonical: `viewProgress`. Others summarise + link. |
| Scroll-preset `range` requirement appears twice | L1704-1732, L2831 | Canonical: `viewProgress`. |
| "Don't guess preset options" appears three times | L1732, L2546, L2790 | Canonical: `Named Effects`. |
| Hit-area-shift warning appears four times | L1262-1263, L2440, L3497, L2060 | Canonical: `source and target resolving`. |

### 5.7 Miscellaneous content to drop

- L288, L374, L434, L1318, L1407, L1798 — `effects: {}` empty registries. Noise; delete.
- L507 — pinned version `@wix/interact@2.5.1` is stale (current is 2.5.4). Either bump or use a neutral `@x.y.z` placeholder that will not rot.
- L15 — `## This experience was built with Interact.` — an orphan H2 with no body.
- L2263 — a `>` line with no content.

---

## 6. Structure and navigation

### 6.1 Two H1s per page

Almost every page opens with the site-page marker (`# 🧑‍💻 viewEnter`) followed by an in-page H1 (`# Entrance Animations (\`viewEnter\`)`). Pick one: the page marker becomes the site nav title (frontmatter `title`), and the body starts at H2. Applies to all 27 pages.

### 6.2 Page titles are inconsistently cased

Current mix: `About Interact`, `Installation and Entry points`, `My first interaction`, `HTML integration`, `the config object`, `what is a trigger?`, `viewEnter`, `click & hover`, `keyframe Effects`, `transition Effects`, `custom Effects`, `Named Effects`, `what is an interaction?`, `source and target resolving`, `effects array & cascading logic`, `multi-interaction compositions`, `understanding conditions`, `responsive animation design`, `what is a list?`, `using lists`, `what is a sequence?`, `using sequences`.

**Recommendation:** sentence case for all page titles, keeping API identifiers in code font: *"What is a trigger?"*, *"Keyframe effects"*, *"Transition effects"*, *"Custom effects"*, *"Named effects"*, *"Source and target resolving"*, *"Effects array and cascading logic"*, *"Using lists"*.

### 6.3 Nav title does not match page content

- **`keyframe Effects`** (L2893) actually covers *time effects* (named + keyframe) **and** *scrub effects* including pointer properties. Either rename the page to "Time and scrub effects" or split the scrub half out and move the pointer content into the `pointerMove` chapter (see §6.5).
- **`transition Effects`** (L3064) and the `What are effects?` page's "State Effects" (L2315) are the same concept under two names. Pick one — see §8.

### 6.4 Promised chapters that do not exist

L994-996 says each of the eight triggers has its own chapter. Only six chapters exist (`viewEnter`, `click & hover`, `viewProgress`, `pointerMove`, `animationEnd`). `interest` and `activate` have none. Either add them or amend the promise.

### 6.5 Pointer content is split across three pages

`pointerMove` (L1857-2061), `keyframe Effects` → "Advanced pointer properties" (L3019-3023), and `custom Effects` → `pointerMove` (L3261-3303) all describe the same parameters — and the middle one is wrong (§3.8).

**Recommendation:** `pointerMove` owns the parameter reference. The other two keep only their payload-specific angle (how a `keyframeEffect` maps a single axis; what the progress object looks like in a `customEffect`) and link out.

### 6.6 Section-ordering inconsistency across parallel pages

The five trigger chapters do not follow a common order:

| Page | Order |
| :---- | :---- |
| `viewEnter` | intro → how it works → triggerType → params → caveats → FOUC → examples |
| `click & hover` | intro → payload families → a11y → conditions → hover → click → state effects → presets |
| `viewProgress` | intro → how it works → caveat → params → examples → presets → advanced pattern |
| `pointerMove` | intro → progress model → params → smoothing → payloads → examples → FOUC |
| `animationEnd` | intro → params → examples → chaining → rules |

**Recommendation** — canonical trigger-chapter order:
1. What it is / when to use it
2. How it works (underlying platform API)
3. Trigger `params`
4. Effect-level options (`triggerType` / `stateAction` / `range*`)
5. Caveats and pitfalls
6. Examples (config + HTML + CSS + **Result**)
7. Working with presets
8. See also

The same applies to the two effect-page pairs (`what is a list?` / `using lists`; `what is a sequence?` / `using sequences`) — the "what is" pages should be conceptual with one illustrative example; the "using" pages should be task-oriented with a consistent step structure.

### 6.7 "See also" blocks are inconsistent

Only 4 of 27 pages have one (L172-176, L820-825, L4033-4038, L4614-4618, L4725-4729), and two of those have unresolved links. **Recommendation:** every page ends with a "See also" list of 3-5 links, or none do. Given the site's cross-referential nature, add them everywhere.

### 6.8 The "Getting Started" tab has an ordering problem

`Installation and Entry points` → `My first interaction` → `HTML integration` → `The final result`. But `HTML integration` (L456-825) is by far the most complete integration reference and largely supersedes `Installation and Entry points`. Consider merging them, or clearly scoping the first page to "install + choose an entry point" and the second to "wire it up" (see §5.6).

### 6.9 The `My first interaction` page has no tab structure

L260-448 present three integrations (React, Web Components, Vanilla) sequentially, with the React one still wrapped in raw `<Steps>`/`<Step>` MDX inside a code fence, an orphan `</Step>` at L345 and L408, and a prose sentence sitting inside a bare code fence at L348-350. The three variants also have no headings identifying which is which.

**Fix:** rebuild as proper tabs (or three clearly-headed subsections), one per entry point, each with identical step structure: *1. Add the markup → 2. Define the config → 3. Create the runtime → 4. Clean up*.

### 6.10 Remaining structural defects

| # | Issue | Line |
| :---- | :---- | :---- |
| a | "every integration follows the same **three** steps" — followed by a four-item list | L511-516 |
| b | `## **Set up an Interaction**  Types of triggers` / `Types of effects` — three headings collapsed into one line plus an orphan | L252-256 |
| c | `## **Combining triggers**` → body is `See [here]()` | L998-1000 |
| d | `The final result + examples links` page is an unwritten bullet outline | L827-842 |
| e | Empty `## ` / `# ` headings | L252, L853, L977, L2067, L2589, L3070, L3998 |
| f | `Named Effects` §"3. Reference the preset by name" is buried inside a merged heading, so the numbered setup sequence reads 1 → 2 → (nothing) | L2674 |

---

## 7. Authoring style — the house style decision

Three distinct voices are present:

**Style A — narrative reference (detailed).** Concept framing → mechanism → caveats → complete worked example (config + HTML + CSS) → **Result:** paragraph → "Key remarks". Used by: `HTML integration`, `viewEnter`, `click & hover`, `viewProgress`, `source and target resolving`, `effects array & cascading logic`, `multi-interaction compositions`, `understanding conditions`, `what is a list?`.

**Style B — terse spec.** Type snippet → bullet list of fields → minimal fragment example, no HTML, no result. Used by: `pointerMove`, `animationEnd`, `keyframe Effects`, `transition Effects`, `custom Effects`, `using sequences`.

**Style C — marketing/conceptual.** No code, or code without context; diagram-style pseudo-blocks. Used by: `About Interact`, `what is an interaction?`, `what is a trigger?`.

**Decision (per the brief — prefer the clearer, more detailed version): adopt Style A as the house style for every reference and how-to page.** Keep Style C only for `About Interact` and the two "what is…" conceptual openers, and even there add one runnable example.

### 7.1 Canonical page template

```
# <Page title>                      ← sentence case, no emoji, no owner line

<1-2 paragraph intro: what this is and when you reach for it>

## How it works
<the underlying mechanism — platform API, where it runs, what it maps to>

## <Parameters / Options>
<table: name | type | default | description — always include a Default column>

## <Behaviour tables>                ← triggerType / stateAction / range names
<identical row wording across pages>

## Caveats
<callouts, using a single consistent admonition set — see 7.3>

## Example: <specific, named scenario>
<config> <html> <css>
**Result:** <one paragraph describing what the user sees>

## See also
- 3-5 links
```

### 7.2 Pages that must be brought up to Style A

| Page | Missing relative to Style A |
| :---- | :---- |
| `pointerMove` | No HTML markup with any example; no **Result:** paragraphs (only one, at L2054, and it is not bolded like the others); no "See also". |
| `animationEnd` | No HTML; examples are config fragments only; "Important rules" is a flat bullet list where other pages use prose + callouts. |
| `keyframe Effects` | Leftover frontmatter headings; two examples are unlabelled fragments; the accessibility paragraph (L2971) is a wall of prose where other pages use a code example. |
| `transition Effects` | Three long unbroken prose paragraphs (L3078-3080, L3108, L3159-3161) where the parallel `click & hover` state section uses tables + examples; no HTML; no **Result:**. |
| `custom Effects` | No **Result:** paragraphs; the cancellation example (L3317-3329) has broken indentation and a TS cast in a JS fence. |
| `using sequences` | Numbered-step format is fine, but examples are fragments with no HTML, no **Result:**, and two unlabelled fences. |
| `using lists` | Examples are tables (B6); needs a full rebuild. |
| `what is an interaction?` | Purely conceptual with pseudo-code blocks; should carry at least one real config. |
| `responsive animation design` | Good examples, but no HTML, no **Result:**, and the "Best practices" section is a bullet list where other pages use prose. |

### 7.3 Admonition set

Currently in use: `> **Info:**`, `> **Tip:**`, `> **Note:**`, `> **Important:**`, `> **CRITICAL:**`, `> **Pitfall:**`, `> **Reminder:**`, `> **Don't guess…**`, `### **⚠️ Pitfalls**`, and plain bold paragraphs ("**Key remarks**", "**Notes**", "Two rules that trip people up", "Two things to keep in mind").

**Standardise on four:** `Note`, `Tip`, `Warning`, `Critical`. Map: Info/Note/Reminder → **Note**; Tip → **Tip**; Pitfall/Important → **Warning**; CRITICAL → **Critical**. Convert "Key remarks" / "Notes" / "Two rules that trip people up" / "Two things to keep in mind" into a consistent `## Key points` section or into individual admonitions.

### 7.4 Example naming

Currently: `### Example: a feature card reveal`, `### Example: a counter that plays on every visit`, `### **Example: a product card that responds in layers**`, `### Real-world example: card entrance`, `### Real-world example: theme switcher`, `### Basic transition effect`, `### Example: named effect`, `### **Example: Staggering Card Entrances**`, `## Example: composing two keyframe effects`.

**Standardise on:** `### Example: <lowercase scenario description>` — drop "Real-world", drop Title Case, drop the bold wrapper.

### 7.5 The "Result:" convention

Used on some pages as `**Result:**` (L1698, L1853, L3436, L3691, L3855), on others as plain `Result:` (L1138, L1180, L1348, L1434, L1532, L2054), and omitted entirely on five pages. **Standardise on bolded `**Result:**` after every complete example**, and add one to every example that lacks it.

---

## 8. Terminology consistency

Pick one term per row and apply it throughout.

| Concept | Currently used | Recommended |
| :---- | :---- | :---- |
| The state/transition effect kind | "State Effect" (L2189, L2315), "Transition effect" (L3072), "CSS style toggle", "state effects" | **"State effect"** everywhere; on the dedicated page, open with "State effects (also called transition effects, after the `transition` field)". |
| The scrub effect kind | "Scrub Effect" (L2188), "scroll-driven", "continuous trigger", "progress-based" | **"Scrub effect"** for the effect kind; **"continuous trigger"** for `viewProgress`/`pointerMove`. |
| The time effect kind | "Time Effect", "Time effects", "time-based effect", "time-based animation payload", "event trigger" | **"Time effect"** for the effect; **"event trigger"** for the trigger. |
| Presets | "named effect", "namedEffect", "preset", "Named Effects", "ready-made effects" | **"named effect"** in prose, `namedEffect` for the field, "preset" only when referring to the `@wix/motion-presets` package contents. |
| The library | "Interact", "@wix/interact", "the library", "`@wix/interact`" | **"Interact"** in prose; `@wix/interact` when naming the package. |
| The flash problem | "flash of un-animated content (FOUC)" (L515), "Flash of Unstyled Content (FOUC)" (L2058), "Flash Of Un-styled Content (FOUC)" (L3490), "entrance flash" (L1091, L1350) | **"flash of unstyled content (FOUC)"**, defined once, abbreviated thereafter. |
| The keyed element | "keyed element", "keyed root", "root element", "the `<interact-element>`", "the element registered for the key" | **"keyed element"** for the bound element; **"root"** only inside resolution descriptions where it is defined. |
| Concept capitalisation | "Interaction"/"interaction", "Effect"/"effect", "Sequence"/"sequence", "Condition"/"condition", "Trigger"/"trigger" — inconsistent within single pages (e.g. L855-882 vs L2177) | **Lowercase** in prose; capitalise only when naming the TypeScript type (`Interaction`, `Effect`) or the React component (`<Interaction>`). |
| Source/target | `SOURCE`/`TARGET` uppercase comments used in ~half of the examples | Use them in **every** example where source ≠ target; omit where they are the same. |
| `key` terminology | "interaction key", "element key", "`data-interact-key`", "interactKey" | **"key"** generically; name the binding mechanism per integration once, in the resolution chapter. |
| Effect-registry entries | "the top-level `effects` map", "the effects registry", "`EffectRef`" | **"the `effects` registry"**; use `EffectRef` only when naming the type. |

---

## 9. Code-sample consistency

| # | Issue | Instances | Recommendation |
| :---- | :---- | :---- | :---- |
| C1 | Fence languages: `ts` (80), `javascript` (27), `html` (21), `css` (7), `shell` (6), `typescript` (2), `tsx` (2), `java` (1), none (~18) | throughout | **`ts`** for all TypeScript/config, **`tsx`** for JSX, **`js`** only where the sample is deliberately plain JS, **`html`**, **`css`**, **`bash`** for shell. Fix `java` at L4557. Label all 18 unlabelled fences (L599, L656, L2678, L4680, L4700 and others). |
| C2 | Indentation: 2-space on most pages, 4-space on `keyframe Effects` and `transition Effects` (L2909-2938, L3089-3129) | 2 pages | 2 spaces everywhere. |
| C3 | Quotes: single in most `ts` samples, double in the About page and `using lists` samples | ~6 samples | Single quotes. |
| C4 | Keyframe values: `opacity: 0` (number) vs `opacity: '0'` (string) — both valid, mixed within the same page | throughout | Pick **numbers** for numeric properties, strings for anything with a unit or function. |
| C5 | Config fragments vs. complete configs — most examples are bare object fragments that will not compile if pasted | ~40 samples | Wrap every example a reader might copy in `const config: InteractConfig = { interactions: [ … ] };`. Keep fragments only for field-level illustration, and prefix them with `// inside interactions[]`. |
| C6 | `Interact.create(config)` shown in some examples, omitted in most | mixed | Include it only in "getting started"/integration examples; omit consistently in reference examples. |
| C7 | Broken indentation | L2950-2951 (`params: { threshold: 0.3 }` split across lines before a comma), L3813-3816 (`keyframeEffect: {` / `     name:`), L3319-3328 (custom-effect cancellation) | Reformat. |
| C8 | TypeScript syntax inside `javascript` fences | L3266 (`type PointerProgress = …`), L3319 (`element as HTMLCanvasElement`) | Change fence to `ts`. |
| C9 | Nested/doubled fences (```` inside ```) | L260-322, L326-346, L390-409, L2907-2919, L2925-2940 | Flatten. |
| C10 | Literal ellipses inside otherwise-valid code | L4504 (`keyframes: [...]`), L2308 (`/* ... */`), L3708-3709 | Use `/* … */` consistently, or complete the sample. |
| C11 | Smart quotes inside code-adjacent text | L3002-3003, L3021-3023 (`‘percentage’`, `‘self’`, `‘root’`, `‘both’`) | Convert to straight quotes and wrap in backticks. |
| C12 | Type snippets styled as `css` | L2286-2288 (`animation-range: { name: … }` in a `css` fence — that shape is TypeScript, not CSS) | Change to `ts` and remove the invented `animation-range:` prefix. |

---

## 10. Markdown and formatting defects

| # | Defect | Line | Fix |
| :---- | :---- | :---- | :---- |
| F1 | **Broken table** — a 3-column table row contains an unescaped `\|` inside a type union, producing a 4-cell row | L3918 (`\| \`type\` \| \`'media'\` \| \`'selector'\` \| How the condition is evaluated. \|`) | Escape as `` `'media'` \| `'selector'` `` or move the union into the description cell. |
| F2 | Bold-wrapped headings (`## **Title**`) | ~90 headings | Remove the `**`; heading level already conveys emphasis. |
| F3 | Table alignment markers inconsistent: `:----` on most tables, `-----` on others | L1248-1253, L1356-1361, L1465-1470 | Use `:----` everywhere. |
| F4 | Trailing double-space line breaks (Google Docs soft wraps) creating unintended `<br>` | throughout bullet lists, e.g. L1038-1041, L2195-2198, L3399-3400 | Strip. |
| F5 | Non-breaking / stray whitespace at line ends | L15, L380, L442, L1885, L2864, L4569 | Strip. |
| F6 | Escaped backticks inside headings and prose, rendering as literal `` \` `` | L454, L2674, L2812, L2831, L2864, L2905, L2921 | Unescape. |
| F7 | Table cells containing multi-line code (the `using lists` samples) | L4473-4505 | Convert to fenced code blocks. |
| F8 | Heading levels skip (H1 → H3 with no H2) | L2652 (`### 1. Install the package` under an H2 that is itself inside a merged heading), L4630 | Normalise. |
| F9 | Inconsistent list markers (`*` vs `-`) — `*` on the 🧑‍🌾-authored pages, `-` on the 🧑‍💻 pages | throughout | Use `-` everywhere. |
| F10 | `✅` / `⚠️` / `❌` emoji used as semantic markers in some places only | L2536-2537, L1590-1596, L3540, L3551, L3702, L4609 | Keep `❌`/`✅` for do/don't code pairs (they read well); replace bare `⚠️` headings with the standard Warning admonition. |

---

## 11. Per-page action list

### About Interact / Overview (L1-176)
- Remove owner line (L3), bare URL (L5), visual placeholder (L13), `[Add link…]` (L29), orphan H2 (L15).
- Fix dangling `effectId` references in both configs (§3.22); add the `effects` registry or inline the payloads.
- Make the two configs (L59-89, L119-148) consistent with each other — same keys, same list fields.
- Label the three unlabelled fences (L41, L49, L57); the first two are conceptual pseudo-blocks and should be prose or a diagram, not code fences.
- Resolve the three `See also` links (L174-176).
- Add a sentence noting that configs are JSON-serializable **except** `customEffect` (M16).

### Getting Started (nav) (L178-180)
- Delete the duplicated marker lines.

### Installation and Entry points (L182-246)
- Remove owner line (L184).
- Reconcile the entry-point table with L465-468 (§5.6); keep one canonical version here.
- Add a note that `generate()` is exported from all three entry points.

### My first interaction (L248-454)
- Remove owner line (L250); fix the mangled headings (L252-256).
- Rebuild as three labelled tabs/subsections with identical step structure (§6.9); remove the raw `<Steps>`/`<Step>` MDX and orphan `</Step>` tags (L345, L408); move the prose at L348-350 out of its code fence.
- **Change the example away from the hit-area-shift anti-pattern** (§3.21).
- Remove `effects: {}` (L288, L374, L434).
- Replace "TO DO ADD VISUAL DEMONSTRATION" (L452) with the demo or delete the line.
- Un-merge the callout at L454 into a proper Note.

### HTML integration (L456-825)
- Remove owner line (L458).
- Fix "three steps" → four (L511-516).
- **Fix `generate(config)` → `generate(config, false)` for vanilla (L699).**
- Update or neutralise the pinned CDN version (L507).
- Reword the "comes bundled" callout (L470) — `@wix/motion` is a dependency, not bundled.
- Add: browser support (M23), SSR caveat (M24), `useCustomElement` option (M6), `setup()` replace-not-merge (M7), CSS embedding options incl. `blocking="render"` (M5), `remove()` scope (M21).
- Promote the FOUC section (L754-777) into the canonical FOUC reference, and add non-`once` guidance (M3) and `data-interact-enter` (M4).
- Fix the React example: `generate()` is called on every render — hoist it or `useMemo`. Fix the `createInteractRef` example: it is called during render, producing a new callback each time and churning add/remove; show `useRef`/`useMemo` (or state that `<Interaction>` is preferred).
- Resolve 11 `ADDLINK`s.

### The final result + examples links (L827-842)
- **Write the page.** It is currently a six-bullet outline. It should be the capstone: one complete, runnable page (HTML + generated CSS + config + `create()`) that exercises `viewEnter` + FOUC, a hover state effect, and a `viewProgress` scrub, with the output shown.

### the config object (L843-953)
- Remove owner line (L847), empty heading (L853).
- Add `container` to (or remove it from) the `Condition` description in line with the §3.9 decision.
- Resolve the four empty `()` links (L865, L874, L878, L882).
- The example (L899-953) is good — keep it as the canonical "everything together" config and cross-link it from the sequences and lists pages.

### what is a trigger? (L955-1000)
- Remove owner line (L959), empty heading (L977), site-builder note (L994).
- Add the "no params for hover/click/interest/activate" note (M15).
- Either write "Combining triggers" (L998-1000) or delete the section and link to `multi-interaction compositions`.
- Resolve the promise that every trigger has a chapter (§6.4).

### viewEnter (L1002-1180)
- Remove owner line (L1004).
- **Replace the Google Docs link (L1093)** with the internal FOUC chapter link.
- **Remove the reviewer note at L1180** and its dangling "threshold limitation" reference — or write the limitation it refers to.
- Add `useSafeViewEnter` to the `params` list (L1070-1073) and to the `Interact.setup` mention (M22).
- Add non-`once` FOUC guidance (M3).
- Otherwise this page is the strongest in the set — use it as the Style A exemplar.

### click & hover (L1182-1556)
- Remove owner line (L1184).
- Keep the kebab-case `styleProperties` example (L1450-1457) — it is the correct one; cross-reference it from the effects pages.
- Promote the inline-state-identity paragraph (L1476) to a Warning (M20).
- Add `interest`/`activate` coverage explicitly if no separate chapters are added (§6.4).

### viewProgress (L1558-1855)
- Remove owner line (L1560).
- Fix the `contain` definition (§3.15).
- Add the forced-reduced-motion skip note (§3.14).
- Remove the editorial aside at L1730.
- Fix the two `http://Configuration/...` links (L1736, L1749).

### pointerMove (L1857-2061)
- Remove owner line (L1859).
- Fix the reduced-motion wording (§3.13).
- Add `transitionDelay` (M9).
- Fix the sentence fragment at L1885.
- Convert smart quotes to straight quotes (L1863-1872 and following).
- Bring up to Style A: add HTML markup to at least one example, add **Result:** paragraphs, add "See also" (§7.2).
- Resolve the empty `[viewProgress]()` link (L1865).

### animationEnd (L2063-2165)
- Remove owner line (L2065), empty `#` heading (L2067).
- Soften the chain-isolation claim (§3.17).
- Bring up to Style A: add HTML, add **Result:** to both examples, convert "Important rules" into prose + Warning admonitions (§7.2).

### what are effects? (L2167-2607)
- Remove owner line (L2171), empty blockquote (L2263), empty heading (L2589).
- **Fix the camelCase claim (L2341) and example (L2352-2353)** (§3.1).
- Fix `'Both'` → `'both'` (L2225).
- Fix the `css`-fenced type snippet (L2286-2288) (§9 C12).
- Add missing scrub fields: `iterations`, `alternate`, `reversed`, `transitionDelay` (M9, M10).
- Add the named-easing catalogue to the easing table (M2).
- Add `iterations: 0` → Infinity (M11).
- Add the `transition` vs `transitionProperties` precedence rule (§3.19) and the `duration` gotcha (§3.20).
- Add `interest`/`activate` to the State Effect trigger row (L2189).
- Add perspective guidance to Performance (M13).
- Fix the reduced-motion framing (§3.13).

### Named Effects (L2609-2891)
- Remove owner line (L2611).
- **Remove `data-interact-initial="true"` (L2812)** (§3.5).
- Un-merge the three callouts that became headings (L2674, L2812, L2831) and restore the numbered setup sequence 1 → 2 → 3.
- Fix "Ongoing … any trigger" → time-based triggers only (§3.18, L2633, L2833).
- Decide on `CustomMouse` (M18) and note the experimental `Bg*` presets (M17).
- Reconsider "A flat string (`'120px'`) also works" (L2793): it works at runtime (`parseLength` accepts strings) but is **not** in the public TypeScript type, so it will fail type-checking. Recommend documenting only the `{ value, unit }` object form.
- Fix the escaped-backtick prose at L2864.
- Make all `generate(` calls explicit about `useFirstChild`.

### keyframe Effects (L2893-3062)
- Remove owner line (L2895); remove the three frontmatter-as-heading lines (L2899, L2973); rename the page (§6.3).
- **Fix the `hitArea` description (L3021)** (§3.8) — or delete the pointer section and link to `pointerMove` (§6.5).
- Fix the reduced-motion claim at L3023 (§3.13).
- Convert smart quotes throughout (L2921, L2971, L3002-3003, L3021-3023).
- Break the three prose walls (L2921, L2971, L3002, L3021-3023) into the standard structure.
- Fix indentation (4→2 spaces) and the split `params` at L2950-2951.
- Flatten nested fences (L2907-2919, L2925-2940).
- Add HTML + **Result:** to the two "real-world" examples.

### transition Effects (L3064-3165)
- Remove owner line (L3066), empty heading (L3070), frontmatter heading (L3173 belongs to the next page but check L3072 area).
- **Fix all camelCase `styleProperties` / `transitionProperties` examples (L3096-3098, L3113-3127, L3146-3148)** (§3.1).
- Break the three prose walls (L3078-3080, L3108, L3159-3161) into tables + examples, mirroring the `click & hover` state section.
- Unescape the `@property` example at L3161 and put it in a `css` fence.
- Add the `transition`-wins precedence rule (§3.19) and the `duration` gotcha (§3.20).
- Add HTML + **Result:** to the theme-switcher example.

### custom Effects (L3167-3329)
- Remove owner line (L3169), frontmatter heading (L3173), stray bullet (L3315).
- **Remove `pageVisible` (L3218)** (§3.7).
- Fix the TS-in-JS fences (L3266, L3319) and the broken indentation in the cancellation example (L3317-3329).
- Add the JSON-serializability note (M16).
- Resolve the empty `[viewprogress chapter]()` link (L3243).
- Add **Result:** paragraphs.

### what is an interaction? (L3331-3387)
- Remove owner line (L3335), editorial instruction (L3337), visual placeholder (L3341).
- Add at least one real config so the page is not purely conceptual (§7.2).

### source and target resolving (L3389-3640)
- Remove owner line (L3391).
- **Fix recap steps 2 and 3 (L3633-3638)** — `querySelectorAll` not `querySelector`; `listItemSelector` does not filter (§3.2, §3.3, §3.4).
- **Fix the `listItemSelector` filter claim and example (L3601-3618)** (§3.2).
- **Fix the `listContainer` + `selector` claim (L3621)** (§3.4).
- Fix the four `http://Configuration/...` links (L3438, L3623) and the two in-page anchors (L3482).
- This page and `what is a list?` / `using lists` must state identical resolution rules — reconcile all three.

### effects array & cascading logic (L3642-3762)
- Remove owner line (L3644).
- Fix three `http://Configuration/...` links (L3697, L3714, L3762).
- Content is accurate — verified against the per-interaction custom-property mechanism in `src/core/css.ts:440-513`.

### multi-interaction compositions (L3764-3875)
- Remove owner line (L3766).
- Fix the broken indentation at L3813-3816.
- Fix three `http://Configuration/...` links (L3770, L3859, L3875).
- Make this the canonical `composite` reference (§5.6) and trim the duplicate explanations elsewhere.

### understanding conditions (L3877-4038)
- Remove owner line (L3881), empty heading (L3998).
- **Fix the broken table at L3918** (§10 F1).
- **Fix "reported as errors" (L4031)** (§3.10).
- Decide on `container` conditions (§3.9) and make the type table agree with the `responsive animation design` page.
- Add `&` support in selector predicates (M12).
- Add the "`forceReducedMotion` must be set before `create()`" note (M8).
- Resolve five `ADDLINK`s (L3946, L4031, L4035-4038).

### responsive animation design (L4040-4298)
- Remove owner line (L4042).
- **Resolve the `container` condition example (L4145-4197)** (§3.9).
- Add HTML + **Result:** to the three examples.
- Resolve the inline `<add link to…>` note (L4298).
- The cascade explanation (L4050-4058) duplicates `effects array & cascading logic` — trim to a summary + link.

### what is a list? (L4300-4444)
- Remove owner line (L4304).
- **Fix the `listItemSelector` claim (L4358)** (§3.2).
- The `selector`-only row of the comparison table (L4380) is correct — keep, and align the `source and target resolving` recap to it.
- **The comparison table at L4376-4382 has lost its ✓/✗ markers.** Five cells now begin with a bare leading space (`|  dynamic tracking + stagger |`, `|  a filtered subset of children |`, `|  (filtered) |`, `|  \`querySelectorAll\` matches |`), so both "Targets multiple elements?" and "A managed list?" columns read as unanswered. Restore the markers (or convert the two yes/no columns to explicit "Yes/No" text, which survives copy-paste better).

### using lists (L4446-4510)
- Remove owner line (L4448).
- **Rebuild all five code samples out of Markdown tables into fenced blocks (L4473-4505)** (B6).
- Fix `generate(config)` → `generate(config, false)` (L4481).
- Complete the truncated sample at L4504 (`keyframes: [...]`).
- The three-property table (L4458-4462) is the most accurate description of `listItemSelector` in the whole document — promote its wording to the other two pages.

### what is a sequence? (L4512-4618)
- Remove owner line (L4514).
- **Complete the `SequenceConfig` type (L4534-4539)** (§3.12).
- Fix the `java` fence (L4557) and the stray `TypeScript` / `HTML` labels (L4532, L4555, L4597).
- **Replace the three `google.com/search?q=ADDLINK` links (L4616-4618)**.
- Rewrite the "Overshooting durations" pitfall (L4612) into something actionable, or delete it.
- The example duplicates the `the config object` example (L899-953) verbatim — keep one and cross-link.

### using sequences (L4620-4733)
- Remove owner line (L4622).
- **Fix the `assertValidInteractConfig` claim (L4723)** (§3.11).
- **Add `animationEnd` to the supported-trigger list (L4678)** and state that `viewProgress`/`pointerMove` are unsupported (§3.16).
- Label the two unlabelled fences (L4680, L4700).
- Fix the missing comma in the config at L4663-4664 — the `sequences: { … }` block is not followed by a comma before `interactions:`, so the sample is a syntax error.
- Add HTML + **Result:** to the examples.
- Resolve the four unlinked "See also" entries (L4727-4729).

---

## Appendix A — upstream fixes outside this file

These are defects in the shipped agent rules and package metadata, discovered while auditing. They are out of scope for the documentation file but should be tracked, because agents and humans will otherwise get contradictory guidance.

| # | File | Issue |
| :---- | :---- | :---- |
| A1 | `packages/interact/rules/full-lean.md:471`, `rules/click.md:133`, `rules/hover.md:134` | State-effect `[CSS_PROP]` documented as camelCase. **Wrong** — must be kebab-case (§3.1). `packages/interact/README.md:326` already uses kebab-case. |
| A2 | `rules/full-lean.md:239` | `hitArea` default documented as `'self'`. Runtime default is effectively `'root'` (`src/handlers/pointerMove.ts:39`). Note that `interact-validate/src/semantic/fouc.ts:55-57` assumes the `'self'` default when deciding whether to raise `HIT_AREA_SHIFT` — so either the runtime default or the rule/validator needs to change. |
| A3 | `rules/full-lean.md:493-496` | Mouse preset list has 9 entries; 12 are exported (`BounceMouse`, `SpinMouse`, `CustomMouse` missing). |
| A4 | `rules/full-lean.md:452` | Claims per-property `transitionProperties` take precedence when both are set. **Wrong** — `src/utils.ts:62` ignores `transitionProperties` entirely when `transition` is present. |
| A5 | `rules/full-lean.md:691` | Source resolution claims `listItemSelector` filters which children become sources. **Wrong** (§3.2). |
| A6 | `rules/full-lean.md:284-290` | `ViewEnterParams` omits `useSafeViewEnter`, which exists in the type and the validator schema. |
| A7 | `packages/interact/llms.txt:7` | "Five trigger types: hover, click, viewEnter, viewProgress, pointerMove" — there are eight (`animationEnd`, `activate`, `interest` missing). |
| A8 | `packages/interact/llms.txt:24` | Links to `rules/plugins.md` describing `Interact.use()` and `$`-prefixed config fields. Neither the file nor the API exists in this repo. |
| A9 | `interact-validate/src/semantic/fouc.ts:59-64` | `HIT_AREA_SHIFT` only inspects `transform` **strings**; bare `scale` / `translate` / `rotate` keyframe properties (the individual CSS transform properties) escape detection — which is exactly what the `My first interaction` example uses. |
| A10 | `src/core/add.ts:57-59` vs `:79-85` | `listContainer` + `selector` resolves differently at initial bind (`container.querySelectorAll`) than for MutationObserver-added items (`child.querySelector`). Likely a bug; documenting it as-is would be documenting an inconsistency (§3.4). |
| A11 | `src/types/config.ts:5` | `Condition.type` accepts `'container'` but nothing implements it — conditions of that type are silently dropped (§3.9). Either implement `@container` emission or remove the type. |

---

## Appendix B — verification notes

| Claim group | Source of truth |
| :---- | :---- |
| Trigger list (8) | `src/types/triggers.ts:7-15` |
| Default `triggerType` per trigger | `src/core/resolvers.ts:19-26` (`viewEnter`/`animationEnd` → `once`; `hover`/`click`/`activate`/`interest` → `alternate`) |
| hover/click playback semantics | `src/handlers/effectHandlers.ts:34-88` |
| viewEnter playback semantics, threshold 0.2, inset negation, `useSafeViewEnter`, exit observer | `src/handlers/viewEnter.ts:11-51, 91-153, 198-291` |
| a11y upgrade (`hover`→`interest`, `click`→`activate`) | `src/handlers/index.ts:9-29`, `src/handlers/constants.ts` |
| Keyboard handling (Enter/Space, `preventDefault` on Space, `tabIndex = 0` on `focusin`) | `src/handlers/eventTrigger.ts:36-46, 172-177` |
| `stateAction` semantics incl. `clear` | `src/core/InteractionController.ts:107-142`, `src/handlers/effectHandlers.ts:91-130` |
| FOUC: `data-interact-enter`, `DEFAULT_INITIAL`, `shouldUseInitial` | `src/core/css.ts:26-32, 246-263`, `src/core/utilities.ts:19-28`, `src/handlers/viewEnter.ts:216-237` |
| `generate(config, useFirstChild = true)` | `src/core/css.ts:547` |
| State-property CSS emission | `src/core/cssUtils.ts:148`, `src/utils.ts:58-98` — **[verified by execution]** |
| Element resolution | `src/core/add.ts:43-105`, `src/core/Interact.ts:331-353` |
| `listItemSelector` usage sites | `src/core/Interact.ts:340`, `src/handlers/effectHandlers.ts:112`, `src/core/utilities.ts:31-33` (exhaustive grep) |
| Reduced motion | `src/core/add.ts` (all `reducedMotion:` call sites pass `Interact.forceReducedMotion`), `src/handlers/pointerMove.ts:24-26`, `src/handlers/viewProgress.ts:25-27` |
| Conditions: media merge, selector `:is()` + `&`, container unimplemented | `src/utils.ts:41-46, 153-192`, `src/core/css.ts` (only `'media'` is ever requested) |
| Cascade / coexistence mechanics | `src/core/css.ts:429-513` (per-interaction custom property per target; per-sequence-index custom properties; `buildListsRule` concatenation) |
| Sequence resolution and defaults | `src/core/resolvers.ts:103-165`, `src/utils.ts:20-34` |
| Sequence trigger dispatch | `src/core/add.ts:376-399` |
| Validator codes and severities | `interact-validate/src/errors.ts:14-35`, `structural.ts:42-88`, `schema/interactions.ts:250-345`, `schema/primitives.ts:39-60` |
| Preset inventory | `packages/motion-presets/src/library/{entrance,scroll,ongoing,mouse,backgroundScroll}/index.ts` — 19 / 19 / 13 / 12 / 12 (bg marked not production ready) |
| Preset option shapes (`direction`, `range`, `distance`, `iterationDelay`) | `packages/motion-presets/src/types.ts`, `consts.ts`, `utils.ts:395-445`, `library/entrance/*.ts`, `packages/motion/src/types.ts:1-50, 133-136` |
