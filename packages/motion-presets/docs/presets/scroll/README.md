# Scroll Animations

Scroll-driven effects that respond to viewport position for immersive storytelling and progressive disclosure. These animations create smooth, synchronized effects tied to the user's scroll progress.

## Complete Preset List (19 presets)

### 📐 Transform-Based

| Animation                                | Complexity | Range Support | Directions | Description                 |
| ---------------------------------------- | ---------- | ------------- | ---------- | --------------------------- |
| **[ParallaxScroll](parallax-scroll.md)** | Simple     | ✓             | -          | Classic parallax movement   |
| **[MoveScroll](move-scroll.md)**         | Medium     | ✓             | 360°       | Directional movement        |
| **[GrowScroll](grow-scroll.md)**         | Medium     | ✓             | 9-way      | Scale from specific origins |
| **[ShrinkScroll](shrink-scroll.md)**     | Medium     | ✓             | 9-way      | Scale shrinking effects     |
| **[SlideScroll](slide-scroll.md)**       | Medium     | ✓             | 4-way      | Sliding movement effects    |
| **[SpinScroll](spin-scroll.md)**         | Medium     | ✓             | 2-way      | Rotation with scaling       |
| **[PanScroll](pan-scroll.md)**           | Medium     | ✓             | 2-way      | Horizontal panning motion   |
| **[SkewPanScroll](skew-pan-scroll.md)**  | Medium     | ✓             | 2-way      | Skewed panning effects      |
| **[StretchScroll](stretch-scroll.md)**   | Medium     | ✓             | -          | Vertical stretching effects |

### 🎭 Opacity & Visibility

| Animation                        | Complexity | Range Support | Description               |
| -------------------------------- | ---------- | ------------- | ------------------------- |
| **[FadeScroll](fade-scroll.md)** | Simple     | ✓             | Opacity changes on scroll |
| **[BlurScroll](blur-scroll.md)** | Simple     | ✓             | Blur-to-focus transitions |

### 📺 3D Perspective

| Animation                             | Complexity | Range Support | Directions | Description                 |
| ------------------------------------- | ---------- | ------------- | ---------- | --------------------------- |
| **[ArcScroll](arc-scroll.md)**        | Complex    | ✓             | 2-way      | Curved 3D motion paths      |
| **[FlipScroll](flip-scroll.md)**      | Medium     | ✓             | 2-way      | 3D flip rotations           |
| **[Spin3dScroll](spin-3d-scroll.md)** | Complex    | ✓             | -          | 3D rotation with depth      |
| **[TiltScroll](tilt-scroll.md)**      | Complex    | ✓             | 2-way      | Perspective tilting effects |
| **[TurnScroll](turn-scroll.md)**      | Complex    | ✓             | 2-way      | Complex 3D turning          |

### ✂️ Clip & Shape

| Animation                                | Complexity | Range Support | Directions | Description             |
| ---------------------------------------- | ---------- | ------------- | ---------- | ----------------------- |
| **[RevealScroll](reveal-scroll.md)**     | Medium     | ✓             | 4-way      | Clean clip-path reveals |
| **[ShapeScroll](shape-scroll.md)**       | Complex    | ✓             | 5 shapes   | Morphing shape reveals  |
| **[ShuttersScroll](shutters-scroll.md)** | Complex    | ✓             | 4-way      | Multi-segment reveals   |

## Quick Reference

### By Use Case

#### Hero & Background Elements

**Best**: ParallaxScroll, FadeScroll, BlurScroll  
**Alternative**: MoveScroll, GrowScroll

#### Content Block Reveals

**Best**: RevealScroll, SlideScroll, FadeScroll  
**Alternative**: GrowScroll, MoveScroll

#### Gallery & Media

**Best**: GrowScroll, FlipScroll, TiltScroll  
**Alternative**: ArcScroll, ShapeScroll

#### Text & Typography

**Best**: FadeScroll, RevealScroll, MoveScroll  
**Alternative**: BlurScroll, SlideScroll

#### Creative & Artistic

**Best**: ArcScroll, TurnScroll, ShapeScroll  
**Alternative**: StretchScroll, ShuttersScroll

### By Range Support

#### `in` - Entrance Effects

Elements animate as they enter the viewport

- All animations support this range

#### `out` - Exit Effects

Elements animate as they leave the viewport

- FadeScroll, BlurScroll, RevealScroll, ShapeScroll

#### `continuous` - Full Journey

Animation spans the entire scroll interaction

- ParallaxScroll, MoveScroll, TiltScroll, PanScroll

### By Performance

#### GPU Optimized (60fps)

- ParallaxScroll, FadeScroll, SlideScroll, SpinScroll

#### Moderate Performance

- MoveScroll, GrowScroll, FlipScroll, BlurScroll

#### Resource Intensive

- ArcScroll, TurnScroll, StretchScroll, ShuttersScroll

## Common Configuration Patterns

### Basic Scroll Animation

```typescript
import { getScrubScene } from '@wix/motion';

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
    element: document.body,
  },
);
```

### Viewport Range Control

```typescript
// Animation starts when element is 20% visible
const scene = getScrubScene(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'FadeScroll',
      range: 'in',
    },
    startOffset: {
      name: 'entry',
      offset: { value: 20, unit: 'percentage' },
    },
    endOffset: {
      name: 'cover',
      offset: { value: 0, unit: 'percentage' },
    },
  },
  {
    trigger: 'view-progress',
    element: element,
  },
);
```

### Staggered Scroll Reveals

```typescript
// Cards reveal one by one as they scroll into view
document.querySelectorAll('.card').forEach((card, index) => {
  getScrubScene(
    card,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'RevealScroll',
        direction: 'bottom',
        range: 'in',
      },
      startOffset: {
        name: 'entry',
        offset: { value: index * 10, unit: 'percentage' },
      },
    },
    {
      trigger: 'view-progress',
      element: card,
    },
  );
});
```

### Hero Parallax Setup

```typescript
// Multi-layer parallax background
const bgLayers = [
  { element: '.bg-layer-1', speed: 0.2 },
  { element: '.bg-layer-2', speed: 0.4 },
  { element: '.bg-layer-3', speed: 0.6 },
];

bgLayers.forEach((layer) => {
  getScrubScene(
    document.querySelector(layer.element),
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'ParallaxScroll',
        speed: layer.speed,
        range: 'continuous',
      },
    },
    {
      trigger: 'view-progress',
      element: document.body,
    },
  );
});
```

## Advanced Patterns

### Intersection-Based Animation

```typescript
// Only animate when element enters viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Start scroll animation
      const scene = getScrubScene(entry.target, scrollConfig, trigger);
      entry.target.scrollScene = scene;
    } else {
      // Clean up animation
      if (entry.target.scrollScene) {
        entry.target.scrollScene.destroy();
      }
    }
  });
});

document.querySelectorAll('.scroll-animate').forEach((el) => {
  observer.observe(el);
});
```

### Responsive Scroll Behavior

```typescript
// Adjust animation based on screen size
const isMobile = window.innerWidth < 768;

const scrollConfig = {
  type: 'ScrubAnimationOptions',
  namedEffect: isMobile
    ? { type: 'FadeScroll', range: 'in' } // Simple on mobile
    : { type: 'ArcScroll', direction: 'horizontal' }, // Complex on desktop
};
```

### Performance-Aware Scroll

```typescript
// Monitor scroll performance
let lastFrameTime = 0;
const performanceThreshold = 16; // 60fps

function createOptimizedScrollAnimation(element, config) {
  const startTime = performance.now();

  const scene = getScrubScene(element, config, trigger);

  // Monitor performance
  const checkPerformance = () => {
    const currentTime = performance.now();
    const frameTime = currentTime - lastFrameTime;

    if (frameTime > performanceThreshold) {
      console.warn('Scroll animation dropping frames');
      // Could switch to simpler animation here
    }

    lastFrameTime = currentTime;
    requestAnimationFrame(checkPerformance);
  };

  requestAnimationFrame(checkPerformance);
  return scene;
}
```

### Mobile Optimization

```typescript
const isMobile = window.innerWidth < 768;
const isLowEnd = navigator.hardwareConcurrency < 4;

const parallaxConfig = {
  type: 'ScrubAnimationOptions',
  namedEffect: {
    type: 'ParallaxScroll',
    speed: isMobile || isLowEnd ? 0.2 : 0.5, // Gentler on mobile
    range: 'continuous',
  },
};
```

## Browser Support & Polyfills

### ViewTimeline API Support

```typescript
// Feature detection and progressive enhancement
if (window.ViewTimeline) {
  // Native ViewTimeline API support
  const scene = getWebAnimation(element, config, trigger);
} else {
  // Fallback to using a polyfill
  const scene = getScrubScene(element, config, trigger);
  // pass scene to polyfill library
}
```

### Reduced Motion Integration

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable scroll animations or use gentler alternatives
  const config = { type: 'FadeScroll', range: 'in' };
} else {
  // Full scroll animation experience
  const config = { type: 'ArcScroll', direction: 'horizontal' };
}
```

## Framework Integration

### React Hook

```typescript
import React, { useEffect, useRef } from 'react';
import { getScrubScene } from '@wix/motion';

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  range?: 'in' | 'out' | 'continuous';
  className?: string;
}

function ParallaxScroll({
  children,
  speed = 0.5,
  range = 'continuous',
  className
}: ParallaxProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    sceneRef.current = getScrubScene(elementRef.current, {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'ParallaxScroll',
        speed,
        range
      }
    }, {
      trigger: 'view-progress',
      element: document.body
    });

    return () => {
      if (sceneRef.current?.destroy) {
        sceneRef.current.destroy();
      }
    };
  }, [speed, range]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

// Usage
function Hero() {
  return (
    <section className="hero">
      <ParallaxScroll speed={0.3} className="hero-bg">
        <img src="hero-background.jpg" alt="Hero background" />
      </ParallaxScroll>

      <div className="hero-content">
        <h1>Hero Title</h1>
        <p>Hero description</p>
      </div>
    </section>
  );
}
```

### Vue Component

```vue
<template>
  <div ref="element" :class="className">
    <slot />
  </div>
</template>

<script>
import { getScrubScene } from '@wix/motion';

export default {
  props: {
    speed: { type: Number, default: 0.5 },
    range: { type: String, default: 'continuous' },
    className: { type: String, default: '' },
    trigger: { type: String, default: 'body' }, // 'body' or 'element'
  },

  data() {
    return {
      scene: null,
    };
  },

  mounted() {
    this.setupParallax();
  },

  beforeUnmount() {
    this.destroyParallax();
  },

  watch: {
    speed() {
      this.restartParallax();
    },
    range() {
      this.restartParallax();
    },
    trigger() {
      this.restartParallax();
    },
  },

  methods: {
    setupParallax() {
      if (!this.$refs.element) return;

      const triggerElement = this.trigger === 'body' ? document.body : this.$refs.element;

      this.scene = getScrubScene(
        this.$refs.element,
        {
          type: 'ScrubAnimationOptions',
          namedEffect: {
            type: 'ParallaxScroll',
            speed: this.speed,
            range: this.range,
          },
        },
        {
          trigger: 'view-progress',
          element: triggerElement,
        },
      );
    },

    destroyParallax() {
      if (this.scene?.destroy) {
        this.scene.destroy();
        this.scene = null;
      }
    },

    restartParallax() {
      this.destroyParallax();
      this.$nextTick(() => {
        this.setupParallax();
      });
    },
  },
};
</script>
```

## Accessibility

### Reduced Motion Support

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable parallax scrolling
  console.log('Parallax disabled for reduced motion preference');
} else {
  // Enable parallax
  setupParallax();
}
```

---

**[Back to All Presets](../) | [Browse Other Categories](../../categories/)**
