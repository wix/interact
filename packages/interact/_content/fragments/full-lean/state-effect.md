<!-- #default -->
### StateEffect (CSS style toggle)

Used with `hover` / `click` triggers. Set `stateAction` on the effect to control state behavior.

**StateEffect** (CSS transition-style state toggles):

- `key?`: string (target override; see TARGET CASCADE)
- `effectId?`: string (when used as a reference identity)
- One of:
  - `transition?`: `{ duration?: number; delay?: number; easing?: string; styleProperties: { name: string; value: string }[] }`
    - Applies a single transition options block to all listed style properties.
  - `transitionProperties?`: `Array<{ name: string; value: string; duration?: number; delay?: number; easing?: string }>`
    - Allows per-property transition options. If both `transition` and `transitionProperties` are provided, the system SHOULD apply both with per-property entries taking precedence for overlapping properties.

```ts
// Shared timing for all properties:
{
  transition: {
    duration?: number; delay?: number; easing?: string;
    styleProperties: [{ name: string; value: string }]
  }
}

// Per-property timing:
{
  transitionProperties: [
    { name: string; value: string; duration?: number; delay?: number; easing?: string }
  ]
}
```

CSS property names use **camelCase** (e.g. `'backgroundColor'`, `'borderRadius'`).
