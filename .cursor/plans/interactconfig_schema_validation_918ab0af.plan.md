---
name: InteractConfig Schema Validation
overview: Ship schema + referential + semantic validation for `InteractConfig` as a new `@wix/interact/validate` subpath, by retargeting the existing validation harness and stripping the host project's Experience/controls layer. Uses Opus's plan as the base with Sonnet's concise todo structure and canonical type re-export pattern added.
todos:
  - id: phase0-deps-wiring
    content: "Phase 0: Add zod as production dep (v4); wire validate entry in vite.config.ts and package.json exports; confirm bundle isolation (dist/es/index.js has no zod)"
    status: completed
  - id: phase1-schema
    content: "Phase 1: Move src/schema/ → src/validate/schema/; trim primitives (keep MediaCondition), effects (accept customEffect), sequences (accept function offsetEasing), interactions (remove id, no interactionId, discriminatedUnion); rewrite index.ts to re-export canonical types from types/config.ts"
    status: pending
  - id: phase2-harness-rename
    content: "Phase 2: Rename ExperienceValidationError → InteractValidationError; retarget structural.ts to InteractConfigSchema (extend mapZodCode); rename public API to validateInteractConfig / assertValidInteractConfig; export RULES, Rule type, and zod sub-schemas"
    status: pending
  - id: phase3-context
    content: "Phase 3: Rewrite validate/context.ts — drop elementKeys/controlIds/styleSelectors/etc.; walk InteractConfig directly; add isEffectRef/isSequenceRef predicates; collect trigger+effect tuples and definition maps for new rules"
    status: pending
  - id: phase4-rules-trim
    content: "Phase 4a: Delete controls/* and 6 out-of-scope referential rules; add rules/_factory.ts with referenceRule() helper; rewrite 4 ID-existence rules as one-liners"
    status: pending
  - id: phase4-rules-add
    content: "Phase 4b: Add 5 new semantic rules — triggerEffectCompatible (warning), numericBounds, conditionPredicateRequired, uniqueDefinitionIds, unusedDefinitions (warnings); update rules/index.ts RULES array"
    status: pending
  - id: phase5-tests
    content: "Phase 5: Unit tests per rule (valid config + per-code fixture); structural tests; type-parity test (expectTypeOf); bundle test (CI grep for zod)"
    status: pending
  - id: phase6-docs
    content: "Phase 6: README section for @wix/interact/validate; error-code table (§7); llms.txt entry"
    status: pending
isProject: false
---

# InteractConfig Schema Validation — Implementation Plan

> Status: proposal. Goal: ship schema + referential + semantic validation for
> `InteractConfig` as an opt-in subpath of `@wix/interact`, reusing the
> already-copied validation harness but stripping the host project's
> `Experience` / controls / styles / bindings layer.

## 0. Guiding decisions (the "why")

The copied code in `src/schema/` and `src/validate/` validates the **host
project's `Experience` document**, not Interact's config. Interact's real config
is `InteractConfig = { effects?, sequences?, conditions?, interactions }`
(`src/types/config.ts:46`). So the task is: **keep the harness, extract the
Interact slice, amputate everything else.**

- **Location:** new opt-in subpath `@wix/interact/validate`. Keeps `zod` (a new
  runtime dep, currently not installed) out of the default bundle — it is
  imported *only* from this subpath, so tree-shaking excludes it for consumers
  who don't import it. Same package (not a separate one) so validation can never
  version-skew from the config types it must track.
- **Target type:** validate `InteractConfig` directly. The host app composes its
  own `Experience` schema on top if it wants one.
- **Serializable subset:** zod cannot model function fields (`customEffect`,
  function `offsetEasing`). Decide (see §8) whether to (a) validate the JSON form
  only, or (b) accept+skip function fields so JS-authored configs pass.

---

## 1. Final-state file layout

```
packages/interact/src/
  validate/
    index.ts            # public API: validateInteractConfig, assertValidInteractConfig, types, RULES
    errors.ts           # ValidationError/Result + InteractValidationError (renamed)
    structural.ts       # zod safeParse → ValidationError[] (kept, retargeted to InteractConfigSchema)
    semantic.ts         # rule runner (kept as-is)
    context.ts          # REWRITTEN: walks InteractConfig, drops elements/controls/styles
    schema/             # MOVED here from src/schema (only the Interact slice)
      index.ts
      primitives.ts     # trimmed
      effects.ts        # kept ~as-is (+ exported field-group constants)
      sequences.ts      # kept
      interactions.ts   # rewritten root → InteractConfigSchema
    rules/
      index.ts          # trimmed RULES list + Rule type + referenceRule factory
      _factory.ts       # NEW: referenceRule() helper
      referential/
        effectIdsExist.ts
        sequenceIdsExist.ts
        animationEndEffectExists.ts
        conditionsExist.ts
        interactionHasEffectsOrSequences.ts
      semantic/                       # NEW bucket
        triggerEffectCompatible.ts    # NEW (the big one)
        numericBounds.ts              # NEW
        conditionPredicateRequired.ts # NEW
        uniqueDefinitionIds.ts        # NEW (dup effect/sequence keys, keyframe names)
        unusedDefinitions.ts          # NEW (warnings)
      conditions/
        validMediaQueries.ts
  validate.test.ts (or __tests__/)    # NEW
```

**Deleted entirely:**
- `src/schema/experience.ts`, `src/schema/controls.ts`
- `src/validate/rules/controls/*` (all six)
- `src/validate/rules/referential/{controlTargetsExist,styleBindingSelectorExists,variableBindingIsCustomProperty,bindingPropertyRequired,interactionKeysExist,effectKeyExistsInElements}.ts`
- the stray empty `src/rules/` tree (copy artifact)

> Note: I'm folding `src/schema/` under `src/validate/schema/` so the entire
> zod-dependent surface lives under one subpath dir. If you'd rather keep
> `src/schema/` top-level, that's fine — just ensure nothing outside
> `src/validate/**` imports it, or zod leaks into the main bundle.

---

## 2. Phase 0 — deps & build wiring

1. **Add zod as a regular dependency** (decision 8.4; pin v4 — the schemas use v4
   issue codes like `invalid_value`, `code:'custom'`):
   - `package.json` → `dependencies: { "zod": "^4.x" }`. Run `nvm use && yarn`.
   - Externalized in the bundle (step 3), so it's tree-shaken out of the
     main/`react`/`web` entries and only loaded when `/validate` is imported.
2. **`exports` map** — add subpath:
   ```jsonc
   "./validate": {
     "types": "./dist/types/validate/index.d.ts",
     "import": "./dist/es/validate.js",
     "require": "./dist/cjs/validate.js"
   }
   ```
3. **`vite.config.ts`** — add entry + externalize zod:
   ```ts
   lib: { entry: { index: …, react: …, web: …,
     validate: path.resolve(__dirname, 'src/validate/index.ts') } }
   rollupOptions: { external: ['react', 'react-dom', 'zod'] }
   ```
4. **`tsconfig.build.json`** already emits declarations for all of `src`, so
   `dist/types/validate/index.d.ts` is produced automatically. No change needed.
5. **Sanity:** `yarn build` then confirm `dist/es/validate.js` exists and that
   `dist/es/index.js` does **not** contain `zod` (grep the bundle).

---

## 3. Phase 1 — schema, trimmed to InteractConfig

### `schema/primitives.ts`
- **Keep:** `Keyframe`, `LengthPercentage`, `RangeOffset`, `Condition`,
  `MediaCondition`.
- **Delete:** `ElementEntry`, `StyleRule`, `ExperienceMeta`,
  `ExperienceSchemaVersion`.

### `schema/effects.ts`
- **Keep all of it.** Additionally **export** the field-group constants for reuse
  by the new compatibility rule:
  ```ts
  export const SCRUB_FIELDS = […] // already defined locally
  export const STATE_FIELDS = […]
  export const TIME_FIELDS = ['duration','easing','iterations','alternate',
    'reversed','delay','fill','composite'] as const // NEW
  ```
- **Remove dead aliases** `SerializableScrubEffect`/`SerializableStateEffect`
  (they're `= SerializableEffect` no-ops). Update the barrel accordingly.
- **Accept `customEffect`** (decision 8.1): add
  `customEffect: z.custom<Function>((v) => typeof v === 'function').optional()` to
  `SourceFields`, and count it as a valid third source in all three refinements
  (`SerializableEffectSource`, `SerializableEffect.superRefine`,
  `SerializableTimeEffect`). Opaque — no deep validation.

### `schema/sequences.ts`
- **Keep as-is** (`SerializableSequenceConfig`, `SerializableSequenceConfigRef`).
- **Accept function `offsetEasing`** (decision 8.1):
  `offsetEasing: z.union([z.string(), z.custom<Function>((v) => typeof v === 'function')]).optional()`.

### `schema/interactions.ts`
- **Keep:** `TriggerType`, `ViewEnterParams`, `PointerMoveParams`,
  `AnimationEndParams`, `TriggerParams`, and the four per-trigger interaction
  shapes.
- **Fixes (resolve drift vs `src/types`):**
  - `InteractionBase`: **remove `id`** (not on the `Interaction` type). Keep
    `key: z.string().min(1)`.
  - **Do NOT add effect-level `interactionId`** (decision 8.3): it is
    runtime-generated (`Interact.ts:468`), never author-provided. Leaving it out
    means `.strict()` rejects it if mistakenly supplied — desired.
  - Convert the interaction union to `z.discriminatedUnion('trigger', […])` for
    better errors + speed.
- **Replace `ExperienceInteractConfig` with the real root** (rename file export):
  ```ts
  export const InteractConfigSchema = z.object({
    effects: z.record(z.string().min(1), SerializableEffect).optional(),     // optional, matches type
    sequences: z.record(z.string().min(1), SerializableSequenceConfig).optional(),
    conditions: z.record(z.string().min(1), Condition).optional(),           // primitives.Condition → includes 'container'
    interactions: z.array(Interaction),
  }).strict();
  ```
  Note the two drift fixes vs the copied version: `effects` becomes **optional**,
  and `conditions` uses the full `Condition` (with `'container'`).

### `schema/index.ts`
- Strip all `Experience*`, `Control*`, `Binding*`, `ElementEntry`, `StyleRule`,
  `ExperienceMeta` re-exports. Keep effect/sequence/interaction/primitive
  exports + the new `InteractConfigSchema`.
- Re-export the canonical types from `../types/config.ts` rather than re-deriving
  them via `z.infer<>`. This eliminates the naming collision (value `Condition`
  and type `Condition` with the same name) and keeps a single source of truth:
  ```typescript
  // values
  export { InteractConfigSchema, SerializableEffect, ... } from './interactions';
  // types — single source of truth
  export type { InteractConfig, Effect, Condition, ... } from '../types/config';
  ```

---

## 4. Phase 2 — harness rename (mechanical)

### `validate/errors.ts`
- Rename `ExperienceValidationError` → `InteractValidationError`; message text
  "Interact config validation failed…". Keep `Severity`, `ValidationError`,
  `ValidationResult` unchanged.

### `validate/structural.ts`
- Point at `InteractConfigSchema` instead of `ExperienceSchema`. Keep
  `mapZodCode`; **extend it** with `too_small` → `SCHEMA_TOO_SMALL`,
  `invalid_enum_value`/`invalid_value` already handled. Return type `parsed?:
  InteractConfig`.

### `validate/semantic.ts`
- **No change** (already generic over `ctx` + `RULES`).

### `validate/index.ts`
- Rename `validateExperience` → `validateInteractConfig`,
  `assertValidExperience` → `assertValidInteractConfig` (`asserts input is
  InteractConfig`). Keep `finalize`/`comparePath`/`ValidateOptions`
  (`strict`/`severityOverrides`/`max`) verbatim.
- **Export** `RULES` and the `Rule` type so consumers can register custom rules.
- **Re-export the zod schemas** (decision 8.2): `InteractConfigSchema`, its
  `z.infer` type, and the sub-schemas (effects/sequences/interactions/primitives)
  so the host "Experience" project can compose its own schema on top.

---

## 5. Phase 3 — `context.ts` rewrite

Rewrite `buildContext(config: InteractConfig)`:

- **Drop:** `elementKeys`, `controlIds`, `styleSelectors`, `interactionIds`,
  `controlBindingReferences`, `variableBindings`, `controls`, `cssVarUsage`,
  `interactionKeyReferences`, `effectKeyReferences`, and the `var()` collector.
- **Keep:** `effectIds`, `sequenceIds`, `conditionIds` (from
  `config.effects/sequences/conditions` keys); reference lists
  `effectIdReferences`, `sequenceIdReferences`, `conditionReferences`, and the
  `interactions` list (with paths).
- Root paths change from `['interact', 'effects', id]` → `['effects', id]` (no
  `interact` wrapper).
- **Extract a single `isEffectRef(entry)` predicate** and a single
  `isSequenceRef(entry)` predicate (replaces the duplicated
  `'effectId' in entry && !('namedEffect' in entry) && …` sniffing in
  `walkSequence` and the interaction loop). Prefer deriving ref-ness from the
  schema discriminant over key-presence sniffing.
- For new rules, also collect: per-interaction `(trigger, effectEntry, path)`
  tuples (the compatibility rule needs trigger + effect together), and the raw
  definition maps for unused/duplicate detection.

---

## 6. Phase 4 — rules: trim + add

### Keep (retargeted, content unchanged except code paths)

| File | Code | Severity |
|---|---|---|
| `referential/effectIdsExist` | `EFFECT_ID_NOT_FOUND` | error |
| `referential/sequenceIdsExist` | `SEQUENCE_ID_NOT_FOUND` | error |
| `referential/animationEndEffectExists` | `ANIMATION_END_EFFECT_NOT_FOUND` | error |
| `referential/conditionsExist` | `CONDITION_NOT_FOUND` | error |
| `referential/interactionHasEffectsOrSequences` | `INTERACTION_EMPTY` | error |
| `conditions/validMediaQueries` | `INVALID_MEDIA_QUERY` | warning |

### Delete
All `controls/*`, the four binding/style referential rules, plus
`interactionKeysExist` and `effectKeyExistsInElements` (they checked
`Experience.elements`, which doesn't exist in `InteractConfig`; `key` is a
runtime DOM identifier — see §8 for the runtime-only alternative).

### Add `rules/_factory.ts`
Collapse the near-identical referential rules:
```ts
export function referenceRule<T extends { path: Path }>(opts: {
  code: string;
  severity: Severity;
  refs: (ctx: ValidationContext) => T[];
  has: (ctx: ValidationContext, ref: T) => boolean;
  message: (ref: T) => string;
  hint?: string;
}): Rule { /* filter !has, map to ValidationError */ }
```
Rewrite the four ID-existence rules as one-line `referenceRule({...})` calls.

### New rules (see §7 for the catalogue)
`semantic/triggerEffectCompatible`, `semantic/numericBounds`,
`semantic/conditionPredicateRequired`, `semantic/uniqueDefinitionIds`,
`semantic/unusedDefinitions`.

### `rules/index.ts`
New `RULES` array: the 5 kept referential + `validMediaQueries` + the 5 new
semantic rules. Keep the `Rule` type exported.

---

## 7. New validation rules — catalogue

| Code | What it checks | Severity | Notes |
|---|---|---|---|
| `TRIGGER_EFFECT_INCOMPATIBLE` | Scrub fields (`SCRUB_FIELDS`) only on `viewProgress`/`pointerMove`; time fields (`TIME_FIELDS`) only on discrete triggers; state fields not on scrub triggers. | **warning** initially | The big one. Runtime silently drops bad combos (`resolvers.ts:87`). Start as warning to avoid false positives, promote to error once stable. Reuse exported field-group constants. |
| `THRESHOLD_OUT_OF_RANGE` | `viewEnter.threshold` ∈ [0,1]. | error | |
| `NEGATIVE_DURATION` etc. (`numericBounds`) | `duration`/`delay`/`iterations`/sequence `offset`/`delay` ≥ 0. | error | One rule, multiple checks. |
| `CONDITION_PREDICATE_REQUIRED` | `predicate` present for condition `type` `media`/`container`. | error | Fixes schema marking it optional. |
| `DUPLICATE_KEYFRAME_NAME` | `keyframeEffect.name` unique across effects. | warning | Part of `uniqueDefinitionIds`. |
| `UNUSED_EFFECT` / `UNUSED_SEQUENCE` / `UNUSED_CONDITION` | Defined but never referenced by any interaction. | warning | Mirror of referential rules; dead-config hygiene. |

**Deferred / runtime-only (document, don't ship in static validator):**
- `NAMED_EFFECT_NOT_REGISTERED` — `namedEffect.type` must be in motion's registry
  (`getRegisteredEffect`). Only knowable *after* `registerEffects`, so expose as
  an optional runtime check, not part of static `validateInteractConfig`.
- `UNKNOWN_EASING` — `easing`/`offsetEasing` resolvable by motion's `getJsEasing`
  or valid `cubic-bezier()`. Warning; needs the easing name list from motion.

---

## 8. Resolved decisions

All five resolved below with codebase evidence. Consequences are propagated into
the phases above.

### 8.1 Function fields → **accept + skip (opaque)** ✅
`customEffect` and function-valued `offsetEasing` are **genuine authored
options**, not just type noise:
- `resolvers.ts:74,95` — `else if (customEffect)` is a first-class effect source.
- `resolvers.ts:146` — `if (typeof offsetEasing === 'function')` branch.
- Referenced in `README.md`, `docs/guides/effects-and-animations.md`,
  `test/resolvers.spec.ts`.

A JSON-only schema would **reject valid JS-authored configs** → unacceptable.
**Resolution:**
- `schema/effects.ts`: add `customEffect: z.custom<Function>((v) => typeof v === 'function').optional()`
  to `SourceFields`, and **count it as a valid third source** in all three
  refinements (`SerializableEffectSource`, `SerializableEffect.superRefine`'s
  source/state checks, and `SerializableTimeEffect`'s "must have a source").
  No deep validation of the function — opaque.
- `schema/sequences.ts`: `offsetEasing: z.union([z.string(), z.custom<Function>(...)]).optional()`.
- **Defer** (not v1): an opt-in `serializableOnly` flag that emits a
  `NOT_SERIALIZABLE` *warning* for function fields, for consumers exporting
  configs to JSON (e.g. AI round-tripping). Add to `ValidateOptions` later.

### 8.2 Schema dir placement → **fold into `src/validate/schema/` + export publicly** ✅
Evidence: nothing outside `src/validate` imports `src/schema`; `core/`+`dom/`
import neither `zod` nor any schema. So folding is safe and keeps the entire
zod-dependent surface under the one subpath.
**Resolution:** move `src/schema/` → `src/validate/schema/`. **Additionally,
re-export `InteractConfigSchema`, its `z.infer` type, and the sub-schemas
(effects/sequences/interactions/primitives) from `src/validate/index.ts`** — the
host "Experience" project that prompted this work needs to *compose* its own
schema on top of Interact's, so the zod schemas are part of the public `/validate`
API, not just internals.

### 8.3 `interactionId` on interaction effects → **internal-only; keep OUT of schema** ✅
(Reverses the earlier "add it optional" lean.) Evidence: it is **runtime-generated,
never author-provided** — `Interact.ts:467-468`:
```ts
const interactionId = `${source}::${target}::${effectId}::${interactionIdx}`;
effect.interactionId = interactionId;   // mutated in place at runtime
```
It only exists on the `Effect` type because the runtime mutates the parsed
objects. Validation runs on the *authored* config (pre-mutation), where the field
is absent.
**Resolution:** do **not** add `interactionId` to the interaction-effect schema.
`.strict()` will then correctly reject it if a user supplies it by mistake — which
is the desired behavior, since authoring it is meaningless. (This makes 8.1's
field set the only author-facing additions.)

### 8.4 zod dependency form → **regular `dependencies`** ✅
Considered the optional-peer pattern the package uses for `react`/`react-dom`,
but that precedent exists because React must be a **deduped singleton** owned by
the host — zod has no such constraint. For zod the only thing peer-optional buys
is a smaller install footprint, at the cost of real DX friction (a missing-module
error if the consumer forgets to add zod). Bundle size is **not** a factor: zod is
listed in `rollupOptions.external` and is imported only from `/validate`, so it is
tree-shaken out of the main/`react`/`web` bundles regardless of dependency form.
**Resolution:** `dependencies: { "zod": "^4.x" }` (lowest friction, conventional,
already externalized in the bundle). Revisit peer-optional only if install
footprint becomes a real complaint.

### 8.5 Element-key checks → **drop for v1; document a future runtime helper** ✅
`InteractConfig` has **no element registry** to check `key`/`selector` against —
they resolve against the live DOM at runtime (`Interact.ts:391`:
"Interaction … is missing a key for source element"). So static validation
**cannot** verify them; `interactionKeysExist` / `effectKeyExistsInElements` are
deleted (already in the Phase-4 delete list).
**Resolution:** drop statically for v1. **Note as future scope:** an optional
runtime helper `validateInteractConfigInDOM(config, root = document)` that checks
each `key`/`selector` resolves to ≥1 live element — shipped from `/validate` but
clearly separated from the static `validateInteractConfig`. Not in v1.

---

## 9. Phase 5 — tests

- **Unit per rule** under `src/validate/**`: a valid config (0 errors) + one
  fixture per error `code`. Reuse existing fixtures where the copied tests exist;
  otherwise build minimal `InteractConfig` literals.
- **Structural tests:** unknown key (`.strict`) → `SCHEMA_UNRECOGNIZED_KEYS`;
  wrong type → `SCHEMA_INVALID_TYPE`; discriminated-union bad `trigger`.
- **`ValidateOptions`:** `strict` promotes warnings→errors; `severityOverrides`
  `'off'` skips a rule; `max` truncates; output sorted by path.
- **Type-parity test (drift guard) — important:** with `vitest`'s `expectTypeOf`,
  assert the schema and the hand-written type agree:
  ```ts
  expectTypeOf<z.infer<typeof InteractConfigSchema>>().toMatchTypeOf<InteractConfig>();
  // and the reverse direction for the serializable subset
  ```
  This is what prevents the schema from silently drifting from
  `src/types/config.ts` (it already had: `id` field, dropped `'container'`,
  string-only `offsetEasing`).
- **Bundle test (CI grep):** assert `dist/es/index.js` has no `zod` import.

---

## 10. Phase 6 — docs & DX

- README section for `@wix/interact/validate`: `validateInteractConfig(config,
  opts)`, `assertValidInteractConfig`, the `ValidationError`/`code` catalogue,
  `severityOverrides`/`strict`, and custom-rule registration via exported
  `RULES`/`Rule`.
- Add the error-code table (§7) to docs and, if applicable, to `llms.txt`.

---

## 11. Suggested commit/PR sequence

1. Phase 0 build wiring + add zod (no behavior yet).
2. Phase 1 schema trim + drift fixes (+ schema unit tests).
3. Phases 2–3 harness rename + `context.ts` rewrite.
4. Phase 4 rule trim + `referenceRule` factory (kept rules green).
5. New semantic rules one commit each (§7), each with tests.
6. Type-parity test + bundle test + docs.

Each step keeps `yarn lint` (tsc) and `yarn test` green.
