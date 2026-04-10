# ViewProgress Trigger Rules for @wix/interact

## Core Concept

`viewProgress` triggers create scroll-driven animations that update continuously as elements move through the viewport, leveraging native CSS ViewTimelines. Use when animation progress should be tied to the element's scroll position.

## Config Template

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'viewProgress',
    conditions: ['[CONDITION_NAME]'],  // optional: e.g. 'prefers-motion', 'desktop-only'
    effects: [
        {
            key: '[TARGET_KEY]',
            // Effect block — use exactly one of: namedEffect | keyframeEffect | customEffect
            namedEffect: { type: '[NAMED_EFFECT]', /* preset-specific options only if documented */ },  // OR
            keyframeEffect: { name: '[EFFECT_NAME]', keyframes: [EFFECT_KEYFRAMES] },  // OR
            customEffect: (element, progress) => { [CUSTOM_LOGIC] },
            rangeStart: { name: '[RANGE_NAME]', offset: { unit: 'percentage', value: [START_PERCENTAGE] } },
            rangeEnd: { name: '[RANGE_NAME]', offset: { unit: 'percentage', value: [END_PERCENTAGE] } },
            easing: '[EASING_FUNCTION]',
            fill: '[FILL_MODE]',
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

## Variable Key

| Placeholder          | Valid Values / Notes                                                                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[SOURCE_KEY]`       | Unique identifier for element that tracks scroll progress                                                                                                                                           |
| `[TARGET_KEY]`       | Unique identifier for element to animate (can equal source)                                                                                                                                         |
| `[NAMED_EFFECT]`     | Preset from @wix/motion-presets (see Named Scroll Effects below). Some presets accept options (e.g. `direction`) — only use options you have documentation for; omit and rely on defaults otherwise |
| `[EFFECT_NAME]`      | Unique name for keyframe effect                                                                                                                                                                     |
| `[EFFECT_KEYFRAMES]` | Array of keyframe objects, e.g. `[{ opacity: '0' }, { opacity: '1' }]`                                                                                                                              |
| `[CUSTOM_LOGIC]`     | JS: `progress` is 0–1 within range; mutate `element.style` or DOM                                                                                                                                   |
| `[RANGE_NAME]`       | 'cover', 'contain', 'entry', 'exit', 'entry-crossing', 'exit-crossing'                                                                                                                              |
| `[START_PERCENTAGE]` | 0–100                                                                                                                                                                                               |
| `[END_PERCENTAGE]`   | 0–100                                                                                                                                                                                               |
| `[EASING_FUNCTION]`  | 'linear', 'ease-in', 'ease-out', 'ease-in-out', or cubic-bezier string                                                                                                                              |
| `[FILL_MODE]`        | 'both', 'backwards', 'forwards', 'none'                                                                                                                                                             |
| `[UNIQUE_EFFECT_ID]` | Optional unique identifier                                                                                                                                                                          |
| `[CONDITION_NAME]`   | User-defined condition ID declared in the top-level `conditions` map (e.g. `'prefers-motion'`, `'desktop-only'`)                                                                                    |

**Offset semantics:** Positive offset values move the effective range forward along the scroll axis. 0 = start of range, 100 = end.

## Effect Type Selection

| Scenario                                                      | Effect Type      | Notes                             |
| ------------------------------------------------------------- | ---------------- | --------------------------------- |
| Parallax, scroll-responsive decorations, floating elements    | `namedEffect`    | Use presets; fastest to implement |
| Custom multi-property animations, brand-specific reveals      | `keyframeEffect` | Full control over CSS keyframes   |
| Dynamic content (counters, text reveal, canvas, calculations) | `customEffect`   | JS callback; `progress` 0–1       |

## Range Reference

| Intent                                  | rangeStart.name | rangeEnd.name | Typical Offsets        |
| --------------------------------------- | --------------- | ------------- | ---------------------- |
| Parallax / continuous while visible     | cover           | cover         | 0–100                  |
| Entry animation (element entering view) | entry           | entry         | 0–30 start, 70–100 end |
| Exit animation (element leaving view)   | exit            | exit          | 0–30 start, 70–100 end |
| Cross-range (entry to exit)             | entry           | exit          | 0–100                  |
| Contained phase                         | contain         | contain       | 0–100                  |

## Named Scroll Effects

From `@wix/motion-presets` scroll animations: ParallaxScroll, MoveScroll, FadeScroll, RevealScroll, GrowScroll, SlideScroll, SpinScroll, PanScroll, BlurScroll, ArcScroll, FlipScroll, Spin3dScroll, TiltScroll, TurnScroll, ShapeScroll, ShuttersScroll, ShrinkScroll, SkewPanScroll, StretchScroll.

## Examples

### Example 1: Named Effect (Parallax)

```typescript
{
    key: 'hero-section',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'hero-background',
            namedEffect: {
                type: 'ParallaxScroll'
            },
            rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
            easing: 'linear'
        }
    ]
}
```

### Example 2: Keyframe Effect (Custom Animation)

```typescript
{
    key: 'card-section',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'product-card',
            keyframeEffect: {
                name: 'card-entrance',
                keyframes: [
                    { opacity: '0', transform: 'translateY(80px) scale(0.9)', filter: 'blur(5px)' },
                    { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0)' }
                ]
            },
            rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 70 } },
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both'
        }
    ]
}
```

### Example 3: Custom Effect (Dynamic Content)

```typescript
{
    key: 'text-section',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'animated-text',
            customEffect: (element, progress) => {
                const text = element.dataset.fullText || element.textContent;
                const visibleLength = Math.floor(text.length * progress);
                const visibleText = text.substring(0, visibleLength);
                element.textContent = visibleText + (progress < 1 ? '|' : '');

                element.style.opacity = Math.min(1, progress * 2);
                element.style.transform = `translateY(${(1 - progress) * 30}px)`;
            },
            rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 80 } },
            fill: 'both',
            effectId: 'text-reveal'
        }
    ]
}
```

### Example 4: Multi-Range (Entry + Exit on the same element)

Animating the same element in on scroll entry and out on scroll exit requires two separate effects within the same interaction — one scoped to the `entry` range, one to `exit`. This pattern is non-obvious because both effects share the same `key` but have different ranges.

```typescript
{
    key: 'feature-card',
    trigger: 'viewProgress',
    effects: [
        // Animate IN as element enters viewport
        {
            key: 'feature-card',
            keyframeEffect: {
                name: 'card-in',
                keyframes: [
                    { opacity: '0', transform: 'translateY(40px)' },
                    { opacity: '1', transform: 'translateY(0)' }
                ]
            },
            rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 60 } },
            easing: 'ease-out',
            fill: 'both'
        },
        // Animate OUT as element exits viewport
        {
            key: 'feature-card',
            keyframeEffect: {
                name: 'card-out',
                keyframes: [
                    { opacity: '1', transform: 'translateY(0)' },
                    { opacity: '0', transform: 'translateY(-40px)' }
                ]
            },
            rangeStart: { name: 'exit', offset: { unit: 'percentage', value: 40 } },
            rangeEnd: { name: 'exit', offset: { unit: 'percentage', value: 100 } },
            easing: 'ease-in',
            fill: 'both'
        }
    ]
}
```

## Advanced Patterns

### Multi-Range ViewProgress Effects

Combining different ranges for complex scroll animations:

```typescript
{
    key: 'complex-section',
    trigger: 'viewProgress',
    effects: [
        // Entry phase
        {
            key: 'section-content',
            keyframeEffect: {
                name: 'content-entrance',
                keyframes: [
                    { opacity: '0', transform: 'translateY(50px)' },
                    { opacity: '1', transform: 'translateY(0)' }
                ]
            },
            rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 50 } },
            easing: 'ease-out',
            fill: 'backwards'
        },
        // Cover phase
        {
            key: 'background-element',
            keyframeEffect: {
                name: 'background-parallax-hue',
                keyframes: [
                    { transform: 'translateY(0)', filter: 'hue-rotate(0deg)' },
                    { transform: 'translateY(-100px)', filter: 'hue-rotate(180deg)' }
                ]
            },
            rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
            easing: 'linear',
            fill: 'both'
        },
        // Exit phase
        {
            key: 'section-content',
            keyframeEffect: {
                name: 'content-exit',
                keyframes: [
                    { opacity: '1', transform: 'scale(1)' },
                    { opacity: '0', transform: 'scale(0.8)' }
                ]
            },
            rangeStart: { name: 'exit', offset: { unit: 'percentage', value: 50 } },
            rangeEnd: { name: 'exit', offset: { unit: 'percentage', value: 100 } },
            easing: 'ease-in',
            fill: 'forwards'
        }
    ]
}
```

### ViewProgress with Conditional Behavior

Use interact `conditions` for responsive scroll animations and `prefers-reduced-motion`. Condition IDs are user-defined strings — they must be declared in the top-level `conditions` map before being referenced in an interaction.

```typescript
{
    conditions: {
        'desktop-only':   { type: 'media', predicate: '(min-width: 768px)' },
        'prefers-motion': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
        'mobile-only':    { type: 'media', predicate: '(max-width: 767px)' },
    },
    interactions: [
        {
            key: 'responsive-parallax',
            trigger: 'viewProgress',
            conditions: ['desktop-only', 'prefers-motion'],
            effects: [
                {
                    key: 'parallax-bg',
                    keyframeEffect: {
                        name: 'parallax-bg',
                        keyframes: [
                            { transform: 'translateY(0)' },
                            { transform: 'translateY(-300px)' }
                        ]
                    },
                    rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
                    rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
                    easing: 'linear',
                    fill: 'both'
                }
            ]
        },
        // Simplified fallback for mobile
        {
            key: 'responsive-parallax',
            trigger: 'viewProgress',
            conditions: ['mobile-only'],
            effects: [
                {
                    key: 'parallax-bg',
                    keyframeEffect: {
                        name: 'fade-out-bg',
                        keyframes: [
                            { opacity: '1' },
                            { opacity: '0.7' }
                        ]
                    },
                    rangeStart: { name: 'exit', offset: { unit: 'percentage', value: 0 } },
                    rangeEnd: { name: 'exit', offset: { unit: 'percentage', value: 100 } },
                    easing: 'linear',
                    fill: 'both'
                }
            ]
        }
    ]
}
```

### Multiple Element Coordination

Orchestrating multiple elements with viewProgress:

```typescript
{
    key: 'orchestrated-section',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'bg-layer-1',
            keyframeEffect: {
                name: 'layer-1-parallax',
                keyframes: [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-50px)' }
                ]
            },
            rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
            easing: 'linear',
            fill: 'both'
        },
        {
            key: 'bg-layer-2',
            keyframeEffect: {
                name: 'layer-2-parallax',
                keyframes: [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-100px)' }
                ]
            },
            rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
            easing: 'linear',
            fill: 'both'
        },
        {
            key: 'fg-content',
            keyframeEffect: {
                name: 'layer-3-parallax',
                keyframes: [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-150px)' }
                ]
            },
            rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
            easing: 'linear',
            fill: 'both'
        }
    ]
}
```

## Best Practices

### Interact-Specific

1. **Respect `prefers-reduced-motion`** via interact `conditions`: use `'prefers-motion'` so scroll animations run only when the user has not requested reduced motion.
2. **Use `linear` easing** for most scroll effects; non-linear easing can feel jarring as scroll position changes.
3. **Range configuration:** Verify source element remains visible throughout the scroll range. If the source is hidden or in a frozen stacking context, the ViewTimeline constraint may not update correctly.
4. **Avoid overlapping ranges** on the same target to prevent conflicting animations.
5. **Entry/exit timing:** Use 0–50% cover or 0–100% entry for entrances; 50–100% cover or 0–100% exit for exits. Start with broad ranges (0–100) then refine.
6. **customEffect:** Use `element.closest('interact-element')` when querying related DOM within the callback; target elements must exist when the effect runs.

### Troubleshooting

- **Unexpected behavior:** Check range names match intent; verify source visibility; ensure target elements exist.
- **Janky custom effects:** Simplify calculations; avoid layout-triggering reads in the callback.
