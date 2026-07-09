# SplitText ↔ Interact Integration — Implementation Plan

## 1. Goal & Approach

Wire `@wix/splittext` into `@wix/interact` declaratively, via a **resolver registry**:

- **Config types** for `splitText` live in `@wix/interact` (zero bundle cost when unused; full type safety).
- **Implementation** is provided by `@wix/splittext/interact` as a resolver, registered through `Interact.use('splitText', splitTextResolver)` before `Interact.create()`.
- The resolver is a **pre-processing DOM-mutation step**: it splits the target text into `<span>` wrappers _before_ Interact's normal target resolution runs. After the split, the existing targeting props (`selector`, `listContainer`, …) query the now-mutated DOM and find the generated spans as animation targets.
- On disconnect, the resolver **reverts** the container to its original content.

Plus the explicitly-requested addition (§9): a `hide` boolean on `SplitTextConfig` that hides the original container (via an agreed `data-text-split` state attribute + CSS) until splitting completes, to prevent FOUC.

### Setup (consumer-facing)

```ts
import { Interact } from '@wix/interact';
import { splitTextResolver } from '@wix/splittext/interact';

Interact.use('splitText', splitTextResolver);
Interact.create(config);
```

If `splitText` appears in a config but no resolver is registered, Interact throws:
`"splitText found in config but no resolver registered. Call Interact.use('splitText', resolver) before Interact.create()."`

---

## 2. Architecture findings (verified against current source)

| Concern                                    | Location                                                                                                          | Notes                                                                                                                                                                                                                                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Interact` class, static caches, lifecycle | `packages/interact/src/core/Interact.ts`                                                                          | **No plugin/resolver registry exists today** — must be added.                                                                                                                                                                                                                           |
| Config parse → `dataCache: InteractCache`  | `Interact.ts` `parseConfig()` (L381)                                                                              | `...rest` spread preserves unknown trigger fields onto cached triggers; effects/sequence-effects keep their own fields. So `splitText` props survive on triggers/effects automatically.                                                                                                 |
| Element connect → build interactions       | `core/add.ts` `add(controller)` (L745)                                                                            | Runs when an element connects. **This is the hook point** for splitting (root = `controller.element`).                                                                                                                                                                                  |
| Target resolution                          | `add.ts` `_getElementsFromData()` (L43) — `root.querySelector(listContainer)` / `root.querySelectorAll(selector)` | Called from `_addInteraction`, `addEffectsForTarget`, and `_buildAnimationGroupArgsFromSequence`. Must run **after** the split.                                                                                                                                                         |
| Cross-element / either-order connect       | `_addInteraction` (source side) + `addEffectsForTarget` (target side)                                             | An effect targeting another key is processed from whichever side connects; the other side bails until both are connected. The split must run when the element **containing the container** connects.                                                                                    |
| Disconnect / cleanup                       | `core/InteractionController.ts` `disconnect()` (L53) → `core/remove.ts` `remove()`                                | **Revert hook point.** `remove()` queries `selectors` (which already include split-span selectors like `.split-c`) to tear down handlers.                                                                                                                                               |
| Static CSS generation (SSR)                | `core/css.ts` `generate()` (L547)                                                                                 | Already uses the `data-interact-enter` + `visibility:hidden` pattern (`DEFAULT_INITIAL`, L26) to prevent entrance FOUC — we mirror it for `hide` (§9).                                                                                                                                  |
| splitText public API                       | `packages/splittext/src/splitText.ts` `splitText(target, options)` → `SplitTextResult`                            | Eager split when `type` is provided. `result.revert()` restores `originalHTML`. Default wrapper classes: `split-c`/`split-w`/`split-l`/`split-s` (`src/wrappers.ts` L4). `autoSplit` attaches `ResizeObserver` + `fonts.ready`. `onSplit(result)` callback fires after every (re)split. |

**Key consequence:** because Interact captures concrete `HTMLElement` references into sequences at `add()` time, the split MUST complete _before_ `add()` resolves targets. Running it at the very top of `add(controller)` satisfies this for both interaction-level and effect-level (cross-element) splits, since the container always lives inside the connecting controller's element subtree.

---

## 3. Type additions (`@wix/interact`)

### 3.1 New types — `src/types/config.ts`

```ts
export type SplitType = 'chars' | 'words' | 'lines' | 'sentences';

export type SplitTextConfig = {
  container: string; // selector for the element to split, relative to root
  type: SplitType | SplitType[];
  splitId?: string;
  wrapperClass?: string;
  wrapperStyle?: Record<string, string>;
  wrapperAttrs?: Record<string, string>;
  autoSplit?: boolean;
  aria?: 'auto' | 'none'; // aligned to splitText (see §11 decision D1)
  hide?: boolean; // §9 — hide container until split (FOUC guard)
};

export type SplitTextConfigRef = {
  splitId: string;
  container?: string;
  type?: SplitType | SplitType[];
  wrapperClass?: string;
  wrapperStyle?: Record<string, string>;
  wrapperAttrs?: Record<string, string>;
  autoSplit?: boolean;
  aria?: 'auto' | 'none';
  hide?: boolean;
};
```

### 3.2 Placement on existing types

- `InteractConfig` (`src/types/config.ts` L46): add `splitText?: Record<string, SplitTextConfig>;` (reusable definitions).
- `InteractionTrigger` (L31): add `splitText?: SplitTextConfig | SplitTextConfigRef;` (interaction-level). `Interaction extends InteractionTrigger`, so it inherits.
- `EffectBase` (`src/types/effects.ts` L81): add `splitText?: SplitTextConfig | SplitTextConfigRef;` (effect-level, cross-element).

### 3.3 Resolver contract types — new file `src/types/splitText.ts`

```ts
import type { SplitTextConfig } from './config';

export type SplitTextResolverContext = {
  key: string;
  listContainer?: string;
  listItemSelector?: string;
  conditions?: string[];
  selector?: string;
  // carries the full interaction/effect object for advanced logic
};

export type SplitTextResolver = {
  resolve(root: HTMLElement, config: SplitTextConfig, context: SplitTextResolverContext): void;
  revert(root: HTMLElement, container: string): void;
};
```

Re-export from `src/types/index.ts` (`export * from './splitText'`).

### 3.4 Public exports — `src/types/external.ts`

Add to the `./config` export block: `SplitType`, `SplitTextConfig`, `SplitTextConfigRef`; add the `./splitText` block: `SplitTextResolver`, `SplitTextResolverContext`.

### 3.5 Cache shape — `src/types/internal.ts`

Add to `InteractCache`: `splitText: { [splitId: string]: SplitTextConfig };`

### 3.6 Shared data-attribute contract (used by both packages)

In the new `src/core/splitText.ts` (§7), export constants and re-export them publicly from `src/index.ts`:

```ts
export const TEXT_SPLIT_STATE_ATTR = 'data-text-split';
export const TEXT_SPLIT_PENDING = 'pending'; // hidden by CSS
export const TEXT_SPLIT_DONE = 'split'; // revealed
```

The resolver references the **interface only** (`import type`), so the agreed string lives in interact and the splittext bundle stays free of interact runtime code.

---

## 4. Resolver registry — `src/core/Interact.ts`

Add to the `Interact` class:

```ts
private static resolvers = new Map<string, unknown>();

static use(name: string, resolver: unknown): void {
  Interact.resolvers.set(name, resolver);
}

static getResolver<T>(name: string): T | undefined {
  return Interact.resolvers.get(name) as T | undefined;
}
```

- **Do NOT clear `resolvers` in `Interact.destroy()`** — registrations are global plugin wiring, independent of any one config (matches how `registerEffects` registrations persist). Document this.
- `use`/`getResolver` are exported via the existing `export { Interact }` in `src/index.ts`.

---

## 5. Config parsing — `src/core/Interact.ts` `parseConfig()`

- Destructure `splitText` from `config` and pass it through to the returned `InteractCache` (so `applySplitText` can resolve `splitId` refs):
  ```ts
  const {
    effects: effectMap = {},
    sequences: sequenceMap = {},
    conditions = {},
    splitText = {},
  } = config;
  // ...
  return { effects: effectMap, sequences: sequenceMap, conditions, splitText, interactions };
  ```
- No other parse changes are required: the `...rest` spread (L388/L421) already preserves `interaction.splitText`, and effect objects (kept by reference in triggers/effects/sequence caches) already carry `effect.splitText`.
- **Selector tracking for cleanup:** the split spans are matched by the effect's `selector` (e.g. `.split-c`), which `getSelector(effect)` already adds to `interactions[*].selectors`. So `remove()` will still find spans to tear down handlers from. No change needed, but add a test asserting it.

---

## 6. Split execution hook — `src/core/add.ts`

At the **top of `add(controller)`**, right after `instance.setController(key, controller)` (≈L760) and before the `triggers.forEach`:

```ts
applySplitText(controller, instance);
```

This guarantees every connecting element splits its in-subtree containers before any target query (`_getElementsFromData`) runs against it — covering interaction-level, same-element effect-level, and cross-element effect-level splits (the latter resolve when the _target_ element connects).

`addListItems()` (L789) — splitText inside dynamically-added list items is **out of scope for v1** (§10); document the limitation. (Optionally call `applySplitText` there too in a later iteration.)

---

## 7. New module — `src/core/splitText.ts`

Owns all splitText orchestration so `add.ts`/`remove.ts` stay thin.

```ts
import { Interact } from './Interact';
import type { IInteractionController } from '../types';
import type { SplitTextConfig, SplitTextConfigRef } from '../types/config';
import type { SplitTextResolver, SplitTextResolverContext } from '../types/splitText';

export const TEXT_SPLIT_STATE_ATTR = 'data-text-split';
export const TEXT_SPLIT_PENDING = 'pending';
export const TEXT_SPLIT_DONE = 'split';

type SplitEntry = { container: string; root: HTMLElement; hide: boolean };

// Track what was split per controller so revert() can undo exactly that.
const splitsByController = new WeakMap<IInteractionController, SplitEntry[]>();
```

### 7.1 `applySplitText(controller, instance)`

1. **Gather** every `SplitTextConfig | SplitTextConfigRef` relevant to `controller.key`, with `root = controller.element`:
   - `data = instance.get(key)`.
   - Interaction-level: each `data.triggers[i].splitText`.
   - Same-element effect-level: each `data.triggers[i].effects[j].splitText` **where that effect's resolved target === key** (skip effects targeting other keys — they split when _their_ target connects).
   - Cross-element effect-level (this key is the target): each `data.effects[interactionId][n].effect.splitText`.
   - Sequence effects: same rule, from `data.triggers[i].sequences[*].effects[*].splitText` (target===key) and `data.sequences[seqId][n].sequence.effects[*].splitText`.
2. **Early exit** if none gathered.
3. **Resolve registry:** `const resolver = Interact.getResolver<SplitTextResolver>('splitText')`. If `undefined`, **throw** the contract error message.
4. For each gathered config:
   - Resolve a `splitId` ref by merging `instance.dataCache.splitText[splitId]` with the inline overrides.
   - Dedupe by `container` selector within this call (one split per container per connect).
   - If `merged.hide`: `root.querySelector(container)?.setAttribute(TEXT_SPLIT_STATE_ATTR, TEXT_SPLIT_PENDING)` (idempotent; SSR may have set it already).
   - Build `context: SplitTextResolverContext` from the originating interaction/effect (`key`, `selector`, `listContainer`, `listItemSelector`, `conditions`).
   - `resolver.resolve(root, merged, context)` — synchronous DOM mutation.
   - If `merged.hide`: set attr to `TEXT_SPLIT_DONE` (always, **regardless of reduced motion** — otherwise text stays hidden).
   - Record `{ container, root, hide }` into `splitsByController`.

> Resolver idempotency (§8) makes liberal gathering safe even if the same container is referenced by multiple effects.

### 7.2 `revertSplitText(controller, instance)`

- Read entries from `splitsByController.get(controller)`; if none, return.
- `const resolver = Interact.getResolver<SplitTextResolver>('splitText')`.
- For each entry: `resolver?.revert(entry.root, entry.container)`; if `entry.hide`, remove `TEXT_SPLIT_STATE_ATTR` from the container.
- `splitsByController.delete(controller)`.

---

## 8. Revert hook — `src/core/remove.ts`

In `remove(controller, removeFromCache)`, after `removeListItems(elements)` (which removes handlers + cancels sequences on the span nodes) and before/at `instance.deleteController(...)`:

```ts
revertSplitText(controller, instance);
```

Order rationale: tear down handlers/sequences on the existing spans first, then restore original `innerHTML`. Revert is also reached on `controller.update()` (disconnect→connect, e.g. media-query change) and React StrictMode re-mounts — split is re-applied on the following `connect()`; because both happen synchronously within the update, no FOUC and no orphaned spans.

---

## 9. `hide` / FOUC prevention (the requested addition)

**Mechanism — mirrors the existing `data-interact-enter` entrance pattern:** an agreed state attribute on the container drives a CSS hide rule until the split completes.

State machine on the container element:

- `data-text-split="pending"` → hidden by CSS.
- `data-text-split="split"` → revealed.
- attribute absent → no effect.

Three cooperating layers:

1. **Type:** `hide?: boolean` on `SplitTextConfig` / `SplitTextConfigRef` (default `false`, opt-in). §3.

2. **Runtime toggle (interact, §7.1):** when `hide` is set, the container gets `pending` before `resolver.resolve()` and `split` immediately after. This prevents FOUC for any time between hydration start and split completion. Reverted on disconnect.

3. **SSR / static CSS (full FOUC guard — covers first paint _before_ hydration):**
   - `generate()` (`src/core/css.ts`) emits, **once**, when the config contains any `splitText` with `hide: true` (scan `config.splitText` + interaction/effect-level configs):
     ```css
     [data-text-split]:not([data-text-split='split']) {
       visibility: hidden;
     }
     ```
   - The SSR HTML for a `hide` container must be rendered with `data-text-split="pending"`. That stamping is the platform/SSR layer's responsibility (same as it already stamps `data-interact-*`). **Document the contract**; optionally provide a tiny helper `markSplitTextHidden(el)` exported from interact for consumers that build DOM imperatively.

**Why `visibility:hidden`, not `display:none`:** `lines` splitting measures rendered line boxes via the Range API. `visibility:hidden` keeps layout boxes (measurement works); `display:none` collapses them (measurement breaks). The existing entrance pattern uses `visibility:hidden` for the same reason — stay consistent.

**Interaction with `aria:'auto'`:** the original-text `sr-only` span lives inside the container; hiding the container briefly also hides it, which is irrelevant for screen readers (it's visually hidden regardless) and is restored on reveal.

---

## 10. Cross-cutting behaviors & edge cases

- **No resolver but `splitText` present** → throw the documented error (in `applySplitText`, §7.1 step 3).
- **Container not found** → resolver `console.warn`s and returns; Interact proceeds (normal "no elements found" warnings follow). Not fatal.
- **`autoSplit` re-splits invalidate captured element refs.** Interact stores concrete `HTMLElement`s in sequences at `add()` time; a `ResizeObserver`/`fonts.ready` re-split replaces span nodes, orphaning those refs. Resolution options:
  - **v1 (recommended):** wire splitText's `onSplit` callback (passed by the resolver) to call `controller.update()` so Interact re-resolves targets after a re-split. The resolver receives the controller-scoped update callback via `context` (extend `SplitTextResolverContext` with an optional `onResplit?: () => void`), or interact subscribes through a small adapter.
  - **Fallback:** if wiring is deferred, document that `autoSplit` + Interact rebuilds only on `update()`/resize handled by the host; mark full auto-resplit support as a follow-up.
- **`listContainer` + splitText** (splitting inside list items): out of scope v1; document.
- **Reduced motion:** split is structural and always runs; `hide`→`split` reveal always fires (never gated on reduced motion).
- **Nested types** (`['chars','words']`): splitText builds a nested tree; both `.split-w` and `.split-c` exist; selectors target whichever the effect wants. Works unchanged.
- **`aria` mismatch:** design listed `'auto'|'hidden'|'none'`, but splitText supports `'auto'|'none'`. Decision D1 (§11): align the config to `'auto'|'none'`.

---

## 11. Open decisions

- **D1 — `aria` values:** align `SplitTextConfig.aria` to splitText's `'auto' | 'none'` (recommended) rather than introducing a `'hidden'` value the engine doesn't support. _(Plan assumes D1 = align.)_
- **D2 — `@wix/interact` dependency direction for the resolver:** ~~originally: add `@wix/interact` as a peerDependency (+ devDependency) of `@wix/splittext` and use `import type` exclusively.~~ **Superseded:** even a type-only dependency defeats the point of a resolver _registry_ — any third-party splitText-alike plugin would be forced to depend on `@wix/interact` too. Instead, `@wix/splittext/interact` declares a **locally-owned, structurally-identical copy** of `SplitTextConfig`/`SplitTextResolverContext`/`SplitTextResolver` and imports nothing from `@wix/interact`. TypeScript's structural typing satisfies `Interact.use('splitText', resolver)` (which accepts `unknown`) without any cross-package import. No build cycle either direction; no dependency either direction.
- **D3 — autoSplit re-resolve wiring:** ship the `onResplit → controller.update()` wiring in v1 (recommended) vs. defer. _(Plan assumes v1 wiring, behind the `context` callback.)_

---

## 12. Resolver implementation — `@wix/splittext`

### 12.1 New file `packages/splittext/src/interact/index.ts`

```ts
import { splitText } from '../splitText';
import type { SplitTextResult } from '../types';

// Locally-owned mirror of @wix/interact's contract types — NOT imported from
// @wix/interact. Kept structurally identical by hand so `Interact.use(...)`
// (which types its `resolver` param as `unknown`) accepts this at the call site.
type SplitTextConfig = {
  /* container, type, wrapperClass, ... — see @wix/interact's SplitTextConfig */
};
type SplitTextResolverContext = {
  /* key, selector, onResplit?, ... */
};
type SplitTextResolver = {
  resolve(root: HTMLElement, config: SplitTextConfig, context: SplitTextResolverContext): void;
  revert(root: HTMLElement, container: string): void;
};

const results = new WeakMap<HTMLElement, SplitTextResult>();

function toOptions(config: SplitTextConfig) {
  return {
    type: config.type,
    wrapperClass: config.wrapperClass,
    wrapperStyle: config.wrapperStyle as Partial<CSSStyleDeclaration> | undefined,
    wrapperAttrs: config.wrapperAttrs,
    autoSplit: config.autoSplit,
    aria: config.aria, // 'auto' | 'none'
  };
}

export const splitTextResolver: SplitTextResolver = {
  resolve(root, config, _context) {
    const container = root.querySelector(config.container) as HTMLElement | null;
    if (!container) {
      console.warn(`splitText: container "${config.container}" not found`);
      return;
    }
    if (results.has(container)) return; // idempotent (re-entrancy guard)
    // passing `type` makes splitText split eagerly & synchronously,
    // so the spans exist immediately for Interact's target resolution.
    results.set(container, splitText(container, toOptions(config)));
  },

  revert(root, containerSelector) {
    const container = root.querySelector(containerSelector) as HTMLElement | null;
    const result = container && results.get(container);
    if (result) {
      result.revert();
      results.delete(container);
    }
  },
};
```

_(If D3 ships: thread `context.onResplit` into `splitText({ ...opts, onSplit: () => context.onResplit?.() })`.)_

### 12.2 Packaging — `packages/splittext/package.json`

- Add export subpath:
  ```jsonc
  "./interact": {
    "types": "./dist/types/interact/index.d.ts",
    "import": "./dist/es/interact.js",
    "require": "./dist/cjs/interact.js"
  }
  ```
- Do **not** add `@wix/interact` anywhere in `package.json` (no peerDependency, no devDependency) — see D2.
- `vite.config.ts`: add `interact: path.resolve(__dirname, 'src/interact/index.ts')` to `build.lib.entry`. No `@wix/interact` external entry needed — nothing imports it.
- `tsconfig.build.json` already includes `src`, so declarations emit automatically.
- Update CLAUDE.md dependency graph note: `@wix/splittext/interact` has **no dependency** on `@wix/interact` (structural typing against a locally-mirrored contract).

---

## 13. File-by-file checklist

**`@wix/interact`**

- [ ] `src/types/config.ts` — add `SplitType`, `SplitTextConfig` (+`hide`), `SplitTextConfigRef` (+`hide`); add `splitText?` to `InteractConfig` and `InteractionTrigger`.
- [ ] `src/types/effects.ts` — add `splitText?` to `EffectBase`.
- [ ] `src/types/splitText.ts` (new) — `SplitTextResolver`, `SplitTextResolverContext`.
- [ ] `src/types/internal.ts` — add `splitText` to `InteractCache`.
- [ ] `src/types/index.ts` — `export * from './splitText'`.
- [ ] `src/types/external.ts` — export new public types.
- [ ] `src/core/Interact.ts` — `resolvers` map + `use()`/`getResolver()`; `parseConfig` carries `splitText`; (do not clear resolvers in `destroy`).
- [ ] `src/core/splitText.ts` (new) — constants, `applySplitText`, `revertSplitText`, per-controller tracking.
- [ ] `src/core/add.ts` — call `applySplitText` at top of `add()`.
- [ ] `src/core/remove.ts` — call `revertSplitText`.
- [ ] `src/core/css.ts` — emit hide CSS rule in `generate()` when needed.
- [ ] `src/index.ts` — re-export `TEXT_SPLIT_STATE_ATTR`/`TEXT_SPLIT_PENDING`/`TEXT_SPLIT_DONE` (+ optional `markSplitTextHidden`).

**`@wix/splittext`**

- [ ] `src/interact/index.ts` (new) — locally-mirrored contract types + `splitTextResolver` + config→options mapping + WeakMap. No import from `@wix/interact`.
- [ ] `package.json` — `./interact` export; **no** `@wix/interact` peer/dev dep (see D2).
- [ ] `vite.config.ts` — `interact` entry (no `@wix/interact` external needed).

---

## 14. Tests

**interact (unit/jsdom)**

- Registry: `use`/`getResolver` round-trip; persists across `Interact.destroy()`.
- `parseConfig` caches `splitText` defs; `splitId` ref merge (config-level + inline override).
- `applySplitText`: calls resolver with correct `root`, merged `config`, and `context` for interaction-level, same-element effect-level, and cross-element effect-level cases; dedupes by container; **throws** when resolver missing.
- `hide`: sets `data-text-split="pending"` then `"split"`; removed on revert; reveal happens under reduced motion.
- Integration: `create → connect` splits DOM; `selector: '.split-c'` finds spans; sequence built with span targets; `disconnect` reverts to original HTML and removes split state attr.
- `generate()` emits the hide rule iff a `hide` config is present.

**splittext (unit)**

- `splitTextResolver.resolve` maps config→options, splits eagerly, is idempotent; `revert` restores via WeakMap; container-not-found warns without throwing.

**e2e (extends existing `interact_e2e` plan)**

- Visual: `hide` container is not painted until split completes (no FOUC); `lines` split still measures correctly while hidden (`visibility:hidden`).

---

## 15. Docs

- `@wix/interact` README: new "splitText" section — setup, config levels (config/interaction/effect), the four config examples from the design, and the `hide` FOUC guard with the `data-text-split` contract + required SSR stamping/CSS.
- `@wix/splittext` README: `/interact` entry point + resolver registration.
- Update `llms.txt` / `llms-full.txt` and CLAUDE.md (type-only splittext→interact dependency; new entry point).

---

## 16. Suggested sequencing

1. Types + registry (§3, §4) — no behavior yet, unblocks everything.
2. `parseConfig` cache + `core/splitText.ts` + `add`/`remove` hooks (§5–§8) — core flow, behind "resolver registered" guard.
3. splittext resolver + packaging (§12).
4. `hide` runtime + `generate()` CSS (§9).
5. Tests (§14), docs (§15).
6. Follow-ups: `autoSplit` re-resolve wiring (D3), list-item splitting (§10).
