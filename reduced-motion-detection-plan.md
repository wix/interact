# Reduced motion in `@wix/interact` — research, findings, and plan

**Status:** Phases 1, 2, 2.1, 2.2, 2.3 and 3 implemented (see §4). Phase 4 (validator, rules, docs) not started — the shipped docs stay wrong until it lands. **Read Phase 2.2 first:** it replaced Phase 2's per-target enforcement with per-effect collapse, which is what makes an author-supplied reduced-motion alternative actually usable, and it is the shape the docs should describe. Phase 2.3 then closed F7, so a reduced-motion alternative is safe to gate at either the interaction or the effect level.
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

### F7 — An interaction-level condition did not gate the FOUC initial rule — ✅ closed by Phase 2.3

Found while verifying Phase 2.2's output. `shouldUseInitial()` (`src/core/utilities.ts:19-28`) checks trigger, `triggerType` and hash equality, and nothing about conditions; the `DEFAULT_INITIAL` rule it produces is emitted with the **effect's** media (`src/core/css.ts:242`). Since interaction conditions never cascade into effect rules (`src/core/resolvers.ts:65-67`), a `viewEnter` + `once` interaction gated at the interaction level emits an **unconditional** `visibility: hidden` rule while its handler only binds when the condition matches. When it does not match, `data-interact-enter` is never written and the element stays hidden for the session.

This is not specific to reduced motion — `conditions: ['desktop']` on a `viewEnter` entrance strands the element on mobile the same way — and it predates all of this work. But it lands squarely on the pattern Phase 2.2 exists to enable, so it needs saying:

```js
// strands the element under `no-preference`
{ key: 'card', trigger: 'viewEnter', conditions: ['motion-reduced'], effects: [calm] }

// safe — the condition reaches the initial rule's media
{ key: 'card', trigger: 'viewEnter', effects: [{ ...calm, conditions: ['motion-reduced'] }] }
```

**Fixed in Phase 2.3** — the initial rule is now gated on the union of the interaction's and the effect's conditions, so both forms above are safe and the authoring distinction no longer exists.

### F6 — The flag is read once, at attach time — ✅ closed by Phase 3 (for the paths that need it)

Covered as audit M8. `Interact.forceReducedMotion` must be set before `Interact.create()`; changing it later does nothing until something rebinds. Once detection is automatic, users will reasonably expect toggling the OS setting mid-session to take effect — which is Phase 3.

Closed to the extent it matters: scrub interactions now rebind on a preference change, and CSS-backed time and state effects follow the query live with no JS at all (Phase 2). The **override** is still read-once — setting `Interact.forceReducedMotion` after `create()` rebinds nothing, by design, since no listener is registered when an override is present. That remains true of `customEffect` and other WAAPI-only effects too, which pick up a change on their next bind.

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

| Effect kind                                       | Under `reduce`                                                                                               | Why                                                                                                                                                                                                                         |
| :------------------------------------------------ | :----------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Time effect, **finite** `iterations`              | **Collapse** — `duration: 1ms`, `delay: 0ms`. The animation runs, finishes, and its fill state applies.      | Preserves the FOUC handshake (`data-interact-enter` reaches `done`) and the end state. F5.                                                                                                                                  |
| Time effect, **`iterations: Infinity`** (ongoing) | **Collapse too** — as implemented, the collapsed shorthand also caps iterations at 1, so no separate branch. | A 1 ms infinite loop is the thing to avoid; capping iterations achieves that without suppression-by-name, which cannot strand an element that owns a hiding rule (F5). Supersedes the original `animation-name: none` here. |
| State effect (`transition`)                       | **Drop the tween, keep the state** — `transition: none`. Already what the runtime path does (§1.4).          | The state is meaning, the tween is motion.                                                                                                                                                                                  |
| Scrub effect (`viewProgress` / `pointerMove`)     | **Suppress** — `animation-name: none` / `animation-timeline: none`, and keep the existing JS early-returns.  | There is no meaningful collapse of a scrubbed timeline. Requires the author to supply a fallback, which must use a time-based trigger — see Phase 2.1 and the retargeted nudge in Phase 4 item 1.                           |
| `customEffect`                                    | JS only — keep the current behaviour (`getWebAnimationEffect` collapse/drop).                                | Nothing to emit.                                                                                                                                                                                                            |

The invariant to assert in tests: **an effect that is suppressed under `reduce` must never be an effect for which `shouldUseInitial()` returns `true`.**

**All of the above are defaults, and Phase 2.2 makes them overridable per effect.** An effect whose own conditions — or its interaction's — mention `prefers-reduced-motion` has already stated what should happen under `reduce`, so Interact leaves that effect exactly as authored. Neighbouring effects on the same target are unaffected either way; gating one costs nothing to the rest. The single exception is scrub triggers, which are cancelled regardless, because the runtime handler early-returns regardless.

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

### Phase 2 — close the CSS bypasses ✅ DONE (enforcement shape later replaced — see Phase 2.2)

> **Superseded.** The per-target blanket rule described here, and the Phase 2.1 exemption built on top of it, were replaced by **Phase 2.2 — per-effect collapse**. The findings and the F2/F3/F4 closure still stand; only the enforcement mechanism changed. Kept for the reasoning trail.

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
- Under `reduce`, a `viewProgress` effect shows the element's base style (its timeline no longer resolves), so R6 stands: if that base style hides the element, it needs an author-supplied fallback. Since the fallback pattern this originally assumed did not actually work, see Phase 2.1 for what makes it work and Phase 4 item 1 for the retargeted validator check.
- That suppression rests on "unresolvable timeline name ⇒ animation with no timeline" rather than an explicit `none`. If an engine instead fell back to the document timeline, the animation would become time-based and the reduce rule would collapse it to its end state — graceful, but a different look. Worth confirming in a browser on the demo page; the unit tests only pin the emitted CSS.

Suite: `@wix/interact` 453/453, `@wix/motion` 286/286, `@wix/interact-validate` 159/159, `yarn lint` clean.

Still open after this phase: `customEffect` and the `fizban` `viewProgress` fallback are JS-only paths that CSS cannot reach (§3.2) — they rely on the Phase 1 flag, which is correct but only re-read on bind (F6). Phase 3 since made scrub interactions rebind on a preference change; `customEffect` still waits for the next bind.

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

### Phase 2.1 — let an explicit author condition win ✅ DONE (partly superseded by Phase 2.2)

> **Partly superseded.** Fix A survives and is still load-bearing. Fix B — the per-target, all-or-nothing exemption — was replaced by Phase 2.2's per-effect collapse, which is what the exemption was trying and failing to approximate. Kept for the reasoning trail.

Phase 2 as first shipped had the library override the author: an interaction or effect gated on a `prefers-reduced-motion` condition was still collapsed by the blanket target rule, and a `reduce`-gated `viewProgress` could never activate at all. That made Phase 4's "supply a fallback" nudge impossible to satisfy — the pattern it asks for did not work. Two fixes, both inside Phase 2's own files.

**A — an author-declared motion-preference condition suppresses the synthetic one.** `hasMotionPreferenceCondition(conditions, configConditions)` (`src/utils.ts:11`) reports whether any of the given conditions is a media condition whose predicate mentions `prefers-reduced-motion`. `getMotionPreferenceMedia` (`:29`) returns the author's own composed predicate when it does, instead of appending `$prefers-reduced-motion` on top. Without this, a `reduce`-gated `viewProgress` emitted its `view-timeline` under `(prefers-reduced-motion: reduce) and (prefers-reduced-motion: no-preference)` — a query that can never match, so the fallback silently did nothing. Both authoring styles of the predicate work (`'prefers-reduced-motion: reduce'`, and the parenthesised `'(prefers-reduced-motion: reduce)'` the docs use).

**B — no blanket collapse for a target the author already gated.** `CSSCoordinatedLists` gains `motionGated?: boolean` (`src/types/css.ts:32`), AND-ed per animation contribution in `pushToTargetCustomPropsLists` (`src/core/css.ts:105`) and consulted by `buildReducedMotionRule` (`src/core/cssUtils.ts:168`), which now returns `null` for a gated target. `parseInteraction`'s `trackMotionGating` (`src/core/css.ts:512`) computes the flag from the interaction's conditions **or** each contributing effect's own conditions, over both plain effects and sequence effects.

Two deliberate narrowings in B:

- **"Every", not "any".** The exemption fires only when every animation on the target is motion-gated. A target mixing a gated animation with an ungated one keeps its blanket rule, since the ungated one would otherwise play at full strength under `reduce`. The docs' canonical two-interaction pattern (`docs/guides/conditions-and-media-queries.md:210-240` — one interaction on `motion-ok`, one on `motion-reduced`) qualifies, which is the case that matters.
- **Only animation contributions vote.** The flag is touched only when the pushed properties include `animation`, and `trackMotionGating` skips effects with no `namedEffect`/`keyframeEffect`. So a transition-only effect on the same target neither earns nor forfeits the exemption — matching `buildReducedMotionRule`'s own guard on `properties.animation`.

**What this makes possible, and what it does not.** A `reduce`-gated _time_ interaction now animates at its authored duration, so per-condition gentler alternatives work again — which is what makes `rules/full-lean.md:42` true rather than dead. A `reduce`-gated `viewProgress` now emits a live `view-timeline` query, but its **JS handler still early-returns** on `Interact.reducedMotion` (`src/handlers/viewProgress.ts:25`, `src/handlers/pointerMove.ts:23`), so `fizban`/`kuliso`-backed scrubbing stays off either way.

Deliberately not done: threading an "author opted in explicitly" flag through `add.ts` to reach those guards. It collides with Phase 3's surface, and a `reduce`-gated `pointerMove` is a strange thing to want in the first place. **Ship the limitation instead: scrub triggers are always suppressed under `reduce`, with no opt-out.** The fallback for a scrub is therefore a time-based trigger (`viewEnter`) or a plain base-style CSS rule — which is the semantically right substitution anyway: under `reduce` you don't want a gentler scrub, you want the content to be there.

Also worth recording, found while scoping B: interaction-level conditions never cascade into effect rules' media (`resolveEffectForCSS` keeps only the effect's own conditions, `src/core/resolvers.ts:65-67`; sequence conditions do cascade, `:135-140`). So an interaction-gated animation's custom properties are declared unconditionally by `generate()` and the gating happens at runtime through `add.ts`'s media listeners. Fix B reads both levels, so it is unaffected — but `generate()` output alone does not media-gate interaction-level conditions, which is a separate thing the docs should probably say.

Tests: 4 added to `test/css.spec.ts`'s `reduced motion` describe (items 18–21 in §5); three of them fail on Phase 2's code, verified by temporarily disabling both fixes. Suite: `@wix/interact` 460/460, `@wix/motion` 286/286, `@wix/interact-validate` 159/159, `yarn lint` clean.

### Phase 2.2 — collapse per effect, through its own custom property ✅ DONE

**The problem with 2.1.** Phase 2's blanket rule sets timing longhands on the target, which hit every animation on that element at once. The only way to spare an author's alternative was to skip the whole rule, and skipping it had to be all-or-nothing — hence "every animation on the target must be gated" (R8). In practice that made the feature unusable: to say "under `reduce`, run this gentler entrance instead", an author also had to add a motion condition to every unrelated hover, click and entrance effect that happened to share the element. The escape hatch existed but nobody could reach it.

**The fix: stop touching longhands.** A longhand cannot address one animation in a list — `animation-duration: 1ms` applies to all of them. But each effect already owns exactly one `animation` custom property, and re-declaring only that property collapses only that effect. So the reduce rule moved from the target back to the effect:

```css
[data-interact-key='card'] > :first-child {
  --animation-1-h: bigSpin 800ms 100ms linear infinite paused;
}
@media (prefers-reduced-motion: reduce) {
  [data-interact-key='card'] > :first-child {
    --animation-1-h: bigSpin 1ms 0ms linear 1 paused;
  }
}
```

Everything else on the element — including `--animation-0-h`, an entrance the author gated on `reduce` — is untouched.

What landed:

- `packages/motion/src/api/cssAnimations.ts:70` — `getCSSAnimation` items gain `reducedAnimation`: the same shorthand run through the same `getAnimationAsCSS` with `duration: 1, delay: 0, iterations: 1`. Motion owns the shorthand format, so the collapsed form is generated by the function that generates the original rather than reconstructed by string surgery — no `reduceAnimation()` regex, and the two cannot drift.
- `packages/interact/src/core/css.ts:320` — `effectToCSS` pushes one reduce rule per effect, after the declaration it overrides, carrying the same `selectorSuffix` (so an `initial` effect's override lands on `:not([data-interact-enter="done"])` and actually applies) and `getMotionPreferenceMedia('reduce', conditions, configConditions)` as its media, so effect conditions compose.
- `packages/interact/src/core/css.ts:163` — `triggerToCSS` now passes `force` (below).
- Deleted: `buildReducedMotionRule`, `REDUCED_MOTION_DECLARATIONS`, `CSSCoordinatedLists.motionGated`, `trackMotionGating`, and the `motionGated` parameter of `pushToTargetCustomPropsLists`. `_generate` is back to one lists rule per target.

**Who is exempt.** An effect gets no collapse rule when its own conditions, or its interaction's, mention `prefers-reduced-motion` — "any", at effect granularity, replacing 2.1's "every", at target granularity. The interaction-level check still has to be threaded down through `parseEffect`/`parseSequence` (`interactionMotionGated`), because interaction conditions never cascade into effect rules' media.

**Scrub keeps being cancelled, and now unconditionally.** `getMotionPreferenceMedia` gained a `force` flag (`src/utils.ts:35`) that skips Fix A's author-deference. `triggerToCSS` passes it, so a `viewProgress` interaction gated on `reduce` emits its `view-timeline` under `(prefers-reduced-motion: reduce) and (prefers-reduced-motion: no-preference)` — a query that never matches, which is the **correct** encoding rather than the bug Phase 2.1 took it for: the runtime handler early-returns on `Interact.reducedMotion` regardless of conditions (`src/handlers/viewProgress.ts:25`, `src/handlers/pointerMove.ts:23`), so under `no-preference` the condition fails and under `reduce` the handler bails. Net: never runs, in CSS and in JS alike. Scrub effects are also never given a collapse rule — there is no meaningful collapse of a scrubbed timeline.

Fix A still applies where the author genuinely owns the outcome: a state effect gated on `reduce` emits its `--transition-*` under `(prefers-reduced-motion: reduce)` and keeps its authored tween.

**Why not the longhand-lists variant.** Promoting `animation-duration` / `animation-delay` / `animation-iteration-count` to coordinated lists would also give per-effect control, but it costs three extra list declarations on every animated target plus three extra custom properties per effect, and each list has to stay index-aligned with `animation` — including for effects that expand to several animations (parts), where one custom property holds a comma-list. Overriding the single `animation` property sidesteps the alignment problem entirely and emits one declaration instead of three.

Tests: the `reduced motion` describe was rewritten around the new shape — 10 tests (§5, items 18–27). Suites: `@wix/interact` 464/464, `@wix/motion` 286/286, `@wix/interact-validate` 159/159, `@wix/motion-presets` 516/516, `@wix/splittext` 131/131, `yarn lint` clean.

### Phase 2.3 — gate the FOUC initial rule on the interaction's conditions ✅ DONE

Closes F7. The hiding rule now carries every condition that governs whether the effect actually runs, not just the effect's own.

- `packages/interact/src/core/css.ts:247` — `effectToCSS` builds `effectiveConditions`, the deduped union of the interaction's conditions and the effect's, and derives `initialMedia` / `initialSelectorCondition` from it. Only the `DEFAULT_INITIAL` rule uses them; every other declaration keeps the effect's own `media`, since a declaration an inactive interaction never plays is harmless.
- Both `media` and `selectorCondition` are composed, so a `selector`-type condition on the interaction reaches the hiding rule too — otherwise the same stranding happens one type over.
- `interactionConditions?: string[]` replaced Phase 2.2's `interactionMotionGated: boolean` through `parseEffect`/`parseSequence`. The motion-gating check for the collapse rule now reads the same `effectiveConditions`, so one parameter serves both and the two can no longer disagree about what the interaction said.

Why only the initial rule: gating _all_ of an effect's declarations on its interaction's conditions would be a much larger behaviour change — a `motion-ok`-gated animation's custom properties would vanish from the coordinated list under `reduce` rather than sitting there paused — and nothing needs it. The initial rule is the only declaration whose absence of a handler is actively harmful.

Tests: 5 (§5, items 28–32); all four of the F7 cases fail on the pre-fix code, verified by reverting the two-line gating. Suites: `@wix/interact` 469/469, `@wix/motion` 286/286, `@wix/interact-validate` 159/159, `@wix/motion-presets` 516/516, `@wix/splittext` 131/131, `yarn lint` clean.

### Phase 3 — react to a mid-session preference change ✅ DONE

Implemented as specified below, with no new machinery. What landed:

- `packages/interact/src/core/add.ts:898-910` — one guarded block at the top of `add()`, after `instance.setController`, registering the listener only when all four of `Interact.forceReducedMotion === undefined`, `typeof window !== 'undefined'`, `typeof window.matchMedia === 'function'` and `triggers.some((t) => t.trigger === 'viewProgress' || t.trigger === 'pointerMove')` hold:

  ```js
  instance.setupMediaQueryListener(
    `${key}::reducedMotion`,
    window.matchMedia('(prefers-reduced-motion: reduce)'),
    key,
    () => controller.update(),
  );
  ```

- `packages/interact/test/reducedMotion.spec.ts` — new `reactivity` describe, 3 tests (plan items 15–17).

Teardown is automatic, as designed — the listener goes through the same `mediaQueryListeners` map as condition gating, so `clearMediaQueryListenersForKey` and `destroy()` already cover it, and no change to `Interact.ts` was needed beyond the follow-up below.

#### Phase 3 follow-ups — reviewed, two acted on

Four properties of the implementation were reviewed. Two were left alone deliberately, two were addressed:

1. **Duplicate query literal — fixed.** `Interact.ts` and `add.ts` each held their own `matchMedia('(prefers-reduced-motion: reduce)')` string, and `utils.ts` a third spelling of the same feature. Divergence was a plausible future bug — one site gaining an old-Safari fallback, or switching to `not (prefers-reduced-motion: no-preference)`, while the other did not, silently splitting detection from reactivity. Now one exported `REDUCED_MOTION_QUERY` (`src/utils.ts:11`), derived from `MOTION_PREFERENCE_FEATURE` so the feature name itself has a single root, consumed by `src/core/Interact.ts:64` and `src/core/add.ts:906`. `getMotionPreferenceMedia`'s synthetic predicate uses the same root. No stray literal remains in `packages/interact/src`.

2. **Cross-key rebind — now covered by a test (item 22).** The listener is registered on the **source** key only, since `add()` reads `triggers` from `instance.get(key)`. A cross-key scrub (interaction sourced at A, effect targeting B) therefore depends entirely on A's rebind reaching B, and two things made that worth proving rather than assuming: `remove()` collects elements from `instance.get(A)?.selectors` queried within **A's own element** (`src/core/remove.ts:16-27`), so the teardown half never reaches B and the re-attach relies on the handler modules tolerating a repeat `.add()`; and the handler may have been attached from **either** side depending on connect order. Verified working in both orderings — the mechanism that saves it is `clearInteractionStateForKey` (`src/core/Interact.ts:160-166`), which drops the key's `addedInteractions` entries so `connect()` does not hit the already-added guard, and `interactionIds` is populated for both the source and target entries (`:504`, `:517`).

3. **Sharing the `MediaQueryList` object — deliberately not done.** `add()` still calls `matchMedia` itself rather than reusing Phase 1's cached `Interact._prefersReducedMotion`. Both objects observe the same query and both fire, so there is no failure mode; reaching the private static from `add.ts` would mean widening it or adding an accessor, paying in API surface for a few bytes. Note that test 6's "matchMedia called at most once" claim scopes to the getter, not to `add()`.

4. **One listener per controller key — deliberately not changed.** A page with 50 scrub-triggered elements registers 50 handlers. That is the correct grain rather than waste: each controller needs its own `update()`, and teardown is keyed by controller so `clearMediaQueryListenersForKey` works. Condition gating already registers per key on both the source (`src/core/add.ts:238`) and target (`:738`) sides.

Still open by design: **a `reduce`-gated scrub is not rescued (R9).** Such an interaction now rebinds on a preference change and its handler still early-returns on `Interact.reducedMotion`, so the rebind churns and produces nothing. Suppressing that churn would mean detecting "this interaction will early-return anyway" — more machinery than a wasted `disconnect(); connect();` costs.

Original plan for reference:

Reuse the existing media-condition machinery rather than inventing anything: `Interact.setupMediaQueryListener(id, mql, key, handler)` (`src/core/Interact.ts:161-174`) with `handler = () => controller.update()`, exactly as condition gating does at `src/core/add.ts:899-906` and `:945-952`. `update()` is `disconnect(); connect();` (`src/core/InteractionController.ts:96-99`).

Scope it deliberately:

- Register the listener **only** when `Interact.forceReducedMotion === undefined` (an explicit override means the author owns the decision).
- Rebind **only** interactions whose trigger is `viewProgress` or `pointerMove`. Those are the ones added and removed wholesale by the flag, so a rebind is the only way to pick up a change. Time effects and state effects are already handled live by the Phase 2 CSS, so rebinding them buys nothing and risks re-running a `once` entrance that has already completed.
- Tear the listener down in `clearMediaQueryListenersForKey` / `destroy()` — automatic, since it goes through the same `mediaQueryListeners` map.

Document the resulting contract honestly rather than over-promising: CSS-backed time and state effects respond to a preference change immediately; scrub effects respond after the rebind; `customEffect` and other WAAPI-only effects respond on the next bind.

### Phase 4 — validator, rules, docs

1. **`@wix/interact-validate`** — new semantic nudge `SUPPRESSED_SCRUB_START_STATE` (new category `REDUCED_MOTION`, severity `info`).

   **Not** the sibling-based check originally sketched here (`MISSING_REDUCED_MOTION_FALLBACK`: "a `viewProgress`/`pointerMove` interaction with no sibling effect gated on a `reduce` condition"). That was dropped, for two reasons found while implementing Phase 2.1:
   - Even after 2.1, a `reduce`-gated **scrub** sibling still cannot run (the JS handlers early-return unconditionally). So the original check would be silenced by a sibling that does nothing, while the fallbacks that do work — a `reduce`-gated time interaction, or a plain base-style CSS rule — are a different shape entirely. It pointed authors at the wrong pattern and had a false-negative built in.
   - The failure it guards is not fully visible from the config. Under `reduce` a suppressed scrub renders the element at its **authored base style**, and Interact never strands it itself (`shouldUseInitial()` requires `trigger === 'viewEnter'`, so a `viewProgress` target gets no hiding rule). It only breaks when the _author's own_ CSS hides or clips the element — which is not in the `InteractConfig`.

   Check instead the one thing that is config-visible: a `viewProgress`/`pointerMove` effect whose **start state is invisible or displaced** — first keyframe with `opacity: 0`, a large `translate`/`scale`, or a `namedEffect` known to start that way — i.e. the effect is a reveal rather than an embellishment. Message it as a statement about base style, making no claim about siblings: _"suppressed under reduced motion; the element renders at its base style. If that base style hides it, gate a time-based alternative on `(prefers-reduced-motion: reduce)` or add the rule to your own CSS."_ Follow the shape of `checkRecommendedFill` (`src/semantic/recommendedPatterns.ts`) and register the code in `RULE_CODE_MAP` (`src/errors.ts`). Add to the two code tables in `rules/validate.md` (`:143`, `:237`) and `interact-validate/README.md`.

2. **Rules files** — state the per-kind semantics of §3.3 once, in `rules/full-lean.md` near the existing reduced-motion bullet (`:42`), and cross-reference from `rules/viewprogress.md` and `rules/pointermove.md` (audit A15). Update the `Interact.forceReducedMotion` rows in `rules/integration.md:353`, `rules/full-lean.md:761`, and `skills/interactor/references/config-schema.md:400` to describe `undefined` = detect.

   `rules/full-lean.md:42` needs care: its advice to "use conditions to provide gentler alternatives (shorter durations, fewer transforms)" was made **false** by Phase 2 — every duration on an Interact-managed target collapsed to 1 ms — and made true again by Phase 2.2, this time without conditions on the surrounding effects. Keep the advice and add three things:
   - the alternative must carry an explicit `prefers-reduced-motion` condition — that is what exempts it, and it exempts **only** it, so neighbouring effects on the same target need no changes;
   - the condition may sit on the interaction or the effect — since Phase 2.3 both gate the entrance's hiding rule, so neither strands the element (F7);
   - a scrub's alternative must use a time-based trigger, since a `reduce`-gated `viewProgress`/`pointerMove` interaction never runs in either CSS or JS (R9).

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

**Enforcement (Phase 2 → reshaped by Phase 2.2)** — ✅ 10 tests in `packages/interact/test/css.spec.ts` (`describe('reduced motion')`). Items 7–13 were rewritten against the per-effect shape; 18–27 number the describe as it now stands.

A note on the test helper, because it is the subtle part: a collapse rule cannot be identified by its media query alone. An effect the author gated on `reduce` declares its **authored** value under exactly the same `@media (prefers-reduced-motion: reduce)`. `collapseRulesOf` therefore also requires a single declaration, of an animation custom property, whose value carries the 1 ms marker. Getting this wrong is what made the first draft of these tests pass vacuously.

18. ✅ Two ungated effects on one target produce **two** collapse rules, each touching only its own `--animation-N` property, with distinct names — and **no** rule anywhere sets `animation-duration`, `animation-delay` or `animation-iteration-count`, the blanket longhands that would hit neighbours. Each override is asserted to follow the declaration it overrides.
19. ✅ **The headline case, and the one Phase 2.1 got wrong.** A `motion-reduced`-gated `viewEnter` sharing a target with an ungated `hover` effect: exactly one collapse rule, for the ungated effect, while the gated effect keeps its authored `300ms` and gets none.
20. ✅ The collapsed shorthand keeps the animation name and `fill`, carries `1ms`/`0ms`, drops the authored `500ms`/`200ms`, and turns `infinite` into a single iteration — the ongoing-effect case, now handled by the shorthand rather than a separate branch.
21. ✅ An ungated effect's own conditions compose: `(min-width: 900px) and (prefers-reduced-motion: reduce)`.
22. ✅ A motion condition on the **effect** rather than the interaction also exempts it — pins that both levels are read, which matters because interaction conditions never cascade into effect rules.
23. ✅ **Scrub parity.** A `motion-reduced`-gated `viewProgress` emits its `view-timeline` under a query carrying **both** `reduce` and `no-preference` — i.e. never matching, matching the runtime's unconditional early-return — and gets no collapse rule. This is the assertion that reversed Phase 2.1's reading of the same output.
24. ✅ A condition-gated `viewProgress` emits `view-timeline` under `(min-width: 900px) and (prefers-reduced-motion: no-preference)`, while a `click` effect sharing the target is collapsed normally and touches no timeline.
25. ✅ **10 + 11 carried over:** a condition-gated state effect declares `--transition-*` inside `@media (min-width: 900px) and (prefers-reduced-motion: no-preference)` while the state rule keeps `(min-width: 900px)` and its `styleProperties`, and no `reduce` rule is emitted for it.
26. ✅ A `reduce`-gated **state** effect keeps its transition, declared under `(prefers-reduced-motion: reduce)` with its authored `200ms` — the deliberate asymmetry against 23: a tween the author scoped to `reduce` is theirs, a scrub is not.
27. ✅ **The F5 invariant:** for a `viewEnter` + `once` + `iterations: 2` effect the `:not([data-interact-enter])` hiding rule stays unconditional, the effect still gets its collapse rule, that rule carries the **same** `:not([data-interact-enter="done"])` suffix as the declaration it overrides — without which it would silently not apply — and **no rule anywhere** sets `animation-name` or an `--animation-*` property to `none`.

Plus **13** ✅ unchanged: `createTransitionCSS` gates the transition on `no-preference` and emits no `transition: none`, so the runtime and `generate()` paths agree (F3) and the runtime output still matches `master`.

**Initial rule gating (Phase 2.3, F7)** — ✅ 4 tests in `describe('initial rule conditions')` plus 1 in the reduced-motion describe. All 4 F7 cases fail on the pre-fix code.

28. ✅ A `viewEnter` + `once` interaction gated on `desktop` emits its `:not([data-interact-enter])` hiding rule under `(min-width: 900px)` — deliberately a non-motion condition, since F7 is about conditions generally.
29. ✅ Interaction and effect conditions compose into that rule: `(min-width: 900px) and (min-width: 1200px)`.
30. ✅ A `selector`-type condition on the interaction reaches the rule's `selectorCondition` as `:is(.dark)` — the same stranding one condition type over, easy to miss when only `media` is threaded.
31. ✅ With nothing gated, the rule stays unconditional in both `media` and `selectorCondition` — the regression guard for the ordinary case, and the pairing F5 depends on.
32. ✅ The reduced-motion shape specifically: a `motion-reduced`-gated `viewEnter` interaction emits its hiding rule under `(prefers-reduced-motion: reduce)`, so no-preference visitors are never left staring at an invisible element.

**Motion (F2 gap)**

14. ✅ `getAnimation()` with a matching CSS animation **and** `reducedMotion: true` returns that group untouched (`packages/motion/test/motion.spec.ts`, after the existing "should return a CSS animation if a CSS animation is found"). A characterisation test — it passed on first run, which is the point: Phase 2 settles F2 in CSS and deliberately leaves motion's JS path alone, so this pins the division of labour against a future "fix" in JS.

**Reactivity (Phase 3)**

15. ✅ Preference flips to `reduce` → `controller.update()` is called for a `viewProgress` interaction and **not** for a `viewEnter` + `once` one. Asserted both ways: `mediaQueryListeners.size` is 1 on the `viewProgress` instance and 0 on the `viewEnter` one, then the captured `change` handler is invoked and the spy on `update()` checked.
16. ✅ With `forceReducedMotion` set explicitly, no `prefers-reduced-motion` listener is registered.
17. ✅ `destroy()` removes the listener. Landed as a dedicated test in `reducedMotion.spec.ts` asserting `removeEventListener('change', …)` and `mediaQueryListeners.size === 0`, rather than by extending the leak assertions in `test/web.spec.ts` / `test/react.spec.tsx` as originally sketched — same coverage, kept with the rest of the reduced-motion suite.

**Cross-key rebind (Phase 3 follow-up)** — item 22, one `it.each` over two orderings.

- ✅ An interaction sourced at `src-key` with its `viewProgress` effect targeting `tgt-key`, with `matches: false` so the handler actually attaches. Asserts the listener id `src-key::reducedMotion` exists while `tgt-key::reducedMotion` does **not** (pinning the source-only registration), then fires the stored handler and requires the handler on the target element to be re-attached **exactly once** — not zero, which would mean the rebind never reaches a cross-key target, and not twice, which would mean a double-attach. Parameterised over both connect orderings, since 'source first' attaches via the target's `addEffectsForTarget` while 'target first' attaches via the source's `_addInteraction`. Confirmed non-vacuous: both cases fail with `expected +0 to be 1` when `clearInteractionStateForKey` is neutered — and tests 15–17 still pass under that break, since they assert only that `update()` was _called_, never that the rebind re-attached anything.

**Manual / demo** — an `apps/demo` page with an entrance, an ongoing loop, a hover state effect and a `viewProgress` scrub, checked with the OS setting toggled **mid-session** and with JS disabled after pre-generating the CSS. The JS-disabled check is the one that proves Phase 2 is doing the work rather than Phase 1.

---

## 6. Documentation impact

Because the audit already tracks the docs-site side, this is the mapping rather than new prose.

| Audit item                                                                                | Current state                                                                                | After this plan                                                                                                                                                                                                                                                                                                                                                                                                                       |
| :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| §3.13 (L3023, L1867/1875)                                                                 | "The library skips pointer-driven effects entirely when reduced motion is preferred" — false | **Becomes true**, with the precision that pre-generated CSS enforces it too. Rewrite in terms of §3.3's per-kind table, not a single blanket sentence.                                                                                                                                                                                                                                                                                |
| §3.14 (`viewProgress` chapter)                                                            | No mention of reduced motion                                                                 | Add the same note as `pointerMove`, plus F4's consequence: the effect is suppressed rather than collapsed, so the element falls back to its authored base style. Say explicitly that a `reduce`-gated alternative for a scrub must use a time-based trigger (Phase 2.1), since a `reduce`-gated `viewProgress` never runs.                                                                                                            |
| M8 (L2585, L4026)                                                                         | "`forceReducedMotion` must be set before `create()`"                                         | Still true for the **override** — and now precisely _because_ an override suppresses the change listener, so it is read-once by design. Add that detection needs no setup, and state the Phase 3 contract per path: CSS-backed time and state effects follow a preference change immediately (Phase 2, no JS involved), scrub interactions rebind and pick it up, `customEffect` and other WAAPI-only effects wait for the next bind. |
| L791 static-API row                                                                       | "force … regardless of the OS setting. Default: `false`."                                    | "`boolean \| undefined` — override the detected preference. Default `undefined` = follow `prefers-reduced-motion`. Set `false` to force motion on."                                                                                                                                                                                                                                                                                   |
| §5.6 "Reduced motion appears four times" (L2550-2585, L2868-2891, L4000-4027, L4296-4298) | Four overlapping treatments                                                                  | Canonical section stays `understanding conditions` → Reduced motion; it now needs a "what Interact does automatically" subsection **plus** the existing "what you should still gate with conditions" guidance. The two are complementary, not alternatives — worth saying so explicitly.                                                                                                                                              |
| L2584                                                                                     | "You can also force this globally: `Interact.forceReducedMotion = matchMedia(…).matches`"    | Delete — it becomes the default. Keep a note that the line is now redundant, since it is copy-pasted in real integrations.                                                                                                                                                                                                                                                                                                            |
| L1467                                                                                     | "If you pre-generate the CSS, apply the reduced-motion guidance above."                      | Replace: pre-generated CSS now carries the reduced-motion rules itself.                                                                                                                                                                                                                                                                                                                                                               |

Also update, outside the docs site: `packages/interact/docs/api/interact-class.md:139`, `docs/api/types.md:286`, `rules/integration.md:353`, `rules/full-lean.md:42` and `:761`, `skills/interactor/references/config-schema.md:400`.

---

## 7. Risks

| #   | Risk                                                                                                                                                                                                                                                                                                                                                                                                                                     | Mitigation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| :-- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | **Behaviour change for existing sites.** Pages that animate today for reduce-preferring users will stop. That is the intent, but it will look like a regression to someone.                                                                                                                                                                                                                                                              | Minor bump (2.6.0), CHANGELOG under **Changed** with an explicit "how to restore the old behaviour" line (`Interact.forceReducedMotion = false`). Not a patch release.                                                                                                                                                                                                                                                                                                                                              |
| R2  | `forceReducedMotion`'s default read value changes `false` → `undefined`.                                                                                                                                                                                                                                                                                                                                                                 | `undefined` is falsy, so `if (Interact.forceReducedMotion)` and `!Interact.forceReducedMotion` are unaffected. Only `=== false` breaks. Grep the monorepo (currently zero internal readers) and note it in the CHANGELOG.                                                                                                                                                                                                                                                                                           |
| R3  | **CSS size.** One extra `@media` rule per animated/state effect.                                                                                                                                                                                                                                                                                                                                                                         | Measure on the demo config before/after. If it matters, group all reduce declarations for one stylesheet into a single `@media` block rather than one per rule — a pure serialisation change in `CSSRuleToString`'s caller.                                                                                                                                                                                                                                                                                         |
| R4  | **Cascade order.** The reduce override relies on coming after the base declaration at equal specificity.                                                                                                                                                                                                                                                                                                                                 | Test 7 asserts emission order explicitly. Avoid `!important` here — `DEFAULT_INITIAL` already uses it and adding more makes author overrides impossible.                                                                                                                                                                                                                                                                                                                                                            |
| R5  | **Phase 3 rebinding re-runs completed effects.** A blanket `controller.update()` on preference change would replay `once` entrances.                                                                                                                                                                                                                                                                                                     | Closed: the rebind is scoped to `viewProgress` / `pointerMove` by the `triggers.some(...)` guard at `src/core/add.ts:902`, and test 15 pins both halves.                                                                                                                                                                                                                                                                                                                                                            |
| R6  | **Suppressing a scrub effect can leave an element hidden** (e.g. an `in`-range scroll preset whose base style is `opacity: 0`) — the reduced-motion equivalent of F5, one layer out.                                                                                                                                                                                                                                                     | Narrower than first assessed: the suppressed animation is not applied at all, so the element renders at its authored base style, and Interact adds no hiding rule of its own for a `viewProgress` target (`shouldUseInitial()` requires `viewEnter`). It bites only when the author's own CSS hides or clips the element — which the config cannot see. Hence the retargeted, start-state-based nudge in Phase 4, plus the `viewProgress` chapter note. Consider `warning` over `info` if the demo shows it biting. |
| R7  | **`matchMedia` in test environments.** JSDOM does not implement it by default; several suites already stub it.                                                                                                                                                                                                                                                                                                                           | The `typeof window.matchMedia !== 'function'` guard returns `false`, so existing suites keep passing unchanged. Test 5 pins that.                                                                                                                                                                                                                                                                                                                                                                                   |
| R8  | ~~**Phase 2.1's exemption is all-or-nothing per target.**~~ **Closed by Phase 2.2.** The judgement that per-animation control required reintroducing `reduceAnimation()` was wrong — overriding the effect's own `animation` custom property gives it for one declaration, with no shorthand reconstruction. The all-or-nothing grain it was accepting made the escape hatch unreachable in practice; that is what prompted the reshape. | No mitigation needed. The `rules/full-lean.md:42` guidance in Phase 4 item 2 changes accordingly: gate the alternative, and only the alternative — neighbouring effects on the same target are unaffected.                                                                                                                                                                                                                                                                                                          |
| R9  | **A `reduce`-gated scrub interaction never runs.** Still true, but no longer a CSS/JS split: Phase 2.2 forces the `no-preference` gate on the timeline, so CSS and the runtime now agree it never runs.                                                                                                                                                                                                                                  | Intentional parity, not a limitation to route around. Phase 4 item 2 states it plainly: a scrub's reduced-motion alternative must use a time-based trigger. Revisiting means an explicit opt-out flag threaded through `add.ts` **and** the CSS gate, in step — do not change one without the other.                                                                                                                                                                                                                |
| R10 | ~~**F7 — an interaction-level condition leaves a `viewEnter` entrance's hiding rule unconditional.**~~ **Closed by Phase 2.3**, which gates that rule on the union of interaction and effect conditions, for `media` and `selector` alike.                                                                                                                                                                                               | No mitigation needed, and no authoring caveat left to document. Note the fix is not reduced-motion-specific: `conditions: ['desktop']` on an entrance used to strand the element on mobile in exactly the same way, and no longer does.                                                                                                                                                                                                                                                                             |

---

## 8. Open questions

1. **Does `forceReducedMotion = false` mean "force motion on"?** This plan says yes (explicit override beats detection), which is the only reading consistent with the documented "regardless of the OS setting". Worth confirming — the alternative (`false` means "unset") would make it impossible to opt out of detection.
2. **Should `@wix/motion` get its own detection**, so that direct `getAnimation()` consumers outside Interact benefit? Motion currently takes `reducedMotion` as a parameter and never detects. Keeping detection in Interact only is the smaller change; adding it to Motion would make it available to `@wix/motion-presets` consumers too. Recommend deferring, but decide before releasing, because it affects where the API lands.
3. **Is `prefers-reduced-motion: reduce` the only signal?** Some products also gate on a user-account preference or a query param. If so, the override field is the integration point and nothing more is needed — but it should be a documented pattern rather than something each team rediscovers.
4. **Ongoing (`iterations: Infinity`) effects: suppress or pause at frame 0?** §3.3 says suppress (`animation-name: none`), which reveals the element's base style. `animation-play-state: paused` would freeze the first keyframe instead. Suppression is simpler and matches "no motion"; pausing preserves an intended look. Needs a design call, ideally on the demo page.
