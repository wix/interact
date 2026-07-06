# Custom Elements

The `<interact-element>` custom element is the foundation of `@wix/interact`. This guide explains how it works, when to use it, and how to integrate it effectively into your applications.

## What is interact-element?

`<interact-element>` is a custom HTML element that serves as a bridge between your HTML content and the `@wix/interact` system. It:

- **Wraps your interactive content** to enable trigger detection
- **Manages element state** using CSS custom states
- **Handles lifecycle events** for adding/removing interactions
- **Provides a unique identifier** via `data-interact-key`

## Basic Usage

### HTML Structure

```html
<interact-element data-interact-key="my-button">
  <button id="my-button">Click me</button>
</interact-element>
```

### React/JSX Usage

```tsx
import React from 'react';

function InteractiveButton() {
  return (
    <interact-element data-interact-key="my-button">
      <button id="my-button">Click me</button>
    </interact-element>
  );
}
```

### Key Requirements

1. **Unique `data-interact-key`** - Must match your interaction `key` property
2. **Child element** - The custom element must contain at least one child

## The data-interact-key Attribute

The `data-interact-key` attribute is crucial - it connects your HTML to your interaction configuration.

### Matching Keys

The key must match your interaction's key property:

```typescript
// Configuration
{
    key: 'my-button',  // This key...
    trigger: 'hover',
    effects: [/* ... */]
}
```

```html
<!-- Must match this key -->
<interact-element data-interact-key="my-button">
  <button id="my-button">Hover me</button>
</interact-element>
```

## Element Lifecycle

When `<interact-element>` connects to the DOM:

1. **Custom element registration** - Registers the element class if not already done
2. **Key validation** - Checks for valid `data-interact-key`
3. **Child validation** - Ensures at least one child element exists
4. **Interaction activation** - Calls `add()` to enable interactions when connected to DOM
5. **Automatic cleanup** - Calls `remove()` to clean up interactions when disconnected from DOM

## State Management

### CSS Custom States

`<interact-element>` uses modern CSS custom states for effect management:

```css
/* Target elements in specific states */
interact-element:state(hover-active) .my-element {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

interact-element:state(clicked) .my-element {
  background-color: #blue;
}
```

### Legacy Browser Support

For browsers without custom state support, falls back to CSS classes:

```css
/* Legacy fallback */
interact-element.--hover-active .my-element {
  transform: scale(1.1);
}
```

### State Toggle Actions

The element provides actions to manage states:

1. `add`: adds a state named by `effectId`
2. `remove`: removes a state named by `effectId`
3. `toggle`: toggles a state named by `effectId`
4. `clear`: removes all states

## Integration Patterns

### React Integration

TBD

### Vue Integration

```vue
<template>
  <interact-element :data-interact-key="`${elementId}`">
    <div :id="elementId" class="interactive-element">
      <slot />
    </div>
  </interact-element>
</template>

<script>
import { Interact } from '@wix/interact';

export default {
  props: ['elementId'],
  mounted() {
    const config = {
      interactions: [
        {
          key: this.elementId,
          trigger: 'hover',
          effects: [
            {
              key: this.elementId,
              namedEffect: {
                type: 'FadeIn',
              },
              duration: 300,
            },
          ],
        },
      ],
    };

    Interact.create(config);
  },
};
</script>
```

### Vanilla JavaScript

```javascript
// Create element programmatically
function createInteractiveElement(id, content) {
  const interactElement = document.createElement('interact-element');
  interactElement.dataset.interactKey = id;

  const childElement = document.createElement('div');
  childElement.id = id;
  childElement.innerHTML = content;

  interactElement.appendChild(childElement);

  return interactElement;
}

// Usage
const interactive = createInteractiveElement('my-element', 'Interactive content');
document.body.appendChild(interactive);
```

## Advanced Usage

### Multiple Children

You can have multiple children, but only the first one is used for interaction targeting:

```html
<interact-element data-interact-key="main-target">
  <div id="main-target">Primary interactive element</div>
  <div>Supporting content (not interactive)</div>
  <span>Additional content</span>
</interact-element>
```

### Nested interact-elements

Nesting is supported for complex interactions:

```html
<interact-element data-interact-key="outer-container">
  <div id="outer-container">
    <interact-element data-interact-key="inner-button">
      <button id="inner-button">Nested interactive button</button>
    </interact-element>
    <p>Other content in outer container</p>
  </div>
</interact-element>
```

### Dynamic Key Updates

You can change the key dynamically:

```javascript
const element = document.querySelector('interact-element');

// Remove old interactions
if (element.dataset.interactKey) {
  remove(element.dataset.interactKey);
}

// Update key
element.dataset.interactKey = 'new-target';

// Reconnect with new key
element.connect('new-target');
```

## Styling interact-element

### Default Display

The custom element has minimal default styling:

```css
interact-element {
  display: contents; /* Doesn't affect layout */
}
```

### Custom Styling

You can style the element wrapper if needed:

```css
/* Make wrapper a block container */
interact-element.card-wrapper {
  display: block;
  padding: 1rem;
  border-radius: 8px;
}

/* Style based on state */
interact-element:state(hover-active) {
  background-color: rgba(0, 0, 0, 0.05);
}
```

## Troubleshooting

### Common Issues

#### "No key provided" Warning

```html
<!-- Wrong - missing data-interact-key -->
<interact-element>
  <div>Content</div>
</interact-element>

<!-- Correct -->
<interact-element data-interact-key="my-element">
  <div id="my-element">Content</div>
</interact-element>
```

#### "No child element found" Warning

```html
<!-- Wrong - empty element -->
<interact-element data-interact-key="my-element"></interact-element>

<!-- Correct -->
<interact-element data-interact-key="my-element">
  <div id="my-element">Content</div>
</interact-element>
```

### Debugging Tips

#### Check Element Registration

```javascript
// Verify custom element is registered
console.log('interact-element registered:', customElements.get('interact-element') !== undefined);
```

#### Inspect Element State

```javascript
const element = document.querySelector('interact-element');
console.log('Connected:', element.connected);
console.log('Key:', element.dataset.interactKey);
console.log('Has child:', element.firstElementChild !== null);
```

#### Monitor State Changes

```javascript
const element = document.querySelector('interact-element');
if (element._internals) {
  console.log('Current states:', Array.from(element._internals.states));
}
```

## Performance Considerations

### Element Creation

- Custom elements are lightweight but avoid creating thousands
- Use the `selector` property to target elements inside a single custom element component
- Consider using event delegation for dynamic content

### Memory Management

- Elements automatically clean up when removed from DOM
- For SPA routing, ensure proper cleanup during navigation
- Use `remove()` explicitly if needed for manual cleanup

## Browser Support

### Modern Browsers

- Adopted style sheets for dynamic CSS

## Best Practices

TBD

## Next Steps

Now that you understand custom elements:

- **[State Management](./state-management.md)** - Learn about CSS states vs data attributes
- **[Conditions and Media Queries](./conditions-and-media-queries.md)** - Create responsive interactions
- **[Understanding Triggers](./understanding-triggers.md)** - Master trigger types and behaviors
