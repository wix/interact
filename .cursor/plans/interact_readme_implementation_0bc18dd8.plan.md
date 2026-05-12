---
name: Interact README Implementation
overview: Rewrite the @wix/interact README.md to serve as a polished, self-contained npm landing page — positioning Interact as a declarative, AI-ready interaction runtime with clear integration paths, scannable API surface, and prominent agent/LLM support.
todos:
  - id: write-readme
    content: Write the full packages/interact/README.md following the 16-section structure (~300-350 lines)
    status: pending
  - id: verify-examples
    content: Cross-check every code example against actual source types (config.ts, effects.ts, triggers.ts, Interact.ts, react/index.ts) to ensure accuracy
    status: pending
  - id: verify-links
    content: Verify all links (rules file paths, docs URLs, related package links) resolve correctly
    status: pending
isProject: false
---

# Interact Package README Implementation Plan

## Current State

The existing [`packages/interact/README.md`](packages/interact/README.md) (385 lines) is the strongest of the three package READMEs but has issues:

- Emoji-prefixed feature bullets (inconsistent with top-tier OSS style, contradicts spec guidance)
- Three nearly identical config blocks in "Quick Start" (redundant — only the framework wrapper differs)
- The "AI Support" section links hover rules to `click.md` (broken link)
- No badges, no value proposition narrative, no "How It Works" mental model
- Missing key pitfalls that agents/LLMs need upfront (overflow:clip, FOUC, same-element constraints)
- No mention of `@wix/motion-presets` integration or `registerEffects` in the main flow
- Examples show config fragments but don't always show complete, copy-pasteable code

## Target Positioning

**Interact is the declarative runtime.** JSON config drives everything — triggers fire effects, presets handle the visuals, Motion handles the engine. AI agents can generate configs. The README must work as a standalone npm landing page for developers discovering `@wix/interact` on npmjs.org.

## What NOT to Repeat (covered elsewhere)

- Motion API details (`getWebAnimation`, `getScrubScene`, etc.) → Motion README
- Preset catalog listing → motion-presets README

## Proposed Section Structure (~300-350 lines)

### 1. Title + One-Liner

```markdown
# @wix/interact

Declarative, configuration-driven interaction library — web-native, AI-ready, and framework-agnostic.
```

Sourced from `package.json` description. No emoji.

### 2. Badges Row

- npm version (`@wix/interact`)
- Bundle size (bundlephobia)
- License: MIT
- npm downloads/month

### 3. Why Interact? (Value Proposition)

5-6 concise bullet points:

- **Config-driven**: Define trigger-to-effect bindings in JSON — no imperative event wiring
- **Web-native**: Built on WAAPI, ViewTimeline, and IntersectionObserver — no custom runtime
- **Three entry points**: Web Components, React, Vanilla JS — same config shape across all
- **AI-ready**: JSON configs are machine-readable — LLMs can generate and validate them
- **Preset ecosystem**: Plug in `@wix/motion-presets` for 80+ ready-made effects
- **Accessible**: Built-in `activate` (keyboard) and `interest` (focus) trigger variants

### 4. Install

```bash
npm install @wix/interact
```

Show with optional presets since it's the common path.

### 5. Quick Start — One Complete Example

**Key change from current:** Show ONE complete, working React example (most common path) with preset registration, `useEffect` lifecycle, and cleanup. Then provide compact "also available" snippets for Web Components and Vanilla (config reuse, only show the framework-specific wrapper).

React example must include:

- `import { Interact } from '@wix/interact/react'` + `Interaction` component
- `registerEffects(presets)` before `Interact.create()`
- `useEffect` + `instance.destroy()` cleanup
- `generate(config)` for FOUC prevention
- `<Interaction tagName="div" interactKey="hero" initial>`
- A `viewEnter` trigger with `namedEffect: { type: 'FadeIn' }`

Web Components and Vanilla follow as shorter blocks showing only the binding difference (not re-showing the full config).

### 6. Entry Points

Compact table:

| Import                | Use When                                               |
| --------------------- | ------------------------------------------------------ |
| `@wix/interact`       | Vanilla JS — manual element binding via `add(el, key)` |
| `@wix/interact/react` | React — `<Interaction>` component with lifecycle       |
| `@wix/interact/web`   | Web Components — `<interact-element>` custom element   |

All three export the same `Interact` class, `generate()`, types.

### 7. How It Works (Mental Model)

A mermaid diagram showing the data flow:

```
Config → Interact.create() → Trigger Observer → Effect Engine → Animation (via @wix/motion)
```

Plus a concise annotated `InteractConfig` type block (from [`src/types/config.ts`](packages/interact/src/types/config.ts)):

```typescript
type InteractConfig = {
  interactions: Interaction[];
  effects: Record<string, Effect>;
  sequences?: Record<string, SequenceConfig>;
  conditions?: Record<string, Condition>;
};
```

### 8. Triggers

Scannable table with one-line descriptions (sourced from [`src/types/triggers.ts`](packages/interact/src/types/triggers.ts)):

| Trigger        | Fires When                       | Params               |
| -------------- | -------------------------------- | -------------------- |
| `viewEnter`    | Element enters viewport          | `threshold`, `inset` |
| `viewProgress` | Element scrolls through viewport | (range on effect)    |
| `hover`        | Pointer enters element           | —                    |
| `click`        | Element is clicked               | —                    |
| `activate`     | Click + keyboard (a11y)          | —                    |
| `interest`     | Hover + focus (a11y)             | —                    |
| `pointerMove`  | Pointer moves over element/root  | `hitArea`, `axis`    |
| `animationEnd` | Another effect completes         | `effectId`           |

### 9. Effects

Brief descriptions of the four effect types (from [`src/types/effects.ts`](packages/interact/src/types/effects.ts)):

- **`keyframeEffect`** — inline keyframes (self-contained, no preset needed)
- **`namedEffect`** — registered presets from `@wix/motion-presets` (e.g., `{ type: 'FadeIn' }`)
- **`customEffect`** — programmatic `(element, progress) => void` callback
- **`transition` / `transitionProperties`** — CSS state changes with `stateAction`

### 10. Recipes (4 focused examples)

Config-only snippets (framework-agnostic `InteractConfig` objects):

1. **Entrance animation** — `viewEnter` + `namedEffect: { type: 'FloatIn', direction: 'bottom', distance: '80px' }` + `triggerType: 'once'`
2. **Click effect** — `click` + keyframes with `triggerType: 'in'` (enter) behavior
3. **Scroll-driven parallax** — `viewProgress` + `rangeStart`/`rangeEnd` with cover offsets
4. **Hover toggle** — `hover` + `stateAction: 'toggle'` + CSS transition
5. **Mouse aniamtion** - `pointerMove` + customEffect

Each shows a valid, complete `InteractConfig` (with `interactions` + `effects`).

### 11. Common Pitfalls

Surface the top constraints from [`rules/full-lean.md`](packages/interact/rules/full-lean.md):

- `overflow: hidden` on scroll-tracked ancestors breaks `viewProgress` — use `overflow: clip`
- Same element as source + target with `viewEnter` must use `triggerType: 'once'`
- Hit-area transforms on hover/pointerMove can cause jitter — animate a child via `selector`
- `registerEffects()` must be called before `Interact.create()` when using `namedEffect`
- FOUC prevention requires **both** `generate(config)` and `initial` on elements
- `<interact-element>` must have exactly one child element (library targets `.firstElementChild`)

### 12. AI and Agent Support

This is the **key differentiator** section — expanded and prominent:

- **Why configs are AI-friendly**: JSON-serializable, schema-typed, validate-able — no imperative DOM logic
- **Rules files** (shipped with the package in `rules/`):
  - [`full-lean.md`](packages/interact/rules/full-lean.md) — complete config spec + constraints
  - [`integration.md`](packages/interact/rules/integration.md) — entry points + lifecycle patterns
  - Per-trigger: [`viewenter.md`](packages/interact/rules/viewenter.md), [`click.md`](packages/interact/rules/click.md), [`hover.md`](packages/interact/rules/hover.md), [`viewprogress.md`](packages/interact/rules/viewprogress.md), [`pointermove.md`](packages/interact/rules/pointermove.md)
- **Generation constraints** (5 bullet "do not" list):
  - Do not invent `namedEffect` types — use only registered presets
  - Do not manually attach DOM event listeners — use triggers
  - Do not use `overflow: hidden` on scroll-tracked ancestors
  - Always include `generate()` + `initial` for entrance animations (FOUC)
  - Always call `registerEffects` before `Interact.create()`

### 13. Browser Support

Keep concise:

- Modern browsers with Web Animations API support (Baseline)
- `adoptedStyleSheets` (for `transition`/`transitionProperties`): Chrome 73+, Firefox 101+, Safari 16.4+, Edge 79+
- ViewTimeline: Chrome 115+; polyfilled via `fizban` for other browsers

### 14. Related Packages

- `@wix/motion` — low-level animation engine underneath Interact
- `@wix/motion-presets` — ready-made effect catalog (entrance, scroll, hover, pointer)
- `fizban` — scroll-driven animation polyfill (bundled as dependency)
- `kuliso` — pointer-driven animation polyfill (bundled as dependency)

### 15. Documentation

Links to the [`docs/`](packages/interact/docs/) directory shipped with the package:

- [**Getting Started**](docs/guides/getting-started.md)
- [**API Reference**](docs/api/README.md) — `Interact` class, `InteractionController`, standalone functions, types
- [**Guides**](docs/guides/README.md) — triggers, effects, configuration structure, state management, conditions
- [**Examples**](docs/examples/README.md) — entrance animations, click interactions, hover effects, list patterns
- [**React Integration**](docs/integration/react.md)
- [**Web Components**](docs/guides/custom-elements.md)
- [**Full Documentation Index**](docs/README.md)

### 16. License

MIT

## Key Decisions

- **No emojis in headers** — per spec research, top-tier libraries avoid them
- **React-first quick start** — it's the most common integration path; others are shown compactly
- **Config-only recipes** — framework-agnostic, reusable across all three entry points
- **Pitfalls section** — surfaces the most impactful constraints agents/developers hit; links to rules for detail
- **AI section is prominent** — this is Interact's unique differentiator over GSAP/Motion/etc.
- **No full API reference inline** — link to docs site; the README is a menu, not the meal
- **Presets shown in main flow** — `@wix/motion-presets` is installed alongside from the start (most common real-world usage)

## Key Sources for Accurate Examples

- [`packages/interact/rules/integration.md`](packages/interact/rules/integration.md) — entry point patterns, React lifecycle, FOUC
- [`packages/interact/rules/full-lean.md`](packages/interact/rules/full-lean.md) — complete config spec, pitfalls, constraints
- [`packages/interact/src/types/config.ts`](packages/interact/src/types/config.ts) — `InteractConfig` type
- [`packages/interact/src/types/triggers.ts`](packages/interact/src/types/triggers.ts) — `TriggerType` union
- [`packages/interact/src/types/effects.ts`](packages/interact/src/types/effects.ts) — effect type discriminants
- [`packages/interact/src/index.ts`](packages/interact/src/index.ts) — runtime exports (`Interact`, `add`, `remove`, `generate`)

## Style

- Clean markdown, no HTML beyond badges
- TypeScript for all code examples
- Every config example must be a valid `InteractConfig` shape (with both `interactions` and `effects`)
- No comments explaining what the code does — only non-obvious constraints
