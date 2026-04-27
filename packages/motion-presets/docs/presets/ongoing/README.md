# Ongoing Animations

Time-based looping animations designed to create continuous movement and draw user attention. Perfect for call-to-action emphasis, loading states, and ambient motion.

## Complete Preset List (16 presets)

### 💓 Rhythmic Scaling

| Animation                 | Complexity | Description                   |
| ------------------------- | ---------- | ----------------------------- |
| **[Pulse](pulse.md)**     | Simple     | Smooth scale breathing effect |
| **[Breathe](breathe.md)** | Medium     | Organic movement with scaling |

### 🏃 Movement & Position

| Animation               | Complexity | Directions | Description                |
| ----------------------- | ---------- | ---------- | -------------------------- |
| **[Wiggle](wiggle.md)** | Medium     | -          | Random shake movement      |
| **[Poke](poke.md)**     | Medium     | 4-way      | Directional poking motion  |
| **[Cross](cross.md)**   | Complex    | 8-way      | Multi-directional crossing |

### 🔄 Rotation & Spin

| Animation           | Complexity | Directions | Description          |
| ------------------- | ---------- | ---------- | -------------------- |
| **[Spin](spin.md)** | Simple     | 2-way      | Continuous rotation  |
| **[Flip](flip.md)** | Medium     | 2-way      | 3D flip rotation     |
| **[Fold](fold.md)** | Complex    | 4-way      | 3D folding animation |

### ⚡ Dynamic Effects

| Animation               | Complexity | Description              |
| ----------------------- | ---------- | ------------------------ |
| **[Bounce](bounce.md)** | Medium     | Vertical bouncing motion |
| **[Rubber](rubber.md)** | Medium     | Elastic scaling effect   |
| **[Jello](jello.md)**   | Medium     | Gelatinous wobble effect |
| **[Swing](swing.md)**   | Complex    | Pendulum swinging motion |

### ✨ Visual Effects

| Animation             | Complexity | Description             |
| --------------------- | ---------- | ----------------------- |
| **[Flash](flash.md)** | Simple     | Opacity blinking effect |

### 🎪 Special Effects (Experimental)

| Animation             | Complexity | Description               | Status      |
| --------------------- | ---------- | ------------------------- | ----------- |
| **[Blink](blink.md)** | Complex    | Random blinking teleport  | ⚠️ Disabled |
| **[DVD](dvd.md)**     | Medium     | Bouncing corner-to-corner | ⚠️ Disabled |

_Note: Experimental animations are currently disabled in production but available in development environments._

## Quick Reference

### By Use Case

#### Call-to-Action Elements

**Best**: Pulse, Bounce, Wiggle  
**Alternative**: Flash, Poke

#### Loading & Processing States

**Best**: Spin, Pulse, Flash  
**Alternative**: Rubber, Breathe

#### Ambient Interface Motion

**Best**: Breathe, Pulse (soft), Swing (soft)  
**Alternative**: Float, Cross

#### Attention & Notifications

**Best**: Wiggle, Flash, Bounce  
**Alternative**: Poke, Pulse (hard)

#### Creative & Playful Elements

**Best**: Jello, Rubber, Bounce  
**Alternative**: Flip, Fold, Cross

### By Power Level Support

#### Full Power Control

- Pulse, Spin, Poke, Bounce, Rubber, Jello, Wiggle, Swing, Flip, Fold

#### Fixed Configuration

- Breathe, Flash, Cross

#### Experimental

- Blink, DVD (disabled in production)

### By Performance

#### Lightweight (GPU Optimized)

- Pulse, Spin, Flash, Bounce

#### Moderate Performance

- Wiggle, Poke, Rubber, Jello, Breathe

#### Resource Intensive

- Swing, Flip, Fold, Cross

## Common Configuration Patterns

### Basic Looping Animation

```typescript
const animation = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Pulse',
  },
  duration: 2000,
  iterations: Infinity, // Loop forever
  alternate: true, // Ping-pong effect
});
```

### Controlled Loop Count

```typescript
// Run animation 5 times then stop
const limitedAnimation = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'Bounce' },
  duration: 1000,
  iterations: 5,
  alternate: true,
});
```

### Attention Sequence

```typescript
// Wiggle 3 times to get attention
function drawAttention(element) {
  return getWebAnimation(element, {
    type: 'TimeAnimationOptions',
    namedEffect: {
      type: 'Wiggle',
      intensity: 0.8,
    },
    duration: 500,
    iterations: 3,
    alternate: true,
  });
}
```

### Loading State Management

```typescript
class LoadingSpinner {
  constructor(element) {
    this.element = element;
    this.animation = null;
  }

  start() {
    this.animation = getWebAnimation(this.element, {
      type: 'TimeAnimationOptions',
      namedEffect: {
        type: 'Spin',
        direction: 'clockwise',
      },
      duration: 1000,
      iterations: Infinity,
    });
    this.animation.play();
  }

  stop() {
    if (this.animation) {
      this.animation.cancel();
      this.animation = null;
    }
  }
}
```

## Framework Integration Patterns

### React Hook for Ongoing Animations

```typescript
import { useEffect, useRef } from 'react';
import { getWebAnimation } from '@wix/motion';

function useOngoingAnimation(
  animationType: string,
  options: any = {},
  enabled: boolean = true
) {
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (!elementRef.current || !enabled) return;

    animationRef.current = getWebAnimation(elementRef.current, {
      type: 'TimeAnimationOptions',
      namedEffect: { type: animationType, ...options },
      duration: options.duration || 2000,
      iterations: Infinity,
      alternate: true
    });

    animationRef.current.play();

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [animationType, enabled, JSON.stringify(options)]);

  return elementRef;
}

// Usage
function PulsingButton({ children }) {
  const buttonRef = useOngoingAnimation('Pulse', {}, true);

  return (
    <button ref={buttonRef}>
      {children}
    </button>
  );
}
```

### Vue Composition API

```typescript
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { getWebAnimation } from '@wix/motion';

export function useOngoingAnimation(
  animationType: string,
  options: any = {},
  enabled: boolean = true,
) {
  const elementRef = ref<HTMLElement>();
  let animation: any = null;

  const startAnimation = () => {
    if (!elementRef.value || !enabled) return;

    animation = getWebAnimation(elementRef.value, {
      type: 'TimeAnimationOptions',
      namedEffect: { type: animationType, ...options },
      duration: options.duration || 2000,
      iterations: Infinity,
      alternate: true,
    });

    animation.play();
  };

  const stopAnimation = () => {
    if (animation) {
      animation.cancel();
      animation = null;
    }
  };

  watch(
    () => enabled,
    (newEnabled) => {
      if (newEnabled) {
        startAnimation();
      } else {
        stopAnimation();
      }
    },
  );

  onMounted(startAnimation);
  onUnmounted(stopAnimation);

  return { elementRef, startAnimation, stopAnimation };
}
```

## Performance Considerations

### Battery & Resource Management

```typescript
// Pause animations when page is hidden
document.addEventListener('visibilitychange', () => {
  const ongoingAnimations = document.querySelectorAll('[data-ongoing-animation]');

  if (document.hidden) {
    // Pause all ongoing animations
    ongoingAnimations.forEach((el) => {
      if (el.animation) el.animation.pause();
    });
  } else {
    // Resume animations
    ongoingAnimations.forEach((el) => {
      if (el.animation) el.animation.play();
    });
  }
});
```

### Intersection Observer Integration

```typescript
// Only animate visible elements
const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const animation = entry.target.ongoingAnimation;

    if (entry.isIntersecting) {
      animation?.play();
    } else {
      animation?.pause();
    }
  });
});

// Observe ongoing animation elements
document.querySelectorAll('[data-ongoing]').forEach((el) => {
  animationObserver.observe(el);
});
```

## Framework Integration

### React Hook

```typescript
import React, { useEffect, useRef } from 'react';
import { getWebAnimation } from '@wix/motion';

interface PulseProps {
  children: React.ReactNode;
  intensity?: number;
  duration?: number;
  enabled?: boolean;
  onHover?: 'pause' | 'stop' | 'continue';
}

function Pulse({
  children,
  intensity = 1.0,
  duration = 1500,
  enabled = true,
  onHover = 'continue'
}: PulseProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (!elementRef.current || !enabled) return;

    animationRef.current = getWebAnimation(elementRef.current, {
      type: 'TimeAnimationOptions',
      namedEffect: {
        type: 'Pulse',
        intensity
      },
      duration,
      iterations: Infinity,
      alternate: true
    });

    animationRef.current.play();

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [intensity, duration, enabled]);

  const handleMouseEnter = () => {
    if (onHover === 'pause' && animationRef.current) {
      animationRef.current.pause();
    } else if (onHover === 'stop' && animationRef.current) {
      animationRef.current.cancel();
    }
  };

  const handleMouseLeave = () => {
    if ((onHover === 'pause' || onHover === 'stop') && animationRef.current) {
      animationRef.current.play();
    }
  };

  return (
    <div
      ref={elementRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
```

### Vue Component

```vue
<template>
  <div ref="element" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <slot />
  </div>
</template>

<script>
import { getWebAnimation } from '@wix/motion';

export default {
  props: {
    intensity: { type: Number, default: 1.0 },
    duration: { type: Number, default: 1500 },
    enabled: { type: Boolean, default: true },
    pauseOnHover: { type: Boolean, default: false },
  },

  data() {
    return {
      animation: null,
    };
  },

  watch: {
    enabled(newValue) {
      if (newValue) {
        this.startPulse();
      } else {
        this.stopPulse();
      }
    },
  },

  mounted() {
    if (this.enabled) {
      this.startPulse();
    }
  },

  beforeUnmount() {
    this.stopPulse();
  },

  methods: {
    startPulse() {
      if (!this.$refs.element) return;

      this.animation = getWebAnimation(this.$refs.element, {
        type: 'TimeAnimationOptions',
        namedEffect: {
          type: 'Pulse',
          intensity: this.intensity,
        },
        duration: this.duration,
        iterations: Infinity,
        alternate: true,
      });

      this.animation.play();
    },

    stopPulse() {
      if (this.animation) {
        this.animation.cancel();
        this.animation = null;
      }
    },

    handleMouseEnter() {
      if (this.pauseOnHover && this.animation) {
        this.animation.pause();
      }
    },

    handleMouseLeave() {
      if (this.pauseOnHover && this.animation) {
        this.animation.play();
      }
    },
  },
};
</script>
```

## Performance Tips

- **Use CSS mode** for simple pulses that don't require control
- **Limit concurrent pulses** - too many can be distracting
- **Consider pausing** on page visibility change for battery saving
- **Use shorter durations** on mobile for better perceived performance

### CSS Mode Alternative

```typescript
import { getCSSAnimation } from '@wix/motion';

// For simple pulse without JavaScript control
const cssRules = getCSSAnimation('elementId', {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'Pulse' },
  duration: 2000,
  iterations: Infinity,
  alternate: true,
});
```

## Accessibility

### Reduced Motion Support

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // No pulsing - maybe just a subtle opacity change
  element.style.opacity = '0.9';
} else {
  // Full pulse animation
  getWebAnimation(element, pulseConfig).play();
}
```

---

**[Back to All Presets](../) | [Browse Other Categories](../../categories/)**
