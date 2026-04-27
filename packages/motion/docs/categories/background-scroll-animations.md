# Background Scroll Animations

Specialized effects designed for background media elements and hero sections. Perfect for creating immersive backgrounds, parallax landscapes, and cinematic scroll experiences.

## Overview

Background scroll animations are **scrub-based** animations specifically optimized for background media elements. They target elements with `data-motion-part` attributes and automatically measure container dimensions for accurate calculations. These animations create immersive, large-scale visual effects.

### Key Characteristics

- **Purpose**: Hero sections, background media, immersive experiences
- **Trigger**: Scroll position with viewport intersection
- **Target**: Background media layers (`BG_LAYER`, `BG_MEDIA`, `BG_IMG`)
- **Measurement**: Auto-calculated component dimensions
- **Scale**: Designed for large viewport interactions

## Animation Categories

### 🌊 **Parallax & Movement**

Classic parallax scrolling and directional movement effects.

### 🔍 **Zoom & Scale**

Dynamic scaling and perspective zoom effects.

### 🎭 **Fade & Opacity**

Sophisticated opacity transitions and layered fading.

### 🔄 **Rotation & Transform**

Rotational effects and complex transformations.

### 🎨 **Advanced 3D**

Complex perspective effects with multi-layer interactions.

## Complete Preset Reference

| Animation         | Category  | Complexity | Direction Support | Measurement | Description                          |
| ----------------- | --------- | ---------- | ----------------- | ----------- | ------------------------------------ |
| **BgParallax**    | Parallax  | Simple     | -                 | ✓           | Classic background parallax movement |
| **ImageParallax** | Parallax  | Medium     | -                 | ✓           | Enhanced image parallax with options |
| **BgPan**         | Movement  | Simple     | 2-way             | ✓           | Horizontal panning movement          |
| **BgZoom**        | Zoom      | Complex    | 2-way             | ✓           | Dynamic zoom in/out effects          |
| **BgCloseUp**     | Zoom      | Medium     | -                 | ✓           | Perspective zoom with fade           |
| **BgPullBack**    | Zoom      | Medium     | -                 | ✓           | 3D pull-back effect                  |
| **BgFade**        | Fade      | Simple     | -                 | ✓           | Directional fade transitions         |
| **BgFadeBack**    | Fade      | Medium     | -                 | ✓           | Scale + fade combination             |
| **BgRotate**      | Transform | Simple     | 2-way             | -           | Smooth rotation effects              |
| **BgSkew**        | Transform | Medium     | 2-way             | ✓           | Skewing transformation               |
| **BgFake3D**      | 3D        | Complex    | -                 | ✓           | Multi-layer 3D parallax              |
| **BgReveal**      | Special   | Simple     | -                 | ✓           | Measurement-only reveal              |

## Target Elements

Background scroll animations target specific element parts:

### Data Attributes

```html
<!-- container -->
<section id="hero-section">
  <!-- Background layer container -->
  <div data-motion-part="BG_LAYER">
    <!-- Background media layer -->
    <div data-motion-part="BG_MEDIA">
      <img src="background.jpg" data-motion-part="BG_IMG" />
    </div>
  </div>
</section>
```

### Motion Parts

- **`BG_LAYER`** - Background container layer
- **`BG_MEDIA`** - Main background media container
- **`BG_IMG`** - Background image element

## Configuration Patterns

### Basic Background Animation

```typescript
const bgScene = getWebAnimation(
  '#hero-background',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgParallax',
      speed: 0.3, // 30% of scroll speed
    },
  },
  {
    trigger: 'view-progress',
    element: document.body,
  },
);
```

### Speed Control

```typescript
{
  type: 'BgParallax',
  speed: 0.2    // 0.1 = slow, 0.5 = medium, 1.0 = fast
}

{
  type: 'BgPan',
  speed: 0.4    // Panning speed multiplier
}
```

### Direction Control

```typescript
// Two-way directions
{ type: 'BgPan', direction: 'left' | 'right' }
{ type: 'BgRotate', direction: 'clockwise' | 'counter-clockwise' }
{ type: 'BgSkew', direction: 'clockwise' | 'counter-clockwise' }

// Zoom directions
{ type: 'BgZoom', direction: 'in' | 'out' }
```

### Scale and Intensity

```typescript
{
  type: 'BgZoom',
  zoom: 40,        // Zoom amount
  direction: 'in'  // Zoom direction
}

{
  type: 'BgCloseUp',
  scale: 80        // Perspective scale value
}

{
  type: 'BgSkew',
  angle: 20        // Skew angle in degrees
}
```

## Detailed Animation Guides

### 🌊 Parallax & Movement

#### BgParallax

**Best for**: Hero backgrounds, landscape imagery, layered compositions

```typescript
{
  type: 'BgParallax',
  speed: 0.3       // Background moves at 30% of scroll speed
}
// Classic parallax: background moves slower than scroll
```

#### ImageParallax

**Best for**: Enhanced parallax with additional control options

```typescript
{
  type: 'ImageParallax',
  speed: 1.5,      // Parallax speed multiplier
  reverse: false,  // Reverse movement direction
  isPage: false    // Page-level vs component-level
}
// Enhanced parallax with directional and scope control
```

#### BgPan

**Best for**: Wide backgrounds, horizontal movement, cinematic panning

```typescript
{
  type: 'BgPan',
  direction: 'left',  // 'left' | 'right'
  speed: 0.2         // Panning speed
}
// Horizontal panning movement across viewport
```

### 🔍 Zoom & Scale

#### BgZoom

**Best for**: Hero sections, dramatic reveals, immersive experiences

```typescript
{
  type: 'BgZoom',
  direction: 'in',    // 'in' | 'out'
  zoom: 40           // Zoom intensity
}
// Dynamic zoom with perspective and Y-axis movement
```

#### BgCloseUp

**Best for**: Perspective reveals, depth effects, layered backgrounds

```typescript
{
  type: 'BgCloseUp',
  scale: 80          // Perspective scale amount
}
// Combines perspective zoom with fade on background layer
```

#### BgPullBack

**Best for**: 3D reveal effects, depth transitions

```typescript
{
  type: 'BgPullBack',
  scale: 50          // Pull-back distance
}
// 3D pull-back effect with perspective transformation
```

### 🎭 Fade & Opacity

#### BgFade

**Best for**: Simple background transitions, overlay effects

```typescript
{
  type: 'BgFade',
  range: 'in'        // 'in' | 'out'
}
// Directional fade transitions on background layer
```

#### BgFadeBack

**Best for**: Scale + fade combinations, gentle transitions

```typescript
{
  type: 'BgFadeBack',
  scale: 0.7         // Scale amount during fade
}
// Combines scaling and opacity changes
```

### 🔄 Rotation & Transform

#### BgRotate

**Best for**: Rotating backgrounds, dynamic orientations

```typescript
{
  type: 'BgRotate',
  direction: 'counter-clockwise',  // Rotation direction
  angle: 22                       // Rotation angle
}
// Smooth rotation effect on background media
```

#### BgSkew

**Best for**: Dynamic layouts, creative distortions

```typescript
{
  type: 'BgSkew',
  direction: 'counter-clockwise',  // Skew direction
  angle: 20                       // Skew angle
}
// Skewing transformation with oscillating motion
```

### 🎨 Advanced 3D

#### BgFake3D

**Best for**: Complex 3D effects, multi-layer parallax, showcase backgrounds

```typescript
{
  type: 'BgFake3D',
  stretch: 1.3,      // Y-axis stretch amount
  zoom: 16.67        // 3D zoom distance
}
// Multi-layer 3D effect with stretch, zoom, and Y-movement
```

#### BgReveal

**Best for**: Measurement-based reveals, container preparations

```typescript
{
  type: 'BgReveal';
  // No visual effect - performs measurements for other animations
}
// Utility animation for measurement and preparation
```

## Advanced Configuration

### Multi-Layer Effects

```typescript
// Layer 1: Background parallax
getWebAnimation(
  '#bg-layer-1',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgParallax',
      speed: 0.2,
    },
  },
  triggerConfig,
);

// Layer 2: Faster parallax
getWebAnimation(
  '#bg-layer-2',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgParallax',
      speed: 0.5,
    },
  },
  triggerConfig,
);

// Layer 3: Zoom effect
getWebAnimation(
  '#bg-layer-3',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgZoom',
      direction: 'in',
      zoom: 30,
    },
  },
  triggerConfig,
);
```

### Custom Range Control

```typescript
{
  type: 'BgFade',
  range: 'in',
  startOffset: {
    name: 'cover',
    offset: { value: 0, unit: 'percentage' }
  },
  endOffset: {
    name: 'cover',
    offset: { value: 50, unit: 'percentage' }
  }
}
```

### Measurement Integration

```typescript
// Auto-measurement for responsive effects
{
  type: 'BgFake3D',
  stretch: 1.3,
  zoom: 100 / 6  // Calculated based on component size
}
// Animation automatically measures component height
```

## Performance Optimization

### Efficient Background Animations

```typescript
// Best performance: Transform-only animations
const efficientAnimations = [
  'BgParallax', // translateY only
  'BgPan', // translateX only
  'BgRotate', // rotate only
  'BgZoom', // perspective + translateZ
];

// Moderate performance: Multi-property animations
const moderateAnimations = [
  'BgFake3D', // Multiple transform layers
  'BgCloseUp', // Perspective + opacity
  'BgSkew', // Skew + position
];
```

### Measurement Batching

```typescript
// Batch measurements for multiple background animations
import { prepareAnimation } from '@wix/motion';

elements.forEach((element) => {
  prepareAnimation(element, backgroundAnimationConfig);
});

// Then create animations after measurements complete
elements.forEach((element) => {
  getWebAnimation(element, backgroundAnimationConfig, trigger);
});
```

## Common Patterns

### Hero Section Setup

```html
<section id="hero">
  <div class="hero-background">
    <div data-motion-part="BG_MEDIA">
      <img src="hero-bg.jpg" data-motion-part="BG_IMG" />
    </div>
    <div data-motion-part="BG_LAYER" class="hero-overlay"></div>
  </div>
  <div class="hero-content">
    <h1>Hero Title</h1>
  </div>
</section>
```

```typescript
// Background parallax
getWebAnimation(
  '.hero-background',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgParallax',
      speed: 0.3,
    },
  },
  {
    trigger: 'view-progress',
    element: document.body,
  },
);

// Overlay fade
getWebAnimation(
  '.hero-background',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgFade',
      range: 'out',
    },
  },
  {
    trigger: 'view-progress',
    element: document.querySelector('#hero'),
  },
);
```

### Full-Page Background

```typescript
const fullPageBg = getWebAnimation(
  '#page-background',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ImageParallax',
      speed: 1.2,
      isPage: true, // Full page scope
    },
  },
  {
    trigger: 'view-progress',
    element: document.body,
  },
);
```

### Gallery Background Effects

```typescript
document.querySelectorAll('.gallery-item').forEach((item) => {
  getWebAnimation(
    item,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'BgZoom',
        direction: 'in',
        zoom: 25,
      },
    },
    {
      trigger: 'view-progress',
      element: item,
    },
  );
});
```

### Complex 3D Scene

```typescript
const scene3D = getWebAnimation(
  '#showcase-bg',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgFake3D',
      stretch: 1.4,
      zoom: 20,
    },
  },
  {
    trigger: 'view-progress',
    element: document.body,
  },
);
```

## Mobile and Responsive Considerations

### Mobile Optimization

```typescript
const isMobile = window.innerWidth < 768;

const bgConfig = {
  type: 'ScrubAnimationOptions',
  namedEffect: isMobile
    ? { type: 'BgFade', range: 'in' } // Simple fade on mobile
    : { type: 'BgFake3D', stretch: 1.3 }, // Complex 3D on desktop
};
```

### Reduced Motion Support

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Use simple, non-moving backgrounds
  const config = { type: 'BgReveal' };
} else {
  // Full background animation experience
  const config = { type: 'BgParallax', speed: 0.3 };
}
```

### Viewport-Aware Effects

```typescript
// Scale effects based on viewport size
const viewportMultiplier = Math.min(window.innerWidth / 1920, 1);

{
  type: 'BgZoom',
  zoom: 40 * viewportMultiplier,  // Scale zoom for smaller screens
  direction: 'in'
}
```

## CSS Integration

### Style Requirements

```css
.hero-background {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

[data-motion-part='BG_MEDIA'] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
}

[data-motion-part='BG_IMG'] {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

[data-motion-part='BG_LAYER'] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent, rgb(0 0 0 / 0.5));
}
```

### Custom Properties Integration

```css
/* Motion generates CSS custom properties */
[data-motion-part='BG_MEDIA'] {
  transform: translateY(var(--motion-translate-y, 0));
}

/* Component height is automatically measured */
.hero-section {
  --motion-comp-height: 100vh; /* Set by animation */
}
```

---

**Complete**: You've explored all animation categories! Return to the [Category Overview](README.md) or check out [Performance Optimization](../guides/performance.md) for advanced usage patterns.
