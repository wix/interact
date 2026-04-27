# Getting Started with Wix Motion

Welcome to Wix Motion! This guide will get you up and running with your first animation in under 10 minutes.

## Prerequisites

- Node.js 16+ and npm/yarn
- Basic knowledge of JavaScript/TypeScript
- A web project with DOM access

## Installation

### Option 1: NPM/Yarn

```bash
npm install @wix/motion
# or
yarn add @wix/motion
```

### Option 2: Script Tag (for quick prototyping)

```html
<script type="module">
  import { getWebAnimation } from 'https://unpkg.com/@wix/motion@latest/dist/esm/index.js';
</script>
```

### Installing Animation Presets

`@wix/motion` provides core animation utilities and an effects registry, while `@wix/motion-presets` provides ready-to-use effect modules you can register and reference via `namedEffect`.

```bash
npm install @wix/motion-presets
```

Before using named effects like `FadeIn`, you need to register the presets:

```typescript
import { registerEffects } from '@wix/motion';
import { FadeIn } from '@wix/motion-presets';

// Register preset
registerEffects({ FadeIn });
```

You can also register a custom-made effect module (as long as it matches the expected module shape):

```typescript
import { registerEffects } from '@wix/motion';

registerEffects({
  CustomFadeIn: {
    web: (options) => [
      { ...options, name: 'CustomFadeIn', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
    ],
    getNames: () => ['CustomFadeIn'],
    style: (options) => [
      { ...options, name: 'CustomFadeIn', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
    ],
  },
});
```

## Your First Animation

Let's create a simple fade-in animation for an element:

### 1. HTML Setup

```html
<div id="myElement">Hello, Motion!</div>
<button id="animateBtn">Animate!</button>
```

### 2. JavaScript Implementation

```typescript
import { getWebAnimation } from '@wix/motion';

// Get the element to animate
const element = document.getElementById('myElement');
const button = document.getElementById('animateBtn');

// Create the animation
const fadeInAnimation = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 1000,
  easing: 'easeOutCubic',
});

// Play animation on button click
button.addEventListener('click', async () => {
  await fadeInAnimation.play();
  console.log('Animation completed!');
});
```

🎉 **That's it!** You've created your first Wix Motion animation.

## Understanding the Code

Let's break down what happened:

### 1. `getWebAnimation()` Function

This is the main function for creating time-based animations using the Web Animations API.

```typescript
getWebAnimation(
  target,           // DOM element to animate
  animationOptions, // Configuration object
  trigger?,         // Optional trigger settings
  options?          // Additional options
)
```

### 2. Animation Options Object

```typescript
{
  type: 'TimeAnimationOptions',  // Animation type
  namedEffect: { type: 'FadeIn' }, // Preset animation
  duration: 1000,                // Duration in milliseconds
  easing: 'easeOutCubic'         // Easing function
}
```

### 3. Named Effects

Instead of defining keyframes manually, you use predefined animation presets:

- `FadeIn` - Simple opacity transition
- `SlideIn` - Slide from a direction
- `BounceIn` - Spring-based entrance
- [See all presets →](categories/README.md)

## Try More Animations

### Slide In Animation

```typescript
const slideAnimation = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'SlideIn',
    direction: 'left',
  },
  duration: 800,
});
```

### Bounce In Animation

```typescript
const bounceAnimation = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'BounceIn',
    direction: 'bottom',
  },
  duration: 1200,
});
```

### Spin Animation (Ongoing)

```typescript
const spinAnimation = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Spin',
    direction: 'clockwise',
  },
  duration: 2000,
  iterations: Infinity, // Loop forever
});
```

## Scroll-Driven Animations

For animations that respond to scroll position:

```typescript
import { getScrubScene } from '@wix/motion';

const scrollAnimation = getScrubScene(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ParallaxScroll',
      speed: 0.5,
    },
  },
  {
    trigger: 'view-progress',
    element: document.body, // Scroll container
  },
);
```

## Animation Control

All animations return an `AnimationGroup` with control methods:

```typescript
const animation = getWebAnimation(element, options);

// Control playback
await animation.play();
animation.pause();
animation.cancel();

// Set playback rate
animation.setPlaybackRate(2); // 2x speed

// Set progress manually (0-1)
animation.progress(0.5); // 50% complete

// Listen for completion
animation.onFinish(() => {
  console.log('Animation finished!');
});

// Check current state
console.log(animation.playState); // 'running', 'paused', 'finished'
```

## CSS Integration

Wix Motion can also generate CSS animations for better performance in some scenarios:

```typescript
import { getCSSAnimation } from '@wix/motion';

const cssAnimations = getCSSAnimation('myElementId', {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 1000,
});

// Apply to stylesheet
cssAnimations.forEach(({ target, animation, keyframes }) => {
  // Insert CSS rules for the animation
});
```

## TypeScript Support

Wix Motion is built with TypeScript and provides excellent IntelliSense:

```typescript
import type { TimeAnimationOptions, EntranceAnimation, AnimationGroup } from '@wix/motion';

// Type-safe animation options
const options: TimeAnimationOptions = {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' } as EntranceAnimation,
  duration: 1000,
};

// Typed return value
const animation: AnimationGroup = getWebAnimation(element, options);
```

## Common Patterns

### Sequential Animations

```typescript
async function sequentialAnimations() {
  await fadeInAnimation.play();
  await slideAnimation.play();
  await bounceAnimation.play();
}
```

### Parallel Animations

```typescript
async function parallelAnimations() {
  await Promise.all([fadeInAnimation.play(), slideAnimation.play(), bounceAnimation.play()]);
}
```

### Animation Chaining

```typescript
fadeInAnimation
  .play()
  .then(() => slideAnimation.play())
  .then(() => bounceAnimation.play());
```

## Performance Tips

1. **Prepare animations** for better performance:

```typescript
import { prepareAnimation } from '@wix/motion';

prepareAnimation(element, animationOptions);
```

2. **Use appropriate animation types**:
   - `TimeAnimationOptions` for time-based animations
   - `ScrubAnimationOptions` for scroll/mouse-driven animations

3. **Prefer CSS animations** for simple effects on mobile devices

## Next Steps

Now that you've created your first animation, explore more:

- **[Core Concepts](core-concepts.md)** - Understand the animation system architecture
- **[Animation Categories](categories/)** - Discover all 82+ animation presets
- **[API Reference](api/)** - Deep dive into all available functions
- **[Advanced Patterns](guides/advanced-patterns.md)** - Learn performance optimization and complex scenarios

## Troubleshooting

### Animation Not Playing?

- Check that the element exists in the DOM
- Ensure the element is visible (not `display: none`)
- Verify animation options are correctly formatted

### Performance Issues?

- Consider CSS animations for simple effects
- Avoid creating animations in tight loops

### TypeScript Errors?

- Ensure you're importing types correctly
- Check that animation options match the expected interface

---

**Ready for more?** Check out our [interactive playground](../playground/) to experiment with all animations in real-time!
