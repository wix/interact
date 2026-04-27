# BgParallax

Classic background parallax scrolling effect specifically designed for background media elements. Creates smooth depth and immersion by moving background layers at different speeds relative to scroll position.

## Overview

**Category**: Background Scroll  
**Complexity**: Simple  
**Performance**: GPU Optimized  
**Mobile Friendly**: Yes (with speed adjustment)

### Best Use Cases

- Hero section backgrounds with layered depth
- Large image backgrounds in landing pages
- Video backgrounds with subtle movement
- Multi-section background continuity
- Immersive storytelling backgrounds

### Target Elements

- Background media containers with `data-motion-part="BG_MEDIA"`
- Large background images and videos
- Hero section background layers
- Full-width background compositions

## Configuration

### TypeScript Interface

```typescript
export type BgParallax = BaseDataItemLike<'BgParallax'> & {
  speed?: number;
};
```

### Parameters

| Parameter | Type     | Default | Description                                  | Examples                   |
| --------- | -------- | ------- | -------------------------------------------- | -------------------------- |
| `speed`   | `number` | `0.5`   | Background movement speed relative to scroll | `0.1`, `0.3`, `0.5`, `0.8` |

### Speed Guidelines

- **`0.1 - 0.2`** - Very subtle parallax, professional interfaces
- **`0.3 - 0.4`** - Noticeable but gentle parallax effect
- **`0.5 - 0.6`** - Standard parallax, balanced movement
- **`0.7 - 0.8`** - Strong parallax, dramatic effect

### Automatic Measurements

BgParallax automatically measures component dimensions for accurate scroll calculations and responsive behavior.

## Usage Examples

### Basic Usage

```typescript
import { getWebAnimation } from '@wix/motion';

const element = document.querySelector('#hero-section');

const animation = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgParallax',
      speed: 0.3, // Background moves at 30% of scroll speed
    },
  },
  {
    trigger: 'view-progress',
    element,
  },
);
```

### Speed Variations

```typescript
// Subtle parallax for professional sites
const subtleAnimation = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgParallax',
      speed: 0.2,
    },
  },
  {
    trigger: 'view-progress',
    element: document.body,
  },
);

// Dramatic parallax for creative showcases
const dramaticAnimation = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgParallax',
      speed: 0.7,
    },
  },
  {
    trigger: 'view-progress',
    element,
  },
);

// Very slow, cinematic parallax
const cinematicAnimation = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgParallax',
      speed: 0.1,
    },
  },
  {
    trigger: 'view-progress',
    element,
  },
);
```

### Section-Scoped Parallax

```typescript
// Parallax relative to specific section
const sectionParallax = getScrubScene(
  '#section-background',
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'BgParallax',
      speed: 0.4,
    },
  },
  {
    trigger: 'view-progress',
    element: document.querySelector('#hero-section'), // Relative to section
  },
);
```

## Required HTML Structure

### Basic Setup

```html
<section id="hero-section" class="hero">
  <!-- Background container -->
  <div data-motion-part="BG_LAYER" class="bg-layer">
    <!-- Background media container (this gets animated) -->
    <div data-motion-part="BG_MEDIA" class="bg-media">
      <!-- Background image -->
      <img
        src="hero-background.jpg"
        alt="Hero background"
        data-motion-part="BG_IMG"
        class="bg-image"
      />
    </div>
  </div>

  <!-- Foreground content -->
  <div class="hero-content">
    <h1>Hero Title</h1>
    <p>Hero description</p>
  </div>
</section>
```

### Video Background Setup

```html
<section id="video-hero" class="video-section">
  <div data-motion-part="BG_LAYER" class="bg-layer">
    <div data-motion-part="BG_MEDIA" class="bg-media">
      <video data-motion-part="BG_IMG" class="bg-video" autoplay muted loop playsinline>
        <source src="hero-video.mp4" type="video/mp4" />
      </video>
    </div>
  </div>

  <div class="video-content">
    <h2>Video Hero</h2>
  </div>
</section>
```

## Common Patterns

### Multi-Layer Parallax Background

```typescript
// Create depth with multiple background layers
const backgroundLayers = [
  {
    selector: '#bg-layer-1',
    speed: 0.1, // Furthest layer - slowest
    zIndex: 1,
  },
  {
    selector: '#bg-layer-2',
    speed: 0.3, // Middle layer
    zIndex: 2,
  },
  {
    selector: '#bg-layer-3',
    speed: 0.5, // Nearest layer - fastest
    zIndex: 3,
  },
];

backgroundLayers.forEach((layer) => {
  const element = document.querySelector(layer.selector);
  if (element) {
    // Set z-index for layering
    element.style.zIndex = layer.zIndex;

    getWebAnimation(
      element,
      {
        type: 'ScrubAnimationOptions',
        namedEffect: {
          type: 'BgParallax',
          speed: layer.speed,
        },
      },
      {
        trigger: 'view-progress',
        element,
      },
    );
  }
});
```

### Full-Page Background Parallax

```typescript
// Continuous parallax across entire page
function setupFullPageParallax() {
  const sections = document.querySelectorAll('.section');

  sections.forEach((section, index) => {
    const speed = 0.2 + index * 0.1; // Vary speed: 0.2, 0.3, 0.4...

    animation = getWebAnimation(
      section,
      {
        type: 'ScrubAnimationOptions',
        namedEffect: {
          type: 'BgParallax',
          speed: speed,
        },
      },
      {
        trigger: 'view-progress',
        element: section,
      },
    );
  });
}
```

## CSS Requirements

### Essential Styles

```css
.bg-parallax-section {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

[data-motion-part='BG_LAYER'] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

[data-motion-part='BG_MEDIA'] {
  position: absolute;
  top: -10%; /* Extra space for upward movement */
  left: 0;
  width: 100%;
  height: 120%; /* Extra height for parallax range */
  will-change: transform;
  backface-visibility: hidden;
}

[data-motion-part='BG_IMG'] {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-content {
  position: relative;
  z-index: 2;
  /* Content styling */
}
```

### Mobile Optimization

```typescript
const isMobile = window.innerWidth < 768;
const isLowEnd = navigator.hardwareConcurrency < 4;

const parallaxConfig = {
  type: 'ScrubAnimationOptions',
  namedEffect: {
    type: 'BgParallax',
    speed: isMobile || isLowEnd ? 0.1 : 0.3, // Gentler on mobile/low-end
  },
};
```

### Battery-Conscious Implementation

```typescript
// Pause parallax when page is hidden
document.addEventListener('visibilitychange', () => {
  const parallaxElements = document.querySelectorAll('[data-bg-parallax]');

  if (document.hidden) {
    // Pause all parallax animations
    parallaxElements.forEach((el) => {
      if (el.parallaxScene) el.parallaxScene.destroy();
    });
  } else {
    // Resume parallax animations
    parallaxElements.forEach((el) => {
      setupBgParallax(el);
    });
  }
});
```

## Accessibility

### Reduced Motion Support

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable parallax - use static background
  console.log('BgParallax disabled for reduced motion preference');
} else {
  // Enable parallax effects
  setupBgParallax();
}
```

### Performance-Based Fallbacks

```typescript
// Automatic fallback for poor performance
let frameCount = 0;
let lastTime = performance.now();

function monitorParallaxPerformance() {
  frameCount++;
  const currentTime = performance.now();

  if (currentTime - lastTime >= 1000) {
    const fps = frameCount;

    if (fps < 24) {
      // Disable parallax on poor performance
      console.warn('Disabling BgParallax due to poor performance');
      document.querySelectorAll('[data-bg-parallax]').forEach((el) => {
        if (el.parallaxScene) el.parallaxScene.destroy();
      });
    }

    frameCount = 0;
    lastTime = currentTime;
  }
}
```

## Related Animations

### Same Category

- **[ImageParallax](image-parallax.md)** - Enhanced parallax with additional options
- **[BgPan](bg-pan.md)** - Horizontal background movement
- **[BgFade](bg-fade.md)** - Background fade effects

### Other Categories

- **[ParallaxScroll](../scroll/parallax-scroll.md)** - General element parallax
- **[MoveScroll](../scroll/move-scroll.md)** - Directional scroll movement

### Complementary Effects

- **Before**: Page load animations, hero entrances
- **After**: Content reveal animations, interaction states
- **Alongside**: Background fade overlays, zoom effects

## Troubleshooting

### Common Issues

- **Background jumping**: Ensure extra height (120%) on BG_MEDIA element
- **Performance issues**: Reduce speed or limit number of parallax backgrounds
- **Mobile scrolling problems**: Use gentler speeds on touch devices

### Debug Tips

- Use browser timeline tools to monitor scroll performance
- Check for layout thrashing in Chrome DevTools "Rendering" tab
- Verify proper HTML structure with required data attributes

---

## Interactive Example

▶️ **[Try it in Storybook](../../playground/)** - Experiment with BgParallax speeds and setups

---

**[Back to Background Scroll Animations](../) | [Back to All Presets](../../)**
