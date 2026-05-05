---
name: Rules Build Pipeline
overview: Implement a build pipeline for `packages/interact/rules/` using structured YAML data + JavaScript template functions + markdown fragments, eliminating all content duplication and ensuring a single source of truth.
todos:
  - id: scaffold
    content: "Create `_content/` directory structure: `data/`, `fragments/`, `templates/`, and `scripts/build-rules.mjs` skeleton"
    status: completed
  - id: data-triggers
    content: Create `data/triggers.yaml` with all 9 trigger definitions (hover, click, interest, activate, viewEnter, viewProgress, pointerMove, animationEnd, pageVisible) — pull field names from actual TS types
    status: completed
  - id: data-effects-meta
    content: Create `data/effects.yaml` (effect field definitions, presets table, ranges, easings) and `data/meta.yaml` (package metadata)
    status: completed
  - id: fragments
    content: "Extract ~12 fragments from existing rule files: fouc, element-resolution, 6 pitfalls, quick-start, multiple-effects-note, custom-effect-intro, sequences-intro"
    status: completed
  - id: template-event
    content: Create `templates/event-trigger-rule.mjs` — generates click.md and hover.md from trigger data + shared fragments
    status: completed
  - id: template-viewport
    content: Create `templates/viewenter-rule.mjs` and `templates/viewprogress-rule.mjs`
    status: completed
  - id: template-pointer
    content: Create `templates/pointermove-rule.mjs`
    status: completed
  - id: template-reference
    content: Create `templates/full-lean.mjs` and `templates/integration.mjs` — the two comprehensive reference files
    status: completed
  - id: build-script
    content: "Implement `scripts/build-rules.mjs`: YAML loading, fragment parsing, template orchestration, file writing"
    status: completed
  - id: integrate
    content: Add `build:rules` script to package.json, add `js-yaml` devDependency, update CI workflow
    status: completed
  - id: verify
    content: Run build, diff generated output against current rule files, verify no information loss, fix any discrepancies
    status: completed
  - id: fix-lockfile
    content: "CI fix: run `yarn install` so yarn.lock includes the new `js-yaml` resolution, commit the updated lockfile"
    status: completed
  - id: fix-dead-fragments
    content: "Remove dead fragment files `custom-effect-intro.md` and `sequences-intro.md` (unused by any template; YAML prose fields are used instead)"
    status: completed
  - id: fix-yaml-prose
    content: "Move 15+ prose description fields (timeEffectIntro, sourceKeyDesc, etc.) out of triggers.yaml into the event-trigger template directly, keeping only structured data in YAML"
    status: completed
  - id: fix-fill-variables
    content: "Collapse `buildVariablesMidFill`/`buildVariablesEndFill` into a single `buildVariables` function — always place `[FILL_MODE]` after `[NAMED_EFFECT_DEFINITION]` (matching the config block order). Remove `fillModeAtEnd` from triggers.yaml."
    status: completed
  - id: fix-build-manifest
    content: "Replace repetitive template orchestration in build-rules.mjs (lines 104-148) with a data-driven manifest array"
    status: completed
  - id: fix-viewprogress-backtick
    content: "Fix stray backtick template literal in viewprogress-rule.mjs line 86 — normalize to plain string like other templates"
    status: completed
  - id: fix-shared-fragments
    content: "Extract duplicated sections (Conditions, Static API, Config Structure, Sequences) from full-lean.mjs and integration.mjs into shared fragments"
    status: completed
  - id: fix-ci-freshness
    content: "Add a freshness check step to `.github/workflows/ci.yml`: `yarn workspace @wix/interact build:rules && git diff --exit-code packages/interact/rules/`"
    status: completed
  - id: fix-regenerate
    content: "Run `build:rules`, verify output, commit regenerated rules/*.md files"
    status: completed
isProject: false
---

# Rules Build Pipeline

## Architecture

The build produces the same 7 output `.md` files that exist today, from three source layers:

```mermaid
graph LR
    subgraph sources ["Source Layer (what you edit)"]
        YAML["data/*.yaml"]
        Fragments["fragments/*.md"]
        Templates["templates/*.mjs"]
    end
    subgraph build ["Build"]
        Script["scripts/build-rules.mjs"]
    end
    subgraph output ["Output (generated, gitignored)"]
        Rules["rules/*.md"]
    end
    YAML --> Script
    Fragments --> Script
    Templates --> Script
    Script --> Rules
```



All source files live under `packages/interact/_content/`. The build script reads them and writes the final `.md` files to `packages/interact/rules/`.

## Source Layer

### 1. Data files (`_content/data/`)

`**triggers.yaml**` — one entry per trigger, capturing everything that varies:

```yaml
triggers:
  - name: hover
    a11yAlias: interest
    a11yNote: "Use `trigger: 'interest'` instead of `trigger: 'hover'` to also respond to keyboard focus."
    category: event           # event | viewport | scroll | pointer | chain
    supportsTimeEffect: true
    supportsStateEffect: true
    supportsScrubEffect: false
    supportsCustomEffect: true
    params: []                # no trigger params
    pitfalls:
      - id: hit-area          # references fragments/pitfalls/hit-area.md
    templateFields:            # which optional fields to show in config templates
      timeEffect: [triggerType, keyframeEffect, namedEffect, fill, duration, easing, delay, iterations, alternate]
      stateEffect: [stateAction, transition, transitionProperties]
      customEffect: [triggerType, customEffect, duration, easing]
      sequence: [triggerType, offset, offsetEasing]
    triggerTypeDescriptions:   # trigger-specific wording for each triggerType value
      alternate: "plays forward on enter, reverses on leave"
      repeat: "restarts the animation from the beginning on each enter. On leave, jumps to the beginning and pauses"
      once: "plays once on the first enter and never again"
      state: "resumes on enter, pauses on leave. Useful for continuous loops (`iterations: Infinity`)"
    stateActionDescriptions:
      toggle: "applies the style state on enter, removes on leave"
      add: "applies the style state on enter. Leave does NOT remove it"
      remove: "removes a previously applied style state on enter"
      clear: "clears all previously applied style states on enter"
    fillNote: "while hovering"  # trigger-specific fill context

  - name: click
    a11yAlias: activate
    a11yNote: "Use `trigger: 'activate'` instead of `trigger: 'click'` to also respond to keyboard activation (Enter / Space)."
    category: event
    supportsTimeEffect: true
    supportsStateEffect: true
    supportsScrubEffect: false
    supportsCustomEffect: true
    params: []
    pitfalls: []
    templateFields:
      timeEffect: [triggerType, keyframeEffect, namedEffect, fill, reversed, duration, easing, delay, iterations, alternate, effectId]
      # ... (click includes reversed + effectId that hover omits)
    triggerTypeDescriptions:
      alternate: "plays forward on first click, reverses on next click"
      repeat: "restarts the animation from the beginning on each click"
      once: "plays once on the first click and never again"
      state: "resumes/pauses the animation on each click. Useful for continuous loops (`iterations: Infinity`)"
    stateActionDescriptions:
      toggle: "applies the style state, removes it on next click"
      add: "applies the style state. Does not remove on subsequent clicks"
      remove: "removes a previously applied style state"
      clear: "clears all previously applied style states. Useful for resetting multiple stacked style states at once"
    fillNote: "while finished"
    # ... viewEnter, viewProgress, pointerMove, animationEnd entries follow
```

The trigger entries for `viewEnter`, `viewProgress`, `pointerMove`, and `animationEnd` follow the same shape but will include their `params` definitions (from the real TypeScript types in `[packages/interact/src/types/triggers.ts](packages/interact/src/types/triggers.ts)`).

`**effects.yaml**` — shared effect field definitions, fill guidance, easing list:

```yaml
fillGuidance:
  both: "use for scroll-driven, pointer-driven, and toggling effects (alternate, repeat, state)"
  backwards: "use for entrance animations with triggerType 'once' when the final keyframe matches the element's base style"

triggerTypes: [once, repeat, alternate, state]
stateActions: [toggle, add, remove, clear]

easings:
  - linear
  - ease
  # ... full list from full-lean.md line 350

presets:
  entrance: [FadeIn, GlideIn, SlideIn, ...]
  ongoing: [Pulse, Spin, Breathe, ...]
  scroll: [FadeScroll, RevealScroll, ...]
  mouse: [TrackMouse, Tilt3DMouse, ...]

rangeNames:
  entry: "Element entering viewport"
  exit: "Element exiting viewport"
  contain: "After entry range and before exit range"
  cover: "Full range from entry through contain and exit"
  entry-crossing: "From element's leading edge entering to trailing edge entering"
  exit-crossing: "From element's leading edge exiting to trailing edge exiting"
```

`**meta.yaml**` — package metadata:

```yaml
packageName: "@wix/interact"
presetsPackage: "@wix/motion-presets"
installCommand: "npm install @wix/interact @wix/motion-presets"
entryPoints:
  web: "@wix/interact/web"
  react: "@wix/interact/react"
  vanilla: "@wix/interact"
```

### 2. Markdown fragments (`_content/fragments/`)

Each fragment has `<!-- #section -->` markers for different detail levels.

**Planned fragments** (extracted from the ~15 duplicated concepts):


| Fragment file                        | Sections                                                                                   | Used by                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `fouc.md`                            | `#short`, `#long`, `#code-generate`, `#code-web`, `#code-react`, `#code-vanilla`, `#rules` | full-lean, integration, viewenter           |
| `element-resolution.md`              | `#source`, `#target`, `#intro`                                                             | full-lean, integration                      |
| `pitfalls/hit-area.md`               | `#hover`, `#pointermove`, `#full-lean-hover`, `#full-lean-pointermove`                     | hover, pointermove, full-lean               |
| `pitfalls/overflow-clip.md`          | `#short`, `#long`                                                                          | viewprogress, full-lean                     |
| `pitfalls/same-element-viewenter.md` | `#short`, `#long`                                                                          | viewenter, full-lean                        |
| `pitfalls/dont-guess-presets.md`     | `#default`                                                                                 | full-lean, pointermove (Rule 1 variables)   |
| `pitfalls/reduced-motion.md`         | `#default`                                                                                 | full-lean                                   |
| `pitfalls/perspective.md`            | `#default`                                                                                 | full-lean                                   |
| `quick-start.md`                     | `#web`, `#react`, `#vanilla`, `#cdn`, `#register-presets`                                  | full-lean, integration                      |
| `multiple-effects-note.md`           | `#default` (parameterized with `{{triggerName}}`)                                          | hover, viewenter, viewprogress, pointermove |
| `custom-effect-intro.md`             | `#default`                                                                                 | click, hover, viewenter                     |
| `sequences-intro.md`                 | `#short` (parameterized with `{{triggerName}}`)                                            | click, hover, viewenter                     |


### 3. Templates (`_content/templates/`)

Each template is a `.mjs` file exporting a function that receives data + fragments and returns a markdown string.


| Template                 | Generates              | Key logic                                                                                                                                                                                                                                  |
| ------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `event-trigger-rule.mjs` | `click.md`, `hover.md` | Parameterized by trigger data. Generates Rule 1 (TimeEffect), Rule 2 (StateEffect), Rule 3 (customEffect), Rule 4 (sequences). The config block fields, variable descriptions, and trigger-specific wording all come from `triggers.yaml`. |
| `viewenter-rule.mjs`     | `viewenter.md`         | Includes FOUC section (from fragment), params on every template, no StateEffect rule.                                                                                                                                                      |
| `viewprogress-rule.mjs`  | `viewprogress.md`      | Scrub effects, range semantics, sticky pattern.                                                                                                                                                                                            |
| `pointermove-rule.mjs`   | `pointermove.md`       | Progress type, centering, device conditions, composite pattern.                                                                                                                                                                            |
| `full-lean.mjs`          | `full-lean.md`         | Comprehensive reference. Pulls from all data + fragments.                                                                                                                                                                                  |
| `integration.mjs`        | `integration.md`       | Integration guide. Pulls from meta + triggers data + fragments.                                                                                                                                                                            |


**Template function signature:**

```javascript
// event-trigger-rule.mjs
export function render(trigger, data, fragments) {
  return `# ${capitalize(trigger.name)} Trigger Rules for ${data.meta.packageName}
...
${trigger.a11yAlias ? `**CRITICAL — Accessible ${trigger.name}**: ${trigger.a11yNote}` : ''}
${trigger.pitfalls.map(p => fragments.get(`pitfalls/${p.id}`, trigger.name)).join('\n')}
...`;
}
```

## Build Script (`scripts/build-rules.mjs`)

~150 lines of Node.js ESM. Core flow:

1. Load all YAML files from `_content/data/` using `js-yaml`
2. Load all fragment `.md` files, parse `<!-- #section -->` markers into a `Map<path, Map<section, string>>`
3. For each template, call its `render()` function with the appropriate data and fragments
4. Write output to `packages/interact/rules/`
5. Report what was generated

**Fragment resolution with parameterization:**

```javascript
class Fragments {
  get(path, section = 'default', params = {}) {
    let content = this.store.get(path)?.get(section);
    for (const [key, val] of Object.entries(params)) {
      content = content.replaceAll(`{{${key}}}`, val);
    }
    return content;
  }
}
```

**Dependencies:** Add `js-yaml` as a devDependency in `packages/interact/package.json`. No other new dependencies needed — Node 22 ESM handles everything.

## Integration with Existing Pipeline

- Add script to `[packages/interact/package.json](packages/interact/package.json)`:

```json
  "build:rules": "node scripts/build-rules.mjs"
  

```

- Add `build:rules` as a `prebuild` step or keep it manual (recommend manual for now — rules change infrequently)
- Update `[.github/workflows/interactdocs.yml](/.github/workflows/interactdocs.yml)` to run `build:rules` before copying rules to `_site/rules/`
- Generated `rules/*.md` files can be either committed (simpler CI) or gitignored (cleaner repo) — recommend **committed** initially so the npm package always has them, with a CI check that verifies they're up to date (`build:rules && git diff --exit-code rules/`)

## Known Fixes Included in Migration

These existing issues will be fixed as a natural consequence of the migration:

- `[EFFECT_DEFINTION]` typo in click/hover/viewenter sequence blocks (fix in template once)
- `hitAea` typo in pointermove.md (fix in fragment once)
- `type: 'once'` vs `triggerType: 'once'` inconsistency in full-lean.md FOUC section
- hover.md missing `reversed` and `effectId` fields in TimeEffect template (decide once in `triggers.yaml` whether they belong)
- `generate` import path inconsistency (`@wix/interact` vs `@wix/interact/web`) — standardize in FOUC fragment
- Missing "Multiple effects" note in click.md (present in hover.md but absent in click.md)
- Inconsistent "additional effects" comments across files

## Post-PR Fixes (from code review of PR #204)

The initial implementation (PR #204) landed the full architecture. The fixes below address CI failures, dead code, and simplification opportunities found during review.

### Fix 1: Commit updated `yarn.lock` (CI blocker)

The CI `Install dependencies` step runs `yarn install --immutable` which refuses to modify the lockfile. Adding `js-yaml` to `devDependencies` in `package.json` without updating `yarn.lock` causes this failure.

**Action:** Run `nvm use && yarn install` to regenerate the lockfile, then commit the updated `yarn.lock`.

### Fix 2: Remove dead fragments

`_content/fragments/custom-effect-intro.md` and `_content/fragments/sequences-intro.md` are not referenced by any template. The templates use `trigger.customEffectIntro` and `trigger.sequencesIntro` from YAML instead. These fragment files are dead code.

**Action:** Delete both files.

### Fix 3: Move prose descriptions out of `triggers.yaml`

`triggers.yaml` currently stores 15+ full-sentence prose fields per trigger entry (`timeEffectIntro`, `stateEffectIntro`, `sequencesIntro`, `customEffectIntro`, `fillCritical`, `sourceKeyDesc`, `targetKeyDesc`, `fillModeDesc`, `namedEffectDesc`, `easingDesc`, `iterationsDesc`, `alternateDesc`, `customEffectCallbackDesc`, `sequenceEffectDefDesc`, `sequenceOffsetEasingDesc`). YAML is suited for structured data, not paragraphs of English.

These fields only vary between hover and click. The viewEnter/viewProgress/pointerMove triggers don't use them at all (they have their own hardcoded templates).

**Action:**
- Remove all prose description fields from `triggers.yaml` (hover + click entries).
- Move the hover/click prose differences into `event-trigger-rule.mjs` directly, keyed by a simple flag or `trigger.name` check. These are small trigger-specific word choices (e.g. "while hovering" vs "while finished"), not reusable data.
- Keep only structured data in YAML: name, category, support flags, params, templateFields, pitfalls, triggerType/stateAction enum descriptions, `a11yAlias`, `a11yNote`, `defaultTriggerType`, `showMultipleEffectsNote`.

### Fix 4: Unify fill-mode variable placement

[`event-trigger-rule.mjs`](packages/interact/_content/templates/event-trigger-rule.mjs) has two nearly identical functions — `buildVariablesMidFill` (click) and `buildVariablesEndFill` (hover) — that differ only in where `[FILL_MODE]` appears in the variables list. The code block template itself always shows `fill` right after `namedEffect`/`keyframeEffect`, so the variables list should match that order.

**Action:**
- Collapse into a single `buildVariables` function that always places `[FILL_MODE]` after `[NAMED_EFFECT_DEFINITION]` (mid position, matching the config block order).
- Remove `fillModeAtEnd` and `fillModeDash` from `triggers.yaml`.
- Use a consistent em-dash separator for all triggers.

The single function:

```javascript
function buildVariables(trigger, fillModeVar, reversedVar, effectIdVar) {
  const lines = [
    `- \`[SOURCE_KEY]\` — ...`,
    `- \`[TARGET_KEY]\` — ...`,
    `- \`[TRIGGER_TYPE]\` — ...`,
    ...Object.entries(trigger.triggerTypeDescriptions).map(([k, v]) => `  - \`'${k}'\` — ${v}`),
    `- \`[KEYFRAMES]\` — ...`,
    `- \`[EFFECT_NAME]\` — ...`,
    `- \`[NAMED_EFFECT_DEFINITION]\` — ...`,
    fillModeVar,
  ];
  if (reversedVar) lines.push(reversedVar.trim());
  lines.push(
    `- \`[DURATION_MS]\` — ...`,
    `- \`[EASING_FUNCTION]\` — ...`,
    `- \`[DELAY_MS]\` — ...`,
    `- \`[ITERATIONS]\` — ...`,
    `- \`[ALTERNATE_BOOL]\` — ...`,
  );
  if (effectIdVar) lines.push(effectIdVar.trim());
  return lines.join('\n');
}
```

### Fix 5: Data-driven build manifest

Lines 104-148 of [`build-rules.mjs`](packages/interact/scripts/build-rules.mjs) repeat the same import-find-render-push pattern 6 times. Replace with a declarative manifest:

```javascript
const manifest = [
  { template: 'event-trigger-rule.mjs', triggers: ['click', 'hover'], output: name => `${name}.md` },
  { template: 'viewenter-rule.mjs', triggers: ['viewEnter'], output: () => 'viewenter.md' },
  { template: 'viewprogress-rule.mjs', triggers: ['viewProgress'], output: () => 'viewprogress.md' },
  { template: 'pointermove-rule.mjs', triggers: ['pointerMove'], output: () => 'pointermove.md' },
  { template: 'full-lean.mjs', triggers: null, output: () => 'full-lean.md' },
  { template: 'integration.mjs', triggers: null, output: () => 'integration.md' },
];

for (const entry of manifest) {
  const mod = await import(join(CONTENT_DIR, 'templates', entry.template));
  if (entry.triggers) {
    for (const name of entry.triggers) {
      const trigger = data.triggers.find(t => t.name === name);
      if (!trigger) throw new Error(`Trigger "${name}" not found in triggers.yaml`);
      outputs.push({ file: entry.output(name), content: mod.render(trigger, data, fragments) });
    }
  } else {
    outputs.push({ file: entry.output(), content: mod.render(data.triggers, data, fragments) });
  }
}
```

Adding a new template becomes a single manifest line.

### Fix 6: Fix stray backtick in `viewprogress-rule.mjs`

Line 86 of [`viewprogress-rule.mjs`](packages/interact/_content/templates/viewprogress-rule.mjs) uses `` easing: `'[EASING_FUNCTION]'` `` (backtick template literal) inside the code fence. All other templates use `easing: '[EASING_FUNCTION]'` (plain single-quoted string).

**Action:** Change to `easing: '[EASING_FUNCTION]'` for consistency.

### Fix 7: Extract shared sections into fragments

`full-lean.mjs` (604 lines) and `integration.mjs` (285 lines) are mostly hardcoded prose with only a handful of `fragments.get()` calls. Several large sections are duplicated between them with minor variation:

- **Conditions** block (~30 lines)
- **Static API** table (~20 lines)
- **Config Structure / InteractConfig** (~15 lines)
- **Sequences** section (~50 lines)

**Action:** Extract each into a new fragment with `<!-- #full-lean -->` / `<!-- #integration -->` section markers (same pattern as `fouc.md`). This brings these templates closer to the single-source-of-truth goal and makes future edits to these shared concepts a one-file change.

New fragment files:
- `_content/fragments/conditions.md` — `#full-lean`, `#integration`
- `_content/fragments/static-api.md` — `#full-lean`, `#integration`
- `_content/fragments/config-structure.md` — `#full-lean`, `#integration`
- `_content/fragments/sequences.md` — `#full-lean`, `#integration`

### Fix 8: Add CI freshness check

The plan and PR description both mention a freshness check, but [`.github/workflows/ci.yml`](.github/workflows/ci.yml) was not updated.

**Action:** Add a step after `Build` in the `build` job:

```yaml
- name: Verify generated rules are up to date
  run: |
    yarn workspace @wix/interact build:rules
    git diff --exit-code packages/interact/rules/
```

This ensures that if someone edits a source file but forgets to re-run `build:rules`, CI catches it.

### Fix 9: Regenerate output

After all fixes above, run `build:rules` and commit the regenerated `rules/*.md` files so they reflect the new `[FILL_MODE]` variable ordering in hover.md.

---

## Future Extension Points

- **docs/**: Same `_content/data/` feeds docs templates — add `_content/templates/docs/` later
- **README**: Same meta.yaml + triggers.yaml generates README sections
- **Validation**: Add `scripts/validate-rules.mjs` that imports actual TS types and cross-checks trigger names, param fields, effect fields against the YAML data
- **motion-presets rules**: The build mechanism is scoped to `packages/interact/` but the architecture (YAML + fragments + templates) can be replicated in `packages/motion-presets/` with shared fragments if needed

