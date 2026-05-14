---
name: Update generate() docs/rules
overview: Update all Interact docs and rules files so that `generate()` is documented as a complete CSS generation tool -- producing keyframes, animations, transitions, state overrides, view-timelines, animation-ranges, and coordinated-list custom properties for every interaction -- with FOUC prevention for viewEnter and scroll-driven CSS for viewProgress being key use-cases, alongside reducing runtime JS overhead and eliminating the need to manage DOM element references.
todos:
  - id: rewrite-functions-md
    content: Rewrite generate() section in docs/api/functions.md with full CSS generation scope, corrected defaults, and new examples
    status: completed
  - id: fix-api-readme
    content: Fix generateCSS(config) -> generate(config, useFirstChild?) in docs/api/README.md and update description
    status: completed
  - id: update-docs-readme
    content: Update generate() index entry in docs/README.md
    status: completed
  - id: update-entrance-animations
    content: Update FOUC section in docs/examples/entrance-animations.md to reference broader generate() capabilities
    status: completed
  - id: update-getting-started
    content: Update generate() tip in docs/guides/getting-started.md
    status: completed
  - id: update-react-md
    content: Clarify initial prop scope in docs/integration/react.md
    status: completed
  - id: rewrite-full-lean-fouc
    content: Rewrite FOUC Prevention section in rules/full-lean.md as CSS Generation & FOUC Prevention with viewProgress subsection
    status: completed
  - id: update-viewenter-rules
    content: Add broader generate() context note to rules/viewenter.md FOUC section
    status: completed
  - id: update-integration-rules
    content: Expand Critical CSS section in rules/integration.md
    status: completed
  - id: add-viewprogress-generate
    content: Add generate() section to rules/viewprogress.md for scroll-driven CSS
    status: completed
  - id: factual-corrections
    content: Fix useFirstChild default, generateCSS name, reduced-motion claim, and 'hides until completion' language across all files
    status: completed
isProject: false
---

# Update `generate()` Docs and Rules

## Current state

Every doc/rule file frames `generate()` exclusively as a FOUC-prevention helper for `viewEnter` + `triggerType: 'once'`. In reality `generate()` processes **all** interactions in the config and emits complete CSS: `@keyframes`, animation/transition custom properties, view-timeline rules, animation-range/timeline properties, state-effect rules, and coordinated-list aggregation rules. FOUC prevention (the `addInitialSelector` / `DEFAULT_INITIAL` path) is just one branch inside `effectToCSS`.

A major undocumented benefit: the generated CSS uses attribute selectors (`[data-interact-key="..."]`, `:state()`, `[data-interact-effect~="..."]`) rather than JS-managed DOM references. This means animations bind reactively as elements appear in the DOM -- no `querySelector`, no cached element references, no observer wiring, no cleanup on unmount. The entire class of bugs around stale references, race conditions between element mount and JS initialization, and manual lifecycle management disappears. None of the current docs or rules mention this advantage.

### Key source-of-truth references

- Public signature: `generate(config: InteractConfig, useFirstChild?: boolean): string` -- [css.ts](packages/interact/src/core/css.ts) L539-L541
- `_generate` iterates **all** interactions via `parseInteraction` -- L521-L523
- FOUC initial rule is gated by `shouldUseInitial` (viewEnter + once + same element) -- [utilities.ts](packages/interact/src/core/utilities.ts) L19-L27
- `data-interact-initial` is **set** by React `Interaction` component but **never consumed** by the runtime source; the generated CSS selector uses `:not([data-interact-enter])` -- [Interaction.tsx](packages/interact/src/react/Interaction.tsx) L48
- `useFirstChild` defaults to `true` in source, but the current docs say "Default `false`" -- needs fixing

## Files to change

### Docs

| File                                                                             | What to change                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [functions.md](packages/interact/docs/api/functions.md)                          | **Primary rewrite target.** Rewrite the `generate()` section to describe full CSS generation. Add a "Benefits" subsection covering no-DOM-references / reactive binding, reduced JS, and compositor-driven animations. Keep FOUC as a subsection. Fix `useFirstChild` default. Add viewProgress and mixed-trigger examples. |
| [api/README.md](packages/interact/docs/api/README.md)                            | Fix `generateCSS(config)` -> `generate(config, useFirstChild?)`. Update description from "Generate CSS for hiding elements..." to broader description.                                                                                                                                                                      |
| [README.md](packages/interact/docs/README.md)                                    | Update the index entry for `generate()` to reflect broader scope.                                                                                                                                                                                                                                                           |
| [entrance-animations.md](packages/interact/docs/examples/entrance-animations.md) | Update FOUC section to reference the rewritten `generate()` docs; keep entrance-specific guidance but note generate() does more.                                                                                                                                                                                            |
| [getting-started.md](packages/interact/docs/guides/getting-started.md)           | Update the "Tip" to reflect that `generate()` produces all animation CSS, not just FOUC-prevention CSS. Mention the reactive-binding / no-DOM-references advantage briefly.                                                                                                                                                 |
| [react.md](packages/interact/docs/integration/react.md)                          | Clarify `initial` prop description: note it is only relevant for viewEnter + once FOUC prevention, not for all generate() output.                                                                                                                                                                                           |

### Rules

| File                                                       | What to change                                                                                                                                                                                                                                             |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [full-lean.md](packages/interact/rules/full-lean.md)       | Rename "FOUC Prevention" section to "CSS Generation & FOUC Prevention". Add guidance on calling `generate()` for all configs (not just viewEnter). Include the no-DOM-references benefit. Keep the existing FOUC-specific `initial` rules as a subsection. |
| [viewenter.md](packages/interact/rules/viewenter.md)       | Keep FOUC section but add a note that `generate()` produces complete CSS for the entire config, not only the FOUC-related rules.                                                                                                                           |
| [integration.md](packages/interact/rules/integration.md)   | Expand "Critical CSS (FOUC Prevention)" section similarly to full-lean.md.                                                                                                                                                                                 |
| [viewprogress.md](packages/interact/rules/viewprogress.md) | Add a new section on using `generate()` to pre-render scroll-driven CSS (view-timeline, animation-timeline, animation-range) to reduce JS overhead and enable animation before JS loads.                                                                   |

## Rewritten `generate()` section structure (for [functions.md](packages/interact/docs/api/functions.md))

```
## generate(config, useFirstChild?)

[1-2 sentence overview: generates ALL CSS from config]

### Signature
### Parameters
  - config: InteractConfig (processes ALL interactions)
  - useFirstChild (default true -- for custom elements)
### Returns

### What it generates
  - @keyframes for every namedEffect / keyframeEffect
  - Animation custom properties (--animation-*, --animation-composition-*, --animation-timeline-*, --animation-range-*)
  - view-timeline declarations for viewProgress triggers
  - Transition custom properties for state effects
  - State selector rules (`:state()`, `:--`, `[data-interact-effect~=]`)
  - Coordinated-list aggregation rules (combining multiple interactions on same target)
  - FOUC-prevention initial rules (viewEnter + once, same-element source/target)
  - Condition-gated rules (@media, selector conditions)

### Benefits
  - No DOM element references needed: generated CSS uses attribute selectors (`[data-interact-key]`,
    `:state()`, `[data-interact-effect~=]`), so animations attach reactively as elements appear in
    the DOM. No need to query elements, cache references, wire up observers, or handle element
    lifecycle -- the browser's style engine does the binding. This removes entire categories of
    error-prone JS: stale references, race conditions between element mount and JS init, and manual
    cleanup on unmount.
  - Animations and transitions run on the compositor via native CSS, reducing main-thread JS work.

### Use cases
  1. FOUC prevention for entrance animations (viewEnter + once)
  2. Pre-rendering scroll-driven animations (viewProgress)
  3. Reducing runtime JS overhead (all CSS-expressible animations run natively)
  4. SSR / static-site generation
  5. Declarative, reference-free animation binding (no element queries or caching)

### FOUC prevention (viewEnter)
  [existing guidance about initial + data-interact-initial, with fix for useFirstChild default]

### Scroll-driven CSS (viewProgress)
  [new: explain that generate() emits view-timeline + animation CSS so scroll animations work before/without JS]

### Examples
  - viewEnter entrance (existing, updated)
  - viewProgress scroll-driven
  - Mixed config with hover + viewEnter + viewProgress
  - SSR (existing, updated)

### HTML Setup
  [updated to cover all entry points, fix useFirstChild guidance]
```

## Rules section rewrite structure (for [full-lean.md](packages/interact/rules/full-lean.md))

```
## CSS Generation & FOUC Prevention

### Generating CSS
  - Call `generate(config)` server-side / build-time for ALL configs
  - Produces complete CSS: keyframes, animations, transitions, scroll-driven, state effects
  - Benefits: FOUC prevention, reduced JS, faster first paint
  - No DOM references: CSS binds to elements via attribute selectors -- animations become reactive
    by design. No element queries, no reference caching, no lifecycle management, no stale-reference
    bugs. The browser matches selectors as elements enter the DOM.

### FOUC Prevention (viewEnter + once)
  [keep existing Step 1 / Step 2 / Rules subsections]

### Scroll-driven CSS (viewProgress)
  - generate() emits view-timeline + animation-timeline CSS
  - Animations driven by scroll position work before JS hydrates
  - No `initial` attribute needed

### Rules
  - generate() should be called server-side or at build time
  - For viewEnter FOUC: both generate() CSS AND initial on element required
  - initial is only valid for viewEnter + once where source = target
  - For repeat/alternate/state: manually apply initial keyframe inline, use fill: 'both'
```

## Factual corrections across all files

- **`useFirstChild` default**: change from "Default `false`" to "Default `true`" in functions.md (source truth: L541)
- **`api/README.md` function name**: change `generateCSS(config)` to `generate(config, useFirstChild?)`
- **"Generated CSS" description in functions.md**: remove claim that output is wrapped in `@media (prefers-reduced-motion: no-preference)` -- the initial rules are NOT wrapped in reduced-motion media; only condition-gated interactions get `@media` wrappers
- **"hides elements until animation completes"**: several docs say this; actual behavior is `:not([data-interact-enter])` which is set at animation _start_, not completion

## Out of scope (noted for follow-up)

- `data-interact-initial` is set by `Interaction.tsx` but never consumed by the runtime. This may indicate dead code or a missing integration. Flagged but not addressed in this docs update -- current docs guidance to set it will remain since it does no harm and may be consumed by future code.
