# Changelog

All notable changes to this project will be documented in this file.

Undocumented APIs may change

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## @wix/interact

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

## @wix/interact

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

### [Unreleased]

#### Changed

- Documentation cleanup (presets, entrance, mouse, ongoing) (#122)
- Move to wix org on GitHub (#126)

### [1.0.0] - 2026-02-13

- Initial release.
