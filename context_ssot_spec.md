# Phase 0 Specification: Context SSOT Infrastructure

This document is the detailed implementation spec for **Phase 0** of the [Context SSOT Restructure plan](.cursor/plans/context_ssot_restructure_c6889ec0.plan.md). Phase 0 delivers the shared tooling (YAML schema, marker syntax, build script, validation script) that all subsequent per-package phases depend on.

---

## Table of Contents

- [1. YAML Glossary Schema](#1-yaml-glossary-schema)
  - [1.1 Top-Level Structure](#11-top-level-structure)
  - [1.2 Term Entry Schema](#12-term-entry-schema)
  - [1.3 Param Schema](#13-param-schema)
  - [1.4 Field Schema (for config/type categories)](#14-field-schema-for-configtype-categories)
  - [1.5 Value Schema (for enum categories)](#15-value-schema-for-enum-categories)
  - [1.6 Category Taxonomy](#16-category-taxonomy)
  - [1.7 ID Convention](#17-id-convention)
  - [1.8 Validation Constraints](#18-validation-constraints)
  - [1.9 Annotated Example: Interact glossary excerpt](#19-annotated-example-interact-glossary-excerpt)
- [2. Template Marker Syntax](#2-template-marker-syntax)
  - [2.1 Marker Format](#21-marker-format)
  - [2.2 Text Renderers](#22-text-renderers)
  - [2.3 Formatted Renderers](#23-formatted-renderers)
  - [2.4 Structural Markers](#24-structural-markers)
  - [2.5 Escaping and Edge Cases](#25-escaping-and-edge-cases)
  - [2.6 Renderer Output Formats](#26-renderer-output-formats)
- [3. Build Script (`scripts/build-context.js`)](#3-build-script-scriptsbuild-contextjs)
  - [3.1 CLI Interface](#31-cli-interface)
  - [3.2 Algorithm](#32-algorithm)
  - [3.3 Error Handling](#33-error-handling)
  - [3.4 Output File Rules](#34-output-file-rules)
  - [3.5 Generated File Header](#35-generated-file-header)
- [4. Validation Script (`scripts/validate-context.js`)](#4-validation-script-scriptsvalidate-contextjs)
  - [4.1 CLI Interface](#41-cli-interface)
  - [4.2 Extraction Strategy (ts-morph)](#42-extraction-strategy-ts-morph)
  - [4.3 What Gets Validated](#43-what-gets-validated)
  - [4.4 Report Format](#44-report-format)
- [5. Directory Layout](#5-directory-layout)
- [6. Gitignore and CI Strategy](#6-gitignore-and-ci-strategy)
- [7. Root `package.json` Changes](#7-root-packagejson-changes)
- [8. Dependencies](#8-dependencies)
- [9. Template File Conventions](#9-template-file-conventions)
  - [9.1 Rules Templates](#91-rules-templates)
  - [9.2 Docs Templates](#92-docs-templates)
- [10. Acceptance Criteria](#10-acceptance-criteria)

---

## 1. YAML Glossary Schema

### 1.1 Top-Level Structure

Each package gets one `context/glossary.yaml`. The file has two top-level keys:

```yaml
meta:
  package: "@wix/interact"
  version: "2.2.2"              # tracks which package version was audited
  lastAudit: "2026-05-13"       # ISO date of last source-code verification

terms:
  - id: trigger-viewEnter
    # ... term fields ...
  - id: effect-type-time
    # ...
```

| Key    | Type     | Required | Description                                         |
| ------ | -------- | -------- | --------------------------------------------------- |
| `meta` | object   | yes      | Package identity and audit provenance                |
| `terms`| array    | yes      | All glossary entries (triggers, types, API, etc.)    |

`meta` fields:

| Field       | Type   | Required | Description                                       |
| ----------- | ------ | -------- | ------------------------------------------------- |
| `package`   | string | yes      | npm package name                                  |
| `version`   | string | yes      | Package version at last audit                     |
| `lastAudit` | string | yes      | ISO date of last manual source-code verification  |

### 1.2 Term Entry Schema

Every entry in `terms` has these fields:

| Field        | Type          | Required | Description                                                              |
| ------------ | ------------- | -------- | ------------------------------------------------------------------------ |
| `id`         | string        | yes      | Unique identifier. See [ID convention](#17-id-convention).               |
| `name`       | string        | yes      | Display name (e.g., `viewEnter`, `TimeEffect`, `Interact.create`).      |
| `category`   | enum string   | yes      | One of the [category values](#16-category-taxonomy).                     |
| `llm`        | string        | yes      | Compact LLM-facing description (1-2 sentences).                         |
| `human`      | string        | yes      | Narrative human-facing description (1-3 sentences).                      |
| `params`     | array         | no       | Parameter definitions. See [1.3](#13-param-schema).                      |
| `fields`     | array         | no       | Object field definitions. See [1.4](#14-field-schema-for-configtype-categories). |
| `values`     | array         | no       | Enum member definitions. See [1.5](#15-value-schema-for-enum-categories).|
| `signature`  | string        | no       | TypeScript function signature (for `api` category entries).              |
| `returns`    | string        | no       | Return type description (for `api` category entries).                    |
| `caveats`    | array[string] | no       | Known gotchas, pitfalls, or non-obvious behaviors.                       |
| `code`       | string        | no       | Canonical code example (fenced as TypeScript by the renderer).           |
| `sourceFile` | string        | no       | Relative path to the TS source file (for validation).                    |
| `sourceName` | string        | no       | Exported symbol name in `sourceFile` (for validation).                   |
| `related`    | array[string] | no       | IDs of related terms (used for cross-reference links).                   |

**Exactly one of `params`, `fields`, or `values` should be present** when the term describes a structured type. Plain concepts and API entries may have none. A term may have both `params` and `caveats`, or `fields` and `code`, etc.

### 1.3 Param Schema

Used for triggers, effect types, API function options, and preset parameters.

| Field         | Type                     | Required | Description                                              |
| ------------- | ------------------------ | -------- | -------------------------------------------------------- |
| `name`        | string                   | yes      | Parameter name as it appears in TypeScript                |
| `type`        | string                   | yes      | TypeScript type (e.g., `number`, `'x' \| 'y'`, `string`) |
| `default`     | string \| number \| null | yes      | Default value. Use `null` for "no default" (required param), use the string `"undefined"` for optional with no default. |
| `description` | string                   | yes      | One-line description                                      |
| `required`    | boolean                  | no       | Defaults to `false`. Set `true` for non-optional params.  |

Example:

```yaml
params:
  - name: threshold
    type: number
    default: 0.2
    description: "Fraction of element that must be visible (0–1)"
  - name: inset
    type: string
    default: "undefined"
    description: "Mapped to IntersectionObserver rootMargin"
  - name: effectId
    type: string
    default: null
    required: true
    description: "ID of the preceding effect to chain after"
```

### 1.4 Field Schema (for config/type categories)

Used for config shapes like `InteractConfig`, `Interaction`, `Condition`, etc.

| Field         | Type                     | Required | Description                                     |
| ------------- | ------------------------ | -------- | ----------------------------------------------- |
| `name`        | string                   | yes      | Field name                                       |
| `type`        | string                   | yes      | TypeScript type                                  |
| `required`    | boolean                  | yes      | Whether the field is required                    |
| `description` | string                   | yes      | One-line description                             |

Example:

```yaml
fields:
  - name: effects
    type: "Record<string, Effect>"
    required: true
    description: "Reusable effect definitions keyed by effectId"
  - name: interactions
    type: "Interaction[]"
    required: true
    description: "Array of trigger-to-effect bindings"
  - name: sequences
    type: "Record<string, SequenceConfig>"
    required: false
    description: "Reusable sequence definitions keyed by sequenceId"
  - name: conditions
    type: "Record<string, Condition>"
    required: false
    description: "Named conditions referenced by interactions and effects"
```

### 1.5 Value Schema (for enum categories)

Used for union types like `TriggerType`, `TimeAnimationTriggerType`, `StateAction`, `Fill`.

| Field         | Type   | Required | Description                       |
| ------------- | ------ | -------- | --------------------------------- |
| `value`       | string | yes      | The literal string value          |
| `description` | string | yes      | What this value means             |

Example:

```yaml
values:
  - value: "once"
    description: "Fires once then stops. Default for viewEnter, pageVisible, animationEnd."
  - value: "repeat"
    description: "Fires every time the trigger activates."
  - value: "alternate"
    description: "Alternates between forward and reverse. Default for hover, click, activate, interest."
  - value: "state"
    description: "Applies a CSS state change via stateAction."
```

### 1.6 Category Taxonomy

The `category` field uses one of these values:

| Category      | For                                                | Example entries                                  |
| ------------- | -------------------------------------------------- | ------------------------------------------------ |
| `trigger`     | Trigger types that initiate interactions            | `viewEnter`, `hover`, `click`, `pointerMove`     |
| `effect-type` | Discriminated effect shapes                        | `TimeEffect`, `ScrubEffect`, `StateEffect`       |
| `config`      | Configuration object shapes and their fields       | `InteractConfig`, `Interaction`, `Condition`      |
| `api`         | Exported functions and class methods               | `Interact.create`, `add`, `remove`, `generate`   |
| `concept`     | Cross-cutting ideas explained in prose              | FOUC prevention, element resolution, a11y mapping |
| `enum`        | Union/literal types with enumerable values          | `TriggerType`, `StateAction`, `Fill`             |
| `preset`      | Named effect presets (motion-presets package only)  | `FadeIn`, `ParallaxScroll`, `Tilt3DMouse`        |

### 1.7 ID Convention

IDs are kebab-case, prefixed with the category:

```
{category}-{name}
```

Examples:
- `trigger-viewEnter`
- `trigger-hover`
- `effect-type-time`
- `effect-type-scrub`
- `config-InteractConfig`
- `config-Interaction`
- `config-Condition`
- `api-Interact.create`
- `api-generate`
- `concept-fouc`
- `concept-element-resolution`
- `enum-TriggerType`
- `enum-TimeAnimationTriggerType`
- `enum-StateAction`
- `preset-FadeIn` (motion-presets only)

**Rules:**
- IDs are globally unique within a glossary file.
- The `name` portion preserves the original casing of the TypeScript identifier (e.g., `viewEnter`, not `view-enter`).
- Cross-package `related` references use the format `@package/term-id` (e.g., `@motion/api-registerEffects`). Within the same package, use bare IDs.

### 1.8 Validation Constraints

The build script validates these constraints before producing output:

| Constraint                        | Error Level | Description                                                  |
| --------------------------------- | ----------- | ------------------------------------------------------------ |
| Unique IDs                        | error       | No duplicate `id` values within a glossary                   |
| Required fields present           | error       | Every term has `id`, `name`, `category`, `llm`, `human`      |
| Valid category                     | error       | `category` is one of the enumerated values                   |
| Params have required fields       | error       | Each param has `name`, `type`, `default`, `description`      |
| Fields have required fields       | error       | Each field has `name`, `type`, `required`, `description`     |
| Values have required fields       | error       | Each value has `value`, `description`                        |
| No orphan related refs            | warning     | Every ID in `related` exists in the same glossary or uses `@package/` prefix |
| `sourceFile` path exists          | warning     | The referenced file exists on disk                           |

### 1.9 Annotated Example: Interact glossary excerpt

This is a representative sample showing how the Interact package glossary will look. It covers one entry from each category to demonstrate the schema in practice.

```yaml
meta:
  package: "@wix/interact"
  version: "2.2.2"
  lastAudit: "2026-05-13"

terms:
  # --- Trigger ---
  - id: trigger-viewEnter
    name: viewEnter
    category: trigger
    llm: >-
      Fires when element crosses viewport threshold via IntersectionObserver.
      pageVisible uses the same handler.
    human: >-
      Triggers an animation when an element scrolls into the visible area
      of the page. Uses IntersectionObserver under the hood, so it works
      even for elements that are already in the viewport on page load.
    params:
      - name: threshold
        type: number
        default: 0.2
        description: "Fraction of element that must be visible (0–1)"
      - name: inset
        type: string
        default: "undefined"
        description: "Mapped to IntersectionObserver rootMargin"
      - name: useSafeViewEnter
        type: boolean
        default: false
        description: "Use fallback observer strategy for edge cases"
    caveats:
      - >-
        When source and target are the same element, only triggerType 'once'
        is reliable. Other types cause the animation to shift the element
        out of the viewport, triggering rapid re-fires.
    sourceFile: src/types/triggers.ts
    sourceName: ViewEnterParams
    related:
      - trigger-pageVisible
      - concept-fouc
      - enum-TimeAnimationTriggerType

  # --- Effect type ---
  - id: effect-type-time
    name: TimeEffect
    category: effect-type
    llm: >-
      Time-based effect with explicit duration. Used with hover, click,
      viewEnter, animationEnd, activate, interest triggers.
    human: >-
      An effect that runs over a fixed duration in milliseconds. This is
      the most common effect type, used for entrance animations, hover
      responses, and click interactions.
    params:
      - name: duration
        type: number
        default: null
        required: true
        description: "Animation duration in milliseconds"
      - name: easing
        type: string
        default: "undefined"
        description: "CSS easing function string"
      - name: iterations
        type: number
        default: "undefined"
        description: "Number of iterations"
      - name: alternate
        type: boolean
        default: "undefined"
        description: "Alternate direction on each iteration"
      - name: fill
        type: Fill
        default: "undefined"
        description: "Animation fill mode"
      - name: reversed
        type: boolean
        default: "undefined"
        description: "Reverse the animation direction"
      - name: delay
        type: number
        default: "undefined"
        description: "Delay before animation starts in ms"
      - name: triggerType
        type: TimeAnimationTriggerType
        default: "undefined"
        description: "How the trigger repeats. Per-trigger defaults apply."
      - name: composite
        type: CompositeOperation
        default: "undefined"
        description: "WAAPI composite operation"
    caveats:
      - >-
        Must also include exactly one effect property: namedEffect,
        keyframeEffect, or customEffect.
    sourceFile: src/types/effects.ts
    sourceName: TimeEffect
    related:
      - effect-type-scrub
      - effect-type-state
      - enum-TimeAnimationTriggerType

  # --- Config ---
  - id: config-InteractConfig
    name: InteractConfig
    category: config
    llm: >-
      Top-level configuration object passed to Interact.create().
      effects is required (not optional despite some docs claiming otherwise).
    human: >-
      The root configuration object that defines all interactions for a
      page or component. Contains effect definitions, interaction bindings,
      and optional sequences and conditions.
    fields:
      - name: effects
        type: "Record<string, Effect>"
        required: true
        description: "Reusable effect definitions keyed by effectId"
      - name: interactions
        type: "Interaction[]"
        required: true
        description: "Array of trigger-to-effect bindings"
      - name: sequences
        type: "Record<string, SequenceConfig>"
        required: false
        description: "Reusable sequence definitions keyed by sequenceId"
      - name: conditions
        type: "Record<string, Condition>"
        required: false
        description: "Named conditions referenced by interactions and effects"
    caveats:
      - >-
        effects is REQUIRED in the TypeScript type despite some
        current docs/rules describing it as optional.
    sourceFile: src/types/config.ts
    sourceName: InteractConfig
    related:
      - config-Interaction
      - config-Condition

  # --- API ---
  - id: api-Interact.create
    name: Interact.create
    category: api
    llm: >-
      Creates a new Interact instance from config. Multiple calls create
      independent instances. Returns the instance.
    human: >-
      Initializes the interaction system with a configuration object.
      Call this once per logical scope (page, component, lazy section).
      Returns an instance you can use to add elements or destroy later.
    signature: "static create(config: InteractConfig, options?: { useCustomElement?: boolean }): Interact"
    returns: "Interact instance"
    code: |
      const instance = Interact.create(config);
    sourceFile: src/core/Interact.ts
    sourceName: create
    related:
      - api-Interact.destroy
      - config-InteractConfig

  # --- Concept ---
  - id: concept-fouc
    name: FOUC Prevention
    category: concept
    llm: >-
      Requires BOTH generate(config) to produce critical CSS AND
      data-interact-initial="true" on elements. Using only one has no effect.
    human: >-
      Flash of Un-animated Content (FOUC) occurs when entrance-animated
      elements briefly show their final state before the animation runs.
      Preventing it requires two coordinated steps: generating critical CSS
      that hides elements in their pre-animation state, and marking those
      elements so the runtime knows to apply the hiding styles.
    caveats:
      - "Only valid for viewEnter + triggerType 'once' where source and target are the same element."
      - "generate() should run server-side or at build time."
    code: |
      import { generate } from '@wix/interact/web';
      const css = generate(config);
      // Inject into <head>: <style>${css}</style>
      // Mark elements: data-interact-initial="true"
    related:
      - api-generate
      - trigger-viewEnter

  # --- Enum ---
  - id: enum-TimeAnimationTriggerType
    name: TimeAnimationTriggerType
    category: enum
    llm: >-
      Controls repeat behavior: 'once' (default for viewEnter/pageVisible/animationEnd),
      'repeat', 'alternate' (default for hover/click/activate/interest), 'state'.
    human: >-
      Determines how an effect responds when its trigger fires multiple
      times. The default depends on the trigger type.
    values:
      - value: "once"
        description: "Fires once then stops. Default for viewEnter, pageVisible, animationEnd."
      - value: "repeat"
        description: "Fires every time the trigger activates."
      - value: "alternate"
        description: "Alternates forward/reverse. Default for hover, click, activate, interest."
      - value: "state"
        description: "Applies CSS state via stateAction instead of running an animation."
    sourceFile: src/types/effects.ts
    sourceName: TimeAnimationTriggerType
    related:
      - effect-type-time
      - enum-StateAction
```

---

## 2. Template Marker Syntax

### 2.1 Marker Format

All markers use double-brace delimiters:

```
{{type:argument}}
```

There are two families of markers:

1. **Term markers** — reference glossary data: `{{term:id.renderer}}`
2. **Structural markers** — control document assembly: `{{include:path}}`

### 2.2 Text Renderers

These inject a glossary field value as plain text (no formatting added):

| Marker                    | Output                                   |
| ------------------------- | ---------------------------------------- |
| `{{term:id.name}}`        | The `name` field                         |
| `{{term:id.llm}}`         | The `llm` description                    |
| `{{term:id.human}}`       | The `human` description                  |
| `{{term:id.signature}}`   | The `signature` field (inline code)      |
| `{{term:id.returns}}`     | The `returns` field                      |

`signature` is wrapped in backtick fences when rendered:

```markdown
`static create(config: InteractConfig, options?: { useCustomElement?: boolean }): Interact`
```

### 2.3 Formatted Renderers

These generate structured markdown from array fields:

| Marker                       | Source Field | Output Format                  |
| ---------------------------- | ------------ | ------------------------------ |
| `{{term:id.params-table}}`   | `params`     | Markdown table                 |
| `{{term:id.fields-table}}`   | `fields`     | Markdown table                 |
| `{{term:id.values-table}}`   | `values`     | Markdown table                 |
| `{{term:id.caveats-list}}`   | `caveats`    | Bullet list                    |
| `{{term:id.code}}`           | `code`       | Fenced TypeScript code block   |

### 2.4 Structural Markers

| Marker                          | Behavior                                                       |
| ------------------------------- | -------------------------------------------------------------- |
| `{{include:path/to/fragment.md}}` | Replaced with the contents of the referenced file. Path is relative to the package's `context/templates/` directory. Included files are also processed for markers (single level of nesting; includes within includes are not resolved). |

### 2.5 Escaping and Edge Cases

| Scenario                           | Behavior                                                      |
| ---------------------------------- | ------------------------------------------------------------- |
| Marker inside fenced code block    | **Not replaced.** The build script uses a simple toggle (flip state on lines starting with `` ``` `` or `~~~`) to detect code regions. |
| Marker with unknown term ID        | **Build error.** The script exits with code 1 and reports the file and unresolved marker. |
| Marker with unknown renderer       | **Build error.** Same as above.                               |
| Term exists but requested field is empty/missing | **Build error** for required renderers (`llm`, `human`, `name`). **Renders as empty string** for optional fields (`code`, `caveats`, `signature`). When `params`, `fields`, or `values` is missing and a table renderer is called, renders the string `*No parameters.*`, `*No fields.*`, or `*No values.*` respectively. |
| `{{include:...}}` target not found | **Build error.** Reports the missing file path.               |
| Literal `{{` in output            | Use `\{{` to produce a literal `{{` in the rendered output.    |

### 2.6 Renderer Output Formats

**`params-table`** produces:

```markdown
| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `threshold` | `number` | `0.2` | Fraction of element that must be visible (0–1) |
| `inset` | `string` | — | Mapped to IntersectionObserver rootMargin |
```

Rules:
- Param names and types are wrapped in backticks.
- `default: null` (required param) renders as `**required**`.
- `default: "undefined"` (optional, no default) renders as `—`.
- All other defaults are wrapped in backticks.
- If `required: true`, a bold `**required**` is used in the Default column regardless of the `default` value.

**`fields-table`** produces:

```markdown
| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `effects` | `Record<string, Effect>` | yes | Reusable effect definitions keyed by effectId |
| `interactions` | `Interaction[]` | yes | Array of trigger-to-effect bindings |
| `sequences` | `Record<string, SequenceConfig>` | no | Reusable sequence definitions keyed by sequenceId |
```

**`values-table`** produces:

```markdown
| Value | Description |
| ----- | ----------- |
| `'once'` | Fires once then stops. Default for viewEnter, pageVisible, animationEnd. |
| `'repeat'` | Fires every time the trigger activates. |
```

Values are wrapped in single quotes inside backticks.

**`caveats-list`** produces:

```markdown
- ⚠️ When source and target are the same element, only triggerType 'once' is reliable.
- ⚠️ generate() should run server-side or at build time.
```

Each caveat gets a `⚠️` prefix for visual scanning.

**`code`** produces:

````markdown
```typescript
const instance = Interact.create(config);
```
````

The `code` field value is wrapped in a TypeScript fenced block.

---

## 3. Build Script (`scripts/build-context.js`)

### 3.1 CLI Interface

```bash
node scripts/build-context.js --package <name> [--package <name>] [--all] [--dry-run] [--verbose]
```

| Flag         | Description                                                   |
| ------------ | ------------------------------------------------------------- |
| `--package`  | Package directory name (e.g., `interact`, `motion`, `motion-presets`). Repeatable. |
| `--all`      | Process all packages that have a `context/` directory.        |
| `--dry-run`  | Validate and report what would be written, without writing.   |
| `--verbose`  | Print each marker resolution to stdout.                       |

**Exit codes:**
- `0` — success, all files written.
- `1` — one or more errors (unresolved markers, missing terms, schema violations). No files are written on error.

### 3.2 Algorithm

For each package:

1. **Read glossary.** Parse `packages/<pkg>/context/glossary.yaml` using the `yaml` npm package. Validate against the schema constraints in [1.8](#18-validation-constraints). Abort on error.

2. **Index terms.** Build a `Map<id, term>` for O(1) lookups.

3. **Discover templates.** Recursively glob `packages/<pkg>/context/templates/rules/**/*.md` and `packages/<pkg>/context/templates/docs/**/*.md`.

4. **Process each template.**
   - Read the file contents as an array of lines.
   - Track code-fence state: toggle a boolean `inCodeBlock` on any line whose trimmed content starts with `` ``` `` or `~~~`. This is a simple parity toggle — no line-range bookkeeping needed.
   - For each line where `inCodeBlock` is false, find all `{{...}}` markers using regex: `/(?<!\\)\{\{(term|include):([^}]+)\}\}/g`
   - For `term` markers: look up the term in the index, invoke the appropriate renderer, replace the marker with the output.
   - For `include` markers: read the referenced file relative to `context/templates/`, process it for markers (one level deep), and insert the result.
   - Collect any errors (unknown IDs, missing fields, missing includes).

5. **Write output.** If no errors occurred, write each processed template to the corresponding path under `rules/` or `docs/`. The path mapping is:
   - `context/templates/rules/overview.md` → `rules/overview.md`
   - `context/templates/docs/guides/triggers.md` → `docs/guides/triggers.md`

6. **Report.** Print summary: files written, markers resolved, warnings.

### 3.3 Error Handling

Errors are collected per-file and reported together at the end, not one-at-a-time:

```
ERROR in context/templates/rules/triggers.md:
  Unknown term ID "trigger-viewEntr"
  Term "effect-type-time" has no "values" field for renderer "values-table"

ERROR in context/templates/docs/guides/fouc.md:
  Include not found: "fragments/does-not-exist.md"

Build failed: 3 errors in 2 files.
```

No fuzzy matching or Levenshtein suggestions — the error messages are clear enough given the small glossary size. If an ID is wrong, the developer checks the glossary.

### 3.4 Output File Rules

- Output files preserve the directory structure from `context/templates/`.
- Output files include a generated header comment (see [3.5](#35-generated-file-header)).
- Empty directories in templates are ignored (not created in output).
- The build script **does not delete** files in `rules/` or `docs/` that don't have a corresponding template. This avoids accidentally removing manually-placed files. A `--clean` flag can be added later if needed.

### 3.5 Generated File Header

Every output file starts with an HTML comment (invisible in rendered markdown):

```markdown
<!-- GENERATED FILE — do not edit directly. Edit context/glossary.yaml and context/templates/ instead. -->
<!-- Built from: context/templates/rules/triggers.md -->
```

This prevents accidental edits to generated files and points to the source.

---

## 4. Validation Script (`scripts/validate-context.js`)

### 4.1 CLI Interface

```bash
node scripts/validate-context.js --package <name> [--all] [--json]
```

| Flag        | Description                                                    |
| ----------- | -------------------------------------------------------------- |
| `--package` | Package directory name. Repeatable.                            |
| `--all`     | Validate all packages with a `context/` directory.             |
| `--json`    | Output report as JSON instead of human-readable text.          |

**Exit codes:**
- `0` — all checks pass.
- `1` — one or more validation errors.

### 4.2 Extraction Strategy (ts-morph)

**Phase 0 uses `ts-morph` for TypeScript source analysis.** This replaces fragile regex-based parsing that would need to handle multi-line types, generics, union types, intersections, and conditional types — all patterns present in this codebase.

`ts-morph` wraps the TypeScript compiler API in a high-level interface. It leverages the same `typescript` package already in the monorepo's devDependencies, so there is no version conflict or duplicate. It provides:

- Reliable type/interface member enumeration (names, optionality)
- Union type literal extraction (for enum validation)
- Export symbol discovery (for API validation)
- Proper resolution of type aliases, intersections, and re-exports

**How it's used:**

```javascript
import { Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: `packages/${pkg}/tsconfig.json`,
  skipAddingFilesFromTsConfig: true,
});

project.addSourceFileAtPath(sourceFilePath);
const sourceFile = project.getSourceFileOrThrow(sourceFilePath);

// For type aliases: get properties
const typeAlias = sourceFile.getTypeAlias(sourceName);
const type = typeAlias.getType();
const properties = type.getProperties();
for (const prop of properties) {
  const name = prop.getName();
  const isOptional = prop.isOptional();
}

// For union types: get literal values
if (type.isUnion()) {
  const literals = type.getUnionTypes()
    .filter(t => t.isStringLiteral())
    .map(t => t.getLiteralValue());
}
```

This approach is deterministic — no string parsing, no whitespace sensitivity, no false positives from formatting differences.

### 4.3 What Gets Validated

For each glossary entry that has both `sourceFile` and `sourceName`:

| Check                  | What it does                                                                     | Severity |
| ---------------------- | -------------------------------------------------------------------------------- | -------- |
| File exists            | `sourceFile` resolves to an existing `.ts` file                                  | error    |
| Symbol exists          | `sourceName` is found as an exported type/interface/const/function               | error    |
| Param names match      | Every `params[].name` exists as a property of the source type                    | error    |
| Param optionality      | Each param's `required` matches whether the source property has `?`              | warning  |
| Field names match      | Every `fields[].name` exists as a property of the source type                    | error    |
| Value members match    | Every `values[].value` appears as a string literal in the source union type      | error    |
| No missing members     | Source type has no properties missing from the glossary params/fields             | warning  |
| Export still exists    | For `api` entries, the symbol is still exported from the package entry point      | warning  |

**What is NOT validated** (to keep things reliable and avoid false positives):

- **Type text matching** — The `type` field in the glossary is for human/LLM display, not a contract. ts-morph resolves to fully-qualified types that may differ in formatting from what we write in the glossary (e.g., `Fill` vs the resolved `"forwards" | "backwards" | "both" | "none"`). Comparing these would produce noise.
- **Default values** — Defaults live in runtime code (destructuring, handler initialization), not in type definitions. Verifying them would require tracing control flow. Defaults are verified manually during the audit phase (Phase 1).
- **Cross-file inherited members** — If a type extends another from a different file, only direct properties are checked. Inherited members require manual review.

### 4.4 Report Format

**Human-readable (default):**

```
Validating @wix/interact glossary (42 terms, 28 with sourceFile)...

✓ trigger-viewEnter — ViewEnterParams in src/types/triggers.ts — 3/3 params match
- trigger-hover — no sourceFile (skipped)
✗ config-InteractConfig — InteractConfig in src/types/config.ts
    ERROR: glossary field "effects" marked required=false but source property is required
    WARNING: source has property "interactions" not listed in glossary fields

Summary: 26 passed, 1 error, 2 warnings, 14 skipped (no sourceFile)
```

**JSON (with `--json`):**

```json
{
  "package": "@wix/interact",
  "totalTerms": 42,
  "validated": 28,
  "skipped": 14,
  "errors": [
    {
      "termId": "config-InteractConfig",
      "check": "field-required",
      "message": "glossary field 'effects' marked required=false but source property is required",
      "sourceFile": "src/types/config.ts",
      "sourceName": "InteractConfig"
    }
  ],
  "warnings": []
}
```

---

## 5. Directory Layout

After Phase 0, the repo will have these new files:

```
interact/                              # monorepo root
├── scripts/
│   ├── build-context.js               # NEW — glossary + templates → rules/ + docs/
│   └── validate-context.js            # NEW — glossary vs TS source checker
├── packages/
│   ├── interact/
│   │   ├── context/                   # NEW — SSOT source
│   │   │   ├── glossary.yaml
│   │   │   └── templates/
│   │   │       ├── rules/
│   │   │       │   ├── overview.md
│   │   │       │   ├── config.md
│   │   │       │   ├── triggers.md
│   │   │       │   ├── effects.md
│   │   │       │   └── pitfalls.md
│   │   │       └── docs/
│   │   │           ├── README.md
│   │   │           ├── guides/
│   │   │           │   └── ...
│   │   │           ├── api/
│   │   │           │   └── ...
│   │   │           └── ...
│   │   ├── rules/                     # OUTPUT (generated)
│   │   │   ├── overview.md
│   │   │   └── ...
│   │   └── docs/                      # OUTPUT (generated)
│   │       └── ...
│   ├── motion/
│   │   └── context/                   # Created in Phase 2
│   └── motion-presets/
│       └── context/                   # Created in Phase 3
```

Phase 0 delivers only `scripts/build-context.js` and `scripts/validate-context.js`. The `context/` directories are created during each package's phase, not during Phase 0. However, a minimal test fixture is created to verify the scripts work (see [Acceptance Criteria](#10-acceptance-criteria)).

---

## 6. Gitignore and CI Strategy

**Decision: Commit generated output.**

Rationale:
- `packages/interact/package.json` includes `"rules"` and `"docs"` in its `"files"` array, meaning they are published to npm. If these were gitignored, a pre-publish build step would be required — adding complexity and a new failure mode.
- The `apps/docs` dev server mounts `packages/interact/rules/` and `packages/interact/docs/` directly via Vite aliases. Gitignoring them would require running the build script before `dev:docs` works.
- Committing generated output follows the same pattern as lockfiles: the source of truth is the input (glossary + templates), and CI verifies the output is in sync.

**CI verification step** (added to the existing CI workflow):

```yaml
- name: Verify context output is up to date
  run: |
    node scripts/build-context.js --all
    git diff --exit-code packages/*/rules/ packages/*/docs/
```

If someone edits the glossary or templates but forgets to re-run the build, CI catches it.

**No `.gitignore` changes needed** — `rules/` and `docs/` remain tracked.

**Generated file header** (from [3.5](#35-generated-file-header)) serves as the safety mechanism against accidental direct edits during development.

---

## 7. Root `package.json` Changes

Add two new scripts to the root `package.json`:

```json
{
  "scripts": {
    "build:context": "node scripts/build-context.js --all",
    "validate:context": "node scripts/validate-context.js --all"
  }
}
```

These sit alongside the existing `build`, `lint`, `test` scripts. They are not wired into the main `build` command — context building is a separate concern that runs less frequently than code builds.

Per-package `package.json` files are **not modified**. The context scripts are monorepo-level tooling.

---

## 8. Dependencies

| Dependency | Purpose                              | Type   | Notes                                          |
| ---------- | ------------------------------------ | ------ | ---------------------------------------------- |
| `yaml`     | Parse YAML glossary files            | devDep | Standard YAML parser; ~50KB                    |
| `ts-morph` | TypeScript AST analysis (validation) | devDep | Wraps the TS compiler API; uses existing `typescript` devDep |

The scripts also use:
- `node:fs` / `node:path` / `node:process` — built-in
- `node:url` — for `import.meta.url` resolution
- `node:util` — for `parseArgs` (built-in since Node 18.3, available in this repo's Node 22)

**Both packages are added to the root `package.json` devDependencies**, not to individual packages.

---

## 9. Template File Conventions

### 9.1 Rules Templates

Rules templates target LLM consumers. Conventions:

**Frontmatter:** Every rules template starts with YAML frontmatter matching the existing motion-presets pattern:

```yaml
---
name: interact-triggers
description: >-
  Complete trigger reference for @wix/interact. Read when configuring
  viewEnter, hover, click, pointerMove, viewProgress, or other triggers.
---
```

| Field         | Required | Purpose                                                 |
| ------------- | -------- | ------------------------------------------------------- |
| `name`        | yes      | Kebab-case identifier for this rule file                |
| `description` | yes      | Agent-facing routing hint (when to load this file)      |

The build script **preserves frontmatter as-is** in the output. It does not process markers inside frontmatter.

**Table of Contents:** After frontmatter, include a `## Table of Contents` section with anchor links to all `##`/`###` headings. This supports LLM selective reading.

**Section separators:** Use `---` between major sections.

**Param tables:** Use `{{term:id.params-table}}` markers. Do not hand-write param tables.

**Code examples:** Keep examples minimal (3-8 lines). Use `{{term:id.code}}` when the glossary has a canonical example, or write inline examples in the template for context-specific usage.

**Cross-references:** Use relative links to sibling rule files: `[triggers](./triggers.md)`. Never reference docs from rules (different audience).

### 9.2 Docs Templates

Docs templates target human developers. Conventions:

**No frontmatter.** Docs files use standard markdown. The `## Table of Contents` pattern is optional (docs may use auto-generated TOCs from the docs app).

**Narrative style.** Docs explain "why" and "when", not just "what". Use `{{term:id.human}}` for descriptions, not `{{term:id.llm}}`.

**Same param tables.** Use the same `{{term:id.params-table}}` markers as rules. The tables are identical — only the surrounding prose differs.

**Longer code examples.** Docs may include multi-step examples that combine multiple concepts. These are written directly in the template, not pulled from the glossary.

---

## 10. Acceptance Criteria

Phase 0 is complete when:

1. **`scripts/build-context.js` exists** and can:
   - Parse a `glossary.yaml` file
   - Process template files with all marker types (text renderers, formatted renderers, includes)
   - Write output files preserving directory structure
   - Fail with clear errors on unknown terms, missing fields, or broken includes
   - Skip markers inside fenced code blocks

2. **`scripts/validate-context.js` exists** and can:
   - Parse a `glossary.yaml` file
   - For each term with `sourceFile`/`sourceName`, use ts-morph to extract type properties
   - Report mismatches between glossary entries and source code (missing/extra members, optionality)
   - Exit 0 on success, 1 on errors

3. **Test fixture passes.** A Vitest test file (`scripts/build-context.test.js`) exercises:
   - All renderers (name, llm, human, params-table, fields-table, values-table, caveats-list, code, signature, returns)
   - The `{{include:...}}` marker
   - Error cases: unknown term, missing field, include-not-found
   - Fenced-code-block skipping
   - Test fixtures live in `scripts/test-fixtures/`

4. **Root `package.json`** has `build:context` and `validate:context` scripts.

5. **`yaml` and `ts-morph` devDependencies** are installed at the root.

6. **No existing tests break.** Running `yarn test` at the root still passes.

7. **No existing builds break.** Running `yarn build` and `yarn workspace @wix/interact-docs run build` still pass (the scripts don't modify any existing files).
