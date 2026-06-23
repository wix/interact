# Plan: Extend `@wix/interact-validate` static validations

Goal: add more **static** validations (no DOM, no runtime) to `@wix/interact-validate`, derived
from the constraints documented in `packages/interact/rules/*.md`. This plan only describes what to
build and how — no code is changed here.

---

## 1. Current state (baseline)

The validator (`packages/interact-validate/src`) is a Zod-driven, three-layer pipeline:

- **`schema/*.ts`** — `InteractConfigSchema` is a strict discriminated union (by `trigger`). It
  enforces shape, enums, numeric bounds, "exactly one effect source", and trigger/effect
  compatibility (each trigger only accepts the effect schema valid for it).
- **`InteractConfigSchema.superRefine`** — cross-reference (referential) **errors**:
  `effectId`/`sequenceId`/`conditions` references resolve, `animationEnd.params.effectId` resolves.
- **`InteractConfigSchema.transform`** — semantic **warnings** pushed onto a `warnings[]` array:
  unused effects/sequences/conditions, duplicate keyframe names.
- **`structural.ts`** maps Zod issue codes → domain codes; **`index.ts`** `finalize()` applies
  `strict` / `max` / `severityOverrides`, sorts by path, and computes `valid`.

A reusable `walkConfig(config, visitors)` already traverses top-level + inline effects, sequences,
and interactions, supplying the `path` and an `isTopLevel` flag.

### Existing checks (do not duplicate)

| Domain code                                                                                                | Severity  | What                                             |
| ---------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------ |
| `SCHEMA_*` (`INVALID_TYPE`, `UNRECOGNIZED_KEYS`, `INVALID_UNION`, `INVALID_LITERAL`, `TOO_SMALL`)          | error     | shape / enum / strict-keys                       |
| `NEGATIVE_DURATION` / `NEGATIVE_DELAY` / `NEGATIVE_ITERATIONS` / `NEGATIVE_OFFSET`                         | error     | numeric lower bounds                             |
| `THRESHOLD_OUT_OF_RANGE`                                                                                   | error     | viewEnter `threshold` ∉ [0,1]                    |
| `MULTIPLE_EFFECT_SOURCES` / `MULTIPLE_TRANSITION_SOURCES`                                                  | error     | not exactly one source                           |
| `EFFECT_ID_NOT_FOUND` / `ANIMATION_END_EFFECT_NOT_FOUND` / `SEQUENCE_ID_NOT_FOUND` / `CONDITION_NOT_FOUND` | error     | dangling references                              |
| `INTERACTION_EMPTY`                                                                                        | error     | no effects and no sequences                      |
| `INVALID_MEDIA_QUERY`                                                                                      | error→cfg | media predicate syntax                           |
| `UNUSED_EFFECT` / `UNUSED_SEQUENCE` / `UNUSED_CONDITION`                                                   | warning   | defined but never referenced                     |
| `DUPLICATE_KEYFRAME_NAME`                                                                                  | warning   | repeated `keyframeEffect.name`                   |
| trigger/effect compatibility                                                                               | error     | enforced structurally by the discriminated union |

---

## 2. Architecture changes needed before adding checks

Most new checks are **cross-field** or **trigger-aware**, so they belong in `superRefine`
(errors) or the `transform` `warnings[]` (warnings) rather than in field schemas.

1. **Make `walkConfig` trigger-aware.** `onEffect`/`onSequence` currently receive only `(path,
node, isTopLevel)`. Add an `owner` argument carrying the parent interaction (so its `trigger`,
   `key`, `selector`, `params`, `listContainer` are available). Top-level registry effects have no
   owner (`owner: undefined`) — trigger-aware checks simply skip them, because a registry effect's
   trigger is only known at its reference site. (Optionally, also run trigger-aware checks on
   registry effects by resolving them through each `EffectRef` that uses them.)
2. **Add a shared `warnings` collector usable from both passes.** Today warnings only come from
   `transform`. Keep that, but extract a small helper (`pushWarning(code, path, message)`) so the
   new semantic checks read cleanly.
3. **Register every new warning code in `RULE_CODE_MAP`** (`index.ts`) under a rule-category key so
   `severityOverrides` (`'off'` / `'warning'` / `'error'`) and `strict` work uniformly. Group codes
   into a handful of rule categories (e.g. `SAME_ELEMENT_RETRIGGER`, `HIT_AREA_SHIFT`,
   `SCROLL_RANGE`, `RECOMMENDED_FILL`, `ELEMENT_SELECTION`, `STATE_EFFECT`, `KEYFRAME_STYLE`,
   `ANIMATION_END_GRAPH`, `UNKNOWN_NAMED_EFFECT`).
4. **Add an optional `knownEffects?: string[]` to `ValidateOptions`** to power the opt-in
   `UNKNOWN_NAMED_EFFECT` check (§3.D.1).
5. **Shared helpers** (new `src/semantic.ts` or inline): `targetsSameElementAsSource(interaction,
effect)` and `isScrollPresetType(type)`.

`targetsSameElementAsSource` mirrors the documented Element-Resolution priority (full-lean.md
"Element Resolution"): the effect targets the source element when it does **not** introduce its own
distinct target — i.e. `effect.key` is absent or equal to `interaction.key`, **and** the effect adds
no `selector` / `listContainer` / `listItemSelector` that the interaction source doesn't also have.
When in doubt the helper returns `false` (avoid false positives).

---

## 3. Proposed new validations

Severity legend: **error** = config will break/throw; **warning** = very likely wrong / documented
CRITICAL pitfall; **info** = best-practice nudge (still emitted as `'warning'` severity since the
`Severity` type is only `error | warning`, but defaulted low and easy to turn `off`).

### A. CRITICAL-pitfall checks (warning)

These encode the rule files' explicit **CRITICAL** callouts that are statically detectable.

1. **`SAME_ELEMENT_RETRIGGER` — viewEnter same source+target with non-`once` triggerType.**
   Source: `viewenter.md` top CRITICAL + `full-lean.md` "viewEnter" CRITICAL. For a `viewEnter`
   (or `pageVisible`) interaction, for each `TimeEffect` whose `triggerType ∈ {repeat, alternate,
state}` where `targetsSameElementAsSource` is true → warning. Also applies to a sequence whose
   `triggerType` is non-`once` when its effects target the source.
   - Path: `['interactions', i, 'effects', e, 'triggerType']`.
   - Message: "viewEnter with triggerType '<x>' must use a separate source/target element; same-element observation causes re-trigger loops. Use a different `key`/`selector` or `triggerType: 'once'`."

2. **`HIT_AREA_SHIFT` — hover/pointerMove same source+target with size/position transforms.**
   Source: `hover.md`, `pointermove.md`, `full-lean.md` Common-Pitfalls. For `hover`/`click`/
   `interest`/`activate` or `pointerMove` (esp. `hitArea: 'self'`) interactions where
   `targetsSameElementAsSource`, inspect the effect's **`keyframeEffect.keyframes`** for a
   `transform` containing `translate*`, `scale*`, or `matrix*` (regex over string values) → warning.
   - Scope: `keyframeEffect` only (keyframes are statically inspectable). `namedEffect` cannot be
     reliably introspected, so it is out of scope for this check (note it in the rules doc instead).
   - Path: effect node. Message recommends targeting a child via `selector` or a different `key`.

3. **`SCROLL_PRESET_MISSING_RANGE` — `*Scroll` namedEffect on viewProgress without `range`.**
   Source: `viewprogress.md` Rule 1 + `full-lean.md` Animation-Payloads CRITICAL. For a
   `viewProgress` effect whose `namedEffect.type` matches a scroll preset (ends with `Scroll`, or is
   in the known scroll-preset list), if `namedEffect.range` is missing → warning ("scroll presets
   require `range: 'in' | 'out' | 'continuous'`; prefer 'continuous'"). If `range` is present but
   not one of the three allowed values → warning `SCROLL_PRESET_BAD_RANGE`.
   - Path: `[...effect, 'namedEffect', 'range']`.

### B. Referential / graph checks (error + warning)

4. **`ANIMATION_END_SELF_REFERENCE` (warning) and `ANIMATION_END_CYCLE` (error).**
   Source: `full-lean.md` / `integration.md` `animationEnd` ("fires when the specified effect
   completes … useful for chaining"). Build a dependency graph: each `animationEnd` interaction
   `waits-for` `params.effectId`; an interaction _produces_ the effects it lists (matched by
   `effectId`).
   - Self-reference: an `animationEnd` interaction whose `params.effectId` is also produced by that
     same interaction → it can never start (warning).
   - Cycle: a cycle in the waits-for graph (A waits B, B waits A, …) → deadlock (error). Detect with
     DFS/topological sort. Anchor the error at each interaction's `params.effectId`.

5. **`DUPLICATE_EFFECT_ID` (warning).** Two inline effects (across interactions/sequences) declaring
   the same `effectId` that is _not_ a registry key — ambiguous for `animationEnd` chaining and for
   sequence references. (Registry keys are already unique by object-key.) Anchor at the later
   occurrence.

### C. Element-selection & state-effect coherence (warning)

6. **`LIST_ITEM_SELECTOR_WITHOUT_CONTAINER`.** Source: full-lean/integration "Element Resolution"
   (priority order requires `listContainer` for `listItemSelector` to mean anything). If
   `listItemSelector` is present but `listContainer` is absent — on an interaction **or** an effect —
   the selector is inert → warning. Path at the offending field.

7. **`REDUNDANT_SELECTOR_WITH_LIST_ITEM` (info).** When `listContainer` + `listItemSelector` +
   `selector` are all present, `selector` is ignored by the documented resolution priority → info.

8. **`EMPTY_STYLE_PROPERTIES` (warning).** A `StateEffect` whose `transition.styleProperties` is `[]`
   (or whose `transitionProperties` is `[]`) toggles nothing. Source: hover.md/click.md Rule 2.
   (Schema currently allows empty arrays.)

9. **`STATE_REMOVE_WITHOUT_EFFECT_ID` (info).** Source: hover.md Rule 2 ("`'remove'` — use with
   provided `effectId` to map to a matching `add`"). A `StateEffect` with `stateAction: 'remove'`
   and no `effectId` has nothing to pair with → info.

### D. Best-practice / style nudges (info, default-low, easily `off`)

10. **`RECOMMENDED_FILL_BOTH`.** Source: full-lean "fill guidance"; hover.md/click.md CRITICAL
    ("always include `fill: 'both'` for alternate/repeat"). Emit info when:
    - a `viewProgress` or `pointerMove` effect omits `fill: 'both'`; or
    - a `TimeEffect` with `triggerType ∈ {alternate, repeat, state}` omits `fill: 'both'`.
11. **`UNKNOWN_NAMED_EFFECT` (opt-in warning).** Source: full-lean Common-Pitfalls / README AI
    guidelines ("Do not invent `namedEffect` types"). Only runs when `options.knownEffects` is
    supplied (or when a bundled preset-name list is opted into). Warn if `namedEffect.type ∉
knownEffects`. Off by default to avoid false positives for custom-registered effects.
12. **`POINTER_AXIS_IGNORED` (info).** Source: pointermove.md PointerMoveParams ("axis ignored for
    `namedEffect`/`customEffect`"). `pointerMove` interaction with `params.axis` set whose effect
    uses `namedEffect`/`customEffect` → info.
13. **`RANGE_OFFSET_OUT_OF_RANGE` (info).** Source: viewprogress.md "value is 0–100" for percentage
    offsets. For a `RangeOffset.offset` with `unit: 'percentage'` and `value < 0` or `> 100` → info.
14. **`KEYFRAME_PROP_NOT_CAMEL_CASE` (info).** Source: every trigger rule ("property names in
    camelCase"). A `keyframeEffect.keyframes` key containing `-` (e.g. `background-color`) is invalid
    for WAAPI → info suggesting the camelCase form. (Allow CSS custom properties `--*` and `offset`/
    `easing`/`composite` WAAPI keys.)
15. **`INVALID_INSET` (info).** Source: viewEnter `inset` ("like `view-timeline-inset`"). Validate
    the `params.inset` string is 1–4 whitespace-separated CSS lengths/percentages via regex.

### E. Correctness fixes to existing checks — ✅ DONE (unintentional bugs, fixed in this branch)

These were existing schema rules that contradicted the rule files and produced **false-positive
errors**. Confirmed unintentional and **already fixed** (see commit on this branch):

16. **`iterations: Infinity` was wrongly rejected for time effects.** ✅ Fixed. The shared
    `AnimationEffectBase.iterations` was `z.number().int().positive()`, which rejects `Infinity`
    (Zod v4's `z.number()` rejects `Infinity` as `invalid_type`) and `0` — but full-lean Time-based
    and hover/viewEnter rules document `iterations: Infinity` for continuous loops and "`0` is
    treated as Infinity". `iterations` was split out of the shared base into two schemas
    (`src/schema/effects.ts`):
    - **`TimeIterations`** (`TimeEffect`/`TimeEffectRef`, incl. sequence effects):
      `z.number().nonnegative().or(z.literal(Infinity))` — allows `Infinity`, `0`, and finite
      non-negative values; negatives still surface as `NEGATIVE_ITERATIONS` (`too_small`).
    - **`ScrubIterations`** (`viewProgress`/`pointerMove` effects):
      `z.union([z.number().int().positive(), z.literal(Infinity)])` + a `superRefine` that emits the
      new **`ITERATIONS_INFINITY_ON_SCRUB`** (error) code, per full-lean "Scroll/Pointer-driven …
      `iterations` NOT Infinity". Non-positive/non-integer values are still rejected.
17. **hover/click/interest/activate rejected `TimeEffect`.** ✅ Fixed. The branch handling these
    triggers only unioned `StateEffect`/`StateEffectRef`, so a `hover`/`click` with
    `keyframeEffect`/`namedEffect`/`customEffect` + `duration`/`triggerType` (hover.md/click.md
    Rules 1 & 3) failed validation. Its `effects` array is now
    `z.array(z.union([TimeEffect, TimeEffectRef, StateEffect, StateEffectRef]))`, and the schema was
    renamed `StateInteraction` → **`DiscreteInteraction`** to reflect that it accepts both effect
    families. Because every effect schema is `.strict()`, an effect mixing `triggerType` **and**
    `stateAction` matches neither branch and is rejected as `SCHEMA_INVALID_UNION` — so the
    "do NOT mix `triggerType` and `stateAction`" rule (full-lean hover/click) is enforced
    structurally without a dedicated code. (A friendlier `MIXED_TRIGGERTYPE_STATEACTION` message
    remains optional future polish.)

Tests added: `test/rules/discreteTriggerEffects.spec.ts` (time + state effects on hover/click/
activate/interest; mixed-field rejection) and an `iterations: Infinity` block in
`test/rules/numericBounds.spec.ts` (allowed on time effects incl. `0`; `ITERATIONS_INFINITY_ON_SCRUB`
on `viewProgress`/`pointerMove`). Full suite green (90 tests) and `yarn lint` clean.

---

## 4. Implementation steps (ordered)

1. ~~Verify and land the two §3.E gap fixes.~~ ✅ **Done** — `iterations: Infinity` split
   (time vs scrub, new `ITERATIONS_INFINITY_ON_SCRUB`) and hover/click/activate/interest now accept
   `TimeEffect`s (`StateInteraction` → `DiscreteInteraction`). Tests + lint green.
2. Refactor `walkConfig` to pass the owning interaction (`owner`) to `onEffect`/`onSequence`
   (architecture §2.1). Update existing callers.
3. Add helpers: `targetsSameElementAsSource`, `isScrollPresetType`, `pushWarning` (§2.5).
4. Implement error-level checks in `superRefine`: `ANIMATION_END_CYCLE`,
   `ITERATIONS_INFINITY_ON_SCRUB`, `MIXED_TRIGGERTYPE_STATEACTION` (if §3.E.17 landed).
5. Implement warning/info checks in the `transform` warnings pass: A1–A3, B4–B5, C6–C9, D10–D15.
6. Extend `RULE_CODE_MAP` with all new codes grouped into rule categories; add `knownEffects` to
   `ValidateOptions`; thread it through `validateInteractConfig` → checks.
7. Ensure `finalize()` ordering/`max`/`strict`/`severityOverrides` cover the new codes (they will,
   via `RULE_CODE_MAP`).

## 5. Testing plan

- One spec per new rule under `test/rules/` (mirror existing structure:
  `sameElementRetrigger.spec.ts`, `hitAreaShift.spec.ts`, `scrollPresetRange.spec.ts`,
  `animationEndGraph.spec.ts`, `elementSelection.spec.ts`, `stateEffectCoherence.spec.ts`,
  `recommendedFill.spec.ts`, `unknownNamedEffect.spec.ts`, `keyframeStyle.spec.ts`, …). Each spec
  asserts: positive case emits the code at the right `path` + severity; the documented valid case
  emits nothing.
- Add cases to `validate.spec.ts` for `severityOverrides`/`strict`/`max` on the new categories and
  for `knownEffects`.
- Update `type-parity.spec.ts` only if `ValidateOptions` changes (it does: `knownEffects`).
- Regression: confirm `VALID_CONFIG` and existing fixtures stay clean (watch for new info-level
  noise — keep §3.D defaults low / behind categories).

## 6. Out of scope (cannot be done statically)

- Anything needing the DOM: `overflow: hidden` ancestors breaking `viewProgress`, `pointer-events:
none` on a source, element existence for a `key`, `:first-child` presence.
- Whether a `namedEffect`'s options are valid (preset option schemas live in `@wix/motion-presets`;
  only the **name** can be checked, and only opt-in — §3.D.11).
- Reduced-motion alternatives, perspective usage, and other authoring guidance with no static signal.
