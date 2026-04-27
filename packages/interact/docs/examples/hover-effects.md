# Hover Effects

Hover effects provide visual feedback when users move their mouse over elements. This guide covers patterns using the `hover` trigger.

## Table of Contents

- [Card Hover Effects](#card-hover-effects)
- [Button Hover States](#button-hover-states)
- [Image Overlays](#image-overlays)
- [Navigation Hovers](#navigation-hovers)
- [Text Effects](#text-effects)
- [Micro-Interactions](#micro-interactions)
- [Real-World Examples](#real-world-examples)

## Card Hover Effects

### Elevation on Hover

Card lifts with shadow when hovered.

```typescript
import { Interact } from '@wix/interact/web';

const config = {
  interactions: [
    {
      key: 'card',
      trigger: 'hover',
      effects: [
        {
          key: 'card',
          keyframeEffect: {
            name: 'card-lift',
            keyframes: [
              {
                transform: 'translateY(0)',
                boxShadow: '0 2px 8px rgb(0 0 0 / 0.1)',
              },
              {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 32px rgb(0 0 0 / 0.15)',
              },
            ],
          },
          duration: 250,
          easing: 'ease-out',
        },
      ],
    },
  ],
};

Interact.create(config);
```

```html
<interact-element data-interact-key="card">
  <div class="card">
    <h3>Card Title</h3>
    <p>Card content</p>
  </div>
</interact-element>
```

### Scale and Glow

Card scales slightly and glows on hover.

```typescript
{
    key: 'glow-card',
    trigger: 'hover',
    effects: [{
        key: 'glow-card',
        keyframeEffect: {
            name: 'scale-glow',
            keyframes: [
                {
                    transform: 'scale(1)',
                    boxShadow: '0 0 0 rgba(59, 130, 246, 0)'
                },
                {
                    transform: 'scale(1.02)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
                }
            ]
        },
        duration: 300,
        easing: 'ease-out'
    }]
}
```

### Border Pulse

Animated border on hover.

```typescript
{
    key: 'border-card',
    trigger: 'hover',
    effects: [{
        key: 'border-card',
        keyframeEffect: {
            name: 'border-pulse',
            keyframes: [
                { borderColor: '#e5e7eb', borderWidth: '1px' },
                { borderColor: '#3b82f6', borderWidth: '2px' }
            ]
        },
        duration: 200,
        easing: 'ease-out'
    }]
}
```

### Tilt Effect

3D tilt perspective on hover.

```typescript
{
    key: 'tilt-card',
    trigger: 'hover',
    effects: [{
        key: 'tilt-card',
        keyframeEffect: {
            name: 'tilt-3d',
            keyframes: [
                { transform: 'perspective(1000px) rotateY(0deg)' },
                { transform: 'perspective(1000px) rotateY(3deg)' }
            ]
        },
        duration: 300,
        easing: 'ease-out'
    }]
}
```

```css
.tilt-card {
  transform-style: preserve-3d;
}
```

## Button Hover States

### Scale Up Button

Button grows slightly on hover.

```typescript
{
    key: 'scale-button',
    trigger: 'hover',
    effects: [{
        key: 'scale-button',
        keyframeEffect: {
            name: 'button-grow',
            keyframes: [
                { transform: 'scale(1)' },
                { transform: 'scale(1.05)' }
            ]
        },
        duration: 200,
        easing: 'ease-out'
    }]
}
```

### Color Transition

Button color smoothly transitions.

```typescript
{
    key: 'color-button',
    trigger: 'hover',
    effects: [{
        key: 'color-button',
        transition: {
            duration: 300,
            easing: 'ease-out',
            styleProperties: [
                { name: 'backgroundColor', value: '#2563eb' },
                { name: 'color', value: '#ffffff' }
            ]
        }
    }]
}
```

### Shine Effect

Light shines across button on hover.

```typescript
{
    key: 'shine-button',
    trigger: 'hover',
    effects: [{
        key: 'shine-button',
        selector: '.shine-overlay',
        keyframeEffect: {
            name: 'shine',
            keyframes: [
                { transform: 'translateX(-100%) skewX(-15deg)' },
                { transform: 'translateX(100%) skewX(-15deg)' }
            ]
        },
        duration: 600,
        easing: 'ease-out'
    }]
}
```

```html
<interact-element data-interact-key="shine-button">
  <button class="shine-btn">
    <span>Hover Me</span>
    <div class="shine-overlay"></div>
  </button>
</interact-element>
```

```css
.shine-btn {
  position: relative;
  overflow: hidden;
}

.shine-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 30%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  pointer-events: none;
}
```

### Arrow Slide

Arrow icon slides on hover.

```typescript
{
    key: 'arrow-button',
    trigger: 'hover',
    effects: [{
        key: 'arrow-button',
        selector: '.arrow-icon',
        keyframeEffect: {
            name: 'arrow-move',
            keyframes: [
                { transform: 'translateX(0)' },
                { transform: 'translateX(5px)' }
            ]
        },
        duration: 200,
        easing: 'ease-out'
    }]
}
```

## Image Overlays

### Zoom Image

Image zooms while overlay appears.

```typescript
{
    key: 'image-zoom',
    selector: '.image-container',
    trigger: 'hover',
    effects: [
        // Zoom image
        {
            key: 'image-zoom',
            selector: 'img',
            keyframeEffect: {
                name: 'zoom',
                keyframes: [
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.1)' }
                ]
            },
            duration: 300,
            easing: 'ease-out'
        },
        // Show overlay
        {
            key: 'image-zoom',
            selector: '.overlay',
            keyframeEffect: {
                name: 'overlay-fade',
                keyframes: [
                    { opacity: '0' },
                    { opacity: '1' }
                ]
            },
            duration: 250,
            easing: 'ease-out'
        }
    ]
}
```

```html
<interact-element data-interact-key="image-zoom">
  <div class="image-container">
    <img src="photo.jpg" alt="Photo" />
    <div class="overlay">
      <h3>View Details</h3>
    </div>
  </div>
</interact-element>
```

```css
.image-container {
  position: relative;
  overflow: hidden;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
```

### Slide In Overlay

Overlay slides from bottom on hover.

```typescript
{
    key: 'slide-overlay',
    selector: '.gallery-item',
    trigger: 'hover',
    effects: [{
        key: 'slide-overlay',
        selector: '.info-overlay',
        keyframeEffect: {
            name: 'slide-up',
            keyframes: [
                { transform: 'translateY(100%)', opacity: '0' },
                { transform: 'translateY(0)', opacity: '1' }
            ]
        },
        duration: 300,
        easing: 'ease-out'
    }]
}
```

### Blur Background

Background blurs on hover.

```typescript
{
    key: 'blur-hover',
    selector: '.image-wrapper',
    trigger: 'hover',
    effects: [{
        key: 'blur-hover',
        selector: 'img',
        keyframeEffect: {
            name: 'blur',
            keyframes: [
                { filter: 'blur(0)' },
                { filter: 'blur(4px)' }
            ]
        },
        duration: 300,
        easing: 'ease-out'
    }]
}
```

### Grayscale to Color

Image transitions from grayscale to color.

```typescript
{
    key: 'color-hover',
    trigger: 'hover',
    effects: [{
        key: 'color-hover',
        selector: 'img',
        keyframeEffect: {
            name: 'color-reveal',
            keyframes: [
                { filter: 'grayscale(100%)' },
                { filter: 'grayscale(0%)' }
            ]
        },
        duration: 400,
        easing: 'ease-out'
    }]
}
```

## Navigation Hovers

### Underline Animation

Underline slides in on hover.

```typescript
{
    key: 'nav-link',
    trigger: 'hover',
    effects: [{
        key: 'nav-link',
        selector: '.underline',
        keyframeEffect: {
            name: 'underline-expand',
            keyframes: [
                { width: '0%' },
                { width: '100%' }
            ]
        },
        duration: 300,
        easing: 'ease-out'
    }]
}
```

```html
<interact-element data-interact-key="nav-link">
  <a class="nav-item">
    <span>About</span>
    <span class="underline"></span>
  </a>
</interact-element>
```

```css
.nav-item {
  position: relative;
  display: inline-block;
}

.underline {
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 2px;
  background: currentColor;
}
```

### Highlight Background

Background color slides behind text.

```typescript
{
    key: 'highlight-link',
    trigger: 'hover',
    effects: [{
        key: 'highlight-link',
        selector: '.highlight-bg',
        keyframeEffect: {
            name: 'highlight-slide',
            keyframes: [
                { transform: 'scaleX(0)', transformOrigin: 'left' },
                { transform: 'scaleX(1)', transformOrigin: 'left' }
            ]
        },
        duration: 300,
        easing: 'ease-out'
    }]
}
```

### Icon Bounce

Icon bounces on nav hover.

```typescript
{
    key: 'icon-nav',
    trigger: 'hover',
    effects: [{
        key: 'icon-nav',
        selector: '.nav-icon',
        keyframeEffect: {
            name: 'icon-bounce',
            keyframes: [
                { transform: 'translateY(0)' },
                { transform: 'translateY(-3px)' },
                { transform: 'translateY(0)' }
            ]
        },
        duration: 300,
        easing: 'ease-out'
    }]
}
```

### Dropdown Fade

Dropdown menu fades in on hover.

```typescript
{
    key: 'dropdown-trigger',
    trigger: 'hover',
    effects: [{
        key: 'dropdown-trigger',
        selector: '.dropdown-menu',
        keyframeEffect: {
            name: 'dropdown-reveal',
            keyframes: [
                { opacity: '0', transform: 'translateY(-10px)' },
                { opacity: '1', transform: 'translateY(0)' }
            ]
        },
        duration: 200,
        easing: 'ease-out'
    }]
}
```

## Text Effects

### Color Change

Text color transitions on hover.

```typescript
{
    key: 'text-hover',
    trigger: 'hover',
    effects: [{
        key: 'text-hover',
        transition: {
            duration: 200,
            easing: 'ease-out',
            styleProperties: [
                { name: 'color', value: '#3b82f6' }
            ]
        }
    }]
}
```

### Letter Spacing

Text expands with letter spacing.

```typescript
{
    key: 'expand-text',
    trigger: 'hover',
    effects: [{
        key: 'expand-text',
        keyframeEffect: {
            name: 'letter-expand',
            keyframes: [
                { letterSpacing: '0' },
                { letterSpacing: '2px' }
            ]
        },
        duration: 300,
        easing: 'ease-out'
    }]
}
```

### Gradient Wipe

Text color gradient wipes on hover.

```typescript
{
    key: 'gradient-text',
    trigger: 'hover',
    effects: [{
        key: 'gradient-text',
        keyframeEffect: {
            name: 'gradient-wipe',
            keyframes: [
                { backgroundPosition: '0% 50%' },
                { backgroundPosition: '100% 50%' }
            ]
        },
        duration: 400,
        easing: 'ease-out'
    }]
}
```

```css
.gradient-text {
  background: linear-gradient(90deg, #333 0%, #3b82f6 50%, #333 100%);
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Micro-Interactions

### Checkbox Highlight

Checkbox border glows on hover.

```typescript
{
    key: 'checkbox-hover',
    trigger: 'hover',
    effects: [{
        key: 'checkbox-hover',
        selector: '.checkbox-box',
        keyframeEffect: {
            name: 'checkbox-glow',
            keyframes: [
                { borderColor: '#d1d5db', boxShadow: 'none' },
                { borderColor: '#3b82f6', boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)' }
            ]
        },
        duration: 200,
        easing: 'ease-out'
    }]
}
```

### Input Focus Effect

Input expands slightly on hover.

```typescript
{
    key: 'input-hover',
    trigger: 'hover',
    effects: [{
        key: 'input-hover',
        keyframeEffect: {
            name: 'input-expand',
            keyframes: [
                { transform: 'scaleX(1)', borderColor: '#e5e7eb' },
                { transform: 'scaleX(1.02)', borderColor: '#3b82f6' }
            ]
        },
        duration: 200,
        easing: 'ease-out'
    }]
}
```

### Tooltip Appear

Tooltip fades in above element.

```typescript
{
    key: 'tooltip-trigger',
    trigger: 'hover',
    effects: [{
        key: 'tooltip-trigger',
        selector: '.tooltip',
        keyframeEffect: {
            name: 'tooltip-show',
            keyframes: [
                { opacity: '0', transform: 'translateY(5px)' },
                { opacity: '1', transform: 'translateY(0)' }
            ]
        },
        duration: 200,
        easing: 'ease-out'
    }]
}
```

## Real-World Examples

### Product Card

Complete product card with multiple hover effects.

```typescript
const productCard = {
  interactions: [
    {
      key: 'product',
      selector: '.product-card',
      trigger: 'hover',
      effects: [
        // Lift card
        {
          key: 'product',
          selector: '.product-card',
          keyframeEffect: {
            name: 'card-lift',
            keyframes: [
              {
                transform: 'translateY(0)',
                boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
              },
              {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 32px rgb(0 0 0 / 0.15)',
              },
            ],
          },
          duration: 250,
          easing: 'ease-out',
        },
        // Zoom image
        {
          key: 'product',
          selector: '.product-image img',
          keyframeEffect: {
            name: 'image-zoom',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }],
          },
          duration: 300,
          easing: 'ease-out',
        },
        // Show quick view button
        {
          key: 'product',
          selector: '.quick-view-btn',
          keyframeEffect: {
            name: 'button-reveal',
            keyframes: [
              { opacity: '0', transform: 'translateY(10px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 200,
          delay: 100,
          easing: 'ease-out',
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="product">
  <div class="product-card">
    <div class="product-image">
      <img src="product.jpg" alt="Product" />
      <button class="quick-view-btn">Quick View</button>
    </div>
    <h3>Product Name</h3>
    <p class="price">$99.00</p>
  </div>
</interact-element>
```

### Social Media Link

Social icon with color and scale effect.

```typescript
const socialLink = {
  interactions: [
    {
      key: 'social-icon',
      trigger: 'hover',
      effects: [
        // Scale icon
        {
          key: 'social-icon',
          keyframeEffect: {
            name: 'icon-grow',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }],
          },
          duration: 200,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        // Change color
        {
          key: 'social-icon',
          transition: {
            duration: 200,
            styleProperties: [
              { name: 'color', value: '#1DA1F2' }, // Twitter blue
            ],
          },
        },
      ],
    },
  ],
};
```

### Feature Block

Feature section with icon and text effects.

```typescript
const featureBlock = {
  interactions: [
    {
      key: 'feature',
      selector: '.feature-block',
      trigger: 'hover',
      effects: [
        // Icon bounce
        {
          key: 'feature',
          selector: '.feature-icon',
          keyframeEffect: {
            name: 'icon-bounce',
            keyframes: [
              { transform: 'translateY(0)' },
              { transform: 'translateY(-8px)' },
              { transform: 'translateY(0)' },
            ],
          },
          duration: 400,
          easing: 'ease-out',
        },
        // Text color change
        {
          key: 'feature',
          selector: '.feature-title',
          transition: {
            duration: 200,
            styleProperties: [{ name: 'color', value: '#3b82f6' }],
          },
        },
        // Border highlight
        {
          key: 'feature',
          selector: '.feature-block',
          keyframeEffect: {
            name: 'border-glow',
            keyframes: [{ borderColor: '#e5e7eb' }, { borderColor: '#3b82f6' }],
          },
          duration: 200,
          easing: 'ease-out',
        },
      ],
    },
  ],
};
```

## Best Practices

### Timing Guidelines

- **Micro-interactions**: 150-250ms (buttons, links)
- **Card lifts**: 200-300ms
- **Image effects**: 300-400ms
- **Complex transitions**: 400-500ms

### Hover States on Touch Devices

```typescript
// Only apply hover on devices with hover capability
const config = {
  conditions: {
    'has-hover': {
      type: 'media',
      predicate: '(hover: hover) and (pointer: fine)',
    },
  },
  interactions: [
    {
      key: 'hover-element',
      trigger: 'hover',
      conditions: ['has-hover'], // Only on mouse devices
      effects: [
        /* ... */
      ],
    },
  ],
};
```

### Accessibility

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

```typescript
// Configuration with reduced motion support
const config = {
  conditions: {
    'motion-ok': {
      type: 'media',
      predicate: '(prefers-reduced-motion: no-preference)',
    },
  },
  interactions: [
    {
      key: 'animated-hover',
      trigger: 'hover',
      conditions: ['motion-ok'],
      effects: [
        /* complex animations */
      ],
    },
  ],
};
```

## See Also

- [Click Interactions](./click-interactions.md) - Click-based feedback
- [Entrance Animations](./entrance-animations.md) - Viewport-triggered effects
- [Understanding Triggers](../guides/understanding-triggers.md) - Hover trigger details
- [Performance Guide](../guides/performance.md) - Optimization techniques
