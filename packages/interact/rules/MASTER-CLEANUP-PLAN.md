# Master Cleanup Plan: `@wix/interact` Rule Files

Synthesized from three independent audits. Filtered through current best practices for documentation consumed by LLMs.

---

## Guiding Principles (Why This Matters)

These rules are the primary context fed to AI agents generating `@wix/interact` code. Every wasted token, every duplicated section, every drift between files directly degrades output quality. The standards we apply:

1. **Token efficiency over completeness.** LLMs have broad web animation knowledge. Rules should focus exclusively on `@wix/interact`-specific contracts, constraints, and non-obvious patterns — not general CSS or animation education.
2. **Single source of truth, always.** Duplicated content drifts. When it drifts, models get contradictory instructions and hedge or hallucinate.
3. **Each file must be usable standalone.** The MCP loads one file at a time based on topic. A model fetching `"click"` gets only `click.md` — it will not automatically also receive `full-lean.md`. Each trigger file must therefore contain all `@wix/interact`-specific constraints the model needs for that trigger, including brief inline summaries of schema concepts it depends on.
4. **Correctness over breadth.** A contradiction is worse than a gap. Fix all confirmed conflicts before any structural changes.
5. **Describe when/how, not what/why at length.** A rule like `"alternate plays forward on enter, reverses on leave"` is worth keeping. A paragraph re-explaining what `IntersectionObserver` does is not.
6. **Delete, don't redirect.** Generic web animation advice should be deleted entirely — not moved to a shared file or linked. The model already knows it. Cross-file links are useful for human navigation only; they are not a content delivery mechanism for the MCP.

---

## Current State

- 8 files, ~8,000+ lines
- ~30–40% estimated duplication
- 5 confirmed typos/errors
- 2 confirmed correctness contradictions
- 1 confirmed schema inconsistency between files (`listItemSelector` vs `selector`)

---

## Phase 1 — Fix Correctness Issues (do first, no structural work yet)

These are the highest-risk problems. A model following a contradictory rule produces wrong code.

### 1.1 Resolve `keyframeEffect` + `pointerMove` conflict

**Conflict:**

- `full-lean.md` lines 366 and 403: "do NOT use `keyframeEffect` with `pointerMove` because pointer progress is two-dimensional"
- `full-lean.md` line 173: documents `axis?: 'x' | 'y'` param that collapses 2D progress to one axis for keyframes
- `pointermove.md`: Rules 10–11 document `keyframeEffect` + `axis` as a valid first-class pattern

**Resolution:** `full-lean.md` lines 366 and 403 are incomplete. The `axis` parameter exists precisely to make single-axis `keyframeEffect` valid. Update both lines to:

> Avoid `keyframeEffect` with `pointerMove` unless using `params: { axis: 'x' | 'y' }` to map a single pointer axis to linear 0–1 progress.

### 1.2 Resolve `listItemSelector` vs `selector` inconsistency

**Conflict:**

- `full-lean.md` uses `listItemSelector` as the field name
- `integration.md` uses `selector` for the same concept

**Resolution:** Check the TypeScript type definition. Standardize both files to the correct field name. One of these is currently giving models the wrong API.

### 1.3 Align FOUC constraints

**Conflict:**

- `full-lean.md` correctly restricts `data-interact-initial="true"` to: `viewEnter` trigger + `type: 'once'` + source element = target element
- `integration.md` gives the same code example but omits the constraints

**Resolution:** Add the full constraints explicitly to `integration.md`'s FOUC section.

### 1.4 Fix `pointermove.md` undefined reference

`pointermove.md` has an example referencing `indicator-effect` which is not defined in the config shown. Fix the example to be self-contained.

### 1.5 Fix all confirmed typos

| File              | Line | Fix                                               |
| ----------------- | ---- | ------------------------------------------------- |
| `viewenter.md`    | 946  | `Guildelines` → `Guidelines`                      |
| `viewenter.md`    | 980  | `HUge` → `Huge`                                   |
| `viewprogress.md` | 43   | `effec` → `effect`                                |
| `hover.md`        | 515  | `same ass` → `same as`                            |
| `integration.md`  | 195  | `(Pre-built effect library)>` → remove stray `>`  |
| `scroll-list.md`  | 272  | `selector: ' .hero-image'` → remove leading space |

---

## Phase 2 — Establish Single Source of Truth (via deletion, not links)

### 2.1 Define canonical ownership

Because the MCP loads one file at a time, the "canonical" column means "most complete definition lives here." The "inline mention needed" column means trigger docs that depend on this concept must include a brief self-contained summary — not a link, not a full re-explanation.

| Content                                                                 | Canonical file                     | Action in other files                                | Inline mention needed in                                                                                                                      |
| ----------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Full type/schema spec (`InteractConfig`, triggers, effects, conditions) | `full-lean.md`                     | Delete duplicated schema prose from `integration.md` | All trigger docs: keep brief summaries of params they use                                                                                     |
| Developer setup (install, web, react, CDN, `Interact.create`)           | `integration.md`                   | —                                                    | —                                                                                                                                             |
| FOUC / `generate(config)`                                               | `full-lean.md` + `viewenter.md`    | Delete full code block from `integration.md` only    | `viewenter.md`: full working example with constraints — it is the most likely file fetched for entrance animations and must be self-contained |
| `StateParams.method` (`add`/`remove`/`toggle`/`clear`)                  | `full-lean.md`                     | —                                                    | `click.md`: inline comment on TransitionEffect rule only (`hover.md` has no TransitionEffect rule so no mention needed there)                 |
| Target cascade resolution                                               | `full-lean.md`                     | —                                                    | Any trigger doc showing cross-targeting examples                                                                                              |
| `Progress` type for `customEffect` with `pointerMove`                   | `pointermove.md`                   | Delete duplicate definition from `full-lean.md`      | —                                                                                                                                             |
| `fill: 'both'` for `viewProgress`                                       | `full-lean.md`                     | —                                                    | `viewprogress.md`: keep inline (model fetching viewprogress won't have full-lean)                                                             |
| `registerEffects`                                                       | currently only in `integration.md` | Add to `full-lean.md`                                | —                                                                                                                                             |
| Generic perf/UX/a11y advice                                             | nowhere — delete entirely          | Remove from all trigger docs                         | —                                                                                                                                             |

### 2.2 Reduce `integration.md`

`integration.md` is a developer-facing onboarding guide — not a schema reference. Effect type syntax belongs in `full-lean.md`; the 3 end-to-end examples at the bottom of `integration.md` already demonstrate effect types in context, which is more useful for onboarding than standalone snippets.

- **Keep:** install steps, web/react setup snippets, `Interact.create` usage, HTML/JSX element wrappers, `registerEffects` setup, trigger overview table, 3 working examples (hover, viewEnter, click), FOUC rules
- **Delete:** full effect type taxonomy (`keyframeEffect`, `TransitionEffect`, scroll/mouse effect snippets) — covered by `full-lean.md` and shown contextually in the examples

### 2.3 Strip generic best-practices content from all trigger docs

Do **not** create a shared `best-practices.md`. Instead, apply this filter to every trigger doc's Best Practices section:

**Delete (model already knows this):**

- "Use `transform`, `opacity`, `filter` for hardware acceleration"
- "Avoid animating layout properties"
- "`will-change` for complex animations"
- "Keep animations subtle"
- "Ensure content remains readable"
- "Progressive enhancement"
- Generic "Respect `prefers-reduced-motion`" without `@wix/interact`-specific guidance

**Keep (interact-specific, non-obvious):**

- `@wix/interact` conditions API for `prefers-reduced-motion`: how to wire it via `conditions` field. **Clarification:** condition IDs are user-defined strings — examples must always show the full `conditions` config map (with `type` and `predicate`) alongside the interaction that references them, not just the ID strings in isolation
- Trigger-specific timing constraints (e.g. click: 100–500ms, hover: 100–400ms)
- Trigger-specific gotchas (e.g. viewEnter: don't animate source and target as the same element with `repeat` type)
- `pointermove`: cache DOM queries outside `customEffect` callbacks
- `viewprogress`: stacking contexts freeze ViewTimeline — this belongs in `full-lean.md` general guidelines (already there) and should be removed from `viewprogress.md` best practices

**Estimated line savings: ~250 lines across trigger docs.**

---

## Phase 3 — Restructure `viewprogress.md`

This is the single largest structural problem. 9 rules are a 3×3 matrix with near-identical patterns:

|                     | `namedEffect` | `keyframeEffect` | `customEffect` |
| ------------------- | ------------- | ---------------- | -------------- |
| Parallax/Continuous | Rule 1        | Rule 4           | Rule 7         |
| Entry               | Rule 2        | Rule 5           | Rule 8         |
| Exit                | Rule 3        | Rule 6           | Rule 9         |

Every rule repeats the same config skeleton. Variable lists from Rule 5 onward explicitly say "Other variables same as Rule 1" — a direct admission of duplication.

**Why tables outperform the 9-rule format for LLM consumption:**

The 9-rule matrix looks comprehensive to humans but is inefficient for models. Once a model has seen the config pattern once, repeating it 8 more times with minor substitutions adds no information — it just consumes context tokens. The replacement structure (1 template + 2 lookup tables + 4 examples) performs better because:

- **Decision tables are scannable.** A model resolving "I need an entry animation" can map scenario → effect type → range names in one pass through the table, rather than pattern-matching a natural-language rule description to its task.
- **Fewer examples, correctly chosen, generalize better.** 4 curated examples (one per effect type + one non-obvious multi-range pattern) teach the model to compose, rather than encouraging copy-paste from the closest-matching rule.
- **Token efficiency directly affects output quality.** Fewer tokens spent on redundant patterns means more context budget for the actual user task.

The trade-off: the old format had a safer floor for weaker models that benefit from rote examples. The new format has a higher ceiling for capable models (Claude, GPT-4, Gemini) that generalize well from clean, structured docs — which is the target audience for this library.

### Target structure for `viewprogress.md`

**Section 1: Core Concept** (~5 lines)
One sentence on what `viewProgress` does (scroll-driven via `ViewTimeline`). No animation education.

**Section 2: Config Template** (1 canonical pattern block)
Single pattern showing all `viewProgress`-relevant fields with placeholders.

**Section 3: Effect Type Selection** (table)

| Scenario                   | Effect type      | Notes                            |
| -------------------------- | ---------------- | -------------------------------- | ----- | -------------------- |
| Use a scroll preset        | `namedEffect`    | Preferred; requires `range: 'in' | 'out' | 'continuous'` option |
| Custom CSS animation       | `keyframeEffect` | Full keyframe control            |
| DOM/canvas/dynamic content | `customEffect`   | Last resort; keep callback lean  |

**Section 4: Range Reference** (table)

| Intent                    | `rangeStart.name` | `rangeEnd.name` | Typical offsets |
| ------------------------- | ----------------- | --------------- | --------------- |
| Element entering viewport | `entry`           | `entry`         | 0–60%           |
| Element exiting viewport  | `exit`            | `exit`          | 0–60%           |
| Full element traversal    | `cover`           | `cover`         | 0–100%          |
| While fully in viewport   | `contain`         | `contain`       | 0–100%          |

Include the offset semantics note (positive = forward along scroll axis) — once, here only.

**Section 5: Named Scroll Effects Reference** (condensed list)
The scroll preset names currently buried in Rule 1 variables — one list, not repeated across rules.

**Section 2 note: Config Template placeholders**
Do not include a `direction` placeholder. `direction` is a preset-specific option (not a standard field), its valid values differ per preset, and listing generic values would be incomplete and misleading. The template uses `[NAMED_EFFECT]` with a note: only use preset-specific options you have documentation for; omit and rely on defaults otherwise.

**Section 6: Examples** (4 total)

- `namedEffect` parallax
- `keyframeEffect` custom entrance
- `customEffect` scroll counter
- **Multi-range (entry + exit on the same element)** — non-obvious pattern requiring two effects with the same `key` but different range scopes. Without a dedicated example, models can infer it from the tables but may get the fill/easing direction wrong. The cost (~40 lines) is worth the reliability gain.

**Section 7: Advanced Patterns** — keep existing section as-is (genuinely unique content)

**Section 8: Best Practices** — interact-specific delta only (per Phase 2.3 filter above)

**Estimated line savings: ~~600 lines (~~55% reduction of the file).**

---

## Phase 4 — Reduce `scroll-list.md`

This file's genuine value is its list-specific patterns. Everything else repeats `viewprogress.md`.

### Keep (unique to lists)

- Sticky container/item/content hierarchy explanation
- `listContainer` + `listItemSelector` (or `selector`) setup and rules
- Why `contain` range fits sticky container animations specifically
- Stagger pattern using shared `effectId` in the effects registry
- `customEffect` pattern for per-item dynamic content
- Responsive list animations section with a full `conditions` config map example (same pattern as other trigger docs — condition IDs are user-defined, must always be shown alongside their `type`/`predicate` definition)

### Delete (generic, already in `viewprogress.md` or model already knows it)

- Range name semantics — already in `viewprogress.md` after Phase 3
- Effect type taxonomy — already in `viewprogress.md` after Phase 3
- Generic `fill: 'both'` explanation
- Generic performance/UX/a11y best practices (per Phase 2.3 filter)

**Estimated line savings: ~200 lines.**

---

## Phase 5 — Trigger Doc Standardization

Minor but important for model consistency. Models that see consistent structure learn to pattern-match faster across files.

### Issues to fix

- `hover.md` title: "Hover Trigger Rules" — missing `for @wix/interact` (all others have it)
- `hover.md` has no Accessibility section (the only trigger doc missing it entirely) — add the interact-specific `conditions`-based reduced motion guidance
- Variable placeholder naming is inconsistent: `[SOURCE_KEY]` (viewprogress, pointermove) vs `[SOURCE_IDENTIFIER]` (click, hover) for the same concept
- `hover.md` Rules 2 and 3 overlap heavily (both are `alternate` pattern, one with `namedEffect`, one with `keyframeEffect`) — collapse into one rule with two examples
- `click.md` shows only `method: 'toggle'` for `TransitionEffect` — add brief mention that `add`, `remove`, `clear` also exist (already defined in `full-lean.md`, but models reading only the trigger doc will miss it)
- `hover.md` does **not** get a `method` mention — `hover.md` has no `TransitionEffect` rule, so adding a method summary there would be orphaned with no anchor

### Fixes

- Standardize title format: `# [Trigger] Trigger Rules for @wix/interact`
- Add Accessibility section to `hover.md` (interact-specific content only)
- Standardize placeholder names across all trigger docs: use `[SOURCE_KEY]` / `[TARGET_KEY]` everywhere
- Collapse `hover.md` Rules 2+3 into one rule with two examples
- Add one-line mention of `add`/`remove`/`clear` methods to `click.md` TransitionEffect rule
- Remove trailing "These rules provide comprehensive coverage..." footers from `click.md`, `viewenter.md`, `viewprogress.md`, `pointermove.md`

---

## Final File Structure

```
packages/interact/rules/
├── full-lean.md       ← canonical spec: schema, types, all trigger params, effect rules, general gotchas
│                         changes: fix keyframeEffect+axis note, add registerEffects, remove duplicate Progress type
├── integration.md     ← onboarding only: setup, 3 working examples, trigger overview table
│                         changes: reduce from ~370 → ~150 lines by deleting schema/effect prose
├── click.md           ← trigger patterns + examples + interact-specific best practices
├── hover.md           ← trigger patterns + examples; add a11y section; collapse rules 2+3
├── viewenter.md       ← trigger patterns + examples; full FOUC example with constraints
├── viewprogress.md    ← 1 template + 2 tables + 4 examples + advanced patterns
│                         changes: remove 9-rule matrix (~600 lines); no direction placeholder in template
├── scroll-list.md     ← list-specific only (sticky hierarchy, stagger, list context)
│                         changes: delete generic scroll/range/effect content (~200 lines)
└── pointermove.md     ← keep Core Concepts (genuine unique value); trim best practices
```

---

## Execution Order

| #   | Action                                                                                                        | Files affected                   | Est. lines removed | Risk               |
| --- | ------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------ | ------------------ |
| 1   | Fix correctness: `keyframeEffect`/`pointerMove` conflict                                                      | `full-lean.md`                   | —                  | High if skipped    |
| 2   | Fix correctness: `listItemSelector` vs `selector`                                                             | `full-lean.md`, `integration.md` | —                  | High if skipped    |
| 3   | Fix correctness: FOUC constraints alignment                                                                   | `integration.md`                 | —                  | High if skipped    |
| 4   | Fix 6 typos + undefined `pointermove.md` reference                                                            | all                              | —                  | Low effort, do now |
| 5   | Delete generic best-practices content from all trigger docs                                                   | all trigger docs                 | ~250               | Low                |
| 6   | Refactor `viewprogress.md`: 1 template + 2 tables + 4 examples (added multi-range)                            | `viewprogress.md`                | ~600               | Medium             |
| 7   | Reduce `scroll-list.md`: delete generic scroll/range/effect content                                           | `scroll-list.md`                 | ~200               | Low                |
| 8   | Reduce `integration.md`: delete schema/effect prose                                                           | `integration.md`                 | ~150               | Low                |
| 9   | Add `registerEffects` to `full-lean.md`; remove duplicate `Progress` type                                     | `full-lean.md`                   | —                  | Low                |
| 10  | Standardize titles, placeholders, collapse `hover.md` rules 2+3, add missing `method` mention, remove footers | all                              | ~50                | Very low           |

**Estimated total reduction: ~~1,250 lines (~~15% of corpus), with zero loss of `@wix/interact`-specific information.**
The remaining content will be denser, more accurate, and cheaper for models to consume.
