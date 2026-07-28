# Implementation plan — accept both camelCase and kebab-case CSS property names

**Decision date:** 2026-07-28
**Branch:** `support-both-camel-kebab-casing`
**Supersedes audit items:** B1, §3.1, §11 (`click & hover`, `what are effects?`, `transition Effects`), Appendix A A1 of `interact-documentation-site-audit.md`

## Context

Audit items **B1** and **§3.1** flagged a mismatch: the docs tell authors to write state-effect
`styleProperties` in camelCase, but `@wix/interact` writes those names **verbatim** into the generated
stylesheet, so `backgroundColor: #111` is silently dropped by the browser. The mirror-image problem
exists for keyframes: `keyframeEffect.keyframes` must be camelCase because they reach WAAPI
(`KeyframeEffect.setKeyframes`), and `@wix/interact-validate` warns
(`KEYFRAME_PROP_NOT_CAMEL_CASE`) when an author writes `background-color` there.

So today the same author has to remember two opposite conventions, chosen by an implementation detail
they can't see. The team decided to **accept both casings on every input that takes a general CSS
property name, and normalize internally to whatever the consuming API needs** — camelCase for WAAPI
keyframes, kebab-case for CSS text (state rules, `transition:` shorthand, `@keyframes` blocks).

Outcome: neither casing is ever wrong, the docs stop teaching a trap, and the ~10 camelCase
state-effect examples already shipped in `README.md` / `packages/interact/docs/guides/*` /
`skills/interactor/*` become correct instead of broken.

---

## The casing contract (what we are implementing)

| Input                               | Author may write            | Normalized to | Consumed by                                                             |
| :---------------------------------- | :-------------------------- | :------------ | :---------------------------------------------------------------------- |
| `keyframeEffect.keyframes[].<prop>` | camelCase **or** kebab-case | camelCase     | `KeyframeEffect.setKeyframes` (WAAPI); then kebab for `@keyframes` text |
| `transition.styleProperties[].name` | camelCase **or** kebab-case | kebab-case    | state CSS rule + `transition:` shorthand                                |
| `transitionProperties[].name`       | camelCase **or** kebab-case | kebab-case    | same                                                                    |

Rules that hold in both directions:

- **CSS custom properties (`--*`) are passed through untouched** — they are case-sensitive, so
  `--myVar` must never become `--my-var`. (This is a latent bug in `keyframePropertyToCSS` today.)
- **Vendor prefixes round-trip**: `-webkit-transform` ⇄ `webkitTransform` (today
  `camelToKebabCase('webkitTransform')` yields the invalid `webkit-transform`).
- **WAAPI keyword keys stay keywords**: `offset`, `easing`, `composite` keep their WAAPI meaning
  inside a keyframe. The existing keyframe keyword table gains its inverse:
  `animation-timing-function → easing`, `animation-composition → composite`, `float → cssFloat`.
  The CSS `offset` shorthand remains reachable only as `cssOffset` (documented, not inferred).
- **Normalization is idempotent** and allocation-free when nothing needs changing.

Only property **names** are touched; values are never rewritten.

---

## Implementation

### 1. Canonical helpers in `@wix/motion` — `packages/motion/src/utils.ts`

`@wix/interact` already depends on `@wix/motion` and imports from it (`getEasing`, `getJsEasing`), and
motion's index does `export * from './utils'`, so one implementation serves both packages and direct
motion consumers.

```ts
const VENDOR_PREFIX = /^(webkit|moz|ms|o)(?=[A-Z])/;

/** camelCase (or already-kebab) → kebab-case CSS property name. */
export function toCSSPropertyName(name: string): string {
  if (name.startsWith('--')) return name;
  const prefixed = VENDOR_PREFIX.test(name) ? `-${name}` : name;
  return prefixed.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

/** kebab-case (or already-camel) → WAAPI/camelCase property name. */
export function toWAAPIPropertyName(name: string): string {
  if (name.startsWith('--') || !name.includes('-')) return name;
  return name.replace(/^-/, '').replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Keyframe-only keyword mapping (inverse of interact's `keyframePropertyToCSS` table). */
const KEYFRAME_CSS_TO_WAAPI: Record<string, string> = {
  float: 'cssFloat',
  'animation-timing-function': 'easing',
  'animation-composition': 'composite',
};

/**
 * Normalizes keyframe property names to WAAPI form. Returns the SAME array
 * reference when every name is already canonical (the common case).
 */
export function normalizeKeyframes<T extends Record<string, unknown>>(keyframes: T[]): T[] { … }
```

`normalizeKeyframes` guards non-arrays, per-frame returns the original frame object when unchanged,
and returns the original array when no frame changed.

### 2. Motion normalizes keyframes at the single chokepoint — `packages/motion/src/api/common.ts`

`getEffectsData` is on every path that turns animation data into keyframes: `getWebAnimation`
(→ `setKeyframes`, `webAnimations.ts:140`) and `getCSSAnimation` (→ `item.effect.keyframes`,
`cssAnimations.ts:74`), for `keyframeEffect`, for `namedEffect` presets, and for third-party modules
registered via `registerEffects()`. Normalize there:

```ts
const keyframes = normalizeKeyframes(effect.keyframes);
return {
  effect: keyframes === effect.keyframes ? effect : { ...effect, keyframes },
  options: effectOptions,
  id: effectId && `${effectId}-${index + 1}`,
  part: effect.part,
};
```

The shallow copy preserves `timing`, `customEffect`, `startOffset`/`endOffset`, `custom`, `part`.
Nothing else in motion reads raw keyframes (`prepare.ts` and `CustomAnimation.ts` don't).

### 3. Interact normalizes state-property names to kebab-case at emit time — `packages/interact/src/utils.ts`

No new pass over the config and no mutation of the author's objects: normalize where the CSS text is
built. Both the build-time (`generate()`) and runtime (`add.ts` → `createTransitionCSS`) paths funnel
through two functions in `utils.ts`, plus one line in `css.ts`.

- Add `getStateStyleProperties(effect: Pick<StateEffect, 'transition' | 'transitionProperties'>)`:
  resolves `transition?.styleProperties || transitionProperties || []` (the precedence rule that is
  currently duplicated at `utils.ts:116` and `css.ts:271`) and returns entries with
  `name: toCSSPropertyName(name)`.
- `transitionEffectToTransitionsList` (`utils.ts:58`) — normalize the name in both `.map()` bodies that
  build the `transition:` shorthand. The `startsWith('--')` custom-property branch is unaffected
  because `--*` names are passed through.
- `createTransitionCSS` (`utils.ts:115-118`) — replace the inline `.map()` with
  `getStateStyleProperties(...)`.
- `effectToCSS` (`packages/interact/src/core/css.ts:271`) — replace
  `const properties = transition?.styleProperties || transitionProperties || []` with
  `getStateStyleProperties(effect)`. `CSSRuleToString` then receives already-normalized declaration
  names and needs no change.

### 4. Interact keyframe→CSS conversion — `packages/interact/src/core/cssUtils.ts` / `utils.ts`

- `keyframePropertyToCSS` keeps its keyword table (`cssFloat`, `easing`, `cssOffset`, `composite`) and
  delegates the generic conversion to `toCSSPropertyName`, which fixes the two latent bugs: `--fooBar`
  is no longer mangled, and `webkitTransform` now emits `-webkit-transform`.
- `camelToKebabCase` (`utils.ts:16`) becomes a re-export/alias of `toCSSPropertyName`; its only other
  caller is the trigger name at `css.ts:458` (`viewProgress` → `view-progress`), which is unaffected.

### 5. `@wix/interact-validate` — retire the camelCase rule, add a shape check

Kebab-case keyframes are now valid, so `KEYFRAME_PROP_NOT_CAMEL_CASE` must go. Replace it with a check
that flags only names that are **neither** valid camelCase nor valid kebab-case, applied to keyframe
keys _and_ state-property names:

- `src/semantic/cssSyntax.ts` — delete `checkKeyframePropCamelCase`; add
  `checkCSSPropertyNames(path, effect)` covering `keyframeEffect.keyframes[]` keys,
  `transition.styleProperties[].name` and `transitionProperties[].name`. Skip `--*`. Flag names
  failing both `/^[a-z][a-zA-Z0-9]*$/` (camel) and `/^-?[a-z][a-z0-9]*(-[a-z0-9]+)*$/` (kebab, vendor
  prefix allowed) — e.g. `background-Color`, `BackgroundColor`, `background color`. The message should
  name both accepted forms. Paths mirror the existing convention (keyframe path includes the frame
  index and the raw key; state path is `[..., 'transition', 'styleProperties', i, 'name']`).
- `src/errors.ts` — in `RULE_CODE_MAP`, drop `KEYFRAME_PROP_NOT_CAMEL_CASE: 'KEYFRAME_STYLE'`, add
  `INVALID_CSS_PROPERTY_NAME: 'CSS_PROPERTY_NAME'`.
- `src/semantic/collectSemanticWarnings.ts` — swap the call in `onEffect` (severity stays `warning`,
  the semantic-layer default).
- Rename `test/rules/keyframeStyle.spec.ts` → `test/rules/cssPropertyName.spec.ts` and rewrite: no
  warning for kebab or camel keyframes / state props, warning for a mixed-case name, none for `--*`.

### 6. Docs, rules and agent-facing text — "both casings accepted"

Only the **claims** change; existing examples stay as they are (the camelCase state-effect examples in
`README.md`, `packages/interact/docs/guides/*`, `skills/interactor/examples/*` become valid without
edits).

- `packages/interact/rules/full-lean.md:471` and `:507`, `rules/click.md:70` & `:133`,
  `rules/hover.md:72` & `:134`, `rules/viewenter.md:152`, `rules/viewprogress.md:58` — replace the
  "camelCase" assertions with: property names may be camelCase or kebab-case; Interact normalizes them
  (camelCase for WAAPI keyframes, kebab-case for generated CSS); `--*` custom properties are used
  verbatim.
- `rules/validate.md:59`, `:143`, `:237` and `packages/interact-validate/README.md:150`, `:214` —
  replace the `KEYFRAME_PROP_NOT_CAMEL_CASE` / `KEYFRAME_STYLE` rows with `INVALID_CSS_PROPERTY_NAME` /
  `CSS_PROPERTY_NAME`, and drop the "keyframe-camelCase nudge" from the prose list of semantic checks.
- `skills/interactor/references/config-schema.md:143` and `:236` — same wording change.
- `packages/interact/docs/api/types.md` (`StyleProperty` / keyframe sections) — add one line stating
  both casings are accepted.
- Regenerate `llms.txt` / `llms-full.txt`: `nvm use && yarn generate:llms`.
- `apps/playground/SPEC.md:342` — the editor's kebab→camel-on-blur behaviour is now cosmetic, not a
  WAAPI requirement; reword (no code change needed in `pg-keyframe-editor.ts`).
- `CHANGELOG.md` — one entry per package: `@wix/motion` (minor: dual-casing keyframes + exported
  helpers), `@wix/interact` (minor: dual-casing style/keyframe property names, `--*` and vendor-prefix
  fixes), `@wix/interact-validate` (minor: `KEYFRAME_PROP_NOT_CAMEL_CASE` → `INVALID_CSS_PROPERTY_NAME`,
  `KEYFRAME_STYLE` → `CSS_PROPERTY_NAME` override key).

### 7. Documentation-site audit follow-through

`interact-documentation-site-audit.md` has been updated for this decision (§1.1 decision log, B1, §3.1,
the three §11 entries, Appendix A A1 + A12, Appendix B). The doc-site file itself
(`interact-documentation-site.md`) is fixed by whoever applies the audit — the "both accepted" wording
must not ship before the release that implements this plan.

---

## Tests

| File                                                             | Coverage                                                                                                                                                                                                                                                                                                                                                                       |
| :--------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/motion/test/utils.spec.ts`                             | `toCSSPropertyName` / `toWAAPIPropertyName` / `normalizeKeyframes`: both directions, idempotence, `--myVar` untouched, `-webkit-transform` ⇄ `webkitTransform`, keyword keys (`offset`/`easing`/`composite`) preserved, `animation-timing-function → easing`, same-reference return when nothing changes                                                                       |
| `packages/motion/test/motion.spec.ts`                            | kebab-case `keyframeEffect` through `getWebAnimation` → `setKeyframes` called with camelCase (extend the existing mock-`KeyframeEffect` assertions around L760/L931); through `getCSSAnimation` → normalized keyframes on the returned data                                                                                                                                    |
| `packages/interact/test/css.spec.ts` (or a new `casing.spec.ts`) | `generate()` on camelCase `styleProperties` → kebab in both the state rule and the `transition:` shorthand; `transitionProperties` likewise; kebab-case keyframes → kebab `@keyframes` declarations; camelCase keyframes unchanged in output; `--MyVar` style property and `--MyVar` keyframe property survive verbatim (including the `hasCustomPropertiesTransition` branch) |
| `packages/interact/test/cssUtils.spec.ts`                        | `keyframePropertyToCSS('--fooBar') === '--fooBar'`; `keyframePropertyToCSS('webkitTransform') === '-webkit-transform'`; existing cases still pass                                                                                                                                                                                                                              |
| `packages/interact/test/mini.spec.ts` / `web.spec.ts`            | one runtime case: a hover state effect declared in camelCase produces a kebab-case rule via `controller.renderStyle` (`createTransitionCSS` path)                                                                                                                                                                                                                              |
| `packages/interact-validate/test/rules/cssPropertyName.spec.ts`  | replaces `keyframeStyle.spec.ts` (see §5)                                                                                                                                                                                                                                                                                                                                      |

## Verification

```bash
nvm use
yarn workspace @wix/motion test
yarn workspace @wix/interact test
yarn workspace @wix/interact-validate test
yarn lint                 # tsc --noEmit across packages (drift guard included)
yarn format:check
```

End-to-end, in a real browser:

```bash
nvm use && yarn build
yarn workspace @wix/interact-playground dev
```

In the playground, build a config that deliberately mixes casings — a `hover` state effect with
`{ name: 'backgroundColor' }` and `{ name: 'border-radius' }`, and a `keyframeEffect` with
`{ 'background-color': 'red' }` next to `{ borderRadius: '8px' }` — then confirm in DevTools that the
generated stylesheet contains only kebab-case declarations, the `transition:` shorthand lists
kebab-case properties, the `@keyframes` block is kebab-case, and the WAAPI animation actually runs
(state toggles and the keyframe animation both take visible effect).

## Out of scope / notes

- Property **values** are never rewritten; only names.
- Preset-emitted `custom` declaration names (`css.ts:227-233`) are internal and already canonical —
  left alone.
- `apps/playground`'s kebab→camel input conversion stays; it is now a display preference.
- The `generate()`-vs-runtime generated-`effectId` mismatch (audit M20) and the other audit items are
  untouched by this change.
