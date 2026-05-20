---
name: Context7 Registration
overview: Register @wix/interact on Context7 by creating a validated context7.json config file, then submitting and claiming the library through the Context7 web interface.
todos:
  - id: create-context7-json
    content: Create context7.json at repo root with validated schema-compliant config
    status: pending
  - id: submit-to-context7
    content: "Manual: submit github.com/wix/interact at context7.com/add-library"
    status: pending
  - id: claim-library
    content: "Manual: claim library ownership on Context7 for admin panel access"
    status: pending
  - id: verify-index
    content: "Manual: verify indexed content via resolve-library-id and query-docs MCP tools"
    status: pending
isProject: false
---

# Context7 Registration for @wix/interact

## Background

Context7 is an MCP server that indexes library documentation from GitHub and serves it to AI agents on demand. Registering `@wix/interact` makes the package discoverable to every developer with Context7 configured. Context7 scrapes markdown from the repo; a `context7.json` at the repo root controls what gets indexed.

### Comparable libraries already on Context7

- **GSAP** (`greensock/gsap`) -- 7,609 tokens, 66 snippets, Trust Score 6.8. Auto-indexed, no `context7.json`.
- **Motion for Vue** (`motiondivision/motion-vue`) -- 18,609 tokens, 149 snippets, Trust Score 8.0. Also auto-indexed.

Neither competitor uses a `context7.json`, so `@wix/interact` can differentiate by providing precise folder scoping and agent rules to produce a higher-quality, lower-noise index.

---

## What gets indexed

### Rules files -- 7 files, 2,115 lines in [packages/interact/rules/](packages/interact/rules/)

- `full-lean.md` (700 lines) -- comprehensive reference
- `integration.md` (334 lines) -- entry points, registerEffects, config schema
- `pointermove.md` (279 lines)
- `viewenter.md` (226 lines)
- `viewprogress.md` (196 lines)
- `hover.md` (191 lines)
- `click.md` (189 lines)

### Docs directory -- 26 files, ~14,846 lines in [packages/interact/docs/](packages/interact/docs/)

- `guides/` -- getting-started, triggers, effects, conditions, sequences, custom-elements, state-management, lists, configuration-structure
- `api/` -- interact-class, functions, types, interaction-controller, interact-element, element-selection
- `examples/` -- entrance-animations, hover-effects, click-interactions, list-patterns
- `integration/` -- react
- `advanced/` -- README (links to custom triggers, custom effects)

### Package README -- [packages/interact/README.md](packages/interact/README.md) (385 lines)

---

## What must NOT be indexed

- Source code (`packages/interact/src/`, `packages/interact/test/`)
- Sibling packages (`packages/motion/`, `packages/motion-presets/`)
- Apps (`apps/` -- demo, docs, playground, website)
- CI/tooling (`.github/`, `.cursor/`, `.claude/`, `scripts/`)
- Internal root markdown: `AGENTS.md`, `CLAUDE.md` (symlink to AGENTS.md), `CONTRIBUTING.md`, `readme-spec-1.md`, `readme-spec-2.md`
- Default exclusions already handle: `CHANGELOG.md`

---

## Schema constraints (from research)

These constraints were discovered by reading the actual JSON Schema at `schema/context7.json` and confirmed via Context7 docs and GitHub issues:

- **`rules` must be an array of strings**, each 5-200 characters. NOT a single string.
- **`excludeFiles` accepts filenames only** -- pattern `^[^/\\]+$`, no glob, no regex. `"*.ts"` is invalid.
- **`additionalProperties: false`** -- any unknown field fails validation.
- **Root-level markdown is always included** when `folders` is specified (confirmed behavior, narrowed to README.md only when folders are set).
- **Known `folders` bug** (issue #1020, Jan 2026) -- `folders` was not always respected. Belt-and-suspenders approach recommended: specify both `folders` (whitelist) AND `excludeFolders` (blacklist).

---

## Deliverable: `context7.json`

New file at repo root: [context7.json](context7.json)

```json
{
  "$schema": "https://context7.com/schema/context7.json",
  "projectTitle": "@wix/interact",
  "description": "Declarative animation library -- wire scroll, hover, click, and pointer triggers to effects via JSON config. Built on Web Animations API.",
  "folders": [
    "packages/interact/rules",
    "packages/interact/docs",
    "packages/interact"
  ],
  "excludeFolders": [
    "packages/interact/src",
    "packages/interact/test",
    "packages/motion",
    "packages/motion-presets",
    "apps",
    ".github",
    ".cursor",
    ".claude",
    "scripts",
    "node_modules",
    "dist"
  ],
  "excludeFiles": [
    "AGENTS.md",
    "CLAUDE.md",
    "CONTRIBUTING.md",
    "readme-spec-1.md",
    "readme-spec-2.md"
  ],
  "rules": [
    "Start with rules/full-lean.md for the complete @wix/interact reference",
    "For trigger-specific rules: click.md, hover.md, viewenter.md, viewprogress.md, pointermove.md",
    "For integration patterns (React, vanilla JS, custom elements) use rules/integration.md",
    "Always call registerEffects() before Interact.create()",
    "Use generate() from @wix/interact/web for FOUC prevention with custom elements",
    "Include a prefers-reduced-motion condition for accessibility"
  ]
}
```

### Design decisions

- **`folders` includes `packages/interact`** (not just `rules` and `docs`) so that `packages/interact/README.md` is explicitly in scope. The `excludeFolders` for `src/` and `test/` prevents source code from leaking. This is the belt-and-suspenders approach against the known `folders` bug.
- **`excludeFiles` lists exact filenames** -- no globs. Context7 only indexes markdown by default, so there is no need to filter `*.ts`, `*.js`, `*.css` etc. (which would be invalid anyway). The five listed files are root-level markdown that would otherwise pollute the index with internal agent instructions and spec drafts.
- **`rules` is an array of 6 strings**, each under 200 characters, referencing actual filenames that exist in the repo. This replaces the previous plans' single-string approach (which would fail schema validation). The rules guide agents to start with `full-lean.md` and drill into trigger-specific files as needed.
- **No `excludeFiles` globs** -- the previous detailed plan's `"*.ts"`, `"*.js"` entries would fail the schema's `^[^/\\]+$` pattern constraint.
- **Dropped `packages/interact-debug`** from excludeFolders -- this directory does not exist.

---

## Manual steps (post-merge)

### Submit the repository

1. Go to `context7.com/add-library`
2. Paste: `https://github.com/wix/interact`
3. Context7 detects `context7.json` and applies the folder/exclude config
4. Verify the parsed result includes rules and docs content, not source code

### Claim the library

1. On the Context7 library page for `@wix/interact`, click "Claim"
2. Authenticate with GitHub
3. This unlocks the admin panel for editing config via web UI, managing team access, viewing usage analytics, and higher rate limits

### Verify indexed content

After indexing completes (typically minutes, review may take 1-3 business days):

1. Use Context7 MCP tool: `resolve-library-id` with query `"@wix/interact"` -- expect ID `/wix/interact`
2. Fetch docs with the resolved ID and verify:
   - `rules/full-lean.md` content is present and complete
   - `rules/click.md` content is present
   - `docs/guides/getting-started.md` is present
   - Source code files (`src/core/Interact.ts` etc.) are NOT present
   - `AGENTS.md` / `readme-spec-*.md` content is NOT present
   - `packages/motion/` content is NOT present

---

## Files touched

- **NEW**: `context7.json` (repo root, ~35 lines)
