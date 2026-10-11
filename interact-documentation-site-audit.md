# Audit — `interact-documentation-site.md` — remaining work

**Audited file:** `interact-documentation-site.md`
**Audited against:** `packages/interact/src/**`, `packages/interact/rules/*.md`, `packages/interact/README.md`, `packages/interact-validate/src/**`, `packages/motion-presets/src/**`, `packages/motion/src/**`, `packages/splittext/src/plugin/**`
**Original audit:** 2026-07-26 · **Re-verified:** 2026-08-04 · **Remediation passes:** 2026-08-13

> **This document has been reduced to the two deliberately deferred clusters.** Everything else the
> audit raised — the blocking issues, the technical errors, the authoring residue, the structural
> and style defects, and all upstream defects outside the site doc — has been closed.

Line numbers from the original audit no longer apply: the file grew from 4,729 to ~6,770 lines.
**Locate every item below by searching for the quoted text.**

Canonical section anchors established during remediation — reuse these when cross-linking:

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

## Table of contents

1. [Deferred cluster A — reduced motion](#1-deferred-cluster-a--reduced-motion)
2. [Deferred cluster B — selectors and element resolution](#2-deferred-cluster-b--selectors-and-element-resolution)
3. [Open decision — release gating of 2.6.0 API](#3-open-decision--release-gating-of-260-api)

---

## 1. Deferred cluster A — reduced motion

**Status: the runtime shipped 2026-08-06 (in `@wix/interact` 2.6.0, unreleased). The site doc was
deliberately left untouched, so every reduced-motion statement in it now _under_-promises.**

Verified unchanged: reduced-motion mentions 33 → 33, `forceReducedMotion` 3 → 3,
`Interact.reducedMotion` still absent. Only admonition labels, link targets and table-column layout
were touched; no claim was altered.

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

Verified unchanged: `listItemSelector` mentions 19 → 19, and every wrong claim below is still present
verbatim. Only formatting was applied — heading case, link targets, `\+` unescaping, and the
`/using-lists` code-in-tables conversion, which reproduced the code exactly.

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
  inconsistency and document only the stable rule.
- Note the practical consequence of `querySelectorAll`: `selector: '.card'` attaches the trigger to
  _every_ `.card` in the root, not just the first.
- Also fix while in the area: the two same-page links on `/source-and-target-resolving` are written as
  full slug + anchor (`/source-and-target-resolving#…`); switch to bare `#anchor` if the site builder
  prefers that. And that page's four pre-existing examples were left without `### Example:` headings,
  because adding headings would have changed the anchor set.

### 2.4 Blocked upstream items in this cluster

These two are deliberately **not** fixed — they are the runtime/rules side of the same decision:

| #   | File                                     | Issue                                                                                                                                                                                                                               |
| :-- | :--------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | `rules/full-lean.md:692`, `:202`, `:356` | Source resolution claims `listItemSelector` filters which children become sources. Wrong (§2.1). Three sites, same framing.                                                                                                         |
| B2  | `src/core/add.ts`                        | `listContainer` + `selector` resolves differently at initial bind (`container.querySelectorAll`) than for MutationObserver-added items (`child.querySelector`). Likely a bug; documenting it as-is would document an inconsistency. |

---

## 3. Open decision — release gating of 2.6.0 API

**The original audit was wrong on this point.** It claimed dual-casing (PR #281) and the plugin API
(PR #275) "shipped in `@wix/interact` 2.5.5". They did not. `CHANGELOG.md` places both under
**`@wix/interact [2.6.0] — unreleased`**; the published version is **2.5.6**.

The site doc now documents **master, with no version pins** (an explicit decision). One consequence
needs resolving before publishing:

| Surface                                        | On master (2.6.0)                                     | On published 2.5.6                                                             |
| :--------------------------------------------- | :---------------------------------------------------- | :----------------------------------------------------------------------------- |
| `generate(config, { useFirstChild: … })`       | Options bag, normalised by `normalizeGenerateOptions` | Second arg is a plain **boolean**; an object is truthy → `useFirstChild: true` |
| `Interact.use()` / `$<name>` / `/plugins` page | Public API                                            | Does not exist                                                                 |
| "either casing works" notes                    | True                                                  | camelCase state properties are written verbatim into CSS and silently dropped  |

The options-bag form is documented on `/html-integration`, `/named-effects`, `/using-lists` and
`/the-final-result`. **Options:** ship the site alongside the 2.6.0 release (no doc change needed);
add "Requires `@wix/interact` 2.6.0" notes to those surfaces; or revert to the legacy positional
boolean until release.
