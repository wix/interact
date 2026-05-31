---
name: Context SSOT Restructure
overview: 'Restructure rules/ and docs/ across all three packages (@wix/interact, @wix/motion, @wix/motion-presets) into a SSOT system where structured data (params, defaults, types) lives in per-package YAML context files, and markdown outputs are produced by JS render functions in a build script. The template IS the build script — no marker-syntax template files, no TypeScript AST parsing. Work proceeds one package at a time: Interact, then Motion, then Motion-Presets.'
todos:
  - id: phase-0-schema
    content: 'Design per-output YAML schemas (one schema per output file shape, not a generic term schema) and plan render function signatures'
    status: pending
  - id: phase-0-render-helpers
    content: 'Write scripts/render/params-table.mjs (renderParamsTable) and scripts/render/io.mjs (readYaml, readFragment, writeOutput)'
    status: pending
  - id: phase-0-build
    content: 'Write scripts/build-context.mjs: reads YAML, calls JS render functions (template literals), writes .md output — one YAML per output file, no CLI flags'
    status: pending
  - id: phase-0-validate
    content: 'Write scripts/validate-context.spec.mjs: Vitest string assertions only — readFileSync source .ts and check expected strings appear; no ts-morph, no TypeScript AST'
    status: pending
  - id: phase-1-audit
    content: 'Interact: Audit packages/interact/rules/*.md for factual accuracy (params, defaults, types) against source; note any drifts'
    status: pending
  - id: phase-1-glossary
    content: 'Interact: Write packages/interact/context/triggers.yaml — all 5 triggers, params, defaults, verified against source'
    status: pending
  - id: phase-1-render
    content: 'Interact: Write render functions for interact rules in scripts/render/interact.mjs; no separate .md template files with markers'
    status: pending
  - id: phase-1-build-validate
    content: 'Interact: Run build + validate, iterate until output matches current rules/ content and reads correctly'
    status: pending
  - id: phase-1-replace
    content: 'Interact: Replace rules/ with generated output, verify all builds pass'
    status: pending
  - id: phase-2-audit
    content: 'Motion: Audit API signatures, return types, scroll/pointer APIs in packages/motion/docs/ and source'
    status: pending
  - id: phase-2-migrate
    content: 'Motion: Write packages/motion/context/api.yaml, render functions, produce new packages/motion/rules/; add motion rules to llms.txt/llms-full.txt'
    status: pending
  - id: phase-3-decision
    content: 'Motion-Presets: Decide on background-scroll category fate (remove entirely or fully support with static-styling/resize handling) — gates all other phase-3 work'
    status: pending
  - id: phase-3-audit
    content: "Motion-Presets: Verify ground truth for all 62 presets post PR #237 (19 entrance + 19 scroll + 13 ongoing + 11 mouse); fix docs/presets/README.md stale counts (82+ → 62, ongoing 16 → 13, mouse 12 → 11, remove emoji headers); audit all docs/ files for unit key ('unit' not 'type')"
    status: pending
  - id: phase-3-migrate
    content: 'Motion-Presets: Write 4 YAML context files (entrance/scroll/ongoing/mouse) using PR #237 verified data as ground truth; render into rules/presets/*.md; extend generate-llms.mjs to include motion-presets rules in llms.txt/llms-full.txt'
    status: pending
  - id: phase-3-cross-validate
    content: "Cross-package: Vitest spec checking unit key is 'unit' not 'type' across all YAML and output files, preset counts sum to 62, no preset name duplicated across category YAMLs, shared concepts consistent across all three packages"
    status: pending
isProject: false
---

## Anti-Rabbit-Hole Constraints

Enforce at every step. If you find yourself violating one of these, stop and reconsider:

1. **No TypeScript compilation in the build script.** To verify a default value against source, write a Vitest test: `expect(readFileSync(tsPath, 'utf-8')).toContain(expectedString)`. If you find yourself importing `ts-morph` or `typescript`, stop.
2. **No template files with marker syntax.** Write a JS function instead. Markdown structure lives in template literal strings in `.mjs` files, not in `.md` files with `{{placeholders}}`.
3. **No include directives.** Shared prose (atmosphere guide, accessibility, cross-category parallels) is either a static `.md` fragment read via `readFileSync` and concatenated, or a JS constant string in the render module — never a `{{include:path}}` directive.
4. **One YAML file per output file, matching names.** `context/ongoing.yaml` → `rules/presets/ongoing-presets.md`. No routing tables, no glob patterns over output directories.
5. **YAML schema fields are defined by what is rendered, not by TypeScript types.** If a field isn't rendered, it is not in the schema.
6. **No CLI flags on the build script.** `node scripts/build-context.mjs` produces all outputs and exits.

## Architecture

**Data:** Per-package YAML context files co-located with each package:

```
packages/motion-presets/context/ongoing.yaml
packages/motion-presets/context/entrance.yaml
packages/interact/context/triggers.yaml
packages/motion/context/api.yaml
```

**Render:** JS functions in `scripts/render/*.mjs` that take data objects and return markdown strings via template literals. No external template engine.

**Static fragments:** Narrative prose that does not vary per-term (atmosphere guide, accessibility, cross-category parallels) lives as plain `.md` fragment files under the package's `context/fragments/` directory and is concatenated by the build script without any marker processing.

**Build:** `scripts/build-context.mjs` — reads YAML, calls render functions, writes output files. One command produces all outputs.

**Validation:** `scripts/validate-context.spec.mjs` — Vitest tests using `readFileSync` + string assertions against source `.ts` files. Runs after build to verify facts.

## Audit Notes (post PR #237)

### Motion-Presets

Verified preset counts after PR #237 merges:

| Category  | Count  | Notes                                                                                       |
| --------- | ------ | ------------------------------------------------------------------------------------------- |
| Entrance  | 19     | Unchanged                                                                                   |
| Scroll    | 19     | Unchanged                                                                                   |
| Ongoing   | 13     | DVD removed (can't handle non-infinite iterations, not stylable, relies on container edges) |
| Mouse     | 11     | BounceMouse and SpinMouse added                                                             |
| **Total** | **62** | Not 73 or 82+                                                                               |

Other fixes landed in PR #237:

- **Unit key corrected:** `{ value: N, unit: 'px' }` not `{ value: N, type: 'px' }` — verify this is propagated to all `docs/` files (not just `rules/`)
- **`MoveScroll`** removed from the angle-direction overloads table in `presets-main.md` (does not take a numeric angle)
- **`iterationDelay`** available on all ongoing presets (no longer "except DVD")
- **Cross-category parallels** updated: BounceMouse and SpinMouse columns added

`docs/presets/README.md` remaining stale items (to fix in phase-3-audit):

- Claims "82+ animation presets" → should be 62
- Claims 16 ongoing presets → 13
- Claims 12 mouse presets → 11
- Uses emoji headers — inconsistent with rules and new README style

`presets-main.md` post-PR #237:

- Categories table still lists background-scroll — update after phase-3-decision
