<!-- #default -->
## Element Binding

**CRITICAL:** Do NOT add observers/event listeners manually. The runtime binds triggers and effects via element keys.

### Web: `<interact-element>`

- MUST set `data-interact-key` to a unique value.
- MUST contain at least one child element (the library targets `.firstElementChild`).
- If an effect targets a different element, that element also needs its own `<interact-element>`.

```html
<interact-element data-interact-key="hero">
  <section class="hero">...</section>
</interact-element>
```

### React: `<Interaction>` component

- MUST set `tagName` to the replaced element's HTML tag.
- MUST set `interactKey` to a unique string.

```tsx
import { Interaction } from '@wix/interact/react';

<Interaction tagName="section" interactKey="hero" className="hero">
  ...
</Interaction>;
```
