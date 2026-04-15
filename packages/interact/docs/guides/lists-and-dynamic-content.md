# Lists and Dynamic Content

Working with dynamic lists is one of the most powerful features of `@wix/interact`. This guide explains how to create animations for lists, handle dynamic content, and optimize performance for large datasets.

## Overview

When working with lists, you have two main approaches:

1. **Individual Elements** - Treat each list item as a separate interaction
2. **List Container** - Use `listContainer` to target all items in a collection

The `listContainer` approach is **highly recommended** for:

- Dynamic lists that change (items added/removed)
- Large lists (100+ items)
- Staggered animations
- Consistent behavior across all items

## Basic List Animations

### Using listContainer

The `listContainer` property tells `@wix/interact` to:

1. Find the container element
2. Automatically track all its child elements
3. Apply interactions to each child
4. Watch for DOM additions/removals of direct children

```typescript
import { Interact } from '@wix/interact';

const config = {
  interactions: [
    {
      key: 'product-grid',
      listContainer: '.grid', // Container selector
      trigger: 'viewEnter',
      params: { threshold: 0.1 },
      effects: [
        {
          key: 'product-grid',
          listContainer: '.grid', // Target the same container
          keyframeEffect: {
            name: 'fade-slide',
            keyframes: [
              { opacity: '0', transform: 'translateY(20px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 600,
          easing: 'ease-out',
        },
      ],
    },
  ],
};

Interact.create(config);
```

```html
<interact-element data-interact-key="product-grid">
  <div class="grid">
    <div class="item">Product 1</div>
    <div class="item">Product 2</div>
    <div class="item">Product 3</div>
    <!-- More items... -->
  </div>
</interact-element>
```

### Combining listContainer with selector

Use both properties to target specific elements within each list item:

```typescript
{
    key: 'gallery',
    listContainer: '.gallery-grid',    // Container with items
    selector: '.gallery-item img',     // Image in each item
    trigger: 'hover',
    effects: [{
        key: 'gallery',
        listContainer: '.gallery-grid',
        selector: '.gallery-item .overlay',  // Different target within item
        keyframeEffect: {
            name: 'reveal-overlay',
            keyframes: [
                { opacity: '0', transform: 'translateY(100%)' },
                { opacity: '1', transform: 'translateY(0)' }
            ]
        },
        duration: 300
    }]
}
```

```html
<interact-element data-interact-key="gallery">
  <div class="gallery-grid">
    <div class="gallery-item">
      <img src="image1.jpg" />
      <div class="overlay">View Details</div>
    </div>
    <div class="gallery-item">
      <img src="image2.jpg" />
      <div class="overlay">View Details</div>
    </div>
    <!-- More items... -->
  </div>
</interact-element>
```

## Staggered Animations

Create sequential entrance animations for list items using delays:

### CSS-Based Stagger

```typescript
{
    key: 'feature-list',
    listContainer: '.features',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'feature-list',
        listContainer: '.features',
        keyframeEffect: {
            name: 'stagger-fade',
            keyframes: [
                { opacity: '0', transform: 'translateX(-30px)' },
                { opacity: '1', transform: 'translateX(0)' }
            ]
        },
        duration: 500,
        easing: 'ease-out'
    }]
}
```

```css
/* Add stagger delay via CSS */
.features > *:nth-child(1) {
  animation-delay: 0ms;
}
.features > *:nth-child(2) {
  animation-delay: 100ms;
}
.features > *:nth-child(3) {
  animation-delay: 200ms;
}
.features > *:nth-child(4) {
  animation-delay: 300ms;
}
.features > *:nth-child(5) {
  animation-delay: 400ms;
}

/* Or use a formula for unlimited items */
.features > * {
  animation-delay: calc(var(--stagger-index, 0) * 100ms);
}
```

### Programmatic Stagger

For more control, use data attributes:

```html
<interact-element data-interact-key="animated-list">
  <ul class="list">
    <li data-delay="0">Item 1</li>
    <li data-delay="100">Item 2</li>
    <li data-delay="200">Item 3</li>
  </ul>
</interact-element>
```

```typescript
{
    key: 'animated-list',
    listContainer: '.list',
    trigger: 'viewEnter',
    effects: [{
        key: 'animated-list',
        listContainer: '.list',
        customEffect: (element) => {
            const delay = parseInt(element.dataset.delay || '0');
            return element.animate([
                { opacity: 0, transform: 'scale(0.8)' },
                { opacity: 1, transform: 'scale(1)' }
            ], {
                duration: 400,
                delay,
                fill: 'both',
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
            });
        }
    }]
}
```

## Dynamic List Management

### Automatic Mutation Tracking

`@wix/interact` automatically watches for changes in list containers:

```typescript
// Configuration
const config = {
  interactions: [
    {
      key: 'todo-list',
      listContainer: '.todos',
      trigger: 'viewEnter',
      effects: [
        {
          key: 'todo-list',
          listContainer: '.todos',
          keyframeEffect: {
            name: 'slide-in',
            keyframes: [
              { opacity: '0', transform: 'translateX(-20px)' },
              { opacity: '1', transform: 'translateX(0)' },
            ],
          },
          duration: 300,
        },
      ],
    },
  ],
};

Interact.create(config);
```

```javascript
// Add new item - animation applies automatically
function addTodoItem(text) {
  const todoList = document.querySelector('.todos');
  const newItem = document.createElement('div');
  newItem.className = 'todo-item';
  newItem.textContent = text;

  todoList.appendChild(newItem); // Automatically triggers animation
}

// Remove item - cleanup happens automatically
function removeTodoItem(item) {
  item.remove(); // Automatically cleaned up
}
```

### Manual List Item Management

For advanced use cases, use the list management API:

```typescript
import { addListItems, removeListItems } from '@wix/interact';

// Add specific items
function addItems(containerElement, items) {
  const root = document.querySelector('interact-element[data-interact-key="my-list"]');
  addListItems(root, 'my-list', '.list-container', items);
}

// Remove specific items
function removeItems(items) {
  removeListItems(items);
}
```

### watchChildList Method

The custom element's `watchChildList` method sets up mutation observers:

```typescript
const element = document.querySelector('interact-element');

// Start watching for changes in a container
element.watchChildList('.dynamic-list');

// Now any DOM changes in .dynamic-list will be tracked
```

**How it works:**

1. Creates a `MutationObserver` for the container
2. Tracks `childList` mutations (additions/removals)
3. Automatically calls `addListItems` for new elements
4. Automatically calls `removeListItems` for removed elements
5. Applies interactions to new items
6. Cleans up removed items

## List Animation Patterns

### Entrance Animations

#### Fade In Sequence

```typescript
{
    key: 'cards',
    listContainer: '.card-grid',
    trigger: 'viewEnter',
    params: { threshold: 0.1 },
    effects: [{
        key: 'cards',
        listContainer: '.card-grid',
        keyframeEffect: {
            name: 'fade-in',
            keyframes: [
                { opacity: '0' },
                { opacity: '1' }
            ]
        },
        duration: 600,
        easing: 'ease-out'
    }]
}
```

#### Slide Up Cascade

```typescript
{
    key: 'features',
    listContainer: '.feature-list',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'features',
        listContainer: '.feature-list',
        keyframeEffect: {
            name: 'slide-up',
            keyframes: [
                { opacity: '0', transform: 'translateY(40px)' },
                { opacity: '1', transform: 'translateY(0)' }
            ]
        },
        duration: 700,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    }]
}
```

#### Scale and Rotate

```typescript
{
    key: 'photos',
    listContainer: '.photo-grid',
    trigger: 'viewEnter',
    params: { threshold: 0.15 },
    effects: [{
        key: 'photos',
        listContainer: '.photo-grid',
        keyframeEffect: {
            name: 'scale-rotate',
            keyframes: [
                { opacity: '0', transform: 'scale(0.5) rotate(-10deg)' },
                { opacity: '1', transform: 'scale(1) rotate(0deg)' }
            ]
        },
        duration: 800,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Elastic
    }]
}
```

### Hover Effects on Lists

```typescript
{
    key: 'product-grid',
    listContainer: '.products',
    trigger: 'hover',
    effects: [
        // Lift the product card
        {
            key: 'product-grid',
            listContainer: '.products',
            keyframeEffect: {
                name: 'lift',
                keyframes: [
                    { transform: 'translateY(0)', boxShadow: '0 2px 8px rgb(0 0 0 / 0.1)' },
                    { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgb(0 0 0 / 0.15)' }
                ]
            },
            duration: 250
        },
        // Zoom the image
        {
            key: 'product-grid',
            listContainer: '.products',
            selector: '.product-image img',
            keyframeEffect: {
                name: 'zoom',
                keyframes: [
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.1)' }
                ]
            },
            duration: 300
        }
    ]
}
```

### Infinite Scroll Integration

```typescript
{
    key: 'infinite-list',
    listContainer: '.items',
    trigger: 'viewEnter',
    params: { threshold: 0.1 },
    effects: [{
        key: 'infinite-list',
        listContainer: '.items',
        triggerType: 'repeat',
        keyframeEffect: {
            name: 'fade-slide',
            keyframes: [
                { opacity: '0', transform: 'translateY(30px)' },
                { opacity: '1', transform: 'translateY(0)' }
            ]
        },
        duration: 500
    }]
}
```

```javascript
// Infinite scroll implementation
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      loadMoreItems(); // New items automatically get animations
    }
  });
});

observer.observe(document.querySelector('.loading-sentinel'));

function loadMoreItems() {
  const container = document.querySelector('.items');

  // Fetch and add new items
  fetchItems().then((items) => {
    items.forEach((item) => {
      const element = createItemElement(item);
      container.appendChild(element);
      // Animation triggers automatically via mutation observer
    });
  });
}
```

## Performance Optimization

### When to Use listContainer

**✅ Use listContainer for:**

- Lists with 2+ items
- Dynamic lists (items added/removed)
- Consistent interactions across all items
- Staggered entrance effects
- Lists that grow (infinite scroll, pagination)

### Performance Best Practices

#### Efficient Animations

```typescript
// ✅ Good - GPU-accelerated properties
{
    keyframeEffect: {
        name: 'efficient',
        keyframes: [
            { opacity: '0', transform: 'translateY(20px)' },
            { opacity: '1', transform: 'translateY(0)' }
        ]
    }
}

// ❌ Avoid - causes reflows
{
    keyframeEffect: {
        name: 'inefficient',
        keyframes: [
            { height: '0px', marginTop: '0px' },
            { height: '200px', marginTop: '20px' }
        ]
    }
}
```

#### Limit Active Observers

```typescript
// ✅ Good - One container for all items
{
  listContainer: '.products'; // One observer
}

// ❌ Avoid - Multiple containers
{
  listContainer: '.product-1'; // Creates many observers
}
```

## Advanced Patterns

### Grid-to-List Layout Transitions

```typescript
const layoutConfig = {
  conditions: {
    'grid-view': {
      type: 'media',
      predicate: '(min-width: 768px)',
    },
    'list-view': {
      type: 'media',
      predicate: '(max-width: 767px)',
    },
  },
  interactions: [
    {
      key: 'adaptive-items',
      listContainer: '.items',
      trigger: 'viewEnter',
      conditions: ['grid-view'],
      effects: [
        {
          key: 'adaptive-items',
          listContainer: '.items',
          keyframeEffect: {
            name: 'grid-fade',
            keyframes: [
              { opacity: '0', transform: 'scale(0.9)' },
              { opacity: '1', transform: 'scale(1)' },
            ],
          },
          duration: 500,
        },
      ],
    },
    {
      key: 'adaptive-items',
      listContainer: '.items',
      trigger: 'viewEnter',
      conditions: ['list-view'],
      effects: [
        {
          key: 'adaptive-items',
          listContainer: '.items',
          keyframeEffect: {
            name: 'list-slide',
            keyframes: [
              { opacity: '0', transform: 'translateX(-20px)' },
              { opacity: '1', transform: 'translateX(0)' },
            ],
          },
          duration: 400,
        },
      ],
    },
  ],
};
```

## Real-World Examples

### E-commerce Product Grid

```typescript
const productGridConfig = {
  interactions: [
    // Entrance animation
    {
      key: 'products',
      listContainer: '.product-grid',
      trigger: 'viewEnter',
      params: { threshold: 0.1 },
      effects: [
        {
          key: 'products',
          listContainer: '.product-grid',
          keyframeEffect: {
            name: 'product-entrance',
            keyframes: [
              { opacity: '0', transform: 'translateY(40px) scale(0.95)' },
              { opacity: '1', transform: 'translateY(0) scale(1)' },
            ],
          },
          duration: 700,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
      ],
    },
    // Hover effect
    {
      key: 'products',
      listContainer: '.product-grid',
      selector: '.product-card',
      trigger: 'hover',
      effects: [
        {
          key: 'products',
          listContainer: '.product-grid',
          selector: '.product-card',
          keyframeEffect: {
            name: 'card-lift',
            keyframes: [
              { transform: 'translateY(0)', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)' },
              { transform: 'translateY(-8px)', boxShadow: '0 16px 32px rgb(0 0 0 / 0.15)' },
            ],
          },
          duration: 250,
        },
        {
          key: 'products',
          listContainer: '.product-grid',
          selector: '.product-image img',
          keyframeEffect: {
            name: 'image-zoom',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }],
          },
          duration: 300,
        },
      ],
    },
  ],
};
```

### Dynamic To-Do List

```typescript
const todoConfig = {
  interactions: [
    // New item animation
    {
      key: 'todos',
      listContainer: '.todo-list',
      trigger: 'viewEnter',
      effects: [
        {
          key: 'todos',
          listContainer: '.todo-list',
          triggerType: 'repeat',
          keyframeEffect: {
            name: 'todo-add',
            keyframes: [
              { opacity: '0', transform: 'translateX(-30px) scale(0.9)' },
              { opacity: '1', transform: 'translateX(0) scale(1)' },
            ],
          },
          duration: 400,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
      ],
    },
    // Complete animation
    {
      key: 'todos',
      listContainer: '.todo-list',
      selector: '.todo-checkbox',
      trigger: 'click',
      effects: [
        {
          key: 'todos',
          listContainer: '.todo-list',
          selector: '.todo-item',
          transition: {
            duration: 300,
            styleProperties: [
              { name: 'opacity', value: '0.5' },
              { name: 'text-decoration', value: 'line-through' },
            ],
          },
        },
      ],
    },
  ],
};
```

### Image Gallery with Lightbox

```typescript
const galleryConfig = {
  interactions: [
    // Grid entrance
    {
      key: 'gallery',
      listContainer: '.gallery-grid',
      trigger: 'viewEnter',
      params: { threshold: 0.1 },
      effects: [
        {
          key: 'gallery',
          listContainer: '.gallery-grid',
          keyframeEffect: {
            name: 'gallery-fade',
            keyframes: [
              { opacity: '0', filter: 'blur(10px)' },
              { opacity: '1', filter: 'blur(0)' },
            ],
          },
          duration: 800,
        },
      ],
    },
    // Hover overlay
    {
      key: 'gallery',
      listContainer: '.gallery-grid',
      selector: '.gallery-item',
      trigger: 'hover',
      effects: [
        {
          key: 'gallery',
          listContainer: '.gallery-grid',
          selector: '.gallery-overlay',
          keyframeEffect: {
            name: 'overlay-reveal',
            keyframes: [{ opacity: '0' }, { opacity: '1' }],
          },
          duration: 250,
        },
      ],
    },
  ],
};
```

## Next Steps

- **[Element Selection](../api/element-selection.md)** - Understand selector priority
- **[Performance Guide](./performance.md)** - Optimize animations
- **[API Reference](../api/functions.md)** - List management functions
- **[Examples](../examples/list-patterns.md)** - More list patterns
