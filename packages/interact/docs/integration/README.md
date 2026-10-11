# Integration Guides

Framework-specific integration guides and migration documentation for `@wix/interact`.

## Package Entry Points

`@wix/interact` provides three entry points optimized for different use cases:

| Entry Point           | Use Case           | Key Exports                 |
| --------------------- | ------------------ | --------------------------- |
| `@wix/interact/react` | React applications | `Interact`, `Interaction`   |
| `@wix/interact/web`   | Web Components     | `Interact`                  |
| `@wix/interact`       | Vanilla JS         | `Interact`, `add`, `remove` |

## Framework Integration

### React

- [**React Integration**](react.md) - Complete React setup guide
  - [Interaction Component](react.md#the-interaction-component) - React component for interactive elements
  - [createInteractRef](react.md#the-createinteractref-function) - Ref callback for manual control
  - [Configuration Patterns](react.md#configuration-patterns) - useEffect and custom hooks
  - [TypeScript Support](react.md#typescript-support) - Full type inference
  - [SSR Compatibility](react.md#server-side-rendering-ssr) - Next.js and other SSR frameworks

### Vanilla JavaScript and Web Components

- [**Custom Elements**](../guides/custom-elements.md) - `<interact-element>`, the `/web` entry point
- [**`Interact` class**](../api/interact-class.md) - `create`, `add`, `remove`, `generate`, static options
- [**Element selection**](../api/element-selection.md) - `key`, `selector`, `listContainer`

### Other Frameworks

Any framework that renders HTML can use the `/web` entry point — see the Vue and Angular snippets
under [Basic Integration](#basic-integration) below. The only requirements are that
`<interact-element>` wraps the keyed element and that `Interact.create(config)` runs once on mount.

## Related Guides

- [**Getting started**](../guides/getting-started.md) - First interaction, React and vanilla
- [**Configuration structure**](../guides/configuration-structure.md) - Anatomy of an `InteractConfig`
- [**Conditions and media queries**](../guides/conditions-and-media-queries.md) - Responsive and reduced-motion behaviour
- [**Lists and dynamic content**](../guides/lists-and-dynamic-content.md) - Repeaters and runtime-added items
- [**Plugins**](../guides/plugins.md) - `Interact.use()` and `$`-prefixed fields

## Quick Reference

### Installation Commands

```bash
# npm
npm install @wix/interact

# yarn
yarn add @wix/interact

# pnpm
pnpm add @wix/interact
```

### Entry Point Imports

```typescript
// React applications (recommended for React)
import { Interact, Interaction, createInteractRef, InteractRef } from '@wix/interact/react';

// Web Components
import { Interact, add, remove } from '@wix/interact/web';

// Vanilla JavaScript
import { Interact, add, remove } from '@wix/interact';
```

### Basic Integration

**React:**

```tsx
import { useEffect } from 'react';
import { Interact, Interaction } from '@wix/interact/react';

const config = {
  /* your config */
};

function App() {
  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return (
    <Interaction tagName="div" interactKey="my-element">
      Interactive content
    </Interaction>
  );
}
```

**Web Components:**

```typescript
import { Interact } from '@wix/interact/web';

const config = {
  /* your config */
};

// Initialize
Interact.create(config);
```

```html
<interact-element data-interact-key="my-element">
  <div>Interactive content</div>
</interact-element>
```

**Vanilla:**

```typescript
import { Interact, add } from '@wix/interact';

const config = {
  /* your config */
};

// Initialize
Interact.create(config);

add(document.querySelector('[data-interact-key="my-element"]'));
```

```html
<div data-interact-key="my-element">Interactive content</div>
```

**Vue:**

```vue
<template>
  <interact-element data-interact-key="my-element">
    <div>Interactive content</div>
  </interact-element>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { Interact } from '@wix/interact/web';

const config = {
  /* your config */
};

onMounted(() => {
  Interact.create(config);
});

onUnmounted(() => {
  Interact.destroy();
});
</script>
```

**Angular:**

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Interact } from '@wix/interact/web';

@Component({
  template: `
    <interact-element data-interact-key="my-element">
      <div>Interactive content</div>
    </interact-element>
  `,
})
export class MyComponent implements OnInit, OnDestroy {
  ngOnInit() {
    Interact.create(config);
  }

  ngOnDestroy() {
    Interact.destroy();
  }
}
```

For detailed examples and step-by-step instructions, explore the specific integration guides above.
