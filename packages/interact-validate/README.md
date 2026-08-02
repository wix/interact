<!-- AI: agent rules at https://wix.github.io/interact/rules/validate.md -->

# @wix/interact-validate

Schema + referential + semantic validation for `@wix/interact`'s `InteractConfig`, powered by [zod](https://zod.dev).

[![npm version](https://img.shields.io/npm/v/@wix/interact-validate.svg)](https://www.npmjs.com/package/@wix/interact-validate)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@wix/interact-validate)](https://bundlephobia.com/package/@wix/interact-validate)
[![license](https://img.shields.io/npm/l/@wix/interact-validate.svg)](https://github.com/wix/interact/blob/master/LICENSE)

## Why

`@wix/interact` configs are plain JSON — easy to author, generate, and serialize, but also easy to get subtly wrong. `@wix/interact-validate` catches those mistakes **statically**, before the config reaches the runtime:

- **Build-time / CI guardrails** — fail a build on a malformed config instead of debugging in the browser.
- **LLM-output validation** — run every agent-generated config through the validator and fix the errors before shipping.
- **Editor / tooling integration** — surface precise, path-anchored diagnostics.

It runs with no DOM and no browser, so it works identically in Node, CI, and the server.

## Install

```bash
npm install @wix/interact-validate
```

`@wix/interact` is a **peer dependency** — the config types come from there, so the validator never drifts from the runtime shape. `zod` is a regular dependency.

## Quick start

```ts
import { validateInteractConfig } from '@wix/interact-validate';

const result = validateInteractConfig(config);
// → { valid: boolean; errors: ValidationError[] }

if (!result.valid) {
  for (const e of result.errors) {
    console.error(`[${e.severity}] ${e.code} at ${e.path.join('.')}: ${e.message}`);
  }
}
```

Or assert and narrow the type in one call:

```ts
import { assertValidInteractConfig } from '@wix/interact-validate';

assertValidInteractConfig(config); // throws InteractValidationError on failure
// `config` is now typed as InteractConfig
```

## API reference

### `validateInteractConfig(input, options?) → ValidationResult`

Validates `input` and returns every surfaced issue. Never throws.

- `valid` is `true` when no remaining issue has severity `'error'` — **warnings alone keep `valid: true`.**
- `errors` contains **all** issues (both `'error'` and `'warning'`); filter on `severity` to separate them.
- Issues are sorted lexicographically by `path`.

Validation runs in two layers: a **structural** zod parse first (shape, enums, numeric bounds, "exactly one effect source", trigger/effect compatibility), then — only if that passes — **referential + semantic** checks (dangling `effectId`/`sequenceId`/`conditions` references, unused definitions, duplicate keyframe names, media-query syntax).

### `assertValidInteractConfig(input) → asserts input is InteractConfig`

Calls `validateInteractConfig` with default options and throws `InteractValidationError` when `valid` is `false`. On success it returns `void` and TypeScript narrows `input` to `InteractConfig`. (Warnings do not throw.)

### `ValidationResult`

```ts
type ValidationResult = {
  valid: boolean;
  errors: ValidationError[]; // all issues — errors and warnings
};
```

### `ValidationError`

```ts
type ValidationError = {
  code: string; // domain code — see the catalogue below
  message: string; // human-readable description
  path: (string | number)[]; // e.g. ['interactions', 0, 'effects', 0, 'duration']
  severity: 'error' | 'warning';
  hint?: string; // optional remediation hint (reserved; not currently populated)
};
```

### `ValidateOptions`

```ts
type ValidateOptions = {
  strict?: boolean;
  max?: number;
  severityOverrides?: Record<string, 'error' | 'warning' | 'off'>;
};
```

| Option              | Effect                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `strict`            | Promotes every remaining issue to `'error'` — any warning then fails the config.                                        |
| `max`               | Truncates the returned list to the first N issues (after sorting).                                                      |
| `severityOverrides` | Per-**rule-category** override (see [Severity model](#severity-model)). Keys are rule categories, not individual codes. |

### `InteractValidationError`

Thrown by `assertValidInteractConfig`. `.name` is `'InteractValidationError'`, `.message` is `'Interact config validation failed with N issue(s).'`, and `.errors` is the `ValidationError[]`.

### Exported zod schemas

For host-project schema composition, the package re-exports its schemas:

`InteractConfigSchema`, `Interaction`, `TriggerType`, `ViewEnterParams`, `PointerMoveParams`, `AnimationEndParams`, `TriggerParams`, `Effect`, `EffectRef`, `EffectSource`, `TimeEffect`, `NamedEffect`, `SequenceConfig`, `SequenceConfigRef`, `Keyframe`, `LengthPercentage`, `RangeOffset`, `Condition`.

Plus the types `InteractConfig`, `ConditionDef`, `SequenceOptionsConfig`, `InteractionDef`, `InteractionTrigger`, `Severity`, `ValidationError`, `ValidationResult`, and `ValidateOptions`.

```ts
import { InteractConfigSchema } from '@wix/interact-validate';
import { z } from 'zod';

const ExperienceSchema = z.object({
  version: z.string(),
  interact: InteractConfigSchema, // strict — unknown top-level keys are rejected
});
```

> `InteractConfigSchema` carries a `.transform()`, so a successful `.parse()` returns the config augmented with an internal `warnings` array (`validateInteractConfig` consumes that for you). `customEffect` and function-valued `offsetEasing` are accepted as opaque functions and not deep-validated. Interactions and effects also accept `$`-prefixed plugin fields (e.g. `$splitText`) — config routed to `Interact.use()` plugins. Their schemas use `.catchall(z.unknown())` + a key check rather than `.strict()`: `$`-prefixed fields are accepted with opaque values, while any non-prefixed unknown key is still rejected as `SCHEMA_UNRECOGNIZED_KEYS`.

## Severity model

Every issue is `'error'` or `'warning'`. `valid` is `true` **iff** no `'error'` remains.

- **`strict: true`** promotes all remaining issues to `'error'`.
- **`severityOverrides`** is keyed by **rule category**, and only these three categories are registered/overridable:

| Rule category            | Covers codes                                                                | Default severity |
| ------------------------ | --------------------------------------------------------------------------- | ---------------- |
| `UNUSED_DEFINITION`      | `UNUSED_EFFECT`, `UNUSED_SEQUENCE`, `UNUSED_CONDITION`                      | warning          |
| `UNIQUE_DEFINITION_IDS`  | `DUPLICATE_KEYFRAME_NAME`                                                   | warning          |
| `VALID_MEDIA_QUERIES`    | `INVALID_MEDIA_QUERY`                                                       | error            |
| `SAME_ELEMENT_RETRIGGER` | `SAME_ELEMENT_RETRIGGER`                                                    | warning          |
| `HIT_AREA_SHIFT`         | `HIT_AREA_SHIFT`                                                            | warning          |
| `SCROLL_RANGE`           | `SCROLL_PRESET_MISSING_RANGE`, `SCROLL_PRESET_BAD_RANGE`                    | warning          |
| `ANIMATION_END_GRAPH`    | `ANIMATION_END_SELF_REFERENCE`, `ANIMATION_END_CYCLE`                       | warning          |
| `ELEMENT_SELECTION`      | `LIST_ITEM_SELECTOR_WITHOUT_CONTAINER`, `REDUNDANT_SELECTOR_WITH_LIST_ITEM` | warning          |
| `STATE_EFFECT`           | `EMPTY_STYLE_PROPERTIES`, `STATE_REMOVE_WITHOUT_EFFECT_ID`                  | warning          |
| `RECOMMENDED_FILL`       | `RECOMMENDED_FILL_BOTH`                                                     | info             |
| `POINTER_AXIS`           | `POINTER_AXIS_IGNORED`                                                      | warning          |
| `KEYFRAME_STYLE`         | `KEYFRAME_PROP_NOT_CAMEL_CASE`                                              | warning          |
| `VIEW_INSET`             | `INVALID_INSET`                                                             | warning          |

Set a category to `'off'` to drop those issues, or `'warning'` / `'error'` to set their severity. **All other codes** (every `SCHEMA_*`, numeric, effect-source, and referential code) are not in a category and **cannot** be silenced or re-leveled via `severityOverrides` — they always emit at their built-in severity. Precedence: `'off'` first (drops the issue), then a `'warning'`/`'error'` override, then `strict` (forces the rest to `'error'`).

```ts
validateInteractConfig(config, {
  strict: true, // fail on warnings in CI
  severityOverrides: { UNUSED_DEFINITION: 'off' }, // …except dead-config hygiene
  max: 50,
});
```

## Rule catalogue

The single source of truth for every code the validator emits. The agent-facing copy lives at [`rules/validate.md`](https://wix.github.io/interact/rules/validate.md).

### Errors (severity: `error`)

| Code                             | Trigger                                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `SCHEMA_INVALID_TYPE`            | A field has the wrong type (e.g. `interactions` missing or not an array).                                                                    |
| `SCHEMA_UNRECOGNIZED_KEYS`       | Unknown keys present — every object is strict.                                                                                               |
| `SCHEMA_INVALID_UNION`           | No union variant matched: bad `trigger`, trigger/effect mismatch, multiple inline effect sources, or `triggerType` mixed with `stateAction`. |
| `SCHEMA_INVALID_LITERAL`         | Invalid enum/literal (`fill`, `composite`, `stateAction`, `triggerType`, `RangeOffset.name`, …).                                             |
| `SCHEMA_TOO_SMALL`               | Below a minimum (empty `key`/`predicate`, empty `keyframes`/`effects` array).                                                                |
| `SCHEMA_INVALID`                 | Catch-all for any other unclassified zod issue.                                                                                              |
| `NEGATIVE_DURATION`              | `duration` is negative.                                                                                                                      |
| `NEGATIVE_DELAY`                 | `delay` is negative.                                                                                                                         |
| `NEGATIVE_ITERATIONS`            | `iterations` is negative (or `0`/non-integer on a scroll/pointer effect).                                                                    |
| `NEGATIVE_OFFSET`                | A sequence `offset` is negative.                                                                                                             |
| `THRESHOLD_OUT_OF_RANGE`         | `viewEnter` `params.threshold` outside `[0, 1]`.                                                                                             |
| `ITERATIONS_INFINITY_ON_SCRUB`   | `iterations: Infinity` on a `viewProgress`/`pointerMove` effect (time effects DO allow `Infinity`).                                          |
| `MULTIPLE_EFFECT_SOURCES`        | Not exactly one of `namedEffect`/`keyframeEffect`/`customEffect` (surfaces when resolving an `effectId` reference).                          |
| `MULTIPLE_TRANSITION_SOURCES`    | Not exactly one of `transition`/`transitionProperties` on a state effect.                                                                    |
| `EFFECT_ID_NOT_FOUND`            | `effectId` references a key absent from `config.effects`.                                                                                    |
| `ANIMATION_END_EFFECT_NOT_FOUND` | `animationEnd` `params.effectId` references a missing effect.                                                                                |
| `SEQUENCE_ID_NOT_FOUND`          | `sequenceId` references a key absent from `config.sequences`.                                                                                |
| `CONDITION_NOT_FOUND`            | A `conditions[]` entry references a key absent from `config.conditions`.                                                                     |
| `INTERACTION_EMPTY`              | An interaction has neither `effects` nor `sequences`.                                                                                        |
| `INVALID_MEDIA_QUERY`            | A `media` condition's `predicate` fails static syntax validation. (`VALID_MEDIA_QUERIES` category.)                                          |
| `ANIMATION_END_CYCLE`            | A cycle of `animationEnd` interactions wait on each other → deadlock. (`ANIMATION_END_GRAPH` category.)                                      |

### Warnings (severity: `warning`)

These encode statically-detectable authoring pitfalls from the trigger rule files. Each belongs to a [rule category](#severity-model), so set the category to `'off'` to silence it or `'error'` to make it fail `valid`.

| Code                                   | Trigger                                                                                                                                     | Rule category            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `UNUSED_EFFECT`                        | A `config.effects` entry is never referenced.                                                                                               | `UNUSED_DEFINITION`      |
| `UNUSED_SEQUENCE`                      | A `config.sequences` entry is never referenced.                                                                                             | `UNUSED_DEFINITION`      |
| `UNUSED_CONDITION`                     | A `config.conditions` entry is never referenced.                                                                                            | `UNUSED_DEFINITION`      |
| `DUPLICATE_KEYFRAME_NAME`              | A `keyframeEffect.name` is reused across effects.                                                                                           | `UNIQUE_DEFINITION_IDS`  |
| `SAME_ELEMENT_RETRIGGER`               | `viewEnter` with a non-`once` `triggerType` on the same source+target element.                                                              | `SAME_ELEMENT_RETRIGGER` |
| `HIT_AREA_SHIFT`                       | `hover`/`pointerMove` `keyframeEffect` with a `translate`/`scale`/`matrix` transform on the same source+target element.                     | `HIT_AREA_SHIFT`         |
| `SCROLL_PRESET_MISSING_RANGE`          | A `*Scroll` `namedEffect` on `viewProgress` omits `range`.                                                                                  | `SCROLL_RANGE`           |
| `SCROLL_PRESET_BAD_RANGE`              | A scroll preset `range` is not `'in'`/`'out'`/`'continuous'`.                                                                               | `SCROLL_RANGE`           |
| `ANIMATION_END_SELF_REFERENCE`         | An `animationEnd` interaction waits on an effect it also produces (never starts).                                                           | `ANIMATION_END_GRAPH`    |
| `LIST_ITEM_SELECTOR_WITHOUT_CONTAINER` | `listItemSelector` present without `listContainer` (inert).                                                                                 | `ELEMENT_SELECTION`      |
| `REDUNDANT_SELECTOR_WITH_LIST_ITEM`    | `selector` ignored when `listContainer` + `listItemSelector` are both present.                                                              | `ELEMENT_SELECTION`      |
| `EMPTY_STYLE_PROPERTIES`               | A state effect's `transition.styleProperties` / `transitionProperties` is `[]` (toggles nothing).                                           | `STATE_EFFECT`           |
| `STATE_REMOVE_WITHOUT_EFFECT_ID`       | `stateAction: 'remove'` with no `effectId` to pair with a matching `'add'`.                                                                 | `STATE_EFFECT`           |
| `RECOMMENDED_FILL_BOTH`                | A scrubbed (`viewProgress`/`pointerMove`) or toggling (`alternate`/`repeat`/`state`) effect omits `fill: 'both'`.                           | `RECOMMENDED_FILL`       |
| `RECOMMENDED_FILL_BACKWARDS`           | A `viewEnter` + `once` named/keyframe effect targeting another element or using a same-element delay omits `fill: 'backwards'` or `'both'`. | `RECOMMENDED_FILL`       |
| `POINTER_AXIS_IGNORED`                 | `pointerMove` `params.axis` set on a `namedEffect`/`customEffect` (axis only applies to `keyframeEffect`).                                  | `POINTER_AXIS`           |
| `KEYFRAME_PROP_NOT_CAMEL_CASE`         | A `keyframeEffect` property name is kebab-case (not WAAPI camelCase).                                                                       | `KEYFRAME_STYLE`         |
| `INVALID_INSET`                        | `viewEnter` `params.inset` is not 1–4 CSS lengths/percentages.                                                                              | `VIEW_INSET`             |

## Usage recipes

### CI check script

```ts
// scripts/validate-config.ts
import { validateInteractConfig } from '@wix/interact-validate';
import config from '../src/interact.config.json';

const { valid, errors } = validateInteractConfig(config, { strict: true });
for (const e of errors) {
  console.error(`[${e.severity}] ${e.code} at ${e.path.join('.')}: ${e.message}`);
}
process.exit(valid ? 0 : 1);
```

### Build-time gate

```ts
import { assertValidInteractConfig } from '@wix/interact-validate';

// throws and aborts the build if the config is invalid
assertValidInteractConfig(config);
const css = generate(config);
```

### Validating LLM output

```ts
const config = JSON.parse(modelOutput);
const { valid, errors } = validateInteractConfig(config);
if (!valid) {
  // feed `errors` back to the model to repair, or reject the output
}
```

### Composing with the exported schemas

```ts
import { InteractConfigSchema } from '@wix/interact-validate';
import { z } from 'zod';

const DocumentSchema = z.object({
  meta: z.object({ id: z.string() }),
  interact: InteractConfigSchema,
});
```

## Relationship to `@wix/interact`

- `@wix/interact` is a **peer dependency** (`^2.4.0`); install it alongside this package.
- All config **types** come from `@wix/interact` and are re-exported here — the zod schemas are kept in lockstep with those types by `type-parity.spec.ts`, a compile-time drift guard.
- This package does **not** import the `@wix/interact` runtime, so `zod` stays out of the runtime bundles — it is only loaded when you import the validator.

## Links

- [`@wix/interact` README](https://github.com/wix/interact/blob/master/packages/interact/README.md)
- [Agent rules — `rules/validate.md`](https://wix.github.io/interact/rules/validate.md)
- [Docs site](https://wix.github.io/interact/)
- [llms.txt](https://wix.github.io/interact/llms.txt) · [llms-full.txt](https://wix.github.io/interact/llms-full.txt)

## License

[MIT](https://github.com/wix/interact/blob/master/LICENSE)
