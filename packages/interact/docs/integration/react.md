# React Integration

This guide covers how to use `@wix/interact` with React applications. The library provides a dedicated React entry point with components and utilities designed for seamless React integration.

## Installation

```bash
npm install @wix/interact
```

## Import

```typescript
import { Interact, Interaction } from '@wix/interact/react';
```

## Quick Start

```tsx
import React, { useEffect } from 'react';
import { Interact, Interaction } from '@wix/interact/react';

const config = {
  interactions: [
    {
      key: 'my-button',
      trigger: 'hover',
      effects: [
        {
          keyframeEffect: {
            name: 'scale-up',
            keyframes: [{ transform: 'scale(1.1)' }],
          },
          duration: 200,
        },
      ],
    },
  ],
};

function Button() {
  return (
    <Interaction tagName="button" interactKey="my-button">
      Hover me!
    </Interaction>
  );
}

function App() {
  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return <Button />;
}
```

---

## The `Interaction` Component

The `Interaction` component is a wrapper that automatically manages interaction lifecycle for React components.

### Props

| Prop          | Type                          | Required | Description                                                                                   |
| ------------- | ----------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `tagName`     | `keyof JSX.IntrinsicElements` | Yes      | The HTML element to render (e.g., `'div'`, `'button'`, `'span'`)                              |
| `interactKey` | `string`                      | Yes      | Unique identifier matching the interaction configuration                                      |
| `initial`     | `boolean`                     | No       | When `true`, sets `data-interact-initial="true"` for FOUC prevention with entrance animations |
| `children`    | `React.ReactNode`             | No       | Child elements to render                                                                      |
| `ref`         | `React.Ref<any>`              | No       | Forwarded ref to the underlying DOM element                                                   |
| `...rest`     | `JSX.IntrinsicElements[T]`    | No       | Any valid props for the specified `tagName`                                                   |

### Basic Usage

```tsx
import { Interaction } from '@wix/interact/react';

// Render as a div
<Interaction tagName="div" interactKey="card" className="card">
  <h2>Card Title</h2>
  <p>Card content</p>
</Interaction>

// Render as a button
<Interaction tagName="button" interactKey="cta-button" onClick={handleClick}>
  Click me
</Interaction>

// Render as an image container
<Interaction tagName="figure" interactKey="image-hover">
  <img src="photo.jpg" alt="Photo" />
</Interaction>
```

### With Forwarded Refs

The `Interaction` component supports ref forwarding, allowing you to access the underlying DOM element:

```tsx
import React, { useRef, useEffect } from 'react';
import { Interaction } from '@wix/interact/react';

function AnimatedCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      console.log('Card element:', cardRef.current);
    }
  }, []);

  return (
    <Interaction tagName="div" interactKey="card" ref={cardRef} className="card">
      <h2>Interactive Card</h2>
    </Interaction>
  );
}
```

### TypeScript Support

The component is fully typed and provides type inference for the `tagName` prop:

```tsx
import { Interaction } from '@wix/interact/react';

// TypeScript knows these are valid button props
<Interaction
  tagName="button"
  interactKey="btn"
  type="submit"
  disabled={false}
  onClick={(e) => console.log(e.currentTarget)} // e is MouseEvent<HTMLButtonElement>
>
  Submit
</Interaction>

// TypeScript knows these are valid anchor props
<Interaction
  tagName="a"
  interactKey="link"
  href="/about"
  target="_blank"
>
  About Us
</Interaction>
```

---

## The `createInteractRef` Function

For more control over ref management, use `createInteractRef` to create a ref callback that handles interaction lifecycle.

### Signature

```typescript
function createInteractRef(interactKey: string): InteractRef;

type InteractRef = (node: Element | null) => () => void;
```

### Basic Usage

```tsx
import React, { useRef, useCallback, useEffect } from 'react';
import { Interact, createInteractRef } from '@wix/interact/react';

function CustomComponent() {
  const interactRef = useRef(createInteractRef('my-element'));

  useEffect(() => {
    Interact.create(config);
  }, []);

  return (
    <div ref={interactRef.current} data-interact-key="my-element">
      <span>Interactive content</span>
    </div>
  );
}
```

### React 18 vs React 19 Compatibility

The `createInteractRef` function is designed to work with both React 18 and React 19's different cleanup patterns:

```tsx
// React 18: Cleanup happens when ref receives null
// React 19: Cleanup happens via returned cleanup function

const interactRef = createInteractRef('my-key');

// The ref callback handles both patterns automatically:
// - When node is null (React 18 unmount), it calls remove()
// - Returns a cleanup function for React 19+
```

### Combining with Other Refs

When you need to combine the interact ref with other refs:

```tsx
import React, { useRef, useCallback } from 'react';
import { createInteractRef } from '@wix/interact/react';

function CombinedRefExample() {
  const localRef = useRef<HTMLDivElement>(null);
  const interactRef = useRef(createInteractRef('combined'));

  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    // Set local ref
    localRef.current = node;

    // Call interact ref
    const cleanup = interactRef.current(node);

    // Return cleanup for React 19+
    return cleanup;
  }, []);

  return (
    <div ref={combinedRef} data-interact-key="combined">
      Content
    </div>
  );
}
```

---

## Configuration Patterns

### Basic Setup with useEffect

```tsx
import React, { useEffect } from 'react';
import { Interact, Interaction, InteractConfig } from '@wix/interact/react';

const config: InteractConfig = {
  interactions: [
    {
      key: 'fade-card',
      trigger: 'viewEnter',
      effects: [
        {
          keyframeEffect: {
            name: 'fade-in',
            keyframes: [
              { opacity: 0, transform: 'translateY(20px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          duration: 600,
          easing: 'ease-out',
        },
      ],
    },
  ],
};

function App() {
  useEffect(() => {
    const instance = Interact.create(config);

    // Cleanup on unmount
    return () => {
      instance.destroy();
    };
  }, []);

  return (
    <Interaction tagName="div" interactKey="fade-card" className="card">
      <h2>Animated Card</h2>
      <p>This card fades in when it enters the viewport.</p>
    </Interaction>
  );
}
```

### Custom Hook for Reusability

```tsx
import { useEffect, useRef } from 'react';
import { Interact, InteractConfig } from '@wix/interact/react';

export function useInteract(config: InteractConfig) {
  const instanceRef = useRef<Interact | null>(null);

  useEffect(() => {
    instanceRef.current = Interact.create(config);

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [config]);

  return instanceRef;
}

// Usage
function MyComponent() {
  useInteract(config);

  return (
    <Interaction tagName="div" interactKey="my-element">
      Content
    </Interaction>
  );
}
```

### Multiple Instances

```tsx
import React, { useEffect } from 'react';
import { Interact, Interaction } from '@wix/interact/react';

const heroConfig = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [
        /* ... */
      ],
    },
  ],
};

const cardsConfig = {
  interactions: [
    {
      key: 'card',
      trigger: 'hover',
      effects: [
        /* ... */
      ],
    },
  ],
};

function App() {
  useEffect(() => {
    const heroInstance = Interact.create(heroConfig);
    const cardsInstance = Interact.create(cardsConfig);

    return () => {
      heroInstance.destroy();
      cardsInstance.destroy();
    };
  }, []);

  return (
    <>
      <Interaction tagName="section" interactKey="hero">
        <h1>Welcome</h1>
      </Interaction>

      <Interaction tagName="article" interactKey="card">
        <h2>Card 1</h2>
      </Interaction>

      <Interaction tagName="article" interactKey="card">
        <h2>Card 2</h2>
      </Interaction>
    </>
  );
}
```

---

## State-Based Interactions

### Click Toggle Effects

```tsx
import React, { useEffect } from 'react';
import { Interact, Interaction, InteractConfig } from '@wix/interact/react';

const config: InteractConfig = {
  effects: {
    expanded: {
      transition: {
        duration: 300,
        easing: 'ease-out',
        styleProperties: [
          { name: 'max-height', value: '200px' },
          { name: 'padding', value: '16px' },
        ],
      },
    },
  },
  interactions: [
    {
      key: 'accordion',
      trigger: 'click',
      selector: '.accordion-header',
      effects: [{ effectId: 'expanded', method: 'toggle' }],
    },
  ],
};

function Accordion() {
  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return (
    <Interaction tagName="div" interactKey="accordion" className="accordion">
      <button className="accordion-header">Toggle</button>
      <div className="accordion-content">
        <p>Expandable content here</p>
      </div>
    </Interaction>
  );
}
```

### Accessing Active Effects

```tsx
import React, { useRef, useEffect } from 'react';
import { Interact, Interaction } from '@wix/interact/react';

function EffectAwareComponent() {
  const elementRef = useRef<HTMLDivElement>(null);

  const checkEffects = () => {
    const controller = Interact.getController('my-element');
    if (controller) {
      const activeEffects = controller.getActiveEffects();
      console.log('Active effects:', activeEffects);
    }
  };

  return (
    <Interaction tagName="div" interactKey="my-element" ref={elementRef} onClick={checkEffects}>
      Click to check effects
    </Interaction>
  );
}
```

---

## Lists and Dynamic Content

### Animated Lists

```tsx
import React, { useEffect, useState } from 'react';
import { Interact, Interaction, InteractConfig } from '@wix/interact/react';

const config: InteractConfig = {
  interactions: [
    {
      key: 'product-list',
      trigger: 'viewEnter',
      listContainer: '.products',
      effects: [
        {
          keyframeEffect: {
            name: 'slide-up',
            keyframes: [
              { opacity: 0, transform: 'translateY(30px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          duration: 400,
          stagger: 100, // Stagger animation for list items
        },
      ],
    },
  ],
};

function ProductList() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Product A' },
    { id: 2, name: 'Product B' },
    { id: 3, name: 'Product C' },
  ]);

  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: `Product ${prev.length + 1}`,
      },
    ]);
  };

  return (
    <Interaction tagName="div" interactKey="product-list">
      <button onClick={addProduct}>Add Product</button>
      <div className="products">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            {product.name}
          </div>
        ))}
      </div>
    </Interaction>
  );
}
```

---

## Server-Side Rendering (SSR)

### Next.js App Router

```tsx
// app/components/InteractiveCard.tsx
'use client';

import { useEffect } from 'react';
import { Interact, Interaction } from '@wix/interact/react';

const config = {
  /* ... */
};

export function InteractiveCard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return (
    <Interaction tagName="div" interactKey="card">
      {children}
    </Interaction>
  );
}
```

### Next.js Pages Router

```tsx
// pages/index.tsx
import { useEffect } from 'react';
import { Interact, Interaction } from '@wix/interact/react';

const config = {
  /* ... */
};

export default function Home() {
  useEffect(() => {
    // Only runs on client
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return (
    <Interaction tagName="main" interactKey="hero">
      <h1>Welcome</h1>
    </Interaction>
  );
}
```

## Troubleshooting

### React StrictMode

React's StrictMode double-invokes effects in development. The library handles this gracefully:

```tsx
// This works correctly even in StrictMode
useEffect(() => {
  const instance = Interact.create(config);
  return () => instance.destroy();
}, []);
```

### Memory leaks

Always clean up instances:

```tsx
useEffect(() => {
  const instance = Interact.create(config);

  // Always return cleanup function
  return () => {
    instance.destroy();
  };
}, []);
```

---

## See Also

- [Getting Started](../guides/getting-started.md) - Basic concepts and setup
- [Interact Class](../api/interact-class.md) - Main class API
- [InteractionController](../api/interaction-controller.md) - Controller API
- [Configuration Guide](../guides/configuration-structure.md) - Configuration options
- [Type Definitions](../api/types.md) - TypeScript types
