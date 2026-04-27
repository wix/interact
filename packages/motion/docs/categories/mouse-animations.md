# Mouse Animations

Interactive pointer-driven effects that respond to mouse movement and hover states. Perfect for creating engaging user interactions, 3D effects, and cursor-following elements.

## Overview

Mouse animations are **scrub-based** animations that respond to pointer movement in real-time. They create dynamic, interactive experiences by translating cursor position into element transformations, providing immediate visual feedback and enhancing user engagement.

### Key Characteristics

- **Purpose**: Interactivity, hover effects, cursor following
- **Trigger**: Pointer movement (`pointer-move` events)
- **Duration**: Real-time responsiveness with optional transitions
- **Target**: Interactive elements, cards, buttons, media
- **State**: Continuous tracking with smooth transitions

## Animation Categories

### 🎯 **Position Tracking**

Elements that follow or respond to cursor position.

### 🔄 **3D Transformations**

Perspective-based effects with depth and rotation.

### 📏 **Scale & Deformation**

Size changes and shape deformations based on pointer.

### ✨ **Visual Effects**

Blur, transparency, and special visual responses.

### 🎨 **Custom Behaviors**

Programmable effects for unique interactions.

## Complete Preset Reference

| Animation        | Category  | Complexity | Axis Control | Description                       |
| ---------------- | --------- | ---------- | ------------ | --------------------------------- |
| **TrackMouse**   | Tracking  | Simple     | ✓            | Element follows cursor movement   |
| **Track3DMouse** | 3D        | Medium     | ✓            | 3D tracking with perspective      |
| **Tilt3DMouse**  | 3D        | Medium     | -            | 3D tilt based on pointer position |
| **SwivelMouse**  | 3D        | Complex    | -            | Pivot-point 3D rotation           |
| **ScaleMouse**   | Scale     | Medium     | ✓            | Dynamic scaling on hover          |
| **BlobMouse**    | Scale     | Medium     | -            | Organic blob-like scaling         |
| **SkewMouse**    | Deform    | Medium     | ✓            | Skew transformation tracking      |
| **BlurMouse**    | Visual    | Complex    | -            | Blur filter with 3D effects       |
| **AiryMouse**    | Tracking  | Medium     | ✓            | Lightweight floating movement     |
| **SpinMouse**    | Transform | Simple     | ✓            | Rotation based on movement        |
| **BounceMouse**  | Tracking  | Simple     | ✓            | Elastic cursor following          |
| **CustomMouse**  | Custom    | Variable   | -            | Programmable mouse effects        |

## Configuration Patterns

### Basic Mouse Animation

```typescript
const mouseAnimation = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'TrackMouse',
      distance: { value: 50, unit: 'px' },
    },
    transitionDuration: 300,
    transitionEasing: 'easeOut',
  },
  {
    trigger: 'pointer-move',
    element: containerElement,
  },
);
```

### Axis Control

Restrict movement to specific axes:

```typescript
{
  type: 'TrackMouse',
  axis: 'both',        // 'horizontal', 'vertical', 'both'
  distance: { value: 100, unit: 'px' }
}
```

### Inversion and Direction

```typescript
{
  type: 'AiryMouse',
  inverted: true,      // Reverse movement direction
  angle: 45,          // Movement bias angle
  axis: 'horizontal'   // Constraint axis
}
```

### Transition Control

```typescript
{
  type: 'ScaleMouse',
  transitionDuration: 200,    // Smooth transition time
  transitionEasing: 'bounce' // 'linear', 'easeOut', 'elastic', 'bounce'
}
```

## Detailed Animation Guides

### 🎯 Position Tracking

#### TrackMouse

**Best for**: Cursor followers, floating elements, parallax cursors

```typescript
{
  type: 'TrackMouse',
  distance: { value: 80, unit: 'px' },    // Movement range
  axis: 'both',                           // Movement constraint
  inverted: false                         // Movement direction
}
// Element follows cursor with specified constraints
```

#### AiryMouse

**Best for**: Lightweight hover effects, subtle interactions

```typescript
{
  type: 'AiryMouse',
  distance: { value: 200, unit: 'px' },   // Effect range
  angle: 30,                              // Movement bias
  axis: 'both',                           // Axis constraint
  inverted: false                         // Direction control
}
// Gentle floating movement with directional bias
```

#### BounceMouse

**Best for**: Playful elements, elastic interactions

```typescript
{
  type: 'BounceMouse',
  distance: { value: 80, unit: 'px' },    // Bounce range
  axis: 'both'                            // Movement axis
}
// Elastic cursor following with spring-like behavior
```

### 🔄 3D Transformations

#### Tilt3DMouse

**Best for**: Cards, panels, interactive UI elements

```typescript
{
  type: 'Tilt3DMouse',
  angle: 15,                              // Maximum tilt angle
  perspective: 800                        // 3D perspective depth
}
// 3D tilting effect following pointer position
```

#### Track3DMouse

**Best for**: 3D showcases, product displays, immersive elements

```typescript
{
  type: 'Track3DMouse',
  distance: { value: 100, unit: 'px' },   // Movement range
  angle: 10,                              // Rotation amount
  axis: 'both',                           // Movement constraint
  perspective: 600                        // 3D depth
}
// 3D tracking with perspective transformation
```

#### SwivelMouse

**Best for**: Rotating showcases, dial controls, directional indicators

```typescript
{
  type: 'SwivelMouse',
  angle: 25,                              // Rotation range
  perspective: 800,                       // 3D perspective
  pivotAxis: 'center-horizontal'           // Pivot point
}
// Pivot-based 3D rotation around specified axis
```

### 📏 Scale & Deformation

#### ScaleMouse

**Best for**: Buttons, interactive cards, zoom effects

```typescript
{
  type: 'ScaleMouse',
  distance: { value: 150, unit: 'px' },   // Effect range
  axis: 'both',                           // Scale constraint
  scale: 1.2,                             // Maximum scale
  scaleDirection: 'up'                    // 'up' or 'down'
}
// Dynamic scaling based on cursor proximity
```

#### BlobMouse

**Best for**: Organic elements, creative interfaces, morphing shapes

```typescript
{
  type: 'BlobMouse',
  distance: { value: 120, unit: 'px' },   // Effect range
  scale: 1.5                              // Maximum scale change
}
// Organic blob-like scaling with smooth transitions
```

#### SkewMouse

**Best for**: Creative layouts, artistic elements, dynamic typography

```typescript
{
  type: 'SkewMouse',
  distance: { value: 100, unit: 'px' },   // Effect range
  angle: 10,                              // Maximum skew angle
  axis: 'both'                            // Skew constraint
}
// Skew transformation following pointer movement
```

### ✨ Visual Effects

#### BlurMouse

**Best for**: Motion effects, speed indicators, dynamic focus

```typescript
{
  type: 'BlurMouse',
  distance: { value: 80, unit: 'px' },    // Movement range
  angle: 5,                               // Blur direction
  scale: 0.3,                             // Scale during blur
  blur: 20,                               // Blur amount (px)
  perspective: 600                        // 3D perspective
}
// Motion blur with 3D transformation
```

#### SpinMouse

**Best for**: Loading indicators, directional feedback, rotary controls

```typescript
{
  type: 'SpinMouse',
  axis: 'both'                            // Rotation trigger axis
}
// Rotation based on mouse movement velocity
```

### 🎨 Custom Behaviors

#### CustomMouse

**Best for**: Unique interactions, specialized behaviors, complex effects

```typescript
{
  type: 'CustomMouse',
  // Custom implementation with progress callback
  effect: (progress) => {
    const { x, y, v, active } = progress();
    // Custom transformation logic
    element.style.transform = `
      translate(${x * 100}px, ${y * 100}px)
      rotate(${x * 360}deg)
    `;
  }
}
// Fully programmable mouse interaction
```

## Advanced Configuration

### Pivot Points for 3D Effects

```typescript
{
  type: 'SwivelMouse',
  pivotAxis: 'top',              // Pivot from top edge
  // Options: 'top', 'bottom', 'left', 'right',
  //          'center-horizontal', 'center-vertical'
}
```

### Transition Easing Options

```typescript
{
  transitionEasing: 'elastic',   // Spring-like motion
  // Options: 'linear', 'easeOut', 'elastic', 'bounce', 'hardBackOut'
}
```

### Distance and Range Control

```typescript
{
  distance: { value: 200, unit: 'px' },      // Pixel-based range
  distance: { value: 50, unit: 'percentage' }, // Percentage-based range
  distance: { value: 10, unit: 'vh' }         // Viewport-based range
}
```

## Performance Optimization

### Efficient Mouse Tracking

```typescript
// Use transform-only properties for best performance
const efficientAnimations = [
  'TrackMouse', // transform: translate
  'SpinMouse', // transform: rotate
  'ScaleMouse', // transform: scale
  'AiryMouse', // transform: translate
];

// Minimize layout-triggering effects
const heavierAnimations = [
  'BlurMouse', // Uses filter property
  'SkewMouse', // Complex transform calculations
];
```

### Throttle Pointer Events

```typescript
// Custom throttling for intensive effects
let throttleTimer: number;
element.addEventListener('pointermove', (e) => {
  if (throttleTimer) return;

  throttleTimer = requestAnimationFrame(() => {
    mouseAnimation.progress({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
      v: { x: e.movementX, y: e.movementY },
      active: true,
    });
    throttleTimer = 0;
  });
});
```

### Touch Device Considerations

```typescript
// Disable mouse animations on touch devices
const isTouchDevice = window.matchMedia('not (hover: hover)').matches;

if (isTouchDevice) {
  // Use alternative hover states or disable mouse animations
  element.addEventListener('pointerenter', handleTouchInteraction);
} else {
  // Enable full mouse animation experience
  const mouseAnimation = getWebAnimation(element, mouseConfig, trigger);
}
```

## Common Patterns

### Interactive Card Hover

```typescript
const cardHover = getWebAnimation(
  card,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'Tilt3DMouse',
      angle: 12,
      perspective: 1000,
    },
    transitionDuration: 200,
    transitionEasing: 'easeOut',
  },
  {
    trigger: 'pointer-move',
    element: card,
  },
);

// Enhanced with additional effects
card.addEventListener('pointerenter', () => {
  card.style.boxShadow = '0 20px 40px rgb(0 0 0 / 0.1)';
});

card.addEventListener('pointerleave', () => {
  card.style.boxShadow = '';
});
```

### Cursor Following Element

```typescript
const follower = getWebAnimation(
  cursorElement,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'TrackMouse',
      distance: { value: 20, unit: 'px' },
      axis: 'both',
    },
    transitionDuration: 100,
    transitionEasing: 'easeOut',
  },
  {
    trigger: 'pointer-move',
    element: document.body,
  },
);
```

### 3D Product Showcase

```typescript
const productShowcase = getWebAnimation(
  product,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'Track3DMouse',
      distance: { value: 50, unit: 'px' },
      angle: 15,
      perspective: 800,
    },
    transitionDuration: 300,
    transitionEasing: 'easeOut',
  },
  {
    trigger: 'pointer-move',
    element: productContainer,
  },
);
```

### Interactive Button Effects

```typescript
const buttonEffect = getWebAnimation(
  button,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ScaleMouse',
      distance: { value: 100, unit: 'px' },
      scale: 1.05,
      scaleDirection: 'up',
    },
    transitionDuration: 150,
    transitionEasing: 'bounce',
  },
  {
    trigger: 'pointer-move',
    element: button,
  },
);

// Combined with color transitions
button.addEventListener('mouseenter', () => {
  button.style.backgroundColor = '#007bff';
});
```

## Accessibility and UX

### Respect Motion Preferences

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable mouse animations or use minimal effects
  console.log('Mouse animations disabled for accessibility');
} else {
  // Enable full mouse animation experience
  initMouseAnimations();
}
```

### Performance Boundaries

```typescript
// Limit concurrent mouse animations
const MAX_MOUSE_ANIMATIONS = 5;
let activeMouseAnimations = 0;

function createMouseAnimation(element, config) {
  if (activeMouseAnimations >= MAX_MOUSE_ANIMATIONS) {
    console.warn('Max mouse animations reached');
    return null;
  }

  activeMouseAnimations++;
  const animation = getWebAnimation(element, config);

  return {
    ...animation,
    cancel: () => {
      animation.cancel();
      activeMouseAnimations--;
    },
  };
}
```

---

**Next**: Explore [Background Scroll Animations](background-scroll-animations.md) for specialized background effects, or return to the [Category Overview](README.md).
