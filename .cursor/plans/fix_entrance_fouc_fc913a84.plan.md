---
name: Fix entrance FOUC
overview: Prevent delayed entrance flashes without changing IntersectionObserver geometry by making the transient neutral styles author-important, using real zero delays, and giving entrance effects backwards fill by default. Align validation, documentation, and Interactor guidance with the runtime behavior.
todos:
  - id: important-initial-css
    content: Emit author-important transient FOUC declarations and preserve true zero animation delays
    status: pending
  - id: entrance-fill-defaults
    content: Default every entrance preset descriptor to backwards fill while preserving explicit overrides
    status: pending
  - id: validation-guidance
    content: Add backwards-fill validation guidance and align Interact docs, rules, and Interactor skill
    status: pending
  - id: regression-tests
    content: Cover CSS serialization, timing, all entrance presets, validator behavior, and run targeted verification
    status: pending
isProject: false
---

# Fix Delayed Entrance FOUC

## Implementation

- Extend the internal declaration shape in [`packages/interact/src/types/css.ts`](packages/interact/src/types/css.ts) with an `important` flag and serialize it in [`packages/interact/src/core/cssUtils.ts`](packages/interact/src/core/cssUtils.ts). Mark every [`DEFAULT_INITIAL`](packages/interact/src/core/css.ts) declaration important so `visibility: hidden` and neutral transform properties override pre-trigger animation values, while retaining the existing `:not([data-interact-enter])` lifecycle.
- In [`packages/motion/src/api/cssAnimations.ts`](packages/motion/src/api/cssAnimations.ts), replace the synthetic `delay || 1` fallback with `delay ?? 0`. Do not add the proposed `0.1ms` initial override, because it would alter computed sequence timing and could move a playing animation back from its active phase into its delay phase.
- Add a small `getEntranceFill()` helper in [`packages/motion-presets/src/utils.ts`](packages/motion-presets/src/utils.ts), returning `options.fill ?? 'backwards'`. Apply it after `...options` to every animation descriptor in all 19 modules under [`packages/motion-presets/src/library/entrance/`](packages/motion-presets/src/library/entrance/) so both CSS and WAAPI paths default to backwards fill while explicit `none`, `forwards`, or `both` values remain authoritative.

## Validation and guidance

- Add an informational `RECOMMENDED_FILL_BACKWARDS` semantic check in [`packages/interact-validate/src/semantic/recommendedPatterns.ts`](packages/interact-validate/src/semantic/recommendedPatterns.ts), wire it through [`collectSemanticWarnings.ts`](packages/interact-validate/src/semantic/collectSemanticWarnings.ts) and [`errors.ts`](packages/interact-validate/src/errors.ts), and recommend explicit `backwards` or `both` for effective `viewEnter`/`once` animation effects, including nested sequence effects. Keep this advisory so preset defaults remain a safety net rather than a schema requirement.
- Update the authoritative entrance/FOUC guidance and generated CSS examples in [`packages/interact/rules/viewenter.md`](packages/interact/rules/viewenter.md), [`packages/interact/rules/full-lean.md`](packages/interact/rules/full-lean.md), [`packages/interact/docs/api/functions.md`](packages/interact/docs/api/functions.md), and [`packages/interact/docs/examples/entrance-animations.md`](packages/interact/docs/examples/entrance-animations.md): explain the important neutral pre-trigger rule, use `fill: 'backwards'` for `once`, and reserve `both` for effects that must retain their final keyframe.
- Update the repository Interactor source in [`skills/interactor/SKILL.md`](skills/interactor/SKILL.md) plus its `config-schema`, `triggers`, `integration-recipes`, and `validate` references. Make explicit backwards fill an invariant in generated `viewEnter`/`once` configs and update the relevant eval expectation; do not manually edit external installed skill snapshots.

## Regression coverage

- Update [`packages/interact/test/css.spec.ts`](packages/interact/test/css.spec.ts) and [`cssUtils.spec.ts`](packages/interact/test/cssUtils.spec.ts) to verify important initial declarations are emitted only for eligible same-element `viewEnter`/`once` effects and disappear from the post-start selector.
- Update [`packages/motion/test/motion.spec.ts`](packages/motion/test/motion.spec.ts) to assert omitted/zero delay produces `0ms`, while positive delays remain unchanged.
- Add centralized entrance-preset tests covering all 19 exports: every generated descriptor defaults to `backwards`, and an explicit fill value is preserved. Retain existing per-preset behavior tests and add coverage for the currently untested `ExpandIn` export through this matrix.
- Add validator tests for direct effects, referenced registry effects, sequence effects, implicit `once`, accepted `backwards`/`both`, and informational severity/category overrides.

## Verification

- Run `nvm use`, then targeted tests and type checks for `@wix/motion`, `@wix/motion-presets`, `@wix/interact`, and `@wix/interact-validate`; finish with repository lint/format checks for touched files.
