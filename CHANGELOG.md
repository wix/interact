# Changelog

All notable changes to this project will be documented in this file.

Undocumented APIs may change

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## @wix/splittext

### [0.2.0] - unreleased

#### Added

- `@wix/splittext/plugin` entry points: `splitTextPlugin` for `Interact.use()`, and `splitTextStyle` for `generate()` (#275)
- `hideUntilReady`: `splitTextStyle` hides the container until the runtime split sets `data-splittext-ready` (#275)

### [0.1.2] - 2026-07-14

#### Added

- Initial release: lightweight, accessible text splitting for staggered entrance animations (#241)
- Split by chars, words, lines, or sentences with locale-aware `Intl.Segmenter` segmentation (#241)
- Range API line detection, lazy evaluation, and `revert()` to restore the original DOM (#241)
- Nested multi-type splits (`lines → sentences → words → chars`) with `nested: 'flatten'` (#241)
- CSS stagger hooks (`--char-index`, `--word-index`, etc.) and customizable span wrappers (#241)
- React entry point: `useSplitText` hook with automatic cleanup on unmount (#241)
- Optional `autoSplit` to re-split on resize and font load (#241)

---

## @wix/interact-validate

### [0.2.0] - unreleased

#### Added

- Plugin fields: `$`-prefixed keys on interactions and effects are accepted; every other unknown key is still reported as `SCHEMA_UNRECOGNIZED_KEYS` (#275)

#### Changed

- `KEYFRAME_PROP_NOT_CAMEL_CASE` (rule category `KEYFRAME_STYLE`) is replaced by `INVALID_CSS_PROPERTY_NAME` (rule category `CSS_PROPERTY_NAME`): both camelCase and kebab-case CSS property names are valid input, so only names that are neither are reported, and the check now covers `transition.styleProperties` / `transitionProperties` names in addition to `keyframeEffect` keyframes
- `severityOverrides` keyed on `KEYFRAME_STYLE` are now silently ignored. Rename the key to `CSS_PROPERTY_NAME` to keep an override in effect

### [0.1.2] - 2026-07-29

#### Added

- `RECOMMENDED_FILL_BACKWARDS` semantic check nudging `viewEnter` + `once` keyframe/named effects without FOUC hiding rules to set `fill: 'backwards'` or `'both'` (#277)

#### Changed

- README rule catalog updated for `RECOMMENDED_FILL_BACKWARDS` (#277)

### [0.1.1] - 2026-07-14

#### Added

- Extended semantic validation derived from `packages/interact/rules/*.md`: `animationEnd` graph warnings, FOUC/same-element retrigger checks, CSS syntax, ignored properties, partial-data guards, and recommended patterns (#252)
- `walkConfig()` traversal helper for semantic rule visitors (#252)

#### Changed

- Expanded README with severity model, rule catalog, and integration examples (#252)

### [0.1.0] - 2026-07-07

#### Added

- Initial release: static schema, referential, and semantic validation for `InteractConfig`, powered by zod (#238)
- `validateInteractConfig()`, `assertValidInteractConfig()`, and `InteractValidationError` (#238)
- Exported zod schemas for host-project composition (`InteractConfigSchema`, `Interaction`, `Effect`, etc.) (#238)
- Structural checks: strict object shapes, enums, numeric bounds, and trigger/effect compatibility (#238)
- Referential and semantic checks: dangling `effectId`/`sequenceId`/`conditions` references, unused definitions, duplicate keyframe names, and media-query syntax (#238)
- Configurable severity via `strict`, `max`, and per-category `severityOverrides` (#238)
- Compile-time type parity guard against `@wix/interact` config types (#238)

---

## @wix/interact

### [2.6.0] - unreleased

#### Added

- Generic plugin bridge: `Interact.use(name, plugin)` registers a plugin, and a `$<name>` field on an interaction or effect (#275)
- `generate()` accepts a `plugins` option — a map of plugin name → build-time style generator (#275)

#### Changed

- `generate(config, options?)`: the second argument now accepts an options bag — `{ useFirstChild?, plugins? }` — exported as the `GenerateOptions` (#275)
- CSS property names may be authored in either camelCase or kebab-case in `transition.styleProperties`, `transitionProperties` and `keyframeEffect.keyframes`; state-effect properties are normalized to kebab-case for the generated CSS (state rules and the `transition:` shorthand) and keyframes to camelCase for WAAPI

#### Fixed

- camelCase property names in `transition.styleProperties` / `transitionProperties` are now normalized to kebab-case
- CSS custom properties in keyframes (e.g. `--fooBar`) are no longer lower-cased when emitted into `@keyframes`
- Vendor-prefixed keyframe properties (e.g. `webkitTextStroke`) now emit a valid CSS property name (`-webkit-text-stroke`)

### [2.5.5] - 2026-07-29

#### Fixed

- Entrance FOUC prevention: `generate()` initial rules now emit `!important` on transform neutralization declarations so they override inline styles until the animation starts (#277)

#### Changed

- `viewEnter` rules and docs recommend `fill: 'backwards'` (or `'both'`) for entrance animations; CSS rule declarations support an optional `important` flag (#277)

### [2.5.4] - 2026-07-16

#### Fixed

- Sequence triggers now resolve the interaction's `source` selector (including list items) and mark interactions as added only after elements resolve, so unresolved sources can be retried on later passes (#272)

### [2.5.3] - 2026-07-13

#### Changed

- Interaction rules updated to recommend build-time CSS generation via `generate()` for `viewEnter`, `viewProgress`, `hover`, and `click` integrations (#262)

### [2.5.2] - 2026-07-10

#### Added

- Coding agents instructions in package `README.md` (#257)

#### Changed

- Improved interactor usage documentation in `README.md` (#258)
- Updated `rules/validate.md` for extended `@wix/interact-validate` semantic checks (#252)
- React and custom-elements integration docs refreshed for interactor skill workflows (#242)

### [2.5.1] - 2026-07-01

#### Changed

- Removed React `initial` prop and `data-interact-initial` FOUC marker; entrance FOUC prevention now relies solely on injecting `generate()` CSS (#247)

#### Fixed

- Single-keyframe effects with an explicit `offset` (e.g. `0`) no longer have their offset overwritten to `1` in `interpolateKeyframesOffsets` (#247)

### [2.5.0] - 2026-07-01

#### Added

- Agent rules (`rules/validate.md`) and docs for validating configs with `@wix/interact-validate` (#238)
- Export `SequenceOptionsConfig` from public types (#238)

#### Changed

- `Condition.predicate` is now required (#238)
- Removed `pageVisible` trigger; use `viewEnter` instead (#238)
- Corrected add/remove interaction rules in `full-lean.md` and `integration.md` (#244)

#### Fixed

- Entrance SSR: split FOUC-prevention CSS into separate rules for `:not([data-interact-enter])` (initial state) and `:not([data-interact-enter="done"])` (animation), so hydration can mark entrance complete without flash (#243)

### [2.4.0] - 2026-05-29

#### Changed

- Revamp package `README.md` with expanded overview, `generate()` documentation, framework integration guides, and examples (#214)
- README follow-up: add `llms` and `llmsFull` fields to `package.json`, AI discovery section, and corrected documentation and dependency links (#216)

#### Fixed

- FOUC-prevention CSS: apply `:not([data-interact-enter])` on the animated child selector instead of the source element, so initial-state hiding targets the correct element when effects use `selector` (#229)
- `animationEnd` trigger: resolve and match only the source animation identified by `effectId` (via `animationName` and `detail.effectId`), so unrelated `animationend` events on the source no longer fire chained effects (#227)

### [2.3.0] - 2026-05-25

#### Added

- Rewrite `generate()` to produce complete CSS from an `InteractConfig`: `@keyframes`, animation and transition custom properties, `view-timeline` declarations, state-selector rules, coordinated-list aggregation, and FOUC-prevention initial rules (#7)
- Ship `llms.txt` in the published package; add `scripts/generate-llms.mjs` plus CI workflows to generate and deploy it (#212, #215)
- Monorepo root `README.md` with project overview and integration guidance (#213)
- Interactive examples website (`apps/website`) with landing page and example gallery (#199)
- Extensive tests for CSS generation, resolvers, and utilities (#7)

#### Changed

- `InteractConfig.effects` is now optional (#7)
- Docs and interaction rules updated for the new `generate()` implementation, FOUC prevention, and scroll-driven pre-rendering (#211)
- `viewProgress` handler uses `getAnimation()` and skips WAAPI playback when the animation group is CSS-based (`isCSS`) (#7)
- Refactored transition CSS helpers and shared selector/property utilities (#7)

#### Removed

- Unused public type exports: `EventTriggerKind`, `EventTriggerConfigToggle`, `EventTriggerConfigEnterLeave`, `EventTriggerConfig`, `AnimationOptions`, `SequenceOptionsConfig` (#205)

### [2.2.2] - 2026-05-04

#### Fixed

- Attach adopted constructed stylesheets to the element's root (`document` or `ShadowRoot`) so dynamically injected CSS applies when Interact runs inside shadow DOM (#173)
- Register sequence effect selectors on the source interaction so sequence steps resolve selectors when the animated target differs from the source element (#173)

#### Changed

- Allow React 19 in `peerDependencies` for `react` and `react-dom` (#194)
- Revise package description and expand npm keywords

#### Added

- Added a Playground app and publish it under `/playground`.

### [2.2.1] - 2026-04-21

#### Added

- Console warnings when `Interact.getInstance()` or `Interact.getController()` cannot resolve a key (#190)

#### Changed

- React integration rules: document wrapping `Interact.create()` in `useEffect` with cleanup calling `destroy()` (#190)

### [2.2.0] - 2026-04-15

#### Changed

- Replace `type` and `method` in `Interaction.params` with `triggerType` and `stateAction` on `TimeEffect` and `StateEffect` (#180)
- Split public types into focused modules for clearer API docs and maintenance (#181)
- Completely revamped and refreshed interaction rules (#159)

#### Fixed

- Fix typo: `useCutsomElement` → `useCustomElement` in types/options (#172)

### [2.1.4] - 2026-03-23

#### Changed

- Bump `@wix/motion` dependency to `^2.1.3` (#169)

### [2.1.3] - 2026-03-23

#### Added

- Add support to `onAbort` to fire correctly when an animation is aborted mid-play (#163)

#### Fixed

- Fix `viewEnter` inset value to be negated when applied as `rootMargin` (#166)
- Add default `threshold: 0.2` for `viewEnter` intersection observer (#166)

### [2.1.2] - 2026-03-15

#### Changed

- Add `build:landing` script and improve `viewEnter` example (#158)
- Bump `@wix/motion` dependency to `^2.1.0`

### [2.1.1] - 2026-03-12

#### Fixed

- Fix leave event listeners are not added when using transition effects with `hover` or `interest` triggers without explicit `params: { method: 'toggle' }`

### [2.1.0] - 2026-03-12

#### Added

- Sequences: coordinated multi-element animation sequences with staggered delays (#133)
- New `SequenceConfig` and `SequenceConfigRef` types for declarative sequence configuration (#133)
- New `sequences` property on interactions and top-level config for reusable sequence definitions (#133)
- Dynamic add/remove of sequence groups for list item support (#133)
- Sequence documentation, guides, and demos (#133)

#### Changed

- Rules rewrite for all interaction types (#135)
- Bump `@wix/motion` dependency to `^2.1.0`

### [2.0.3] - 2026-03-03

#### Fixed

- Fix interpolated keys multi-trigger bug (#139)

#### Changed

- Refactor event triggers: more generic eventTriggers, allow adding triggers more easily (#129)

### [2.0.2] - 2026-02-26

#### Fixed

- Move to wix org on GH (#126)

### [2.0.1] - 2026-02-16

#### Fixed

- Fix applying effects when interaction conditions do not match (#123)

#### Changed

- Fix homepage, docs, and rules (#122)
- Move to wix org on GitHub (#126)

### [2.0.0] - 2026-02-13

- Initial release.

---

## @wix/motion

### [Unreleased]

#### Added

- `toCSSPropertyName()`, `toWAAPIPropertyName()` and `normalizeKeyframes()` utilities for converting CSS property names between their CSS and WAAPI forms

#### Changed

- Keyframe property names may be authored in either camelCase or kebab-case and are normalized to WAAPI's camelCase on every animation path — `keyframeEffect`, presets, and effects registered via `registerEffects()`

### [2.1.8] - 2026-07-29

#### Added

- `getWebAnimation()` accepts SVG elements (and any `Element`) as keyframe targets, not only `HTMLElement` (#280)

#### Changed

- `getCSSAnimation()` delay serialization: use `0ms` when `delay` is `0` instead of previously defaulting to `1ms` (#277)

### [2.1.7] - 2026-05-29

#### Added

- `AnimationGroup.hasAnimationName()` and `AnimationGroup.hasAnimationId()` for checking which animation finished (#227)

#### Changed

- Revamp package `README.md` with expanded API reference, usage examples, scroll/pointer/sequence sections, AI/`llms.txt` pointers, and corrected links (#216)
- Dispatched `animationend` is now a `CustomEvent` with `detail.effectId` for effect-specific matching (#227)
- `AnimationGroup.playState` returns `running` when any child animation is running (#227)

### [2.1.6] - 2026-05-25

#### Changed

- `getEffectsData()` accepts an optional `forCSS` flag so CSS generation always emits `duration: auto` for view-progress triggers without requiring `window.ViewTimeline` at build time (#7)

### [2.1.5] - 2026-05-04

#### Changed

- Revise package description and expand npm keywords

### [2.1.4] - 2026-04-15

#### Fixed

- Implement `AnimationGroup.getProgress()` correctly (#179)

### [2.1.3] - 2026-03-23

#### Changed

- Bump package version for publish (#168)

### [2.1.2] - 2026-03-23

#### Added

- Add `onAbort` method to `AnimationGroup` for invoking callback when animation is aborted (#163)
- Add Playwright e2e test suite covering animation groups, effects, pointer, and scroll animations (#131)

### [2.1.1] - 2026-03-15

#### Fixed

- Fix `Sequence.applyOffsets()` crash when called with empty animation groups (#152)

### [2.1.0] - 2026-03-12

#### Added

- `Sequence` class: coordinated animation timeline with stagger offsets, add/remove groups (#133)
- `getSequence()` function to create `Sequence` instances from `AnimationGroupArgs` (#133)
- `createAnimationGroups()` function for building `AnimationGroup` arrays (#133)
- `AnimationGroup.getTimingOptions()` method for extracting timing data (#133)
- New types: `SequenceOptions`, `AnimationGroupArgs`, `IndexedGroup` (#133)
- `getJsEasing()` now supports parsing CSS `cubic-bezier()` and `linear()` easing strings (#133)

#### Fixed

- Rename `getCssUnits` parameter from `type` to `unit` (#122)
- RangeOffset API: use `unit` instead of `type` for offset specification (#122)

#### Changed

- Documentation cleanup and consolidation (#122)
- Move to wix org on GitHub (#126)

### [2.0.0] - 2026-02-13

- Initial release.

---

## @wix/motion-presets

### [1.0.4] - 2026-07-29

#### Changed

- Entrance presets default to `fill: 'backwards'` via `getEntranceFill()` unless overridden (#277)

### [1.0.3] - 2026-05-29

#### Changed

- Bump `@wix/motion` dependency to `^2.1.6` (#223)

### [1.0.2] - 2026-05-04

#### Changed

- Revise package description and expand npm keywords

### [1.0.1] - 2026-04-15

#### Added

- Add `iterationDelay` to ongoing presets (replaces former `delay` usage) (#178)

#### Fixed

- Fix `fadeIn` for ShuttersIn and GlideIn presets (#177)

### [1.0.0] - 2026-02-13

- Initial release.
