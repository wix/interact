# Changelog

All notable changes to this project will be documented in this file.

Undocumented APIs may change

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## @wix/interact

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
