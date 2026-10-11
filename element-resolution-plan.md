# Element resolution in `@wix/interact` — research, options, and plan

**Status:** research + proposal. No code changed.
**Date:** 2026-07-30
**Subject:** the `ElementIdentifier` refiner fields — `selector`, `listContainer`, `listItemSelector` — on both `InteractionTrigger` (source side) and `EffectBase` (target side).
**Triggered by:** `interact-documentation-site-audit.md` items B11, §3.2, §3.3, §3.4, A5, A10, plus §11 per-page items on the three list pages.

---

## 0. Summary

### The three fields have distinct, legitimate jobs

The conceptual model is sound and non-redundant — **identity → collection → item → part**:

- **`key`** — identity / registration handle (controller, `[data-interact-key]` CSS anchor, cross-element targeting).
- **`listContainer`** — "this is a repeating collection": per-item trigger binding, `MutationObserver` tracking, stagger index, per-item state.
- **`listItemSelector`** — "and _this_ is what counts as one item" (containers legitimately hold headers, sentinels, template nodes, ad slots).
- **`selector`** — "and attach to this descendant, not the scope element itself".

The clearest statement of intent anywhere in the repo is in the skill (`skills/interactor/references/config-schema.md:271-273`): _"one trigger fanning across many targets is the `selector` case; `listContainer` is for when each item needs its own trigger."_

**The problem is not the model.** It is that only **two of the three refiners** are implemented in the JS path, `selector` silently changes meaning depending on whether `listContainer` is present, and the CSS pipeline implements a _different_ version of the model than the JS pipeline.

### Headline findings (beyond what the audit already had)

| Finding                                                                                                                                                                                                                                                                                                                                                                                                      | Why it matters                                                                                                           |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **Per-item state effects never fire.** `createTransitionHandler` finds the item via `closest('.list > .item:has(:scope)')`, and `:has(:scope)` never matches the element itself (verified in **Chrome and jsdom**). Since the target _is_ the item in the canonical list config, the lookup returns `null` and `toggleEffect` silently early-returns. It only works if the effect also carries a `selector`. | A documented feature is a silent no-op. (D1)                                                                             |
| **…and even then the CSS cannot match.** `generate()` anchors the state on the keyed host (`[data-interact-key=k]:is(…,[data-interact-effect~=fx]) .list > .item`) while the runtime writes the attribute on the **item**.                                                                                                                                                                                   | Two halves of one feature assume opposite placements. (D2)                                                               |
| **Cross-item mispairing.** Source↔target pairing is zip-by-array-index: `btn2` in card 2 animated `box1b` in card 1.                                                                                                                                                                                                                                                                                         | Wrong element animates. (D6)                                                                                             |
| **`listItemSelector` narrows _all_ generated CSS**, not just `transition`/state CSS.                                                                                                                                                                                                                                                                                                                         | The CSS-bound set is narrower than the JS-bound set; the doc site's most accurate description still understates it. (D4) |
| **Resolution leaks across nested keyed roots.** `key: 'outer', selector: '.card'` also bound a `.card` inside `<div data-interact-key="inner">`.                                                                                                                                                                                                                                                             | One component silently animates another's DOM. (D7)                                                                      |
| **The validator ships a false warning.** `REDUNDANT_SELECTOR_WITH_LIST_ITEM` tells users to delete a field that is doing work in both pipelines.                                                                                                                                                                                                                                                             | Actively harmful guidance. (D12)                                                                                         |
| **Selector conditions are the existing dynamic item-filter** (working demo in `apps/demo/src/web/components/SelectorConditionDemo.tsx`) — but `viewProgress` and `pointerMove` ignore them.                                                                                                                                                                                                                  | The right mechanism for "which items _right now_" is not universal. (D13)                                                |

13 defects total ([§4](#4-defects-and-divergences)), each with file references and execution evidence, plus [§4.1](#41-documentation-says-four-mutually-exclusive-things): the documentation currently states **four mutually exclusive things** about these fields.

### Options, scored

Five options rated on 9 criteria (ease of use, teachability, LLM-generation friendliness, expressive power, back-compat, implementation cost, external migration cost, defects fixed, risk of new ambiguity) — full matrix in [§7](#7-scoring-and-recommendation):

| Option                                                                    | Total / 45 |
| :------------------------------------------------------------------------ | :--------: |
| **B — structured `list: { container, item }`, single-meaning `selector`** |   **40**   |
| A — implement the documented model, keep field names                      |     35     |
| D — discriminated union (`list` / `item` / `within`)                      |     35     |
| C — drop `listItemSelector`, filter via selector conditions               |     30     |
| E — docs-only, freeze the runtime                                         |     26     |

### Recommendation

**A then B, as two shipped phases — not a fork.** They are the same resolution semantics with different spellings, so Phase 1 carries all the risk and Phase 2 is a pure normalisation step in `parseConfig`. Option C's real insight is kept (structural filtering and stateful filtering are different jobs). Option E becomes **Phase 0** and ships immediately to unblock the docs launch.

The core of the plan is a single `resolveElements()` returning `{ element, item, itemIndex }`, used by JS bind, JS mutation, CSS emission **and** teardown — plus a cross-pipeline invariant test asserting `querySelectorAll(toCSSSelector(id))` ≡ `resolveElements(id, root)`. That one test is what stops this class of drift from recurring.

Four questions cannot be answered from this repo ([§11](#11-open-questions-for-the-team)); the gating one is **whether the Wix editor emits `listItemSelector` expecting it to filter**, since that decides whether Phase 1 changes rendered output or removes bindings.

---

## Table of contents

0. [Summary](#0-summary)
1. [Method](#1-method)
2. [What the three fields are _for_](#2-what-the-three-fields-are-for-reconstructed-intent)
3. [What the code actually does](#3-what-the-code-actually-does)
4. [Defects and divergences (D1–D13)](#4-defects-and-divergences)
5. [The ambiguities that must be decided (Q1–Q10)](#5-the-ambiguities-that-must-be-decided)
6. [Options](#6-options)
7. [Scoring and recommendation](#7-scoring-and-recommendation)
8. [The plan](#8-the-plan)
9. [Test plan](#9-test-plan)
10. [Downstream updates and audit items closed](#10-downstream-updates-and-audit-items-closed)
11. [Open questions for the team](#11-open-questions-for-the-team)

---

## 1. Method

Read: `packages/interact/src/core/{add,Interact,InteractionController,css,cssUtils,remove,resolvers,utilities}.ts`, `src/handlers/{eventTrigger,effectHandlers,viewEnter,viewProgress,pointerMove,animationEnd}.ts`, `src/utils.ts`, `src/types/config.ts`, `src/web/InteractElement.ts`, `src/react/interactRef.ts`, `src/dom/api.ts`; `packages/interact-validate/src/semantic/{ignored,fouc}.ts`; `packages/interact/docs/api/element-selection.md`, `docs/guides/lists-and-dynamic-content.md`, `rules/{full-lean,integration,validate}.md`; `skills/interactor/references/config-schema.md`; `interact-documentation-site.md` (L3590-3645, L4340-4475); `apps/demo/src/{web,react}/components/*`; `packages/interact/test/{css,mini,resolvers,web}.spec.ts`.

Ran: a throwaway vitest probe (14 cases) against the real `add()` / `generate()` code paths in jsdom, plus a Chrome check of the one browser-dependent selector trick. Probe kept at
`/private/tmp/claude-501/-Users-ameerf-repos-interact/…/scratchpad/probe_selectors.spec.ts` (removed from the repo). Findings below marked **[P*n*]** were produced by execution; **[Chrome]** was verified in a real browser.

Also read history: `39f4bf2` (initial implementation), `a213c53` "Interact selector all" (#96, Feb 2026) — the commit that changed `selector` from single- to multi-match and is the origin of most of the drift.

---

## 2. What the three fields are _for_ (reconstructed intent)

`ElementIdentifier` (`src/types/config.ts:53-58`) is the same shape on both sides of a config:

```ts
type ElementIdentifier = {
  key: string; // which registered root
  listContainer?: string; // "there is a repeating collection here"
  listItemSelector?: string; // "…and *this* is what counts as one item"
  selector?: string; // "…and attach to this descendant, not the root/item itself"
};
```

Reading intent off the code, the tests, the demos and the agent rules, the four fields are **not** redundant — each owns a distinct axis:

| Field              | Axis it owns                                   | What it buys you                                                                                                                                                             | Best statement of intent found in the repo                                                                                                                                                 |
| :----------------- | :--------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`              | **identity**                                   | controller registration, `[data-interact-key]` CSS anchoring, cross-element targeting, caching                                                                               | `rules/full-lean.md:686`                                                                                                                                                                   |
| `selector`         | **refinement** — _which part_ of a scope       | attach/animate a descendant instead of the scope element itself (delegated triggers, "zoom the `img` not the card", hit-area stability)                                      | `skills/interactor/references/config-schema.md:68-72`                                                                                                                                      |
| `listContainer`    | **list-ness** — _this is a collection_         | (a) one trigger binding **per item**, (b) `MutationObserver` tracking of added/removed items, (c) an **item index** for stagger, (d) per-item state for `transition` effects | `skills/interactor/references/config-schema.md:271-273`: "one trigger fanning across many targets is the `selector` case; `listContainer` is for when each item needs its **own** trigger" |
| `listItemSelector` | **item definition** — _what counts as an item_ | lets a container hold non-items (header, sentinel, template node, ad slot) without them becoming items                                                                       | doc site L4462: "Narrows which direct children count as list items"                                                                                                                        |

That is a coherent four-field model: **identity → collection → item → part**. The problems are not in the model; they are that only _two_ of the three refiners are implemented in the JS path, `selector` carries two different meanings depending on whether `listContainer` is present, and the CSS pipeline and the JS pipeline implement _different_ versions of the model.

---

## 3. What the code actually does

### 3.1 The JS bind-time resolver — `_getElementsFromData` (`src/core/add.ts:43-77`)

Root = `controller.element` (the keyed element; for `web` that is the `<interact-element>` host — the `useFirstChild` hop is **not** applied in the list/selector branches, only in the fallback).

1. `listContainer` set → `container = root.querySelector(listContainer)`; if not found: `console.warn` + return `[]`.
   - **also** `selector` → `Array.from(container.querySelectorAll(selector))` — flat, **any depth**, item boundaries ignored, `listItemSelector` ignored.
   - else → `Array.from(container.children)` — **every** element child, `listItemSelector` ignored.
2. else `selector` set → `root.querySelectorAll(selector)`; if empty: `console.warn` and **fall through to 3**.
3. `useFirstChild ? root.firstElementChild : root`.

`listItemSelector` never appears in this function. Its only three consumers are:

- `getSelector(…, { addItemFilter: true })` → CSS emission (`src/core/Interact.ts:340`);
- the `closest()` item lookup for state effects (`src/handlers/effectHandlers.ts:110-113`);
- `getElementHash()` → target identity (`src/core/utilities.ts:30-33`).

### 3.2 The JS mutation-time resolver — `_queryItemElement` (`src/core/add.ts:79-85`)

For children reported by the `MutationObserver` (`InteractionController._childListChangeHandler:167-191`):
`selector ? child.querySelector(selector) : child` — **one** match per item, and **no** filter on which added nodes count as items.

### 3.3 Pairing — `_applyInteraction` (`src/core/add.ts:107-154`)

- sources array + targets array → **zip by array index**; sources past the end of the target array are silently dropped.
- sources array + single target → every source drives that one target.
- single source + targets array → that source drives every target.

### 3.4 CSS emission — `getSelector` (`src/core/Interact.ts:331-353`)

Consumed by `triggerToCSS` (`css.ts:150-154`), `parseEffect` (`css.ts:316-320`), `parseSequence` (`css.ts:377-381`) — all with `addItemFilter: true` — and by the runtime state-effect path `createTransitionCSS` (`add.ts:767-771`). `parseConfig` also stores an item-filter-less variant per key for **teardown** (`Interact.ts:428-430`, `486`, `511`; consumed by `remove.ts:19-27`).

### 3.5 The full agreement matrix **[P4, P2, P11, P13]**

| Config                               | CSS emitted (`addItemFilter`) | JS at bind                               | JS on mutation                             | Teardown selector       | Agree?                  |
| :----------------------------------- | :---------------------------- | :--------------------------------------- | :----------------------------------------- | :---------------------- | :---------------------- |
| _(none)_                             | `> :first-child` (web) / `''` | `firstElementChild` / root               | —                                          | `:scope > :first-child` | ✅                      |
| `selector`                           | `.sel`                        | `root.querySelectorAll('.sel')`          | —                                          | `.sel`                  | ✅                      |
| `listContainer`                      | `.list > *`                   | `container.children`                     | each added child                           | `.list > *`             | ✅                      |
| `listContainer` + `listItemSelector` | `.list > .item`               | **`container.children` (all)**           | **every added child**                      | `.list > *`             | ❌ CSS narrower than JS |
| `listContainer` + `selector`         | `.list .sel`                  | `container.querySelectorAll('.sel')`     | **`child.querySelector('.sel')` (1/item)** | `.list .sel`            | ❌ bind ≠ mutation      |
| all three                            | `.list > .item .sel`          | **`container.querySelectorAll('.sel')`** | `child.querySelector('.sel')`              | `.list .sel`            | ❌ three different sets |
| `listItemSelector` alone             | ignored                       | ignored                                  | —                                          | ignored                 | ✅ (inert)              |

---

## 4. Defects and divergences

Ordered by user impact. Each is evidence-backed.

| #       | Defect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Evidence                                                                                                                                                                                                                                                                                                                 |
| :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D1**  | **Per-item state (`transition`) effects never fire in the canonical list config.** `createTransitionHandler` resolves the item with `element.closest(\`${listContainer} > ${listItemSelector \|\| ''}:has(:scope)\`)` (`effectHandlers.ts:110-113`), and `element` is the **target** (`eventTrigger.ts:129-135`). `:has(:scope)`matches only elements that have the scoping element as a **descendant**, so when the target *is* the item the lookup returns`null`— and`toggleEffect`early-returns on`null` (`InteractionController.ts:112-114`). Result: click/hover on a list item with a `transition` effect does **nothing, silently**. | **[P0, Chrome]** `item.closest('.list > :has(:scope)') === null`, `item.closest('.list > .item:has(:scope)') === null`, `btn.closest(…) === <li>`. **[P6, P7, P8]** no `data-interact-effect` written anywhere. **[P12]** it _does_ work when the effect adds a `selector`, i.e. the target is a descendant of the item. |
| **D2**  | **Even when the item resolves, the generated CSS cannot match it.** The state rule anchors the state on the **keyed host**: `[data-interact-key="k"]:is(:state(fx), :--fx, [data-interact-effect~="fx"]) .list > .item { … }` (`cssUtils.ts:123-136`), while the runtime writes the attribute on the **item**. Two halves of one feature assume opposite placements.                                                                                                                                                                                                                                                                        | **[P13]** exact generated CSS; `createTransitionCSS` (`utils.ts:122-123`) has the same shape.                                                                                                                                                                                                                            |
| **D3**  | **`listItemSelector` does not filter JS binding.** All immediate children become sources/targets, including children that do not match it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | **[P1]** `listContainer: '.list', listItemSelector: '.active'` → all 3 children (`.active`, non-`.active`, and `.other`) each got a click listener.                                                                                                                                                                      |
| **D4**  | **`listItemSelector` _does_ narrow all generated CSS** — not only `transition`/state CSS as the docs' best statement claims, but also `view-timeline`, animation custom properties and the FOUC initial rules. So for CSS-driven animations the effective set differs from the JS-bound set.                                                                                                                                                                                                                                                                                                                                                | `css.ts:150-154, 316-320, 377-381` all pass `addItemFilter: true`. **[P5]**                                                                                                                                                                                                                                              |
| **D5**  | **`listContainer` + `selector` resolves differently at bind vs. mutation.** Bind: all matches in the container, any depth, item boundaries ignored. Mutation: exactly one match per new item.                                                                                                                                                                                                                                                                                                                                                                                                                                               | **[P2]** 3 cards → `a1, a2, b1, c1` (two images from one card, one from a nested wrapper). **[P11]** a card appended with two images contributes only `new1`. (= audit A10.)                                                                                                                                             |
| **D6**  | **Cross-item mispairing.** Because pairing is zip-by-array-index, a source in item _i_ can be paired with a target in item _j_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | **[P3]** sources `btn1,btn2,btn3` (one per card) zipped to targets `box1,box1b,box2` → `btn2`→`box1b` (card 1), `btn3`→`box2` (card 2).                                                                                                                                                                                  |
| **D7**  | **Resolution leaks across nested keyed roots.** `selector`/`listContainer` are plain descendant queries; they match inside a nested `[data-interact-key]` subtree that belongs to a different controller.                                                                                                                                                                                                                                                                                                                                                                                                                                   | **[P9]** `key: 'outer', selector: '.card'` bound both `#own` and the `#nested` card inside `<div data-interact-key="inner">`.                                                                                                                                                                                            |
| **D8**  | **A missed `selector` silently falls back to the whole element.** `add.ts:64-72` warns and then returns `firstElementChild`/root, so a typo animates the entire component instead of failing. (Contrast `_resolveSourceElements:362-374`, which _does_ treat empty as "nothing" — the two paths disagree.)                                                                                                                                                                                                                                                                                                                                  | `add.ts:64-76`                                                                                                                                                                                                                                                                                                           |
| **D9**  | **`listItemSelector` participates in element identity**, so two effects that resolve to the _same_ DOM elements at runtime get different CSS custom-property names, different cascade slots, and fail the FOUC same-element check.                                                                                                                                                                                                                                                                                                                                                                                                          | `utilities.ts:30-33`; `shouldUseInitial:19-28`; `css.spec.ts:325-348` encodes the "differing `listItemSelector` ⇒ not the same element" behaviour. **[P5]** two rules, hashes `9qtig32rhc` vs `zlegxcnuqy`.                                                                                                              |
| **D10** | **Stagger indices break for `listContainer` + `selector`.** `_resolveListItemIndices` (`add.ts:401-420`) does `container.children.indexOf(el)`, but `el` is a _descendant_ of a child in this mode → `-1` → every dynamically added element gets pushed to the end index.                                                                                                                                                                                                                                                                                                                                                                   | `add.ts:414-419`                                                                                                                                                                                                                                                                                                         |
| **D11** | **The `useFirstChild` hop is applied inconsistently.** `_getElementsFromData` queries from the host; `_resolveListItemIndices` queries from `firstElementChild`; `getSelector` skips the hop whenever a refiner is present.                                                                                                                                                                                                                                                                                                                                                                                                                 | `add.ts:48, 74-76, 406-410`; `Interact.ts:339-352`                                                                                                                                                                                                                                                                       |
| **D12** | **The validator ships a false warning.** `REDUNDANT_SELECTOR_WITH_LIST_ITEM` says "`selector` is ignored when both `listContainer` and `listItemSelector` are present" — untrue in both pipelines (`selector` wins in JS; in CSS they compose to `.list > .item .sel`). It tells users to delete a field that is doing work.                                                                                                                                                                                                                                                                                                                | `interact-validate/src/semantic/ignored.ts:23-43`; `rules/validate.md:232`; **[P4]**                                                                                                                                                                                                                                     |
| **D13** | **Item filtering cannot be expressed dynamically today, and the one mechanism that _can_ is not universal.** Selector conditions (`type: 'selector'`) are re-checked at event time (`effectHandlers.ts:38, 108`, `viewEnter.ts:199`, `animationEnd.ts:40`) — the correct tool for "only `.active` items". But `viewProgress` and `pointerMove` ignore `selectorCondition` entirely.                                                                                                                                                                                                                                                         | grep: no `selectorCondition` in `handlers/viewProgress.ts`, `handlers/pointerMove.ts`; `apps/demo/src/web/components/SelectorConditionDemo.tsx` is the working pattern                                                                                                                                                   |

### 4.1 Documentation says four mutually exclusive things

| Story                                                                        | Where                                                                                                                         | True?                                                  |
| :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| `listItemSelector` filters which children participate                        | `rules/full-lean.md:691`, `rules/integration.md:197,203`, `skills/…/config-schema.md:54,324`, doc site L3601-3618, L4358-4369 | ❌ (D3)                                                |
| `listItemSelector` narrows only `transition`/state CSS                       | doc site L4462                                                                                                                | ⚠️ narrows _all_ CSS (D4)                              |
| `selector` is ignored when `listContainer` + `listItemSelector` are both set | `interact-validate` `REDUNDANT_SELECTOR_WITH_LIST_ITEM`                                                                       | ❌ (D12)                                               |
| `listContainer` + `selector` = `querySelector` inside each direct child      | doc site L3621, L3635, `rules/full-lean.md:693`, `skills/…:326`                                                               | ⚠️ true only on the mutation path (D5)                 |
| `selector` alone selects the **first** matching descendant                   | doc site L3637                                                                                                                | ❌ since `a213c53` (Feb 2026) it is `querySelectorAll` |

---

## 5. The ambiguities that must be decided

Any option below has to answer all ten. These are the actual design questions hiding behind the three fields.

| #       | Question                                                                                                | Recommended answer                                                                                                                                                                                                  |
| :------ | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Q1**  | Does `selector` match at any depth, or only direct children?                                            | Any depth (descendant). One rule, everywhere.                                                                                                                                                                       |
| **Q2**  | Does `selector` yield one element or all matches?                                                       | **All** matches. Kill the "first match" story for good.                                                                                                                                                             |
| **Q3**  | Does resolution stop at a nested keyed root?                                                            | **Yes** — exclude any candidate whose nearest `[data-interact-key]` ancestor is not this root. (D7)                                                                                                                 |
| **Q4**  | Is the `web` `firstElementChild` hop applied before refiner queries?                                    | **No** (a descendant query crosses the wrapper anyway) — but state it once and make all three code paths agree. (D11)                                                                                               |
| **Q5**  | When `selector` resolves _inside_ list items, does each item contribute one element or all its matches? | **All** matches, each carrying its **owning item**. (D5)                                                                                                                                                            |
| **Q6**  | How are a source list and a target list paired?                                                         | **By owning item** when both sides describe the same list on the same key; otherwise **fan out** (every source drives every target). Never zip by raw index. (D6)                                                   |
| **Q7**  | Is item filtering static (bind-time) or dynamic (event-time)?                                           | `listItemSelector` is **static structural** ("what is an item"). Dynamic subsets (`.active`, `:nth-child(even)`) are **selector conditions** — and those must start working for `viewProgress`/`pointerMove`. (D13) |
| **Q8**  | For a list state effect, where does the state live and what CSS matches it?                             | On the **owning item**; CSS becomes `[key] .list > .item[data-interact-effect~=fx] <inner?>`. Without a list: on the keyed host, as today. (D1, D2)                                                                 |
| **Q9**  | What happens when a refiner matches nothing?                                                            | Warn once and **bind nothing**. No fallback to the root. (D8)                                                                                                                                                       |
| **Q10** | Is `listItemSelector` a compound selector or a full selector?                                           | **Compound, relative to the container** (`.item`, `li`, `[data-item]`); reject anything containing a combinator, since it is interpolated as `${listContainer} > ${listItemSelector}`.                              |

---

## 6. Options

All options assume the Q1–Q10 answers above and a **single shared resolver** used by JS bind, JS mutation, CSS emission, and teardown. They differ in the _config surface_ users write.

### Option A — Implement the documented model, keep the field names

Three refiners stay. One resolver:

```
root  = keyed element (web: host; queries are descendant queries so the wrapper is transparent)
scope = listContainer ? root.querySelector(listContainer) : root
items = listContainer
          ? [...scope.children].filter(c => !listItemSelector || c.matches(listItemSelector))
          : [root]
result = selector ? items.flatMap(i => [...i.querySelectorAll(selector)].map(el => ({el, item: i})))
                  : items.map(i => ({el: i, item: listContainer ? i : undefined}))
```

`listItemSelector` starts filtering; the mutation path filters added nodes the same way; each resolved element remembers its owning item (fixes D5, D6, D10, and makes Q8 implementable).

- **Pros:** no config-format change; every existing _correct_ config keeps working; the docs become true roughly as already written; the validator's false warning simply disappears; the smallest possible diff to a well-defined state.
- **Cons:** `selector` keeps two meanings ("within the root" / "within each item") — the single biggest reported source of confusion stays; `listItemSelector`'s absence still silently changes item semantics; three fields to teach.
- **Behaviour change for existing configs:** `listItemSelector` becomes load-bearing (configs that set it as decoration will lose bindings — but they were already losing CSS, D4); `listContainer + selector` gains matches on the mutation path and loses container-wide flattening across non-item children.

### Option B — Structured list, single-meaning `selector` _(recommended surface)_

```ts
type ElementIdentifier = {
  key: string;
  list?: { container: string; item?: string };
  selector?: string; // always: descendants of the scope (the root, or each item)
};
```

Same resolution semantics as A. `listContainer` / `listItemSelector` become **deprecated aliases** normalised at parse time (`parseConfig` already normalises keys, ids and sequences — one place to add it).

- **Pros:** the grammar _is_ the mental model — scope, then refinement; `item` is structurally impossible without `container`, so `LIST_ITEM_SELECTOR_WITHOUT_CONTAINER` stops existing; `selector` has exactly one meaning; the docs collapse to a three-row table; much easier for LLM config generation (the skill's biggest failure mode is picking between the three flat fields).
- **Cons:** a config-shape change to migrate (validator schema, skill, docs, and any Wix editor emitter); two spellings alive during the deprecation window; nested objects are slightly more verbose to hand-write.

### Option C — Drop `listItemSelector`; filter with selector conditions

Two refiners: `listContainer` (items = **all** children) and `selector`. Item filtering moves to the existing `conditions: [{ type: 'selector', predicate: '.active' }]` mechanism.

- **Pros:** one less field and one less concept; filtering becomes uniform across _all_ resolution modes, not just lists; conditions are re-evaluated at event time, so `.active` filtering actually tracks state changes — something a bind-time `listItemSelector` can never do; already demoed and working (`SelectorConditionDemo.tsx`).
- **Cons:** requires fixing `selectorCondition` support in `viewProgress`/`pointerMove` first (D13); for _time_ effects the animation objects are still **created** for non-items and only gated at fire time (waste, and wrong for `viewEnter` bookkeeping); "my container has a header" — a purely structural concern — now needs a named condition, which reads as over-machinery; loses the ability to _not observe_ non-item children.

### Option D — Explicit modes (discriminated union)

```ts
type ElementIdentifier =
  | { key: string } // the keyed element
  | { key: string; selector: string } // descendants of it
  | { key: string; list: string; item?: string; within?: string }; // items, or a part of each
```

- **Pros:** maximum clarity — `selector` and `within` never overlap, TypeScript discriminates the modes, the validator becomes near-trivial, and the reference page is literally three rows.
- **Cons:** largest migration; a fourth field name (`within`) to learn and to teach in every example; unions are awkward for the machine-generated configs that build identifiers field-by-field.

### Option E — Documentation-only: describe today's behaviour exactly

Freeze the runtime; rewrite docs, rules, skill and validator messages to match §3.5 verbatim, including the bind-vs-mutation split and "`listItemSelector` affects CSS only".

- **Pros:** zero risk, ships this week, unblocks the docs launch.
- **Cons:** documents D1/D2 (a feature that silently does nothing), D6 (cross-item mispairing) and D5 (two different rules for the same config) as _intended behaviour_; the resulting reference page is unteachable; guarantees the same audit next cycle.

---

## 7. Scoring and recommendation

1 = poor, 5 = excellent.

| Criterion                                       | A (keep names) | B (`list` object) | C (drop item filter) | D (modes union) | E (docs only) |
| :---------------------------------------------- | :------------: | :---------------: | :------------------: | :-------------: | :-----------: |
| Ease of use for a package user                  |       3        |       **5**       |          4           |      **5**      |       1       |
| Ease of teaching / doc simplicity               |       3        |       **5**       |          4           |      **5**      |       1       |
| LLM / editor config generation                  |       3        |       **5**       |          4           |        3        |       2       |
| Expressive power kept                           |     **5**      |       **5**       |          3           |      **5**      |     **5**     |
| Backwards compatibility                         |     **5**      |    4 (aliases)    |          2           |   3 (aliases)   |     **5**     |
| Implementation cost (5 = cheapest)              |       4        |         3         |          3           |        2        |     **5**     |
| Migration cost outside this repo (5 = cheapest) |     **5**      |         3         |          2           |        2        |     **5**     |
| Fixes D1–D13                                    |       4        |       **5**       |          4           |      **5**      |       1       |
| Risk of a _new_ ambiguity                       |       3        |       **5**       |          4           |      **5**      |       1       |
| **Total (of 45)**                               |     **35**     |      **40**       |        **30**        |     **35**      |    **26**     |

**Recommendation: A now, B next — as two shipped phases, not a fork.**

The reason they compose is that A and B are the _same resolution semantics_ with different spellings. Phase 1 (A) makes one resolver the single source of truth for JS, CSS and teardown — that is where all thirteen defects actually live. Phase 2 (B) is then a pure surface change: a normalisation step in `parseConfig` plus deprecation warnings, with no runtime risk, because by then only one code path resolves elements.

Option C's dynamic-filtering insight is **kept** and folded in: `listItemSelector` (→ `list.item`) is documented as _structural_ ("what is an item"), selector conditions as _stateful_ ("which items right now"), and fixing `selectorCondition` for `viewProgress`/`pointerMove` is a Phase 1 work item. Option D is rejected only on migration cost; if the config were greenfield it would be the pick.

Option E is not rejected — it is **Phase 0**, and it should ship immediately, because the docs launch is blocked on B11 and the truth is currently unwritten anywhere.

---

## 8. The plan

### Phase 0 — Tell the truth, unblock the docs (no runtime change)

| #   | Work item                                                                                                                                                                                                                                                             | Files                                                                                                                                                             |
| :-- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 | Write one canonical **Element resolution** reference containing the §3.5 matrix, and make every other surface link to it instead of restating it.                                                                                                                     | `packages/interact/docs/api/element-selection.md` (rewrite; it currently never mentions `listItemSelector` at all)                                                |
| 0.2 | Fix the four false statements in the doc site: recap step 2 & 3 (L3633-3638), the `.active` example (L3601-3618), the `listContainer + selector` claim (L3621), the `listItemSelector` claim (L4358). Add "known limitation" notes for D1 and D6 until Phase 1 lands. | `interact-documentation-site.md`                                                                                                                                  |
| 0.3 | Same corrections in the agent rules and the skill.                                                                                                                                                                                                                    | `rules/full-lean.md:201,207,220,355,691-704`, `rules/integration.md:182,195-216`, `skills/interactor/references/config-schema.md:52-54,113-117,321-333`           |
| 0.4 | **Delete** `REDUNDANT_SELECTOR_WITH_LIST_ITEM` (D12) — it is actively harmful. Keep `LIST_ITEM_SELECTOR_WITHOUT_CONTAINER`.                                                                                                                                           | `interact-validate/src/semantic/ignored.ts:22-43`, `src/errors.ts`, `test/rules/elementSelection.spec.ts`, `rules/validate.md:232`, `interact-validate/README.md` |
| 0.5 | Add a `LIST_ITEM_SELECTOR_CSS_ONLY` info/warning for the interim: "`listItemSelector` narrows generated CSS but not JS binding until vX". Remove it in Phase 1.                                                                                                       | `interact-validate/src/semantic/ignored.ts`                                                                                                                       |

### Phase 1 — One resolver (Option A semantics)

**1.1 New module `src/core/resolveElements.ts`** — the single source of truth. Shape:

```ts
type ResolvedElement = { element: HTMLElement; item?: HTMLElement; itemIndex?: number };

resolveElements(id: ElementIdentifier, root: HTMLElement, opts: { useFirstChild: boolean }): ResolvedElement[]
resolveItems(id, root, opts): HTMLElement[]                       // items only, for observers
resolveWithinItems(id, items: HTMLElement[]): ResolvedElement[]   // mutation path, same rules
toCSSSelector(id, opts): { itemSelector?: string; childSelector: string }  // replaces getSelector
```

Rules: Q1–Q5, Q9, Q10. `toCSSSelector` returns the item and inner parts **separately** so the state-effect generator can anchor `[data-interact-effect~=…]` on the item (Q8), and so teardown, CSS and JS derive from one function.

**1.2 Rewire the four call sites**

- `add.ts`: `_getElementsFromData` and `_queryItemElement` → `resolveElements` / `resolveWithinItems`; `_getInteractionElements`, `_resolveSourceElements`, `_buildAnimationGroupArgsFromSequence` carry `ResolvedElement[]`.
- `Interact.ts`: `getSelector` → `toCSSSelector`; the per-key `selectors` set (teardown) must use the **same** item filter as binding (today it does not, §3.4).
- `css.ts` / `cssUtils.ts`: `CSSRuleToString` gains item-anchored state selectors (Q8/D2).
- `InteractionController.watchChildList` / `_childListChangeHandler`: filter added/removed nodes through `list.item` before calling `addListItems` / `removeListItems` (D3).

**1.3 Pairing by item (D6)** — `_applyInteraction` pairs source and target by `item` identity when both sides resolved from the same key + container; otherwise fans out. Delete the zip-by-index branch. `_resolveListItemIndices` becomes a lookup of `ResolvedElement.itemIndex` (D10).

**1.4 Fix per-item state effects (D1, D2)** — drop the `:has(:scope)` trick entirely; the handler receives the owning `item` from `ResolvedElement` (already resolved, no DOM query, no browser-dependent selector). Emit the matching CSS: `[key] <container> > <item>[data-interact-effect~=fx] <inner?>`. Verify both the runtime `createTransitionCSS` path and the `generate()` path produce the same shape (they must; consider consolidating per the existing TODO at `utils.ts:100-101`).

**1.5 Scope to the keyed root (D7)** — post-filter candidates whose nearest `[data-interact-key]` ancestor is not this root; mirror in CSS with a `:not()` guard or document the CSS-side limitation explicitly.

**1.6 No silent fallback (D8, Q9)** — a refiner that matches nothing warns once with the config path and binds nothing.

**1.7 Selector conditions for all triggers (D13)** — thread `selectorCondition` into `viewProgress` and `pointerMove` so the "which items _right now_" mechanism is universal.

**1.8 Identity (D9)** — keep `listItemSelector` in `getElementHash` (it now genuinely changes the resolved set, so distinct hashes become correct rather than accidental). Add a test pinning the FOUC same-element rule to the _resolved_ identity.

### Phase 2 — The `list` surface (Option B)

- 2.1 Add `list?: { container: string; item?: string }` to `ElementIdentifier`; normalise `listContainer`/`listItemSelector` → `list` in `parseConfig` (one place) and in `resolveEffectForCSS`.
- 2.2 Deprecate the flat fields: keep them working, mark `@deprecated` in types, add a validator warning with the exact replacement, ship a codemod script under `scripts/`.
- 2.3 Rewrite docs / rules / skill on the new surface, flat fields shown once in a migration note.
- 2.4 Remove the flat fields in the next major.

---

## 9. Test plan

The probe cases become the regression suite (they are all currently either failing-by-design or asserting nothing):

| Case                                                                 | Assertion after Phase 1                                            |
| :------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `listContainer` + `listItemSelector`, mixed children                 | only matching children get listeners **and** CSS **and** teardown  |
| dynamically appended non-item child                                  | ignored by the observer                                            |
| `listContainer` + `selector`, 2 matches in one item                  | both bound at bind time **and** on mutation (identical sets)       |
| source in item _i_, target in item _j_                               | never paired; each source drives its own item's target             |
| unequal source/target counts                                         | fan-out, nothing silently dropped                                  |
| list + `transition` effect, target = item                            | `data-interact-effect` lands on the item; generated CSS matches it |
| list + `transition` effect, target = descendant of item              | same, with the inner selector appended                             |
| nested `[data-interact-key]` subtree                                 | outer key does not bind inner elements                             |
| `selector` matching nothing                                          | warns; **no** fallback to root                                     |
| stagger indices with `listContainer` + `selector`, items added later | index = owning item's index                                        |
| `generate()` vs runtime `createTransitionCSS` for the same config    | byte-identical selectors                                           |
| `viewProgress` / `pointerMove` with a selector condition             | gated like the event triggers                                      |

Plus a **cross-pipeline invariant test**: for a table of configs, assert that `document.querySelectorAll(toCSSSelector(id))` and `resolveElements(id, root)` return the same element set. That single test is what prevents this class of drift from coming back.

---

## 10. Downstream updates and audit items closed

| Audit item                                                   | Closed by                                                    |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| B11 (element-resolution rules contradict across three pages) | 0.1, 0.2                                                     |
| §3.2 / A5 (`listItemSelector` does not filter)               | 0.2, 0.3 + **1.2/1.4** (makes the documented behaviour true) |
| §3.3 (`selector` is `querySelectorAll`)                      | 0.1, 0.2                                                     |
| §3.4 / A10 (bind vs mutation divergence)                     | **1.1/1.2**                                                  |
| §11 per-page items on the three list pages                   | 0.1–0.3                                                      |
| _(new)_ D1, D2, D6, D7, D8, D10, D11, D12, D13               | as mapped in §8                                              |

Surfaces to update in lockstep (each currently states something false): `docs/api/element-selection.md`, `docs/api/types.md`, `docs/guides/{lists-and-dynamic-content,configuration-structure,sequences}.md`, `docs/examples/{list-patterns,entrance-animations}.md`, `docs/integration/react.md`, `rules/{full-lean,integration,validate}.md`, `README.md`, `llms.txt` / `llms-full.txt`, `skills/interactor/{SKILL.md,references/config-schema.md,references/triggers.md}` and the six examples using `listContainer`, `packages/interact-validate/README.md`.

---

## 11. Open questions for the team

1. **Who else emits these configs?** If the Wix editor writes `listItemSelector` today expecting it to filter, Phase 1 changes rendered output. If it writes it as decoration, Phase 1 removes bindings. This is the one input I cannot verify from this repo and it gates 1.2.
2. **Is `listContainer + selector` meant to be "one per item" or "all per item"?** `a213c53`'s message says "If listContainer is specified then selector matches a single element", and the mutation path implements exactly that. Q5 recommends "all", for consistency with `selector` elsewhere; "one" is defensible and cheaper to migrate to. Decide before 1.1.
3. **Is a whole-list state effect a real use case?** (state on the keyed host, styling every item — what the CSS generator currently implies). If yes, Q8 needs an opt-in, e.g. state effects with `list` but no `stateScope: 'item'`.
4. **Phase 2 field names:** `list: { container, item }` vs `D`'s `list` / `item` / `within`. Naming affects the skill and every doc example, so it is worth one explicit decision rather than drifting.
