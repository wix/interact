# Effects and Animations

Effects define what visual changes happen when a trigger fires. `@wix/interact` integrates seamlessly with `@wix/motion` to provide three types of effects: **Time Effects**, **Scrub Effects**, and **Transition Effects**.

## Overview of Effect Types

| Effect Type            | Best For                                    | Timing         | Use Cases                                   |
| ---------------------- | ------------------------------------------- | -------------- | ------------------------------------------- |
| **Time Effects**       | Traditional animations                      | time-based     | Entrance animations, Loop animations        |
| **Scrub Effects**      | Scroll-driven and Pointer-driven animations | Progress-based | Parallax effects, horizontal-sliding effect |
| **Transition Effects** | CSS property changes                        | Duration-based | Micro-interactions, simple state changes    |

## Time Effects

Time effects are traditional time-based animations perfect for entrance effects, hover interactions, and click responses.

### Using Named Effects

Named effects are pre-built animations from `@wix/motion-presets` or effects registered via `Interact.registerEffects()`:

```typescript
{
    key: 'my-element',
    namedEffect: { type: 'FadeIn' },     // Predefined animation
    duration: 800,             // Animation duration in ms
    easing: 'ease-out',        // Animation timing curve
    delay: 200,                // Delay before starting
    iterations: 1,             // How many times to repeat
    fill: 'forwards'           // Animation fill mode
}
```

### Using Keyframe Effects

For custom animations, use keyframe effects:

```typescript
{
    key: 'custom-animation',
    keyframeEffect: {
        name: 'custom-animation',
        keyframes: [
            { transform: 'scale(1) rotate(0deg)', opacity: '1', backgroundColor: '#ff0000' },
            { transform: 'scale(1.2) rotate(180deg)', opacity: '0.8', backgroundColor: '#0000ff' }
        ]
    },
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
}
```

### Advanced Time Effect Properties

```typescript
{
    key: 'advanced-element',
    namedEffect: { type: 'SlideIn' },
    duration: 1000,
    easing: 'ease-in-out',
    iterations: 2,              // Repeat twice
    alternate: true,            // Reverse on alternate iterations
    fill: 'both',               // Keep start and end states
    reversed: false,            // Play backwards
    delay: 500,                 // Wait before starting
    effectId: 'my-animation'    // Unique identifier for chaining
}
```

### Real-World Example: Card Entrance

```typescript
{
    key: 'product-card',
    trigger: 'viewEnter',
    params: { threshold: 0.3 },
    effects: [
        {
            keyframeEffect: {
                name: 'card-entrance',
                keyframes: [
                    { opacity: '0', transform: 'translateY(60px) scale(0.9)' },
                    { opacity: '1', transform: 'translateY(0) scale(1)' }
                ]
            },
            duration: 800,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',  // Custom easing
            fill: 'forwards'
        }
    ]
}
```

## Scrub Effects

Scrub effects are progress-based animations that respond to scroll position or pointer position.

### Basic Scrub Effect

```typescript
{
    key: 'parallax-bg',
    keyframeEffect: {
        name: 'parallax',
        keyframes: [
            { transform: 'translateY(0)' },
            { transform: 'translateY(-200px)' }
        ]
    },
    // No duration - controlled by scroll/pointer progress
    easing: 'linear',
    rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
    rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } }
}
```

### Range Configuration

Control when the animation starts and stops:

```typescript
{
    key: 'fade-element',
    keyframeEffect: {
        name: 'fade',
        keyframes: [
            { opacity: '1' },
            { opacity: '0' }
        ]
    },
    rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 30 } },  // Start at 30% scroll
    rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 80 } }     // End at 80% scroll
}
```

### Advanced Pointer Properties

TBD

### Real-World Example: Parallax Hero

```typescript
{
    key: 'hero-section',
    trigger: 'viewProgress',
    effects: [
        // Background image moves slower
        {
            key: 'hero-bg',
            keyframeEffect: {
                name: 'image-parallax',
                keyframes: [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-150px)' }
                ]
            },
            rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } }
        },
        // Text fades out faster
        {
            key: 'hero-text',
            keyframeEffect: {
                name: 'text-fade',
                keyframes: [
                    { opacity: '1', transform: 'translateY(0)' },
                    { opacity: '0', transform: 'translateY(-50px)' }
                ]
            },
            rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 20 } },
            rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 60 } }
        }
    ]
}
```

## Transition Effects

Transition effects create smooth CSS property changes with automatic transitions.

### Basic Transition Effect

```typescript
{
    key: 'theme-button',
    transition: {
        duration: 300,
        delay: 0,
        easing: 'ease-in-out',
        styleProperties: [
            { name: 'backgroundColor', value: '#2563eb' },
            { name: 'color', value: '#ffffff' },
            { name: 'borderRadius', value: '12px' }
        ]
    }
}
```

### Individual Property Transitions

For different timing per property:

```typescript
{
    key: 'complex-transition',
    transitionProperties: [
        {
            name: 'backgroundColor',
            value: '#ef4444',
            duration: 200,
            delay: 0,
            easing: 'ease-out'
        },
        {
            name: 'transform',
            value: 'scale(1.05)',
            duration: 300,
            delay: 100,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }
    ]
}
```

### Real-World Example: Theme Switcher

```typescript
{
    key: 'theme-toggle',
    trigger: 'click',
    effects: [
        {
            key: 'page-body',
            transition: {
                duration: 400,
                easing: 'ease-in-out',
                styleProperties: [
                    { name: '--bg-color', value: '#1a1a1a' },
                    { name: '--text-color', value: '#ffffff' },
                    { name: '--accent-color', value: '#3b82f6' }
                ]
            },
            effectId: 'theme-switch'
        }
    ]
}
```

## Custom Effects

For complete control, use custom effects with JavaScript functions:

```typescript
{
    key: 'custom-element',
    customEffect: (element, progress) => {
        // progress is 0-1 for scrub effects, or animation timing for time effects
        const scale = 1 + (progress * 0.2);
        const rotation = progress * 360;

        element.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
        element.style.filter = `hue-rotate(${progress * 180}deg)`;
    }
}
```

### Advanced Custom Effect

```typescript
{
    key: 'particle-system',
    customEffect: (element, progress, params) => {
        const particles = element.querySelectorAll('.particle');

        particles.forEach((particle, index) => {
            const delay = index * 0.1;
            const adjustedProgress = Math.max(0, progress - delay);

            particle.style.opacity = adjustedProgress;
            particle.style.transform = `
                translateY(${(1 - adjustedProgress) * 50}px)
                rotate(${adjustedProgress * 180}deg)
            `;
        });
    }
}
```

## Combining Multiple Effects

You can apply multiple effects to different targets from a single trigger:

```typescript
{
    key: 'card-container',
    trigger: 'hover',
    effects: [
        // Card itself
        {
            key: 'card-container',
            keyframeEffect: {
                name: 'card-shadow',
                keyframes: [
                    { transform: 'translateY(0)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
                    { transform: 'translateY(-8px)', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }
                ]
            },
            duration: 200,
            easing: 'ease-out'
        },
        // Card image
        {
            key: 'card-image',
            namedEffect: {
              type: 'Scale'
            },
            duration: 300,
            easing: 'ease-out'
        },
        // Card title
        {
            key: 'card-title',
            keyframeEffect: {
                name: 'title-color',
                keyframes: [
                    { color: '#374151' },
                    { color: '#2563eb' }
                ]
            },
            duration: 150
        },
        // Card button
        {
            key: 'card-button',
            transition: {
                duration: 200,
                styleProperties: [
                    { name: 'opacity', value: '1' },
                    { name: 'transform', value: 'translateY(0)' }
                ]
            }
        }
    ]
}
```

## Animation Targeting

### Self-Targeting

Most common pattern - effect applies to the trigger element:

```typescript
{
    key: 'my-button',
    trigger: 'hover',
    effects: [
        {
            // Ommitted key means same as source
            namedEffect: {
                type: 'Scale'
            },
            duration: 200
        }
    ]
}
```

### Cross-Targeting

Effect applies to different elements:

```typescript
{
    key: 'menu-trigger',
    trigger: 'click',
    effects: [
        {
            key: 'mobile-menu',     // Different element
            namedEffect: {
                type: 'SlideIn',
                direction: 'down'
            },
            duration: 300
        },
        {
            key: 'menu-overlay',    // Another different element
            keyframeEffect: {
                name: 'fade',
                keyframes: [
                    { opacity: '0' },
                    { opacity: '1' }
                ]
            },
            duration: 200
        }
    ]
}
```

### Multiple Targets with Same Effect

```typescript
{
    key: 'master-control',
    trigger: 'click',
    effects: [
        {
            key: 'item-1',  // first target
            namedEffect: {
                type: 'FadeIn'
            },
            duration: 400
        },
        {
            key: 'item-2',  // second target
            namedEffect: {
                type: 'FadeIn'
            },
            duration: 400
        },
        {
            key: 'item-3',  // third target
            namedEffect: {
                type: 'FadeIn'
            },
            duration: 400
        }
    ]
}
```

## Performance Optimization

### Use Efficient Properties

Prefer these properties for smooth animations:

- `transform` (translate, scale, rotate)
- `opacity`
- `filter`
- Custom CSS properties

Avoid animating:

- Layout properties (`width`, `height`, `margin`, `padding`)
- Position properties (`top`, `left`)
- Properties that trigger reflow

### Named Effects vs Keyframes

```typescript
// Preferred - optimized; from @wix/motion-presets
{
    namedEffect: {
        type: 'FadeIn'
    },
    duration: 300
}

// Use sparingly - custom keyframes
{
    keyframeEffect: {
        name: 'fade',
        keyframes: [
            { opacity: '0' },
            { opacity: '1' }
        ]
    },
    duration: 300
}
```

## Real-World Examples

### Image Gallery Hover Effect

```typescript
{
    key: 'gallery-item',
    trigger: 'hover',
    effects: [
        {
            selector: 'img',
            keyframeEffect: {
                name: 'img-glow',
                keyframes: [
                    { transform: 'scale(1)', filter: 'brightness(1)' },
                    { transform: 'scale(1.1)', filter: 'brightness(1.1)' }
                ]
            },
            duration: 400,
            easing: 'ease-out'
        },
        {
            selector: '.overlay',
            keyframeEffect: {
                name: 'overlay-slide',
                keyframes: [
                    { opacity: '0', transform: 'translateY(100%)' },
                    { opacity: '1', transform: 'translateY(0)' }
                ]
            },
            duration: 300,
            delay: 100
        }
    ]
}
```

### Loading Animation Sequence

```typescript
{
    key: 'app-loader',
    trigger: 'viewEnter',
    effects: [
        {
            key: 'logo',
            keyframeEffect: {
                name: 'scale-fade',
                keyframes: [
                    { opacity: '0', transform: 'scale(0.8)' },
                    { opacity: '1', transform: 'scale(1)' }
                ]
            },
            duration: 600,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            effectId: 'logo-entrance'
        }
    ]
},
{
    key: 'logo',
    trigger: 'animationEnd',
    params: { effectId: 'logo-entrance' },
    effects: [
        {
            key: 'loading-text',
            namedEffect: {
                type: 'SlideUp'
            },
            duration: 400,
            effectId: 'text-entrance'
        }
    ]
}
```

### Scroll-Triggered Counter

```typescript
{
    key: 'stats-section',
    trigger: 'viewEnter',
    params: { threshold: 0.5 },
    effects: [
        {
            key: 'counter-1',
            customEffect: (element, progress) => {
                const targetValue = 1000;
                const currentValue = Math.floor(targetValue * progress);
                element.textContent = currentValue.toLocaleString();
            },
            duration: 2000,
            easing: 'ease-out'
        }
    ]
}
```

## Best Practices

### Animation Timing

- **Micro-interactions**: 100-300ms (hover, clicks)
- **Page transitions**: 300-500ms
- **Entrance animations**: 500-800ms
- **Complex sequences**: 800-1200ms

### Easing Functions

- **Entrances**: `ease-out` or `cubic-bezier(0.16, 1, 0.3, 1)`
- **Exits**: `ease-in` or `cubic-bezier(0.4, 0, 1, 1)`
- **Interactions**: `ease-in-out`
- **Elastic effects**: `cubic-bezier(0.34, 1.56, 0.64, 1)`

### Accessibility

```typescript
// Respect user preferences
{
    effects: {
        'reduced-motion-entry': {
            namedEffect: {
                type: 'FadeIn'
            },
            duration: 600
        }
    },
    interactions: [
        {
            key: 'animated-element',
            trigger: 'viewEnter',
            effects: [
                {
                    namedEffect: {
                        type: 'SlideIn'
                    },
                    duration: 600
                },
                {
                    effectId: 'reduced-motion-entry',
                    conditions: ['reduced-motion']   // Only animate if user allows motion
                }
            ]
        }
    ],
    conditions: {
        'reduced-motion': {
            type: 'media',
            predicate: '(prefers-reduced-motion: reduce)'
        }
    }
}
```

## Next Steps

Now that you understand effects and animations:

- **[Configuration Structure](./configuration-structure.md)** - Organize complex interactions
- **[State Management](./state-management.md)** - Advanced state handling
- **[Conditions and Media Queries](./conditions-and-media-queries.md)** - Responsive animations
