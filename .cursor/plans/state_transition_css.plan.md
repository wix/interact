# State transition CSS: one shape on the server and the client, and zero-duration delays

Status: plan, not started.

A state effect is an effect with `transition` or `transitionProperties`. Its CSS comes from two places:

- **`generate()`**, on the server, through `CSSRuleToString` with `states` (`core/cssUtils.ts:111-118`);
- **the runtime**, in the browser, when `addInteraction` adds the effect (`core/add.ts:859` →
  `createTransitionCSS`, `utils.ts:99-147`).

The two write different CSS for the same effect. There is also one case where both drop authored timing.
Everything below was read on `master` and reproduced by running `generate()` from `@wix/interact` 2.5.25.

## 1. Server and client write different state rules

For a state effect `s1` on key `k` with `selector: S`:

|                                     | `generate()`                                                                                | runtime (`createTransitionCSS`)                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| State rule                          | `[data-interact-key="k"]:is(:state(s1), :--s1, [data-interact-effect~="s1"]) S`             | `:is(:state(s1), :--s1) S, [data-interact-effect~="s1"] S`                       |
| Scoped to `k`                       | yes                                                                                         | no                                                                               |
| Specificity, for `S = #a`           | (1,2,0)                                                                                     | (1,1,0)                                                                          |
| Transition                          | `--trns-N` on `[data-interact-key="k"] S`, plus a lists rule `transition: var(--trns-0), …` | `transition: <list>` on `[data-interact-key="k"] S`                              |
| Reduced motion                      | no guard                                                                                    | inside `@media (prefers-reduced-motion: no-preference)`                          |
| Several state effects on one target | one list entry per interaction, combined by the lists rule                                  | one rule per effect, so the later rule's `transition` replaces the earlier one's |

The consequences:

- The same config gives a different cascade depending on which path wrote the CSS: a server-rendered page, or a
  config the runtime added later.
- A host rule at (1,1,0), such as `#a:hover`, loses to the state on the server, but ties it on the client, where
  stylesheet order decides.
- Reduced motion turns state transitions off only on the client.

The source already notes the overlap: the TODO at `utils.ts:97-98` says `createTransitionCSS` "overlaps with
effectToCSS's transition branch".

**Plan:**

1. Have the runtime build its state rules and its transition lists with the same code `generate()` uses
   (`CSSRuleToString` with `states`, and the lists rule). Then the selector, the key scope and how several effects
   combine are the same on both paths.
2. Decide the reduced-motion behaviour once, and apply it on both paths. The runtime guards today; `generate()`
   doesn't.
3. Tests in `test/css.spec.ts`, for one effect, two effects in one interaction and two in separate interactions:
   - the runtime's rules for a config equal `generate()`'s, rule for rule;
   - a spec pins the specificity of the state rule.

## 2. `duration: 0` drops the delay

`transitionEffectToTransitionsList` writes a transition only when the duration is truthy:

- `if (duration)` for `transition` (`utils.ts:62`);
- `.filter((property) => property.duration)` for `transitionProperties` (`utils.ts:85`).

So a state authored to change at once after a delay (`duration: 0, delay: 500`) changes immediately: the delay is
lost on both paths.

In `generate()` the effect also writes the list's fallback, `--trns-0: _`. Within one interaction, that resets a
previous state effect's transition on the same target:

```js
generate({
  interactions: [{ key: 'a', trigger: 'click', effects: [{ effectId: 's1' }, { effectId: 's2' }] }],
  effects: {
    s1: {
      key: 'a',
      selector: '#a',
      transition: { duration: 6300, styleProperties: [{ name: 'transform', value: 'scale(1.2)' }] },
    },
    s2: {
      key: 'a',
      selector: '#a',
      transition: { duration: 0, delay: 500, styleProperties: [{ name: 'opacity', value: '0.5' }] },
    },
  },
});
// [data-interact-key="a"] #a { --trns-0: transform 6300ms ease; }
// …
// [data-interact-key="a"] #a { --trns-0: _; }          ← s1's transition is gone
// [data-interact-key="a"] #a { transition: var(--trns-0); }
```

**Plan:**

1. Write the entry whenever the duration or the delay is set: `opacity 0ms ease 500ms`.
2. Leave the fallback for effects that set neither.
3. Tests for `transition` and `transitionProperties`:
   - `duration: 0` with a delay;
   - `duration: 0` without one;
   - two effects in one interaction where the second has `duration: 0` and a delay.

## Order

2 first: it's small and self-contained. Then 1, which changes runtime output and needs a release note.
