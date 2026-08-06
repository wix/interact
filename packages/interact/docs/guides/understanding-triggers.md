# Understanding Triggers

Triggers are the heart of `@wix/interact` - they define when an interaction should start. This guide covers all 9 trigger types and how to use them effectively.

## Overview of Trigger Types

| Trigger        | Description                                         | Use Cases                         |
| -------------- | --------------------------------------------------- | --------------------------------- |
| `hover`        | Mouse enter/leave events                            | Button highlights, image overlays |
| `click`        | Mouse click events                                  | Toggles, state changes, menus     |
| `interest`     | Accessibility-friendly hover (focus events)         |
| `activate`     | Accessibility-friendly click (keyboard Enter/Space) |
| `viewEnter`    | Element enters viewport                             | Entrance animations, lazy loading |
| `animationEnd` | Previous animation completes                        | Animation sequences, chaining     |
| `viewProgress` | Scroll progress through element                     | Parallax, progress bars           |
| `pointerMove`  | Mouse movement over element                         | Interactive cards, 3D effects     |

## 1. Hover Trigger

The `hover` trigger responds to mouse enter and leave events.

### Basic Usage

```typescript
{
    key: 'my-button',
    trigger: 'hover',
    effects: [
        {
            keyframeEffect: {
                name: 'scale',
                keyframes: [
                    { scale: 2 }
                ]
            },
            duration: 200
        }
    ]
}
```

### Advanced Options

```typescript
{
    key: 'my-card',
    trigger: 'hover',
    effects: [
        {
            keyframeEffect: {
                name: 'shadow',
                keyframes: [
                    { transform: 'scale(1)', boxShadow: 'none' },
                    { transform: 'scale(1.05)', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }
                ]
            },
            duration: 300,
            easing: 'ease-out'
        }
    ]
}
```

### Hover Behavior Types

Set `triggerType` on each time-based effect (defaults shown below):

- **`alternate`** (default): Plays forward on enter, reverses on leave
- **`repeat`**: Restarts animation each time
- **`once`**: Only plays once, then stops
- **`state`**: Pauses/resumes on hover

### Real-World Example: Image Overlay

```typescript
{
    key: 'image-card',
    trigger: 'hover',
    effects: [
        {
            key: 'image-overlay',
            keyframeEffect: {
                name: 'slide-hover',
                keyframes: [
                    { opacity: '0', transform: 'translateY(20px)' },
                    { opacity: '1', transform: 'translateY(0)' }
                ]
            },
            duration: 250,
            easing: 'ease-out'
        }
    ]
}
```

## 2. Click Trigger

The `click` trigger responds to mouse click events and supports multiple behavior modes.

### Basic Usage

```typescript
{
    key: 'toggle-button',
    trigger: 'click',
    effects: [
        {
            key: 'sidebar',
            keyframeEffect: {
                name: 'sidebar-toggle',
                keyframes: [
                    { transform: 'translateX(-100%)' },
                    { transform: 'translateX(0)' }
                ]
            },
            duration: 300
        }
    ]
}
```

### Click Behavior Types

```typescript
{
    key: 'accordion-header',
    trigger: 'click',
    effects: [
        {
            key: 'accordion-content',
            keyframeEffect: {
                name: 'accordion',
                keyframes: [
                    { clipPath: 'inset(0 0 100% 0)', translate: '0 -100%' },
                    { clipPath: 'inset(0 0 0 0)', translate: '0 0' }
                ]
            },
            duration: 400
        }
    ]
}
```

- **`alternate`** (default): First click plays forward, subsequent click reverses
- **`repeat`**: Each click restarts the animation
- **`once`**: Only responds to the first click
- **`state`**: First click plays, subsequent clicks pause/resume

Configure these via `triggerType` on each time-based effect.

### Real-World Example: Menu Toggle

```typescript
{
    key: 'menu-button',
    trigger: 'click',
    effects: [
        {
            key: 'menu-icon',
            keyframeEffect: {
                name: 'spin',
                keyframes: [
                    { transform: 'rotate(0deg)' },
                    { transform: 'rotate(45deg)' }
                ]
            },
            duration: 200,
            effectId: 'menu-icon-rotate'
        },
        {
            key: 'mobile-menu',
            keyframeEffect: {
                name: 'slide',
                keyframes: [
                    { opacity: '0', transform: 'translateX(100%)' },
                    { opacity: '1', transform: 'translateX(0)' }
                ]
            },
            duration: 300,
            delay: 100
        }
    ]
}
```

## 3. Interest Trigger

The `interest` trigger is an accessibility-friendly version of `hover` that responds to both mouse hover and keyboard focus events. This makes interactions accessible to keyboard users and screen reader users.

### Basic Usage

```typescript
{
    key: 'my-button',
    trigger: 'interest',
    effects: [
        {
            keyframeEffect: {
                name: 'scale',
                keyframes: [
                    { scale: 2 }
                ]
            },
            duration: 200
        }
    ]
}
```

### How It Works

- **Mouse users**: Triggers on `mouseenter` and `mouseleave` events (same as `hover`)
- **Keyboard users**: Triggers on `focusin` and `focusout` events
- Automatically sets `tabIndex={0}` on the element to make it keyboard-focusable

## 4. Activate Trigger

The `activate` trigger is an accessibility-friendly version of `click` that responds to both mouse clicks and keyboard activation (Enter/Space keys). This makes click interactions accessible to keyboard users.

### Basic Usage

```typescript
{
    key: 'toggle-button',
    trigger: 'activate',
    effects: [
        {
            key: 'sidebar',
            keyframeEffect: {
                name: 'sidebar-toggle',
                keyframes: [
                    { transform: 'translateX(-100%)' },
                    { transform: 'translateX(0)' }
                ]
            },
            duration: 300
        }
    ]
}
```

### How It Works

- **Mouse users**: Triggers on `click` events (same as `click`)
- **Keyboard users**: Triggers on `keydown` events for Enter and Space keys
- Automatically sets `tabIndex={0}` on the element to make it keyboard-focusable

## 5. ViewEnter Trigger

The `viewEnter` trigger uses Intersection Observer to detect when elements enter the viewport.

### Basic Usage

```typescript
{
    key: 'section-title',
    trigger: 'viewEnter',
    effects: [
        {
            key: 'section-title',
            namedEffect: 'FadeIn',
            duration: 800
        }
    ]
}
```

### Advanced Configuration

```typescript
{
    key: 'hero-image',
    trigger: 'viewEnter',
    params: {
        threshold: 0.5,      // 0-1, how much of element must be visible
        inset: '-50px'        // Margin around viewport
    },
    effects: [
        {
            key: 'hero-image',
            keyframeEffect: {
                name: 'slide-in',
                keyframes: [
                    { opacity: '0', transform: 'translateY(50px)' },
                    { opacity: '1', transform: 'translateY(0)' }
                ]
            },
            duration: 1000,
            easing: 'ease-out'
        }
    ]
}
```

### ViewEnter Behavior Types

Set `triggerType` on each time-based effect (defaults shown below). `params` only holds Intersection Observer options (`threshold`, `inset`, etc.).

- **`once`** (default, recommended): Triggers only when element first enters viewport
- **`repeat`**: Triggers every time element enters viewport
- **`alternate`**: Plays forward on enter, reverses on exit
- **`state`**: Plays on enter, pauses on exit

### Real-World Example: Staggered Card Animation

```typescript
// Configure multiple cards with delays
const cardAnimations = [
  {
    key: 'card-1',
    trigger: 'viewEnter',
    params: { threshold: 0.3 },
    effects: [
      {
        key: 'card-1',
        keyframeEffect: {
          name: 'slide-up',
          keyframes: [
            { opacity: '0', transform: 'translateY(30px)' },
            { opacity: '1', transform: 'translateY(0)' },
          ],
        },
        duration: 600,
        delay: 0,
        easing: 'ease-out',
      },
    ],
  },
  {
    key: 'card-2',
    trigger: 'viewEnter',
    params: { threshold: 0.3 },
    effects: [
      {
        key: 'card-2',
        keyframeEffect: {
          name: 'slide-up',
          keyframes: [
            { opacity: '0', transform: 'translateY(30px)' },
            { opacity: '1', transform: 'translateY(0)' },
          ],
        },
        duration: 600,
        delay: 100,
        easing: 'ease-out',
      },
    ],
  },
];
```

## 6. ViewProgress Trigger

The `viewProgress` trigger creates scroll-driven animations as elements move through the viewport.

### Basic Usage

```typescript
{
    key: 'parallax-element',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'parallax-element',
            keyframeEffect: {
                name: 'parallax',
                keyframes: [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-100px)' }
                ]
            }
            // Note: viewProgress uses ranges, not duration
        }
    ]
}
```

### Advanced Parallax Effect

```typescript
{
    key: 'hero-section',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'background-image',
            keyframeEffect: {
                name: 'grayscale',
                keyframes: [
                    { filter: 'grayscale(0)' },
                    { filter: 'grayscale(100%)' }
                ]
            },
            rangeStart: { name: 'exit', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'exit', offset: { unit: 'percentage', value: 100 } }
        },
        {
            key: 'foreground-text',
            keyframeEffect: {
                name: 'fade-zoom',
                keyframes: [
                    { opacity: '1', transform: 'scale(1)' },
                    { opacity: '0', transform: 'scale(0.8)' }
                ]
            },
            rangeStart: { name: 'exit', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'exit', offset: { unit: 'percentage', value: 100 } }
        }
    ]
}
```

### Real-World Example: Reading Progress Bar

```typescript
{
    key: 'article-content',
    trigger: 'viewProgress',
    effects: [
        {
            key: 'progress-bar',
            keyframeEffect: {
                name: 'progress-animation',
                keyframes: [
                    { transform: 'scaleX(0)' },
                    { transform: 'scaleX(1)' }
                ]
            },
            rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } }
        }
    ]
}
```

## 7. PointerMove Trigger

The `pointerMove` trigger creates mouse-following effects and 3D interactions.

### Basic Usage

```typescript
{
    key: 'interactive-card',
    trigger: 'pointerMove',
    effects: [
        {
            key: 'interactive-card',
            keyframeEffect: {
                name: 'tilt-card',
                keyframes: [
                    { transform: 'perspective(800px) rotateX(40deg) rotateY(-40deg)' },
                    { transform: 'perspective(800px) rotateX(-40deg) rotateY(40deg)' }
                ]
            }
        }
    ]
}
```

### Advanced Configuration

```typescript
{
    key: 'card-section',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self',  // 'self' | 'root'
        axis: 'y'         // 'x' | 'y' – scrub axis (default 'y')
    },
    effects: [
        {
            key: 'tilt-card',
            keyframeEffect: {
                name: 'tilt-card',
                keyframes: [
                    { transform: 'perspective(800px) rotateX(40deg) rotateY(-40deg)' },
                    { transform: 'perspective(800px) rotateX(-40deg) rotateY(40deg)' }
                ]
            },
            centeredToTarget: true // will place 50% point at center of animation target
        }
    ]
}
```

### Real-World Example: 3D Product Card

```typescript
{
    key: 'product-card',
    trigger: 'pointerMove',
    params: { hitArea: 'self' },
    effects: [
        {
            key: 'tilt-card',
            keyframeEffect: {
                name: 'tilt-card',
                keyframes: [
                    { transform: 'perspective(800px) rotateX(40deg) rotateY(-40deg)' },
                    { transform: 'perspective(800px) rotateX(-40deg) rotateY(40deg)' }
                ]
            },
            centeredToTarget: true // will place 50% point at center of animation target
        }
    ]
}
```

## 8. AnimationEnd Trigger

The `animationEnd` trigger allows you to chain animations by waiting for a previous animation to complete.

### Basic Usage

```typescript
// First animation
{
    key: 'sequence-start',
    trigger: 'click',
    effects: [
        {
            key: 'first-element',
            namedEffect: {
                type: 'FadeIn'
            },
            duration: 500,
            effectId: 'fade-in-first'  // Required for chaining
        }
    ]
},
// Chained animation
{
    key: 'first-element',
    trigger: 'animationEnd',
    params: {
        effectId: 'fade-in-first'  // Must match the effectId above
    },
    effects: [
        {
            key: 'second-element',
            namedEffect: {
                type: 'SlideIn'
            },
            duration: 500,
            effectId: 'slide-in-second'
        }
    ]
}
```

### Real-World Example: Loading Sequence

```typescript
const loadingSequence = [
  {
    key: 'app-logo',
    trigger: 'viewEnter',
    effects: [
      {
        key: 'app-logo',
        namedEffect: {
          type: 'FadeIn',
        },
        duration: 800,
        effectId: 'logo-appear',
      },
    ],
  },
  {
    key: 'app-logo',
    trigger: 'animationEnd',
    params: { effectId: 'logo-appear' },
    effects: [
      {
        key: 'loading-text',
        keyframeEffect: {
          name: 'slide-up',
          keyframes: [
            { opacity: '0', transform: 'translateY(20px)' },
            { opacity: '1', transform: 'translateY(0)' },
          ],
        },
        duration: 600,
        easing: 'ease-out',
        effectId: 'text-appear',
      },
    ],
  },
  {
    key: 'loading-text',
    trigger: 'animationEnd',
    params: { effectId: 'text-appear' },
    effects: [
      {
        key: 'main-content',
        namedEffect: {
          type: 'FadeIn',
        },
        duration: 1000,
      },
    ],
  },
];
```

## Combining Triggers

You can combine multiple triggers on the same element for complex interactions:

```typescript
{
  interactions: [
    // Entrance animation
    {
      key: 'interactive-card',
      trigger: 'viewEnter',
      effects: [
        {
          key: 'interactive-card',
          namedEffect: {
            type: 'FadeIn',
          },
          duration: 800,
        },
      ],
    },
    // Hover effect
    {
      key: 'interactive-card',
      trigger: 'hover',
      effects: [
        {
          key: 'interactive-card',
          keyframeEffect: {
            name: 'shadow',
            keyframes: [
              { transform: 'scale(1)', boxShadow: 'none' },
              { transform: 'scale(1.02)', boxShadow: '0 20px 40px rgba(0 0 0 / 0.1)' },
            ],
          },
          duration: 200,
          easing: 'ease-out',
        },
      ],
    },
    // Click action
    {
      key: '#interactive-card',
      trigger: 'click',
      effects: [
        {
          key: 'card-details',
          keyframeEffect: {
            name: 'slide-down',
            keyframes: [
              { opacity: '0', transform: 'translateY(-20px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 400,
          easing: 'ease-out',
        },
      ],
    },
  ];
}
```

## Best Practices

### Performance

1. **Prefer animating hardware-accelerated properties**, i.e. transforms, opacity, and filters
2. **Avoid animating layout properties**, these are the most costly properties to animate
3. **Avoid animating custom properties**, since changing them via animation causes a style recalculation

### User Experience

1. **Keep hover animations short** (200-300ms) for responsiveness
2. **Use meaningful delays** in animation sequences
3. **Provide visual feedback** for click interactions
4. **Set appropriate thresholds** for `viewEnter` to avoid premature triggers

### Accessibility

1. **`prefers-reduced-motion` is handled for you** — Interact detects it and collapses time effects, drops state-transition tweens, and cancels `viewProgress`/`pointerMove`. Add a gated alternative only for a specific calmer look, or when a cancelled scrub would leave the element hidden. See [Reduced Motion](conditions-and-media-queries.md#reduced-motion)
2. **Use `activate` instead of `click`** for keyboard accessibility
3. **Use `interest` instead of `hover`** for keyboard accessibility
4. **Ensure click targets are accessible** via keyboard
5. **Don't rely solely on motion** for important information
6. **Enable accessibility triggers globally** using `Interact.setup({ allowA11yTriggers: true })` to make `click` and `hover` triggers keyboard-accessible

## Troubleshooting

### Common Issues

**Trigger not firing:**

- Check element exists when `Interact.create()` is called
- Verify `data-interact-key` matches your CSS selector
- Ensure element is actually visible for viewport triggers

**Animation not smooth:**

- Use `transform` and `opacity` properties
- Avoid animating layout properties like `width`/`height`
- Check for conflicting CSS transitions

**ViewEnter not triggering**

- Since entrance animations use `IntersectionObserver`, if the source element is clipped out, e.g: by a parent's `overflow`, or `clip-path`, or if it's pushed out of the viewport it may never trigger.
  To avoid this either **use a separate target element form the source element, or avoid transforms/clip-path/mask at 0% progress**

**ViewEnter triggering multiple times**

- From same reasons as above, **Use `once` for `viewEnter` triggers**, if the source element is also the target element, since it may re-trigger animations multiple times when animating.

**ViewEnter triggering too early/late:**

- Adjust `threshold` and `inset` parameters
- Test on different screen sizes
- Consider content loading delays

## Next Steps

Now that you understand all trigger types, explore:

- **[Effects and Animations](./effects-and-animations.md)** - Learn about animation options
- **[Configuration Structure](./configuration-structure.md)** - Organize complex interactions
- **[State Management](./state-management.md)** - Advanced state handling techniques
