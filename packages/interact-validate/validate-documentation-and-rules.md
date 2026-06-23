# Plan: Documentation & rules for `@wix/interact-validate`

Goal: give the new validation package a README, an agent-facing rules file, and wire it into the
existing docs, rules, and llms.txt machinery so humans and agents can discover it. This plan only
describes the work — no files are edited here.

---

## 1. Current state & gaps found

- **No `README.md`** exists in `packages/interact-validate/` (only `package.json` + `src` + `test`).
- **`package.json` `files`** already lists `["dist", "rules"]`, but **no `rules/` directory exists**
  in the package — publishing today would warn / ship nothing for `rules`.
- **`llms.txt` is already stale-ahead of the source.** The committed
  `/llms.txt` (and `/llms-full.txt`) lists:
  `- [@wix/interact/validate](https://wix.github.io/interact/rules/validate.md): Rules for using
@wix/interact/validate … (272 lines)` — but **`packages/interact/rules/validate.md` does not
  exist**, and the package is now `@wix/interact-validate` (a separate package), not the
  `@wix/interact/validate` subpath the text implies. The stale `packages/interact/dist/types/validate`
  tree (with `rules/`, `semantic`, `referential`, `conditions`, `_factory`) is from the pre-refactor
  design and should be ignored / cleaned.
- **`scripts/generate-llms.mjs`** builds `llms.txt`/`llms-full.txt` by `readdirSync('packages/
interact/rules')`. Any `*.md` placed there is auto-included; `KNOWN_ORDER` and `DOCS_LINK_TITLES`
  control ordering/titling.
- Existing docs that mention validation conceptually but have no destination yet:
  - Root `README.md` → "AI and Agent Support" / "AI generation guidelines" ("validate-able").
  - `packages/interact/README.md` → "AI & Agent Support" + "Generation constraints".
  - `packages/interact/docs/README.md` (TOC) and `docs/api/*` (no validate page).

**Decision — where the rules file lives:** put the agent rules at
**`packages/interact/rules/validate.md`** (not in `interact-validate/rules`) so the existing
`generate-llms.mjs` and the published `@wix/interact` `rules/` payload pick it up automatically and
the already-referenced `…/rules/validate.md` URL resolves. Then make `interact-validate/rules/` a
thin re-export/copy (or a build step) so the `@wix/interact-validate` package also ships it and its
`package.json files: ["rules"]` is satisfied. (Alternative: drop `"rules"` from
`interact-validate`'s `files` and rely solely on the `@wix/interact` copy — pick one and apply
consistently.)

---

## 2. Deliverable 1 — `packages/interact-validate/README.md`

New README. Proposed outline:

1. **Title + one-liner** — "Schema + referential + semantic validation for `@wix/interact`'s
   `InteractConfig`, powered by zod." (matches `package.json description`).
2. **Why** — catch config mistakes before runtime; CI/build-time guardrails; LLM-output validation.
3. **Install** — `npm install @wix/interact-validate` (note `@wix/interact` peer dep `^2.4.0`).
4. **Quick start** — `validateInteractConfig(config)` → `{ valid, errors }`; and
   `assertValidInteractConfig(config)` (throws `InteractValidationError`, narrows type).
5. **API reference**
   - `validateInteractConfig(input, options?) → ValidationResult`
   - `assertValidInteractConfig(input) → asserts InteractConfig`
   - `ValidationResult` / `ValidationError` (`code`, `message`, `path`, `severity`, `hint?`)
   - `ValidateOptions` (`strict`, `max`, `severityOverrides`, plus `knownEffects` if §3.E.11 of
     `validation-extend.md` lands)
   - `InteractValidationError`
   - Exported zod schemas/sub-schemas for host-project schema composition (list from `index.ts`).
6. **Severity model** — `error` vs `warning`; `valid` is true iff no `error`; how `strict` promotes
   all to errors; how `severityOverrides` (`off`/`warning`/`error`) and `max` work.
7. **Rule catalogue table** — every domain code, severity, and trigger (the §1 table in
   `validation-extend.md` plus any newly implemented codes). Keep this table the single source of
   truth and link it from the rules file.
8. **Usage recipes** — CI check script; build-time gate; validating LLM output; integrating with the
   exported schemas via zod `.extend()`/composition.
9. **Relationship to `@wix/interact`** — peer dependency, types come from `@wix/interact`, drift is
   guarded by `type-parity.spec.ts`.
10. **Links** — back to `@wix/interact` README, `rules/validate.md`, docs site.

Also add npm badges/`keywords` parity and a `repository.directory` field check in `package.json`
(currently points at the repo root; add `"directory": "packages/interact-validate"`).

## 3. Deliverable 2 — `packages/interact/rules/validate.md` (agent rules)

The agent-facing rules file matching the style/tone of the other `rules/*.md`. Proposed sections
(keep it focused and machine-parseable; H1 + first line are extracted into llms.txt):

1. **H1 + intro line** — "Rules for using `@wix/interact-validate` — validate an `InteractConfig`
   before it reaches the runtime." (This line becomes the llms.txt description.)
2. **When to validate** — build/CI, before `Interact.create()`/`generate()`, on LLM-generated
   configs.
3. **API** — `validateInteractConfig` / `assertValidInteractConfig`, `ValidateOptions`, result shape.
4. **Error-code reference** — table of every code, severity, meaning, and how to fix; grouped as
   structural / referential / semantic / best-practice. Cross-reference the trigger rule files (e.g.
   `SAME_ELEMENT_RETRIGGER` → `viewenter.md`, `HIT_AREA_SHIFT` → `hover.md`/`pointermove.md`,
   `SCROLL_PRESET_MISSING_RANGE` → `viewprogress.md`).
5. **Severity & overrides** — `strict`, `severityOverrides`, `max`, opt-in `knownEffects`.
6. **Generation guidance for agents** — "after generating a config, run `validateInteractConfig` and
   fix all `error`s and ideally `warning`s before emitting." Mirror the root README's generation
   guidelines.
7. **Limitations** — static only; cannot verify DOM/CSS/preset-option correctness (point to §6 of
   `validation-extend.md`).

Keep `validate.md` to roughly the ~270-line scale the existing llms.txt already advertises, or
update that count (see §5).

## 4. Deliverable 3 — wire into existing `@wix/interact` docs

1. **`packages/interact/docs/README.md`** — add a TOC entry, e.g. under API Reference:
   "Config Validation → `@wix/interact-validate`" linking to a new
   `docs/api/validation.md` (or to the package README).
2. **New `packages/interact/docs/api/validation.md`** (optional but recommended) — long-form mirror
   of the package README's API + rule catalogue, consistent with the other `docs/api/*.md` pages;
   add it to `docs/api/README.md`'s list and to the "See Also" footers of
   `docs/api/functions.md` (next to `generate()`).
3. **`packages/interact/README.md`** — in "AI & Agent Support", add a bullet for the validation
   package + a `rules/validate.md` link in the rules list; in "Generation constraints", add
   "Validate generated configs with `@wix/interact-validate` (`validateInteractConfig`) and resolve
   all errors."
4. **Root `README.md`** — under "AI and Agent Support" → "Rules files" → `@wix/interact`, add
   `validate.md`; in "AI generation guidelines", add the validate-before-emit guideline. Consider a
   row in the "Packages" table if `@wix/interact-validate` is published standalone.
5. **`AGENTS.md` / `CLAUDE.md`** — add `@wix/interact-validate` to the Project Map table
   (Package / Directory) and the dependency graph (depends on `@wix/interact` types).

## 5. Deliverable 4 — regenerate llms.txt / llms-full.txt

1. In `scripts/generate-llms.mjs`: add `'validate.md'` to `KNOWN_ORDER` (choose placement — likely
   after `integration.md` or at the end of the trigger group), and decide whether it belongs in
   `DOCS_LINK_TITLES` (promote to "## Docs" with a title like "Validation Guide") or stays under
   "## Optional". The body is read dynamically, so once `validate.md` exists no per-file content
   wiring is needed.
2. Run the generator (`node scripts/generate-llms.mjs` — confirm exact script/yarn task) to
   regenerate `/llms.txt`, `/llms-full.txt`, and `packages/interact/llms.txt`, refreshing the line
   count so the stale "validate.md … (272 lines)" entry matches reality.
3. Update `scripts/generate-llms.spec.mjs` expectations if it asserts the file list / ordering.

## 6. Deliverable 5 — packaging consistency

1. Resolve the `interact-validate` `package.json files: ["rules"]` vs missing-dir issue (per §1
   decision): either add/generate `packages/interact-validate/rules/validate.md` or remove `"rules"`
   from `files`.
2. Add `repository.directory: "packages/interact-validate"`.
3. Confirm the package builds + publishes the README (npm uses the package-root `README.md`
   automatically once it exists).
4. Clean up / regenerate the stale `packages/interact/dist/types/validate` tree on next build so it
   doesn't mislead (it reflects the old subpath design). No source action needed beyond a clean
   build, but call it out for reviewers.

## 7. Step-by-step execution order

1. Write `packages/interact/rules/validate.md` (Deliverable 2) — content depends on the final code
   catalogue, so align with `validation-extend.md` (write the catalogue once, link from both).
2. Write `packages/interact-validate/README.md` (Deliverable 1).
3. Update `generate-llms.mjs` + regenerate llms files (Deliverable 4).
4. Update `@wix/interact` docs, both READMEs, AGENTS.md/CLAUDE.md (Deliverable 3).
5. Fix `interact-validate` `package.json` packaging (Deliverable 6).
6. Verify: `rules/validate.md` URL resolves in regenerated llms.txt; line counts updated; npm pack
   includes README + rules; doc cross-links are not broken.

## 8. Cross-cutting consistency checks

- Single source of truth for the **error-code catalogue**: define it once (suggest the package
  README table) and have `rules/validate.md`, `docs/api/validation.md`, and any README bullets link
  to it rather than restating — prevents drift as `validation-extend.md` adds codes.
- Keep terminology aligned with the rule files (`triggerType`, `stateAction`, `namedEffect`,
  `viewProgress`, etc.).
- Naming: docs say `@wix/interact-validate` (separate package) consistently; remove/avoid the old
  `@wix/interact/validate` subpath phrasing unless that subpath is actually re-introduced.
