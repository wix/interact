---
name: interactor
description: 'Install, integrate, and configure Interact — @wix/interact — declarative interactions library — to add or edit hover/click/view triggered, scroll-driven, and pointer-driven animations on a webpage or web app. Use whenever the user wants to add or change web animations/interactions with @wix/interact or @wix/motion(-presets); wire animations to scroll, viewport-enter, hover, click, or mouse-move; build entrance / parallax / stagger / tilt / reveal effects; install or set up @wix/interact (vanilla JS, React, or Web Components); or edit an existing interact config. Validate every generated InteractConfig with @wix/interact-validate before it reaches generate()/create(). Trigger even on phrasings like "fade in on scroll", "parallax background", "stagger the cards in", "hover-scale the button", or "tilt toward the mouse" in a project using these packages. Do NOT use for other animation libraries.'
---

# Interactor — build interactions with @wix/interact

This skill installs, wires up, and configures motion interactions so you can
add or edit interactions on any webpage or web app. It is **interact-first**: you
describe _what should animate and when_ as a declarative JSON config, and the
library does the DOM wiring. You almost never call the motion engine directly.

## Mental model — packages and one config

| Package                  | Role                                                                                                                         | You touch it…                                                                                       |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| `@wix/interact`          | Declarative layer. Binds **triggers → effects** via an `InteractConfig`. Ships vanilla / React / Web-Component entry points. | Always. This is the API.                                                                            |
| `@wix/motion-presets`    | Ready-made named effects (entrance, scroll, ongoing, mouse). Referenced as `namedEffect: { type: 'FadeIn' }`.                | When you want a prebuilt effect (the common case).                                                  |
| `@wix/motion`            | The engine (WAAPI, CSS, ViewTimeline, fastdom). Bundled inside interact.                                                     | Rarely — only for programmatic/escape-hatch animation. See `references/motion-engine.md`.           |
| `@wix/interact-validate` | Static validator for `InteractConfig` shape (schema + referential checks). No DOM.                                           | Agent-side validation always; optional dev/CI guard in user projects. See `references/validate.md`. |

The whole job is: **pick a trigger, pick an effect, bind it to an element with a
key.** Everything else is detail.

```
┌── trigger (when) ──┐        ┌── effect (what) ────────────────┐
│ viewEnter, hover,  │  ───►  │ namedEffect: { type: 'FadeIn' } │  ──► applied to
│ click, viewProgress│        │ duration, easing, triggerType   │      element with
│ pointerMove, …     │        │ (or keyframeEffect/customEffect)│      matching key
└────────────────────┘        └─────────────────────────────────┘
```

## Workflow

Follow four steps in order: **Install → Integrate → Add/Edit interactions → Validate.** If
the project already uses interact (a config and the package exist), skip to
_Add/Edit_. Read the linked reference files as you reach each step — they hold the
full schema, the preset catalog, and per-trigger rules. Don't try to hold it all
in your head; the references are the source of truth.

---

### Step 1 — Install

Both packages, one command. `@wix/motion` comes transitively inside
`@wix/interact` — **do not install it separately** on this path.

```bash
npm install @wix/interact @wix/motion-presets
# (yarn add / pnpm add work too — match the project's package manager)
npm install -D @wix/interact-validate   # optional — permanent dev/CI config guard only
```

A no-build / plain-HTML site can skip npm and import from a CDN instead — see the
CDN recipe in `references/integration-recipes.md`. CDN pages skip the validate
package install; the agent validates configs without shipping the validator.

---

### Step 2 — Integrate

**First, detect the stack and pick the entry point** (this determines every
import and a couple of flags). Decision procedure:

1. **React / Next / any JSX project** (a `package.json` with `react`, `.jsx`/`.tsx` files) → use `@wix/interact/react` with the `<Interaction>` component.
2. **Plain HTML, no bundler** (static `.html`, no build step) → use `@wix/interact/web` with `<interact-element>` custom elements, imported from a CDN.
3. **Bundled vanilla JS / other framework** (Vite/Webpack but no React, or Vue/Svelte/Angular) → use `@wix/interact/web` (Web Components are framework-agnostic) **or** the base `@wix/interact` vanilla API. Prefer `/web` unless the user wants to control binding manually.

If you can't tell, ask the user which framework the page uses. The full
copy-paste setup for each entry point — including SSR, cleanup, and a verification
snippet — is in **`references/integration-recipes.md`**. Read it now for the entry
point you chose.

The shape is the same everywhere:

```ts
import { Interact, generate } from '@wix/interact/web'; // or /react, or '@wix/interact'
import { FadeIn } from '@wix/motion-presets'; // import only what you use (tree-shakes)

Interact.registerEffects({ FadeIn }); // BEFORE generate()/create() — see invariants
const css = generate(config, /* useFirstChild */ true); // inject into <head>
const instance = Interact.create(config); // wire it up
```

(For CDN/quick-start, `import * as presets` + `registerEffects(presets)` is fine —
selective imports just keep bundled apps lean. See `references/presets.md`.)

Mark up target elements with a **key** that matches the config:

```html
<!-- web -->
<interact-element data-interact-key="hero"><section>…</section></interact-element>
<!-- react -->
<Interaction tagName="section" interactKey="hero">…</Interaction>
<!-- vanilla -->
<section data-interact-key="hero">…</section>
```

```js
// for vanilla - add the following
import { add } from '@wix/interact';

const el = document.querySelector('[data-interact-key="hero"]');
add(el);
```

---

### Step 3 — Add / edit interactions

This is where most work happens. An `InteractConfig` is:

```ts
{
  interactions: [            // REQUIRED — each binds one source+trigger to effect(s)
    { key, trigger, params?, effects?, sequences?, conditions?, selector?, listContainer?, listItemSelector? }
  ],
  effects?:   { [effectId]: Effect },        // reusable effects, referenced by effectId
  sequences?: { [sequenceId]: SequenceConfig },
  conditions?:{ [conditionId]: Condition },  // media/selector gates
}
```

To **add** an interaction:

1. Choose the **trigger** (see decision table below).
2. Choose the **effect**: prefer a `namedEffect` preset (browse `references/presets.md`); fall back to inline `keyframeEffect` for custom keyframes, or `customEffect` for non-CSS (SVG/canvas/text).
3. Set the **playback field** the trigger needs: `triggerType` for time effects on hover/click/viewEnter; `stateAction` for CSS-state (transition) effects; `rangeStart`/`rangeEnd` for `viewProgress`. Never set both `triggerType` and `stateAction` on one effect.
4. Bind it: give the target element the matching `key` in the markup.

To **edit** an existing config: read the current config first, find the
interaction/effect by its `key`/`effectId`, and change _only_ what's asked.
Preserve the rest (other interactions, ids, markup keys). After editing, re-run
validation (Step 4) — a changed `namedEffect.type` or a new
`viewProgress` effect can silently break if you skip it. If the effect catalog or
trigger semantics are involved, open `references/presets.md` / `references/triggers.md`.

For multi-target staggering (cards, lists, nav items), use **sequences**, not
manual per-item delays — see `references/triggers.md` and the sequences section of
`references/config-schema.md`.

---

### Step 4 — Validate the config

No `InteractConfig` reaches `generate()` / `Interact.create()` unvalidated, and
**no `@wix/interact-validate` reference ships in the code you deliver** — on any
entry point, CDN included. How you run validation depends on whether you can
construct the config statically:

- **Static config** (you authored a literal you can read in full): validate **before
  emit** in a scratch script — never add validator imports to user files. See
  `references/validate.md` for per-environment run mechanics.
- **Dynamic config** (built at runtime from data/props/fetch/loops — you cannot
  construct it by reading): temporarily inject `assertValidInteractConfig(config)`
  immediately before `generate()`/`create()`, run so that code path executes, fix
  every `severity: 'error'`, then **remove** the call, import, any `esm.sh` import,
  and any temp devDep. Prefer a dev-only validation script when the config builder
  module is importable in isolation (no removal step). Full loop in
  `references/validate.md`.
- **Permanent guard (opt-in, separate):** leaving `assertValidInteractConfig` in
  shipped code as a devDependency CI gate is only when scaffolding a new project or
  the user explicitly asks — do not conflate with the temporary injection above.

Fix every issue with `severity: 'error'` before proceeding; prefer fixing warnings
too. `valid: false` blocks emit.

**Before declaring done**, grep the files you're shipping:

```bash
grep -REn 'interact-validate|validateInteractConfig|assertValidInteractConfig|InteractValidationError' <shipped files>
# expect: no matches (unless the user asked for a permanent CI guard)
```

Then run the semantic checklist below.

---

## Trigger → use-case quick reference

| Trigger              | Use for                                                         | Effect type & key field                                         |
| :------------------- | :-------------------------------------------------------------- | :-------------------------------------------------------------- |
| `viewEnter`          | Entrance animations when an element scrolls into view           | Time effect; `triggerType` (default `'once'`)                   |
| `viewProgress`       | Scroll-driven (parallax, reveal, scrub tied to scroll position) | Scrub effect; `rangeStart`/`rangeEnd`                           |
| `hover` / `interest` | Hover effects (`interest` = hover+focus, accessible)            | Time effect (`triggerType`) **or** State effect (`stateAction`) |
| `click` / `activate` | Click toggles (`activate` = click+keyboard, accessible)         | Time effect (`triggerType`) **or** State effect (`stateAction`) |
| `pointerMove`        | Cursor-following / tilt / parallax-on-mouse                     | Scrub effect; `params.hitArea`, `params.axis`                   |
| `animationEnd`       | Chain one effect after another finishes                         | `params.effectId` of the preceding effect                       |

Per-trigger deep rules and gotchas → **`references/triggers.md`**. Effect catalog (which preset for which look) → **`references/presets.md`**. Full
field-by-field schema for every config object → **`references/config-schema.md`**.

---

## Critical invariants — get these wrong and output silently breaks

These are the failure modes that don't throw — the page just renders wrong or the
animation no-ops. Apply them every time, even if you don't open a reference file.

1. **`registerEffects()` runs BEFORE `generate()` and `Interact.create()`.** An
   unregistered `namedEffect.type` doesn't error — it logs a console warning and
   the animation never runs. Register the presets you use up front — prefer a
   selective `import { FadeIn, … }` (tree-shakeable) over `import * as presets` in
   bundled apps.

2. **`generate(config, useFirstChild)` parity** — pass `true` for the **web**
   (`<interact-element>`) entry point, `false` for **vanilla** and **React**.
   Backwards = the FOUC-prevention selectors target the wrong node and break.

3. **FOUC prevention — inject `generate()` CSS.** Always inject the `generate()` output (ideally at
   SSR/build) so entrance elements are hidden before JS runs. The generated CSS includes
   FOUC-prevention rules (gated by `:not([data-interact-enter])`) for `viewEnter`+`once`
   entrances where source and target are the same element; when source ≠ target (e.g.
   stagger via `selector`), the generated rules hide the targets on their own. For
   `repeat`/`alternate`/`state`, inline the starting keyframe and use `fill: 'both'`.

4. **Vanilla binding.** You must then call the **standalone** `add(element, 'key')` for
   each element once it exists in the DOM. For clean up call the `remove('key')` function.
   `add`/`remove` are functions importedfrom the package.

5. **`viewEnter` with same source & target → only `triggerType: 'once'`.** For
   `repeat`/`alternate`/`state`, the animation can move the element out of/into the
   viewport and re-trigger forever. Use **separate** source and target elements for
   those.

6. **Hit-area shift.** On `hover` or `pointerMove`, if the effect changes the
   element's size/position (`scale`, `translate`), the hovered hit-area shifts and
   flickers. Keep the trigger on the stable parent and animate a **child** by
   putting `selector` (or different `key`) on the **effect** — `selector` on the _effect_
   sets the **target**; `selector` on the _interaction_ sets the trigger's
   **source** instead (the opposite of what you want).

7. **`viewProgress` needs `overflow: clip`, not `hidden`.** `overflow: hidden` on
   any ancestor between the element and the scroll container creates a scroll
   context that kills ViewTimeline. Replace every `overflow: hidden` with
   `overflow: clip` (Tailwind: `overflow-clip`).

8. **Never invent or guess.** Use only real preset names (`references/presets.md`).
   If you don't know a preset's option name/type, **omit it** and rely on defaults
   — guessing produces silently-wrong output. Never emit `DVD` (exists in types but
   isn't registered) or any `Bg*`/`ImageParallax` preset (experimental, not
   production-ready). For "background parallax", use the public **`ParallaxScroll`**
   on the image element with `viewProgress`.

9. **Scroll presets carry a `range`.** Every `*Scroll` preset needs
   `range: 'in' | 'out' | 'continuous'` in its `namedEffect`
   (prefer `'continuous'`) — **except** `ParallaxScroll`, which takes `parallaxFactor` instead.

10. **Lists: one keyed wrapper, fan out by `selector` or `listContainer` — never
    duplicate keys.** Keys are unique (one controller per key), so never put the
    same key on N repeated elements — they'd clobber and only the last binds.
    Instead key an **ancestor wrapper** and choose by _who triggers_: use
    **`selector`** on the **effect** when one trigger staggers/animates many targets
    (a `viewEnter` sequence over cards); use **`listContainer`** on the
    **interaction** when each item needs its **own** trigger (per-card
    `hover`/`pointerMove`, one tracker each). Either way the `selector`/
    `listContainer` must match a **descendant** of the keyed element, not the keyed
    element itself.

## Verify your work (run before declaring done)

Animations are hard to confirm headlessly, so this static check is your reliable
proxy.

### Automated config validation

- [ ] `validateInteractConfig(config)` returns `valid: true` (no `severity: 'error'` issues). See `references/validate.md`.
- [ ] Shipped files contain **no** `interact-validate`, `validateInteractConfig`, `assertValidInteractConfig`, or `InteractValidationError` references (unless the user explicitly asked for a permanent CI guard).

### Semantic & integration checklist

Items the validator cannot check — walk these after automated validation passes:

- [ ] Every `namedEffect.type` is a **real registered preset** from `references/presets.md` (not `DVD`, not a `Bg*` preset, not invented).
- [ ] Every `*Scroll` preset used with `viewProgress` has a `range` (except `ParallaxScroll`).
- [ ] `pointerMove` effects have **no** `rangeStart`/`rangeEnd` (those are `viewProgress`-only).
- [ ] Every interaction `key` (and effect `key`) has a **matching element** in the markup (`data-interact-key` / `interactKey`).
- [ ] `generate()` output is injected and `useFirstChild` matches the entry point.
- [ ] Child-target effects put `selector`/`key` on the **effect**, not the interaction. Groups of items use one keyed wrapper + a **descendant** match (no duplicate keys): `selector` on the effect for a one-trigger stagger/sequence, `listContainer` on the interaction for per-item triggers.
- [ ] Invariants 5–7 and 10 hold for the relevant triggers (separate source/target, child targets, `overflow: clip`, unique keys).

If a dev server is available, load the page and confirm the animation runs and the
browser console is free of "not found in registry" warnings.

## Reference files

Read the one(s) relevant to the task — they are self-contained and source-accurate:

- **`references/config-schema.md`** — every config object field-by-field: `InteractConfig`, `Interaction`, all three effect variants, sequences, conditions, element resolution (source vs target), FOUC, and the full `Interact` static API.
- **`references/triggers.md`** — per-trigger deep rules and gotchas: `viewEnter`, `viewProgress`, `hover`/`click` (+ `triggerType`/`stateAction` tables), `pointerMove`, `animationEnd`, accessibility variants, and sequences/stagger.
- **`references/presets.md`** — the full preset catalog by category with parameters, defaults, accessibility risk tiers + reduced-motion fallbacks, and an "atmosphere → preset" selection guide.
- **`references/integration-recipes.md`** — complete copy-paste setup per entry point (web / React / vanilla / CDN), with SSR, lifecycle/cleanup, and verification.
- **`references/validate.md`** — how to run `@wix/interact-validate` (static scratch script vs temporary injection for dynamic configs), options, limitations, and what the validator does not check.
- **`references/motion-engine.md`** — thin escape-hatch reference for calling `@wix/motion` directly (programmatic `getWebAnimation`/`getScrubScene`/`getSequence`), easings, and engine gotchas. Only when the declarative config can't express what's needed.
