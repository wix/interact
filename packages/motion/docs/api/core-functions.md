# Core Functions

Complete reference for Wix Motion's primary animation creation and management functions.

## Overview

Wix Motion provides four core functions for creating and managing animations:

- **`getWebAnimation()`** - Create Web Animations API instances
- **`getScrubScene()`** - Generate scroll/pointer-driven scenes
- **`getCSSAnimation()`** - Generate CSS animation rules
- **`prepareAnimation()`** - Pre-calculate measurements where needed for CSS Animations

## getWebAnimation()

Creates Web Animations API instances for time-based and scrub-based animations.

### Signature

```typescript
function getWebAnimation(
  target: HTMLElement | string | null,
  animationOptions: TimeAnimationOptions | ScrubAnimationOptions,
  trigger?: Partial<TriggerVariant> & { element?: HTMLElement },
  options?: Record<string, any>,
  ownerDocument?: Document,
): AnimationGroup | MouseAnimationInstance;
```

### Parameters

#### `target` (required)

The element to animate. Can be:

- **HTMLElement** - Direct element reference
- **string** - Element ID or CSS selector
- **null** - For measurement-only operations

```typescript
// Direct element reference
const element = document.getElementById('myElement');
getWebAnimation(element, options);

// Element ID
getWebAnimation('myElement', options);

// CSS selector
getWebAnimation('.my-class', options);
```

#### `animationOptions` (required)

Animation configuration object. Must be either `TimeAnimationOptions` for time-based animations or `ScrubAnimationOptions` for scrub-based animations.

```typescript
// Time-based animation
const timeOptions: TimeAnimationOptions = {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 1000,
  easing: 'easeOut',
};

// Scrub-based animation
const scrubOptions: ScrubAnimationOptions = {
  type: 'ScrubAnimationOptions',
  namedEffect: { type: 'ParallaxScroll', speed: 0.5 },
  startOffset: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
  endOffset: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
};
```

#### `trigger` (optional)

Trigger configuration for scrub-based animations:

```typescript
// Scroll trigger
{
  trigger: 'view-progress',
    element: containerElement
}

// Mouse trigger
{
  trigger: 'pointer-move',
  element: containerElement
}
```

#### `options` (optional)

Additional configuration options:

```typescript
{
  effectId: 'custom-effect-id',
  measurementCallback: () => console.log('Measured!')
}
```

#### `ownerDocument` (optional)

Document context for the animation (defaults to `document`).

### Return Value

Returns either:

- **`AnimationGroup`** - For time-based animations and scroll animations
- **`MouseAnimationInstance`** - For mouse-driven animations

### Examples

#### Basic Entrance Animation

```typescript
import { getWebAnimation } from '@wix/motion';

const animation = getWebAnimation('#hero-title', {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'FadeIn',
  },
  duration: 800,
  easing: 'easeOut',
});

// Play the animation
await animation.play();
```

#### Scroll-Driven Animation

```typescript
const element = document.querySelector('#parallax-element');
const scrollAnimation = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ParallaxScroll',
      speed: 0.3,
    },
  },
  {
    trigger: 'view-progress',
    element,
  },
);

// Animation automatically responds to scroll
```

#### Mouse Interaction

```typescript
const mouseAnimation = getWebAnimation(
  '#interactive-card',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'Tilt3DMouse',
      angle: 15,
      perspective: 800,
    },
  },
  {
    trigger: 'pointer-move',
    element: document.querySelector('#card-container'),
  },
);

// Animation responds to mouse movement
```

#### Complex Multi-Effect Animation

```typescript
const multiAnimation = getWebAnimation(
  '#complex-element',
  {
    type: 'TimeAnimationOptions',
    namedEffect: {
      type: 'ArcIn',
      direction: 'bottom',
    },
    duration: 1200,
    delay: 300,
    easing: 'backOut',
  },
  undefined,
  {
    effectId: 'hero-entrance',
  },
);
```

## getScrubScene()

Creates scroll or pointer-driven scenes where polyfilling native timelines is necessary.

### Signature

```typescript
function getScrubScene(
  target: HTMLElement | string | null,
  animationOptions: ScrubAnimationOptions,
  trigger: Partial<TriggerVariant> & { element?: HTMLElement },
  sceneOptions?: Record<string, any>,
): ScrubScrollScene[] | ScrubPointerScene;
```

### Parameters

#### `target` (required)

Element to animate (same as `getWebAnimation`).

#### `animationOptions` (required)

Must be `ScrubAnimationOptions` configuration.

#### `trigger` (required)

Trigger configuration specifying how the animation responds:

```typescript
// Scroll trigger with viewport element
{
  trigger: 'view-progress',
  element: element,
  startOffset: { name: 'cover', offset: { value: 20, unit: 'percentage' } },
  endOffset: { name: 'exit', offset: { value: 0, unit: 'percentage' } }
}

// Pointer trigger with container
{
  trigger: 'pointer-move',
  element: containerElement
}
```

#### `sceneOptions` (optional)

Additional scene configuration:

```typescript
{
  groupId: 'scene-group-1',
  disabled: false,
  allowActiveEvent: true
}
```

### Return Value

Returns either:

- **`ScrubScrollScene[]`** - Array of scroll scenes
- **`ScrubPointerScene`** - Single pointer scene

### Examples

#### Parallax Scroll Scene

```typescript
import { getScrubScene } from '@wix/motion';

const element = document.querySelector('#sliding-image');
const scene = getScrubScene(
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
    element,
  },
);
```

#### Advanced Scroll Range Control

```typescript
const preciseScene = getScrubScene(
  '#text-reveal',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'RevealScroll',
      direction: 'bottom',
      range: 'in',
    },
    startOffset: {
      name: 'entry',
      offset: { value: 30, unit: 'percentage' },
    },
    endOffset: {
      name: 'cover',
      offset: { value: 70, unit: 'percentage' },
    },
  },
  {
    trigger: 'view-progress',
    element: document.querySelector('#content-section'),
  },
);
```

#### Mouse Scene with Transitions

```typescript
const mouseScene = getScrubScene(
  '#hover-element',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ScaleMouse',
      distance: { value: 100, unit: 'px' },
      scale: 1.1,
    },
    transitionDuration: 200,
    transitionEasing: 'easeOut',
  },
  {
    trigger: 'pointer-move',
    element: document.querySelector('#interaction-area'),
  },
);
```

## getCSSAnimation()

Generates CSS animation rules for stylesheet-based animations, optimized for performance.

### Signature

```typescript
function getCSSAnimation(
  target: string | null,
  animationOptions: AnimationOptions,
  trigger?: TriggerVariant,
): string;
```

### Parameters

#### `target` (required)

Element ID (string) or null. Unlike `getWebAnimation`, this only accepts string IDs since CSS rules target selectors.

#### `animationOptions` (required)

Animation configuration (same as `getWebAnimation`).

#### `trigger` (optional)

Trigger configuration for scrub-based animations.

### Return Value

Returns a **string** containing CSS rules that can be inserted into a stylesheet.

### Examples

#### Basic CSS Animation

```typescript
import { getCSSAnimation } from '@wix/motion';

const cssRules = getCSSAnimation('myElement', {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 1000,
  easing: 'ease-out'
});

// Insert into a stylesheet
const sheet = new CSSStyleSheet();
style.insertRule(cssRules);
document.adoptedStyleSheets.push(sheet);

// OR render to a style tag on server-side using plain strings
<sytle>`${cssRules}`</style>

// OR render to a style tag on server-side using a framework (e.g. React)
<style>{cssRules}</style>
```

## prepareAnimation()

Pre-calculates measurements and prepares elements for using CSS Animations where additionl measurements are necessary.

### Signature

```typescript
function prepareAnimation(
  target: HTMLElement | string | null,
  animation: AnimationOptions,
  callback?: () => void,
): void;
```

### Parameters

#### `target` (required)

Element to prepare (same as `getWebAnimation`).

#### `animation` (required)

Animation configuration to prepare for.

#### `callback` (optional)

Function called when preparation is complete.

### Examples

#### Basic Preparation

```typescript
import { prepareAnimation, getElementCSSAnimation } from '@wix/motion';

// Prepare element before animating
prepareAnimation(
  '#complex-element',
  {
    type: 'TimeAnimationOptions',
    namedEffect: {
      type: 'ArcIn',
      direction: 'bottom',
    },
  },
  () => {
    console.log('Element prepared for animation');

    // Now create the animation
    const animation = getElementCSSAnimation('#complex-element', animationOptions);
    animation.play();
  },
);
```

#### Batch Preparation for Multiple Elements

```typescript
const elements = document.querySelectorAll('.animate-on-scroll');
const preparations = elements.map((element) => {
  return new Promise((resolve) => {
    prepareAnimation(
      element,
      {
        type: 'ScrubAnimationOptions',
        namedEffect: {
          type: 'RevealScroll',
          direction: 'bottom',
        },
      },
      resolve,
    );
  });
});

// Wait for all preparations to complete
Promise.all(preparations).then(() => {
  // Create animations after all measurements are done
  elements.forEach((element) => {
    getScrubScene(element, animationOptions, trigger);
  });
});
```

#### Performance-Critical Preparation

```typescript
// Prepare during idle time
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    prepareAnimation('#hero-element', heroAnimationConfig, () => {
      // Ready to animate when needed
    });
  });
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(() => {
    prepareAnimation('#hero-element', heroAnimationConfig);
  }, 0);
}
```

## Common Patterns and Best Practices

### Animation Lifecycle Management

```typescript
class AnimationManager {
  private animations: Map<string, AnimationGroup> = new Map();

  createAnimation(id: string, element: HTMLElement, options: TimeAnimationOptions) {
    // Clean up existing animation
    this.destroyAnimation(id);

    // Prepare element
    prepareAnimation(element, options, () => {
      // Create new animation
      const animation = getWebAnimation(element, options);
      this.animations.set(id, animation);
    });
  }

  async playAnimation(id: string) {
    const animation = this.animations.get(id);
    if (animation) {
      await animation.play();
    }
  }

  destroyAnimation(id: string) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.cancel();
      this.animations.delete(id);
    }
  }

  destroyAll() {
    this.animations.forEach((animation) => animation.cancel());
    this.animations.clear();
  }
}
```

### Responsive Animation Creation

```typescript
function createResponsiveAnimation(element: HTMLElement) {
  const isMobile = window.innerWidth < 768;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let options: TimeAnimationOptions;

  if (prefersReducedMotion) {
    // Minimal animation for accessibility
    options = {
      type: 'TimeAnimationOptions',
      namedEffect: { type: 'FadeIn' },
      duration: 200,
    };
  } else if (isMobile) {
    // Lighter animation for mobile
    options = {
      type: 'TimeAnimationOptions',
      namedEffect: { type: 'SlideIn', direction: 'bottom' },
      duration: 600,
    };
  } else {
    // Full animation for desktop
    options = {
      type: 'TimeAnimationOptions',
      namedEffect: { type: 'ArcIn', direction: 'bottom' },
      duration: 1000,
      easing: 'backOut',
    };
  }

  return getWebAnimation(element, options);
}
```

## Performance Considerations

### Function Selection Guidelines

- **Use `getWebAnimation()`** for:
  - Interactive animations requiring control
  - Complex timing sequences
  - Dynamic parameter changes
  - Event-driven animations
  - When server-side rendering is not available

- **Use `getCSSAnimation()`** for:
  - Simple, fire-and-forget animations
  - Mobile-first applications
  - Animations that run during page load
  - Performance-critical scenarios
  - When server-side rendering is available for a more performent usage

- **Use `getScrubScene()`** for:
  - Controling pointer-driven animations
  - Polyfilling ViewTimelines for scroll animations
  - Custom effects driven by scroll or pointer movement

- **Use `prepareAnimation()`** for:
  - Preparing CSS animations requiring measurements which are not possible via CSS

### Memory Management

```typescript
// Always clean up animations when done
class ComponentWithAnimations {
  private animations: AnimationGroup[] = [];

  createAnimations() {
    this.animations.push(getWebAnimation(this.element, options));
  }

  destroy() {
    // Clean up all animations
    this.animations.forEach((animation) => {
      animation.cancel();
    });
    this.animations = [];
  }
}
```

---

**Next**: Explore the [AnimationGroup API](animation-group.md) for advanced animation control, or check out [Type Definitions](types.md) for complete TypeScript reference.
