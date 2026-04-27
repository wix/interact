# Background Scroll Animations

Specialized effects designed for background media elements and hero sections. Perfect for creating immersive backgrounds, parallax landscapes, and cinematic scroll experiences.

## Complete Preset List (12 presets)

### 🌊 Parallax & Movement

| Animation                              | Complexity | Measurement | Directions | Description                          |
| -------------------------------------- | ---------- | ----------- | ---------- | ------------------------------------ |
| **[BgParallax](bg-parallax.md)**       | Simple     | ✓           | -          | Classic background parallax movement |
| **[ImageParallax](image-parallax.md)** | Medium     | ✓           | -          | Enhanced image parallax with options |
| **[BgPan](bg-pan.md)**                 | Simple     | ✓           | 2-way      | Horizontal panning movement          |

### 🔍 Zoom & Scale

| Animation                         | Complexity | Measurement | Directions | Description                 |
| --------------------------------- | ---------- | ----------- | ---------- | --------------------------- |
| **[BgZoom](bg-zoom.md)**          | Complex    | ✓           | 2-way      | Dynamic zoom in/out effects |
| **[BgCloseUp](bg-close-up.md)**   | Medium     | ✓           | -          | Perspective zoom with fade  |
| **[BgPullBack](bg-pull-back.md)** | Medium     | ✓           | -          | 3D pull-back effect         |

### 🎭 Fade & Opacity

| Animation                         | Complexity | Measurement | Description                  |
| --------------------------------- | ---------- | ----------- | ---------------------------- |
| **[BgFade](bg-fade.md)**          | Simple     | ✓           | Directional fade transitions |
| **[BgFadeBack](bg-fade-back.md)** | Medium     | ✓           | Scale + fade combination     |

### 🔄 Rotation & Transform

| Animation                    | Complexity | Measurement | Directions | Description             |
| ---------------------------- | ---------- | ----------- | ---------- | ----------------------- |
| **[BgRotate](bg-rotate.md)** | Simple     | -           | 2-way      | Smooth rotation effects |
| **[BgSkew](bg-skew.md)**     | Medium     | ✓           | 2-way      | Skewing transformation  |

### 🎨 Advanced 3D

| Animation                     | Complexity | Measurement | Description             |
| ----------------------------- | ---------- | ----------- | ----------------------- |
| **[BgFake3D](bg-fake-3d.md)** | Complex    | ✓           | Multi-layer 3D parallax |

### 🛠️ Utility

| Animation                    | Complexity | Description             |
| ---------------------------- | ---------- | ----------------------- |
| **[BgReveal](bg-reveal.md)** | Simple     | Measurement-only reveal |

## Quick Reference

### By Use Case

#### Hero Sections

**Best**: BgParallax, BgZoom, BgFade  
**Alternative**: ImageParallax, BgCloseUp

#### Video Backgrounds

**Best**: BgParallax, BgPan, BgFade  
**Alternative**: BgZoom, BgRotate

#### Image Galleries

**Best**: BgZoom, BgCloseUp, BgPullBack  
**Alternative**: BgFake3D, BgSkew

#### Creative Showcases

**Best**: BgFake3D, BgSkew, BgRotate  
**Alternative**: BgZoom, BgPullBack

#### Landing Pages

**Best**: ImageParallax, BgParallax, BgCloseUp  
**Alternative**: BgFade, BgZoom

### By Complexity

#### Simple (Minimal configuration)

- BgParallax, BgPan, BgFade, BgRotate, BgReveal

#### Medium (Directional/Scale controls)

- ImageParallax, BgCloseUp, BgPullBack, BgFadeBack, BgSkew

#### Complex (Multi-property/3D effects)

- BgZoom, BgFake3D

### By Performance

#### GPU Optimized (60fps)

- BgParallax, BgRotate, BgFade, BgReveal

#### Moderate Performance

- ImageParallax, BgPan, BgCloseUp, BgPullBack, BgFadeBack

#### Resource Intensive

- BgZoom, BgFake3D, BgSkew

## Target Element Structure

Background scroll animations target specific element parts using `data-motion-part` attributes:

### Required HTML Structure

```html
<!-- Main container -->
<section id="hero-section">
  <!-- Background layer container -->
  <div data-motion-part="BG_LAYER">
    <!-- Background media container -->
    <div data-motion-part="BG_MEDIA">
      <!-- Background image element -->
      <img src="background.jpg" data-motion-part="BG_IMG" />
    </div>
  </div>

  <!-- Foreground content -->
  <div class="hero-content">
    <h1>Hero Title</h1>
    <p>Hero description</p>
  </div>
</section>
```

### Motion Part Types

- **`BG_LAYER`** - Background container layer (for clipping the media and overlays)
- **`BG_MEDIA`** - Main background media container (for media resizing)
- **`BG_IMG`** - Background image element (for direct image styling)

## Common Configuration Patterns

### Basic Background Animation

```typescript
import { getWebAnimation } from '@wix/motion';

const bgAnimation = getWebAnimation(
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
    element: docuement.querySelector('#hero-section'),
  },
);
```

### Speed Control

```typescript
// Slow, subtle parallax
const subtleConfig = {
  type: 'BgParallax',
  speed: 0.1, // Very slow movement
};

// Fast, dramatic parallax
const dramaticConfig = {
  type: 'BgParallax',
  speed: 0.8, // Fast movement
};
```

### Directional Effects

```typescript
// Horizontal panning
const panConfig = {
  type: 'BgPan',
  direction: 'left', // 'left' | 'right'
  speed: 0.4,
};

// Zoom effects
const zoomConfig = {
  type: 'BgZoom',
  direction: 'in', // 'in' | 'out'
  zoom: 40,
};
```

### Multi-Layer Setup

```typescript
// Layer 1: Far background (slowest)
getWebAnimation(
  '.bg-layer-1',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgParallax',
      speed: 0.1,
    },
  },
  triggerConfig,
);

// Layer 2: Mid background
getWebAnimation(
  '.bg-layer-2',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgParallax',
      speed: 0.3,
    },
  },
  triggerConfig,
);

// Layer 3: Near background (fastest)
getWebAnimation(
  '.bg-layer-3',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgParallax',
      speed: 0.6,
    },
  },
  triggerConfig,
);
```

## Advanced Patterns

### Hero Section with Multiple Effects

```typescript
// Orchestrated hero background
function setupHeroBackground() {
  const heroSection = document.querySelector('#hero');

  // Background parallax
  getWebAnimation(
    heroSection,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'BgParallax',
        speed: 0.3,
      },
    },
    {
      trigger: 'view-progress',
      element: heroSection,
    },
  );

  // Overlay fade
  getWebAnimation(
    heroSection,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'BgFade',
        range: 'out',
      },
    },
    {
      trigger: 'view-progress',
      element: heroSection,
    },
  );

  // Zoom effect
  getWebAnimation(
    heroSection,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'BgZoom',
        direction: 'in',
        zoom: 20,
      },
    },
    {
      trigger: 'view-progress',
      element: heroSection,
    },
  );
}
```

### Responsive Background Behavior

```typescript
// Adjust effects based on screen size
const isMobile = window.innerWidth < 768;

const bgConfig = {
  type: 'ScrubAnimationOptions',
  namedEffect: isMobile
    ? { type: 'BgFade', range: 'in' } // Simple fade on mobile
    : { type: 'BgFake3D', stretch: 1.3 }, // Complex 3D on desktop
};
```

### Performance-Aware Background Animation

```typescript
// Check device capabilities
const isLowEnd = navigator.hardwareConcurrency < 4;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let backgroundConfig;

if (prefersReducedMotion) {
  // No animation - static background
  backgroundConfig = { type: 'BgReveal' };
} else if (isLowEnd) {
  // Simple animation for low-end devices
  backgroundConfig = { type: 'BgFade', range: 'in' };
} else {
  // Full animation for capable devices
  backgroundConfig = {
    type: 'BgParallax',
    speed: 0.3,
  };
}
```

### Video Background Integration

```typescript
// Video background with subtle parallax
function setupVideoBackground() {
  const videoContainer = document.querySelector('.video-bg-container');
  const section = document.querySelector('.video-section');

  // Very subtle parallax for video
  getWebAnimation(
    videoContainer,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'BgParallax',
        speed: 0.15, // Gentle movement for video
      },
    },
    {
      trigger: 'view-progress',
      element: section,
    },
  );

  // Optional fade overlay
  getWebAnimation(
    videoContainer,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'BgFade',
        range: 'out',
      },
    },
    {
      trigger: 'view-progress',
      element: section,
    },
  );
}
```

## CSS Requirements

### Basic Structure Styles

```css
.hero-section {
  position: relative;
  height: 100vh;
}

[data-motion-part='BG_LAYER'] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: clip;
}

[data-motion-part='BG_MEDIA'] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

[data-motion-part='BG_IMG'] {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  position: relative;
  z-index: 2;
  /* Content styles */
}
```

## Framework Integration

### React Component

```typescript
import React, { useEffect, useRef } from 'react';
import { getWebAnimation } from '@wix/motion';

interface BackgroundScrollProps {
  children: React.ReactNode;
  animationType: string;
  animationConfig?: any;
  className?: string;
}

function BackgroundScroll({
  children,
  animationType,
  animationConfig = {},
  className
}: BackgroundScrollProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    sceneRef.current = getWebAnimation(sectionRef.current, {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: animationType,
        ...animationConfig
      }
    }, {
      trigger: 'view-progress',
      element: sectionRef.current
    });

    return () => {
      if (sceneRef.current?.destroy) {
        sceneRef.current.destroy();
      }
    };
  }, [animationType, JSON.stringify(animationConfig)]);

  return (
    <section ref={sectionRef} className={className}>
      <div data-motion-part="BG_LAYER">
        <div data-motion-part="BG_MEDIA">
          {children}
        </div>
      </div>
    </section>
  );
}

// Usage
function Hero() {
  return (
    <BackgroundScroll
      animationType="BgParallax"
      animationConfig={{ speed: 0.3 }}
      className="hero-section"
    >
      <img
        src="hero-bg.jpg"
        alt="Hero background"
        data-motion-part="BG_IMG"
      />
    </BackgroundScroll>
  );
}
```

## Performance Monitoring

### Background Animation Performance

```typescript
// Monitor background scroll performance
class BackgroundPerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.monitor();
  }

  monitor() {
    this.frameCount++;
    const currentTime = performance.now();

    if (currentTime - this.lastTime >= 1000) {
      const fps = this.frameCount;

      if (fps < 30) {
        console.warn('Background animation performance degraded');
        this.optimizeAnimations();
      }

      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    requestAnimationFrame(() => this.monitor());
  }

  optimizeAnimations() {
    // Could switch to simpler animations or disable some effects
    document.querySelectorAll('[data-bg-animation]').forEach((el) => {
      // Simplify or disable complex animations
    });
  }
}

// Initialize performance monitoring
const performanceMonitor = new BackgroundPerformanceMonitor();
```

---

**[Back to All Presets](../) | [Browse Other Categories](../../categories/)**
