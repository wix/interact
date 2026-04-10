---
name: Sequences Feature Tests
overview: Create comprehensive test suites for the Sequences feature across both `@wix/motion` and `@wix/interact` packages, covering the Sequence class, getSequence function, AnimationGroup.applyOffset, config parsing, add/remove flows, listContainer interactions, and sequence caching.
todos:
  - id: skeleton-motion
    content: 'Create test file skeletons with describe/test titles for motion package: Sequence.spec.ts, applyOffset tests in AnimationGroup.spec.ts, getSequence.spec.ts'
    status: completed
  - id: skeleton-interact
    content: 'Create test file skeleton with describe/test titles for interact package: sequences.spec.ts (suites A-G)'
    status: completed
  - id: impl-sequence-class
    content: 'Implement Sequence.spec.ts tests: constructor, offset calculation, applyOffsets, inherited playback API, onFinish'
    status: completed
  - id: impl-apply-offset
    content: Implement applyOffset() tests in AnimationGroup.spec.ts
    status: completed
  - id: impl-get-sequence
    content: 'Implement getSequence.spec.ts tests: AnimationGroupArgs[] flow, options forwarding, edge cases'
    status: completed
  - id: impl-interact-config
    content: 'Implement sequences.spec.ts Suite A: config parsing tests'
    status: completed
  - id: impl-interact-source
    content: 'Implement sequences.spec.ts Suite B: sequence processing from source element via add()'
    status: completed
  - id: impl-interact-target
    content: 'Implement sequences.spec.ts Suite C: cross-element sequence processing via addEffectsForTarget'
    status: completed
  - id: impl-interact-list
    content: 'Implement sequences.spec.ts Suite D: sequence with listContainer -- add, addListItems, remove flows'
    status: completed
  - id: impl-interact-cleanup
    content: 'Implement sequences.spec.ts Suite E: removal and cleanup tests'
    status: completed
  - id: impl-interact-cache
    content: 'Implement sequences.spec.ts Suite F: Interact.getSequence caching tests'
    status: completed
  - id: impl-interact-mql
    content: 'Implement sequences.spec.ts Suite G: media query condition tests on sequences'
    status: completed
isProject: false
---

# Sequences Feature Test Plan

## Phase 1: Motion Package Tests

### 1.1 Create `packages/motion/test/Sequence.spec.ts`

Unit tests for the `Sequence` class in `[packages/motion/src/Sequence.ts](packages/motion/src/Sequence.ts)`. Follow the same `createMockAnimation` pattern from `[packages/motion/test/AnimationGroup.spec.ts](packages/motion/test/AnimationGroup.spec.ts)`.

**Test suites:**

- **Constructor**
  - creates Sequence with empty groups array
  - creates Sequence from multiple AnimationGroups
  - flattens all child animations into parent `animations` array
  - stores `animationGroups` reference
  - defaults: delay=0, offset=0, offsetEasing=linear
  - accepts custom delay, offset, and offsetEasing function
  - resolves named offsetEasing string (e.g. `'quadIn'`) via `getJsEasing`
  - resolves cubic-bezier offsetEasing string
  - falls back to linear for invalid/unknown offsetEasing string
- **Offset calculation (calculateOffsets)**
  - single group returns [0]
  - linear easing with 5 groups and offset=200 produces [0, 200, 400, 600, 800]
  - quadIn easing with 5 groups and offset=200 produces [0, 50, 200, 450, 800] (spec example)
  - sineOut easing produces expected non-linear offsets
  - floors fractional offsets via `| 0`
- **applyOffsets (via ready promise)**
  - applies delay + calculated offset to each group via `group.applyOffset()`
  - skips `applyOffset` when additionalDelay is 0
  - waits for all group ready promises before applying offsets
- **Inherited playback API (from AnimationGroup)**
  - `play()` plays all flattened animations
  - `pause()` pauses all flattened animations
  - `reverse()` reverses all flattened animations
  - `cancel()` cancels all flattened animations
  - `setPlaybackRate()` sets rate on all flattened animations
  - `playState` returns from first animation
- **onFinish (overridden)**
  - calls callback when all animation groups finish
  - does not call callback if any group's `finished` rejects
  - logs warning on interrupted animation
  - handles empty groups array

### 1.2 Add `applyOffset` tests to `packages/motion/test/AnimationGroup.spec.ts`

Add a new `describe('applyOffset()')` section:

- adds offset to each animation's effect delay via `updateTiming`
- accumulates with existing delay
- skips animations with no effect
- handles empty animations array

### 1.3 Create `packages/motion/test/getSequence.spec.ts`

Tests for the `getSequence()` function in `[packages/motion/src/motion.ts](packages/motion/src/motion.ts)`. Must mock `getAnimation` / `getWebAnimation` as done in `[packages/motion/test/motion.spec.ts](packages/motion/test/motion.spec.ts)`.

**Test suites:**

- **AnimationGroupArgs[] flow**
  - creates Sequence with one AnimationGroup per resolved target element
  - handles a single entry with HTMLElement target
  - handles a single entry with HTMLElement[] target (each element becomes its own group)
  - handles a single entry with string selector target via `querySelectorAll`
  - handles a single entry with null target (passed through to getAnimation)
  - creates Sequence with one group per entry
  - each entry independently resolves its target
- **Options forwarding**
  - passes SequenceOptions (delay, offset, offsetEasing) to Sequence constructor
  - passes context.reducedMotion to getAnimation
- **Edge cases**
  - skips entries where getAnimation returns non-AnimationGroup
  - returns Sequence with empty groups when all entries fail

## Phase 2: Interact Package Tests

### 2.1 Create `packages/interact/test/sequences.spec.ts`

Integration tests for sequence handling in the interact package. Follow the mock patterns from `[packages/interact/test/web.spec.ts](packages/interact/test/web.spec.ts)` with the `@wix/motion` mock, but also mock `getSequence` to return a mock Sequence object.

The `@wix/motion` mock needs to be extended to include:

```typescript
getSequence: vi.fn().mockReturnValue({
  play: vi.fn(), cancel: vi.fn(), onFinish: vi.fn(),
  pause: vi.fn(), reverse: vi.fn(), progress: vi.fn(),
  persist: vi.fn(), isCSS: false, playState: 'idle',
  ready: Promise.resolve(), animations: [], animationGroups: [],
}),
```

**Suite A: Config parsing (parseConfig via Interact.create)**

- parses inline sequence on interaction with `effects` array
- parses `sequenceId` reference from `config.sequences`
- merges inline overrides onto referenced sequence
- auto-generates sequenceId when not provided
- warns when referencing unknown sequenceId
- caches sequences in `dataCache.sequences`
- stores sequence effects in `interactions[target].sequences` for cross-element targets
- does not create cross-element entry when sequence effect targets same key as source (only `_processSequences` handles it)
- handles interaction with sequences but no effects (effects array is omitted/empty)

**Suite B: Sequence processing via `add()` -- source element**

- creates Sequence when source element is added with viewEnter trigger
- creates Sequence when source element is added with click trigger
- passes correct AnimationGroupArgs built from effect definitions
- resolves effectId references from config.effects
- skips sequence when target controller is not yet registered
- does not duplicate sequence on re-add (caching via `addedInteractions`)
- passes pre-created Sequence as `animation` option to trigger handler
- passes selectorCondition to handler options
- silently skips unresolved sequenceId reference at runtime (`_processSequences` returns early)
- skips entire sequence when any effect target element is missing (`_buildAnimationGroupArgsFromSequence` returns null)

**Suite C: Sequence processing via `addEffectsForTarget()` -- cross-element**

- creates Sequence when target element is added after source
- creates Sequence when source element is added after target
- handles sequences where effects target different keys
- skips variation when interaction-level MQL does not match and falls through to next variation
- skips when source controller is not yet registered
- `addEffectsForTarget` returns true when sequences exist even without effects

**Suite D: Sequence with listContainer**

- creates Sequence for each list item when source has listContainer
- creates new Sequence per `addListItems` call with unique cache key (each call uses `${cacheKey}::${generateId()}`)
- handles removing list items (via `removeListItems`) and subsequent re-add
- processes sequence effects from listContainer elements
- does not create duplicate sequence when list items overlap with existing
- skips sequence when listElements provided but no effects matched the listContainer (`usedListElements` guard)
- cross-element target: creates new Sequence per `addListItems` call for target sequences

**Suite E: Sequence removal and cleanup**

- `remove()` cleans up sequence cache entries for the removed key
- `Interact.destroy()` clears sequenceCache
- `deleteController()` removes sequence-related `addedInteractions` entries
- `clearInteractionStateForKey` removes sequenceCache entries by key prefix (`${key}::seq::`)

**Suite F: Interact.getSequence caching**

- returns cached Sequence for same cacheKey
- creates new Sequence for different cacheKey
- passes sequenceOptions and animationGroupArgs to motion's `getSequence`

**Suite G: Media query conditions on sequences**

- skips sequence when sequence-level condition does not match
- skips individual effect within sequence when effect-level condition does not match
- sets up media query listener for sequence conditions
- sets up media query listener for effect-level conditions within sequence

## Phase 3: Implementation Approach

Each phase above will be implemented in order:

1. First create all spec files with `describe`/`test` **skeletons only** (titles, no bodies)
2. Implement motion package tests (Sequence.spec.ts, applyOffset in AnimationGroup.spec.ts, getSequence.spec.ts)
3. Implement interact package sequence tests (sequences.spec.ts) suite by suite

### Key mock patterns to reuse

- `createMockAnimation()` from `AnimationGroup.spec.ts` for motion tests
- `vi.mock('@wix/motion', ...)` from `web.spec.ts` for interact tests, extended with `getSequence`
- `InteractionController` + `add()` helper for interact element setup
- `addListItems` import for list container tests
