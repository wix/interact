# ViewEnter Trigger Rules for @wix/interact

These rules help generate viewport-based interactions using the `@wix/interact` library. ViewEnter triggers use Intersection Observer to detect when elements enter the viewport and are ideal for entrance animations, lazy loading effects, and scroll-triggered content reveals.

## Rule 1: ViewEnter with Once Type for Entrance Animations

**Use Case**: One-time entrance animations that play when elements first become visible (e.g., hero sections, content blocks, images, cards)

**When to Apply**:

- For entrance animations that should only happen once
- When you want elements to stay in their final animated state
- For progressive content reveal as user scrolls
- When implementing lazy-loading visual effects

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'viewEnter',
    params: {
        type: 'once',
        threshold: [VISIBILITY_THRESHOLD],
        inset: '[VIEWPORT_INSETS]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            [EFFECT_TYPE]: [EFFECT_DEFINITION],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            delay: [DELAY_MS],
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[SOURCE_KEY]`: Unique identifier for element that triggers when visible (often same as target key)
- `[TARGET_KEY]`: Unique identifier for element to animate (can be same as source or different)
- `[VISIBILITY_THRESHOLD]`: Number between 0-1 indicating how much of element must be visible (e.g., 0.3 = 30%)
- `[VIEWPORT_INSETS]`: String insets around viewport (e.g., '50px', '10%', '-100px')
- `[EFFECT_TYPE]`: Either `namedEffect` or `keyframeEffect`
- `[EFFECT_DEFINITION]`: Named effect string (e.g., 'FadeIn', 'SlideIn') or keyframe object
- `[DURATION_MS]`: Animation duration in milliseconds (typically 500-1200ms for entrances)
- `[EASING_FUNCTION]`: Timing function (recommended: 'ease-out', 'cubic-bezier(0.16, 1, 0.3, 1)')
- `[DELAY_MS]`: Optional delay before animation starts
- `[UNIQUE_EFFECT_ID]`: Optional unique identifier for animation chaining

**Example - Hero Section Entrance**:

```typescript
{
    key: 'hero-section',
    trigger: 'viewEnter',
    params: {
        type: 'once',
        threshold: 0.3,
        inset: '-100px'
    },
    effects: [
        {
            key: 'hero-section',
            keyframeEffect: {
                name: 'hero-entrance',
                keyframes: [
                    { opacity: '0', transform: 'translateY(60px) scale(0.95)' },
                    { opacity: '1', transform: 'translateY(0) scale(1)' }
                ]
            },
            duration: 1000,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'backwards',
            effectId: 'hero-entrance'
        }
    ]
}
```

**Example - Content Block Fade In**:

```typescript
{
    key: 'content-block',
    trigger: 'viewEnter',
    params: {
        type: 'once',
        threshold: 0.5
    },
    effects: [
        {
            key: 'content-block',
            namedEffect: {
                type: 'FadeIn'
            },
            duration: 800,
            easing: 'ease-out',
            fill: 'backwards'
        }
    ]
}
```

---

## Rule 2: ViewEnter with Repeat Type and Separate Source/Target

**Use Case**: Animations that retrigger every time elements enter the viewport, often with separate trigger and target elements (e.g., scroll-triggered counters, image reveals, interactive sections)

**When to Apply**:

- When animations should replay on each scroll encounter
- For scroll-triggered interactive elements
- When using separate observer and animation targets
- For elements that might leave and re-enter viewport

**Pattern**:

```typescript
{
    key: '[OBSERVER_KEY]',
    trigger: 'viewEnter',
    params: {
        type: 'repeat',
        threshold: [VISIBILITY_THRESHOLD],
        inset: '[VIEWPORT_INSETS]'
    },
    effects: [
        {
            key: '[ANIMATION_TARGET_KEY]',
            [EFFECT_TYPE]: [EFFECT_DEFINITION],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            delay: [DELAY_MS],
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[OBSERVER_KEY]`: Unique identifier for element that acts as scroll trigger
- `[ANIMATION_TARGET_KEY]`: Unique identifier for element that gets animated (different from observer)
- Other variables same as Rule 1

**Example - Image Reveal on Scroll**:

```typescript
{
    key: 'image-trigger-zone',
    trigger: 'viewEnter',
    params: {
        type: 'repeat',
        threshold: 0.1,
        inset: '-50px'
    },
    effects: [
        {
            key: 'background-image',
            keyframeEffect: {
                name: 'image-reveal',
                keyframes: [
                    { filter: 'blur(20px) brightness(0.7)', transform: 'scale(1.1)' },
                    { filter: 'blur(0) brightness(1)', transform: 'scale(1)' }
                ]
            },
            duration: 600,
            easing: 'ease-out',
            fill: 'backwards'
        }
    ]
}
```

**Example - Counter Animation Repeat**:

```typescript
{
    key: 'stats-section',
    trigger: 'viewEnter',
    params: {
        type: 'repeat',
        threshold: 0.6
    },
    effects: [
        {
            key: 'counter-display',
            customEffect: (element, progress) => {
                const targetValue = 1000;
                const currentValue = Math.floor(targetValue * progress);
                element.textContent = currentValue.toLocaleString();
            },
            duration: 2000,
            easing: 'ease-out',
            effectId: 'counter-animation'
        }
    ]
}
```

---

## Rule 3: ViewEnter with Alternate Type and Separate Source/Target

**Use Case**: Animations that play forward when entering viewport and reverse when leaving, using separate observer and target elements (e.g., parallax effects, reveal/hide content, scroll-responsive UI elements)

**When to Apply**:

- For animations that should reverse when element exits viewport
- When creating scroll-responsive reveals
- For elements that animate in and out smoothly
- When observer element is different from animated element

**Pattern**:

```typescript
{
    key: '[OBSERVER_KEY]',
    trigger: 'viewEnter',
    params: {
        type: 'alternate',
        threshold: [VISIBILITY_THRESHOLD],
        inset: '[VIEWPORT_INSETS]'
    },
    effects: [
        {
            key: '[ANIMATION_TARGET_KEY]',
            [EFFECT_TYPE]: [EFFECT_DEFINITION],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:
Same as Rule 2

**Example - Content Reveal with Hide**:

```typescript
{
    key: 'content-trigger',
    trigger: 'viewEnter',
    params: {
        type: 'alternate',
        threshold: 0.3,
        inset: '-20px'
    },
    effects: [
        {
            key: 'sidebar-content',
            keyframeEffect: {
                name: 'content-reveal-hide',
                keyframes: [
                    { opacity: '0', transform: 'translateX(-50px)' },
                    { opacity: '1', transform: 'translateX(0)' }
                ]
            },
            duration: 400,
            easing: 'ease-in-out',
            fill: 'backwards'
        }
    ]
}
```

**Example - Navigation Bar Reveal**:

```typescript
{
    key: 'page-content',
    trigger: 'viewEnter',
    params: {
        type: 'alternate',
        threshold: 0.1
    },
    effects: [
        {
            key: 'floating-nav',
            keyframeEffect: {
                name: 'nav-reveal',
                keyframes: [
                    { opacity: '0', transform: 'translateY(-100%)' },
                    { opacity: '1', transform: 'translateY(0)' }
                ]
            },
            duration: 300,
            easing: 'ease-out',
            fill: 'backwards',
            effectId: 'nav-reveal'
        }
    ]
}
```

---

## Rule 4: ViewEnter with State Type for Loop Animations

**Use Case**: Looping animations that start when element enters viewport and can be paused/resumed (e.g., ambient animations, loading states, decorative effects)

**When to Apply**:

- For continuous animations that should start on viewport enter
- When you need pause/resume control over scroll-triggered loops
- For ambient or decorative animations
- When creating scroll-activated background effects

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'viewEnter',
    params: {
        type: 'state',
        threshold: [VISIBILITY_THRESHOLD],
        inset: '[VIEWPORT_INSETS]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            [EFFECT_TYPE]: [EFFECT_DEFINITION],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            iterations: [ITERATION_COUNT],
            alternate: [ALTERNATE_BOOLEAN],
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[ITERATION_COUNT]`: Number of iterations or Infinity for continuous looping
- `[ALTERNATE_BOOLEAN]`: true/false - whether to reverse on alternate iterations
- Other variables same as Rule 1

**Example - Floating Animation Loop**:

```typescript
{
    key: 'floating-elements',
    trigger: 'viewEnter',
    params: {
        type: 'state',
        threshold: 0.4
    },
    effects: [
        {
            key: 'floating-icon',
            keyframeEffect: {
                name: 'floating-loop',
                keyframes: [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-20px)' },
                    { transform: 'translateY(0)' }
                ]
            },
            duration: 3000,
            easing: 'ease-in-out',
            iterations: Infinity,
            alternate: false,
            effectId: 'floating-loop'
        }
    ]
}
```

**Example - Breathing Light Effect**:

```typescript
{
    key: 'ambient-section',
    trigger: 'viewEnter',
    params: {
        type: 'state',
        threshold: 0.2
    },
    effects: [
        {
            key: 'light-orb',
            namedEffect: {
                type: 'Pulse'
            },
            duration: 2000,
            easing: 'ease-in-out',
            iterations: Infinity,
            alternate: true,
            effectId: 'breathing-light'
        }
    ]
}
```

---

## Rule 5: Threshold and Viewport Intersection Parameters

**Use Case**: Fine-tuning when animations trigger based on element visibility and viewport positioning (e.g., early triggers, late triggers, precise timing)

**When to Apply**:

- When default triggering timing isn't optimal
- For elements that need early or late animation triggers
- When working with very tall or very short elements
- For precise scroll timing control

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'viewEnter',
    params: {
        type: '[BEHAVIOR_TYPE]',
        threshold: [PRECISE_THRESHOLD],
        inset: '[VIEWPORT_ADJUSTMENT]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            [EFFECT_TYPE]: [EFFECT_DEFINITION],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]'
        }
    ]
}
```

**Variables**:

- `[PRECISE_THRESHOLD]`: Decimal between 0-1 for exact visibility percentage
- `[VIEWPORT_ADJUSTMENT]`: Pixel or percentage adjustment to viewport detection area
- `[BEHAVIOR_TYPE]`: 'once', 'repeat', 'alternate', or 'state'
- Other variables same as Rule 1

**Example - Early Trigger for Tall Elements**:

```typescript
{
    key: 'tall-hero-section',
    trigger: 'viewEnter',
    params: {
        type: 'once',
        threshold: 0.1,    // Trigger when only 10% visible
        inset: '-200px'     // Extend detection area 200px beyond viewport
    },
    effects: [
        {
            key: 'tall-hero-section',
            namedEffect: {
                type: 'SlideIn'
            },
            duration: 1200,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }
    ]
}
```

**Example - Late Trigger for Precise Timing**:

```typescript
{
    key: 'precision-content',
    trigger: 'viewEnter',
    params: {
        type: 'once',
        threshold: 0.8,    // Wait until 80% visible
        inset: '50px'     // Shrink detection area by 50px
    },
    effects: [
        {
            key: 'precision-content',
            keyframeEffect: {
                name: 'blur',
                keyframes: [
                    { opacity: '0', filter: 'blur(5px)' },
                    { opacity: '1', filter: 'blur(0)' }
                ]
            },
            duration: 600,
            easing: 'ease-out',
            fill: 'backwards'
        }
    ]
}
```

**Example - Mobile vs Desktop Thresholds**:

```typescript
{
    conditions: {
        // Condition IDs are user-defined strings matched against these media predicates
        'desktop-only': { type: 'media', predicate: '(min-width: 768px)' },
    },
    interactions: [
        {
            key: 'responsive-element',
            trigger: 'viewEnter',
            params: {
                type: 'once',
                threshold: 0.3,
                inset: '-100px'
            },
            conditions: ['desktop-only'],
            effects: [
                {
                    key: 'responsive-element',
                    namedEffect: { type: 'FadeIn' },
                    duration: 800
                }
            ]
        }
    ]
}
```

---

## Rule 6: Staggered Entrance Animations (Sequences)

**Use Case**: Sequential entrance animations where multiple elements animate with staggered timing (e.g., card grids, list items, team member cards, feature sections)

**When to Apply**:

- When multiple elements should animate in sequence
- For creating wave or cascade effects
- When animating lists, grids, or collections
- For progressive content revelation

**Preferred approach: use `sequences`** on the interaction instead of manually setting `delay` on individual effects. Sequences automatically calculate stagger delays using `offset` and `offsetEasing`.

**Pattern (with `listContainer`)**:

```typescript
{
    key: '[CONTAINER_KEY]',
    trigger: 'viewEnter',
    params: {
        type: '[BEHAVIOR_TYPE]',
        threshold: [VISIBILITY_THRESHOLD]
    },
    sequences: [
        {
            offset: [OFFSET_MS],
            offsetEasing: '[OFFSET_EASING]',
            effects: [
                {
                    effectId: '[EFFECT_ID]',
                    listContainer: '[LIST_CONTAINER_SELECTOR]'
                }
            ]
        }
    ]
}
```

**Variables**:

- `[CONTAINER_KEY]`: Unique identifier for the container element
- `[OFFSET_MS]`: Stagger offset in ms between consecutive items (e.g., 80, 100, 120)
- `[OFFSET_EASING]`: How the offset is distributed — `'linear'` (equal spacing), `'quadIn'` (accelerating), `'sineOut'` (decelerating), etc.
- `[LIST_CONTAINER_SELECTOR]`: CSS selector for the list container whose children become sequence items
- Other variables same as Rule 1

**Example - Card Grid Stagger (listContainer)**:

```typescript
{
    key: 'card-grid-container',
    trigger: 'viewEnter',
    params: {
        type: 'once',
        threshold: 0.3
    },
    sequences: [
        {
            offset: 100,
            offsetEasing: 'quadIn',
            effects: [
                {
                    effectId: 'card-entrance',
                    listContainer: '.card-grid'
                }
            ]
        }
    ]
}
```

With effect in the registry:

```typescript
effects: {
    'card-entrance': {
        duration: 500,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        keyframeEffect: {
            name: 'card-fade-up',
            keyframes: [
                { transform: 'translateY(40px)', opacity: 0 },
                { transform: 'translateY(0)', opacity: 1 }
            ]
        },
        fill: 'both'
    }
}
```

**Example - Feature List Cascade (per-key effects)**:

When items have individual keys rather than a shared container, list each as a separate effect in the sequence:

```typescript
{
    key: 'features-section',
    trigger: 'viewEnter',
    params: {
        type: 'once',
        threshold: 0.4
    },
    sequences: [
        {
            offset: 100,
            offsetEasing: 'linear',
            effects: [
                { effectId: 'feature-slide', key: 'feature-1' },
                { effectId: 'feature-slide', key: 'feature-2' },
                { effectId: 'feature-slide', key: 'feature-3' }
            ]
        }
    ]
}
```

```typescript
effects: {
    'feature-slide': {
        duration: 500,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        keyframeEffect: {
            name: 'feature-slide-in',
            keyframes: [
                { opacity: '0', transform: 'translateX(-30px)' },
                { opacity: '1', transform: 'translateX(0)' }
            ]
        },
        fill: 'backwards'
    }
}
```

---

## Advanced Patterns and Combinations

### ViewEnter with Animation Chaining

Using effectId to trigger subsequent animations:

```typescript
// Primary entrance
{
    key: 'section-container',
    trigger: 'viewEnter',
    params: {
        type: 'once',
        threshold: 0.3
    },
    effects: [
        {
            key: 'section-title',
            namedEffect: {
                type: 'FadeIn'
            },
            duration: 600,
            effectId: 'title-entrance'
        }
    ]
},
// Chained content animation
{
    key: 'section-title',
    trigger: 'animationEnd',
    params: {
        effectId: 'title-entrance'
    },
    effects: [
        {
            key: 'section-content',
            namedEffect: {
                type: 'SlideIn'
            },
            duration: 500,
            delay: 100
        }
    ]
}
```

### Multi-Effect ViewEnter

Animating multiple targets from single viewport trigger:

```typescript
{
    key: 'hero-trigger',
    trigger: 'viewEnter',
    params: {
        type: 'once',
        threshold: 0.2
    },
    effects: [
        {
            key: 'hero-background',
            keyframeEffect: {
                name: 'blur-bg',
                keyframes: [
                    { filter: 'blur(20px)', transform: 'scale(1.1)' },
                    { filter: 'blur(0)', transform: 'scale(1)' }
                ]
            },
            duration: 1200,
            easing: 'ease-out',
            fill: 'backwards'
        },
        {
            key: 'hero-title',
            namedEffect: {
                type: 'SlideIn'
            },
            duration: 800,
            delay: 300
        },
        {
            key: 'hero-subtitle',
            keyframeEffect: {
                name: 'subtitle-slide',
                keyframes: [
                    { opacity: '0', transform: 'translateY(30px)' },
                    { opacity: '1', transform: 'translateY(0)' }
                ]
            },
            duration: 600,
            fill: 'backwards',
            delay: 600
        },
        {
            key: 'hero-cta',
            transition: {
                duration: 400,
                delay: 900,
                styleProperties: [
                    { name: 'opacity', value: '1' },
                    { name: 'transform', value: 'translateY(0)' }
                ]
            }
        }
    ]
}
```

### Conditional ViewEnter Animations

Use the `conditions` config map to guard interactions by device or motion preference. Condition IDs are user-defined strings — they must be declared in the top-level `conditions` map before being referenced in an interaction.

```typescript
{
    conditions: {
        'desktop-only':   { type: 'media', predicate: '(min-width: 768px)' },
        'prefers-motion': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
        'mobile-only':    { type: 'media', predicate: '(max-width: 767px)' },
    },
    interactions: [
        {
            key: 'responsive-section',
            trigger: 'viewEnter',
            params: { type: 'once', threshold: 0.5 },
            conditions: ['desktop-only', 'prefers-motion'],
            effects: [
                {
                    key: 'responsive-section',
                    namedEffect: { type: 'SlideIn' },
                    duration: 1000
                }
            ]
        },
        // Simplified fallback for mobile or reduced-motion users
        {
            key: 'responsive-section',
            trigger: 'viewEnter',
            params: { type: 'once', threshold: 0.7 },
            conditions: ['mobile-only'],
            effects: [
                {
                    key: 'responsive-section',
                    namedEffect: { type: 'FadeIn' },
                    duration: 400
                }
            ]
        }
    ]
}
```

---

## Preventing Flash of Unstyled Content (FOUC)

Use `generate(config)` from `@wix/interact/web` server-side or at build time to produce critical CSS that hides entrance elements until their animation plays.

**Constraints:**

- MUST be called server-side or at build time — not client-side
- MUST set `data-interact-initial="true"` on the `<interact-element>` whose first child should be hidden
- Only valid for `viewEnter` + `params.type: 'once'` where source and target are the same element
- Do NOT use for `hover`, `click`, or `viewEnter` with `repeat`/`alternate`/`state` types

```typescript
import { generate } from '@wix/interact/web';

const config: InteractConfig = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      params: { type: 'once', threshold: 0.2 },
      effects: [{ namedEffect: { type: 'FadeIn' }, duration: 800 }],
    },
  ],
};

// Called at build time or on the server
const css = generate(config);

// Inject into <head> before the page renders
const html = `
<head>
  <style>${css}</style>
</head>
<body>
  <interact-element data-interact-key="hero" data-interact-initial="true">
    <section class="hero">...</section>
  </interact-element>
</body>
`;
```

---

## Best Practices for ViewEnter Interactions

### Behavior Guidelines

1. **Use `alternate` and `repeat` types only with a separate source `key` and target `key`** to avoid re-triggering when animation starts or not triggering at all if animated target is out of viewport or clipped

### Performance Guidelines

1. **Use `once` type for entrance animations** to avoid repeated triggers
2. **Be careful with separate source/target patterns** - ensure source doesn't get clipped
3. **Use appropriate thresholds** - avoid triggering too early or too late

### Threshold and Timing Guidelines

1. **Use realistic thresholds** (0.1-0.5) for natural timing
2. **Use tiny thresholds for huge elements** (0.01-0.05) for elements much larger than viewport
3. **Provide adequate inset margins** for mobile viewports
4. **Keep entrance animations moderate** (500-1200ms)
5. **Use staggered delays thoughtfully** (50-200ms intervals)

### Threshold and Timing Reference

**Recommended Thresholds by Content Type**:

- **Hero sections**: 0.1-0.3 (early trigger)
- **Content blocks**: 0.3-0.5 (balanced trigger)
- **Small elements**: 0.5-0.8 (late trigger)
- **Tall sections**: 0.1-0.2 (early trigger)
- **Huge sections**: 0.01-0.05 (ensure trigger)

**Recommended Insets by Device**:

- **Desktop**: '-50px' to '-200px'
- **Mobile**: '-20px' to '-100px'
- **Positive insets**: '50px' for precise timing

### Common Use Cases by Pattern

**Once Pattern**:

- Hero section entrances
- Content block reveals
- Image lazy loading
- Feature introductions
- Call-to-action reveals

**Repeat Pattern**:

- Interactive counters
- Scroll-triggered galleries
- Progressive content loading
- Repeated call-to-actions
- Dynamic content sections

**Alternate Pattern**:

- Scroll-responsive UI elements
- Reversible content reveals
- Navigation state changes
- Context-sensitive helpers
- Progressive disclosure

**State Pattern**:

- Ambient animations
- Background effects
- Decorative elements
- Loading states
- Atmospheric content

**Staggered Animations**:

- Card grids and lists
- Team member sections
- Feature comparisons
- Product catalogs
- Timeline elements

### Troubleshooting Common Issues

**ViewEnter not triggering**:

- Check if source element is clipped by parent overflow
- Verify element exists when `Interact.create()` is called
- Ensure threshold and inset values are appropriate
- Check for conflicting CSS that might hide elements

**ViewEnter triggering multiple times**:

- Use `once` type for entrance animations
- Avoid animating the source element if it's also the target
- Consider using separate source and target elements

**Animation performance issues**:

- Limit concurrent viewEnter observers
- Use hardware-accelerated properties
- Avoid animating layout properties
- Consider using `will-change` for complex animations
