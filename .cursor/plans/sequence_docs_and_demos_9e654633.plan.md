---
name: Sequence docs and demos
overview: Add documentation for the new Sequence/staggering feature to both the motion and interact docs, and create interactive demo components showcasing sequences with various triggers, easing functions, and configuration patterns.
todos:
  - id: motion-api-sequence
    content: Create packages/motion/docs/api/sequence.md -- Sequence class API reference (constructor, addGroups, removeGroups, onFinish, offset calculation, inherited playback)
    status: completed
  - id: motion-api-get-sequence
    content: Create packages/motion/docs/api/get-sequence.md -- getSequence() and createAnimationGroups() function reference
    status: completed
  - id: motion-docs-updates
    content: 'Update motion docs: api/README.md index (add Sequence + getSequence entries), api/types.md (SequenceOptions, AnimationGroupArgs, IndexedGroup), core-concepts.md (Sequences & Staggering section)'
    status: completed
  - id: interact-guide-sequences
    content: Create packages/interact/docs/guides/sequences.md -- comprehensive sequences guide covering config, cross-element, listContainer, removal, conditions
    status: completed
  - id: interact-docs-updates
    content: 'Update interact docs: api/types.md (SequenceOptionsConfig, SequenceConfig, SequenceConfigRef, InteractConfig.sequences, Interaction.sequences, InteractCache.sequences), api/interact-class.md (getSequence, addToSequence, removeFromSequences, sequenceCache, elementSequenceMap), guides/README.md, examples/README.md, examples/list-patterns.md'
    status: completed
  - id: demo-sequence-playground
    content: Create SequencePlayground.tsx in both web/ and react/ -- interactive stagger controls
    status: completed
  - id: demo-sequence-entrance
    content: Create SequenceEntranceDemo.tsx in both web/ and react/ -- viewEnter staggered list
    status: completed
  - id: demo-sequence-click
    content: Create SequenceClickDemo.tsx in both web/ and react/ -- click-triggered multi-element sequence
    status: completed
  - id: demo-sequence-easing
    content: Create SequenceEasingComparison.tsx in both web/ and react/ -- side-by-side easing comparison
    status: completed
  - id: demo-app-integration
    content: Update App.tsx (web + react) and styles.css to include new sequence demos
    status: completed
isProject: false
---

# Sequence Feature Documentation and Demos

## Part 1: Motion Package Docs (`packages/motion/docs/`)

### 1.1 New file: `api/sequence.md`

API reference for the `Sequence` class, mirroring the style of [animation-group.md](packages/motion/docs/api/animation-group.md). Contents:

- **Overview** -- Sequence extends AnimationGroup to coordinate multiple AnimationGroups with staggered delays
- **Class definition** -- constructor signature and properties:

```typescript
constructor(animationGroups: AnimationGroup[], options?: SequenceOptions)
```

| Property          | Type                    | Default | Description                                         |
| ----------------- | ----------------------- | ------- | --------------------------------------------------- |
| `animationGroups` | `AnimationGroup[]`      |         | Child groups managed by this Sequence               |
| `delay`           | `number`                | `0`     | Base delay applied to all groups                    |
| `offset`          | `number`                | `0`     | Stagger offset (ms) between consecutive groups      |
| `offsetEasing`    | `(p: number) => number` | linear  | Easing function for stagger distribution            |
| `animations`      | `Animation[]`           |         | Flattened array of all child animations (inherited) |
| `ready`           | `Promise<void>`         |         | Resolves when all offsets have been applied         |
| `isCSS`           | `boolean`               | `false` | Whether animations use CSS mode (inherited)         |

- `**addGroups(entries: IndexedGroup[])**` -- inserts new groups at specified indices, recalculates offsets via `applyOffsets()`, and resets `ready`. Each `IndexedGroup` has `{ index: number, group: AnimationGroup }`.
- `**removeGroups(predicate: (group: AnimationGroup) => boolean): AnimationGroup[]**` -- removes groups matching the predicate, cancels their animations, recalculates offsets for remaining groups, resets `ready`, and returns the removed groups. Used when list items are dynamically removed.
- `**onFinish(callback: () => void): Promise<void>**` -- overrides AnimationGroup's `onFinish` to await all child group `finished` promises before invoking the callback. Logs a warning for interrupted animations.
- **Offset calculation** -- the formula `easing(i / last) * last * offset | 0` with examples for linear, quadIn, sineOut (from the spec). Single-group sequences always return `[0]`.
- **Inherited playback API** from AnimationGroup: `play()`, `pause()`, `reverse()`, `cancel()`, `progress(p)`, `setPlaybackRate(rate)`, `getProgress()`, `getTimingOptions()`; getters: `playState`, `finished`
- **Usage examples** -- creating a Sequence manually, controlling playback, using `addGroups`/`removeGroups`, using different easing functions

### 1.2 New file: `api/get-sequence.md`

API reference for the `getSequence()` and `createAnimationGroups()` functions (in `packages/motion/src/motion.ts`). Contents:

- `**getSequence` signature:\*\*

```typescript
function getSequence(
  options: SequenceOptions,
  animationGroups: AnimationGroupArgs[],
  context?: Record<string, any>,
): Sequence;
```

Each `AnimationGroupArgs` entry is resolved into one or more `AnimationGroup` instances. If a target resolves to multiple elements (e.g. `HTMLElement[]` or a CSS selector string), each element becomes a separate group in the Sequence.

- `**createAnimationGroups` signature:\*\*

```typescript
function createAnimationGroups(
  animationGroupArgs: AnimationGroupArgs[],
  context?: Record<string, any>,
): AnimationGroup[];
```

Builds `AnimationGroup[]` from args without wrapping in a Sequence. Used internally by `getSequence` and by `Interact.addToSequence()` when adding groups to an existing Sequence.

- `**AnimationGroupArgs` type:\*\*

```typescript
type AnimationGroupArgs = {
  target: HTMLElement | HTMLElement[] | string | null;
  options: AnimationOptions;
  context?: Record<string, any>;
};
```

- **Examples** -- creating a staggered entrance for a list of elements, using different offset easings, building groups independently with `createAnimationGroups`

### 1.3 Update `api/README.md`

Add entries to the API index under "Core Functions":

- `### [Sequence](sequence.md)` -- Coordinates multiple AnimationGroups with staggered delay offsets
- `### [Sequence Creation](get-sequence.md)` -- `getSequence()` and `createAnimationGroups()` factory functions

Add to "Quick Reference" section:

```typescript
// Sequence creation
const sequence = getSequence(
  { offset: 200, offsetEasing: 'quadIn' },
  items.map((el) => ({ target: el, options: { name: 'FadeIn' } })),
);
sequence.play();
```

Add to "Types Overview": `SequenceOptions`, `AnimationGroupArgs`, `IndexedGroup`

### 1.4 Update `api/types.md`

Add new section `## Sequence Types` with:

```typescript
type SequenceOptions = {
  delay?: number;
  offset?: number;
  offsetEasing?: string | ((p: number) => number);
};

type AnimationGroupArgs = {
  target: HTMLElement | HTMLElement[] | string | null;
  options: AnimationOptions;
  context?: Record<string, any>;
};

type IndexedGroup = {
  index: number;
  group: AnimationGroup;
};
```

Include property descriptions and usage examples for each type.

### 1.5 Update `core-concepts.md`

Add a "Sequences & Staggering" section under "Advanced Concepts" explaining:

- **Concept** -- Sequences coordinate multiple AnimationGroups as a single timeline with easing-driven stagger delays
- **Offset model** -- how `offset` distributes delay across groups using the formula `easing(i / last) * last * offset | 0`
- **Easing curves** -- visual explanation of how `linear`, `quadIn`, `sineOut`, and custom `cubic-bezier` affect stagger timing (quadIn = slow start then rapid, sineOut = fast start then gradual)
- **Dynamic groups** -- `addGroups` for adding elements (e.g. new list items) and `removeGroups` for cleanup when elements are removed, both triggering automatic offset recalculation
- **Relationship to AnimationGroup** -- Sequence inherits all playback controls; child groups are stored in `animationGroups` while `animations` contains the flattened array

---

## Part 2: Interact Package Docs (`packages/interact/docs/`)

### 2.1 New file: `guides/sequences.md`

Comprehensive guide for using sequences in Interact configs. Contents:

- **What is a Sequence** -- a list of Effects managed as a coordinated timeline with staggered delays, built on top of the Motion `Sequence` class
- **Config structure** -- two levels of sequence definition:
  - `InteractConfig.sequences` -- reusable named sequences (keyed map, resolved by `sequenceId`)
  - `Interaction.sequences` -- per-interaction sequence list (inline `SequenceConfig` or `SequenceConfigRef` references)
  - An interaction can have both `effects` and `sequences`, or either alone
- **SequenceConfig** -- inline sequence definition:

```typescript
type SequenceConfig = SequenceOptionsConfig & {
  effects: (Effect | EffectRef)[];
};
```

- **SequenceConfigRef** -- referencing a reusable sequence by ID with optional inline overrides:

```typescript
type SequenceConfigRef = {
  sequenceId: string;
  delay?: number;
  offset?: number;
  offsetEasing?: string | ((p: number) => number);
  conditions?: string[];
};
```

- **SequenceOptionsConfig** -- shared options (includes `conditions` for media-query gating):

```typescript
type SequenceOptionsConfig = {
  delay?: number;
  offset?: number;
  offsetEasing?: string | ((p: number) => number);
  sequenceId?: string;
  conditions?: string[];
};
```

- **Offset and easing** -- how offset distributes delay across effects, easing curves (linear, quadIn, sineOut), visual formula `easing(i / last) * last * offset | 0`
- **Cross-element sequences** -- effects targeting different `key` values within a single sequence, resolved at add-time via `_processSequencesForTarget`. When a sequence effect targets a different key than the source interaction, Interact waits for both elements to be registered before creating the Sequence.
- **Sequences with listContainer** -- staggering list items:
  - Initial `add()` creates the Sequence with all existing list items
  - `addListItems()` calls `Interact.addToSequence()` with `IndexedGroup` entries at the correct indices, triggering offset recalculation
  - `removeListItems()` calls `Interact.removeFromSequences()` which uses the `elementSequenceMap` WeakMap for O(1) lookup and calls `sequence.removeGroups()` with a predicate matching the removed element's animations
  - Each `addListItems` call uses a unique cache key (`${cacheKey}::${generateId()}`) for its Sequence
- **Element removal and cleanup** -- how `Interact.removeFromSequences(elements)` uses `elementSequenceMap` (a `WeakMap<HTMLElement, Set<Sequence>>`) for efficient element-to-sequence lookup, calls `removeGroups` on each associated Sequence, and deletes the element from the map. Called automatically from `removeListItems`.
- **Conditions on sequences** -- sequence-level `conditions` array gates the entire sequence; individual effect-level conditions within `effects` can gate specific effects. Both set up `matchMedia` listeners for dynamic add/remove.
- **Sequence caching** -- `Interact.sequenceCache` (`Map<string, Sequence>`) prevents duplicate Sequences for the same interaction/key combination. `Interact.destroy()` and `clearInteractionStateForKey()` clean up cache entries.
- **Examples** -- staggered card grid entrance (viewEnter + listContainer), multi-element orchestration (cross-key sequence), click-triggered alternate sequence, sequence with media-query conditions

### 2.2 Update `api/types.md`

Add new section `## Sequence Types` with type definitions:

- `SequenceOptionsConfig` -- with all properties including `conditions?: string[]`
- `SequenceConfig` -- `SequenceOptionsConfig & { effects: (Effect | EffectRef)[] }`
- `SequenceConfigRef` -- reference type with `sequenceId` and optional overrides + `conditions`
- Updated `InteractConfig` showing `sequences?: Record<string, SequenceConfig>`
- Updated `Interaction` showing `sequences?: (SequenceConfig | SequenceConfigRef)[]` with note on mutual exclusivity branches (effects-only, sequences-only, or both)
- Updated `InteractCache` showing `sequences: { [sequenceId: string]: SequenceConfig }` and `interactions[path].sequences: Record<string, (InteractionTrigger & { sequence: SequenceConfig })[]>`

### 2.3 Update `api/interact-class.md`

Add new static methods and properties under "Static Methods":

- `**Interact.getSequence(cacheKey, sequenceOptions, animationGroupArgs, context?)`\*\*
  - Parameters: `cacheKey: string`, `sequenceOptions: SequenceOptions`, `animationGroupArgs: AnimationGroupArgs[]`, `context?: { reducedMotion?: boolean }`
  - Returns: `Sequence`
  - Details: Returns cached Sequence if one exists for `cacheKey`, otherwise creates via `getSequence()` from `@wix/motion`, caches it, and registers target elements in `elementSequenceMap`
- `**Interact.addToSequence(cacheKey, animationGroupArgs, indices, context?)**`
  - Parameters: `cacheKey: string`, `animationGroupArgs: AnimationGroupArgs[]`, `indices: number[]`, `context?: { reducedMotion?: boolean }`
  - Returns: `boolean` (false if no cached Sequence found for `cacheKey`)
  - Details: Builds new `AnimationGroup` instances via `createAnimationGroups()`, maps them to `IndexedGroup[]` using `indices`, calls `cached.addGroups(entries)`, and registers new elements in `elementSequenceMap`
- `**Interact.removeFromSequences(elements)**`
  - Parameters: `elements: HTMLElement[]`
  - Returns: `void`
  - Details: For each element, looks up associated Sequences via `elementSequenceMap`, calls `sequence.removeGroups()` with a predicate matching animations targeting that element, and deletes the element from the map
- `**Interact.sequenceCache**` -- `Map<string, Sequence>` static property, cleared on `destroy()`
- `**Interact.elementSequenceMap**` -- `WeakMap<HTMLElement, Set<Sequence>>` static property, reset on `destroy()`. Provides O(1) element-to-Sequence lookup for efficient removal.

### 2.4 Update `guides/README.md`

Add entry under guide list:

- `### 🎼 Sequences & Staggering` -- Coordinate multiple effects with staggered timing, offset easing, and dynamic list management. Link to `guides/sequences.md`.

### 2.5 Update `examples/README.md` and `examples/list-patterns.md`

`**examples/README.md`:\*\*

- Add "Sequence Animations" category under "Example Categories" with sub-items: Staggered List Entrance, Cross-Element Orchestration, Click-Triggered Sequence, Easing Comparison
- Update "Advanced Patterns > Animation Sequences" to reference the new `sequences` config syntax as the preferred approach

`**examples/list-patterns.md`:\*\*

- Add new section `## Sequence-Based Staggering` with examples showing:
  - Staggered list entrance using `Interaction.sequences` with `listContainer`
  - Dynamic list items with `addListItems` triggering `addToSequence`
  - Different `offsetEasing` values (linear vs quadIn vs sineOut) for list stagger
  - Sequence with removal: how removing list items automatically cleans up via `removeFromSequences`

---

## Part 3: Demo App (`apps/demo/`)

Create demo components in both `src/web/components/` and `src/react/components/` (following the existing mirror pattern). Each demo uses the `useInteractInstance` hook and the existing panel/control UI patterns.

### 3.1 `SequencePlayground.tsx` -- Interactive Stagger Controls

An interactive demo (like the existing `Playground.tsx`) where the user can tune sequence parameters in real time:

- **Controls**: offset (0-500ms slider), offsetEasing (dropdown: linear, quadIn, quadOut, sineOut, cubic-bezier), delay (0-500ms), duration per effect, trigger type (viewEnter, click)
- **Preview**: a grid of 6-8 cards, each as an effect in a sequence, using `keyframeEffect` (e.g. fade+slide-up)
- **Config display**: shows the live `InteractConfig` JSON being used
- Uses `Interaction.sequences` with inline sequence definition

### 3.2 `SequenceEntranceDemo.tsx` -- ViewEnter Staggered List

A scroll-triggered staggered entrance showcasing the most common use case:

- A list of cards inside a `listContainer`, entering the viewport with staggered `viewEnter` trigger
- Demonstrates `offset` + `offsetEasing: 'quadIn'` for natural-feeling stagger
- Showcases both inline and reusable (`sequenceId`) sequence definitions

### 3.3 `SequenceClickDemo.tsx` -- Click-Triggered Sequence

A click-triggered multi-element orchestration:

- A button triggers a sequence that animates multiple elements (heading, body text, image) in coordinated order
- Demonstrates cross-element targeting (effects with different `key` values in the sequence)
- Uses `click` trigger with `type: 'alternate'` for play/reverse

### 3.4 `SequenceEasingComparison.tsx` -- Side-by-Side Easing Curves

A visual comparison of different `offsetEasing` values:

- 3-4 rows, each showing the same set of items but with different easing (linear, quadIn, sineOut, cubicBezier)
- All triggered simultaneously on a button click or viewEnter
- Labels showing easing name and computed delay values

### 3.5 Update `App.tsx` (both web and react)

Add the new demo components to both App files, with appropriate section titles. Add a "Sequences" section header separating existing demos from the new sequence demos.

### 3.6 Update `src/styles.css`

Add styles for the new sequence demo components (card grids, easing comparison rows, sequence preview areas). Follow the existing design system (Space Grotesk/Inter fonts, dark panels, blue accent).

---

## File Summary

| Action | Path                                                          |
| ------ | ------------------------------------------------------------- |
| Create | `packages/motion/docs/api/sequence.md`                        |
| Create | `packages/motion/docs/api/get-sequence.md`                    |
| Edit   | `packages/motion/docs/api/README.md`                          |
| Edit   | `packages/motion/docs/api/types.md`                           |
| Edit   | `packages/motion/docs/core-concepts.md`                       |
| Create | `packages/interact/docs/guides/sequences.md`                  |
| Edit   | `packages/interact/docs/api/types.md`                         |
| Edit   | `packages/interact/docs/api/interact-class.md`                |
| Edit   | `packages/interact/docs/guides/README.md`                     |
| Edit   | `packages/interact/docs/examples/README.md`                   |
| Edit   | `packages/interact/docs/examples/list-patterns.md`            |
| Create | `apps/demo/src/web/components/SequencePlayground.tsx`         |
| Create | `apps/demo/src/web/components/SequenceEntranceDemo.tsx`       |
| Create | `apps/demo/src/web/components/SequenceClickDemo.tsx`          |
| Create | `apps/demo/src/web/components/SequenceEasingComparison.tsx`   |
| Create | `apps/demo/src/react/components/SequencePlayground.tsx`       |
| Create | `apps/demo/src/react/components/SequenceEntranceDemo.tsx`     |
| Create | `apps/demo/src/react/components/SequenceClickDemo.tsx`        |
| Create | `apps/demo/src/react/components/SequenceEasingComparison.tsx` |
| Edit   | `apps/demo/src/web/App.tsx`                                   |
| Edit   | `apps/demo/src/react/App.tsx`                                 |
| Edit   | `apps/demo/src/styles.css`                                    |
