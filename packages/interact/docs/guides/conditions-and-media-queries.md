# Conditions and Media Queries

Conditions allow you to create responsive interactions that adapt to different screen sizes, user preferences, and environmental factors. This guide explains how to build adaptive interactions using media queries and selector conditions.

## Overview of Conditions

Conditions in `@wix/interact` act as filters that determine when interactions should be active. They enable you to:

- **Create responsive animations** that work across devices
- **Respect user preferences** like reduced motion
- **Scope effects to a theme or state** with selector conditions
- **Build progressive enhancement** for different capabilities

## Types of Conditions

### Media Conditions

Use CSS media queries to target device characteristics:

```typescript
{
    conditions: {
        'desktop-only': {
            type: 'media',
            predicate: '(min-width: 768px)'
        },
        'mobile-only': {
            type: 'media',
            predicate: '(max-width: 767px)'
        },
        'prefers-motion': {
            type: 'media',
            predicate: '(prefers-reduced-motion: no-preference)'
        }
    }
}
```

### Selector Conditions

Use a selector to gate an effect on an ancestor or a state class. `&` stands for the element the
effect applies to; without it the predicate is appended to the element's own selector:

```typescript
{
    conditions: {
        'dark-theme': {
            type: 'selector',
            predicate: '.theme-dark &'
        },
        'is-featured': {
            type: 'selector',
            predicate: '.featured'
        }
    }
}
```

## Cascading of effects

Interact allows you to apply multiple effects on the same target and have them cascade, just like they do in CSS.
This allows you to have different variations of effects for different `media`/`selector` `conditions` and have only one of them apply, based on the current environment of the user.

**Important**: In order to use this cascading behavior, `conditions` need to be set on the Effect-level, and not on the Interaction-level.

The cascading logic works as follows:

1. Effects that are grouped in the same `effects` array under the same interaction
2. Effects that share the same `key`
3. Last effect in the `effects` array wins - just like in CSS

### Example

Here is a mobile-first example for a slide effect of a card:

```typescript
const responsiveConfig: InteractConfig = {
  conditions: {
    desktop: {
      type: 'media',
      predicate: '(min-width: 1024px)',
    },
    tablet: {
      type: 'media',
      predicate: '(min-width: 768px) and (max-width: 1023px)',
    },
    mobile: {
      type: 'media',
      predicate: '(max-width: 767px)',
    },
  },
  effects: {
    'light-slide': {
      keyframeEffect: {
        name: 'light-slide',
        keyframes: [{ transform: 'translateY(-100px)' }, { transform: 'translateY(0)' }],
      },
      duration: 400,
      easing: 'ease-out',
    },
    'medium-slide': {
      keyframeEffect: {
        name: 'medium-slide',
        keyframes: [{ transform: 'translateY(-50%)' }, { transform: 'translateY(0)' }],
      },
      duration: 400,
      easing: 'ease-in-out',
    },
    'hard-slide': {
      keyframeEffect: {
        name: 'hard-slide',
        keyframes: [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }],
      },
      duration: 600,
      easing: 'backOut',
    },
  },
  interactions: [
    {
      key: '.product-card',
      trigger: 'viewEnter',
      effects: [
        {
          conditions: ['desktop'],
          effectId: 'light-slide',
        },
        {
          conditions: ['tablet'],
          effectId: 'medium-slide',
        },
        {
          conditions: ['mobile'],
          effectId: 'hard-slide',
        },
      ],
    },
  ],
};
```

## Responsive Interaction Patterns

### Desktop vs Mobile Interactions

```typescript
const responsiveConfig: InteractConfig = {
  conditions: {
    desktop: {
      type: 'media',
      predicate: '(min-width: 1024px)',
    },
    tablet: {
      type: 'media',
      predicate: '(min-width: 768px) and (max-width: 1023px)',
    },
    mobile: {
      type: 'media',
      predicate: '(max-width: 767px)',
    },
  },

  interactions: [
    // Desktop: Hover effects
    {
      key: 'product-card',
      trigger: 'hover',
      conditions: ['desktop'],
      effects: [
        {
          key: 'product-card',
          keyframeEffect: {
            name: 'product-card-kf-desktop',
            keyframes: [
              { transform: 'translateY(0)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
              { transform: 'translateY(-8px)', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' },
            ],
          },
          duration: 200,
          easing: 'ease-out',
        },
      ],
    },

    // Mobile: Touch feedback
    {
      key: 'product-card',
      trigger: 'click',
      conditions: ['mobile'],
      effects: [
        {
          key: 'product-card',
          keyframeEffect: {
            name: 'product-card-kf-mobile',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(0.98)' },
              { transform: 'scale(1)' },
            ],
          },
          duration: 150,
          easing: 'ease-in-out',
        },
      ],
    },
  ],
};
```

### Accessibility-Aware Animations

```typescript
const accessibleConfig: InteractConfig = {
  conditions: {
    'motion-ok': {
      type: 'media',
      predicate: '(prefers-reduced-motion: no-preference)',
    },
    'motion-reduced': {
      type: 'media',
      predicate: '(prefers-reduced-motion: reduce)',
    },
    'high-contrast': {
      type: 'media',
      predicate: '(prefers-contrast: high)',
    },
  },

  interactions: [
    // Full animation for users who prefer motion
    {
      key: 'hero-title',
      trigger: 'viewEnter',
      conditions: ['motion-ok'],
      params: { threshold: 0.3 },
      effects: [
        {
          key: 'hero-title',
          keyframeEffect: {
            name: 'fade-move',
            keyframes: [
              { opacity: '0', transform: 'translateY(50px) rotate(-2deg)' },
              { opacity: '1', transform: 'translateY(0) rotate(0deg)' },
            ],
          },
          duration: 800,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
      ],
    },

    // Subtle animation for reduced motion users
    {
      key: 'hero-title',
      trigger: 'viewEnter',
      conditions: ['motion-reduced'],
      params: { threshold: 0.3 },
      effects: [
        {
          key: 'hero-title',
          keyframeEffect: {
            name: 'fade',
            keyframes: [{ opacity: '0' }, { opacity: '1' }],
          },
          duration: 300,
          easing: 'ease-out',
        },
      ],
    },
  ],
};
```

## Device-Specific Patterns

### Touch vs Mouse Devices

```typescript
const deviceConfig: InteractConfig = {
  conditions: {
    'touch-device': {
      type: 'media',
      predicate: '(hover: none) and (pointer: coarse)',
    },
    'mouse-device': {
      type: 'media',
      predicate: '(hover: hover) and (pointer: fine)',
    },
    'stylus-device': {
      type: 'media',
      predicate: '(hover: hover) and (pointer: coarse)',
    },
  },

  interactions: [
    // Mouse: Hover interactions
    {
      key: 'interactive-button',
      trigger: 'hover',
      conditions: ['mouse-device'],
      effects: [
        {
          key: 'interactive-button',
          namedEffect: {
            type: 'Scale',
          },
          duration: 200,
        },
      ],
    },

    // Touch: Press feedback
    {
      key: 'interactive-button',
      trigger: 'click',
      conditions: ['touch-device'],
      effects: [
        {
          key: 'interactive-button',
          keyframeEffect: {
            name: 'touch-feedback',
            keyframes: [
              { transform: 'scale(1)', opacity: '1' },
              { transform: 'scale(0.95)', opacity: '0.8' },
            ],
          },
          duration: 100,
        },
      ],
    },
  ],
};
```

### Screen Size Breakpoints

```typescript
const breakpointConfig: InteractConfig = {
  conditions: {
    xs: {
      type: 'media',
      predicate: '(max-width: 475px)',
    },
    sm: {
      type: 'media',
      predicate: '(min-width: 476px) and (max-width: 640px)',
    },
    md: {
      type: 'media',
      predicate: '(min-width: 641px) and (max-width: 768px)',
    },
    lg: {
      type: 'media',
      predicate: '(min-width: 769px) and (max-width: 1024px)',
    },
    xl: {
      type: 'media',
      predicate: '(min-width: 1025px)',
    },
  },

  interactions: [
    // Extra small: Minimal animations
    {
      key: 'card',
      trigger: 'viewEnter',
      conditions: ['xs'],
      effects: [
        {
          key: 'card',
          namedEffect: 'FadeIn',
          duration: 400,
        },
      ],
    },

    // Large screens: Full animations
    {
      key: 'card',
      trigger: 'viewEnter',
      conditions: ['lg', 'xl'],
      effects: [
        {
          key: 'card',
          keyframeEffect: {
            name: 'fade-move',
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

## Layout Patterns

### Responsive Cards

```typescript
const cardConfig: InteractConfig = {
  conditions: {
    'card-large': {
      type: 'media',
      predicate: '(min-width: 900px)',
    },
    'card-small': {
      type: 'media',
      predicate: '(max-width: 899px)',
    },
    'card-tall': {
      type: 'media',
      predicate: '(min-height: 800px)',
    },
  },

  interactions: [
    // Large cards: Complex hover effect
    {
      key: 'adaptive-card',
      trigger: 'hover',
      conditions: ['card-large'],
      effects: [
        {
          key: 'card-image',
          keyframeEffect: {
            name: 'large-image-kf',
            keyframes: [
              { transform: 'scale(1)', filter: 'brightness(1)' },
              { transform: 'scale(1.1)', filter: 'brightness(1.1)' },
            ],
          },
          duration: 300,
        },
        {
          key: 'card-overlay',
          keyframeEffect: {
            name: 'large-overlay-kf',
            keyframes: [
              { opacity: '0', transform: 'translateY(100%)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 250,
          delay: 50,
        },
      ],
    },

    // Small cards: Simple effect
    {
      key: 'adaptive-card',
      trigger: 'hover',
      conditions: ['card-small'],
      effects: [
        {
          key: 'adaptive-card',
          keyframeEffect: {
            name: 'small-kf',
            keyframes: [
              { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
              { boxShadow: '0 8px 16px rgba(0,0,0,0.15)' },
            ],
          },
          duration: 200,
        },
      ],
    },
  ],
};
```

### Layout-Aware Animations

```typescript
const layoutConfig: InteractConfig = {
  conditions: {
    'sidebar-layout': {
      type: 'media',
      predicate: '(min-width: 1200px)',
    },
    'stack-layout': {
      type: 'media',
      predicate: '(max-width: 1199px)',
    },
  },

  interactions: [
    // Sidebar layout: Slide from side
    {
      key: 'content-panel',
      trigger: 'viewEnter',
      conditions: ['sidebar-layout'],
      effects: [
        {
          key: 'content-panel',
          keyframeEffect: {
            name: 'slide-from-left',
            keyframes: [
              { transform: 'translateX(-50px)', opacity: '0' },
              { transform: 'translateX(0)', opacity: '1' },
            ],
          },
          duration: 600,
        },
      ],
    },

    // Stack layout: Slide from bottom
    {
      key: 'content-panel',
      trigger: 'viewEnter',
      conditions: ['stack-layout'],
      effects: [
        {
          key: 'content-panel',
          keyframeEffect: {
            name: 'slide-from-bottom',
            keyframes: [
              { transform: 'translateY(30px)', opacity: '0' },
              { transform: 'translateY(0)', opacity: '1' },
            ],
          },
          duration: 600,
        },
      ],
    },
  ],
};
```

## Advanced Condition Patterns

### Combining Multiple Conditions

```typescript
const complexConfig: InteractConfig = {
  conditions: {
    desktop: {
      type: 'media',
      predicate: '(min-width: 1024px)',
    },
    'motion-ok': {
      type: 'media',
      predicate: '(prefers-reduced-motion: no-preference)',
    },
    'high-res': {
      type: 'media',
      predicate: '(min-resolution: 144dpi)',
    },
    'wide-viewport': {
      type: 'media',
      predicate: '(min-width: 600px)',
    },
  },

  interactions: [
    // Complex animation: desktop + motion ok + wide viewport
    {
      key: 'hero-animation',
      trigger: 'viewEnter',
      conditions: ['desktop', 'motion-ok', 'wide-viewport'],
      effects: [
        {
          key: 'hero-background',
          keyframeEffect: {
            name: 'focus-background',
            keyframes: [
              { transform: 'scale(1.1)', filter: 'blur(2px)' },
              { transform: 'scale(1)', filter: 'blur(0)' },
            ],
          },
          duration: 1200,
          easing: 'ease-out',
        },
        {
          key: 'hero-content',
          keyframeEffect: {
            name: 'slide-content',
            keyframes: [
              { opacity: '0', transform: 'translateY(80px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 800,
          delay: 400,
        },
      ],
    },
  ],
};
```

### Orientation-Based Interactions

```typescript
const orientationConfig: InteractConfig = {
  conditions: {
    portrait: {
      type: 'media',
      predicate: '(orientation: portrait)',
    },
    landscape: {
      type: 'media',
      predicate: '(orientation: landscape)',
    },
    'mobile-portrait': {
      type: 'media',
      predicate: '(max-width: 767px) and (orientation: portrait)',
    },
  },

  interactions: [
    // Portrait: Vertical animations
    {
      key: 'gallery-item',
      trigger: 'viewEnter',
      conditions: ['portrait'],
      effects: [
        {
          key: 'gallery-item',
          keyframeEffect: {
            name: 'vertical-move',
            keyframes: [{ transform: 'translateY(50px)' }, { transform: 'translateY(0)' }],
          },
          duration: 500,
        },
      ],
    },

    // Landscape: Horizontal animations
    {
      key: 'gallery-item',
      trigger: 'viewEnter',
      conditions: ['landscape'],
      effects: [
        {
          key: 'gallery-item',
          keyframeEffect: {
            name: 'horizontal-move',
            keyframes: [{ transform: 'translateX(-50px)' }, { transform: 'translateX(0)' }],
          },
          duration: 500,
        },
      ],
    },
  ],
};
```

## Environment-Based Conditions

### Dark Mode Support

```typescript
const themeConfig: InteractConfig = {
  conditions: {
    'dark-mode': {
      type: 'media',
      predicate: '(prefers-color-scheme: dark)',
    },
    'light-mode': {
      type: 'media',
      predicate: '(prefers-color-scheme: light)',
    },
  },

  interactions: [
    // Dark mode: Subtle glow effects
    {
      key: 'interactive-element',
      trigger: 'hover',
      conditions: ['dark-mode'],
      effects: [
        {
          key: 'interactive-element',
          keyframeEffect: {
            name: 'glow',
            keyframes: [
              { boxShadow: 'none', borderColor: 'transparent' },
              { boxShadow: '0 0 20px rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' },
            ],
          },
          duration: 300,
        },
      ],
    },

    // Light mode: Shadow effects
    {
      key: 'interactive-element',
      trigger: 'hover',
      conditions: ['light-mode'],
      effects: [
        {
          key: 'interactive-element',
          keyframeEffect: {
            name: 'shadow',
            keyframes: [
              { boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transform: 'translateY(0)' },
              { boxShadow: '0 8px 16px rgba(0,0,0,0.15)', transform: 'translateY(-2px)' },
            ],
          },
          duration: 300,
        },
      ],
    },
  ],
};
```

### Performance-Based Conditions

```typescript
const performanceConfig: InteractConfig = {
  conditions: {
    'high-performance': {
      type: 'media',
      predicate: '(prefers-reduced-motion: no-preference) and (min-resolution: 96dpi)',
    },
    'low-performance': {
      type: 'media',
      predicate: '(prefers-reduced-motion: reduce) or (max-resolution: 95dpi)',
    },
  },

  interactions: [
    // High performance: Rich animations
    {
      key: 'feature-card',
      trigger: 'viewEnter',
      conditions: ['high-performance'],
      effects: [
        {
          key: 'feature-icon',
          keyframeEffect: {
            name: 'twist',
            keyframes: [
              { transform: 'scale(0.5) rotate(-180deg)', filter: 'blur(10px)' },
              { transform: 'scale(1) rotate(0deg)', filter: 'blur(0)' },
            ],
          },
          duration: 800,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
      ],
    },

    // Low performance: Simple fade
    {
      key: 'feature-card',
      trigger: 'viewEnter',
      conditions: ['low-performance'],
      effects: [
        {
          key: 'feature-card',
          namedEffect: {
            type: 'FadeIn',
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
const productGridConfig: InteractConfig = {
  conditions: {
    desktop: {
      type: 'media',
      predicate: '(min-width: 1024px)',
    },
    tablet: {
      type: 'media',
      predicate: '(min-width: 768px) and (max-width: 1023px)',
    },
    mobile: {
      type: 'media',
      predicate: '(max-width: 767px)',
    },
    'roomy-grid': {
      type: 'media',
      predicate: '(min-width: 1280px)',
    },
    'motion-ok': {
      type: 'media',
      predicate: '(prefers-reduced-motion: no-preference)',
    },
  },

  interactions: [
    // Desktop: Full hover experience
    {
      key: 'product-card',
      trigger: 'hover',
      conditions: ['desktop', 'roomy-grid', 'motion-ok'],
      effects: [
        {
          key: 'product-image',
          keyframeEffect: {
            name: 'scale-light',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }],
          },
          duration: 300,
        },
        {
          key: 'product-overlay',
          keyframeEffect: {
            name: 'slide-from-bottom',
            keyframes: [
              { opacity: '0', transform: 'translateY(100%)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 250,
          delay: 50,
        },
        {
          key: 'quick-view-button',
          keyframeEffect: {
            name: 'scale-medium',
            keyframes: [
              { opacity: '0', transform: 'scale(0.8)' },
              { opacity: '1', transform: 'scale(1)' },
            ],
          },
          duration: 200,
          delay: 150,
        },
      ],
    },

    // Mobile: Touch feedback only
    {
      key: 'product-card',
      trigger: 'click',
      conditions: ['mobile'],
      effects: [
        {
          key: 'product-card',
          keyframeEffect: {
            name: 'touch-feedback',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(0.98)' },
              { transform: 'scale(1)' },
            ],
          },
          duration: 150,
        },
      ],
    },

    // Tablet: Intermediate experience
    {
      key: 'product-card',
      trigger: 'click',
      conditions: ['tablet'],
      effects: [
        {
          key: 'product-overlay',
          keyframeEffect: {
            name: 'fade',
            keyframes: [{ opacity: '0' }, { opacity: '1' }],
          },
          duration: 200,
        },
      ],
    },
  ],
};
```

### Responsive Navigation

```typescript
const navigationConfig: InteractConfig = {
  conditions: {
    mobile: {
      type: 'media',
      predicate: '(max-width: 767px)',
    },
    desktop: {
      type: 'media',
      predicate: '(min-width: 768px)',
    },
    'narrow-header': {
      type: 'media',
      predicate: '(max-width: 800px)',
    },
  },

  interactions: [
    // Mobile: Slide menu
    {
      key: 'mobile-menu-toggle',
      trigger: 'click',
      conditions: ['mobile'],
      effects: [
        {
          key: 'mobile-menu',
          keyframeEffect: {
            name: 'slide',
            keyframes: [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }],
          },
          duration: 300,
          easing: 'ease-out',
        },
        {
          key: 'menu-overlay',
          keyframeEffect: {
            name: 'fade',
            keyframes: [{ opacity: '0' }, { opacity: '0.5' }],
          },
          duration: 300,
        },
      ],
    },

    // Desktop: Dropdown menus
    {
      key: 'nav-item',
      trigger: 'hover',
      conditions: ['desktop'],
      effects: [
        {
          key: 'dropdown-menu',
          keyframeEffect: {
            name: 'hover-desktop-kf',
            keyframes: [
              { opacity: '0', transform: 'translateY(-10px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 200,
        },
      ],
    },
  ],
};
```

## Best Practices

### Condition Naming

Use descriptive, semantic names:

```typescript
// Good
'desktop-large': { type: 'media', predicate: '(min-width: 1200px)' }
'touch-primary': { type: 'media', predicate: '(pointer: coarse)' }
'motion-safe': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' }

// Avoid
'condition1': { type: 'media', predicate: '(min-width: 1200px)' }
'big': { type: 'media', predicate: '(min-width: 1200px)' }
```

### Progressive Enhancement

Start with basic functionality and enhance:

```typescript
const progressiveConfig: InteractConfig = {
  interactions: [
    // Base interaction - works everywhere
    {
      key: 'button',
      trigger: 'click',
      effects: [
        {
          key: 'button',
          namedEffect: 'Pulse',
          duration: 200,
        },
      ],
    },

    // Enhanced interaction - only on capable devices
    {
      key: 'button',
      trigger: 'hover',
      conditions: ['desktop', 'motion-ok'],
      effects: [
        {
          key: 'button',
          keyframeEffect: {
            name: 'shadow',
            keyframes: [
              { transform: 'translateY(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
              { transform: 'translateY(-2px)', boxShadow: '0 8px 16px rgba(0,0,0,0.15)' },
            ],
          },
          duration: 250,
        },
      ],
    },
  ],
};
```

### Accessibility First

Always provide accessible alternatives:

```typescript
// Always provide a motion-safe version
{
    key: 'animated-element',
    trigger: 'viewEnter',
    conditions: ['motion-ok'],
    effects: [/* complex animation */]
},
{
    key: 'animated-element',
    trigger: 'viewEnter',
    conditions: ['motion-reduced'],
    effects: [/* simple fade or no animation */]
}
```

## Debugging Conditions

TBD

## Next Steps

You've completed the concept guides! Here's what to explore next:

- **[API Reference](../api/README.md)** - Detailed documentation of all classes and methods
- **[Examples](../examples/README.md)** - Practical examples and patterns
- **[Integration Guide](../integration/README.md)** - Framework-specific integration guides
