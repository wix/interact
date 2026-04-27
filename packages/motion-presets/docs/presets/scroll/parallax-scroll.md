# ParallaxScroll

Classic parallax scrolling effect where elements move at different speeds relative to the scroll position. Creates depth and immersion by making background elements move slower than foreground content.

## Overview

**Category**: Scroll  
**Complexity**: Simple  
**Performance**: GPU Optimized  
**Mobile Friendly**: Yes (with speed adjustment)

### Best Use Cases

- Hero section backgrounds and layered content
- Image backgrounds that should move independently
- Creating depth in landing pages and storytelling
- Multi-layer background compositions
- Video backgrounds with subtle movement

### Target Elements

- Background images and media
- Large content sections and hero areas
- Decorative elements and illustrations
- Video backgrounds and overlays

## Configuration

### TypeScript Interface

```typescript
export type ParallaxScroll = BaseDataItemLike<'ParallaxScroll'> & {
  speed: number;
  range?: EffectScrollRange;
};
```

### Parameters

| Parameter | Type     | Default        | Description                        | Examples                        |
| --------- | -------- | -------------- | ---------------------------------- | ------------------------------- |
| `speed`   | `number` | `0.5`          | Parallax speed relative to scroll  | `0.1`, `0.5`, `1.0`, `2.0`      |
| `range`   | `string` | `'continuous'` | When the parallax effect is active | `'in'`, `'out'`, `'continuous'` |

### Speed Values

- **`0.1 - 0.3`** - Very slow parallax, subtle depth effect
- **`0.4 - 0.6`** - Standard parallax, noticeable but natural
- **`0.7 - 1.0`** - Fast parallax, dramatic movement
- **`> 1.0`** - Reverse or exaggerated parallax effects

### Range Options

- **`continuous`** - Parallax active throughout scroll interaction (default)
- **`in`** - Parallax only as element enters viewport
- **`out`** - Parallax only as element exits viewport

## Usage Examples

### Basic Usage

```typescript
import { getWebAnimation } from '@wix/motion';

const scene = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ParallaxScroll',
      speed: 0.5, // Element moves at 50% of scroll speed
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
// Slow, subtle parallax for professional sites
const subtleParallax = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ParallaxScroll',
      speed: 0.2,
      range: 'continuous',
    },
  },
  {
    trigger: 'view-progress',
    element,
  },
);

// Fast, dramatic parallax for creative sites
const dramaticParallax = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ParallaxScroll',
      speed: 0.8,
      range: 'continuous',
    },
  },
  {
    trigger: 'view-progress',
    element,
  },
);

// Reverse parallax (moves faster than scroll)
const reverseParallax = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ParallaxScroll',
      speed: 1.5, // Moves 50% faster than scroll
      range: 'continuous',
    },
  },
  {
    trigger: 'view-progress',
    element,
  },
);
```

### Range-Based Parallax

```typescript
// Parallax only during element entrance
const entranceParallax = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ParallaxScroll',
      speed: 0.6,
      range: 'in',
    },
  },
  {
    trigger: 'view-progress',
    element, // Relative to element itself
  },
);

// Parallax only during element exit
const exitParallax = getScrgetWebAnimationubScene(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ParallaxScroll',
      speed: 0.4,
      range: 'out',
    },
  },
  {
    trigger: 'view-progress',
    element,
  },
);
```

### Custom Viewport Offsets

```typescript
// Start parallax when element is 20% visible
const customRangeParallax = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'ParallaxScroll',
      speed: 0.5,
    },
    startOffset: {
      name: 'entry',
      offset: { value: 20, unit: 'percentage' },
    },
    endOffset: {
      name: 'exit',
      offset: { value: 80, unit: 'percentage' },
    },
  },
  {
    trigger: 'view-progress',
    element,
  },
);
```

## Common Patterns

### Multi-Layer Parallax

```typescript
// Create depth with multiple parallax layers
const parallaxLayers = [
  { selector: '.bg-layer-far', speed: 0.1 },
  { selector: '.bg-layer-mid', speed: 0.3 },
  { selector: '.bg-layer-near', speed: 0.6 },
  { selector: '.fg-content', speed: 1.0 }, // Normal scroll speed
];

parallaxLayers.forEach((layer) => {
  const element = document.querySelector(layer.selector);
  if (element) {
    getScrubScene(
      element,
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
        element,
      },
    );
  }
});
```

### Gallery Parallax

```typescript
// Parallax effect for image gallery
document.querySelectorAll('.gallery-item').forEach((item, index) => {
  const speed = 0.4 + (index % 3) * 0.1; // Vary speed: 0.4, 0.5, 0.6

  getWebAnimation(
    item,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'ParallaxScroll',
        speed: speed,
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

### Video Background Parallax

```typescript
// Subtle parallax for video backgrounds
function setupVideoParallax() {
  const videoContainer = document.querySelector('.video-background');

  getWebAnimation(
    videoContainer,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'ParallaxScroll',
        speed: 0.25, // Very subtle for video
        range: 'continuous',
      },
    },
    {
      trigger: 'view-progress',
      element: videoContainer,
    },
  );
}
```

### Section-Based Parallax

```typescript
// Different parallax for each page section
document.querySelectorAll('.parallax-section').forEach((section) => {
  const background = section.querySelector('.section-bg');
  const speed = parseFloat(section.dataset.parallaxSpeed) || 0.5;

  if (background) {
    getWebAnimation(
      background,
      {
        type: 'ScrubAnimationOptions',
        namedEffect: {
          type: 'ParallaxScroll',
          speed: speed,
          range: 'continuous',
        },
      },
      {
        trigger: 'view-progress',
        element: section,
      },
    );
  }
});
```

### Vestibular Safety

ParallaxScroll creates relative motion which may trigger vestibular disorders. Always respect reduced motion preferences and provide alternatives.

## Browser Support

- **Web Animations API**: Full support in modern browsers
- **ViewTimeline API**: Chrome 115+, polyfill available for other browsers

## Related Animations

### Same Category

- **[MoveScroll](move-scroll.md)** - Directional movement with custom angles
- **[FadeScroll](fade-scroll.md)** - Opacity-based scroll effects
- **[SlideScroll](slide-scroll.md)** - Sliding movement effects

### Other Categories

- **[BgParallax](../background-scroll/bg-parallax.md)** - Specialized background parallax
- **[ImageParallax](../background-scroll/image-parallax.md)** - Enhanced image parallax

### Complementary Effects

- **Before**: Element entrance animations
- **After**: Hover effects, interaction states
- **Alongside**: Fade effects, color transitions

## Troubleshooting

### Common Issues

- **Choppy scrolling**: Reduce number of parallax elements or simplify effects
- **Element jumping**: Check for conflicting CSS transforms
- **Mobile performance**: Use gentler speeds and consider disabling on low-end devices

---

## Interactive Example

▶️ **[Try it in Storybook](../../playground/)** - Experiment with ParallaxScroll speeds and ranges

---

**[Back to Scroll Animations](../) | [Back to All Presets](../../)**
