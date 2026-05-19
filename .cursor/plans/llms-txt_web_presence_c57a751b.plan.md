---
name: llms-txt web presence
overview: Add llms.txt and llms-full.txt to the docs site for AI agent discoverability, with deterministic generation scripts that stay in sync as rules evolve.
todos:
  - id: gen-script
    content: Create `scripts/generate-llms.mjs` -- reads rules dir, produces both `llms.txt` and `llms-full.txt` deterministically
    status: completed
  - id: workflow
    content: Update `.github/workflows/interactdocs.yml` -- run generation script and copy outputs to `_site/`
    status: pending
  - id: npm-ship
    content: Add `llms.txt` to `packages/interact/package.json` files array, add `.gitignore` entries for generated files
    status: pending
  - id: canonical-url
    content: Add canonical URL HTML comment to top of `full-lean.md`
    status: pending
  - id: root-script
    content: Add `generate:llms` script to root `package.json`
    status: pending
  - id: verify
    content: Run generation script locally and verify both outputs are correct
    status: pending
isProject: false
---

# llms.txt + Web Presence (Revised)

## Research Context

Surveyed the llms.txt ecosystem as of May 2026 to inform this plan:

- **Spec**: The [llmstxt.org](https://llmstxt.org) original spec (Jeremy Howard, Sep 2024) remains the de facto standard for OSS libraries. The extended v1.7.0 (ai-visibility.org.uk) adds business-oriented sections (`## Contact`, `identity.json`) that are not relevant here. We follow the original spec.
- **Comparable libraries with llms.txt**:
  - [GSAP](https://gsap.com/llms.txt) -- pure link index (511 lines), flat H2 sections by API category, relative URLs to `/docs/v3/*.md`
  - [PixiJS](https://pixijs.com/llms.txt) -- cleanest spec compliance: H1 + blockquote + H2 sections with `.md` links. Offers **three tiers**: `llms.txt` (nav index), `llms-medium.txt` (guides without API), `llms-full.txt` (complete). Also ships `pixijs-skills` npm package for agent install.
  - [GSAP Vault](https://gsapvault.com/llms.txt) -- richer body text with inline descriptions, technique tags, framework integration snippets. Links to `/llms-full.txt` under `## For More Details`.
  - [Popmotion](https://context7.com/popmotion/popmotion/llms.txt) -- hosted on Context7, full inline docs with code examples (not link-based).
  - [Anime.js v4](https://github.com/juliangarnier/anime/issues/1105) -- community-contributed `.instructions.md`, not yet merged.
  - [Motion.dev](https://motion.dev/docs/ai-kit) -- no llms.txt; uses MCP server + paid AI Kit ($399).
- **Spec key rules**: (1) exactly one H1; (2) blockquote immediately after H1; (3) body text before H2s is allowed; (4) `## Optional` is a reserved section name meaning "can be skipped for shorter context"; (5) link format is `- [Name](url): Description`; (6) all URLs should be absolute HTTPS; (7) no marketing hyperbole.
- **Registry**: [llms-txt-hub](https://github.com/thedaviddias/llms-txt-hub) (650+ entries) accepts submissions via web form at llmstxthub.com or PR with `.mdx` file in `packages/content/data/websites/`.

**Design decisions informed by research**:

- Two tiers (not three): our total corpus is ~2115 lines / ~65KB. PixiJS needs three tiers because their full docs are 29,000+ lines. For us, `full-lean.md` (700 lines) already serves as the "medium" read -- an agent can fetch just that one file. Adding a separate `llms-medium.txt` would duplicate it without value.
- `## Optional` section: per the spec, this signals "skip these for shorter context." Trigger-specific files go here since `full-lean.md` already covers all triggers at a summary level. An agent only needs the trigger files for deep dives.
- Absolute URLs throughout (not relative): GSAP uses relative paths, but those only resolve when fetched from their domain. Absolute URLs work everywhere -- in npm, in GitHub raw views, in agent tool output.
- Body text includes install command and key capabilities (like GSAP Vault), not just a bare blockquote (like GSAP).

---

## Current State

The rules directory has **7 files / 2115 lines**:

- `full-lean.md` (700 lines) -- comprehensive reference: config structure, triggers, effects, sequences, conditions, CSS generation
- `integration.md` (334 lines) -- framework entry points (vanilla/React/Web Components), registerEffects, config schema
- `click.md` (189 lines), `hover.md` (191 lines), `pointermove.md` (279 lines), `viewenter.md` (226 lines), `viewprogress.md` (196 lines) -- trigger-specific deep dives

The deployment workflow ([`.github/workflows/interactdocs.yml`](.github/workflows/interactdocs.yml)) copies rules to `_site/rules/` at line 90. The site serves them as raw markdown at `https://wix.github.io/interact/rules/*.md`. GitHub Pages serves `.txt` files as `text/plain` and `.md` files as `application/octet-stream` -- both are fine for agent consumption (no HTML wrapping).

---

## Deliverables

### 1. Generation script: `scripts/generate-llms.mjs`

A single ESM script that produces **both** files deterministically from the rules directory. This is the core of the "continuous development" strategy -- when rules change, re-running the script updates both outputs.

**Design:**

- Reads `packages/interact/rules/` directory
- Produces `llms.txt` (table of contents) and `llms-full.txt` (concatenated content)
- File discovery is **dynamic** (reads directory listing), but ordering is explicit via a priority list with a fallback for unknown files (alphabetical). New files get included automatically but appended at the end.
- The script reads the package version from [`packages/interact/package.json`](packages/interact/package.json) and embeds it in both outputs.
- The script extracts the first heading line (`# ...`) from each file to generate link descriptions automatically (no hardcoded descriptions to drift).
- Plain ESM, no dependencies beyond `node:fs` and `node:path`.

**File ordering** (optimized for truncation -- essentials first):

1. `full-lean.md` -- the comprehensive reference, always first
2. `integration.md` -- setup and framework patterns
3. Trigger files alphabetically: `click.md`, `hover.md`, `pointermove.md`, `viewenter.md`, `viewprogress.md`
4. Any new `.md` files added later -- appended alphabetically

**llms.txt output** follows the [llmstxt.org spec](https://llmstxt.org):

```markdown
# @wix/interact

> Declarative, configuration-driven interaction library -- binds animations to triggers via JSON config. Web-native, AI-ready, framework-agnostic.

- Install: `npm install @wix/interact @wix/motion-presets`
- Three entry points: vanilla JS (`@wix/interact`), React (`@wix/interact/react`), Web Components (`@wix/interact/web`)
- Five trigger types: hover, click, viewEnter, viewProgress, pointerMove
- Effects via named presets (`@wix/motion-presets`), keyframes, CSS transitions, or custom JS callbacks
- Configs are JSON-serializable -- designed for LLM generation

## Docs

- [Full Reference](https://wix.github.io/interact/rules/full-lean.md): Complete rules -- config structure, all triggers, effects, sequences, conditions, CSS generation, element resolution (700 lines)
- [Integration Guide](https://wix.github.io/interact/rules/integration.md): Entry points, registerEffects, config schema, FOUC prevention, static API (334 lines)

## Optional

- [Click Trigger](https://wix.github.io/interact/rules/click.md): Click and keyboard-activate interactions (189 lines)
- [Hover Trigger](https://wix.github.io/interact/rules/hover.md): Hover and keyboard-focus interactions (191 lines)
- [PointerMove Trigger](https://wix.github.io/interact/rules/pointermove.md): Pointer-driven real-time animations with hitArea and centeredToTarget (279 lines)
- [ViewEnter Trigger](https://wix.github.io/interact/rules/viewenter.md): Viewport entrance animations via IntersectionObserver (226 lines)
- [ViewProgress Trigger](https://wix.github.io/interact/rules/viewprogress.md): Scroll-driven animations via ViewTimeline (196 lines)
- [All rules in one file](https://wix.github.io/interact/llms-full.txt): Complete concatenation for single-fetch consumption (~2115 lines)
```

Key structural decisions vs. previous plan:

- **`## Docs` instead of `## Reference`**: aligns with PixiJS and the llmstxt.org example (FastHTML uses `## Docs`).
- **Trigger files under `## Optional`**: per the spec, this section signals "can be skipped for shorter context." An agent reading only `## Docs` gets `full-lean.md` + `integration.md` (1034 lines) -- sufficient for most tasks. Trigger files are supplementary deep dives.
- **`llms-full.txt` also under `## Optional`**: it's an alternative consumption path, not required.
- **Body text as a bullet list**: concise capabilities that help an agent decide relevance before following any links. Mirrors GSAP Vault's approach but without marketing language.

**llms-full.txt output**: all files concatenated with `--- filename ---` separators, preceded by a header block:

```
# @wix/interact v2.2.2 -- AI Rules Reference
# https://wix.github.io/interact/llms.txt
# 7 files, ~2115 lines
```

### 2. Update deployment workflow

Edit [`.github/workflows/interactdocs.yml`](.github/workflows/interactdocs.yml) -- add after the rules copy (line 90):

```yaml
# Generate llms.txt files for AI agent discoverability
node scripts/generate-llms.mjs
cp llms.txt _site/llms.txt
cp llms-full.txt _site/llms-full.txt
```

This runs generation at deploy time so files are always in sync with the rules that ship. No need to commit generated files.

Also update the directory structure comment (lines 67-71) to document the new paths:

```yaml
# /llms.txt      -> AI agent discovery index (llmstxt.org standard)
# /llms-full.txt -> All rules concatenated for single-fetch consumption
```

### 3. Ship llms.txt in npm package

Edit [`packages/interact/package.json`](packages/interact/package.json) `"files"` array:

```json
"files": ["dist", "rules", "docs", "llms.txt"]
```

The generation script should write `llms.txt` directly into `packages/interact/` (in addition to repo root) so it's available for both the website deploy and the npm publish. Add `packages/interact/llms.txt` to `.gitignore` since it's generated.

`llms-full.txt` does NOT ship in the npm package -- agents with local filesystem access can read `rules/` directly. Keeps the package lean.

### 4. Add canonical URL to full-lean.md

Add a single-line HTML comment at the top of [`packages/interact/rules/full-lean.md`](packages/interact/rules/full-lean.md):

```markdown
<!-- AI: full docs index at https://wix.github.io/interact/llms.txt -->

# @wix/interact -- Rules
```

Only `full-lean.md` gets this -- it's the entry-point file every agent reads first. Adding it to all 7 files would waste tokens in every agent context.

### 5. Root package.json script

Add to [`package.json`](package.json) scripts:

```json
"generate:llms": "node scripts/generate-llms.mjs"
```

### 6. Submit to registries (manual, post-deploy)

**llms-txt-hub** (primary): After deployment, submit via the web form at [llmstxthub.com](https://llmstxthub.com) (log in with GitHub). The submission requires:

- Website URL: `https://wix.github.io/interact/`
- llms.txt URL: `https://wix.github.io/interact/llms.txt`
- llms-full.txt URL: `https://wix.github.io/interact/llms-full.txt`
- Category: Developer Tools

Alternatively, open a PR on [thedaviddias/llms-txt-hub](https://github.com/thedaviddias/llms-txt-hub) adding an `.mdx` file at `packages/content/data/websites/wix-interact-llms-txt.mdx`. Do NOT edit `data/websites.json` (auto-generated).

**Context7** (secondary): Context7 indexes library docs for LLMs (e.g., [Popmotion on Context7](https://context7.com/popmotion/popmotion/llms.txt)). Consider submitting `@wix/interact` after the llms.txt is live. This is lower priority since Context7 often auto-discovers npm packages.

---

## Files Touched

- **NEW**: `scripts/generate-llms.mjs` (~100 lines)
- **EDIT**: `.github/workflows/interactdocs.yml` (add generation + copy steps)
- **EDIT**: `packages/interact/package.json` (add `llms.txt` to files array)
- **EDIT**: `packages/interact/rules/full-lean.md` (add canonical URL comment)
- **EDIT**: `package.json` (add `generate:llms` script)
- **EDIT**: `.gitignore` (add generated file entries)
- **GENERATED** (not committed): `llms.txt`, `llms-full.txt`, `packages/interact/llms.txt`
