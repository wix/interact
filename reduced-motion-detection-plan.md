# Reduced motion in `@wix/interact` — research, findings, and plan

**Status:** Phases 1 and 2 implemented (see §4). Phases 3–4 not started — note that the shipped docs stay wrong until Phase 4 rewrites them.
**Date:** 2026-08-04
**Verified against:** `origin/master` @ `84626c8` — `@wix/interact` 2.5.5, `@wix/motion` 2.1.8, `@wix/motion-presets` 1.0.4, `@wix/interact-validate` 0.1.2
**Subject:** `Interact.forceReducedMotion` and everything downstream of it — the handler drop paths, the `@wix/motion` collapse paths, and the CSS that `generate()` emits.
**Triggered by:** `interact-documentation-site-audit.md` items §3.13, §3.14, M8, §5.6 ("Reduced motion appears four times"), and the new A13/A14/A15.
**Goal (from the brief):** make `forceReducedMotion` detect the client's preference when it is not set explicitly — i.e. make the shipped documentation true.

---

## 0. Summary

### What the docs promise

Five separate places already tell readers that Interact respects the OS setting on its own:

| Where                                                                  | Claim                                                                                                                          |
| :--------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `interact-documentation-site.md:791`                                   | "`boolean` — force reduced-motion behavior **regardless of the OS setting**. Default: `false`."                                |
| `interact-documentation-site.md:1875`                                  | "`pointerMove` effects are skipped when reduced-motion mode is enabled."                                                       |
| `interact-documentation-site.md:3022`                                  | "The library skips pointer-driven effects entirely when reduced motion is preferred."                                          |
| `packages/interact/docs/api/types.md:286`                              | "`reducedMotion` — Whether reduced motion is enabled (**respects `prefers-reduced-motion`** or `Interact.forceReducedMotion`)" |
| `packages/interact/rules/integration.md:353`, `rules/full-lean.md:761` | "force reduced-motion behavior **regardless of OS setting**"                                                                   |

### What actually happens

`Interact.forceReducedMotion` is a plain `static boolean = false` (`src/core/Interact.ts:46`). Nothing in the repo ever reads `prefers-reduced-motion` to set it. The only automatic reduced-motion behaviour anywhere is one `@media (prefers-reduced-motion: no-preference)` wrapper on the **runtime** state-effect transition rule (`src/utils.ts:162`).

So today, on a machine with "reduce motion" enabled and a config that does not carry a `prefers-reduced-motion` media condition, **every animation plays at full strength.**

### And detection alone would not fix it

This is the finding that changes the shape of the work. Even with perfect detection, three of the four effect paths would still ignore the flag, because the flag is consulted in the JS animation path and the production-recommended setup runs the CSS path:

```
                          forceReducedMotion honoured?
time effect, WAAPI only          yes  — duration collapsed to 1ms (or dropped if iterations > 1)
time effect, generate() CSS       NO  — getAnimation() returns the CSS animation before
                                        reducedMotion is ever passed anywhere        (F2)
viewProgress, generate() CSS      NO  — handler bails, but the CSS scroll-linked
                                        animation keeps scrubbing with no JS at all  (F4)
state effect, generate() CSS      NO  — the runtime path guards the transition,
                                        the generate() path does not                 (F3)
```

Since the docs tell everyone to pre-generate CSS for FOUC prevention, **the CSS path is the default path**, and `forceReducedMotion = true` is close to a no-op there. Detection is Phase 1; closing the CSS bypasses is Phase 2, and without Phase 2 Phase 1 buys almost nothing.

### Recommendation in one line

Split the flag into an explicit override (`Interact.forceReducedMotion?: boolean`) and a resolved single source of truth (`Interact.reducedMotion`, read-only, `override ?? matchMedia('(prefers-reduced-motion: reduce)').matches`), then push the same decision into `generate()`'s output as `@media (prefers-reduced-motion: reduce)` override rules — which makes the behaviour correct under SSR, with JS disabled, and across a mid-session preference change, for free.

---

## 1. Current behaviour, traced

### 1.1 The flag and its seven readers

`Interact.forceReducedMotion: boolean = false` (`src/core/Interact.ts:46`) is read at **handler-attach time** at seven sites in `src/core/add.ts` — `:457`, `:540`, `:544`, `:568`, `:652`, `:659`, `:870` — and passed down as `InteractOptions.reducedMotion` (`src/types/handlers.ts:23`) or as `context.reducedMotion` into `Interact.getSequence` / `Interact.addToSequence`.

It is never re-read afterwards. This is audit item M8, and it is what makes Phase 3 (reactivity) a separate piece of work rather than a consequence of Phase 1.

### 1.2 What each trigger does with it

| Trigger                                     | Site                                                                             | Behaviour under `reducedMotion: true`                                                                 |
| :------------------------------------------ | :------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| `pointerMove`                               | `src/handlers/pointerMove.ts:22-26`                                              | **Early return.** No `Pointer` instance, no scene, effect never exists.                               |
| `viewProgress`                              | `src/handlers/viewProgress.ts:23-27`                                             | **Early return.** No `ViewTimeline` animation, no `fizban` fallback `Scroll`.                         |
| `viewEnter`                                 | `src/handlers/viewEnter.ts:160-170`                                              | Passed into `getAnimation()`; the observer is only created if that returns non-`null`.                |
| `hover` / `click` / `interest` / `activate` | `src/handlers/eventTrigger.ts:113, 140` → `src/handlers/effectHandlers.ts:16-28` | Passed into `getAnimation()`; `createTimeEffectHandler` returns `null` if that returns `null`.        |
| `animationEnd`                              | `src/handlers/animationEnd.ts:18, 29`                                            | Same as the event triggers.                                                                           |
| State effects (`transition`)                | `src/handlers/effectHandlers.ts:91-130`                                          | **Not consulted at all.** `createTransitionHandler` takes no `reducedMotion`; the toggle is pure CSS. |

### 1.3 What `@wix/motion` does with it

`getAnimation()` (`packages/motion/src/motion.ts:198-215`):

```js
const animation = getElementCSSAnimation(target, animationOptions);   // ← no reducedMotion argument
if (animation) { … return animation; }                                // ← early return
return getWebAnimation(target, animationOptions, trigger, { reducedMotion });
```

Only the second branch sees the flag. Inside it, `getWebAnimationEffect` (`packages/motion/src/api/webAnimations.ts:33-45`) does, for non-scrub triggers:

- `iterations === 1 || iterations === undefined` → `duration = 1` (1 ms — the animation still runs, still fires `finish`, still lets the runtime set `data-interact-enter="done"`);
- otherwise → `return []`, which makes `getWebAnimation` return `null`.

That collapse-not-drop choice is **correct and load-bearing** — see §2.5. It should be preserved and copied into the CSS path, not replaced.

### 1.4 The one place the OS preference is already honoured

`createTransitionCSS()` (`src/utils.ts:156-165`) — the runtime path for inline state effects — emits:

```css
@media (prefers-reduced-motion: no-preference) {
  [data-interact-key='k'] > :first-child {
    transition: background-color 200ms ease;
  }
}
```

The state itself still applies under `reduce`; only the tween is dropped. That is exactly the right semantic, and it is the model Phase 2 generalises.

---

## 2. Findings

Six findings. F2, F3 and F4 are pre-existing defects independent of the detection work — but detection is not worth shipping without them, because they are the paths a production integration actually uses.

### F1 — Detection does not exist (the brief) — ✅ closed by Phase 1

No `matchMedia('(prefers-reduced-motion: reduce)')` call anywhere in `packages/interact/src` or `packages/motion/src`. `grep -rn "prefers-reduced-motion" packages/*/src` returns exactly one hit: the `no-preference` wrapper of §1.4. Five documentation sites claim otherwise.

**Impact:** the accessibility default is "ignore the user's stated preference". Every integrator has to know to write `Interact.forceReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches` themselves, and the only place that line appears is `rules/full-lean.md:42` and one line of the docs site (L2584).

### F2 — `reducedMotion` is bypassed whenever the effect resolves to a CSS animation — ✅ closed by Phase 2 (in CSS, not in JS)

`getElementCSSAnimation()` is called before, and independently of, the `reducedMotion` argument (`packages/motion/src/motion.ts:204`). For any `namedEffect` or `keyframeEffect`:

- `getNamedEffect()` returns an object with a `style` method — for `keyframeEffect` it is synthesised inline (`packages/motion/src/api/common.ts:68-81`), and virtually all presets have one;
- `generate()` emits the matching `@keyframes` plus a paused `animation: <name> <dur>ms … paused` shorthand (`packages/motion/src/api/cssAnimations.ts:14-31`, `packages/interact/src/core/css.ts:252-285`);
- so `element.getAnimations()` contains a `CSSAnimation` with that name, `getElementCSSAnimation` returns an `AnimationGroup` wrapping it, and `getAnimation` returns before `reducedMotion` is used.

The handler then plays that group at its full authored duration.

**Impact:** with pre-generated CSS — the setup the docs recommend for FOUC prevention — `Interact.forceReducedMotion = true` has no effect on entrance, hover, click, `interest`, `activate` or `animationEnd` animations. **This is the common case, not an edge case.**

**Evidence:** traced through source. The existing motion tests cover the flag only with `getAnimations()` mocked to `[]` (`packages/motion/test/motion.spec.ts:2312-2353`, where `mockElement.getAnimations` returns `[]`); the neighbouring test is literally named _"should return a Web Animation if \*NO\* CSS animation is found"_. **The CSS-animation-found × `reducedMotion: true` combination has no test.** Tracked as audit A14.

### F3 — The two state-effect CSS paths disagree — ✅ closed by Phase 2

`createTransitionCSS` (runtime, `src/utils.ts:162`) wraps `transition:` in `@media (prefers-reduced-motion: no-preference)`. `effectToCSS`'s transition branch (`generate()`, `src/core/css.ts:302-329`) declares the `--transition-*` custom property unconditionally — `grep -n "prefers-reduced" src/core/css.ts` returns nothing.

**Impact:** the same config honours the preference when its CSS was produced at runtime and ignores it when the CSS was pre-generated. Tracked as audit A13.

### F4 — Scroll-driven effects keep scrubbing under reduced motion when pre-generated — ✅ closed by Phase 2

Two things combine:

1. `getAnimationAsCSS(item, isRunning)` is called with `isRunning = isViewProgress` (`packages/motion/src/api/cssAnimations.ts:63`), so a `viewProgress` animation is emitted **unpaused**, with `animation-timeline: --<id>`. It scrubs with zero JS involvement.
2. `addViewProgressHandler` early-returns under `reducedMotion` (`src/handlers/viewProgress.ts:25`) — and even when it does run, it deliberately leaves CSS-backed groups alone (`if (animationGroup && !animationGroup.isCSS)`).

**Impact:** the docs' claim that scroll- and pointer-driven effects are "skipped entirely" is false for the pre-generated case. `pointerMove` is not affected the same way (it has no CSS-only mode), so the two continuous triggers behave differently for the same flag — which no documentation anywhere states. Tracked as audit A15.

### F5 — A `viewEnter` entrance with `iterations > 1` can be locked invisible

`shouldUseInitial()` requires only `trigger === 'viewEnter'`, `triggerType === 'once'` and source-hash === target-hash (`src/core/utilities.ts:19-28`). It says nothing about `iterations`. So `viewEnter` + `once` + `iterations: 2` is a valid config that gets the FOUC initial rule:

```css
…:not([data-interact-enter]) {
  visibility: hidden;
  transform: none !important; /* … */
}
```

Under `reducedMotion`, `getWebAnimationEffect` returns `[]` for `iterations !== 1` → `getAnimation` returns `null` → `addViewEnterHandler` early-returns at `if (!animation) return` (`src/handlers/viewEnter.ts:172-176`) → no `IntersectionObserver` → `data-interact-enter` is never written → **the element stays `visibility: hidden` for the rest of the session.**

In practice F2 masks this today (the CSS path usually matches first and returns non-`null`). It stops being masked the moment F2 is fixed, and it is the single most important constraint on how Phase 2 is implemented.

**Rule this establishes:** _never suppress an effect that owns a FOUC initial rule. Collapse it._ Any reduced-motion implementation that drops entrance animations must also drop the initial rule that hides the element, or it trades a flash for a permanently blank page. Collapsing duration avoids having to reason about that at all.

### F6 — The flag is read once, at attach time — open, Phase 3

Covered as audit M8. `Interact.forceReducedMotion` must be set before `Interact.create()`; changing it later does nothing until something rebinds. Once detection is automatic, users will reasonably expect toggling the OS setting mid-session to take effect — which is Phase 3.

---

## 3. Design options

### 3.1 API shape

| Option                                                                                                                                                                                                                                                                                   | Pros                                                                                                                                                         | Cons                                                                                                                                                                                       |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — accessor on the existing name.** `forceReducedMotion` becomes a getter/setter over a private `boolean \| undefined`; the getter returns `override ?? detect()`.                                                                                                                    | One name to document; zero call-site changes; `= true` / `= false` keep working as forces; the shipped sentence at L791 becomes literally true.              | The name lies — reading `true` no longer means anyone forced anything. Reading a static property now lazily touches `matchMedia`. Harder to tell "unset" from "forced false" from outside. |
| **B — split override from resolved value (recommended).** `static forceReducedMotion?: boolean` stays a plain field (default `undefined`); add `static get reducedMotion(): boolean` returning `forceReducedMotion ?? detect()`. The seven `add.ts` sites read `Interact.reducedMotion`. | Honest names; one internal source of truth; trivially testable; `undefined` is falsy so any consumer doing `if (Interact.forceReducedMotion)` is unaffected. | Two names in the docs. The default read value of `forceReducedMotion` changes `false` → `undefined` (benign — see risk R2).                                                                |
| **C — opt-in.** New `Interact.respectMotionPreference = false`.                                                                                                                                                                                                                          | Fully backwards compatible.                                                                                                                                  | Accessibility-hostile default; contradicts all five documentation sites; users must opt in to correct behaviour. **Rejected.**                                                             |

**Recommendation: B.** It costs one extra table row in the docs and buys an unambiguous internal contract. A is an acceptable fallback if the team prefers not to introduce a second name.

Either way the behaviour change is real (reduce-preferring users stop seeing full-strength motion), so it wants a **minor** bump — `@wix/interact` 2.6.0 — with a CHANGELOG entry under **Changed**, not **Fixed**.

### 3.2 Where reduced motion is enforced

| Option                                                                                              | Verdict                                                                                                                                                                                                                                                           |
| :-------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **JS only** — thread `reducedMotion` into `getElementCSSAnimation` too and collapse the group there | Insufficient. Does nothing for `viewProgress` CSS scrubbing (F4, which needs no JS), nothing under SSR before hydration, and nothing if JS fails. Also needs per-`Animation` mutation (`updatePlaybackRate`, `effect.updateTiming`) which fights the CSS cascade. |
| **CSS only** — emit `@media (prefers-reduced-motion: reduce)` overrides from `generate()`           | Covers F2, F3, F4 completely, works with no JS, under SSR, and reacts to a mid-session preference change with zero code. But cannot cover `customEffect` (no CSS), the `fizban` `viewProgress` fallback (no `ViewTimeline`), or `pointerMove` (JS-driven).        |
| **Both (recommended)**                                                                              | CSS is the primary enforcement and the SSR/no-JS story; the JS flag covers the paths CSS cannot reach and remains the author-facing override.                                                                                                                     |

### 3.3 What "reduced" means per effect kind

Derived from F5 (never suppress something that owns a hiding rule) and from the existing WAAPI semantics (§1.3), which are already right:

| Effect kind                                       | Under `reduce`                                                                                              | Why                                                                                                                                               |
| :------------------------------------------------ | :---------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| Time effect, **finite** `iterations`              | **Collapse** — `duration: 1ms`, `delay: 0ms`. The animation runs, finishes, and its fill state applies.     | Preserves the FOUC handshake (`data-interact-enter` reaches `done`) and the end state. F5.                                                        |
| Time effect, **`iterations: Infinity`** (ongoing) | **Suppress** — `animation-name: none`.                                                                      | A 1 ms infinite loop is worse than no animation. Safe because `shouldUseInitial` requires `once`, so an infinite effect never owns a hiding rule. |
| State effect (`transition`)                       | **Drop the tween, keep the state** — `transition: none`. Already what the runtime path does (§1.4).         | The state is meaning, the tween is motion.                                                                                                        |
| Scrub effect (`viewProgress` / `pointerMove`)     | **Suppress** — `animation-name: none` / `animation-timeline: none`, and keep the existing JS early-returns. | There is no meaningful collapse of a scrubbed timeline. Requires the author to supply a fallback — hence the new validator nudge in Phase 4.      |
| `customEffect`                                    | JS only — keep the current behaviour (`getWebAnimationEffect` collapse/drop).                               | Nothing to emit.                                                                                                                                  |

The invariant to assert in tests: **an effect that is suppressed under `reduce` must never be an effect for which `shouldUseInitial()` returns `true`.**

---

## 4. Plan

Four phases. Phase 1 + Phase 2 must ship together — Phase 1 alone changes almost nothing observable (F2/F3/F4), and Phase 2 alone would leave `customEffect` and `pointerMove` unhandled.

### Phase 1 — one resolved source of truth, with detection ✅ DONE

Implemented as option **B** (§3.1), exactly as specified below. What landed:

- `packages/interact/src/core/Interact.ts:46` — `static forceReducedMotion?: boolean = undefined`, `private static _prefersReducedMotion?: MediaQueryList` (`:59`), `static get reducedMotion(): boolean` (`:65`), and the cache reset in `static destroy()` (`:217`).
- `packages/interact/src/core/add.ts` — all seven reads now `Interact.reducedMotion` (`:457, 540, 544, 568, 652, 659, 870`).
- `packages/interact/test/reducedMotion.spec.ts` (new, 9 tests) — test-plan items 1–6 plus a cache-reset-on-`destroy()` test and a parameterised handler test proving the detected value reaches `getWebAnimation`.
- The four `Interact.forceReducedMotion = false` "reset to default" lines in `test/{web,mini,plugins}.spec.ts` / `test/react.spec.tsx` now reset to `undefined`, so those suites exercise the real default. Their mocked `matchMedia` does not match the reduce query, so behaviour is unchanged.

Open question 1 is now answered in code and pinned by a test: an explicit `false` forces motion **on**.

Suite: 449/449 passing, `yarn lint` (tsc) clean. Note `packages/motion` must be built first, otherwise 43 unrelated failures appear from a stale `dist`.

Not done here, as designed: nothing observable changes for a config whose CSS was pre-generated (F2/F3/F4) — that is Phase 2.

1. `packages/interact/src/core/Interact.ts`
   - `static forceReducedMotion?: boolean = undefined` (was `boolean = false`).
   - `private static _prefersReducedMotion?: MediaQueryList` — lazily created cache.
   - `static get reducedMotion(): boolean` →
     ```
     if (Interact.forceReducedMotion !== undefined) return Interact.forceReducedMotion;
     if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
     Interact._prefersReducedMotion ??= window.matchMedia('(prefers-reduced-motion: reduce)');
     return Interact._prefersReducedMotion.matches;
     ```
   - SSR/JSDOM-safe by construction: no `window` or no `matchMedia` → `false`, which is also the right answer for a server render (see Phase 2 — the emitted CSS carries the preference, so the server does not need to know it).
   - Clear `_prefersReducedMotion` in `Interact.destroy()` alongside the other static caches, so tests can swap `matchMedia`.
2. Replace all seven `Interact.forceReducedMotion` reads in `src/core/add.ts` (`:457, 540, 544, 568, 652, 659, 870`) with `Interact.reducedMotion`.
3. `grep -rn "forceReducedMotion" packages/ skills/` and confirm nothing else reads it internally (currently nothing does — only docs).

**Deliberately not done here:** no change to `getWebAnimationEffect`'s collapse/drop semantics. They are already correct (§1.3) and F5 depends on them.

### Phase 2 — close the CSS bypasses ✅ DONE

**Status: ✅ DONE**, with a different enforcement shape than sketched below — one accumulated rule per target instead of a reduce rule per effect. What landed:

- `packages/interact/src/utils.ts:4` — `getMotionPreferenceMedia(preference, conditions?, configConditions?)`: appends a synthetic `$prefers-reduced-motion` condition to the effect's own condition names and lets `getFullPredicateByType` compose the predicate, so a gated interaction yields `(min-width: 900px) and (prefers-reduced-motion: no-preference)` with no string splicing.
- `packages/interact/src/core/cssUtils.ts:19` — `REDUCED_MOTION_DECLARATIONS` + `buildReducedMotionRule(lists)`, the sibling of `buildListsRule`.
- `packages/interact/src/core/css.ts:157` — `triggerToCSS`'s `view-timeline` rule is gated on `no-preference`; `:630` — `_generate` pushes each target's reduce rule right after its coordinated-list rule.
- `packages/interact/test/css.spec.ts` — `reduced motion` describe, 5 tests (plan items 7–13 as reshaped below).

**Enforcement shape.** Per target, exactly one rule:

```css
@media (prefers-reduced-motion: reduce) {
  [data-interact-key='el'] > :first-child {
    animation-duration: 1ms;
    animation-delay: 0s;
    animation-iteration-count: 1;
  }
}
```

…plus, for `viewProgress` interactions only, the `view-timeline` rule that `triggerToCSS` already emits on the source gains a media query:

```css
@media (min-width: 900px) and (prefers-reduced-motion: no-preference) {
  [data-interact-key='el'] > :first-child {
    view-timeline: --trigger-0;
  }
}
```

Why this shape:

- **Longhands, not rewritten shorthands.** The three timing longhands override the `animation` shorthand that `buildListsRule` emits, for every animation on the target at once, so nothing has to parse or restate a shorthand value. This deletes `reduceAnimation()` and its regex entirely.
- **Cost is per target, not per effect.** A target with five animated effects gets one extra rule with three declarations, instead of five rules each restating a full shorthand. Test 7 pins the count at one.
- **`animation-iteration-count: 1` replaces suppressing ongoing effects.** A 1 ms infinite loop is the thing to avoid; capping iterations at 1 achieves that without a per-effect decision, and — unlike `animation-name: none` — it cannot strand an element that owns a FOUC initial rule (F5). Nothing anywhere is suppressed by name now, which is what test 12 asserts globally.
- **Scroll-driven animations are detached at the source, not collapsed.** The timing longhands are ignored for progress-based timelines, so a scrub has to lose its timeline. Gating the source's `view-timeline` declaration on `no-preference` leaves the `--trigger-N` name unresolvable under `reduce`, which per spec leaves every animation referencing it with no timeline — the same result as `animation-timeline: none`, with no extra rule, no extra declaration and no per-target bookkeeping. It also keeps the interaction's own conditions scoping the decision, and a target that mixes a `viewProgress` interaction with a time-based one is safe by construction, since nothing touches timelines at all.
- **`no-preference` gating where one rule suffices.** The state-effect `--transition-*` declaration now lives in a `no-preference`-gated rule instead of being declared and then overridden: under `reduce` it is simply absent and `var(--transition-…, _)` falls back to the list-safe no-op. Same semantics, one rule instead of two, and it also settles the `transition: none` problem below — `none` is invalid in a multi-value `transition` shorthand, so an override would have had to use `_` anyway.
- **The runtime path (`createTransitionCSS`) keeps its original `@media (prefers-reduced-motion: no-preference)` wrapper**, now sharing the query string via `getMotionPreferenceMedia`. F3 is closed by moving `generate()` to that shape rather than the reverse, so the runtime output is byte-identical to `master`.

Consequences worth knowing:

- The blanket rule collapses **every** animation on an Interact-managed element under `reduce`, including animations the host page declared itself in its own CSS (`[data-interact-key] > :first-child` outbids a class selector). That is a deliberate trade of precision for weight, and arguably the accessible behaviour, but it is a behaviour change outside Interact's own effects.
- Under `reduce`, a `viewProgress` effect shows the element's base style (its timeline no longer resolves), so R6 stands: an effect whose start state is invisible needs an author-supplied fallback. Phase 4's validator nudge is still the answer.
- That suppression rests on "unresolvable timeline name ⇒ animation with no timeline" rather than an explicit `none`. If an engine instead fell back to the document timeline, the animation would become time-based and the reduce rule would collapse it to its end state — graceful, but a different look. Worth confirming in a browser on the demo page; the unit tests only pin the emitted CSS.

Suite: `@wix/interact` 453/453, `@wix/motion` 286/286, `@wix/interact-validate` 159/159, `yarn lint` clean.

Still open after this phase: `customEffect` and the `fizban` `viewProgress` fallback are JS-only paths that CSS cannot reach (§3.2) — they rely on the Phase 1 flag, which is correct but only re-read on bind (F6 → Phase 3).

Original plan for reference:

All of this lands in `packages/interact/src/core/css.ts`, and the plumbing already exists: `CSSRuleData` has a `media` field and `CSSRuleToString` already wraps a rule in `@media` (`src/core/cssUtils.ts:145-148`).

1. **Helper.** `mergeReducedMotionMedia(media?: string): string` → `media ? \'${media} and (prefers-reduced-motion: reduce)\' : '(prefers-reduced-motion: reduce)'`. Condition-gated interactions already put a predicate in `media`, so the two must compose rather than overwrite.
2. **Time effects** (`effectToCSS`, the `namedEffect || keyframeEffect` branch, `src/core/css.ts:252-301`). After the existing `animationDeclarations` are built, push one extra rule with the merged media and the same `selectorSuffix`, whose declarations set each animation custom property to its reduced form:
   - finite `iterations` → same shorthand with `1ms` duration and `0ms` delay;
   - `iterations: Infinity` / `0` → `none`;
   - `viewProgress` → `none`, and `--…-animation-timeline` → `none`.

   The reduce rule must be appended **after** the base rule so equal-specificity declarations win. `generate()` concatenates in push order and `InteractionController.renderStyle` inserts at `sheet.cssRules.length` (`src/core/InteractionController.ts:112`), so ordering is already preserved — assert it in a test rather than relying on it silently.

3. **State effects** (`effectToCSS`, the `transition || transitionProperties` branch, `:302-329`). Keep the base `--transition-*` declaration unconditional, and append a merged-media rule setting it to `none`. Declaring the base value unconditionally and overriding under `reduce` is more predictable than the runtime's `no-preference` wrapper, because a custom property that is simply absent falls back to `LIST_PROPERTY_FALLBACKS.transition` rather than to nothing.
4. **Align the runtime path** (`createTransitionCSS`, `src/utils.ts:156-165`) to the same shape — always declare, override under `reduce` — so F3 cannot recur. Behaviour is unchanged; only the emitted text differs.
5. **`initial` interaction.** Do **not** touch the `DEFAULT_INITIAL` / `:not([data-interact-enter])` rules. They stay unconditional, which is safe precisely because §3.3 collapses rather than suppresses every effect that can own them (F5). Add a test that asserts this pairing directly.

Optionally, and only if the team wants `forceReducedMotion = true` to work on the CSS path _without_ pre-generated reduce rules (older embedded CSS), also thread `reducedMotion` into `getElementCSSAnimation` in `packages/motion/src/motion.ts:204` and collapse the returned group via `updatePlaybackRate`. Recorded as an option; not recommended for the first pass — it duplicates the CSS decision in JS and can fight the cascade.

### Phase 3 — react to a mid-session preference change

Reuse the existing media-condition machinery rather than inventing anything: `Interact.setupMediaQueryListener(id, mql, key, handler)` (`src/core/Interact.ts:161-174`) with `handler = () => controller.update()`, exactly as condition gating does at `src/core/add.ts:899-906` and `:945-952`. `update()` is `disconnect(); connect();` (`src/core/InteractionController.ts:96-99`).

Scope it deliberately:

- Register the listener **only** when `Interact.forceReducedMotion === undefined` (an explicit override means the author owns the decision).
- Rebind **only** interactions whose trigger is `viewProgress` or `pointerMove`. Those are the ones added and removed wholesale by the flag, so a rebind is the only way to pick up a change. Time effects and state effects are already handled live by the Phase 2 CSS, so rebinding them buys nothing and risks re-running a `once` entrance that has already completed.
- Tear the listener down in `clearMediaQueryListenersForKey` / `destroy()` — automatic, since it goes through the same `mediaQueryListeners` map.

Document the resulting contract honestly rather than over-promising: CSS-backed time and state effects respond to a preference change immediately; scrub effects respond after the rebind; `customEffect` and other WAAPI-only effects respond on the next bind.

### Phase 4 — validator, rules, docs

1. **`@wix/interact-validate`** — new semantic nudge `MISSING_REDUCED_MOTION_FALLBACK` (new category `REDUCED_MOTION`, severity `info`): a `viewProgress` or `pointerMove` interaction whose effects are suppressed under `reduce` and which has no sibling effect gated on a `prefers-reduced-motion: reduce` condition. Follow the shape of `checkRecommendedFill` (`src/semantic/recommendedPatterns.ts`) and register the code in `RULE_CODE_MAP` (`src/errors.ts`). Add to the two code tables in `rules/validate.md` (`:143`, `:237`) and `interact-validate/README.md`.
2. **Rules files** — state the per-kind semantics of §3.3 once, in `rules/full-lean.md` near the existing reduced-motion bullet (`:42`), and cross-reference from `rules/viewprogress.md` and `rules/pointermove.md` (audit A15). Update the `Interact.forceReducedMotion` rows in `rules/integration.md:353`, `rules/full-lean.md:761`, and `skills/interactor/references/config-schema.md:400` to describe `undefined` = detect.
3. **API docs** — `packages/interact/docs/api/interact-class.md:139` and `docs/api/types.md:286` (the latter already claims detection; it becomes true).
4. **Docs site** — see §6.
5. **CHANGELOG** — `@wix/interact` under **Changed**: detection is now the default, `forceReducedMotion` is the override, and reduced-motion behaviour is now enforced in generated CSS. Call out explicitly that pages relying on animations playing for reduce-preferring users will change.

---

## 5. Test plan

`packages/interact/test/reducedMotion.spec.ts` (new), plus additions to `packages/motion/test/motion.spec.ts`.

**Resolution (Phase 1)** — ✅ all in `packages/interact/test/reducedMotion.spec.ts`

1. ✅ `forceReducedMotion` unset + `matchMedia` matching → `Interact.reducedMotion === true`.
2. ✅ `forceReducedMotion` unset + `matchMedia` not matching → `false`.
3. ✅ `forceReducedMotion = false` + `matchMedia` matching → `false` (explicit override wins).
4. ✅ `forceReducedMotion = true` + `matchMedia` not matching → `true` (and `matchMedia` is never called).
5. ✅ No `window.matchMedia` → `false`, no throw. Guards the SSR/JSDOM path.
6. ✅ `matchMedia` is called at most once across many reads (the `MediaQueryList` is cached).
   6a. ✅ `Interact.destroy()` drops the cached `MediaQueryList` — the other half of test 6, and required by Phase 1 step 1 so a suite can swap `matchMedia` between tests. Not covered elsewhere (test 17 is about the Phase 3 change-listener, a different object).
   6b. ✅ With no override, the detected value reaches `getWebAnimation` through `add()` — pins the `add.ts` rewiring. **Overlap check:** the pass-down itself is already covered three times via the override (`web.spec.ts:592`, `mini.spec.ts:609`, `react.spec.tsx:839`), and detection→`false` is now implicit in every test in those suites. Only detection→`true` was untested, so this was trimmed to that single case.

**Enforcement (Phase 2)** — ✅ 5 tests in `packages/interact/test/css.spec.ts` (`describe('reduced motion')`), reshaped around the one-rule-per-target design

- **7 + 8** ✅ Two effects on one target — one finite, one ongoing — produce **exactly one** `@media (prefers-reduced-motion: reduce)` rule, holding `animation-duration: 1ms`, `animation-delay: 0s`, `animation-iteration-count: 1`, emitted **after** the target's `animation` shorthand rule. The iteration cap is what keeps an ongoing effect from looping at 1 ms, so there is no per-kind branch left to test separately.
- **9** ✅ A condition-gated `viewProgress` interaction emits its `view-timeline` rule under `(min-width: 900px) and (prefers-reduced-motion: no-preference)`, and the reduce rule of a target it shares with a `click` interaction carries no timeline declaration at all.
- **10 + 11** ✅ A condition-gated state effect declares `--transition-*` inside `@media (min-width: 900px) and (prefers-reduced-motion: no-preference)` — composition and gating in one assertion — while the state rule keeps `(min-width: 900px)` and its `styleProperties`, and no `reduce` rule is emitted for it at all.
- **12** ✅ **The F5 invariant:** for a `viewEnter` + `once` + `iterations: 2` effect, the `:not([data-interact-enter])` hiding rule stays unconditional, the target still gets its reduce rule, and **no rule anywhere** sets `animation-name` or an `--animation-*` custom property to `none`. Asserted over the whole output rather than one rule, since the design's F5 guarantee is that suppression-by-name never happens.
- **13** ✅ `createTransitionCSS` gates the transition on `no-preference` and emits no `transition: none` — the runtime and `generate()` paths now agree (F3), and the runtime output is unchanged from `master`.

**Motion (F2 gap)**

14. ✅ `getAnimation()` with a matching CSS animation **and** `reducedMotion: true` returns that group untouched (`packages/motion/test/motion.spec.ts`, after the existing "should return a CSS animation if a CSS animation is found"). A characterisation test — it passed on first run, which is the point: Phase 2 settles F2 in CSS and deliberately leaves motion's JS path alone, so this pins the division of labour against a future "fix" in JS.

**Reactivity (Phase 3)**

15. Preference flips to `reduce` → `controller.update()` is called for a `viewProgress` interaction and **not** for a `viewEnter` + `once` one.
16. With `forceReducedMotion` set explicitly, no `prefers-reduced-motion` listener is registered.
17. `destroy()` removes the listener (extend the existing leak assertions in `test/web.spec.ts` / `test/react.spec.tsx`).

**Manual / demo** — an `apps/demo` page with an entrance, an ongoing loop, a hover state effect and a `viewProgress` scrub, checked with the OS setting toggled **mid-session** and with JS disabled after pre-generating the CSS. The JS-disabled check is the one that proves Phase 2 is doing the work rather than Phase 1.

---

## 6. Documentation impact

Because the audit already tracks the docs-site side, this is the mapping rather than new prose.

| Audit item                                                                                | Current state                                                                                | After this plan                                                                                                                                                                                                                                                                          |
| :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §3.13 (L3023, L1867/1875)                                                                 | "The library skips pointer-driven effects entirely when reduced motion is preferred" — false | **Becomes true**, with the precision that pre-generated CSS enforces it too. Rewrite in terms of §3.3's per-kind table, not a single blanket sentence.                                                                                                                                   |
| §3.14 (`viewProgress` chapter)                                                            | No mention of reduced motion                                                                 | Add the same note as `pointerMove`, plus F4's consequence: supply a static fallback, because the effect is suppressed rather than collapsed.                                                                                                                                             |
| M8 (L2585, L4026)                                                                         | "`forceReducedMotion` must be set before `create()`"                                         | Still true for the **override**; add that detection needs no setup and that CSS-backed effects follow a live preference change (Phase 3 contract).                                                                                                                                       |
| L791 static-API row                                                                       | "force … regardless of the OS setting. Default: `false`."                                    | "`boolean \| undefined` — override the detected preference. Default `undefined` = follow `prefers-reduced-motion`. Set `false` to force motion on."                                                                                                                                      |
| §5.6 "Reduced motion appears four times" (L2550-2585, L2868-2891, L4000-4027, L4296-4298) | Four overlapping treatments                                                                  | Canonical section stays `understanding conditions` → Reduced motion; it now needs a "what Interact does automatically" subsection **plus** the existing "what you should still gate with conditions" guidance. The two are complementary, not alternatives — worth saying so explicitly. |
| L2584                                                                                     | "You can also force this globally: `Interact.forceReducedMotion = matchMedia(…).matches`"    | Delete — it becomes the default. Keep a note that the line is now redundant, since it is copy-pasted in real integrations.                                                                                                                                                               |
| L1467                                                                                     | "If you pre-generate the CSS, apply the reduced-motion guidance above."                      | Replace: pre-generated CSS now carries the reduced-motion rules itself.                                                                                                                                                                                                                  |

Also update, outside the docs site: `packages/interact/docs/api/interact-class.md:139`, `docs/api/types.md:286`, `rules/integration.md:353`, `rules/full-lean.md:42` and `:761`, `skills/interactor/references/config-schema.md:400`.

---

## 7. Risks

| #   | Risk                                                                                                                                                                                        | Mitigation                                                                                                                                                                                                                  |
| :-- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Behaviour change for existing sites.** Pages that animate today for reduce-preferring users will stop. That is the intent, but it will look like a regression to someone.                 | Minor bump (2.6.0), CHANGELOG under **Changed** with an explicit "how to restore the old behaviour" line (`Interact.forceReducedMotion = false`). Not a patch release.                                                      |
| R2  | `forceReducedMotion`'s default read value changes `false` → `undefined`.                                                                                                                    | `undefined` is falsy, so `if (Interact.forceReducedMotion)` and `!Interact.forceReducedMotion` are unaffected. Only `=== false` breaks. Grep the monorepo (currently zero internal readers) and note it in the CHANGELOG.   |
| R3  | **CSS size.** One extra `@media` rule per animated/state effect.                                                                                                                            | Measure on the demo config before/after. If it matters, group all reduce declarations for one stylesheet into a single `@media` block rather than one per rule — a pure serialisation change in `CSSRuleToString`'s caller. |
| R4  | **Cascade order.** The reduce override relies on coming after the base declaration at equal specificity.                                                                                    | Test 7 asserts emission order explicitly. Avoid `!important` here — `DEFAULT_INITIAL` already uses it and adding more makes author overrides impossible.                                                                    |
| R5  | **Phase 3 rebinding re-runs completed effects.** A blanket `controller.update()` on preference change would replay `once` entrances.                                                        | Scope the rebind to `viewProgress` / `pointerMove` only (§Phase 3). Test 15 pins it.                                                                                                                                        |
| R6  | **Suppressing a scrub effect can leave an element in its start state** (e.g. an `in`-range scroll preset that starts at `opacity: 0`) — the reduced-motion equivalent of F5, one layer out. | This is why Phase 4's validator nudge exists. Document it as an authoring requirement in the `viewProgress` chapter, and consider making the nudge a `warning` rather than `info` if the demo shows it biting.              |
| R7  | **`matchMedia` in test environments.** JSDOM does not implement it by default; several suites already stub it.                                                                              | The `typeof window.matchMedia !== 'function'` guard returns `false`, so existing suites keep passing unchanged. Test 5 pins that.                                                                                           |

---

## 8. Open questions

1. **Does `forceReducedMotion = false` mean "force motion on"?** This plan says yes (explicit override beats detection), which is the only reading consistent with the documented "regardless of the OS setting". Worth confirming — the alternative (`false` means "unset") would make it impossible to opt out of detection.
2. **Should `@wix/motion` get its own detection**, so that direct `getAnimation()` consumers outside Interact benefit? Motion currently takes `reducedMotion` as a parameter and never detects. Keeping detection in Interact only is the smaller change; adding it to Motion would make it available to `@wix/motion-presets` consumers too. Recommend deferring, but decide before releasing, because it affects where the API lands.
3. **Is `prefers-reduced-motion: reduce` the only signal?** Some products also gate on a user-account preference or a query param. If so, the override field is the integration point and nothing more is needed — but it should be a documented pattern rather than something each team rediscovers.
4. **Ongoing (`iterations: Infinity`) effects: suppress or pause at frame 0?** §3.3 says suppress (`animation-name: none`), which reveals the element's base style. `animation-play-state: paused` would freeze the first keyframe instead. Suppression is simpler and matches "no motion"; pausing preserves an intended look. Needs a design call, ideally on the demo page.
