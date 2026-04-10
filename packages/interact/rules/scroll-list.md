# Scroll List Animation Rules for @wix/interact

Scroll-driven list animations using `@wix/interact`. Sticky hierarchy: **container** → **items** → **content**. Use `key` for container/item; use `selector` for content within an item.

## Rule 1: Sticky Container List Animations with Named Effects

**Use Case**: Sticky list containers with named effects (horizontal galleries, parallax backgrounds). Use `contain` range—animations run while the element is stuck in position.

**When to Apply**: Sticky container sliding, parallax, background transformations.

**Pattern**:

```typescript
{
    key: '[CONTAINER_KEY]',
    trigger: 'viewProgress',
    effects: [
        {
            key: '[CONTAINER_KEY]',
            namedEffect: {
                type: '[CONTAINER_NAMED_EFFECT]'
            },
            rangeStart: { name: 'contain', offset: { unit: 'percentage', value: [START_PERCENTAGE] } },
            rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: [END_PERCENTAGE] } },
            easing: 'linear',
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**: `[CONTAINER_KEY]`, `[CONTAINER_NAMED_EFFECT]` ('BgParallax', 'PanScroll', 'MoveScroll', 'ParallaxScroll', 'BgPan', 'BgZoom', 'BgFade', 'BgReveal'), `[START_PERCENTAGE]`/`[END_PERCENTAGE]` (typically 0/100), `[UNIQUE_EFFECT_ID]`.

**Example - Horizontal Sliding Gallery Container**:

```typescript
{
    key: 'gallery-container',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'gallery-container',
            namedEffect: {
                type: 'PanScroll'
            },
            rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 100 } },
            easing: 'linear',
            effectId: 'gallery-slide'
        }
    ]
}
```

**Example - Parallax Container Background**:

```typescript
{
    key: 'sticky-list-wrapper',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'list-background',
            namedEffect: {
                type: 'BgParallax'
            },
            rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 100 } },
            easing: 'linear',
            effectId: 'bg-parallax'
        }
    ]
}
```

---

## Rule 2: Sticky Item List Animations with Named Effects

**Use Case**: Individual sticky list items with named effects for entrance/exit (progressive reveals, item transformations).

**When to Apply**: Item entrance/exit during sticky phases, progressive item reveals.

**Pattern**:

```typescript
{
    key: '[ITEM_KEY]',
    trigger: 'viewProgress',
    effects: [
        {
            key: '[ITEM_KEY]',
            namedEffect: {
                type: '[ITEM_NAMED_EFFECT]'
            },
            rangeStart: { name: '[RANGE_TYPE]', offset: { unit: 'percentage', value: [START_PERCENTAGE] } },
            rangeEnd: { name: '[RANGE_TYPE]', offset: { unit: 'percentage', value: [END_PERCENTAGE] } },
            easing: '[EASING_FUNCTION]',
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[ITEM_KEY]`: Individual list item identifier
- `[ITEM_NAMED_EFFECT]`: Item-level scroll effects from @wix/motion-presets:
  - **Reveal/Fade**: 'FadeScroll', 'BlurScroll', 'RevealScroll', 'ShapeScroll', 'ShuttersScroll'
  - **Movement**: 'MoveScroll', 'SlideScroll', 'PanScroll', 'SkewPanScroll'
  - **Scale**: 'GrowScroll', 'ShrinkScroll', 'StretchScroll'
  - **Rotation**: 'SpinScroll', 'FlipScroll', 'TiltScroll', 'TurnScroll'
  - **3D**: 'ArcScroll', 'Spin3dScroll'
- `[START_PERCENTAGE]`: Range start percentage (0-100)
- `[END_PERCENTAGE]`: Range end percentage (0-100)
- `[EASING_FUNCTION]`: Timing function

**Example - Item Entrance Reveal**:

```typescript
{
    key: 'list-item',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'list-item',
            namedEffect: {
                type: 'RevealScroll',
                direction: 'bottom'
            },
            rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 60 } },
            easing: 'ease-out',
            effectId: 'item-reveal'
        }
    ]
}
```

**Example - Item Scale During Sticky**:

```typescript
{
    key: 'sticky-list-item',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'sticky-list-item',
            namedEffect: {
                type: 'GrowScroll'
            },
            rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 50 } },
            easing: 'ease-in-out',
            effectId: 'item-grow'
        }
    ]
}
```

---

## Rule 3: Sticky Item List Content Animations with Named Effects

**Use Case**: Content within sticky items; each item is the viewProgress trigger (text reveals in cards, image animations, progressive disclosure). Use `key` for the item, `selector` for content within.

**When to Apply**: Content within sticky items, staggered content reveals, text/image animations inside list items.

**Pattern**:

```typescript
{
    key: '[ITEM_CONTAINER_KEY]',
    trigger: 'viewProgress',
    effects: [
        {
            key: '[CONTENT_KEY]',
            namedEffect: {
                type: '[CONTENT_NAMED_EFFECT]'
            },
            rangeStart: { name: '[RANGE_TYPE]', offset: { unit: 'percentage', value: [START_PERCENTAGE] } },
            rangeEnd: { name: '[RANGE_TYPE]', offset: { unit: 'percentage', value: [END_PERCENTAGE] } },
            easing: '[EASING_FUNCTION]',
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[ITEM_CONTAINER_KEY]` / `[CONTENT_KEY]`: Item and content identifiers. Use `selector` (e.g. `selector: '.content-text'`) for content within the item.
- `[CONTENT_NAMED_EFFECT]`: Content-level scroll effects from @wix/motion-presets:
  - **Opacity/Visibility**: 'FadeScroll', 'BlurScroll'
  - **Reveal**: 'RevealScroll', 'ShapeScroll', 'ShuttersScroll'
  - **3D Transforms**: 'TiltScroll', 'FlipScroll', 'ArcScroll', 'TurnScroll', 'Spin3dScroll'
  - **Movement**: 'MoveScroll', 'SlideScroll'
  - **Scale**: 'GrowScroll', 'ShrinkScroll'

**Example - Staggered Text Content Reveal**:

```typescript
{
    key: 'list-item-1',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'list-item-1',
            selector: '.content-text',
            namedEffect: {
                type: 'FadeScroll'
            },
            rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 20 } },
            rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 80 } },
            easing: 'ease-out',
            effectId: 'text-reveal-1'
        }
    ]
},
{
    key: 'list-item-2',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'list-item-2',
            selector: '.content-text',
            namedEffect: {
                type: 'FadeScroll'
            },
            rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 20 } },
            rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 80 } },
            easing: 'ease-out',
            effectId: 'text-reveal-2'
        }
    ]
}
```

**Example - Image Animation Within List Item**:

```typescript
{
    key: 'product-card',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'product-card',
            selector: '.hero-image',
            namedEffect: {
                type: 'RevealScroll'
            },
            rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 50 } },
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            effectId: 'product-image-reveal'
        }
    ]
}
```

---

## Rule 4: List Container Keyframe Animations

**Use Case**: Custom container keyframe effects for sticky containers (multi-property transforms, complex backgrounds).

**When to Apply**: Custom container effects not available in named effects.

**Pattern**:

```typescript
{
    key: '[CONTAINER_KEY]',
    trigger: 'viewProgress',
    effects: [
        {
            key: '[CONTAINER_KEY]',
            keyframeEffect: {
                name: '[UNIQUE_KEYFRAME_EFFECT_NAME]',
                keyframes: [
                    { [CSS_PROPERTY_1]: '[START_VALUE_1]', [CSS_PROPERTY_2]: '[START_VALUE_2]', [CSS_PROPERTY_3]: '[START_VALUE_3]' },
                    { [CSS_PROPERTY_1]: '[MID_VALUE_1]' },
                    { [CSS_PROPERTY_1]: '[END_VALUE_1]', [CSS_PROPERTY_2]: '[END_VALUE_2]', [CSS_PROPERTY_3]: '[END_VALUE_3]' }
                ]
            },
            rangeStart: { name: 'contain', offset: { unit: 'percentage', value: [START_PERCENTAGE] } },
            rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: [END_PERCENTAGE] } },
            easing: 'linear',
            fill: 'both',
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**: `[CONTAINER_KEY]`, `[UNIQUE_KEYFRAME_EFFECT_NAME]` (or `[UNIQUE_EFFECT_ID]`). Other variables same as Rule 1.

**Example - Multi-Property Container Animation**:

```typescript
{
    key: 'feature-list-container',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'feature-list-container',
            keyframeEffect: {
                name: 'container-slide',
                keyframes: [
                    { transform: 'translateX(0)', filter: 'brightness(1)', backgroundColor: 'rgb(255 255 255 / 0)' },
                    { transform: 'translateX(-50%)', filter: 'brightness(1.2)', backgroundColor: 'rgb(255 255 255 / 0.1)' },
                    { transform: 'translateX(-100%)', filter: 'brightness(1)', backgroundColor: 'rgb(255 255 255 / 0)' }
                ]
            },
            rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 100 } },
            easing: 'linear',
            fill: 'both',
            effectId: 'container-slide'
        }
    ]
}
```

**Example - Container Background Transformation**:

```typescript
{
    key: 'gallery-wrapper',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'gallery-background',
            keyframeEffect: {
                name: 'bg-transform',
                keyframes: [
                    { transform: 'scale(1.1) rotate(6deg)', opacity: '0.8', filter: 'hue-rotate(30deg)' },
                    { transform: 'scale(1) rotate(0deg)', opacity: '1', filter: 'hue-rotate(0deg)' }
                ]
            },
            rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 100 } },
            easing: 'linear',
            fill: 'both',
            effectId: 'bg-transform'
        }
    ]
}
```

---

## Rule 5: List Item Keyframe Entrance/Exit Animations

**Use Case**: Custom keyframe entrance/exit for list items (complex reveals, dismissals).

**When to Apply**: Complex item entrance effects beyond named effects, coordinating item wrapper with content animations.

**Pattern**:

```typescript
{
    key: '[ITEM_KEY]',
    trigger: 'viewProgress',
    effects: [
        {
            key: '[ITEM_KEY]',
            keyframeEffect: {
                name: '[UNIQUE_KEYFRAME_EFFECT_NAME]',
                keyframes: [
                    { [CSS_PROPERTY_1]: '[START_VALUE_1]', [CSS_PROPERTY_2]: '[START_VALUE_2]' },
                    { [CSS_PROPERTY_1]: '[MID_VALUE_1]' },
                    { [CSS_PROPERTY_1]: '[END_VALUE_1]', [CSS_PROPERTY_2]: '[END_VALUE_2]' }
                ]
            },
            rangeStart: { name: '[RANGE_TYPE]', offset: { unit: 'percentage', value: [START_PERCENTAGE] } },
            rangeEnd: { name: '[RANGE_TYPE]', offset: { unit: 'percentage', value: [END_PERCENTAGE] } },
            easing: '[EASING_FUNCTION]',
            fill: 'both',
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**: `[ITEM_KEY]`, `[EASING_FUNCTION]`. Other variables same as Rule 4.

**Example - Complex Item Entrance**:

```typescript
{
    key: 'timeline-item',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'timeline-item',
            keyframeEffect: {
                name: 'timeline-entrance',
                keyframes: [
                    { opacity: '0', transform: 'translateY(100px) scale(0.8) rotate(5deg)', filter: 'blur(10px)', boxShadow: '0 0 0 rgb(0 0 0 / 0)' },
                    { opacity: '0.5', transform: 'translateY(20px) scale(0.95) rotate(1deg)', filter: 'blur(2px)', boxShadow: '0 10px 20px rgb(0 0 0 / 0.1)' },
                    { opacity: '1', transform: 'translateY(0) scale(1) rotate(0deg)', filter: 'blur(0)', boxShadow: '0 20px 40px rgb(0 0 0 / 0.15)' }
                ]
            },
            rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 80 } },
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both',
            effectId: 'timeline-entrance'
        }
    ]
}
```

**Example - Item Exit Sequence**:

```typescript
{
    key: 'card-item',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'card-item',
            keyframeEffect: {
                name: 'card-exit-6',
                keyframes: [
                    { opacity: '1', transform: 'scale(1) rotate(0deg)', filter: 'brightness(1)' },
                    { opacity: '0.7', transform: 'scale(0.9) rotate(-2deg)', filter: 'brightness(0.8)' },
                    { opacity: '0', transform: 'scale(0.8) rotate(-5deg)', filter: 'brightness(0.6)' }
                ]
            },
            rangeStart: { name: 'exit', offset: { unit: 'percentage', value: 20 } },
            rangeEnd: { name: 'exit', offset: { unit: 'percentage', value: 100 } },
            easing: 'ease-in',
            fill: 'both',
            effectId: 'card-exit'
        }
    ]
}
```

---

## Rule 6: Staggered List Animations with Custom Timing

**Use Case**: Coordinated animations across list items; each item is the viewProgress trigger. Shared `effectId` in effects registry.

**When to Apply**: Wave-like propagation, linear/exponential stagger, reverse-order exit effects. Uses shared `effectId` in the effects registry so each item references the same effect.

**Pattern**:

```typescript
{
    effects: {
        [EFFECT_ID]: {
            [EFFECT_TYPE]: [EFFECT_DEFINITION],
            rangeStart: { name: '[RANGE_TYPE]', offset: { unit: 'percentage', value: [START_PERCENTAGE] } },
            rangeEnd: { name: '[RANGE_TYPE]', offset: { unit: 'percentage', value: [END_PERCENTAGE] } },
            easing: '[EASING_FUNCTION]'
        }
    },
    interactions: [
        {
            key: '[ITEM_KEY_N]',
            trigger: 'viewProgress',
            effects: [
                {
                    effectId: '[EFFECT_ID]'
                }
            ]
        },
        // ... repeat for each item
    ]
}
```

**Example - Linear Staggered Card Entrance**:

```typescript
{
    effects: {
        'card-entrance': {
            namedEffect: {
                type: 'SlideScroll'
            },
            rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 60 } },
            easing: 'linear'
        }
    },
    interactions: [
        {
            key: 'card-1',
            trigger: 'viewProgress',
            effects: [
                {
                    effectId: 'card-entrance'
                }
            ]
        },
        {
            key: 'card-2',
            trigger: 'viewProgress',
            effects: [
                {
                    effectId: 'card-entrance'
                }
            ]
        },
        {
            key: 'card-3',
            trigger: 'viewProgress',
            effects: [
                {
                    effectId: 'card-entrance'
                }
            ]
        },
    ]
}
```

**Example - Exponential Stagger for Dramatic Effect**:

```typescript
{
    effects: {
        'feature-entrance': {
            keyframeEffect: {
                name: 'feature-entrance',
                keyframes: [
                    { opacity: '0', transform: 'translateY(50px) scale(0.9)' },
                    { opacity: '1', transform: 'translateY(0) scale(1)' }
                ]
            },
            rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 100 } },
            easing: 'expoOut',
            fill: 'both'
        }
    },
    interactions: [
        { key: 'feature-1', trigger: 'viewProgress', effects: [{ effectId: 'feature-entrance' }] },
        { key: 'feature-2', trigger: 'viewProgress', effects: [{ effectId: 'feature-entrance' }] },
        { key: 'feature-3', trigger: 'viewProgress', effects: [{ effectId: 'feature-entrance' }] },
    ]
}
```

---

## Rule 7: Dynamic Content Animations with Custom Effects

**Use Case**: Per-item dynamic content via `customEffect` (counters, progress tracking, data visualization, dynamic text).

**When to Apply**: Scroll-driven counters, progress tracking, data visualization, dynamic text updates in list contexts.

**Pattern**:

```typescript
{
    key: '[LIST_CONTAINER_KEY]',
    trigger: 'viewProgress',
    effects: [
        {
            key: '[DYNAMIC_CONTENT_KEY]',
            customEffect: (element, progress) => {
                // progress is 0-1 representing scroll position within range
                [CUSTOM_CALCULATION_LOGIC]
                [DYNAMIC_CONTENT_UPDATE]
                [VISUAL_PROPERTY_UPDATES]
            },
            rangeStart: { name: '[RANGE_TYPE]', offset: { unit: 'percentage', value: [START_PERCENTAGE] } },
            rangeEnd: { name: '[RANGE_TYPE]', offset: { unit: 'percentage', value: [END_PERCENTAGE] } },
            fill: 'both',
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**: `[LIST_CONTAINER_KEY]` / `[DYNAMIC_CONTENT_KEY]` identify the list and target elements. The `customEffect` receives `(element, progress)` where progress is 0–1.

**Example - Scroll-Driven Counter in List**:

```typescript
{
    key: 'stats-list-container',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'stat-counter',
            customEffect: (element, progress) => {
                const targetValue = parseInt(element.dataset.targetValue) || 100;
                const currentValue = Math.floor(targetValue * progress);
                const percentage = Math.floor(progress * 100);

                // Update counter text
                element.textContent = currentValue.toLocaleString();

                // Update visual properties based on progress
                element.style.color = `hsl(${progress * 120}, 70%, 50%)`; // Green to red progression
                element.style.transform = `scale(${0.8 + progress * 0.2})`; // Subtle scale effect

                // Update progress bar if exists
                const progressBar = element.querySelector('.progress-bar');
                if (progressBar) {
                    progressBar.style.width = `${percentage}%`;
                }
            },
            rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'exit', offset: { unit: 'percentage', value: 100 } },
            fill: 'both',
            effectId: 'stats-counter'
        }
    ]
}
```

**Example - Interactive List Progress Tracking**:

```typescript
{
    key: 'task-list',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'task-item',
            customEffect: (element, progress) => {
                const items = element.closest('interact-element')?.querySelectorAll('.task-item') || [];
                const totalItems = items.length;
                const elementIndex = Array.from(items).indexOf(element);
                const itemStartProgress = elementIndex / totalItems;
                const itemEndProgress = (elementIndex + 1) / totalItems;
                let itemProgress = progress > itemStartProgress
                    ? Math.min(1, (progress - itemStartProgress) / (itemEndProgress - itemStartProgress))
                    : 0;

                const checkbox = element.querySelector('.task-checkbox');
                const taskText = element.querySelector('.task-text');
                if (itemProgress > 0.5) {
                    element.classList.add('active');
                    checkbox.style.transform = `scale(${0.8 + itemProgress * 0.4})`;
                    checkbox.style.opacity = itemProgress;
                }
                if (itemProgress > 0.8) {
                    element.classList.add('completed');
                    taskText.style.textDecoration = 'line-through';
                    taskText.style.opacity = '0.7';
                }
            },
            rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
            fill: 'both',
            effectId: 'task-progress'
        }
    ]
}
```

---

## Advanced Patterns and Combinations

### Multi-Layer List Coordination

Container, items, and content: use `cover` for background/foreground layers (full scroll range), `contain` for the sticky container layer (while stuck).

```typescript
{
    key: 'complex-list-section',
    trigger: 'viewProgress',
    effects: [
        { key: 'list-background', keyframeEffect: { name: 'bg-parallax', keyframes: [{ transform: 'scale(1.1)' }, { transform: 'scale(1) translateY(-50px)' }] }, rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } }, rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } }, easing: 'linear', fill: 'both' },
        { key: 'list-container', keyframeEffect: { name: 'container-slide', keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }] }, rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } }, rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 100 } }, easing: 'linear', fill: 'both' }
    ]
}
```

### Responsive List Animations

Condition IDs are user-defined strings declared in the top-level `conditions` map. Define separate interactions for the same `key` with different conditions and effects.

```typescript
{
    conditions: {
        'desktop-only':   { type: 'media', predicate: '(min-width: 768px)' },
        'prefers-motion': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
        'mobile-only':    { type: 'media', predicate: '(max-width: 767px)' },
    },
    interactions: [
        {
            key: 'list-item',
            trigger: 'viewProgress',
            conditions: ['desktop-only', 'prefers-motion'],
            effects: [
                {
                    key: 'list-item',
                    keyframeEffect: {
                        name: 'item-complex',
                        keyframes: [
                            { opacity: '0', transform: 'translateY(-20px) rotateY(5deg)' },
                            { opacity: '1', transform: 'translateY(0) rotateY(0deg)' }
                        ]
                    },
                    rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
                    rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 80 } },
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    fill: 'both'
                }
            ]
        },
        // Simplified fallback for mobile or reduced-motion users
        {
            key: 'list-item',
            trigger: 'viewProgress',
            conditions: ['mobile-only'],
            effects: [
                {
                    key: 'list-item',
                    keyframeEffect: {
                        name: 'item-simple',
                        keyframes: [
                            { opacity: '0', transform: 'translateY(30px)' },
                            { opacity: '1', transform: 'translateY(0)' }
                        ]
                    },
                    rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
                    rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 60 } },
                    easing: 'ease-out',
                    fill: 'both'
                }
            ]
        }
    ]
}
```

---

## Best Practices for List Scroll Animations

### List-Specific Guidelines

1. **Sticky hierarchy**: Container → items → content. Use `contain` range for sticky container effects (animations run while the element is stuck in position).
2. **Content coordination**: Use same timeline with `cover`/`contain` range and staggered offsets, or use a different timeline per item with same range and offsets.
3. **Use position:sticky**: Animate elements while they're stuck in position and not scrolling with the page.
4. **@wix/interact conditions**: Include `prefers-motion` in conditions for reduced-motion users (e.g. `conditions: ['prefers-motion']`).
