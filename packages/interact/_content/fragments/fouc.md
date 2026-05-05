<!-- #short -->
**Problem:** Elements with entrance animations (e.g. `FadeIn`) start in their final visible state (e.g. `opacity: 1`). Before the animation framework initializes and applies the starting keyframe (e.g. `opacity: 0`), the element is briefly visible at full opacity — a flash of un-animated content.

**Solution:** Two things are required — **both** MUST be present for FOUC prevention to work:

1. **Generate critical CSS** using `generate(config)` — produces CSS rules that hide entrance-animated elements from the moment the page renders, before JavaScript runs.
2. **Mark elements with `initial`** — set `data-interact-initial="true"` on `<interact-element>`, or `initial={true}` on the `<Interaction>` React component. This tells the runtime which elements have critical CSS applied.

If only one of these is present, FOUC prevention will **not** work. Both the CSS and the `initial` attribute are required.
<!-- #long -->
**Problem:** Elements with entrance animations (e.g. `viewEnter` + `type: 'once'` with `FadeIn`) start in their final visible state. Before the animation framework initializes and applies the starting keyframe (e.g. `opacity: 0`), the element is briefly visible at full opacity — causing a flash of unstyled/un-animated content (FOUC).

**Solution:** Two things are required — both MUST be present:

1. **Generate critical CSS** using `generate(config)` — produces CSS rules that hide entrance-animated elements from the moment the page renders.
2. **Mark elements with `initial`** — tells the runtime which elements have critical CSS applied so it can coordinate with the generated styles.
<!-- #code-generate-viewenter -->
```typescript
import { generate } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    {
      key: '[SOURCE_KEY]',
      trigger: 'viewEnter',
      params: {
        threshold: [VIEW_TRIGGER_THRESHOLD],
        inset: [VIEW_TRIGGER_INSET],
      },
      effects: [EFFECT_DEFINITIONS],
      // and/or
      sequences: [SEQUENCE_DEFINITIONS],
    },
  ],
};

const css = generate(config);
```
<!-- #code-generate-web -->
```ts
import { generate } from '@wix/interact/web';
const css = generate(config);
```
<!-- #code-inject -->
**Append to `<head>` or beginning of `<body>`:**

```html
<style>
  ${css}
</style>
```
<!-- #code-web -->
**Web (Custom Elements):**

```html
<interact-element data-interact-key="{{key}}" data-interact-initial="true">
  <section{{classAttr}}>...</section>
</interact-element>
```
<!-- #code-react -->
**React:**

```tsx
<Interaction tagName="section" interactKey="{{key}}" initial={true}{{classAttr}}>
  ...
</Interaction>
```
<!-- #code-vanilla -->
**Vanilla:**

```html
<section data-interact-key="{{key}}" data-interact-initial="true"{{classAttr}}>...</section>
```
<!-- #rules-viewenter -->
### Rules

- `generate()` should be called server-side or at build time. Can also be called on the client if the page content is initially hidden (e.g. behind a loader/splash screen).
- `initial` is only valid for `viewEnter` + `triggerType: 'once'` (or no `triggerType`, which defaults to `'once'`) where source and target are the same element.
- Do NOT use `initial` for `viewEnter` with `triggerType: 'repeat'`/`'alternate'`/`'state'`. For those, manually apply the initial keyframe as inline styles on the target element and use `fill: 'both'`.
- If other interactions in the config also need FOUC prevention, `generate(config)` covers them all — set `initial` only on the relevant `viewEnter` + `triggerType: 'once'` elements.
<!-- #rules-brief -->
**Rules:**

- `generate()` should be called server-side or at build time. Can also be called on the client if page content is initially hidden (e.g. behind a loader).
- Only valid for `viewEnter` + `triggerType: 'once'` (or no `triggerType`, which defaults to `'once'`) where source and target are the same element.
<!-- #rules-detailed -->
### Rules

- `generate()` should be called server-side or at build time. Can also be called on client-side if page content is initially hidden (e.g. behind a loader/splash screen).
- **Both** `generate(config)` CSS **and** `initial` on the element are required. Using only one has no effect.
- `initial` is only valid for `viewEnter` + `type: 'once'` where source and target are the same element.
- For `repeat`/`alternate`/`state`, do NOT use `initial`. Instead, manually apply the initial keyframe as inline styles on the target element and use `fill: 'both'`.
<!-- #intro-brief -->
**Problem:** Elements with entrance animations (e.g. `FadeIn` on `viewEnter`) are initially visible in their final state. Before the animation framework applies the starting keyframe, the content flashes visibly — a flash of un-animated content (FOUC).

**Solution:** Two things are required — both MUST be present:

1. **Generate critical CSS** with `generate(config)` — produces CSS that hides entrance-animated elements until the animation plays.
2. **Mark elements with `initial`** — `data-interact-initial="true"` on `<interact-element>`, or `initial={true}` on `<Interaction>` in React.

Using only one of these has no effect — both are required.

See [viewenter.md](./viewenter.md) for full details.
