# List Patterns

Comprehensive examples of list and grid animations using `@wix/interact`. All examples use `listContainer` for optimal performance and automatic mutation tracking.

## Table of Contents

- [Entrance Animations](#entrance-animations)
- [Staggered Effects](#staggered-effects)
- [Hover Interactions](#hover-interactions)
- [Dynamic List Management](#dynamic-list-management)
- [Infinite Scroll](#infinite-scroll)
- [Filtering & Sorting](#filtering--sorting)
- [Grid Layouts](#grid-layouts)
- [Real-World Examples](#real-world-examples)
- [Sequence-Based Staggering](#sequence-based-staggering)

## Entrance Animations

### 1. Fade In List

Simple fade entrance for list items.

```typescript
import { Interact } from '@wix/interact/web';

const config = {
  interactions: [
    {
      key: 'item-list',
      listContainer: '.items',
      trigger: 'viewEnter',
      params: { type: 'once', threshold: 0.1 },
      effects: [
        {
          key: 'item-list',
          listContainer: '.items',
          keyframeEffect: {
            name: 'fade-in',
            keyframes: [{ opacity: '0' }, { opacity: '1' }],
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
<interact-element data-interact-key="item-list">
  <ul class="items">
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
</interact-element>
```

### 2. Slide Up Cascade

Items slide up sequentially.

```typescript
const config = {
  interactions: [
    {
      key: 'features',
      listContainer: '.feature-list',
      trigger: 'viewEnter',
      params: { type: 'once', threshold: 0.2 },
      effects: [
        {
          key: 'features',
          listContainer: '.feature-list',
          keyframeEffect: {
            name: 'slide-up',
            keyframes: [
              { opacity: '0', transform: 'translateY(40px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 700,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
      ],
    },
  ],
};
```

```css
/* Add stagger via CSS */
.feature-list > *:nth-child(1) {
  animation-delay: 0ms;
}
.feature-list > *:nth-child(2) {
  animation-delay: 100ms;
}
.feature-list > *:nth-child(3) {
  animation-delay: 200ms;
}
.feature-list > *:nth-child(4) {
  animation-delay: 300ms;
}
.feature-list > *:nth-child(5) {
  animation-delay: 400ms;
}
```

### 3. Scale and Rotate

Dramatic entrance with scale and rotation.

```typescript
const config = {
  interactions: [
    {
      key: 'cards',
      listContainer: '.card-grid',
      trigger: 'viewEnter',
      params: { type: 'once', threshold: 0.15 },
      effects: [
        {
          key: 'cards',
          listContainer: '.card-grid',
          keyframeEffect: {
            name: 'scale-rotate',
            keyframes: [
              { opacity: '0', transform: 'scale(0.6) rotate(-15deg)' },
              { opacity: '1', transform: 'scale(1) rotate(0deg)' },
            ],
          },
          duration: 800,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Elastic
        },
      ],
    },
  ],
};
```

### 4. Blur to Focus

Items transition from blurred to sharp.

```typescript
const config = {
  interactions: [
    {
      key: 'photos',
      listContainer: '.photo-grid',
      trigger: 'viewEnter',
      params: { type: 'once', threshold: 0.1 },
      effects: [
        {
          key: 'photos',
          listContainer: '.photo-grid',
          keyframeEffect: {
            name: 'blur-focus',
            keyframes: [
              { opacity: '0', filter: 'blur(20px)', transform: 'scale(1.1)' },
              { opacity: '1', filter: 'blur(0)', transform: 'scale(1)' },
            ],
          },
          duration: 900,
          easing: 'ease-out',
        },
      ],
    },
  ],
};
```

### 5. Slide From Sides

Alternating slide directions for list items.

```typescript
const config = {
  interactions: [
    {
      key: 'timeline',
      listContainer: '.timeline-items',
      trigger: 'viewEnter',
      params: { type: 'once', threshold: 0.2 },
      effects: [
        {
          key: 'timeline',
          listContainer: '.timeline-items',
          keyframeEffect: {
            name: 'slide-alternate',
            keyframes: [
              { opacity: '0', transform: 'translateX(var(--slide-x, -50px))' },
              { opacity: '1', transform: 'translateX(0)' },
            ],
          },
          duration: 700,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
      ],
    },
  ],
};
```

```css
.timeline-items > *:nth-child(odd) {
  --slide-x: -50px;
}
.timeline-items > *:nth-child(even) {
  --slide-x: 50px;
}
```

## Staggered Effects

### 6. Progressive Delay

Each item has increasing delay.

```typescript
const config = {
  interactions: [
    {
      key: 'stagger-list',
      listContainer: '.items',
      trigger: 'viewEnter',
      params: { type: 'once', threshold: 0.1 },
      effects: [
        {
          key: 'stagger-list',
          listContainer: '.items',
          keyframeEffect: {
            name: 'stagger-fade',
            keyframes: [
              { opacity: '0', transform: 'translateY(20px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 500,
          easing: 'ease-out',
        },
      ],
    },
  ],
};
```

```css
/* Automatic stagger formula */
.items > * {
  animation-delay: calc(var(--item-index, 0) * 80ms);
}

/* Or use nth-child */
.items > *:nth-child(n) {
  animation-delay: calc((var(--nth) - 1) * 80ms);
}
```

```javascript
// Set index via JavaScript
document.querySelectorAll('.items > *').forEach((item, index) => {
  item.style.setProperty('--item-index', index);
});
```

### 7. Wave Effect

Items animate in a wave pattern.

```typescript
const config = {
  interactions: [
    {
      key: 'wave',
      listContainer: '.wave-list',
      trigger: 'viewEnter',
      params: { type: 'once', threshold: 0.15 },
      effects: [
        {
          key: 'wave',
          listContainer: '.wave-list',
          keyframeEffect: {
            name: 'wave',
            keyframes: [
              { transform: 'translateY(30px) scale(0.9)', opacity: '0' },
              { transform: 'translateY(0) scale(1)', opacity: '1' },
            ],
          },
          duration: 600,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
      ],
    },
  ],
};
```

```css
.wave-list > * {
  animation-delay: calc(sin(var(--item-index, 0) * 0.5) * 200ms);
}
```

### 8. Ripple Out From Center

Items animate outward from center.

```typescript
const config = {
  interactions: [
    {
      key: 'ripple',
      listContainer: '.grid',
      trigger: 'viewEnter',
      params: { type: 'once', threshold: 0.2 },
      effects: [
        {
          key: 'ripple',
          listContainer: '.grid',
          keyframeEffect: {
            name: 'ripple',
            keyframes: [
              { transform: 'scale(0)', opacity: '0' },
              { transform: 'scale(1)', opacity: '1' },
            ],
          },
          duration: 700,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
      ],
    },
  ],
};
```

```css
/* Calculate distance from center for delay */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.grid > *:nth-child(n) {
  --delay-multiplier: 50ms;
}

/* Center items animate first, outer items last */
.grid > *:nth-child(6),
.grid > *:nth-child(7),
.grid > *:nth-child(10),
.grid > *:nth-child(11) {
  animation-delay: calc(0 * var(--delay-multiplier));
}

.grid > *:nth-child(2),
.grid > *:nth-child(5),
.grid > *:nth-child(8),
.grid > *:nth-child(9),
.grid > *:nth-child(12),
.grid > *:nth-child(15) {
  animation-delay: calc(1 * var(--delay-multiplier));
}
```

## Hover Interactions

### 9. Card Lift on Hover

Cards lift with shadow on hover.

```typescript
const config = {
  interactions: [
    {
      key: 'cards',
      listContainer: '.card-list',
      trigger: 'hover',
      effects: [
        {
          key: 'cards',
          listContainer: '.card-list',
          keyframeEffect: {
            name: 'lift',
            keyframes: [
              { transform: 'translateY(0)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
              { transform: 'translateY(-8px)', boxShadow: '0 16px 32px rgba(0,0,0,0.15)' },
            ],
          },
          duration: 250,
          easing: 'ease-out',
        },
      ],
    },
  ],
};
```

### 10. Image Zoom in Grid

Zoom images on hover while keeping grid intact.

```typescript
const config = {
  interactions: [
    {
      key: 'gallery',
      listContainer: '.gallery-grid',
      selector: '.gallery-item',
      trigger: 'hover',
      effects: [
        {
          key: 'gallery',
          listContainer: '.gallery-grid',
          selector: '.gallery-item img',
          keyframeEffect: {
            name: 'zoom',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }],
          },
          duration: 300,
          easing: 'ease-out',
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="gallery">
  <div class="gallery-grid">
    <div class="gallery-item">
      <img src="photo1.jpg" />
    </div>
    <div class="gallery-item">
      <img src="photo2.jpg" />
    </div>
  </div>
</interact-element>
```

```css
.gallery-item {
  overflow: hidden; /* Contain zoomed image */
}
```

### 11. Reveal Overlay on Hover

Show overlay with content on hover.

```typescript
const config = {
  interactions: [
    {
      key: 'products',
      listContainer: '.product-grid',
      selector: '.product-card',
      trigger: 'hover',
      effects: [
        {
          key: 'products',
          listContainer: '.product-grid',
          selector: '.product-overlay',
          keyframeEffect: {
            name: 'reveal',
            keyframes: [
              { opacity: '0', transform: 'translateY(100%)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 300,
          easing: 'ease-out',
        },
      ],
    },
  ],
};
```

## Dynamic List Management

### 12. Add Item Animation

Animate new items as they're added.

```typescript
const config = {
  interactions: [
    {
      key: 'todo-list',
      listContainer: '.todos',
      trigger: 'viewEnter',
      params: { type: 'repeat' }, // Trigger for each new item
      effects: [
        {
          key: 'todo-list',
          listContainer: '.todos',
          keyframeEffect: {
            name: 'add-item',
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
  ],
};

Interact.create(config);
```

```javascript
// Add new todo item
function addTodo(text) {
  const list = document.querySelector('.todos');
  const item = document.createElement('div');
  item.className = 'todo-item';
  item.innerHTML = `
        <input type="checkbox" />
        <span>${text}</span>
        <button class="delete">Delete</button>
    `;
  list.appendChild(item); // Animation triggers automatically
}
```

### 13. Shopping Cart Updates

Animate cart items on add/update.

```typescript
const config = {
  interactions: [
    // Add animation
    {
      key: 'cart',
      listContainer: '.cart-items',
      trigger: 'viewEnter',
      params: { type: 'repeat' },
      effects: [
        {
          key: 'cart',
          listContainer: '.cart-items',
          keyframeEffect: {
            name: 'cart-add',
            keyframes: [
              {
                opacity: '0',
                transform: 'scale(0.8) translateY(-20px)',
                backgroundColor: '#10b981',
              },
              { opacity: '1', transform: 'scale(1) translateY(0)', backgroundColor: 'transparent' },
            ],
          },
          duration: 500,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
      ],
    },
  ],
};
```

## Infinite Scroll

### 14. Infinite List Animation

Animate items as they load during scroll.

```typescript
const config = {
  interactions: [
    {
      key: 'infinite',
      listContainer: '.infinite-list',
      trigger: 'viewEnter',
      params: { type: 'repeat', threshold: 0.1 },
      effects: [
        {
          key: 'infinite',
          listContainer: '.infinite-list',
          keyframeEffect: {
            name: 'scroll-fade',
            keyframes: [
              { opacity: '0', transform: 'translateY(30px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 500,
          easing: 'ease-out',
        },
      ],
    },
  ],
};

Interact.create(config);
```

```javascript
// Infinite scroll implementation
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadMoreItems();
      }
    });
  },
  { rootMargin: '200px' },
);

observer.observe(document.querySelector('.sentinel'));

async function loadMoreItems() {
  const items = await fetchItems();
  const container = document.querySelector('.infinite-list');

  items.forEach((item) => {
    const element = document.createElement('div');
    element.className = 'list-item';
    element.textContent = item.title;
    container.appendChild(element);
    // Animation triggers automatically via viewEnter repeat
  });
}
```

## Grid Layouts

### 15. Responsive Grid Transitions

Different animations for different breakpoints.

```typescript
const config = {
  conditions: {
    mobile: {
      type: 'media',
      predicate: '(max-width: 767px)',
    },
    desktop: {
      type: 'media',
      predicate: '(min-width: 768px)',
    },
  },
  interactions: [
    // Mobile: Simple fade
    {
      key: 'grid',
      listContainer: '.responsive-grid',
      trigger: 'viewEnter',
      conditions: ['mobile'],
      params: { type: 'once', threshold: 0.1 },
      effects: [
        {
          key: 'grid',
          listContainer: '.responsive-grid',
          keyframeEffect: {
            name: 'mobile-fade',
            keyframes: [{ opacity: '0' }, { opacity: '1' }],
          },
          duration: 400,
        },
      ],
    },
    // Desktop: Complex entrance
    {
      key: 'grid',
      listContainer: '.responsive-grid',
      trigger: 'viewEnter',
      conditions: ['desktop'],
      params: { type: 'once', threshold: 0.15 },
      effects: [
        {
          key: 'grid',
          listContainer: '.responsive-grid',
          keyframeEffect: {
            name: 'desktop-slide',
            keyframes: [
              { opacity: '0', transform: 'translateY(60px) scale(0.9)' },
              { opacity: '1', transform: 'translateY(0) scale(1)' },
            ],
          },
          duration: 800,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
      ],
    },
  ],
};
```

## Real-World Examples

### 16. E-commerce Product Grid

Complete product grid with multiple interactions.

```typescript
const config = {
  interactions: [
    // Entrance animation
    {
      key: 'products',
      listContainer: '.product-grid',
      trigger: 'viewEnter',
      params: { type: 'once', threshold: 0.1 },
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
        // Lift card
        {
          key: 'products',
          listContainer: '.product-grid',
          selector: '.product-card',
          keyframeEffect: {
            name: 'card-lift',
            keyframes: [
              { transform: 'translateY(0)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
              { transform: 'translateY(-8px)', boxShadow: '0 16px 32px rgba(0,0,0,0.15)' },
            ],
          },
          duration: 250,
        },
        // Zoom image
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
        // Reveal quick view
        {
          key: 'products',
          listContainer: '.product-grid',
          selector: '.quick-view',
          keyframeEffect: {
            name: 'reveal-button',
            keyframes: [
              { opacity: '0', transform: 'translateY(10px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 200,
          delay: 100,
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="products">
  <div class="product-grid">
    <div class="product-card">
      <div class="product-image">
        <img src="product1.jpg" />
      </div>
      <h3>Product Name</h3>
      <p class="price">$99.00</p>
      <button class="quick-view">Quick View</button>
    </div>
    <!-- More products... -->
  </div>
</interact-element>
```

## Sequence-Based Staggering

The `sequences` config provides built-in stagger support with easing-driven delay distribution — no CSS `animation-delay` hacks needed.

### 17. Staggered List Entrance with Sequences

```typescript
const config = {
  interactions: [
    {
      key: 'cards',
      trigger: 'viewEnter',
      listContainer: '.card-grid',
      params: { type: 'once', threshold: 0.1 },
      sequences: [
        {
          offset: 80,
          offsetEasing: 'quadIn',
          effects: [
            {
              key: 'cards',
              listContainer: '.card-grid',
              effectId: 'card-entrance',
            },
          ],
        },
      ],
    },
  ],
  effects: {
    'card-entrance': {
      duration: 600,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      keyframeEffect: {
        name: 'card-entrance',
        keyframes: [
          { opacity: '0', transform: 'translateY(40px) scale(0.95)' },
          { opacity: '1', transform: 'translateY(0) scale(1)' },
        ],
      },
    },
  },
};

Interact.create(config);
```

### 18. Dynamic List Items with Sequences

New items added to the DOM automatically join the Sequence with recalculated stagger offsets:

```typescript
const config = {
  interactions: [
    {
      key: 'feed',
      trigger: 'viewEnter',
      listContainer: '.feed-items',
      params: { type: 'repeat' },
      sequences: [
        {
          offset: 60,
          offsetEasing: 'sineOut',
          effects: [
            {
              key: 'feed',
              listContainer: '.feed-items',
              keyframeEffect: {
                name: 'feed-entrance',
                keyframes: [
                  { opacity: '0', transform: 'translateY(20px)' },
                  { opacity: '1', transform: 'translateY(0)' },
                ],
              },
              duration: 400,
              easing: 'ease-out',
            },
          ],
        },
      ],
    },
  ],
  effects: {},
};

Interact.create(config);
```

### 19. Easing Comparison for List Stagger

Different `offsetEasing` values produce distinct stagger patterns:

```typescript
// Linear: even spacing (0, 80, 160, 240, 320ms)
{ offset: 80, offsetEasing: 'linear' }

// quadIn: slow start then rapid (0, 20, 80, 180, 320ms)
{ offset: 80, offsetEasing: 'quadIn' }

// sineOut: fast start then gradual (0, 125, 227, 302, 320ms)
{ offset: 80, offsetEasing: 'sineOut' }
```

### 20. Reusable Sequences with `sequenceId`

Define a sequence once, reference it from multiple interactions:

```typescript
const config = {
  sequences: {
    'list-stagger': {
      offset: 100,
      offsetEasing: 'quadIn',
      effects: [{ effectId: 'fade-up' }],
    },
  },
  interactions: [
    {
      key: 'section-a',
      trigger: 'viewEnter',
      listContainer: '.list-a',
      sequences: [{ sequenceId: 'list-stagger' }],
    },
    {
      key: 'section-b',
      trigger: 'viewEnter',
      listContainer: '.list-b',
      sequences: [{ sequenceId: 'list-stagger', offset: 150 }], // Override offset
    },
  ],
  effects: {
    'fade-up': {
      duration: 500,
      easing: 'ease-out',
      keyframeEffect: {
        name: 'fade-up',
        keyframes: [
          { opacity: '0', transform: 'translateY(20px)' },
          { opacity: '1', transform: 'translateY(0)' },
        ],
      },
    },
  },
};
```

## See Also

- [Sequences & Staggering Guide](../guides/sequences.md)
- [Lists and Dynamic Content Guide](../guides/lists-and-dynamic-content.md)
- [Element Selection](../api/element-selection.md)
- [Performance Guide](../guides/performance.md)
