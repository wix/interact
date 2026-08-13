# Conditions and Media Queries

Conditions allow you to create responsive interactions that adapt to different screen sizes, user preferences, and environmental factors. This guide explains how to build adaptive interactions using media queries and container queries.

## Overview of Conditions

Conditions in `@wix/interact` act as filters that determine when interactions should be active. They enable you to:

- **Create responsive animations** that work across devices
- **Respect user preferences** like reduced motion
- **Adapt to container sizes** with container queries
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

### Container Conditions

Use container queries to respond to element size:

```typescript
{
    conditions: {
        'large-card': {
            type: 'container',
            predicate: '(min-width: 400px)'
        },
        'tall-container': {
            type: 'container',
            predicate: '(min-height: 300px)'
        }
    }
}
```

## Reduced Motion

Reduced motion is the one preference Interact acts on **by itself**. It is worth reading before you write a `prefers-reduced-motion` condition, because most of the time you don't need one.

### What happens without any config

`Interact.reducedMotion` resolves to `Interact.forceReducedMotion ?? matchMedia('(prefers-reduced-motion: reduce)').matches`, and `generate()` emits `@media (prefers-reduced-motion: reduce)` rules next to the base ones. Because the decision lives in CSS, it also holds with JS disabled, under SSR, and when the user flips the OS setting mid-session.

| Effect kind                                                                         | Under `reduce`                                                                                       | What the user sees                    |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Time effect (`viewEnter`, `hover`, `click`, `interest`, `activate`, `animationEnd`) | **Collapsed** — `1ms` duration, `0ms` delay, one iteration                                           | The end state, applied instantly      |
| Ongoing time effect (`iterations: Infinity`)                                        | **Collapsed too** — iterations capped at 1                                                           | The end state; no perpetual motion    |
| State effect (`transition` / `transitionProperties`)                                | **Tween dropped, state kept** — the `transition` is declared only under `no-preference`              | The state toggles instantly           |
| `viewProgress`                                                                      | **Cancelled** — `view-timeline` is declared only under `no-preference` and the handler early-returns | The element's authored **base style** |
| `pointerMove`                                                                       | **Cancelled** — the handler early-returns, so the paused CSS animation is never driven               | The effect's **first keyframe**       |
| `customEffect`                                                                      | JS only — collapsed to `1ms` with the default `iterations: 1`, dropped when `iterations > 1`         | Its end state, or nothing             |

Nothing is ever suppressed by name, so a collapsed entrance still completes its FOUC handshake and can never leave an element permanently hidden.

### When you still need a condition

Two cases:

1. **You want a specific calmer look** rather than the instant end state.
2. **A cancelled scrub leaves the element unusable** — e.g. an `in`-range scroll reveal whose base style is `opacity: 0`. Interact cannot see your stylesheet, so it cannot warn you about this one.

Gate **only** the alternative. A `prefers-reduced-motion` condition on an effect (or on its interaction) exempts that effect from the automatic collapse — and only that effect, so neighbours on the same target need no changes:

```typescript
{
  conditions: {
    'motion-reduced': { type: 'media', predicate: '(prefers-reduced-motion: reduce)' },
  },
  interactions: [
    {
      key: 'hero-title',
      trigger: 'viewEnter',
      effects: [
        // No condition — collapsed automatically under `reduce`.
        {
          keyframeEffect: {
            name: 'fade-move',
            keyframes: [
              { opacity: '0', transform: 'translateY(50px) rotate(-2deg)' },
              { opacity: '1', transform: 'translateY(0) rotate(0deg)' },
            ],
          },
          duration: 800,
          fill: 'backwards',
        },
        // The calmer alternative, exempt from the collapse because it names the preference.
        {
          keyframeEffect: { name: 'fade', keyframes: [{ opacity: '0' }, { opacity: '1' }] },
          duration: 300,
          fill: 'backwards',
          conditions: ['motion-reduced'],
        },
      ],
    },
  ],
}
```

**A scrub's alternative must use a time-based trigger.** A `viewProgress` or `pointerMove` interaction gated on `(prefers-reduced-motion: reduce)` never runs — the runtime cancels scrubs under `reduce` regardless of conditions, and the generated CSS encodes the same decision. Substitute a `viewEnter` effect, or a plain CSS rule in your own stylesheet. [`@wix/interact-validate`](https://github.com/wix/interact/blob/master/packages/interact-validate/README.md) reports the mistake as `REDUCE_GATED_SCRUB`.

### The override

`Interact.forceReducedMotion` overrides detection: `true` forces reduced motion on, `false` forces motion on, `undefined` (the default) follows the OS. Setting it explicitly suppresses the preference-change listener, so assign it **before `Interact.create()`**. See [`Interact.forceReducedMotion`](../api/interact-class.md#interactforcereducedmotion).

With detection left in place, a mid-session change is picked up as follows: CSS-backed time and state effects follow it immediately (no JS involved), `viewProgress` / `pointerMove` interactions rebind and pick it up, and `customEffect` and other WAAPI-only effects pick it up on their next bind.

## Cascading of effects

Interact allows you to apply multiple effects on the same target and have them cascade, just like they do in CSS.
This allows you to have different variations of effects for different `media`/`contianer` `conditions` and have only one of them apply, base on the current environment of the user.

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

### Preference-Aware Animations

Reduced motion has its own section — see [Reduced Motion](#reduced-motion) — because Interact acts on it automatically. Other user preferences do not, so both sides need gating:

```typescript
const accessibleConfig: InteractConfig = {
  conditions: {
    'high-contrast': {
      type: 'media',
      predicate: '(prefers-contrast: high)',
    },
    'standard-contrast': {
      type: 'media',
      predicate: '(prefers-contrast: no-preference)',
    },
  },

  interactions: [
    {
      key: 'cta',
      trigger: 'hover',
      effects: [
        // Subtle tint at standard contrast.
        {
          key: 'cta',
          conditions: ['standard-contrast'],
          transition: {
            duration: 200,
            styleProperties: [{ name: 'background-color', value: 'rgba(0, 90, 200, 0.12)' }],
          },
        },
        // Solid, unambiguous fill when the user asks for high contrast.
        {
          key: 'cta',
          conditions: ['high-contrast'],
          transition: {
            duration: 200,
            styleProperties: [
              { name: 'background-color', value: '#0033aa' },
              { name: 'color', value: '#ffffff' },
            ],
          },
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

## Container Query Patterns

### Responsive Cards

```typescript
const containerConfig: InteractConfig = {
  conditions: {
    'card-large': {
      type: 'container',
      predicate: '(min-width: 350px)',
    },
    'card-small': {
      type: 'container',
      predicate: '(max-width: 349px)',
    },
    'card-tall': {
      type: 'container',
      predicate: '(min-height: 400px)',
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
      type: 'container',
      predicate: '(min-width: 1200px)',
    },
    'stack-layout': {
      type: 'container',
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
    'wide-container': {
      type: 'container',
      predicate: '(min-width: 600px)',
    },
  },

  interactions: [
    // Complex animation: desktop + motion ok + wide container
    {
      key: 'hero-animation',
      trigger: 'viewEnter',
      conditions: ['desktop', 'motion-ok', 'wide-container'],
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
    'large-product-card': {
      type: 'container',
      predicate: '(min-width: 300px)',
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
      conditions: ['desktop', 'large-product-card', 'motion-ok'],
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
      type: 'container',
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

Reduced motion is already handled — see [Reduced Motion](#reduced-motion). Add a condition only for a specific calmer look, or when a cancelled scroll/pointer effect would leave the element hidden. Gate the alternative alone, not the primary effect:

```typescript
{
    key: 'animated-element',
    trigger: 'viewEnter',
    effects: [
        /* complex animation — collapsed automatically under `reduce` */,
        { conditions: ['motion-reduced'], /* simple fade */ }
    ]
}
```

For other preferences — `prefers-contrast`, `prefers-color-scheme` — Interact does nothing on its own, so those genuinely need both sides gated.

## Debugging Conditions

TBD

## Next Steps

You've completed the concept guides! Here's what to explore next:

- **[API Reference](../api/README.md)** - Detailed documentation of all classes and methods
- **[Examples](../examples/README.md)** - Practical examples and patterns
- **[Integration Guide](../integration/README.md)** - Framework-specific integration guides
