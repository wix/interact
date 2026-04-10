# Hover Trigger Rules for @wix/interact

This document contains rules for generating hover trigger interactions in `@wix/interact`. These rules cover all hover behavior patterns and common use cases.

## Rule 1: Basic Hover Effect Configuration

**Purpose**: Generate basic hover interactions with enter/leave animations

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'hover',
    effects: [
        {
            key: '[TARGET_KEY]',
            [EFFECT_TYPE]: [EFFECT_DEFINITION],
            fill: 'both',
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]'
        }
    ]
}
```

**Variables**:

- `[SOURCE_KEY]`: Unique identifier for hoverable element. Should equal the value of the `data-interact-key` attribute on the wrapping `<interact-element>`.
- `[TARGET_KEY]`: Unique identifier for animated element (can be same as `[SOURCE_KEY]` for self-targeting, or different for cross-targeting).
- `[EFFECT_TYPE]`: Either `namedEffect` or `keyframeEffect`
- `[EFFECT_DEFINITION]`: Named effect object (e.g., { type: 'SlideIn', ...params }, { type: 'FadeIn', ...params }) or keyframe object (e.g., { name: 'custom-fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] }, { name: 'custom-slide', keyframes: [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }] })
- `[DURATION_MS]`: Animation duration in milliseconds (typically 200-500ms for micro-interactions)
- `[EASING_FUNCTION]`: Timing function ('ease-out', 'ease-in-out', or cubic-bezier)
- `[UNIQUE_EFFECT_ID]`: Optional unique identifier for animation chaining

**Default Values**:

- `DURATION_MS`: 300 (for micro-interactions)
- `EASING_FUNCTION`: 'ease-out' (for smooth feel)
- `[TARGET_KEY]`: Same as `[SOURCE_KEY]` for self-targeting

**Common Use Cases**:

- Button hover states
- Card lift effects
- Image zoom effects
- Color/opacity changes

**Example Generations**:

```typescript
// Button hover
{
    key: 'primary-button',
    trigger: 'hover',
    effects: [
        {
            key: 'primary-button',
            keyframeEffect: {
                name: 'button-shadow',
                keyframes: [
                    { transform: 'scale(1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
                    { transform: 'scale(1.05)', boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }
                ]
            },
            fill: 'both',
            duration: 200,
            easing: 'ease-out'
        }
    ]
}

// Image hover zoom
{
    key: 'product-image',
    trigger: 'hover',
    effects: [
        {
            key: 'product-image-media',
            keyframeEffect: {
                name: 'image-scale',
                keyframes: [
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.1)' }
                ]
            },
            fill: 'both',
            duration: 400,
            easing: 'ease-out'
        }
    ]
}
```

## Rule 2: Hover Alternate Animations (namedEffect / keyframeEffect)

**Purpose**: Hover interactions that play forward on mouse enter and reverse on mouse leave (`type: 'alternate'`).

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'hover',
    params: {
        type: 'alternate'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            // Use namedEffect OR keyframeEffect:
            namedEffect: { type: '[NAMED_EFFECT_TYPE]' },
            // keyframeEffect: { name: '[EFFECT_NAME]', keyframes: [{ ... }, { ... }] },
            fill: 'both',
            reversed: [REVERSED_BOOL],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]'
        }
    ]
}
```

**Variables**:

- `[REVERSED_BOOL]`: Optional. `true` to reverse the enter direction (mouse enter plays backwards, leave plays forwards).
- `[NAMED_EFFECT_TYPE]`: Pre-built effect from `@wix/motion-presets`. Available hover presets:
  - Size: `ExpandIn`, `Pulse`, `GrowIn`
  - Fade/Blur: `FadeIn`, `Flash`, `BlurIn`
  - Translate: `SlideIn`, `GlideIn`, `FloatIn`, `BounceIn`, `GlitchIn`
  - Rotate: `SpinIn`, `TiltIn`, `ArcIn`, `TurnIn`, `FlipIn`, `Spin`, `Swing`
  - Attention: `Bounce`, `DropIn`, `Rubber`, `Jello`, `Cross`, `Wiggle`, `Poke`
- Other variables same as Rule 1

**Important**: Spatial effects (translation, rotation) that change the hit-area considerably should use different source and target keys to avoid flickering on enter/leave.

**Default Values**:

- `DURATION_MS`: 250–300
- `EASING_FUNCTION`: 'ease-out'

**Example — namedEffect (card scale)**:

```typescript
{
    key: 'feature-card',
    trigger: 'hover',
    params: { type: 'alternate' },
    effects: [
        {
            key: 'feature-card',
            namedEffect: { type: 'Pulse' },
            fill: 'both',
            duration: 250,
            easing: 'ease-out'
        }
    ]
}
```

**Example — keyframeEffect (card lift)**:

```typescript
{
    key: 'portfolio-item',
    trigger: 'hover',
    params: { type: 'alternate' },
    effects: [
        {
            key: 'portfolio-item',
            keyframeEffect: {
                name: 'portfolio-lift',
                keyframes: [
                    { transform: 'translateY(0)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
                    { transform: 'translateY(-8px)', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }
                ]
            },
            fill: 'both',
            duration: 300,
            easing: 'ease-out'
        }
    ]
}
```

## Rule 3: Hover Interactions with Repeat Pattern

**Purpose**: Generate hover interactions that restart animation each time mouse enters

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'hover',
    params: {
        type: 'repeat'
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

- Same as Rule 1

**Use Cases for Repeat Pattern**:

- Attention-grabbing animations
- Pulse effects
- Shake/wiggle animations
- Bounce effects

**Default Values**:

- `type`: 'repeat'
- `DURATION_MS`: 600 (longer for noticeable repeat)
- `EASING_FUNCTION`: 'ease-in-out'

**Example Generations**:

```typescript
// Button pulse effect
{
    key: 'cta-button',
    trigger: 'hover',
    params: {
        type: 'repeat'
    },
    effects: [
        {
            key: 'cta-button',
            namedEffect: {
                type: 'Breath'
            },
            duration: 600,
            easing: 'ease-in-out'
        }
    ]
}

// Icon shake effect
{
    key: 'notification-bell',
    trigger: 'hover',
    params: {
        type: 'repeat'
    },
    effects: [
        {
            key: 'notification-bell',
            keyframeEffect: {
                name: 'shake',
                keyframes: [
                    { transform: 'rotate(0deg)' },
                    { transform: 'rotate(15deg)' },
                    { transform: 'rotate(-15deg)' },
                    { transform: 'rotate(0deg)' }
                ]
            },
            duration: 500,
            easing: 'ease-in-out'
        }
    ]
}
```

## Rule 4: Hover Interactions with Play/Pause Pattern

**Purpose**: Generate hover interactions that pause/resume on hover (state-based control)

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'hover',
    params: {
        type: 'state'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            [EFFECT_TYPE]: [EFFECT_DEFINITION],
            duration: [DURATION_MS],
            iterations: Infinity,
            easing: '[EASING_FUNCTION]'
        }
    ]
}
```

**Variables**:

- Same as Rule 1

**Use Cases for State Pattern**:

- Controlling loop animations
- Pausing video effects
- Interactive loading spinners
- Continuous animation control

**Default Values**:

- `type`: 'state'
- `iterations`: Infinity
- `DURATION_MS`: 2000 (longer for smooth loops)
- `EASING_FUNCTION`: 'linear' (for continuous motion)

**Example Generations**:

```typescript
// Rotating loader that plays on hover and pauses on mouse leave
{
    key: 'loading-spinner',
    trigger: 'hover',
    params: {
        type: 'state'
    },
    effects: [
        {
            key: 'loading-spinner',
            keyframeEffect: {
                name: 'spin',
                keyframes: [
                    { transform: 'rotate(0deg)' },
                    { transform: 'rotate(360deg)' }
                ]
            },
            duration: 2000,
            iterations: Infinity,
            easing: 'linear'
        }
    ]
}

// Pulsing element that plays on hover and pauses on mouse leave
{
    key: 'live-indicator',
    trigger: 'hover',
    params: {
        type: 'state'
    },
    effects: [
        {
            key: 'live-indicator',
            namedEffect: {
                type: 'Pulse'
            },
            duration: 1500,
            iterations: Infinity,
            easing: 'ease-in-out'
        }
    ]
}
```

## Rule 5: Multi-Target Hover Effects

**Purpose**: Generate hover interactions that affect multiple elements from a single source

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'hover',
    params: {
        type: '[BEHAVIOR_TYPE]'
    },
    effects: [
        {
            key: '[TARGET_1]',
            [EFFECT_TYPE]: [EFFECT_DEFINITION_1],
            fill: [FILL_1],
            reversed: [REVERSED_BOOL_1],
            duration: [DURATION_1],
            delay: [DELAY_1]
        },
        {
            key: '[TARGET_2]',
            [EFFECT_TYPE]: [EFFECT_DEFINITION_2],
            fill: [FILL_2],
            reversed: [REVERSED_BOOL_2],
            duration: [DURATION_2],
            delay: [DELAY_2]
        }
    ]
}
```

**Variables**:

- `[BEHAVIOR_TYPE]`: type of behavior for the effect. use `alternate`, `repeat`, or `state` according to the previous rules.
- `[FILL_N]`: Optional fill value for the Nth effect - same as CSS animation-fill-mode (e.g. 'both', 'forwards', 'backwards').
- `[REVERSED_BOOL_N]`: Same as `[REVERSED_BOOL]` from Rule 2 only for the Nth effect.
- `[DURATION_N]`: Same as `[DURATION_MS]` from Rule 1 only for the Nth effect.
- `[DELAY_N]`: Delay in milliseconds of the Nth effect.

**Use Cases**:

- Card hover affecting image, text, and button
- Navigation item hover affecting icon and text
- Complex component state changes

**Timing Strategies**:

- Simultaneous: All delays = 0
- Staggered: Incrementing delays (0, 50, 100ms)
- Sequential: Non-overlapping delays

**Example Generations**:

```typescript
// Product card with multiple targets
{
    key: 'product-card',
    trigger: 'hover',
    params: {
        type: 'alternate'
    },
    effects: [
        {
            key: 'product-card',
            keyframeEffect: {
                name: 'product-card-move',
                keyframes: [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-8px)' }
                ]
            },
            fill: 'both',
            duration: 200,
            delay: 0
        },
        {
            key: 'product-image',
            keyframeEffect: {
                name: 'product-image-scale',
                keyframes: [
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.05)' }
                ]
            },
            fill: 'both',
            duration: 300,
            delay: 50
        },
        {
            key: 'product-title',
            keyframeEffect: {
                name: 'product-title-color',
                keyframes: [
                    { color: '#374151' },
                    { color: '#2563eb' }
                ]
            },
            fill: 'both',
            duration: 150,
            delay: 100
        },
        {
            key: 'add-to-cart-btn',
            keyframeEffect: {
                name: 'button-fade',
                keyframes: [
                    { opacity: '0', transform: 'translateY(10px)' },
                    { opacity: '1', transform: 'translateY(0)' }
                ]
            },
            fill: 'both',
            duration: 200,
            delay: 150
        }
    ]
}
```

## Rule 6: Hover with Sequence (Staggered Multi-Target)

**Purpose**: Hover interactions that stagger animations across multiple targets using a sequence instead of manual delays.

**When to Apply**:

- When hovering a container should stagger-animate its children
- For list item hover effects with coordinated timing
- When you want easing-controlled stagger on hover

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'hover',
    params: {
        type: 'repeat'
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

**Example - Hover Card Grid Stagger**:

```typescript
{
    key: 'card-grid',
    trigger: 'hover',
    params: { type: 'repeat' },
    sequences: [
        {
            offset: 80,
            offsetEasing: 'sineOut',
            effects: [
                {
                    effectId: 'item-pop',
                    listContainer: '.card-grid-items'
                }
            ]
        }
    ]
}
```

```typescript
effects: {
    'item-pop': {
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        keyframeEffect: {
            name: 'item-pop',
            keyframes: [
                { transform: 'translateY(16px) scale(0.95)', opacity: 0 },
                { transform: 'translateY(0) scale(1)', opacity: 1 }
            ]
        }
    }
}
```

---

## Best Practices for Hover Rules

### Timing and Pattern Guidelines

1. **Keep durations short** (100-400ms) for responsiveness

### User Experience Guidelines

1. **Use 'alternate' type** for most hover effects (natural enter/leave)
2. **Use 'repeat' sparingly** - can be annoying if overused
3. **Use 'state' for controlling** ongoing animations
4. **Stagger multi-target effects** for more polished feel

### Timing Recommendations

- **Micro-interactions**: 100-200ms
- **Button hovers**: 200-300ms
- **Card/image effects**: 300-400ms
- **Complex multi-target**: 200-500ms total

### Easing Recommendations

- **Enter animations**: 'ease-out' (quick start, slow end)
- **Interactive elements**: 'ease-in-out' (smooth both ways)
- **Attention effects**: 'ease-in-out' (natural feel)
- **Continuous motion**: 'linear' (consistent speed)

## Accessibility

Use `@wix/interact`'s `conditions` API to skip hover animations for users who prefer reduced motion. Define a `prefers-motion` condition and reference it on any interaction that should be suppressed:

```typescript
{
  conditions: {
    'prefers-motion': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' }
  },
  interactions: [
    {
      key: 'card',
      trigger: 'hover',
      conditions: ['prefers-motion'],  // skipped when reduced-motion is preferred
      effects: [/* ... */]
    }
  ]
}
```

For pointer-primary devices only, also consider adding a `hover-capable` condition:

```typescript
'hover-capable': { type: 'media', predicate: '(hover: hover)' }
```

Use `trigger: 'interest'` instead of `'hover'` to also handle keyboard focus, which is the accessible equivalent of hover.
