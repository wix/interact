# Guides

Task-oriented guides for the parts of `@wix/motion` that go beyond a single function call — authoring
your own effects, generating CSS ahead of time, and getting the performance characteristics right.

## Available guides

- **[Custom Effects](./custom-effects.md)** — the `customEffect` callback, authoring and registering your
  own effect modules via `registerEffects()`, driving scrub scenes manually, and `data-motion-part`
  sub-targeting.
- **[SSR & CSS Generation](./ssr-css.md)** — the `getCSSAnimation()` descriptor shape, building a
  stylesheet from it, and how it enables FOUC-free rendering.
- **[Performance](./performance.md)** — preferring `transform`/`opacity`, `fastdom` batching, the CSS vs.
  WAAPI tradeoff, and reduced-motion handling.

## See also

- [API Reference](../api/README.md) — full function, class, and type signatures.
- [Core Concepts](../core-concepts.md) — the effect-definition modes, triggers, and mental model these
  guides build on.
