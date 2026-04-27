# Examples

Real-world animation patterns and implementations using Wix Motion.

## 📋 [Common Patterns](common-patterns.md)

Frequently used animation patterns and recipes for typical use cases.

**Includes**: Sequential animations, staggered reveals, hover effects, loading states, page transitions

## 🏢 [Real-World Implementations](real-world-implementations.md)

Complete examples from actual projects showing complex animation scenarios.

**Includes**: Landing pages, e-commerce, portfolios, dashboards, mobile apps

## 🎮 [Interactive Demos](interactive-demos.md)

Hands-on examples you can run and modify to learn animation concepts.

**Includes**: CodePen demos, playground configurations, step-by-step tutorials

---

## Quick Examples

### Hero Section Animation

```typescript
import { getWebAnimation } from '@wix/motion';

// Staggered entrance for hero elements
async function animateHero() {
  const title = getWebAnimation('#hero-title', {
    type: 'TimeAnimationOptions',
    namedEffect: { type: 'FadeIn' },
    duration: 800,
  });

  const subtitle = getWebAnimation('#hero-subtitle', {
    type: 'TimeAnimationOptions',
    namedEffect: { type: 'SlideIn', direction: 'bottom' },
    duration: 600,
    delay: 200,
  });

  const cta = getWebAnimation('#hero-cta', {
    type: 'TimeAnimationOptions',
    namedEffect: { type: 'BounceIn', direction: 'bottom' },
    duration: 800,
    delay: 400,
  });

  // Play all animations
  await Promise.all([title.play(), subtitle.play(), cta.play()]);
}
```

### Scroll-Driven Card Reveal

```typescript
import { getScrubScene } from '@wix/motion';

// Cards reveal as they scroll into view
document.querySelectorAll('.card').forEach((card, index) => {
  const scene = getScrubScene(
    card,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'FadeScroll',
        range: 'in',
        opacity: 0.8,
      },
    },
    {
      trigger: 'view-progress',
      element: card,
    },
  );
});
```

### Interactive Button Hover

```typescript
import { getWebAnimation } from '@wix/motion';

const button = document.querySelector('.interactive-btn');
let hoverAnimation;

button.addEventListener('mouseenter', () => {
  hoverAnimation = getWebAnimation(button, {
    type: 'TimeAnimationOptions',
    namedEffect: {
      type: 'Pulse',
      intensity: 1.1,
    },
    duration: 300,
  });
  hoverAnimation.play();
});

button.addEventListener('mouseleave', () => {
  if (hoverAnimation) {
    hoverAnimation.reverse();
  }
});
```

### Loading State Animation

```typescript
import { getWebAnimation } from '@wix/motion';

function startLoadingAnimation(element) {
  return getWebAnimation(element, {
    type: 'TimeAnimationOptions',
    namedEffect: {
      type: 'Spin',
      direction: 'clockwise',
    },
    duration: 1000,
    iterations: Infinity,
  });
}

function stopLoadingAnimation(animation) {
  animation.cancel();
}

// Usage
const loader = startLoadingAnimation('#loading-spinner');
// ... wait for data ...
stopLoadingAnimation(loader);
```

### Parallax Background

```typescript
import { getScrubScene } from '@wix/motion';

// Background moves slower than scroll speed
const bgScene = getScrubScene(
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

## Framework Examples

### React Component

```typescript
import React, { useEffect, useRef } from 'react';
import { getWebAnimation } from '@wix/motion';

function AnimatedCard({ children, delay = 0 }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const animation = getWebAnimation(cardRef.current, {
      type: 'TimeAnimationOptions',
      namedEffect: { type: 'FadeIn' },
      duration: 600,
      delay
    });

    animation.play();

    return () => animation.cancel();
  }, [delay]);

  return (
    <div ref={cardRef} className="card">
      {children}
    </div>
  );
}
```

### Vue Component

```vue
<template>
  <div ref="element" class="animated-element">
    <slot />
  </div>
</template>

<script>
import { getWebAnimation } from '@wix/motion';

export default {
  props: {
    animation: { type: String, default: 'FadeIn' },
    duration: { type: Number, default: 600 },
  },

  mounted() {
    this.startAnimation();
  },

  beforeUnmount() {
    if (this.animationInstance) {
      this.animationInstance.cancel();
    }
  },

  methods: {
    startAnimation() {
      this.animationInstance = getWebAnimation(this.$refs.element, {
        type: 'TimeAnimationOptions',
        namedEffect: { type: this.animation },
        duration: this.duration,
      });

      this.animationInstance.play();
    },
  },
};
</script>
```

---

**Want to see more?** Check out our [interactive playground](../../playground/) or browse the detailed pattern guides above.
