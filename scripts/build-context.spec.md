# `scripts/build-context.js` — Implementation Spec

## Purpose

Reads `packages/<pkg>/context/glossary.yaml` and produces two kinds of output:

1. **`rules/` files** — fully generated markdown from renderer functions. The glossary is the only input; output is always overwritten.
2. **`docs/` files** — hand-authored prose with structured sections (param tables) injected between HTML comment markers. All content outside the markers is untouched.

This script must remain compatible with `scripts/generate-llms.mjs`, which reads all `.md` files from `packages/interact/rules/`. When the new rules file names are introduced, `KNOWN_ORDER` in `generate-llms.mjs` must be updated to list the new file names in priority order.

---

## Usage

```bash
node scripts/build-context.js --package interact
node scripts/build-context.js --package motion
node scripts/build-context.js --package presets
```

Add to root `package.json` scripts:

```json
"build:context": "node scripts/build-context.js --package interact"
```

---

## Style Constraints

- Plain ESM (`import`/`export`); shebang not needed.
- Node.js built-in modules only, plus one allowed external dependency: the `yaml` npm package for YAML parsing (add as a root workspace `devDependency` if not already present).
- Target: under 200 lines. Follow the same string-building style as `generate-llms.mjs` — no template engines, no marker-replacement DSL, just plain string concatenation and array `.join('\n')`.
- All file paths are relative to the monorepo root.

---

## Module Structure

```
scripts/build-context.js
  ├── loadGlossary(pkg)              — reads and parses YAML, returns term arrays by category
  ├── renderOverviewFile(data)       → rules/overview.md
  ├── renderConfigFile(terms)        → rules/config.md
  ├── renderTriggersFile(terms)      → rules/triggers.md
  ├── renderEffectsFile(terms)       → rules/effects.md
  ├── renderPitfallsFile(terms)      → rules/pitfalls.md
  ├── injectDocsSections(pkg, terms) — injects param tables into docs/ files between markers
  └── main()                         — CLI entry: parse --package arg, orchestrate all steps
```

---

## 1. Loading the Glossary

```javascript
import { parse } from 'yaml';
import { readFileSync } from 'node:fs';

function loadGlossary(pkg) {
  const path = `packages/${pkg}/context/glossary.yaml`;
  const raw = readFileSync(path, 'utf-8');
  const { terms } = parse(raw);
  return {
    triggers: terms.filter((t) => t.category === 'trigger'),
    effectTypes: terms.filter((t) => t.category === 'effect-type'),
    configs: terms.filter((t) => t.category === 'config'),
    apis: terms.filter((t) => t.category === 'api'),
    concepts: terms.filter((t) => t.category === 'concept'),
    enums: terms.filter((t) => t.category === 'enum'),
    all: terms,
  };
}
```

---

## 2. Shared Helpers

### `renderParamTable(params)`

Renders a `| name | type | default | description |` markdown table from a term's `params` array. Returns an empty string if `params` is empty or absent.

Column order: name, type, default, description.
Row format: `` `name` `` in the name column (backtick-wrapped); required params use `**—**` in the default column.

### `renderFrontmatter(name, description)`

Returns:

```
---
name: <name>
description: <description>
---
```

### `renderTOC(entries)`

Returns a `## Table of Contents` block from an array of `{ label, anchor }` objects. Anchor format: lowercase, spaces → `-`, special chars stripped. Example: `'viewEnter'` → `#viewenter`.

---

## 3. Renderer Functions

All renderer functions return a complete markdown string. The calling code writes the string directly to the output file with no further processing.

### 3.1 `renderOverviewFile(data)`

Output: `rules/overview.md`

```
---
name: overview
description: Quick-start reference for @wix/interact. Entry points, install, and a minimal working example.
---

# @wix/interact — Overview

<one-line description from glossary package field or hardcoded>

## Table of Contents

- [Install](#install)
- [Entry Points](#entry-points)
- [Quick Start](#quick-start)
- [Static API Summary](#static-api-summary)

---

## Install

npm install @wix/interact @wix/motion-presets

---

## Entry Points

<table from concept-entry-points: 3 rows × 4 cols: name | import | element | notes>

---

## Quick Start

<minimal Web example code block, hardcoded — no glossary injection needed>

---

## Static API Summary

<compact table from api terms: name | signature | default | description>
Only include api terms that are static methods or static flags (api-create, api-destroy,
api-setup, api-registerEffects, api-allowA11yTriggers, api-forceReducedMotion).
```

### 3.2 `renderConfigFile(terms)`

Output: `rules/config.md`

```
---
name: config
description: InteractConfig schema, Interaction shape, Effect types, sequences, and conditions.
---

# @wix/interact — Configuration

## Table of Contents

- [InteractConfig](#interactconfig)
- [Interaction](#interaction)
- [Effect Shared Fields](#effect-shared-fields)
- [SequenceConfig](#sequenceconfig)
- [SequenceConfigRef](#sequenceconfigref)
- [Condition](#condition)

---

## <term.name>

<term.description>

<renderParamTable(term.params)>

<if term.caveats: render as bulleted list under ### Caveats>

--- (separator between config terms)
```

Render all terms where `category === 'config'` in this order: `config-InteractConfig`, `config-Interaction`, `config-SequenceConfig`, `config-Condition`. Include a brief note after the Interaction section: "At least one of `effects` or `sequences` must be provided per Interaction."

### 3.3 `renderTriggersFile(terms)`

Output: `rules/triggers.md`

```
---
name: triggers
description: Full parameter reference for all @wix/interact triggers. Six primary triggers plus accessible variants and one deprecated trigger.
---

# @wix/interact — Triggers

Six primary user-facing triggers: hover, click, viewEnter, viewProgress, pointerMove, animationEnd.
Two accessible variants (enabled when allowA11yTriggers is true): activate, interest.
One deprecated trigger: pageVisible (use viewEnter).

## Table of Contents

- [hover](#hover)
- [click](#click)
- [viewEnter](#viewenter)
- [viewProgress](#viewprogress)
- [pointerMove](#pointermove)
- [animationEnd](#animationend)
- [Accessible Variants](#accessible-variants)
- [Deprecated](#deprecated)

---
```

**Per-trigger section format** (for the 6 primary triggers):

```
### <trigger.name>

<trigger.description>

**Default triggerType:** <trigger.default_triggerType | 'n/a (scrub)'>

**Params:**

<renderParamTable(trigger.params)>   ← or "None." if params array is empty

<if trigger.effect_note: render as a blockquote>

**Caveats:**

<bulleted list of trigger.caveats>

---
```

**Accessible Variants section**: One combined `## Accessible Variants` section. Render `trigger-activate` and `trigger-interest` as sub-sections (`###`). Include a preamble: "Enabled when `Interact.allowA11yTriggers` is `true` (the default). Users configure `hover`/`click` — these handlers are applied transparently."

**Deprecated section**: One `## Deprecated` section listing `trigger-pageVisible` with its description and caveats.

### 3.4 `renderEffectsFile(terms)`

Output: `rules/effects.md`

```
---
name: effects
description: TimeEffect, ScrubEffect, and StateEffect — fields, defaults, and when to use each.
---

# @wix/interact — Effects

## Table of Contents

- [TimeEffect](#timeeffect)
- [ScrubEffect](#scrubeffect)
- [StateEffect](#stateeffect)
- [Animation Payloads](#animation-payloads)
- [triggerType Defaults by Trigger](#triggertype-defaults-by-trigger)
- [stateAction Values](#stateaction-values)

---
```

**Per-effect section format**:

```
## <effect.name>

<effect.description>

<renderParamTable(effect.params)>

<if effect.effect_property_note: render as a blockquote>

**Caveats:**

<bulleted list>

---
```

**Animation Payloads section** (hardcoded prose + code block):

```
## Animation Payloads

Every TimeEffect and ScrubEffect requires exactly one of:

| Payload         | Shape                                              | Use when                        |
| --------------- | -------------------------------------------------- | ------------------------------- |
| `namedEffect`   | `{ type: string, ...params }`                      | Using a registered preset       |
| `keyframeEffect`| `{ name: string, keyframes: Keyframe[] }`          | Custom WAAPI keyframes           |
| `customEffect`  | `(element: Element, progress: any) => void`        | Fully custom JS animation        |
```

Note: reference `concept-named-effect` caveats for the namedEffect row.

**`triggerType` Defaults by Trigger section**: Render the `enum-triggerType.defaults_by_trigger` map as a two-column table (`| trigger | default triggerType |`).

**`stateAction` Values section**: Render `enum-stateAction.values` as a table.

### 3.5 `renderPitfallsFile(terms)`

Output: `rules/pitfalls.md`

```
---
name: pitfalls
description: Critical gotchas for @wix/interact integrations — FOUC, overflow:clip, same-element source/target, hit-area jitter, and a11y mapping.
---

# @wix/interact — Common Pitfalls

Each item is CRITICAL — ignoring it will break animations or accessibility.

## Table of Contents

- [FOUC Prevention](#fouc-prevention)
- [overflow: clip](#overflow-clip)
- [Same-Element Source and Target](#same-element-source-and-target)
- [Hit-Area Jitter](#hit-area-jitter)
- [pointerMove + hitArea: self](#pointermove--hitarea-self)
- [Accessibility Trigger Mapping](#accessibility-trigger-mapping)

---
```

**Content**: Each pitfall is a `##` section. Content comes from a mix of:

- `concept-fouc` caveats → **FOUC Prevention** section
- `concept-a11y-mapping` caveats + description → **Accessibility Trigger Mapping** section
- `trigger-viewEnter` caveat about same-element → **Same-Element Source and Target** section
- `trigger-pointerMove` caveat about hit-area → **pointerMove + hitArea: self** section
- **overflow: clip** and **Hit-Area Jitter** sections: hardcoded text (these are structural/CSS gotchas not directly expressible from glossary terms)

The `overflow: clip` pitfall reads:

> `overflow: hidden` breaks `viewProgress`. Replace with `overflow: clip` on all ancestors between source and scroll container. In Tailwind, replace `overflow-hidden` with `overflow-clip`.

The **Hit-Area Jitter** pitfall reads:

> When a hover effect changes the size or position of the hovered element (e.g. `transform: scale(...)`), use separate source and target elements. Otherwise the hit area shifts, causing rapid enter/leave events and flickering. Use `selector` to target a child element, or set the effect's `key` to a different element.

---

## 4. Docs Injection

Docs injection modifies hand-authored docs files by replacing content between HTML comment markers with generated param tables from the glossary.

### Marker syntax

```html
<!-- PARAMS:START id=<term-id> -->
...any existing content here is replaced...
<!-- PARAMS:END -->
```

The `id` attribute references a term `id` in the glossary. Multiple START/END pairs can appear in one file.

### Algorithm

```
function injectDocsSections(pkg, terms):
  for each .md file in packages/<pkg>/docs/ (recursive):
    content = readFileSync(file)
    if content does not contain '<!-- PARAMS:START':
      skip
    newContent = replaceAll(content, pattern, (termId) =>
      term = terms.all.find(t => t.id === termId)
      if term is null:
        warn(`Unknown term id: ${termId} in ${file}`)
        return original block unchanged
      table = renderParamTable(term.params)
      return `<!-- PARAMS:START id=${termId} -->\n${table}\n<!-- PARAMS:END -->`
    )
    writeFileSync(file, newContent)
```

**Regex pattern** (multiline, dotall):

```
/<!-- PARAMS:START id=([^\s>]+) -->[\s\S]*?<!-- PARAMS:END -->/g
```

The replacement string is the same opening marker, then the generated table, then the closing marker. The original content between markers is discarded on each run (idempotent).

### Docs files that will use injection (Phase 1, Interact)

| File                           | Term IDs injected                                                      |
| ------------------------------ | ---------------------------------------------------------------------- |
| `docs/api/types.md`            | `effect-time`, `effect-scrub`, `effect-state`, `config-Condition`      |
| `docs/guides/triggers.md`      | `trigger-viewEnter`, `trigger-pointerMove`, `trigger-animationEnd`     |
| `docs/api/interact-class.md`   | `api-allowA11yTriggers`, `api-forceReducedMotion`                      |
| `docs/guides/configuration.md` | `config-InteractConfig`, `config-Interaction`, `config-SequenceConfig` |

These files are hand-authored; only the param tables between markers are generated.

---

## 5. `main()` Entry Point

```javascript
function main() {
  const pkgArg = process.argv.indexOf('--package');
  if (pkgArg === -1 || !process.argv[pkgArg + 1]) {
    console.error('Usage: node scripts/build-context.js --package <interact|motion|presets>');
    process.exit(1);
  }
  const pkg = process.argv[pkgArg + 1];
  const PKG_DIR_MAP = { interact: 'interact', motion: 'motion', presets: 'motion-presets' };
  const pkgDir = PKG_DIR_MAP[pkg];
  if (!pkgDir) {
    console.error(`Unknown package: ${pkg}`);
    process.exit(1);
  }

  const terms = loadGlossary(pkgDir);
  const rulesDir = `packages/${pkgDir}/rules`;

  // Generate rules/ files
  writeFileSync(`${rulesDir}/overview.md`, renderOverviewFile(terms));
  writeFileSync(`${rulesDir}/config.md`, renderConfigFile(terms.configs));
  writeFileSync(`${rulesDir}/triggers.md`, renderTriggersFile(terms.triggers));
  writeFileSync(`${rulesDir}/effects.md`, renderEffectsFile(terms));
  writeFileSync(`${rulesDir}/pitfalls.md`, renderPitfallsFile(terms));

  // Inject structured sections into docs/ files
  injectDocsSections(pkgDir, terms);

  console.log(`build-context: wrote rules/ and injected docs/ for @wix/${pkgDir}`);
}
```

The script must ensure `rules/` exists (`mkdirSync(rulesDir, { recursive: true })`).

---

## 6. `generate-llms.mjs` Compatibility

After the new rules files are generated, update `KNOWN_ORDER` in `scripts/generate-llms.mjs` from:

```javascript
const KNOWN_ORDER = [
  'full-lean.md',
  'integration.md',
  'click.md',
  'hover.md',
  'pointermove.md',
  'viewenter.md',
  'viewprogress.md',
];
```

to:

```javascript
const KNOWN_ORDER = ['overview.md', 'triggers.md', 'effects.md', 'config.md', 'pitfalls.md'];
```

Update `DOCS_LINK_TITLES` accordingly — `overview.md` maps to `'Overview'`, `triggers.md` maps to `'Triggers Reference'`.

Also update `STATIC_BODY` to reflect the corrected trigger count:

```javascript
'- Six primary trigger types: hover, click, viewEnter, viewProgress, pointerMove, animationEnd — plus accessible variants activate and interest (enabled by default)';
```

---

## 7. CI Verification Step

Add a CI step in `.github/workflows/interactdocs.yml` (or a new `context.yml` workflow):

```yaml
- name: Verify rules/ is up to date
  run: |
    node scripts/build-context.js --package interact
    git diff --exit-code packages/interact/rules/
```

This fails if generated output differs from what is committed, catching glossary changes that weren't followed by a rebuild.

---

## 8. Output File Counts

After Phase 1 (Interact), the `packages/interact/rules/` directory will contain exactly five files:

| File          | Generated by         |
| ------------- | -------------------- |
| `overview.md` | `renderOverviewFile` |
| `config.md`   | `renderConfigFile`   |
| `triggers.md` | `renderTriggersFile` |
| `effects.md`  | `renderEffectsFile`  |
| `pitfalls.md` | `renderPitfallsFile` |

The old files (`full-lean.md`, `integration.md`, `click.md`, `hover.md`, `pointermove.md`, `viewenter.md`, `viewprogress.md`) are deleted after the new output is validated (Phase 1.6 in the plan).

---

## 9. Not in Scope for This Script

- The script does **not** validate glossary entries against TypeScript source — that is the job of the Vitest audit tests (`packages/interact/test/context-audit.spec.ts`) introduced in Phase 1.1.
- The script does **not** delete old rules files — deletion is a manual step in Phase 1.6 after review.
- The script does **not** handle motion or motion-presets renderer logic in Phase 0 — placeholder `renderOverviewFile` stubs are sufficient until those packages are migrated.
