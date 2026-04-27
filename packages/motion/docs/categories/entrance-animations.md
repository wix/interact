# Entrance Animations

Entrance animations bring elements into view with impact and style. Perfect for element reveals, page transitions, and progressive disclosure patterns.

## Overview

Entrance animations are **time-based** animations designed to reveal content with visual impact. They typically run once when triggered and range from 300-1500ms in duration. All entrance animations start with elements in a hidden or transformed state and animate them to their final visible position.

### Key Characteristics

- **Purpose**: Element reveals and transitions
- **Duration**: 300-1500ms (configurable)
- **Trigger**: Manual, intersection observer, or page load
- **Target**: Any DOM element
- **State**: One-time animations (not loops)

## Animation Categories

### 🌟 **Fade & Opacity**

Simple opacity-based reveals for subtle entrances.

### 🎯 **Directional Movement**

Elements slide, glide, or float in from specific directions.

### 🔄 **3D Transforms**

Sophisticated perspective-based animations with rotation and depth.

### ⚡ **Dynamic & Bouncy**

Spring-based animations with elastic movement and bouncing.

### 🎨 **Shape & Clip**

Creative reveals using clip-path and shape morphing.

## Complete Preset Reference

| Animation      | Category | Complexity | Directions     | Description                       |
| -------------- | -------- | ---------- | -------------- | --------------------------------- |
| **FadeIn**     | Fade     | Simple     | -              | Clean opacity transition          |
| **ArcIn**      | 3D       | Complex    | 4-way          | Curved motion with 3D rotation    |
| **BounceIn**   | Dynamic  | Medium     | 5-way + center | Spring-based entrance with bounce |
| **SlideIn**    | Movement | Medium     | 4-way          | Slide from edge with clip reveal  |
| **GlideIn**    | Movement | Medium     | 360°           | Smooth directional movement       |
| **FlipIn**     | 3D       | Medium     | 4-way          | 3D flip rotation entrance         |
| **DropIn**     | Dynamic  | Simple     | -              | Scale-based drop with easing      |
| **ExpandIn**   | Dynamic  | Medium     | 9-way          | Scale from specific origin points |
| **FloatIn**    | Movement | Simple     | 4-way          | Gentle floating movement          |
| **SpinIn**     | Dynamic  | Medium     | 2-way          | Rotation with scale entrance      |
| **FoldIn**     | 3D       | Complex    | 4-way          | 3D fold with perspective          |
| **TurnIn**     | 3D       | Complex    | 4-corner       | Complex 3D corner rotation        |
| **CurveIn**    | 3D       | Complex    | 4-way          | Curved 3D perspective entrance    |
| **RevealIn**   | Clip     | Medium     | 4-way          | Clean clip-path reveal            |
| **TiltIn**     | 3D       | Complex    | 2-way          | 3D tilt with clip reveal          |
| **WinkIn**     | Clip     | Medium     | 2-way          | Accordion-style reveal            |
| **ShapeIn**    | Clip     | Medium     | 5 shapes       | Morphing shape reveals            |
| **ShuttersIn** | Clip     | Complex    | 4-way          | Multi-segment shutter effect      |
| **BlurIn**     | Filter   | Simple     | -              | Blur-to-focus transition          |

## Configuration Patterns

### Basic Usage

```typescript
const animation = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 800,
  easing: 'easeOut',
});
```

### Directional Controls

Animations with directional support:

```typescript
// Four directions
{ type: 'SlideIn', direction: 'left' | 'right' | 'top' | 'bottom' }

// Eight directions (includes corners)
{ type: 'ExpandIn', direction: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }

// Angles (0° = up, 90° = right, 180° = down, 270° = left)
{ type: 'GlideIn', direction: 45 }

// Special directions
{ type: 'BounceIn', direction: 'center' } // From center outward
```

### Custom Parameters

Fine-tune animations with specific parameters:

```typescript
// Distance control
{
  type: 'GlideIn',
  direction: 270,
  distance: { value: 100, unit: 'px' },
  startFromOffScreen: true
}

// Scale control
{
  type: 'DropIn',
  initialScale: 2.0,
}

// Shape selection
{
  type: 'ShapeIn',
  shape: 'circle' | 'rectangle' | 'diamond' | 'ellipse' | 'window'
}
```

## Detailed Animation Guides

### 🌟 Simple Fades

#### FadeIn

**Best for**: Subtle content reveals, overlays, modals

```typescript
{
  type: 'FadeIn',
  // No additional parameters - pure opacity transition
}
```

#### BlurIn

**Best for**: Focus transitions, image reveals

```typescript
{
  type: 'BlurIn',
  blur: 25,        // Blur amount in pixels
}
```

### 🎯 Directional Movement

#### SlideIn

**Best for**: Navigation, panels, content blocks

```typescript
{
  type: 'SlideIn',
  direction: 'left',    // 'top', 'right', 'bottom', 'left'
  initialTranslate: 1   // Custom distance multiplier
}
```

#### GlideIn

**Best for**: Hero elements, cards, flexible directional reveals

```typescript
{
  type: 'GlideIn',
  direction: 225,                              // Angle in degrees
  distance: { value: 150, unit: 'px' },       // Movement distance
  startFromOffScreen: false                    // Start from viewport edge
}
```

#### FloatIn

**Best for**: Lightweight content, tooltips, notifications

```typescript
{
  type: 'FloatIn',
  direction: 'bottom'   // 'top', 'right', 'bottom', 'left'
  // Fixed 120px distance, gentle easing
}
```

### 🔄 3D Transforms

#### ArcIn

**Best for**: Hero content, featured elements, dramatic reveals

```typescript
{
  type: 'ArcIn',
  direction: 'right',   // 'top', 'right', 'bottom', 'left'
}
```

#### FlipIn

**Best for**: Cards, panels, interactive elements

```typescript
{
  type: 'FlipIn',
  direction: 'top',     // Flip axis direction
  initialRotate: 180    // Custom rotation angle
}
```

#### FoldIn

**Best for**: Paper-like elements, creative reveals

```typescript
{
  type: 'FoldIn',
  direction: 'top',     // Fold direction
  initialRotate: 90     // Fold angle
}
```

### ⚡ Dynamic & Bouncy

#### BounceIn

**Best for**: Buttons, icons, playful elements

```typescript
{
  type: 'BounceIn',
  direction: 'bottom',      // 'top', 'right', 'bottom', 'left', 'center'
  distanceFactor: 1         // Movement distance
}
```

#### DropIn

**Best for**: Modals, dropdowns, floating elements

```typescript
{
  type: 'DropIn',
  initialScale: 1.6     // Starting scale (>1 = larger)
}
```

### 🎨 Shape & Clip Effects

#### ShapeIn

**Best for**: Creative reveals, masked content, artistic elements

```typescript
{
  type: 'ShapeIn',
  shape: 'circle'       // 'circle', 'rectangle', 'diamond', 'ellipse', 'window'
}
```

#### RevealIn

**Best for**: Content blocks, images, clean reveals

```typescript
{
  type: 'RevealIn',
  direction: 'left'     // Reveal direction
}
```

#### ShuttersIn

**Best for**: Dynamic reveals, segmented content

```typescript
{
  type: 'ShuttersIn',
  direction: 'right',   // Shutter direction
  shutters: 12,         // Number of segments
  staggered: true,      // Offset timing
}
```

## Timing and Easing

### Recommended Durations

- **Quick reveals**: 300-500ms (FadeIn, BlurIn)
- **Standard entrances**: 600-900ms (SlideIn, GlideIn, DropIn)
- **Complex 3D**: 800-1200ms (ArcIn, FlipIn, FoldIn)
- **Bouncy effects**: 1000-1500ms (BounceIn)

### Easing Recommendations

```typescript
// Smooth and natural
easing: 'easeOutQuart'; // Quick start, slow end

// Bouncy and playful
easing: 'backOut'; // Overshoot effect

// Dramatic and strong
easing: 'elasticOut'; // Spring effect

// Clean and linear
easing: 'cubicInOut'; // Balanced acceleration
```

## Performance Tips

### Batch Multiple Entrances

```typescript
// Staggered entrance sequence
const elements = document.querySelectorAll('.reveal-item');
elements.forEach((el, index) => {
  const animation = getWebAnimation(el, {
    type: 'TimeAnimationOptions',
    namedEffect: { type: 'SlideIn', direction: 'bottom' },
    duration: 600,
    delay: index * 100, // 100ms stagger
  });
  animation.play();
});
```

### CSS Mode for Simple Effects

```typescript
// Use CSS animations for better mobile performance
import { getCSSAnimation } from '@wix/motion';

const cssRules = getCSSAnimation('elementId', {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 500,
});
```

## Common Patterns

### Modal Entrance

```typescript
const modalAnimation = getWebAnimation(modal, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'DropIn',
  },
  duration: 400,
  easing: 'backOut',
});
```

### Hero Section Reveal

```typescript
const heroAnimation = getWebAnimation(heroElement, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'ArcIn',
    direction: 'bottom',
  },
  duration: 1200,
  easing: 'quintOut',
});
```

### Card Grid Stagger

```typescript
document.querySelectorAll('.card').forEach((card, i) => {
  getWebAnimation(card, {
    type: 'TimeAnimationOptions',
    namedEffect: {
      type: 'GlideIn',
      direction: 45,
      distance: { value: 100, unit: 'px' },
    },
    duration: 800,
    delay: i * 150,
    easing: 'cubicOut',
  }).play();
});
```

## Accessibility Considerations

### Respect Motion Preferences

```typescript
const respectsReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const duration = respectsReducedMotion ? 200 : 800;
const animationType = respectsReducedMotion ? 'FadeIn' : 'BounceIn';
```

### Focus Management

```typescript
// Ensure focus is visible after animation
await animation.play();
element.focus();
```

---

**Next**: Explore [Ongoing Animations](ongoing-animations.md) for continuous looping effects, or return to the [Category Overview](README.md).
