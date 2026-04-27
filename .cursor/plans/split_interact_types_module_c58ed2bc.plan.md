---
name: Split interact types module
overview: Split the monolithic `types.ts` in `@wix/interact` into concern-based modules under a new `types/` directory, with an internal barrel (all types) and an external barrel (public API types only).
todos:
  - id: create-triggers
    content: Create `types/triggers.ts` with trigger-related types and the `RangeOffset` re-export
    status: completed
  - id: create-effects
    content: Create `types/effects.ts` with effect shapes, animation options, and `@wix/motion` imports
    status: completed
  - id: create-config
    content: Create `types/config.ts` with config, sequence, condition, and interaction types
    status: completed
  - id: create-controller
    content: Create `types/controller.ts` with `IInteractionController` and `IInteractElement`
    status: completed
  - id: create-handlers
    content: Create `types/handlers.ts` with handler module interfaces, state types, and `InteractOptions`
    status: completed
  - id: create-internal
    content: Create `types/internal.ts` with `InteractCache` and `CreateTransitionCSSParams`
    status: completed
  - id: create-global
    content: Create `types/global.ts` with the JSX global augmentation
    status: completed
  - id: create-internal-barrel
    content: Create `types/index.ts` (internal barrel) re-exporting everything
    status: completed
  - id: create-external-barrel
    content: Create `types/external.ts` (external barrel) with explicit public API re-exports
    status: completed
  - id: update-entry-points
    content: Update `src/index.ts`, `src/react/index.ts`, `src/web/index.ts` to use `types/external`
    status: completed
  - id: delete-old-types
    content: Delete the original `src/types.ts` file
    status: completed
  - id: verify-build
    content: Run build and tests to verify nothing is broken
    status: completed
isProject: false
---

# Split `@wix/interact` Types Module by Concern

## Current State

All 50+ types live in a single [types.ts](packages/interact/src/types.ts) file. Three public entry points (`src/index.ts`, `src/react/index.ts`, `src/web/index.ts`) blindly re-export everything via `export * from './types'`, making internal implementation types part of the public API.

## Proposed Directory Structure

Replace `packages/interact/src/types.ts` with a `types/` directory:

```
packages/interact/src/types/
  triggers.ts      -- trigger kinds, params, and related union types
  effects.ts       -- effect definitions, animation options
  config.ts        -- top-level config, sequences, conditions, interactions
  controller.ts    -- IInteractionController, IInteractElement interfaces
  handlers.ts      -- handler module interfaces, handler state types
  internal.ts      -- cache, CSS generation params, and other implementation-only types
  global.ts        -- JSX global augmentation (declare global)
  index.ts         -- internal barrel: re-exports everything from all submodules
  external.ts      -- external barrel: re-exports only public API types
```

## Module Breakdown

### `triggers.ts` -- Trigger definitions and parameters

Types: `TriggerType`, `PointerMoveAxis`, `EventTriggerKind`, `EventTriggerConfigToggle`, `EventTriggerConfigEnterLeave`, `EventTriggerConfig`, `ViewEnterType`, `TransitionMethod`, `StateParams`, `PointerTriggerParams`, `EventTriggerParams`, `ViewEnterParams`, `PointerMoveParams`, `AnimationEndParams`, `TriggerParams`

Re-exports `RangeOffset` from `@wix/motion` (used by effects but originates here as the only direct `@wix/motion` re-export).

### `effects.ts` -- Effect shapes and animation options

Types: `Fill` (unexported), `MotionKeyframeEffect` (unexported), `EffectEffectProperty` (unexported), `TimeEffect`, `ScrubEffect`, `TransitionOptions`, `StyleProperty`, `TransitionProperty`, `TransitionEffect`, `EffectBase`, `EffectRef`, `Effect`, `AnimationOptions`

Imports `NamedEffect`, `RangeOffset`, `ScrubTransitionEasing`, `MotionAnimationOptions` from `@wix/motion`.

### `config.ts` -- Top-level configuration types

Types: `Condition`, `SequenceOptionsConfig`, `SequenceConfig`, `SequenceConfigRef`, `InteractionTrigger`, `Interaction`, `InteractConfig`

Imports trigger and effect types from sibling modules.

### `controller.ts` -- Controller and element interfaces

Types: `IInteractionController`, `IInteractElement`

Note: `IInteractionController` is referenced by the public `InteractOptions` type, so it must also be exported externally.

### `handlers.ts` -- Handler module and state types (internal)

Types: `InteractionParamsTypes`, `InteractionHandlerModule`, `ViewEnterHandlerModule`, `TriggerHandlerMap`, `HandlerObject`, `HandlerObjectMap`, `InteractOptions`

Note: `InteractOptions` is used in the handler signatures but is also relevant to library consumers (passed to `add()`). It will be exported externally as well.

### `internal.ts` -- Implementation-only types

Types: `InteractCache`, `CreateTransitionCSSParams`

These are never needed by library users.

### `global.ts` -- JSX global augmentation

Contains the `declare global` block for `JSX.IntrinsicElements['interact-element']`. Kept separate since it's a side-effect augmentation, not a named export.

## Internal Barrel: `types/index.ts`

Re-exports everything from all submodules:

```typescript
export * from './triggers';
export * from './effects';
export * from './config';
export * from './controller';
export * from './handlers';
export * from './internal';
import './global';
```

All internal source files (`core/`, `handlers/`, `web/`, `utils.ts`) will import from `../types` (resolves to `types/index.ts`), getting access to every type. No import paths inside the package need to change since `../types` still resolves correctly.

## External Barrel: `types/external.ts`

Explicitly re-exports only the types that form the public API. Organized by section with comments for documentation tooling:

```typescript
// Triggers
export type { TriggerType, PointerMoveAxis, ViewEnterType, TransitionMethod, ... } from './triggers';
export type { RangeOffset } from './triggers';

// Effects
export type { TimeEffect, ScrubEffect, Effect, EffectBase, EffectRef, ... } from './effects';

// Config
export type { InteractConfig, Interaction, InteractionTrigger, Condition, ... } from './config';

// Controller
export type { IInteractionController, IInteractElement } from './controller';

// Options
export type { InteractOptions } from './handlers';
```

**Excluded from external:** `InteractCache`, `CreateTransitionCSSParams`, `InteractionHandlerModule`, `ViewEnterHandlerModule`, `TriggerHandlerMap`, `HandlerObject`, `HandlerObjectMap`, `InteractionParamsTypes`, and the non-exported internal types (`Fill`, `MotionKeyframeEffect`, `EffectEffectProperty`).

## Entry Point Changes

Update the three public entry points to use the external barrel instead of the internal one:

- [src/index.ts](packages/interact/src/index.ts): `export * from './types'` becomes `export * from './types/external'`
- [src/react/index.ts](packages/interact/src/react/index.ts): `export * from '../types'` becomes `export * from '../types/external'`
- [src/web/index.ts](packages/interact/src/web/index.ts): `export * from '../types'` becomes `export * from '../types/external'`

## Import Path Impact

Internal imports like `import type { Effect } from '../types'` will continue to work unchanged because `../types` resolves to the `types/` directory's `index.ts`. No internal import paths need updating.

## Verification

- Build the project (`nvm use && yarn build`) and confirm no type errors
- Run tests (`yarn test`) to ensure nothing breaks
- Verify that the `dist/types/` output matches expectations (external barrel controls the public `.d.ts` surface)
