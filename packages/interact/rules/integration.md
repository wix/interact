# @wix/interact Integration Rules

Rules for integrating `@wix/interact` into a webpage — binding animations and effects to user-driven triggers via declarative configuration.

## Table of Contents

- [Entry Points](#entry-points)
  - [Web (Custom Elements)](#web-custom-elements)
  - [React](#react)
  - [Vanilla JS](#vanilla-js)
- [Named Effects & registerEffects](#named-effects--registereffects)
- [Configuration Schema](#configuration-schema)
  - [InteractConfig](#interactconfig)
  - [Interaction](#interaction)
  - [Element Selection](#element-selection)
- [Triggers](#triggers)
- [Sequences](#sequences)
- [Critical CSS (FOUC Prevention)](#critical-css-fouc-prevention)
- [Static API](#static-api)

---

## Entry Points

Install with your package manager:

```bash
npm install @wix/interact @wix/motion-presets
```

### Web (Custom Elements)

```typescript
import { Interact } from '@wix/interact/web';

Interact.create(config);
```

The `config` object contains `interactions` (trigger-effect bindings), and optionally `effects`, `sequences`, and `conditions`. See [Configuration Schema](#configuration-schema) for full details.

Wrap target elements with `<interact-element>`:

```html
<interact-element data-interact-key="hero">
  <section class="hero">...</section>
</interact-element>
```

**Rules:**

- MUST set `data-interact-key` to a unique string within the page.
- MUST contain at least one child element (the library targets `.firstElementChild` by default).

### React

```typescript
import { Interact } from '@wix/interact/react';

Interact.create(config);
```

Replace target elements with `<Interaction>`:

```tsx
import { Interaction } from '@wix/interact/react';

<Interaction tagName="div" interactKey="hero" className="hero">
  ...
</Interaction>;
```

**Rules:**

- MUST set `tagName` to a valid HTML tag string for the element being replaced.
- MUST set `interactKey` to a unique string within the page.

### Vanilla JS

```typescript
import { Interact } from '@wix/interact';

const interact = Interact.create(config);
interact.add(element, 'hero');
```

**Rules:**

- Call `add(element, key)` after elements exist in the DOM.
- Call `remove(key)` to unregister all interactions for a key.

---

## Named Effects & registerEffects

Register `@wix/motion-presets` before calling `Interact.create` — required for using `namedEffect` in any effect definition:

```typescript
import { Interact } from '@wix/interact/web';
import * as presets from '@wix/motion-presets';

Interact.registerEffects(presets);
```

Or register selectively:

```typescript
import { FadeIn, ParallaxScroll } from '@wix/motion-presets';
Interact.registerEffects({ FadeIn, ParallaxScroll });
```

Then use in effects:

```typescript
{ namedEffect: { type: 'FadeIn' }, duration: 800, easing: 'ease-out' }
```

For full effect type syntax (`keyframeEffect`, `namedEffect`, `customEffect`, `transition`/`transitionProperties`), see [full-lean.md](./full-lean.md) and the trigger-specific rule files.

---

## Configuration Schema

### InteractConfig

```typescript
type InteractConfig = {
  interactions: Interaction[];
  effects?: Record<string, Effect>;
  sequences?: Record<string, SequenceConfig>;
  conditions?: Record<string, Condition>;
};
```

| Field          | Description                                                             |
| :------------- | :---------------------------------------------------------------------- |
| `interactions` | Required. Array of interaction definitions binding triggers to effects. |
| `effects?`     | Reusable effects referenced by `effectId` from interactions.            |
| `sequences?`   | Reusable sequence definitions, referenced by `sequenceId`.              |
| `conditions?`  | Named conditions (media/container/selector queries), referenced by ID.  |

Each call to `Interact.create(config)` creates a new `Interact` instance. A single config can define multiple interactions.

### Interaction

```typescript
{
  key: string;                     // REQUIRED — matches data-interact-key / interactKey
  trigger: TriggerType;            // REQUIRED — trigger type
  params?: TriggerParams;          // trigger-specific parameters
  selector?: string;               // CSS selector to refine target within the element
  listContainer?: string;          // CSS selector for a list container
  listItemSelector?: string;       // optional — CSS selector to filter which children of listContainer are selected
  conditions?: string[];           // array of condition IDs; all must pass
  effects?: Effect[];              // effects to apply
  sequences?: SequenceConfig[];    // sequences to apply
}
```

At least one of `effects` or `sequences` MUST be provided.

**Multiple effects per interaction:** A single interaction can contain multiple effects in its `effects` array. All effects share the same trigger — they fire together when the trigger activates. Use this to animate different targets from the same trigger event instead of duplicating interactions.

### Element Selection

**Most common**: Omit `selector`/`listContainer`/`listItemSelector` entirely — the element with the matching key is used as both source and target. Use `selector` to target a child element within the keyed element. Use `listContainer` for staggered sequences across list items.

`listItemSelector` is **optional** — only use it when you need to **filter** which children of `listContainer` participate (e.g. select only `.active` items). When omitted, all immediate children of the `listContainer` are selected.

#### Source element resolution (Interaction level)

The source element is what the trigger attaches to. Resolved in priority order:

1. **`listContainer` + `listItemSelector`** — matches only the elements matching `listItemSelector` within the the `listContainer`.
2. **`listContainer` only** — trigger attaches to all immediate children of the container (common case).
3. **`listContainer` + `selector`** — matches via `querySelector` within each immediate child of the container.
4. **`selector` only** — matches via `querySelectorAll` within the root element.
5. **Fallback** — first child of `<interact-element>` (web) or the root element (react/vanilla).

#### Target element resolution (Effect level)

The target element is what the effect animates. Resolved in priority order:

1. **`Effect.key`** — the root with matching `data-interact-key`.
2. **Registry Effect's `key`** — if the effect is an `EffectRef`, the `key` from the referenced registry entry is used.
3. **Fallback to `Interaction.key`** — the source element acts as the target's root.
4. After resolving the target's root, `selector`, `listContainer`, and `listItemSelector` on the effect further refine which child elements within that target are animated (same priority order as source resolution).

---

## Triggers

| Trigger        | Description                            | Trigger `params`                                                                                                               | Rules                                |
| :------------- | :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :----------------------------------- |
| `hover`        | Mouse enter/leave                      | `type?`: `'once'` \| `'alternate'` \| `'repeat'` \| `'state'` — or `method?`: `'add'` \| `'remove'` \| `'toggle'` \| `'clear'` | [hover.md](./hover.md)               |
| `click`        | Mouse click                            | Same as `hover`                                                                                                                | [click.md](./click.md)               |
| `interest`     | Accessible hover (hover + focus)       | Same as `hover`                                                                                                                | [hover.md](./hover.md)               |
| `activate`     | Accessible click (click + Enter/Space) | Same as `click`                                                                                                                | [click.md](./click.md)               |
| `viewEnter`    | Element enters viewport                | `type?`: same values as hover; `threshold?`: 0–1; `inset?`: CSS length as string for viewport inset                            | [viewenter.md](./viewenter.md)       |
| `viewProgress` | Scroll-driven (ViewTimeline)           | No trigger params. Configure `rangeStart`/`rangeEnd` on the **effect**, not on `params`.                                       | [viewprogress.md](./viewprogress.md) |
| `pointerMove`  | Mouse movement                         | `hitArea?`: `'self'` \| `'root'`; `axis?`: `'x'` \| `'y'`                                                                      | [pointermove.md](./pointermove.md)   |
| `animationEnd` | Chain after another effect             | `effectId`: ID of the preceding effect                                                                                         | —                                    |

For `hover`/`click` (and their accessible variants `interest`/`activate`): use `type` (via `PointerTriggerParams`) for keyframe/named effects, or `method` (via `StateParams`) for transition effects. Do not use both `type` and `method` together.

---

## Sequences

Sequences coordinate multiple effects with staggered timing.

```typescript
{
  offset: number,           // ms between consecutive items
  offsetEasing: string,     // Any valid easing string for stagger distribution curve
  delay: number,            // ms base delay before the sequence starts
  effects: [
    /* ... effect definitions */,
  ],
}
```

Define reusable sequences in `InteractConfig.sequences` and reference by `sequenceId`:

```typescript
{
  sequences: {
    'stagger-fade': {
      /* ... sequence definition */
    },
  },
  interactions: [
    {
      key: `'[SOURCE_KEY]'`,
      trigger: `'[TRIGGER]'`,
      params: `[TRIGGER_PARAMS]`,
      sequences: [{ sequenceId: 'stagger-fade' }],
    },
  ],
}
```

---

## Critical CSS (FOUC Prevention)

**Problem:** Elements with entrance animations (e.g. `FadeIn` on `viewEnter`) are initially visible in their final state. Before the animation framework applies the starting keyframe, the content flashes visibly — a flash of un-animated content (FOUC).

**Solution:** Two things are required — both MUST be present:

1. **Generate critical CSS** with `generate(config)` — produces CSS that hides entrance-animated elements until the animation plays.
2. **Mark elements with `initial`** — `data-interact-initial="true"` on `<interact-element>`, or `initial={true}` on `<Interaction>` in React.

Using only one of these has no effect — both are required.

See [viewenter.md](./viewenter.md) for full details.

**Rules:**

- `generate()` should be called server-side or at build time. Can also be called on the client if page content is initially hidden (e.g. behind a loader).
- Only valid for `viewEnter` + `type: 'once'` where source and target are the same element.

```javascript
import { generate } from '@wix/interact/web';
const css = generate(config);
```

**Append to `<head>` or beginning of `<body>`:**

```html
<style>
  ${css}
</style>
```

**Web:**

```html
<interact-element data-interact-key="hero" data-interact-initial="true">
  <section id="hero">...</section>
</interact-element>
```

**React:**

```tsx
<Interaction tagName="section" interactKey="hero" initial={true} className="hero">
  ...
</Interaction>
```

**Vanilla:**

```html
<section data-interact-key="hero" data-interact-initial="true" class="hero">...</section>
```

---

## Static API

Each `Interact.create(config)` call returns an instance. Keep a reference if you need to add/remove elements dynamically (vanilla JS) or to destroy a specific instance. Call `Interact.destroy()` to tear down all instances at once (e.g. on page navigation).

| Method / Property                   | Description                                                                                  |
| :---------------------------------- | :------------------------------------------------------------------------------------------- |
| `Interact.create(config)`           | Initialize with a config. Returns the instance. Multiple configs create separate instances.  |
| `Interact.registerEffects(presets)` | Register named effect presets before `create`. Required for `namedEffect` usage.             |
| `Interact.destroy()`                | Tear down all instances.                                                                     |
| `Interact.forceReducedMotion`       | `boolean` — force reduced-motion behavior regardless of OS setting. Default: `false`.        |
| `Interact.allowA11yTriggers`        | `boolean` — enable accessibility triggers (`interest`, `activate`). Default: `false`.        |
| `Interact.setup(options)`           | Configure global defaults for scroll/pointer/viewEnter trigger params. Call before `create`. |
