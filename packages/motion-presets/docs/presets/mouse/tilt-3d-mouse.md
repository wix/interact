# Tilt3DMouse

3D tilt effect that follows pointer position to create immersive depth and perspective. Perfect for interactive cards, panels, and showcases requiring sophisticated hover effects.

## Overview

**Category**: Mouse  
**Complexity**: Medium  
**Performance**: GPU Optimized  
**Mobile Friendly**: Disable on touch devices

### Best Use Cases

- Interactive cards and product showcases
- Portfolio pieces and gallery items
- Premium UI elements requiring depth
- 3D interface components
- Hero sections with interactive elements

### Target Elements

- Cards, panels, and content blocks
- Images and media elements
- Buttons and interactive components
- Product displays and showcases

## Configuration

### TypeScript Interface

```typescript
export type Tilt3DMouse = BaseDataItemLike<'Tilt3DMouse'> & {
  angle?: number;
  perspective?: number;
};
```

### Parameters

| Parameter     | Type     | Default | Description                       | Examples              |
| ------------- | -------- | ------- | --------------------------------- | --------------------- |
| `angle`       | `number` | `15`    | Maximum tilt angle in degrees     | `5`, `15`, `25`, `45` |
| `perspective` | `number` | `800`   | 3D perspective distance in pixels | `400`, `800`, `1200`  |

### Angle Guidelines

- **`5-10°`** - Subtle depth for professional interfaces
- **`15-20°`** - Noticeable but natural tilt effect
- **`25-45°`** - Dramatic perspective for creative showcases

### Perspective Guidelines

- **`400-600px`** - Strong perspective, pronounced 3D effect
- **`800-1000px`** - Balanced perspective, natural depth
- **`1200px+`** - Subtle perspective, gentle 3D feel

## Usage Examples

### Basic Usage

```typescript
import { getScrubScene } from '@wix/motion';

const scene = getScrubScene(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'Tilt3DMouse',
      angle: 15,
      perspective: 800,
    },
    transitionDuration: 200,
    transitionEasing: 'easeOut',
  },
  {
    trigger: 'pointer-move',
    element: element,
  },
);
```

### Angle Variations

```typescript
// Subtle tilt for professional cards
const scene = getScrubScene(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'Tilt3DMouse',
      angle: 8,
      perspective: 1000,
    },
    transitionDuration: 300,
  },
  {
    trigger: 'pointer-move',
    element: element,
  },
);

// Dramatic tilt for creative showcases
const scene = getScrubScene(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'Tilt3DMouse',
      angle: 30,
      perspective: 600,
    },
    transitionDuration: 150,
  },
  {
    trigger: 'pointer-move',
    element: element,
  },
);
```

### Perspective Control

```typescript
// Strong perspective for cards
const scene = getScrubScene(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'Tilt3DMouse',
      angle: 20,
      perspective: 500, // Closer perspective = stronger effect
    },
  },
  triggerConfig,
);

// Gentle perspective for large elements
const scene = getScrubScene(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'Tilt3DMouse',
      angle: 15,
      perspective: 1200, // Distant perspective = gentler effect
    },
  },
  triggerConfig,
);
```

### Power Level Examples

```typescript
// Professional interface - minimal response
const professionalTilt = {
  type: 'Tilt3DMouse',
  angle: 10,
  perspective: 1000,
};

// Creative interface - maximum response
const creativeTilt = {
  type: 'Tilt3DMouse',
  angle: 25,
  perspective: 600,
};
```

## Common Patterns

### Interactive Card Grid

```typescript
// Apply consistent tilt to all cards
document.querySelectorAll('.tilt-card').forEach((card) => {
  const scene = getScrubScene(
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

  // Enhanced hover state
  card.addEventListener('pointerenter', () => {
    card.style.boxShadow = '0 20px 40px rgb(0 0 0 / 0.1)';
    card.style.transform = 'translateZ(10px)';
  });

  card.addEventListener('pointerleave', () => {
    card.style.boxShadow = '';
    card.style.transform = '';
  });
});
```

### Product Showcase

```typescript
// Premium product display with dramatic tilt
function createProductShowcase(productElement) {
  const scene = getScrubScene(
    productElement,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'Tilt3DMouse',
        angle: 25,
        perspective: 800,
      },
      transitionDuration: 250,
      transitionEasing: 'easeOut',
    },
    {
      trigger: 'pointer-move',
      element: productElement.parentElement,
    },
  );

  return showcase;
}

// Usage
const productCards = document.querySelectorAll('.product-card');
productCards.forEach((card) => {
  const productImage = card.querySelector('.product-image');
  if (productImage) {
    createProductShowcase(productImage);
  }
});
```

### Portfolio Gallery

```typescript
// Portfolio items with varied tilt intensities
const portfolioItems = document.querySelectorAll('.portfolio-item');

portfolioItems.forEach((item, index) => {
  // Alternate between subtle and strong tilts
  const isStrong = index % 2 === 0;

  getScrubScene(
    item,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'Tilt3DMouse',
        angle: isStrong ? 20 : 12,
        perspective: isStrong ? 600 : 1000,
      },
      transitionDuration: 200,
    },
    {
      trigger: 'pointer-move',
      element: item,
    },
  );
});
```

### Interactive Button

```typescript
// CTA button with subtle tilt feedback
function createTiltButton(button) {
  const scene = getScrubScene(
    button,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'Tilt3DMouse',
        angle: 8,
        perspective: 800,
      },
      transitionDuration: 150,
      transitionEasing: 'easeOut',
    },
    {
      trigger: 'pointer-move',
      element: button,
    },
  );

  // Add scale effect
  button.addEventListener('pointerenter', () => {
    button.style.transform = 'scale(1.05)';
  });

  button.addEventListener('pointerleave', () => {
    button.style.transform = '';
  });

  return scene;
}
```

### Modal with 3D Tilt

```typescript
// Modal content with tilt interaction
function setupModalTilt(modal) {
  const modalContent = modal.querySelector('.modal-content');

  return getScrubScene(
    modalContent,
    {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'Tilt3DMouse',
        angle: 15,
        perspective: 1000,
      },
      transitionDuration: 300,
    },
    {
      trigger: 'pointer-move',
      element: modal, // Track mouse over entire modal
    },
  );
}
```

## Framework Integration

### React Component

```typescript
import React, { useEffect, useRef } from 'react';
import { getScrubScene } from '@wix/motion';

interface Tilt3DProps {
  children: React.ReactNode;
  angle?: number;
  perspective?: number;
  transitionDuration?: number;
  className?: string;
  disabled?: boolean;
}

function Tilt3D({
  children,
  angle = 15,
  perspective = 800,
  transitionDuration = 200,
  className,
  disabled = false
}: Tilt3DProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (!elementRef.current || disabled) return;

    // Check if device supports hover
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    if (!supportsHover) return;

    animationRef.current = getScrubScene(elementRef.current, {
      type: 'ScrubAnimationOptions',
      namedEffect: {
        type: 'Tilt3DMouse',
        angle,
        perspective
      },
      transitionDuration,
      transitionEasing: 'easeOut'
    }, {
      trigger: 'pointer-move',
      element: elementRef.current
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [angle, perspective, transitionDuration, disabled]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

// Usage
function ProductCard({ product }) {
  return (
    <Tilt3D
      angle={20}
      perspective={600}
      className="product-card"
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </Tilt3D>
  );
}
```

### Vue Component

```vue
<template>
  <div ref="element" :class="className" :style="{ transformStyle: 'preserve-3d' }">
    <slot />
  </div>
</template>

<script>
import { getWebAnimation } from '@wix/motion';

export default {
  props: {
    angle: { type: Number, default: 15 },
    perspective: { type: Number, default: 800 },
    transitionDuration: { type: Number, default: 200 },
    className: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },

  data() {
    return {
      animation: null,
    };
  },

  mounted() {
    this.setupTilt();
  },

  beforeUnmount() {
    this.destroyTilt();
  },

  watch: {
    disabled(newValue) {
      if (newValue) {
        this.destroyTilt();
      } else {
        this.setupTilt();
      }
    },
  },

  methods: {
    setupTilt() {
      if (!this.$refs.element || this.disabled) return;

      // Check hover support
      const supportsHover = window.matchMedia('(hover: hover)').matches;
      if (!supportsHover) return;

      this.animation = getWebAnimation(
        this.$refs.element,
        {
          type: 'ScrubAnimationOptions',
          namedEffect: {
            type: 'Tilt3DMouse',
            angle: this.angle,
            perspective: this.perspective,
          },
          transitionDuration: this.transitionDuration,
          transitionEasing: 'easeOut',
        },
        {
          trigger: 'pointer-move',
          element: this.$refs.element,
        },
      );
    },

    destroyTilt() {
      if (this.animation) {
        this.animation.cancel();
        this.animation = null;
      }
    },
  },
};
</script>
```

## Browser Support

- **Web Animations API**: Full support in modern browsers
- **3D Transforms**: IE10+ with vendor prefixes
- **Perspective**: Baseline support across all modern browsers
- **Performance**: Hardware acceleration in Chrome 36+, Firefox 31+, Safari 9+

## Related Animations

### Same Category

- **[Track3DMouse](track-3d-mouse.md)** - 3D tracking with movement
- **[SwivelMouse](swivel-mouse.md)** - Pivot-based 3D rotation
- **[ScaleMouse](scale-mouse.md)** - Scaling without 3D effects

### Other Categories

- **[ArcIn](../entrance/arc-in.md)** - 3D entrance animation
- **[TiltScroll](../scroll/tilt-scroll.md)** - Scroll-driven 3D tilting

### Complementary Effects

- **Before**: Element entrance animations
- **After**: Click animations, state changes
- **Alongside**: Box shadow transitions, scale effects

---

## Interactive Example

▶️ **[Try it in Storybook](../../playground/)** - Experiment with Tilt3DMouse angles

---

**[Back to Mouse Animations](../) | [Back to All Presets](../../)**
