<!-- #install -->
```bash
npm install @wix/interact @wix/motion-presets
```
<!-- #web -->
**Web (Custom Elements):**

```ts
import { Interact } from '@wix/interact/web';
const instance = Interact.create(config);
```

The `config` object is an `InteractConfig` containing `interactions` (required), and optionally shared `effects`, `sequences`, and `conditions`.
<!-- #web-brief -->
```typescript
import { Interact } from '@wix/interact/web';

Interact.create(config);
```

The `config` object contains `interactions` (trigger-effect bindings), and optionally `effects`, `sequences`, and `conditions`. See [Configuration Schema](#configuration-schema) for full details.
<!-- #react -->
**React:**

- Wrap the `Interact.create()` call in a `useEffect` hook to prevent it from running on server-side.
- Store the returned instance, and call its `.destroy()` method on the effect's cleanup function.

```ts
import { useEffect } from 'react';
import { Interact } from '@wix/interact/react';

useEffect(() => {
  const instance = Interact.create(config);

  return () => {
    instance.destroy();
  };
}, [config]);
```
<!-- #vanilla -->
**Vanilla JS:**

```ts
import { Interact } from '@wix/interact';
const instance = Interact.create(config);
instance.add(element, 'hero'); // bind after element exists in DOM
instance.remove('hero'); // unregister
```
<!-- #vanilla-brief -->
```typescript
import { Interact } from '@wix/interact';

const interact = Interact.create(config);
interact.add(element, 'hero');
```
<!-- #cdn -->
**CDN (no build tools):**

```html
<script type="module">
  import { Interact } from 'https://esm.sh/@wix/interact';
  Interact.create(config);
</script>
```
<!-- #register-presets -->
**Registering presets** — MUST be called before calling `Interact.create()` with usage of `namedEffect`:

```ts
import * as presets from '@wix/motion-presets';
Interact.registerEffects(presets);
```

Or selectively:

```ts
import { FadeIn, ParallaxScroll } from '@wix/motion-presets';
Interact.registerEffects({ FadeIn, ParallaxScroll });
```
<!-- #multiple-instances -->
Create the full config up-front and pass it in a single `create` call. Subsequent calls create new `Interact` instances. When creating multiple instances, each manages its own set of interactions independently — use separate instances for isolated component scopes or lazy-loaded sections.
