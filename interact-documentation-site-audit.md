# Audit — `interact-documentation-site.md` — remaining work

**Audited file:** `interact-documentation-site.md`
**Audited against:** `packages/interact/src/**`, `packages/interact/rules/*.md`, `packages/interact/README.md`, `packages/interact-validate/src/**`, `packages/motion-presets/src/**`, `packages/motion/src/**`, `packages/splittext/src/plugin/**`
**Original audit:** 2026-07-26 · **Re-verified:** 2026-08-04 · **Remediation pass:** 2026-08-13
**Package versions:** `@wix/interact` 2.5.6, `@wix/motion` 2.1.9, `@wix/motion-presets` 1.0.4, `@wix/interact-validate` 0.1.2, `@wix/splittext` 0.1.2

> **This document has been reduced to open items only.** The 2026-08-13 remediation pass closed the
> blocking issues, the technical errors, the authoring residue, the structural defects and the
> style/consistency work — except for the two deliberately deferred clusters below. See
> [§0](#0-what-the-2026-08-13-pass-closed) for what was done.

Line numbers from the original audit no longer apply: the file grew from 4,729 to ~6,770 lines.
**Locate every item below by searching for the quoted text.**

---

## Table of contents

1. [What the 2026-08-13 pass closed](#0-what-the-2026-08-13-pass-closed)
2. [Deferred cluster A — reduced motion](#1-deferred-cluster-a--reduced-motion)
3. [Deferred cluster B — selectors and element resolution](#2-deferred-cluster-b--selectors-and-element-resolution)
4. [Open decision — release gating of 2.6.0 API](#3-open-decision--release-gating-of-260-api)
5. [Upstream items still open](#4-upstream-items-still-open)
6. [Findings raised during remediation](#5-findings-raised-during-remediation)
7. [Verification baseline](#6-verification-baseline)

---

## 0. What the 2026-08-13 pass closed

The site doc went from 4,729 to ~6,770 lines and from 27 to 28 pages. It is Prettier-clean and
passes these mechanical checks — **re-run them before publishing**:

| Check                                                                         | Result  |
| :---------------------------------------------------------------------------- | :------ |
| `ADDLINK`, `google.com/search?q=`, `docs.google.com`, `http://Configuration/` | 0       |
| Owner/Reviewer lines, internal `@wix.com` addresses                           | 0       |
| Emoji role markers (🧑‍🌾 / 🧑‍💻)                                                  | 0       |
| Bold-wrapped headings, smart quotes, empty `()` links                         | 0       |
| `data-interact-initial`, `pageVisible`                                        | 0       |
| Internal links resolving to a real page slug **and** heading anchor           | 213/213 |
| Code fences balanced and language-labelled                                    | yes     |

Closed: all 12 blocking issues except the element-resolution one (B11); technical errors §3.1,
§3.5–§3.12, §3.15–§3.22; missing-information items M1–M7 and M9–M29; all of §5 (residue),
§6 (structure), §7 (authoring style), §8 (terminology), §9 (code samples) and §10 (markdown
defects). Two pages were authored from scratch: **Plugins** (M25) and **The final result** (B5).
Page titles are now single, sentence-case, emoji-free H1s; `keyframe Effects` was renamed
**Time and scrub effects**.

Decisions taken during the pass, recorded so they are not re-litigated:

| Decision                                                                                                       | Rationale                                                           |
| :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| Placeholder links resolved to site-relative slugs derived from page titles (`/named-effects`, `/viewenter`, …) | The published URL scheme is not in the repo; slugs are greppable    |
| Full title normalisation — one sentence-case H1 per page, body at H2                                           | §6.1–§6.3                                                           |
| `container` conditions **removed** from the docs rather than marked "reserved"                                 | §3.9 — silently dropped at runtime; worse to advertise              |
| `interest` / `activate` covered inside **Click and hover** rather than getting their own chapters              | §6.4 / M14 — they are the a11y upgrades of `hover` / `click`        |
| `Installation and entry points` kept as a separate page, deduped against `HTML integration`                    | §6.8 — preserves the page inventory the original audit called sound |
| Full Style A pass — HTML markup + `**Result:**` on every complete example                                      | §7.2                                                                |
| 2.6.0-only API documented with **no version pins**                                                             | See [§3](#3-open-decision--release-gating-of-260-api)               |

Canonical section anchors established in that pass — reuse these when cross-linking:

| Topic                             | Anchor                                                          |
| :-------------------------------- | :-------------------------------------------------------------- |
| FOUC prevention                   | `/html-integration#preventing-fouc`                             |
| `registerEffects` setup           | `/named-effects#registering-named-effects`                      |
| Don't guess preset options        | `/named-effects#do-not-guess-preset-options`                    |
| `composite`                       | `/multi-interaction-compositions#the-composite-option`          |
| Hit-area shift                    | `/source-and-target-resolving#hit-area-shift`                   |
| `overflow: hidden` caveat         | `/viewprogress#overflow-hidden-breaks-the-timeline`             |
| Scroll-preset `range` requirement | `/viewprogress#scroll-presets-require-range`                    |
| Pointer parameter reference       | `/pointermove#trigger-parameters`                               |
| `interest` / `activate`           | `/click-and-hover#accessibility-upgrades-interest-and-activate` |

---

## 1. Deferred cluster A — reduced motion

**Status: the runtime shipped 2026-08-06 (in `@wix/interact` 2.6.0, unreleased). The site doc was
deliberately left untouched, so every reduced-motion statement in it now _under_-promises.**

The 2026-08-13 pass verified this cluster unchanged: reduced-motion mentions 33 → 33,
`forceReducedMotion` 3 → 3, `Interact.reducedMotion` still absent. Only admonition labels, link
targets and table-column layout were touched; no claim was altered.

§1.1 is the **spec for the rewrite**. Nothing needs inventing — §1.2 lists where the wording exists.

### 1.1 What the runtime now does

- **Detection.** `Interact.forceReducedMotion` became `boolean | undefined`, default `undefined` — an
  **override**, not the mechanism. A new read-only `Interact.reducedMotion` resolves
  `forceReducedMotion ?? matchMedia('(prefers-reduced-motion: reduce)').matches` and is what all
  seven `add.ts` call sites now read. `false` forces motion **on**; `undefined` follows the OS.
  Returns `false` where there is no `window`/`matchMedia`, which is also correct for a server render.
- **Enforcement moved into CSS.** `generate()` now emits `@media (prefers-reduced-motion: reduce)`
  rules alongside the base ones, so the decision holds with JS disabled, under SSR, and across a
  mid-session preference change with no JS at all. `getAnimation()` still returns a matching CSS
  animation before consulting the flag; that division of labour is now deliberate and pinned by a test.
- **Per effect kind** — this table is the load-bearing content for the rewrite:

  | Effect kind                                                                         | Under `reduce`                                                                                        | What the visitor sees                 |
  | :---------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------ |
  | Time effect (`viewEnter`, `hover`, `click`, `interest`, `activate`, `animationEnd`) | **Collapsed** — `1ms` duration, `0ms` delay, one iteration                                            | The end state, applied instantly      |
  | Ongoing time effect (`iterations: Infinity`)                                        | **Collapsed too** — the same rule caps iterations at 1                                                | The end state; no perpetual motion    |
  | State effect (`transition` / `transitionProperties`)                                | **Tween dropped, state kept** — `--transition-*` is declared only under `no-preference`               | The state toggles instantly           |
  | `viewProgress`                                                                      | **Cancelled** — `view-timeline` is declared only under `no-preference`, and the handler early-returns | The element's authored **base style** |
  | `pointerMove`                                                                       | **Cancelled** — the handler early-returns, so the pre-generated paused CSS animation is never driven  | The effect's **first keyframe**       |
  | `customEffect`                                                                      | JS only — collapsed to `1ms` with the default `iterations: 1`, dropped when `iterations > 1`          | Its end state, or nothing             |

  The two scrub rows were **verified by generating the CSS**, not inferred: a `pointerMove`
  `keyframeEffect` is emitted paused on the document timeline (`animation-timeline: auto`), so it
  holds frame 0; a `viewProgress` effect loses its timeline entirely, so it applies nothing. Earlier
  drafts asserted "base style" for both — do not repeat that.

- **Nothing is suppressed by name.** Collapsing rather than dropping is deliberate: it preserves the
  `data-interact-enter` handshake, so a collapsed entrance can never be stranded behind its own FOUC
  hiding rule.
- **An author-declared `prefers-reduced-motion` condition wins.** An effect whose own conditions — or
  its interaction's — mention the feature is exempt from the collapse and runs exactly as authored.
  The exemption is **per effect**, so neighbouring effects on the same target need no changes.
- **Except for a scrub, which is cancelled unconditionally.** A `viewProgress` / `pointerMove`
  interaction gated on `reduce` never runs in either path — the CSS gate is forced, and the handler
  early-returns regardless of conditions. So a scrub's reduced-motion alternative **must** use a
  time-based trigger or a plain CSS rule. `@wix/interact-validate` reports this as
  `REDUCE_GATED_SCRUB` (category `REDUCED_MOTION`, severity `warning`).
- **A `viewEnter` entrance's FOUC hiding rule is now gated** on the union of its interaction's and its
  effect's conditions. Previously an interaction-level condition left it unconditional, so
  `conditions: ['desktop']` on an entrance stranded the element on mobile.
- **Reactivity, per path.** CSS-backed time and state effects follow a preference change immediately
  (no JS); `viewProgress` / `pointerMove` interactions rebind and pick it up; `customEffect` and other
  WAAPI-only effects pick it up on their next bind. Setting the **override** suppresses the change
  listener, so it is read-once by design and must be assigned before `Interact.create()`.

### 1.2 Where the correct wording already exists

| Source                                                             | What to lift                                                                                |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `packages/interact/rules/full-lean.md` → `## Reduced motion`       | The canonical treatment: per-kind table, alternative-authoring rules, override + reactivity |
| `packages/interact/docs/guides/conditions-and-media-queries.md`    | The same, in guide prose, with the gate-only-the-alternative example                        |
| `packages/interact/rules/viewprogress.md` → `## Reduced Motion`    | The `viewProgress` chapter's section, near-verbatim                                         |
| `packages/interact/rules/pointermove.md` → `## Reduced Motion`     | The `pointerMove` note, including the first-keyframe fallback                               |
| `packages/interact/docs/api/interact-class.md` → Static Properties | The rows for `forceReducedMotion` and `reducedMotion`                                       |

### 1.3 Required edits, by page

| #   | Page                                      | Edit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :-- | :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | `/understanding-conditions`               | **The canonical treatment.** Rebuild `## Reduced motion` in two parts. **Part 1:** what Interact does automatically — the §1.1 per-effect-kind table verbatim, plus the "collapsed, never suppressed" invariant. **Part 2:** what conditions are still for, narrowed to the only two cases that need one (a specific calmer look; a cancelled scrub whose element is unusable), with a gate-**only**-the-alternative example and the scrub rule. Add an **Overriding the detected preference** subsection for `forceReducedMotion`'s three values and the per-path reactivity table (was M8). Source: `docs/guides/conditions-and-media-queries.md`. |
| A2  | `/html-integration`                       | Static-API table: the `Interact.forceReducedMotion` row still reads `boolean`, default `false`. Replace with "`boolean \| undefined` — **override** the detected motion preference. Default `undefined` = follow `prefers-reduced-motion`. `true` forces reduced motion on, `false` forces motion on. Set before `create()`." Add a row for `Interact.reducedMotion`: "`boolean`, **read-only** — the resolved decision." The table is laid out `Member \| Type \| Default \| Description`.                                                                                                                                                          |
| A3  | `/viewprogress`                           | **Add** a `## Reduced motion` section — the chapter has none. Cover: cancelled rather than collapsed, and why; both enforcement paths, so the JS-disabled case is explicit; the **base-style** fallback (not the effect's start state); the narrow condition under which an alternative is needed — only when the author's own CSS pre-hides the element; the two ways out (drop the pre-hiding, usually right; or add a `viewEnter` alternative); and that a `reduce`-gated `viewProgress` never runs (`REDUCE_GATED_SCRUB`). Do **not** write "a fallback is required" — an embellishing parallax needs nothing.                                   |
| A4  | `/pointermove`                            | Rewrite "`pointerMove` effects are skipped when reduced-motion mode is enabled." → **cancelled** under a preference Interact detects itself. Name the resting state: first keyframe for a `keyframeEffect`, base style for `namedEffect` / `customEffect`, which emit no CSS on `pointerMove`. Require a time-based trigger for any alternative. Currently a `> **Warning:**` just after the intro.                                                                                                                                                                                                                                                  |
| A5  | `/time-and-scrub-effects`                 | "The library skips pointer-driven effects entirely when reduced motion is preferred" → "cancels", plus a link to A1. Also **invert** the accessibility paragraph: a transform-heavy `keyframeEffect` needs **no** condition, because it collapses to its final keyframe; a gated second effect is only for when that instant landing is too abrupt.                                                                                                                                                                                                                                                                                                  |
| A6  | `/named-effects`                          | The `## Accessibility` section gates _both_ sides, which is now redundant. Lead with what Interact does automatically (a high-motion preset is safe unconditionally — it collapses to its end state), keep the preset-swap list, gate **only** the alternative in the example, and call out `*Scroll` presets as the one family needing author attention.                                                                                                                                                                                                                                                                                            |
| A7  | `/what-are-effects`                       | Same treatment as A6 for its reduced-motion block; cut to one paragraph plus a link to A1. Delete any "you can also force this globally: `= matchMedia(…).matches`" line — it is the default now, and it is the line real integrations copy-paste.                                                                                                                                                                                                                                                                                                                                                                                                   |
| A8  | `/click-and-hover`, `/transition-effects` | Both carry "Interact only handles the visual toggle — keeping semantic state such as `aria-expanded` in sync, and respecting `prefers-reduced-motion`, is still your application's responsibility." The `aria-expanded` half stands; **invert** the reduced-motion half — under `reduce` the state still applies and only the tween is dropped.                                                                                                                                                                                                                                                                                                      |
| A9  | `/click-and-hover`                        | "If you pre-generate the CSS, apply the reduced-motion guidance above" → pre-generated CSS now carries the reduced-motion rules itself; that is the point of the change.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| A10 | `/responsive-animation-design`            | "Always provide a motion-safe alternative when the primary interaction depends on animation" → narrow to the case that actually needs one: a scroll- or pointer-driven effect whose element is unusable without it, with a time-based alternative. Its link to `/understanding-conditions#reduced-motion` is already resolved.                                                                                                                                                                                                                                                                                                                       |
| A11 | `/click-and-hover`                        | The heading "Use conditions for input capabilities and motion preferences" names motion preferences but its body no longer covers them. Rename it, or restore the coverage as a link to A1.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

### 1.4 Non-reduced-motion defects inside the deferred section

Left alone to keep the section byte-identical. Fix them as part of A1:

- Its example references `full-reveal` / `simple-fade` effect IDs that are never defined.
- It has no `**Result:**` paragraph, unlike every other complete example on the site.
- Its fence is a bare `{ … }` fragment with no `// inside …` prefix, and contains a missing space in
  `'less-motion':{`.

---

## 2. Deferred cluster B — selectors and element resolution

**Status: blocked on [`element-resolution-plan.md`](element-resolution-plan.md) (2026-07-30).** The
affected pages must not be rewritten until that plan is accepted or rejected, because the correct
wording differs depending on the outcome.

The 2026-08-13 pass verified this cluster unchanged: `listItemSelector` mentions 19 → 19, and every
wrong claim below is still present verbatim. Only formatting was applied — heading case, link
targets, `\+` unescaping, and the `/using-lists` code-in-tables conversion, which reproduced the code
exactly.

### 2.1 The runtime truth

| Claim                                | What the source says                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| :----------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listItemSelector` filters binding   | It is **never** consulted during element resolution. `_getElementsFromData()` (`src/core/add.ts:43-77`) branches only on `listContainer` and `selector`; with `listContainer` alone it returns `Array.from(container.children)` — **all** immediate children. The MutationObserver path processes every added/removed `HTMLElement` child with no filter. It is used in exactly three places: CSS selector generation (`getSelector(…, { addItemFilter: true })`, `src/core/Interact.ts:340`), the `closest()` lookup for **state effects** on lists (`src/handlers/effectHandlers.ts:112`), and the element-identity hash (`src/core/utilities.ts:31-33`). |
| `selector` picks the first match     | `src/core/add.ts:64-72` — `root.querySelectorAll(data.selector)` returns **every** match, and each becomes a source/target.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `listContainer` + `selector` scoping | At bind time, `src/core/add.ts:57-59` runs `container.querySelectorAll(selector)` — a single query scoped to the **container**, matching any depth. The per-child `element.querySelector(selector)` form (`_queryItemElement`, `src/core/add.ts:79-85`) is used **only** for items discovered later by the MutationObserver. Real consequence: `listContainer: '.grid', selector: 'img'` binds to all images in `.grid`, including two inside one card, whereas a dynamically appended card contributes only its first `img`.                                                                                                                               |

### 2.2 Wrong claims still live in the doc, by page

**`/source-and-target-resolving`** — the chapter with the most errors:

1. "`listItemSelector` is an **optional** filter. Use it only when a subset of the container's
   children should participate…", plus the `.active` example config commented
   `// only .active children become sources/targets`.
2. "When `listItemSelector` is omitted, **all** immediate children of the container participate."
3. Recap step 2 is **self-contradictory**: it says `listItemSelector` matches "every **descendant**",
   while the prose above says immediate children.
4. Recap step 3: "use `querySelector` within the root to select first matching descendant"
   (singular) — contradicts the `ElementIdentifier` comment `// refine to descendant(s)` and the
   closing "The resulting element(s)".
5. "Interact runs `querySelector` inside each direct child of the container."
6. Recap step 2 treats `listItemSelector` and `selector` as mutually exclusive, but the `.active`
   example and the `listContainer` prose imply they combine.
7. "Items added or removed later are tracked automatically" — unqualified.
8. Cosmetic: the `ElementIdentifier` snippet orders fields `key, selector, listContainer,
listItemSelector`; `src/types/config.ts` declares `key, listContainer, listItemSelector, selector`.

**`/what-is-a-list`**:

9. `listItemSelector` described as a general child filter (`.container > .listItemSelector`,
   "provide it to include only those children") — contradicts `/using-lists`, which correctly scopes
   it to CSS generation for state effects.
10. `listContainer` + `selector` described as "a child inside each item" (per-item scoping) —
    contradicts `/using-lists`'s container scoping.
11. Key points: "`selector` targets a single child within a root" — singular vs `querySelectorAll`.
12. "`listContainer` resolves within the keyed `<interact-element>`" — entry-point-specific;
    `/using-lists` correctly says "relative to the interaction's root element".
13. **The comparison table has lost its ✓/✗ markers.** Five cells begin with a bare leading space, so
    both "Targets multiple elements?" and "A managed list?" read as unanswered, and the `(filtered)`
    cell answers nothing. Restore the markers, or convert the two yes/no columns to explicit
    "Yes/No" text, which survives copy-paste better.

### 2.3 The fix, once the plan lands

- Make all three pages state **identical** resolution rules. `/using-lists`'s three-property table is
  the most accurate description in the document — promote its wording:
  _"Narrows which direct children count as list items when Interact generates CSS (for `transition` /
  state effects). Use it when the container also holds elements that are not items."_
- Add an explicit warning: **`listItemSelector` does not restrict which children receive JS-driven
  triggers or animations — all immediate children of `listContainer` are bound.**
- Delete or rewrite the `.active` example, which teaches behaviour the runtime does not implement.
- State the container-scoped `querySelectorAll` rule as the primary behaviour. Either document the
  per-item difference for MutationObserver-added children, or (preferred) file it as a runtime
  inconsistency ([§4](#4-upstream-items-still-open) A10) and document only the stable rule.
- Note the practical consequence of `querySelectorAll`: `selector: '.card'` attaches the trigger to
  _every_ `.card` in the root, not just the first.
- Also fix while in the area: the two same-page links on `/source-and-target-resolving` are written as
  full slug + anchor (`/source-and-target-resolving#…`); switch to bare `#anchor` if the site builder
  prefers that. And that page's four pre-existing examples were left without `### Example:` headings,
  because adding headings would have changed the anchor set.

---

## 3. Open decision — release gating of 2.6.0 API

**The original audit was wrong on this point.** It claimed dual-casing (PR #281) and the plugin API
(PR #275) "shipped in `@wix/interact` 2.5.5". They did not. `CHANGELOG.md` places both under
**`@wix/interact [2.6.0] — unreleased`**; the published version is **2.5.6**.

The site doc now documents **master, with no version pins** (an explicit decision — see §0). One
consequence needs resolving before publishing:

| Surface                                        | On master (2.6.0)                                     | On published 2.5.6                                                             |
| :--------------------------------------------- | :---------------------------------------------------- | :----------------------------------------------------------------------------- |
| `generate(config, { useFirstChild: … })`       | Options bag, normalised by `normalizeGenerateOptions` | Second arg is a plain **boolean**; an object is truthy → `useFirstChild: true` |
| `Interact.use()` / `$<name>` / `/plugins` page | Public API                                            | Does not exist                                                                 |
| "either casing works" notes                    | True                                                  | camelCase state properties are written verbatim into CSS and silently dropped  |

The options-bag form is documented on `/html-integration`, `/named-effects`, `/using-lists` and
`/the-final-result`. **Options:** ship the site alongside the 2.6.0 release (no doc change needed);
add "Requires `@wix/interact` 2.6.0" notes to those surfaces; or revert to the legacy positional
boolean until release.

---

## 4. Upstream items still open

Defects outside the site doc. Original A1, A3, A4, A6, A8 and A12 are now **fixed** — A3/A4/A6 in the
2026-08-13 rules pass (see [§5.1](#51-rules-files--fixed-on-2026-08-13)).

| #   | File                                           | Issue                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :-- | :--------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A2  | `interact-validate/src/semantic/fouc.ts`       | **`hitArea` default is inconsistent between runtime and validator.** The runtime default is effectively `'root'` (`src/handlers/pointerMove.ts:39` — an undefined `hitArea` yields an undefined root, which falls through to kuliso's viewport default). `checkHitAreaShift` (`:55-57`) instead treats an omitted `hitArea` as `'self'` and therefore at risk. The rules files were corrected to document `'root'` on 2026-08-13 and now note the validator's stricter assumption. **Decide which side moves.** |
| A5  | `rules/full-lean.md:692`, `:202`, `:356`       | Source resolution claims `listItemSelector` filters which children become sources. Wrong (§2.1). Three sites, same framing. **Deliberately not fixed** — part of deferred cluster B; see [`element-resolution-plan.md`](element-resolution-plan.md).                                                                                                                                                                                                                                                            |
| A7  | `packages/interact/llms.txt:7` (and root)      | "Five trigger types: hover, click, viewEnter, viewProgress, pointerMove" — there are eight (`animationEnd`, `activate`, `interest` missing). Both files are **generated and gitignored**, so the fix belongs in the generator input, `scripts/generate-llms.mjs`. The generated index also does not list `rules/plugins.md`.                                                                                                                                                                                    |
| A9  | `interact-validate/src/semantic/fouc.ts:59-64` | `HIT_AREA_SHIFT` only inspects `transform` **strings** against `/(translate\|scale\|matrix)/`. Escapes: bare `scale` / `translate` / `rotate` keyframe properties (the individual CSS transform properties), `transform: 'rotate(…)'` (not in the pattern), box metrics, and anything via `namedEffect` / `customEffect`.                                                                                                                                                                                       |
| A10 | `src/core/add.ts`                              | `listContainer` + `selector` resolves differently at initial bind (`container.querySelectorAll`) than for MutationObserver-added items (`child.querySelector`). Likely a bug; documenting it as-is would be documenting an inconsistency. Covered in depth by [`element-resolution-plan.md`](element-resolution-plan.md).                                                                                                                                                                                       |
| A11 | `src/types/config.ts:6`                        | `Condition.type` accepts `'container'` but nothing implements it — such conditions are silently dropped. Re-verified 2026-08-13: `getFullPredicateByType` is the only possible reader and all four call sites (`core/css.ts:151, 230, 503`, `core/cssUtils.ts:179`) pass `'media'`; `grep '@container'` over `packages/interact/src` returns zero hits. The docs now omit it. Either implement `@container` emission or remove the type.                                                                        |

---

## 5. Findings raised during remediation

All verified against source during the 2026-08-13 pass. None is in the site doc.

### 5.1 Rules files — fixed on 2026-08-13

| File                                | Was                                                                                                           | Now                                                                                                                                                                                                                                      |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `full-lean.md` transitionProperties | Per-property entries take precedence when both are set                                                        | `transition` wins; `transitionProperties` is ignored entirely (`src/utils.ts:67`, `:79`)                                                                                                                                                 |
| `full-lean.md` mouse presets        | 9 entries                                                                                                     | 11 usable, plus notes on `CustomMouse` (a factory taking a `customEffect`, not usable as a `namedEffect`) and the experimental `Bg*` background-scroll presets                                                                           |
| `full-lean.md` `hitArea`            | Default `'self'`                                                                                              | Default `'root'`; see A2 for the validator coupling                                                                                                                                                                                      |
| `full-lean.md` viewEnter params     | `useSafeViewEnter` absent everywhere in the rules                                                             | Documented, including that it needs an **explicit** `threshold` (the check reads the authored value, not the `0.2` default) and that the fallback observer discards a configured `inset`                                                 |
| `full-lean.md` scrub options        | `centeredToTarget` / `transition*` unscoped                                                                   | Scoped per payload                                                                                                                                                                                                                       |
| `pointermove.md` Rules 1–3          | `centeredToTarget` / `transitionDuration` / `transitionEasing` offered for `keyframeEffect` and `namedEffect` | `transition*` forwarded **only** for a `customEffect` payload (`motion/src/motion.ts:161-164`); `centeredToTarget` needs a resolved target, which a `keyframeEffect` scrub scene lacks (`target: undefined`, kuliso `controller.js:101`) |
| `viewprogress.md`                   | `entry-crossing` / `exit-crossing` described leading-edge-to-opposite-side                                    | Aligned to `full-lean.md`: leading edge to trailing edge. `contain` also made precise (fully contained **by, or fully containing**, the scrollport)                                                                                      |
| `integration.md:354`                | `allowA11yTriggers` default `false`                                                                           | `true` (`src/core/Interact.ts:47`)                                                                                                                                                                                                       |

### 5.2 Still open

| #   | Where                                                         | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| :-- | :------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | `packages/interact/src/types/effects.ts:54`                   | **`transitionDelay` has no runtime consumer.** It exists in the type, in `motion/src/types.ts:174` and in the validator schema, but nothing in `packages/motion/src`, `packages/motion-presets/src` or kuliso reads it — only `transitionDuration` and `transitionEasing` are consumed. Deliberately left alone. Either implement it or remove it from the public type.                                                                                                                                                                                                                                                                                                                                                         |
| R2  | `packages/motion/src/utils.ts:269-279`                        | **`transitionEasing` is inert for four of its five values.** `getJsEasing` looks the value up in `jsEasings`, which contains no `hardBackOut`, `easeOut`, `elastic` or `bounce`; all four fall through to `jsEasings.linear`. Either populate `jsEasings` or narrow the public type.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| R3  | `packages/interact/src/utils.ts:36-46` vs the handlers        | **Selector conditions substitute `&` on only one of two paths.** The CSS path calls `applySelectorCondition()` (`core/cssUtils.ts:137-140`). The runtime path gates with `element.matches(selectorCondition)` on the **raw** string (`handlers/effectHandlers.ts:38`, `:108`; `handlers/viewEnter.ts:199`; `handlers/animationEnd.ts:40`), so the browser is asked to evaluate `matches(':is(.theme-dark &)')`. `test/sequences.spec.ts:673-695` asserts the unsubstituted string is what arrives. Needs a real-browser check: if `&` outside a nested rule is not treated as `:scope`, this throws a `SyntaxError` at trigger time. The site doc documents only the CSS composition rule and makes no claim about `matches()`. |
| R4  | `packages/interact/docs/guides/plugins.md:188`                | Says plugin styles are "emitted verbatim and unconditionally" and that media scoping must be built by the generator. Source disagrees: `collectFieldPluginStyles` stamps the interaction's/effect's media predicate onto every returned rule (`core/css.ts:201`, `:230`, `:503`). Media `conditions` **are** applied; selector-type conditions are not.                                                                                                                                                                                                                                                                                                                                                                         |
| R5  | `packages/interact/docs/guides/getting-started.md`            | Ships the `scale: 2`-on-the-hovered-element hit-area anti-pattern **twice**, plus `effects: {}`. Contradicts `rules/hover.md`, which marks it CRITICAL. The site doc's tutorial was fixed; this guide was not.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| R6  | `packages/interact/docs/integration/README.md`                | Links to `vanilla-js.md`, `other-frameworks.md`, `migration.md`, `build-tools.md` and `testing.md`, none of which exist.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| R7  | `packages/interact/docs/guides/effects-and-animations.md:271` | Documents a third `params` argument on the `customEffect` callback. The real signature is `(element: Element, progress: any) => void` (`src/types/effects.ts:28`, `:109`; `motion/src/CustomAnimation.ts:30`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| R8  | `packages/motion-presets/src/library/entrance/`               | `FloatIn` hardcodes `easing: 'sineInOut'` **after** spreading options, so a caller-supplied `easing` is silently discarded. Other entrance presets honour `options.easing`. Either respect the option or document the exception.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| R9  | `packages/motion-presets/src/library/scroll/`                 | `ParallaxScroll`'s implementation never reads its `range` option, yet `@wix/interact-validate` requires `range` on every `*Scroll` preset under `viewProgress`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| R10 | `packages/interact/src/handlers/`                             | The `activate` a11y upgrade does **not** set `tabIndex` (only `interest` does, on `focusin`). A non-focusable `<div>` with `trigger: 'click'` therefore stays keyboard-unreachable even with `allowA11yTriggers: true`. Possible real accessibility gap.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| R11 | `packages/interact/src/core/resolvers.ts:94`                  | `resolveEffectForCSS` returns `{ initial, ...rest }` for a `customEffect`, so it may emit an initial-state rule even though it emits no animation CSS. What `generate()` ultimately outputs was not pinned down; the site doc makes no claim about SSR/FOUC for custom effects.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| R12 | `packages/interact/src/handlers/viewEnter.ts:11-15, 125-129`  | `useSafeViewEnter` reads the **authored** `threshold`, not the resolved `0.2` default, so the flag alone is a no-op; and the fallback observer's fixed config discards a configured `inset`. Now documented in the rules and the site doc, but both read as bugs rather than intent.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| R13 | `rules/viewprogress.md:152-233` vs `/viewprogress`            | The rules treat `generate()` pre-rendering as the preferred path for static sites; the `/viewprogress` chapter never mentions pre-generating scroll-driven CSS. Likely a real content gap.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| R14 | `packages/motion/src/easings.ts:218-248`                      | Named-easing catalogue: the original audit listed 24 (`sine`/`quad`/`cubic`/`quart`/`quint`/`expo`/`circ`/`back` × `In`/`Out`/`InOut`). Source has **five more** camelCase aliases for the CSS keywords: `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`. The site doc now documents all 29.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| R15 | `packages/motion-presets/src/library/ongoing/`                | `DVD` exists in the directory but is not exported (marked not-production-ready). Confirm that is intentional.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| R16 | `packages/interact` types                                     | `import * as presets; registerEffects(presets)` — the idiom shipped in `README.md:73` and `rules/full-lean.md:128` — does not typecheck. `typeof import('@wix/motion-presets')` is not assignable to `Record<string, EffectModule>`, because the mouse presets are scrub factories returning a function rather than `AnimationData[]`. A library typing gap, not a docs bug; the documented idiom was kept.                                                                                                                                                                                                                                                                                                                     |

---

## 6. Verification baseline

Source of truth for claims, so a future pass need not re-derive them.

| Claim group                                                              | Source of truth                                                                                                                                                                                                                           |
| :----------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger list (8)                                                         | `src/types/triggers.ts:7-15`                                                                                                                                                                                                              |
| Default `triggerType` per trigger                                        | `src/core/resolvers.ts:19-26` (`viewEnter`/`animationEnd` → `once`; `hover`/`click`/`activate`/`interest` → `alternate`)                                                                                                                  |
| hover/click playback semantics                                           | `src/handlers/effectHandlers.ts:34-88`                                                                                                                                                                                                    |
| `stateAction` semantics incl. `clear`                                    | `src/core/InteractionController.ts:107-142, 144-156`, `src/handlers/effectHandlers.ts:91-130`                                                                                                                                             |
| a11y upgrade + keyboard handling                                         | `src/handlers/index.ts:9-29`, `src/handlers/constants.ts`, `src/handlers/eventTrigger.ts:18-46, 172-193`                                                                                                                                  |
| viewEnter playback, threshold `0.2`, inset, `useSafeViewEnter`           | `src/handlers/viewEnter.ts:11-51, 91-153, 198-291`                                                                                                                                                                                        |
| FOUC: `data-interact-enter`, `DEFAULT_INITIAL` (+ `!important`)          | `src/core/css.ts:30-36, 286-303`, `src/core/utilities.ts:19-28`, `src/handlers/viewEnter.ts:218, 228`, `src/handlers/effectHandlers.ts:60-82`. Note `visibility: hidden` is **not** `!important` — only the four transform properties are |
| `generate(config, options?: boolean \| GenerateOptions)`                 | `src/core/css.ts:633`, `normalizeGenerateOptions` at `:575`, `GenerateOptions` at `src/types/css.ts:7-16` (2.6.0)                                                                                                                         |
| CSS property-name normalisation (both casings)                           | `src/utils.ts:63-73`, `src/core/cssUtils.ts:16-30`, `packages/motion/src/utils.ts:27-35, 70-97` — suites `test/propertyCasing.spec.ts`, `packages/motion/test/utils.spec.ts` (2.6.0)                                                      |
| Plugin API                                                               | `src/core/Interact.ts:255`, `src/types/plugins.ts`, `src/core/add.ts` (`_applyPlugins`, pre-resolution), `src/core/css.ts:191`, `packages/splittext/src/plugin/index.ts` (2.6.0)                                                          |
| Element resolution                                                       | `src/core/add.ts:43-105`, `src/core/Interact.ts:331-353`                                                                                                                                                                                  |
| `listItemSelector` usage sites (exhaustive)                              | `src/core/Interact.ts:340`, `src/handlers/effectHandlers.ts:112`, `src/core/utilities.ts:31-33`                                                                                                                                           |
| Reduced motion (post-2026-08-06 contract)                                | See [§1.1](#11-what-the-runtime-now-does); `src/core/Interact.ts`, the seven `src/core/add.ts` call sites, `src/handlers/{pointerMove,viewProgress,viewEnter,effectHandlers}.ts`, `src/utils.ts`, `packages/motion/src/motion.ts`         |
| Conditions: media merge, selector `:is()` + `&`, container unimplemented | `src/utils.ts:36-46, 153-207`, `src/core/css.ts:151, 230, 503`, `src/core/cssUtils.ts:179`                                                                                                                                                |
| Validator severities                                                     | `interact-validate/src/structural.ts:58, 71-76, 83-88`, `src/errors.ts:60, 80`, `src/schema/interactions.ts:231-244, 258-265, 287-330`                                                                                                    |
| Cascade / coexistence mechanics                                          | `src/core/css.ts:429-513`                                                                                                                                                                                                                 |
| Sequence resolution, defaults, trigger dispatch                          | `src/core/resolvers.ts:19-26, 103-165`, `src/utils.ts:20-34`, `src/core/add.ts:376-399, 441-463`, `packages/motion/src/Sequence.ts:52-102, 165-172`                                                                                       |
| Sequence `effects` are `TimeEffect` only, `.min(1)`                      | `interact-validate/src/schema/sequences.ts:18`                                                                                                                                                                                            |
| Preset inventory (verified counts)                                       | `packages/motion-presets/src/library/` — entrance 19, scroll 19, ongoing 13, mouse 12 (incl. `CustomMouse`), backgroundScroll 12 (experimental)                                                                                           |
| Pointer scene options per payload                                        | `packages/motion/src/motion.ts:122-166`, kuliso `controller.js:101`                                                                                                                                                                       |
| State-effect easing defaults                                             | `transition` → `ease` (`src/utils.ts:90, 96`); a `transitionProperties` entry → `linear`, because `getEasing(undefined)` returns a truthy `cssEasings.linear` so the `\|\| 'ease'` fallback never fires (`:109`)                          |
