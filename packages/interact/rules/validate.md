# Validation Rules for @wix/interact-validate

Rules for using `@wix/interact-validate` — validate an `InteractConfig` before it reaches the runtime.

`@wix/interact-validate` is a standalone, zod-powered validator for the `@wix/interact` `InteractConfig` shape. It runs **statically** (no DOM, no browser, no runtime), so it is safe in build tools, CI, and server-side code. It is a separate package from `@wix/interact` and declares `@wix/interact` as a peer dependency — its config types come from there, so the two never drift.

## Table of Contents

- [When to validate](#when-to-validate)
- [API](#api)
  - [validateInteractConfig](#validateinteractconfig)
  - [assertValidInteractConfig](#assertvalidinteractconfig)
  - [ValidateOptions](#validateoptions)
  - [ValidationError shape](#validationerror-shape)
  - [InteractValidationError](#interactvalidationerror)
- [Severity, strict, and overrides](#severity-strict-and-overrides)
- [Error-code catalogue](#error-code-catalogue)
- [Zod schema exports](#zod-schema-exports)
- [Generation guidance for agents](#generation-guidance-for-agents)
- [Limitations — what is NOT checked](#limitations--what-is-not-checked)

---

## When to validate

- **In CI / at build time** — gate a build on a clean config.
- **Before `Interact.create()` / `generate()`** — fail fast on a malformed config instead of debugging at runtime.
- **On LLM-generated configs** — run the validator on any config an agent produces and fix every `error` (ideally every `warning`) before emitting it.

---

## API

Two functions cover most use. Import from the package root — there is no subpath:

```ts
import { validateInteractConfig, assertValidInteractConfig } from '@wix/interact-validate';
```

### validateInteractConfig

```ts
const result = validateInteractConfig(config, options?);
// → { valid: boolean; errors: ValidationError[] }

if (!result.valid) {
  for (const e of result.errors) {
    console.warn(`[${e.severity}] ${e.code}: ${e.message} (at ${e.path.join('.')})`);
  }
}
```

**Rules:**

- `valid` is `true` when no remaining issue has severity `'error'`. **Warnings alone do not make `valid: false`.**
- `errors` holds **all** surfaced issues — both `'error'` and `'warning'` severities. Filter on `severity` to separate them.
- Issues are sorted lexicographically by `path`.
- Validation runs in two layers: a **structural** zod parse first (produces `SCHEMA_*` and numeric/threshold codes); if that succeeds, **referential + semantic** checks run (dangling references, unused definitions, duplicate keyframe names, media-query syntax). If the structural parse fails, the semantic layer is skipped.

### assertValidInteractConfig

```ts
assertValidInteractConfig(config); // asserts: input is InteractConfig — throws on failure
```

**Rules:**

- Throws `InteractValidationError` when `valid` is `false` (i.e. at least one `'error'`). Warnings alone do not throw.
- After it returns, TypeScript narrows the argument to `InteractConfig`.
- It calls `validateInteractConfig` with default options (no `strict`/`max`/overrides). For custom options, call `validateInteractConfig` directly and inspect `result.valid`.

### ValidateOptions

```ts
type ValidateOptions = {
  strict?: boolean;
  max?: number;
  severityOverrides?: Record<string, 'error' | 'warning' | 'off'>;
};
```

| Option              | Effect                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| `strict`            | Promotes every remaining issue to `'error'`. Use in CI to fail on warnings too.                          |
| `max`               | Truncates the returned list to the first N issues (after sorting). Useful for inline diagnostics.        |
| `severityOverrides` | Per-**rule-category** severity override. Keys are rule-category codes (see below), not individual codes. |

### ValidationError shape

```ts
type ValidationError = {
  code: string; // domain code — see catalogue below
  message: string; // human-readable description
  path: (string | number)[]; // path to the offending value, e.g. ['interactions', 0, 'effects', 0]
  severity: 'error' | 'warning';
  hint?: string; // optional remediation hint (reserved; not currently populated)
};
```

### InteractValidationError

```ts
import { InteractValidationError } from '@wix/interact-validate';

try {
  assertValidInteractConfig(untrusted);
} catch (err) {
  if (err instanceof InteractValidationError) {
    console.error(err.errors); // ValidationError[]
  }
}
```

**Rules:**

- `.name` is `'InteractValidationError'`.
- `.message` is `'Interact config validation failed with N issue(s).'`
- `.errors` is the same array `validateInteractConfig` would return.

---

## Severity, strict, and overrides

Severity is one of `'error' | 'warning'`. There are exactly two levers:

1. **`strict: true`** — promotes all remaining issues to `'error'`, so any warning fails the config.
2. **`severityOverrides`** — keyed by **rule category**, not by individual code. Only the following three categories are registered and overridable:

| Rule category           | Covers codes                                           | Default severity |
| ----------------------- | ------------------------------------------------------ | ---------------- |
| `UNUSED_DEFINITION`     | `UNUSED_EFFECT`, `UNUSED_SEQUENCE`, `UNUSED_CONDITION` | warning          |
| `UNIQUE_DEFINITION_IDS` | `DUPLICATE_KEYFRAME_NAME`                              | warning          |
| `VALID_MEDIA_QUERIES`   | `INVALID_MEDIA_QUERY`                                  | error            |

For each category, set `'off'` to drop those issues entirely, `'warning'` / `'error'` to set their severity:

```ts
validateInteractConfig(config, {
  severityOverrides: {
    UNUSED_DEFINITION: 'off', // silence dead-config hygiene warnings
    VALID_MEDIA_QUERIES: 'warning', // demote bad media-query syntax from error to warning
  },
});
```

**Important:** all other codes (every `SCHEMA_*`, numeric, effect-source, and referential code) are **not** in a rule category and therefore **cannot** be silenced or re-leveled via `severityOverrides`. They are always emitted at their built-in severity (and promoted by `strict`). Precedence: `'off'` is applied first (the issue is dropped), then any `'warning'`/`'error'` override, then `strict` (which forces everything that remains to `'error'`).

---

## Error-code catalogue

This is the authoritative list of every code the validator emits today. Codes not listed here are not produced.

### Structural / schema errors (severity: error)

| Code                       | What it flags                                                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SCHEMA_INVALID_TYPE`      | A field has the wrong type (e.g. `interactions` missing or not an array).                                                                                                                        |
| `SCHEMA_UNRECOGNIZED_KEYS` | Unknown keys are present — every object is `.strict()`.                                                                                                                                          |
| `SCHEMA_INVALID_UNION`     | A value matches no variant of a union. Covers a bad `trigger`, a trigger/effect mismatch, an effect defining more than one source inline, and an effect mixing `triggerType` with `stateAction`. |
| `SCHEMA_INVALID_LITERAL`   | An invalid enum/literal value (e.g. an unknown `fill`, `composite`, `stateAction`, `triggerType`, or `RangeOffset.name`).                                                                        |
| `SCHEMA_TOO_SMALL`         | Below a minimum bound (e.g. empty `key`, empty `predicate`, empty `keyframes`/`effects` array).                                                                                                  |
| `SCHEMA_INVALID`           | Catch-all for any other unclassified zod issue.                                                                                                                                                  |

### Numeric-bound errors (severity: error)

| Code                           | What it flags                                                                                                                                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEGATIVE_DURATION`            | `duration` is negative.                                                                                                                                                                                               |
| `NEGATIVE_DELAY`               | `delay` is negative.                                                                                                                                                                                                  |
| `NEGATIVE_ITERATIONS`          | `iterations` is negative (or, on scroll/pointer effects, `0` / non-integer).                                                                                                                                          |
| `NEGATIVE_OFFSET`              | A sequence `offset` is negative.                                                                                                                                                                                      |
| `THRESHOLD_OUT_OF_RANGE`       | `viewEnter` `params.threshold` is outside `[0, 1]`.                                                                                                                                                                   |
| `ITERATIONS_INFINITY_ON_SCRUB` | `iterations: Infinity` on a `viewProgress` / `pointerMove` effect. Scrubbed effects are progress-driven, so an infinite count is invalid. (Time-based effects DO allow `Infinity`, and `0` is treated as `Infinity`.) |

### Effect-source errors (severity: error)

| Code                          | What it flags                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MULTIPLE_EFFECT_SOURCES`     | An effect does not define **exactly one** of `namedEffect` / `keyframeEffect` / `customEffect` (or, after merging an `effectId` reference with its registry effect, ends up with zero or more than one source). Inline effects that violate this surface as `SCHEMA_INVALID_UNION`; this code surfaces specifically when resolving an `effectId` reference. |
| `MULTIPLE_TRANSITION_SOURCES` | A state effect does not define **exactly one** of `transition` / `transitionProperties`. Primarily surfaces when using the exported `StateEffect` schemas directly in host composition.                                                                                                                                                                     |

### Referential errors (severity: error)

| Code                             | What it flags                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `EFFECT_ID_NOT_FOUND`            | An effect's `effectId` references a key absent from `config.effects`.          |
| `ANIMATION_END_EFFECT_NOT_FOUND` | An `animationEnd` interaction's `params.effectId` references a missing effect. |
| `SEQUENCE_ID_NOT_FOUND`          | A `sequenceId` references a key absent from `config.sequences`.                |
| `CONDITION_NOT_FOUND`            | A `conditions[]` entry references a key absent from `config.conditions`.       |

### Other structural errors (severity: error)

| Code                  | What it flags                                                                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `INTERACTION_EMPTY`   | An interaction has neither `effects` nor `sequences`. (`viewProgress`/`pointerMove` require a non-empty `effects` array and instead surface `SCHEMA_TOO_SMALL`.)              |
| `INVALID_MEDIA_QUERY` | A `media` condition's `predicate` fails static media-query syntax validation (balanced parentheses + allowed characters). Belongs to the `VALID_MEDIA_QUERIES` rule category. |

### Best-practice warnings (severity: warning)

| Code                      | What it flags                                                                | Rule category           |
| ------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| `UNUSED_EFFECT`           | A `config.effects` entry is defined but never referenced by any interaction. | `UNUSED_DEFINITION`     |
| `UNUSED_SEQUENCE`         | A `config.sequences` entry is defined but never referenced.                  | `UNUSED_DEFINITION`     |
| `UNUSED_CONDITION`        | A `config.conditions` entry is defined but never referenced.                 | `UNUSED_DEFINITION`     |
| `DUPLICATE_KEYFRAME_NAME` | A `keyframeEffect.name` is reused across effects in the same config.         | `UNIQUE_DEFINITION_IDS` |

---

## Zod schema exports

The package re-exports its zod schemas so host projects can compose their own schemas:

```ts
import {
  InteractConfigSchema,
  Interaction,
  TriggerType,
  ViewEnterParams,
  PointerMoveParams,
  AnimationEndParams,
  TriggerParams,
  Effect,
  EffectRef,
  EffectSource,
  TimeEffect,
  NamedEffect,
  SequenceConfig,
  SequenceConfigRef,
  Keyframe,
  LengthPercentage,
  RangeOffset,
  Condition,
} from '@wix/interact-validate';
import { z } from 'zod';

const ExperienceSchema = z.object({
  version: z.string(),
  interact: InteractConfigSchema,
});
```

**Rules:**

- `InteractConfigSchema` is `.strict()` — unrecognized top-level keys produce `SCHEMA_UNRECOGNIZED_KEYS`.
- `InteractConfigSchema` carries a `.transform()`, so a successful `.parse()` returns the config augmented with an internal `warnings` array; `validateInteractConfig` consumes that for you.
- `customEffect` and function-valued `offsetEasing` are accepted as opaque functions (`z.custom<Function>`) — they are not deep-validated, so JS-authored configs with function fields validate correctly.

---

## Generation guidance for agents

- After generating a config, run `validateInteractConfig(config)` and **fix every `error`** before emitting. Prefer to fix `warning`s too.
- For a hard gate, use `assertValidInteractConfig(config)` or `validateInteractConfig(config, { strict: true })`.
- Mirror the core generation rules: do not invent `namedEffect` types, do not attach DOM listeners manually, use `overflow: clip` (not `hidden`) on scroll-tracked ancestors, and pre-render CSS with `generate(config)`. See [full-lean.md](https://wix.github.io/interact/rules/full-lean.md).

---

## Limitations — what is NOT checked

The validator is **static**. It cannot see the DOM, the browser, or the preset registry, so the following are out of scope — keep applying the trigger rule files for these:

- **DOM-dependent issues** — element existence for a `key`/`selector`, `overflow: hidden` ancestors breaking `viewProgress`, `pointer-events: none` on a source, `:first-child` presence.
- **Preset correctness** — only the config shape is checked, never whether a `namedEffect.type` is a registered preset or whether its options are valid. See [scroll-presets and other preset rules](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/presets-main.md).
- **Documented authoring pitfalls with no static signal**, which the trigger rule files cover instead:
  - Same source+target on `viewEnter` with a non-`once` `triggerType` → [viewenter.md](https://wix.github.io/interact/rules/viewenter.md).
  - Hit-area shift from animating size/position on `hover` / `pointerMove` → [hover.md](https://wix.github.io/interact/rules/hover.md), [pointermove.md](https://wix.github.io/interact/rules/pointermove.md).
  - Scroll presets needing a `range` / `rangeStart` / `rangeEnd` → [viewprogress.md](https://wix.github.io/interact/rules/viewprogress.md).
  - `fill: 'both'` recommendations for `alternate` / `repeat` / `state` → [full-lean.md](https://wix.github.io/interact/rules/full-lean.md).

For the full API, usage recipes, and the same catalogue in package form, see the [`@wix/interact-validate` README](https://github.com/wix/interact/blob/master/packages/interact-validate/README.md).
