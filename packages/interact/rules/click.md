# Click Trigger Rules for @wix/interact

These rules help generate click-based interactions using the `@wix/interact` library. Click triggers respond to mouse click events and support multiple behavior patterns for different user experience needs.

## Rule 1: Click with TimeEffect and Alternate Pattern

**Use Case**: Toggle animations that play forward on first click and reverse on subsequent clicks (e.g., menu toggles, accordion expand/collapse, modal open/close)

**When to Apply**:

- When you need reversible animations
- For toggle states that should animate back to original position
- When creating expand/collapse functionality
- For modal or sidebar open/close animations

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'click',
    params: {
        type: 'alternate'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            [EFFECT_TYPE]: [EFFECT_DEFINITION],
            fill: 'both',
            reversed: [INITIAL_REVERSED_BOOL],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[SOURCE_KEY]`: Unique identifier for clickable element. Should equal the value of the `data-interact-key` attribute on the wrapping `<interact-element>`.
- `[TARGET_KEY]`: Unique identifier for animated element (can be same as `[SOURCE_KEY]` for self-targeting, or different for cross-targeting).
- `[EFFECT_TYPE]`: Either `namedEffect` or `keyframeEffect`
- `[EFFECT_DEFINITION]`: Named effect object (e.g., { type: 'SlideIn', ...params }, { type: 'FadeIn', ...params }) or keyframe object (e.g., { name: 'custom-fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] }, { name: 'custom-slide', keyframes: [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }] })
- `[INITIAL_REVERSED_BOOL]`: Optional boolean value indicating whether the first toggle should play the reversed animation.
- `[DURATION_MS]`: Animation duration in milliseconds (typically 200-500ms for clicks)
- `[EASING_FUNCTION]`: Timing function ('ease-out', 'ease-in-out', or cubic-bezier)
- `[UNIQUE_EFFECT_ID]`: Optional unique identifier for animation chaining

**Example - Menu Toggle**:

```typescript
{
    key: 'hamburger-menu',
    trigger: 'click',
    params: {
        type: 'alternate'
    },
    effects: [
        {
            key: 'mobile-nav',
            namedEffect: {
                type: 'SlideIn',
                direction: 'left'
            },
            fill: 'both',
            reversed: true,
            duration: 300,
            easing: 'ease-out',
            effectId: 'mobile-nav-toggle'
        }
    ]
}
```

**Example - Accordion Expand**:

```typescript
{
    key: 'accordion-header',
    trigger: 'click',
    params: {
        type: 'alternate'
    },
    effects: [
        {
            key: 'accordion-content',
            keyframeEffect: {
                name: 'accordion',
                keyframes: [
                    { clipPath: 'inset(0 0 100% 0)', opacity: '0' },
                    { clipPath: 'inset(0 0 0 0)', opacity: '1' }
                ]
            },
            fill: 'both',
            reversed: true,
            duration: 400,
            easing: 'ease-in-out'
        }
    ]
}
```

---

## Rule 2: Click with TimeEffect and State Pattern

**Use Case**: Animations that can be paused and resumed with clicks (e.g., video controls, loading animations, slideshow controls)

**When to Apply**:

- When you need play/pause functionality
- For controlling ongoing animations
- When users should be able to interrupt and resume animations
- For interactive media controls

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'click',
    params: {
        type: 'state'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            [EFFECT_TYPE]: [EFFECT_DEFINITION],
            fill: 'both',
            reversed: [INITIAL_REVERSED_BOOL],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            iterations: [ITERATION_COUNT],
            alternate: [ALTERNATE_BOOL],
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[ITERATION_COUNT]`: Number of iterations or Infinity for infinite looping animations
- `[ALTERNATE_BOOL]`: Optional boolean value indicating whether to alternate/toggle the playing direction of the animation on each iterations. Relevant only if `[ITERATION_COUNT]` is not 1.
- Other variables same as Rule 1

**Example - Loading Spinner Control**:

```typescript
{
    key: 'loading-control',
    trigger: 'click',
    params: {
        type: 'state'
    },
    effects: [
        {
            key: 'spinner',
            keyframeEffect: {
                name: 'spin',
                keyframes: [
                    { transform: 'rotate(0deg)' },
                    { transform: 'rotate(360deg)' }
                ]
            },
            duration: 1000,
            easing: 'linear',
            iterations: Infinity,
            effectId: 'spinner-rotation'
        }
    ]
}
```

**Example - Slideshow Pause**:

```typescript
{
    key: 'slideshow-toggle',
    trigger: 'click',
    params: {
        type: 'state'
    },
    effects: [
        {
            key: 'slideshow-container',
            namedEffect: { type: 'ShuttersIn' },
            duration: 3000,
            iterations: 10,
            alternate: true,
            effectId: 'slideshow-animation'
        }
    ]
}
```

---

## Rule 3: Click with TimeEffect and Repeat Pattern

**Use Case**: Animations that restart from the beginning each time clicked (e.g., pulse effects, notification badges, emphasis animations)

**When to Apply**:

- When you want fresh animation on each click
- For attention-grabbing effects
- When animation should always start from initial state
- For feedback animations that confirm user actions

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'click',
    params: {
        type: 'repeat'
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

- `[DELAY_MS]`: Optional delay before animation starts (useful for sequencing)
- Other variables same as Rule 1

**Example - Button Pulse Feedback**:

```typescript
{
    key: 'action-button',
    trigger: 'click',
    params: {
        type: 'repeat'
    },
    effects: [
        {
            key: 'action-button',
            keyframeEffect: {
                name: 'button-shadow',
                keyframes: [
                    { transform: 'scale(1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
                    { transform: 'scale(1.1)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' },
                    { transform: 'scale(1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
                ]
            },
            duration: 300,
            easing: 'ease-out'
        }
    ]
}
```

**Example - Success Notification**:

```typescript
{
    key: 'save-button',
    trigger: 'click',
    params: {
        type: 'repeat'
    },
    effects: [
        {
            key: 'success-badge',
            namedEffect: {
                type: 'BounceIn',
                direction: 'center'
            },
            duration: 600,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            delay: 300,
            effectId: 'success-feedback'
        }
    ]
}
```

---

## Rule 4: Click with State Toggles and TransitionEffects

**Use Case**: CSS property changes that toggle between states (e.g., theme switching, style variations, color changes)

**When to Apply**:

- When animating CSS properties directly
- For theme toggles and style switches
- When you need precise control over CSS transitions
- For simple property changes without complex keyframes

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'click',
    params: {
        method: 'toggle'  // also: 'add', 'remove', 'clear' — see full-lean.md StateParams
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            transition: {
                duration: [DURATION_MS],
                delay: [DELAY_MS],
                easing: '[EASING_FUNCTION]',
                styleProperties: [
                    { name: '[CSS_PROPERTY_1]', value: '[VALUE_1]' },
                    { name: '[CSS_PROPERTY_2]', value: '[VALUE_2]' }
                ]
            },
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[CSS_PROPERTY_N]`: CSS property name (e.g., 'background-color', 'color', 'border-radius')
- `[VALUE_N]`: CSS property value (e.g., '#2563eb', 'white', '12px')
- Other variables same as previous rules

**Example - Theme Toggle**:

```typescript
{
    key: 'theme-switcher',
    trigger: 'click',
    params: {
        method: 'toggle'
    },
    effects: [
        {
            key: 'page-body',
            transition: {
                duration: 400,
                easing: 'ease-in-out',
                styleProperties: [
                    { name: 'background-color', value: '#1a1a1a' },
                    { name: 'color', value: '#ffffff' },
                    { name: 'border-color', value: '#374151' },
                    { name: '--accent-color', value: '#475137ff' } // custom CSS properties are also supported
                ]
            },
            effectId: 'theme-switch'
        }
    ]
}
```

**Example - Button Style Toggle**:

```typescript
{
    key: 'style-toggle',
    trigger: 'click',
    params: {
        method: 'toggle'
    },
    effects: [
        {
            key: 'style-toggle',
            transition: {
                duration: 300,
                easing: 'ease-out',
                styleProperties: [
                    { name: 'background-color', value: '#ef4444' },
                    { name: 'color', value: '#ffffff' },
                    { name: 'border-radius', value: '24px' },
                    { name: 'transform', value: 'scale(1.05)' }
                ]
            }
        }
    ]
}
```

**Example - Card State Toggle**:

```typescript
{
    key: 'interactive-card',
    trigger: 'click',
    params: {
        method: 'toggle'
    },
    effects: [
        {
            key: 'interactive-card',
            transition: {
                duration: 250,
                easing: 'ease-in-out',
                styleProperties: [
                    { name: 'background-color', value: '#f3f4f6' },
                    { name: 'border-color', value: '#2563eb' },
                    { name: 'box-shadow', value: '0 20px 25px rgba(0,0,0,0.15)' }
                ]
            }
        }
    ]
}
```

---

## Rule 5: Click with Sequence (Staggered Multi-Element Orchestration)

**Use Case**: Click-triggered coordinated animations across multiple elements with staggered timing (e.g., page section reveals, multi-element toggles, orchestrated content entrances)

**When to Apply**:

- When a click should animate multiple elements with staggered timing
- For orchestrated content reveals (heading, body, image in sequence)
- When you want easing-controlled stagger instead of manual delays
- For toggle-able multi-element sequences

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'click',
    params: {
        type: 'alternate'
    },
    sequences: [
        {
            offset: [OFFSET_MS],
            offsetEasing: '[OFFSET_EASING]',
            effects: [
                { effectId: '[EFFECT_ID_1]', key: '[TARGET_KEY_1]' },
                { effectId: '[EFFECT_ID_2]', key: '[TARGET_KEY_2]' },
                { effectId: '[EFFECT_ID_3]', key: '[TARGET_KEY_3]' }
            ]
        }
    ]
}
```

**Variables**:

- `[OFFSET_MS]`: Stagger offset in ms between consecutive effects (typically 100-200ms)
- `[OFFSET_EASING]`: Easing for stagger distribution — `'linear'`, `'quadIn'`, `'sineOut'`, etc.
- `[EFFECT_ID_N]`: Effect id from the effects registry for each element
- `[TARGET_KEY_N]`: Element key for each target
- Other variables same as Rule 1

**Example - Orchestrated Content Reveal**:

```typescript
{
    key: 'reveal-button',
    trigger: 'click',
    params: {
        type: 'alternate'
    },
    sequences: [
        {
            offset: 150,
            offsetEasing: 'sineOut',
            effects: [
                { effectId: 'heading-entrance', key: 'content-heading' },
                { effectId: 'body-entrance', key: 'content-body' },
                { effectId: 'image-entrance', key: 'content-image' }
            ]
        }
    ]
}
```

```typescript
effects: {
    'heading-entrance': {
        key: 'content-heading',
        duration: 600,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        keyframeEffect: {
            name: 'heading-in',
            keyframes: [
                { transform: 'translateX(-40px)', opacity: 0 },
                { transform: 'translateX(0)', opacity: 1 }
            ]
        },
        fill: 'both'
    },
    'body-entrance': {
        key: 'content-body',
        duration: 500,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        keyframeEffect: {
            name: 'body-in',
            keyframes: [
                { transform: 'translateY(20px)', opacity: 0 },
                { transform: 'translateY(0)', opacity: 1 }
            ]
        },
        fill: 'both'
    },
    'image-entrance': {
        key: 'content-image',
        duration: 700,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        keyframeEffect: {
            name: 'image-in',
            keyframes: [
                { transform: 'scale(0.8) rotate(-5deg)', opacity: 0 },
                { transform: 'scale(1) rotate(0deg)', opacity: 1 }
            ]
        },
        fill: 'both'
    }
}
```

---

## Advanced Patterns and Combinations

### Multi-Target Click Effects

When one click should animate multiple elements (without stagger, use `effects`; with stagger, prefer `sequences` above):

```typescript
{
    key: 'master-control',
    trigger: 'click',
    params: {
        type: 'alternate'
    },
    effects: [
        {
            key: 'element-1',
            namedEffect: { type: 'FadeIn' },
            duration: 300,
            delay: 0,
            fill: 'both'
        },
        {
            key: 'element-2',
            namedEffect: { type: 'SlideIn' },
            duration: 400,
            delay: 100,
            fill: 'both'
        },
        {
            key: 'element-3',
            transition: {
                duration: 200,
                delay: 200,
                styleProperties: [
                    { name: 'box-shadow', value: '0 20px 25px rgba(0.2,0,0,0.15)' }
                ]
            }
        }
    ]
}
```

### Click with Animation Chaining

Using effectId for sequential animations:

```typescript
// First click animation
{
    key: 'sequence-trigger',
    trigger: 'click',
    params: {
        type: 'once'
    },
    effects: [
        {
            key: 'first-element',
            namedEffect: { type: 'FadeIn' },
            duration: 500,
            effectId: 'first-fade'
        }
    ]
},
// Chained animation
{
    key: 'first-element',
    trigger: 'animationEnd',
    params: {
        effectId: 'first-fade'
    },
    effects: [
        {
            key: 'second-element',
            namedEffect: { type: 'SlideIn' },
            duration: 400,
            effectId: 'second-slide'
        }
    ]
}
```

---

## Best Practices for Click Interactions

### Timing and Pattern Guidelines

1. **Keep click animations short** (100-500ms) for immediate feedback
2. **Use alternate pattern** for toggle states
3. **Use repeat pattern** for confirmation actions
4. **Use state pattern** for media controls

### Common Use Cases by Pattern

**Alternate Pattern**:

- Navigation menus
- Accordion sections
- Modal dialogs
- Sidebar toggles
- Dropdown menus

**State Pattern**:

- Video/audio controls
- Loading animations
- Slideshow controls
- Progress indicators

**Repeat Pattern**:

- Action confirmations
- Notification badges
- Button feedback
- Success animations
- Error indicators

**Transition Effects**:

- Theme switching
- Style variations
- Color changes
- Simple state toggles
- CSS custom property updates
