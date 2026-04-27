# Scroll Animations

Scroll-driven effects that respond to viewport position for immersive storytelling and progressive disclosure. Perfect for creating engaging scroll experiences with parallax, reveals, and synchronized motion.

## Overview

Scroll animations are **scrub-based** animations that respond to scroll position using the ViewTimeline API or scroll event listeners. They create smooth, synchronized effects tied to the user's scroll progress, enabling immersive storytelling and progressive content reveals.

### Key Characteristics

- **Purpose**: Storytelling, parallax, progressive disclosure
- **Trigger**: Scroll position and viewport intersection
- **Duration**: Based on scroll distance, not time
- **Target**: Content blocks, media, layout elements
- **State**: Progress-driven (0-100% based on scroll)

## Animation Categories

### 📐 **Transform-Based**

Position, scale, and rotation effects synchronized to scroll.

### 🎭 **Opacity & Visibility**

Fade and reveal effects triggered by scroll position.

### 📺 **3D Perspective**

Complex 3D transformations with depth and perspective.

### ✂️ **Clip & Shape**

Creative reveals using clip-path and shape morphing.

### 🎢 **Specialized Motion**

Complex movement patterns and specialized scroll behaviors.

## Complete Preset Reference

| Animation          | Category  | Complexity | Range Support | Directions | Description                 |
| ------------------ | --------- | ---------- | ------------- | ---------- | --------------------------- |
| **ParallaxScroll** | Transform | Simple     | ✓             | -          | Classic parallax movement   |
| **FadeScroll**     | Opacity   | Simple     | ✓             | -          | Opacity changes on scroll   |
| **MoveScroll**     | Transform | Medium     | ✓             | 360°       | Directional movement        |
| **GrowScroll**     | Transform | Medium     | ✓             | 9-way      | Scale from specific origins |
| **ShrinkScroll**   | Transform | Medium     | ✓             | 9-way      | Scale shrinking effects     |
| **RevealScroll**   | Clip      | Medium     | ✓             | 4-way      | Clean clip-path reveals     |
| **SlideScroll**    | Transform | Medium     | ✓             | 4-way      | Sliding movement effects    |
| **BlurScroll**     | Filter    | Simple     | ✓             | -          | Blur-to-focus transitions   |
| **ArcScroll**      | 3D        | Complex    | ✓             | 2-way      | Curved 3D motion paths      |
| **FlipScroll**     | 3D        | Medium     | ✓             | 2-way      | 3D flip rotations           |
| **SpinScroll**     | Transform | Medium     | ✓             | 2-way      | Rotation with scaling       |
| **Spin3dScroll**   | 3D        | Complex    | ✓             | -          | 3D rotation with depth      |
| **TiltScroll**     | 3D        | Complex    | ✓             | 2-way      | Perspective tilting effects |
| **TurnScroll**     | 3D        | Complex    | ✓             | 2-way      | Complex 3D turning          |
| **PanScroll**      | Transform | Medium     | ✓             | 2-way      | Horizontal panning motion   |
| **SkewPanScroll**  | Transform | Medium     | ✓             | 2-way      | Skewed panning effects      |
| **StretchScroll**  | Transform | Medium     | ✓             | -          | Vertical stretching effects |
| **ShapeScroll**    | Clip      | Complex    | ✓             | 5 shapes   | Morphing shape reveals      |
| **ShuttersScroll** | Clip      | Complex    | ✓             | 4-way      | Multi-segment reveals       |

## Configuration Patterns

### Basic Scroll Animation

```typescript
const scene = getScrubScene(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: { type: 'ParallaxScroll', speed: 0.5 },
    startOffset: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
    endOffset: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
  },
  {
    trigger: 'view-progress',
    element: document.body,
  },
);
```

### Range Control

Most scroll animations support range modifiers:

```typescript
// In - Animation plays as element enters viewport
{ type: 'FadeScroll', range: 'in' }

// Out - Animation plays as element exits viewport
{ type: 'FadeScroll', range: 'out' }

// Continuous - Animation spans full scroll interaction
{ type: 'FadeScroll', range: 'continuous' }
```

### Speed and Intensity

Fine-tune animation responsiveness:

```typescript
// Parallax speed (0.1 = slow, 1.0 = normal, 2.0 = fast)
{ type: 'ParallaxScroll', speed: 0.3 }

// Movement distance
{
  type: 'MoveScroll',
  distance: { value: 200, unit: 'px' },
  angle: 45
}

// Scale amount
{ type: 'GrowScroll', scale: 1.5 }
```

### Directional Controls

```typescript
// Four directions
{ type: 'RevealScroll', direction: 'left' | 'right' | 'top' | 'bottom' }

// Nine positions (includes corners + center)
{ type: 'GrowScroll', direction: 'top-left' | 'center' | 'bottom-right' }

// Angle-based (0° = up, 90° = right, etc.)
{ type: 'MoveScroll', angle: 225 }

// Axis selection
{ type: 'ArcScroll', direction: 'vertical' | 'horizontal' }
```

## Detailed Animation Guides

### 📐 Transform-Based

#### ParallaxScroll

**Best for**: Background elements, hero sections, layered content

```typescript
{
  type: 'ParallaxScroll',
  speed: 0.5,        // Movement speed relative to scroll
  range: 'continuous' // Full scroll interaction
}
// Element moves at 50% of scroll speed for smooth parallax
```

#### MoveScroll

**Best for**: Directional reveals, dynamic positioning

```typescript
{
  type: 'MoveScroll',
  angle: 225,                              // Movement direction (degrees)
  distance: { value: 300, unit: 'px' },   // Movement amount
  range: 'in'                             // Animation timing
}
// Moves element along specified angle and distance
```

#### GrowScroll / ShrinkScroll

**Best for**: Scale-based reveals, size transitions

```typescript
{
  type: 'GrowScroll',
  direction: 'center',     // Scale origin point
  scale: 1.8,             // Target scale value
  range: 'in',            // When to animate
  speed: 0.5              // Y-axis travel amount
}
// Scales element from/to specified size with optional Y movement
```

#### SlideScroll

**Best for**: Content blocks, panel reveals

```typescript
{
  type: 'SlideScroll',
  direction: 'left',       // Slide direction
  range: 'in'             // Animation timing
}
// Slides element from specified direction
```

### 🎭 Opacity & Visibility

#### FadeScroll

**Best for**: Simple reveals, content blocks, images

```typescript
{
  type: 'FadeScroll',
  range: 'in',            // Fade timing
  opacity: 0.8            // Target opacity value
}
// Simple opacity transition based on scroll position
```

#### BlurScroll

**Best for**: Focus transitions, image reveals, depth effects

```typescript
{
  type: 'BlurScroll',
  blur: 20,               // Blur amount in pixels
  range: 'in'            // Animation timing
}
// Blur-to-focus or focus-to-blur transition
```

### 📺 3D Perspective

#### ArcScroll

**Best for**: Hero content, featured elements, dramatic reveals

```typescript
{
  type: 'ArcScroll',
  direction: 'horizontal', // 'horizontal' | 'vertical'
  range: 'in'             // Animation timing
}
// 3D curved motion with perspective transformation
```

#### FlipScroll

**Best for**: Cards, panels, interactive elements

```typescript
{
  type: 'FlipScroll',
  direction: 'vertical',   // Flip axis
  rotate: 180,            // Rotation amount (degrees)
  range: 'in'            // Animation timing
}
// 3D flip rotation effect
```

#### TiltScroll

**Best for**: Interactive cards, 3D UI elements

```typescript
{
  type: 'TiltScroll',
  direction: 'left',       // Tilt direction
  distance: 15,           // Tilt angle
  range: 'continuous'     // Animation timing
}
// Perspective-based tilting with Y-axis movement
```

#### Spin3dScroll

**Best for**: Loading states, decorative elements, logos

```typescript
{
  type: 'Spin3dScroll',
  rotate: 360,            // Rotation amount
  range: 'continuous',    // Animation timing
  speed: 0.8             // Additional Y movement
}
// 3D rotation with depth and optional translation
```

### ✂️ Clip & Shape Effects

#### RevealScroll

**Best for**: Content blocks, images, text reveals

```typescript
{
  type: 'RevealScroll',
  direction: 'right',      // Reveal direction
  range: 'in'             // Animation timing
}
// Clean directional reveal using clip-path
```

#### ShapeScroll

**Best for**: Creative reveals, artistic elements, featured content

```typescript
{
  type: 'ShapeScroll',
  shape: 'circle',        // 'circle', 'rectangle', 'diamond', 'ellipse', 'window'
  range: 'in',            // Animation timing
  intensity: 1.2          // Scale multiplier
}
// Morphing shape-based reveals
```

#### ShuttersScroll

**Best for**: Dynamic reveals, segmented content, galleries

```typescript
{
  type: 'ShuttersScroll',
  direction: 'right',      // Shutter direction
  shutters: 8,            // Number of segments
  staggered: true,        // Offset timing
  range: 'in'            // Animation timing
}
// Multi-segment shutter reveal effect
```

### 🎢 Specialized Motion

#### PanScroll / SkewPanScroll

**Best for**: Wide content, horizontal scrolling sections

```typescript
{
  type: 'PanScroll',
  direction: 'left',                       // Pan direction
  distance: { value: 100, unit: 'px' },   // Pan amount
  startFromOffScreen: false,              // Start position
  range: 'continuous'                     // Animation timing
}

{
  type: 'SkewPanScroll',
  direction: 'right',      // Pan + skew direction
  skew: 15,               // Skew angle
  range: 'continuous'     // Animation timing
}
```

#### StretchScroll

**Best for**: Elastic elements, rubber-band effects

```typescript
{
  type: 'StretchScroll',
  stretch: 1.3,           // Stretch amount
  range: 'in'            // Animation timing
}
// Vertical stretching with elastic feel
```

#### TurnScroll

**Best for**: Complex 3D interactions, showcase elements

```typescript
{
  type: 'TurnScroll',
  direction: 'left',       // Turn direction
  spin: 'clockwise',      // Rotation direction
  scale: 1.2,             // Scale during turn
  range: 'continuous'     // Animation timing
}
// Complex 3D turning with scale and translation
```

## Viewport and Offset Control

### Intersection Ranges

```typescript
// Named viewport ranges
startOffset: { name: 'cover' }      // Element covers viewport
startOffset: { name: 'contain' }    // Element contained in viewport
startOffset: { name: 'entry' }      // Element entering viewport
startOffset: { name: 'exit' }       // Element leaving viewport

// With percentage offsets
startOffset: {
  name: 'cover',
  offset: { value: 20, unit: 'percentage' }
}

// With pixel offsets
endOffset: {
  name: 'exit',
  offset: { value: 100, unit: 'px' }
}
```

### Custom Scroll Ranges

```typescript
// Start animation when element is 20% visible
const scene = getScrubScene(element, animationOptions, {
  trigger: 'view-progress',
  startOffset: {
    name: 'entry',
    offset: { value: 20, unit: 'percentage' },
  },
  endOffset: {
    name: 'exit',
    offset: { value: 0, unit: 'percentage' },
  },
});
```

## Performance Optimization

### ViewTimeline API Usage

```typescript
// Automatic detection and fallback
if (window.ViewTimeline) {
  // Use native ViewTimeline for best performance
  const animation = getWebAnimation(element, options, trigger);
} else {
  // use a polyfill library
  // Consider lighter animations for this case
  const scene = getScrubScene(element, options, trigger);
}
```

### Efficient Scroll Animations

```typescript
// Use transform-only properties for best performance
const efficientAnimations = [
  'ParallaxScroll', // transform: translateY
  'MoveScroll', // transform: translate
  'SpinScroll', // transform: rotate + scale
  'FadeScroll', // opacity
];

// Avoid layout-triggering properties in scroll animations
const heavierAnimations = [
  'StretchScroll', // Uses scaling that may demand extensive memory usage for large media
  'ShapeScroll', // Clip-path can be expensive if not hardware accelerated by the browser
];
```

## Common Patterns

### Hero Section Parallax

```typescript
const heroBackground = getScrubScene(
  '#hero-bg',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ParallaxScroll',
      speed: 0.3, // Slow background movement
    },
  },
  {
    trigger: 'view-progress',
    element: document.body,
  },
);

const heroContent = getScrubScene(
  '#hero-content',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'FadeScroll',
      range: 'out',
      opacity: 0.8,
    },
  },
  {
    trigger: 'view-progress',
    element: document.querySelector('#hero'),
  },
);
```

### Staggered Content Reveals

```typescript
document.querySelectorAll('.reveal-item').forEach((item, index) => {
  getScrubScene(
    item,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'RevealScroll',
        direction: 'bottom',
        range: 'in',
      },
      // Stagger timing with offset
      startOffset: {
        name: 'entry',
        offset: { value: index * 10, unit: 'percentage' },
      },
    },
    {
      trigger: 'view-progress',
      element: item,
    },
  );
});
```

### Gallery Scroll Effects

```typescript
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach((item, i) => {
  getScrubScene(
    item,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'GrowScroll',
        direction: 'center',
        range: 'in',
      },
    },
    {
      trigger: 'view-progress',
      element: item,
    },
  );
});
```

### Continuous Scroll Story

```typescript
// Long-form content with continuous effects
const storyContainer = getScrubScene(
  '#story',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'MoveScroll',
      angle: 90, // Vertical movement
      distance: { value: 500, unit: 'px' },
      range: 'continuous',
    },
  },
  {
    trigger: 'view-progress',
    element: document.body,
  },
);
```

## Accessibility and UX

### Respect Motion Preferences

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Use gentler scroll effects or disable entirely
  const config = { type: 'FadeScroll', range: 'in' };
} else {
  const config = { type: 'ArcScroll', direction: 'horizontal' };
}
```

### Progressive Enhancement

```typescript
// Check for scroll animation support
const supportsScrollAnimations = 'ViewTimeline' in window;

if (supportsScrollAnimations) {
  // Enable full scroll animation experience
  initScrollAnimations();
} else {
  // Fallback to simple reveals or static content
  initStaticFallbacks();
}
```

---

**Next**: Explore [Mouse Animations](mouse-animations.md) for interactive pointer effects, or return to the [Category Overview](README.md).
