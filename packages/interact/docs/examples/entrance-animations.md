# Entrance Animations

Entrance animations bring elements to life as they enter the viewport. This guide covers all the essential patterns using the `viewEnter` trigger.

## Table of Contents

- [Basic Fade Animations](#basic-fade-animations)
- [Slide Animations](#slide-animations)
- [Scale Animations](#scale-animations)
- [Rotate Animations](#rotate-animations)
- [Combined Effects](#combined-effects)
- [Sequential Animations](#sequential-animations)
- [Real-World Examples](#real-world-examples)

## Basic Fade Animations

### Simple Fade In

The most basic entrance - element fades from invisible to visible.

```typescript
import { Interact } from '@wix/interact/web';

const config = {
  interactions: [
    {
      key: 'content',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          key: 'content',
          keyframeEffect: {
            name: 'fade-in',
            keyframes: [{ opacity: '0' }, { opacity: '1' }],
          },
          duration: 800,
          easing: 'ease-out',
        },
      ],
    },
  ],
};

Interact.create(config);
```

```html
<interact-element data-interact-key="content">
  <section class="hero">
    <h1>Welcome to Our Site</h1>
    <p>This content fades in smoothly</p>
  </section>
</interact-element>
```

### Fade In with Delay

Add a delay for dramatic timing.

```typescript
{
    key: 'delayed-content',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'delayed-content',
        keyframeEffect: {
            name: 'delayed-fade',
            keyframes: [
                { opacity: '0' },
                { opacity: '1' }
            ]
        },
        duration: 1000,
        delay: 500,  // Wait 500ms before starting
        easing: 'ease-out'
    }]
}
```

### Repeating Fade

Trigger animation every time element enters viewport.

```typescript
{
    key: 'repeating-element',
    trigger: 'viewEnter',
    params: { threshold: 0.3 },
    effects: [{
        key: 'repeating-element',
        triggerType: 'repeat',
        keyframeEffect: {
            name: 'repeat-fade',
            keyframes: [
                { opacity: '0' },
                { opacity: '1' }
            ]
        },
        duration: 600,
        easing: 'ease-out'
    }]
}
```

## Slide Animations

### Slide Up

Element slides up from below while fading in.

```typescript
{
    key: 'slide-up',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'slide-up',
        keyframeEffect: {
            name: 'slide-from-bottom',
            keyframes: [
                { opacity: '0', transform: 'translateY(40px)' },
                { opacity: '1', transform: 'translateY(0)' }
            ]
        },
        duration: 800,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'  // Smooth ease-out
    }]
}
```

### Slide Down

Element slides down from above.

```typescript
{
    key: 'slide-down',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'slide-down',
        keyframeEffect: {
            name: 'slide-from-top',
            keyframes: [
                { opacity: '0', transform: 'translateY(-40px)' },
                { opacity: '1', transform: 'translateY(0)' }
            ]
        },
        duration: 800,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    }]
}
```

### Slide From Left

Element slides in from the left side.

```typescript
{
    key: 'slide-left',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'slide-left',
        keyframeEffect: {
            name: 'slide-from-left',
            keyframes: [
                { opacity: '0', transform: 'translateX(-60px)' },
                { opacity: '1', transform: 'translateX(0)' }
            ]
        },
        duration: 700,
        easing: 'ease-out'
    }]
}
```

### Slide From Right

Element slides in from the right side.

```typescript
{
    key: 'slide-right',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'slide-right',
        keyframeEffect: {
            name: 'slide-from-right',
            keyframes: [
                { opacity: '0', transform: 'translateX(60px)' },
                { opacity: '1', transform: 'translateX(0)' }
            ]
        },
        duration: 700,
        easing: 'ease-out'
    }]
}
```

## Scale Animations

### Scale Up

Element grows from small to full size.

```typescript
{
    key: 'scale-up',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'scale-up',
        keyframeEffect: {
            name: 'grow',
            keyframes: [
                { opacity: '0', transform: 'scale(0.7)' },
                { opacity: '1', transform: 'scale(1)' }
            ]
        },
        duration: 800,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'  // Elastic effect
    }]
}
```

### Scale Down

Element shrinks from large to normal size.

```typescript
{
    key: 'scale-down',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'scale-down',
        keyframeEffect: {
            name: 'shrink',
            keyframes: [
                { opacity: '0', transform: 'scale(1.3)' },
                { opacity: '1', transform: 'scale(1)' }
            ]
        },
        duration: 800,
        easing: 'ease-out'
    }]
}
```

### Bounce Scale

Element bounces into view with elastic scaling.

```typescript
{
    key: 'bounce-in',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'bounce-in',
        keyframeEffect: {
            name: 'bounce-scale',
            keyframes: [
                { opacity: '0', transform: 'scale(0.3)' },
                { opacity: '1', transform: 'scale(1.05)' },
                { transform: 'scale(0.95)' },
                { transform: 'scale(1)' }
            ]
        },
        duration: 900,
        easing: 'ease-out'
    }]
}
```

## Rotate Animations

### Rotate In

Element rotates as it enters.

```typescript
{
    key: 'rotate-in',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'rotate-in',
        keyframeEffect: {
            name: 'spin-in',
            keyframes: [
                { opacity: '0', transform: 'rotate(-180deg) scale(0.5)' },
                { opacity: '1', transform: 'rotate(0deg) scale(1)' }
            ]
        },
        duration: 900,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    }]
}
```

### Flip In

Element flips on the Y-axis.

```typescript
{
    key: 'flip-in',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'flip-in',
        keyframeEffect: {
            name: 'flip-y',
            keyframes: [
                { opacity: '0', transform: 'perspective(400px) rotateY(-90deg)' },
                { opacity: '1', transform: 'perspective(400px) rotateY(0deg)' }
            ]
        },
        duration: 800,
        easing: 'ease-out'
    }]
}
```

### 3D Rotate

Element rotates in 3D space.

```typescript
{
    key: 'rotate-3d',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'rotate-3d',
        keyframeEffect: {
            name: 'rotate-3d',
            keyframes: [
                {
                    opacity: '0',
                    transform: 'perspective(600px) rotateX(-90deg) translateY(50px)'
                },
                {
                    opacity: '1',
                    transform: 'perspective(600px) rotateX(0deg) translateY(0)'
                }
            ]
        },
        duration: 1000,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    }]
}
```

## Combined Effects

### Fade + Slide + Scale

Combine multiple transformations for rich effects.

```typescript
{
    key: 'combo',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'combo',
        keyframeEffect: {
            name: 'fade-slide-scale',
            keyframes: [
                {
                    opacity: '0',
                    transform: 'translateY(40px) scale(0.9)'
                },
                {
                    opacity: '1',
                    transform: 'translateY(0) scale(1)'
                }
            ]
        },
        duration: 800,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    }]
}
```

### Blur to Focus

Element transitions from blurred to sharp.

```typescript
{
    key: 'blur-focus',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'blur-focus',
        keyframeEffect: {
            name: 'blur-reveal',
            keyframes: [
                {
                    opacity: '0',
                    filter: 'blur(20px)',
                    transform: 'translateY(20px) scale(1.05)'
                },
                {
                    opacity: '1',
                    filter: 'blur(0)',
                    transform: 'translateY(0) scale(1)'
                }
            ]
        },
        duration: 1000,
        easing: 'ease-out'
    }]
}
```

### Slide + Rotate

Element slides and rotates simultaneously.

```typescript
{
    key: 'slide-rotate',
    trigger: 'viewEnter',
    params: { threshold: 0.2 },
    effects: [{
        key: 'slide-rotate',
        keyframeEffect: {
            name: 'slide-spin',
            keyframes: [
                {
                    opacity: '0',
                    transform: 'translateX(-50px) rotate(-15deg)'
                },
                {
                    opacity: '1',
                    transform: 'translateX(0) rotate(0deg)'
                }
            ]
        },
        duration: 900,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    }]
}
```

## Sequential Animations

### Multi-Element Sequence

Animate multiple elements in sequence.

```typescript
const config = {
  interactions: [
    // First element
    {
      key: 'hero-title',
      trigger: 'viewEnter',
      params: { threshold: 0.3 },
      effects: [
        {
          key: 'hero-title',
          keyframeEffect: {
            name: 'title-enter',
            keyframes: [
              { opacity: '0', transform: 'translateY(30px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 800,
          delay: 0,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          effectId: 'title-animation',
        },
      ],
    },
    // Second element - triggered after first completes
    {
      key: 'hero-title',
      trigger: 'animationEnd',
      params: { effectId: 'title-animation' },
      effects: [
        {
          key: 'hero-subtitle',
          keyframeEffect: {
            name: 'subtitle-enter',
            keyframes: [
              { opacity: '0', transform: 'translateY(20px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 600,
          easing: 'ease-out',
          effectId: 'subtitle-animation',
        },
      ],
    },
    // Third element
    {
      key: 'hero-subtitle',
      trigger: 'animationEnd',
      params: { effectId: 'subtitle-animation' },
      effects: [
        {
          key: 'hero-button',
          keyframeEffect: {
            name: 'button-enter',
            keyframes: [
              { opacity: '0', transform: 'scale(0.8)' },
              { opacity: '1', transform: 'scale(1)' },
            ],
          },
          duration: 500,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="hero-title">
  <h1>Welcome</h1>
</interact-element>

<interact-element data-interact-key="hero-subtitle">
  <p>Your journey starts here</p>
</interact-element>

<interact-element data-interact-key="hero-button">
  <button>Get Started</button>
</interact-element>
```

### Parallel with Delays

Multiple elements animate with staggered delays.

```typescript
const config = {
  interactions: [
    {
      key: 'feature-1',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          key: 'feature-1',
          keyframeEffect: {
            name: 'feature-fade',
            keyframes: [
              { opacity: '0', transform: 'translateY(30px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 700,
          delay: 0,
          easing: 'ease-out',
        },
      ],
    },
    {
      key: 'feature-2',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          key: 'feature-2',
          keyframeEffect: {
            name: 'feature-fade',
            keyframes: [
              { opacity: '0', transform: 'translateY(30px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 700,
          delay: 150, // Delayed start
          easing: 'ease-out',
        },
      ],
    },
    {
      key: 'feature-3',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          key: 'feature-3',
          keyframeEffect: {
            name: 'feature-fade',
            keyframes: [
              { opacity: '0', transform: 'translateY(30px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 700,
          delay: 300, // More delayed
          easing: 'ease-out',
        },
      ],
    },
  ],
};
```

## Real-World Examples

### Hero Section

Complete hero with multiple animated elements.

```typescript
const heroConfig = {
  interactions: [
    // Background image
    {
      key: 'hero-bg',
      trigger: 'viewEnter',
      params: { threshold: 0.1 },
      effects: [
        {
          key: 'hero-bg',
          keyframeEffect: {
            name: 'bg-reveal',
            keyframes: [
              { opacity: '0', transform: 'scale(1.1)' },
              { opacity: '1', transform: 'scale(1)' },
            ],
          },
          duration: 1200,
          easing: 'ease-out',
        },
      ],
    },
    // Title
    {
      key: 'hero-content',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          key: 'hero-title',
          selector: '.hero-title',
          keyframeEffect: {
            name: 'title-reveal',
            keyframes: [
              { opacity: '0', transform: 'translateY(40px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 900,
          delay: 300,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
      ],
    },
    // Subtitle
    {
      key: 'hero-content',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          key: 'hero-content',
          selector: '.hero-subtitle',
          keyframeEffect: {
            name: 'subtitle-reveal',
            keyframes: [
              { opacity: '0', transform: 'translateY(30px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 800,
          delay: 600,
          easing: 'ease-out',
        },
      ],
    },
    // CTA Button
    {
      key: 'hero-content',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          key: 'hero-content',
          selector: '.hero-cta',
          keyframeEffect: {
            name: 'cta-reveal',
            keyframes: [
              { opacity: '0', transform: 'scale(0.8)' },
              { opacity: '1', transform: 'scale(1)' },
            ],
          },
          duration: 600,
          delay: 900,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="hero-bg">
  <div class="hero-background">
    <img src="hero-bg.jpg" alt="Hero Background" />
  </div>
</interact-element>

<interact-element data-interact-key="hero-content">
  <div class="hero-content">
    <h1 class="hero-title">Transform Your Business</h1>
    <p class="hero-subtitle">Innovative solutions for modern challenges</p>
    <button class="hero-cta">Get Started Today</button>
  </div>
</interact-element>
```

### Feature Cards Grid

Grid of feature cards with staggered entrance.

```typescript
const featureConfig = {
  interactions: [
    {
      key: 'features',
      listContainer: '.feature-grid',
      trigger: 'viewEnter',
      params: { threshold: 0.15 },
      effects: [
        {
          key: 'features',
          listContainer: '.feature-grid',
          keyframeEffect: {
            name: 'card-entrance',
            keyframes: [
              {
                opacity: '0',
                transform: 'translateY(50px) scale(0.9)',
              },
              {
                opacity: '1',
                transform: 'translateY(0) scale(1)',
              },
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

```html
<interact-element data-interact-key="features">
  <div class="feature-grid">
    <div class="feature-card">
      <h3>Fast Performance</h3>
      <p>Lightning-fast load times</p>
    </div>
    <div class="feature-card">
      <h3>Secure</h3>
      <p>Enterprise-grade security</p>
    </div>
    <div class="feature-card">
      <h3>Scalable</h3>
      <p>Grows with your business</p>
    </div>
  </div>
</interact-element>
```

```css
.feature-grid > *:nth-child(1) {
  animation-delay: 0ms;
}
.feature-grid > *:nth-child(2) {
  animation-delay: 150ms;
}
.feature-grid > *:nth-child(3) {
  animation-delay: 300ms;
}
```

### Testimonials Section

Testimonials that fade and slide in sequence.

```typescript
const testimonialConfig = {
  interactions: [
    {
      key: 'testimonials',
      listContainer: '.testimonial-list',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          key: 'testimonials',
          listContainer: '.testimonial-list',
          keyframeEffect: {
            name: 'testimonial-reveal',
            keyframes: [
              {
                opacity: '0',
                transform: 'translateX(-30px)',
                filter: 'blur(10px)',
              },
              {
                opacity: '1',
                transform: 'translateX(0)',
                filter: 'blur(0)',
              },
            ],
          },
          duration: 900,
          easing: 'ease-out',
        },
      ],
    },
  ],
};
```

```css
.testimonial-list > *:nth-child(1) {
  animation-delay: 0ms;
}
.testimonial-list > *:nth-child(2) {
  animation-delay: 200ms;
}
.testimonial-list > *:nth-child(3) {
  animation-delay: 400ms;
}
```

## Preventing Flash of Unstyled Content (FOUC)

When using entrance animations, elements may briefly appear before their animation starts (a "flash"). The `generate()` function produces complete CSS for all interactions in your config — including `@keyframes`, animation properties, scroll-driven timelines, and more. For `viewEnter` + `triggerType: 'once'` effects where source and target are the same element, it also emits FOUC-prevention rules that hide the element until its animation starts.

> **Note**: `generate()` is not limited to FOUC prevention — it generates CSS for every interaction in the config. See the [generate() function documentation](../api/functions.md#generate) for the full scope.

### Server-Side Setup

For the best experience, generate the CSS on the server and include it in the initial HTML `<head>`:

```typescript
// server.ts or build script
import { generate } from '@wix/interact';

const config = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          keyframeEffect: {
            name: 'fade-in',
            keyframes: [
              { opacity: '0', transform: 'translateY(40px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 800,
        },
      ],
    },
  ],
  effects: {},
};

// Generate CSS at build time or on server
const css = generate(config);

// Include in your HTML template
const html = `
<!DOCTYPE html>
<html>
<head>
    <style>${css}</style>
</head>
<body>
    <interact-element data-interact-key="hero">
        <section class="hero">
            <h1>Welcome to Our Site</h1>
            <p>This content fades in smoothly without flash</p>
        </section>
    </interact-element>
    <script type="module" src="./main.js"></script>
</body>
</html>
`;
```

### HTML Markup

Wrap entrance content in `<interact-element>` (or set `data-interact-key` on the element directly) and inject the `generate()` CSS in `<head>`:

```html
<interact-element data-interact-key="hero">
  <section class="hero">
    <h1>Welcome to Our Site</h1>
    <p>This content fades in smoothly without flash</p>
  </section>
</interact-element>
```

### Why generate()?

Beyond FOUC prevention, `generate()` produces all CSS needed for your animations — `@keyframes`, animation custom properties, scroll-driven timelines, state-effect rules, and more. Because the CSS uses attribute selectors (`[data-interact-key="..."]`), animations bind reactively as elements appear in the DOM. No DOM element references, no lifecycle management, no stale-reference bugs.

See the [generate() function documentation](../api/functions.md#generate) for the full scope, benefits, and examples.

---

## Best Practices

### Timing Guidelines

- **Quick feedback**: 150-300ms for hover/click responses
- **Standard entrance**: 600-800ms for most content
- **Hero sections**: 1000-1200ms for dramatic effect
- **Avoid**: Animations longer than 1500ms

### Easing Functions

- **Ease-out**: Best for entrances (starts fast, ends slow)

  ```typescript
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)';
  ```

- **Elastic**: For playful, bouncy effects

  ```typescript
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  ```

- **Linear**: For continuous motion (avoid for entrances)
  ```typescript
  easing: 'linear';
  ```

### Threshold Values

- `0.1` - Trigger early, good for large elements
- `0.2` - Standard threshold for most content
- `0.3` - More conservative, element well into view
- `0.5` - Element mostly visible before triggering

### Performance Tips

✅ **Do:**

- Use `transform` and `opacity`
- Keep durations under 1000ms
- Use `threshold` to control when animations fire
- Test on mobile devices

❌ **Avoid:**

- Animating `width`, `height`, `top`, `left`
- Too many simultaneous animations

## See Also

- [Scroll Animations](./scroll-animations.md) - Progress-based effects
- [List Patterns](./list-patterns.md) - Animating multiple items
- [Understanding Triggers](../guides/understanding-triggers.md) - Deep dive on viewEnter
- [Effects and Animations](../guides/effects-and-animations.md) - Effect types reference
