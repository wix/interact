<!-- #full-lean -->
Named conditions that gate interactions, effects, or sequences.

| Type       | Predicate                                                                 |
| :--------- | :------------------------------------------------------------------------ |
| `media`    | CSS media query condition without `@media` (e.g., `'(min-width: 768px)'`) |
| `selector` | CSS selector; `&` is replaced with the base element selector              |

Attach via `conditions: ['[CONDITION_ID]']` on interactions, effects, or sequences. On an interaction, conditions gate the entire trigger; on an effect, only that specific effect is skipped. All listed conditions must pass.

### Examples

```ts
conditions: {
  'desktop': { type: 'media', predicate: '(min-width: 768px)' },
  'hover-device': { type: 'media', predicate: '(hover: hover)' },
  'reduced-motion': { type: 'media', predicate: '(prefers-reduced-motion: reduce)' },
  'odd-items': { type: 'selector', predicate: ':nth-of-type(odd)' },
}
```
