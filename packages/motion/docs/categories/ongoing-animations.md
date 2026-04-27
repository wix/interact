# Ongoing Animations

Continuous looping animations that add life and draw attention to elements. Perfect for call-to-action emphasis, loading states, and ambient motion.

## Overview

Ongoing animations are **time-based** looping animations designed to create continuous movement and draw user attention. They typically run with infinite iterations and use alternating or repeating patterns. Duration ranges from 1-4 seconds with automatic looping.

### Key Characteristics

- **Purpose**: Attention, emphasis, ambient motion
- **Duration**: 1-4 seconds per cycle
- **Iterations**: Infinite loops (configurable)
- **Trigger**: Manual start/stop control
- **Target**: Buttons, icons, decorative elements
- **State**: Continuous until stopped

## Animation Categories

### 💓 **Rhythmic Scaling**

Breathing, pulsing, and organic size changes.

### 🏃 **Movement & Position**

Translation-based animations with directional flow.

### 🔄 **Rotation & Spin**

Circular motion and rotation effects.

### ⚡ **Dynamic Effects**

Complex multi-property animations with elastic movement.

### ✨ **Visual Effects**

Opacity, visibility, and special visual transitions.

## Complete Preset Reference

| Animation   | Category | Complexity | Directions | Description                   |
| ----------- | -------- | ---------- | ---------- | ----------------------------- |
| **Pulse**   | Rhythmic | Simple     | -          | Smooth scale breathing effect |
| **Breathe** | Rhythmic | Medium     | 3-way      | Organic movement with scaling |
| **Bounce**  | Dynamic  | Medium     | -          | Vertical bouncing motion      |
| **Spin**    | Rotation | Simple     | 2-way      | Continuous rotation           |
| **Wiggle**  | Movement | Medium     | -          | Random shake movement         |
| **Poke**    | Movement | Medium     | 4-way      | Directional poking motion     |
| **Flash**   | Visual   | Simple     | -          | Opacity blinking effect       |
| **Swing**   | Movement | Complex    | 4-way      | Pendulum swinging motion      |
| **Flip**    | Rotation | Medium     | 2-way      | 3D flip rotation              |
| **Rubber**  | Dynamic  | Medium     | -          | Elastic scaling effect        |
| **Fold**    | Rotation | Complex    | 4-way      | 3D folding animation          |
| **Jello**   | Dynamic  | Medium     | -          | Gelatinous wobble effect      |
| **Cross**   | Movement | Complex    | 8-way      | Multi-directional crossing    |
| **Blink**   | Visual   | Complex    | -          | Random blinking teleport\*    |
| **DVD**     | Movement | Medium     | -          | Bouncing corner-to-corner\*   |

\*Currently disabled in production

## Configuration Patterns

### Basic Looping

```typescript
const animation = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'Pulse' },
  duration: 2000,
  iterations: Infinity, // Loop forever
  alternate: true, // Ping-pong effect
});
```

### Intensity Control

Fine-tune effect strength with intensity values:

```typescript
{
  type: 'Bounce',
  intensity: 0.8  // Effect strength multiplier
}
```

### Directional Support

Many animations support directional parameters:

```typescript
// Four directions
{ type: 'Poke', direction: 'top' | 'right' | 'bottom' | 'left' }

// Eight directions (includes corners)
{ type: 'Cross', direction: 'top-left' | 'bottom-right' | /* etc */ }

// Two-way rotation
{ type: 'Spin', direction: 'clockwise' | 'counter-clockwise' }

// Axis selection
{ type: 'Breathe', direction: 'vertical' | 'horizontal' | 'center' }
```

## Detailed Animation Guides

### 💓 Rhythmic Scaling

#### Pulse

**Best for**: Call-to-action buttons, notifications, heartbeat effects

```typescript
{
  type: 'Pulse',
  intensity: 1.0       // Multiplier (0.1-2.0)
}
// Creates smooth scale from 1.0 to 1.1 and back
```

#### Breathe

**Best for**: Organic elements, meditation apps, ambient motion

```typescript
{
  type: 'Breathe',
  direction: 'vertical',                   // Movement direction
  distance: { value: 10, unit: 'px' }     // Movement amount
}
// Combines gentle translation with subtle scaling
```

### 🏃 Movement & Position

#### Wiggle

**Best for**: Error states, playful elements, attention grabbing

```typescript
{
  type: 'Wiggle',
  intensity: 0.5       // Movement amount
}
// Random horizontal shaking motion
```

#### Poke

**Best for**: Interactive hints, directional cues, button emphasis

```typescript
{
  type: 'Poke',
  direction: 'right',  // Poke direction
  intensity: 1.2       // Effect multiplier
}
// Short directional movement and return
```

#### Cross

**Best for**: Complex UI elements, dashboard widgets

```typescript
{
  type: 'Cross',
  direction: 'top-right'  // Eight-way directional movement
}
// Crossing movement pattern to corners
```

### 🔄 Rotation & Spin

#### Spin

**Best for**: Loading indicators, refresh buttons, processing states

```typescript
{
  type: 'Spin',
  direction: 'clockwise'   // 'clockwise' | 'counter-clockwise'
}
// Continuous smooth rotation
```

#### Flip

**Best for**: Cards, panels, toggle states

```typescript
{
  type: 'Flip',
  direction: 'horizontal'   // 'horizontal' | 'vertical'
}
// 3D flip rotation effect
```

#### Fold

**Best for**: Paper-like elements, origami effects

```typescript
{
  type: 'Fold',
  direction: 'top',        // Fold axis direction
  angle: 45               // Custom fold angle
}
// 3D folding motion with perspective
```

### ⚡ Dynamic Effects

#### Bounce

**Best for**: Playful elements, game UI, spring animations

```typescript
{
  type: 'Bounce',
  intensity: 1.5           // Effect multiplier
}
// Vertical bouncing with gravity simulation
```

#### Rubber

**Best for**: Elastic elements, cartoon-style effects

```typescript
{
  type: 'Rubber',
  intensity: 0.8           // Effect strength
}
// Elastic stretching and snapping
```

#### Jello

**Best for**: Gelatinous effects, organic motion, fun elements

```typescript
{
  type: 'Jello',
  intensity: 1.0           // Effect multiplier
}
// Multi-directional wobbling motion
```

#### Swing

**Best for**: Hanging elements, pendulum effects, natural motion

```typescript
{
  type: 'Swing',
  swing: 15,              // Custom swing angle (degrees)
  direction: 'left'        // Swing axis point
}
// Pendulum-style swinging motion
```

### ✨ Visual Effects

#### Flash

**Best for**: Alerts, notifications, blinking indicators

```typescript
{
  type: 'Flash';
  // Simple opacity blinking with no additional parameters
}
// Quick opacity flash effect
```

#### Blink\* (Experimental)

**Best for**: Glitch effects, teleportation, magical elements

```typescript
{
  type: 'Blink',
  scale: 0.5,                             // Size variation
  distance: { value: 100, unit: 'px' }    // Jump distance
}
// Random position jumping with opacity flashes
```

\*Note: Currently disabled in production

## Timing and Control

### Recommended Durations

- **Fast attention**: 800-1200ms (Flash, Pulse)
- **Standard rhythm**: 1500-2500ms (Breathe, Bounce, Wiggle)
- **Slow ambient**: 3000-4000ms (Swing, Cross)
- **Loading states**: 1000-1500ms (Spin)

### Loop Control

```typescript
// Infinite looping (default)
iterations: Infinity;

// Limited repetitions
iterations: 5;

// Ping-pong effect
alternate: true;

// Forward only
alternate: false;
```

### Start/Stop Control

```typescript
const animation = getWebAnimation(element, options);

// Start animation
await animation.play();

// Pause animation
animation.pause();

// Resume animation
animation.play();

// Stop and reset
animation.cancel();
```

## Performance Optimization

### CSS Mode for Simple Effects

```typescript
// Use CSS animations for better performance
import { getCSSAnimation } from '@wix/motion';

const cssRules = getCSSAnimation('elementId', {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'Pulse' },
  duration: 2000,
  iterations: Infinity,
});
```

### Respect Reduced Motion

```typescript
const respectsReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (respectsReducedMotion) {
  // Disable ongoing animations or use gentler alternatives
  const config = { type: 'Flash' }; // Instead of intense animations
} else {
  const config = { type: 'Bounce' };
}
```

## Common Patterns

### Button Call-to-Action

```typescript
const ctaAnimation = getWebAnimation(button, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Pulse',
  },
  duration: 1500,
  iterations: Infinity,
  alternate: true,
});

// Start on hover, stop on blur
button.addEventListener('mouseenter', () => ctaAnimation.play());
button.addEventListener('mouseleave', () => ctaAnimation.pause());
```

### Loading Spinner

```typescript
const loadingAnimation = getWebAnimation(spinner, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Spin',
    direction: 'clockwise',
  },
  duration: 1000,
  iterations: Infinity,
});

// Control with loading state
function setLoading(isLoading) {
  if (isLoading) {
    loadingAnimation.play();
  } else {
    loadingAnimation.cancel();
  }
}
```

### Attention-Seeking Element

```typescript
const attentionAnimation = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Wiggle',
    intensity: 0.6,
  },
  duration: 500,
  iterations: 3, // Limited repetitions
  alternate: true,
});

// Trigger attention
attentionAnimation.play();
```

### Ambient Background Motion

```typescript
const ambientAnimation = getWebAnimation(backgroundElement, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Breathe',
    direction: 'center',
    distance: { value: 5, unit: 'px' },
  },
  duration: 4000,
  iterations: Infinity,
  alternate: true,
});

// Continuous ambient motion
ambientAnimation.play();
```

## Battery and Performance Considerations

### Mobile Optimization

```typescript
// Check if device likely has battery constraints
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent,
);

if (isMobile) {
  // Use lighter animations
  config = { type: 'Flash' };
} else {
  // Full-featured animations
  config = { type: 'Rubber' };
}
```

### Intersection Observer Integration

```typescript
// Only animate visible elements
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const animation = entry.target.animation;
    if (entry.isIntersecting) {
      animation.play();
    } else {
      animation.pause();
    }
  });
});

elements.forEach((el) => observer.observe(el));
```

---

**Next**: Explore [Scroll Animations](scroll-animations.md) for scroll-driven effects, or return to the [Category Overview](README.md).
