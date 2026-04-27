# Mouse Animations

Interactive pointer-driven effects that respond to mouse movement in real-time. Perfect for creating engaging user interactions, 3D effects, and cursor-following elements.

## Complete Preset List (12 presets)

### 🎯 Position Tracking

| Animation                          | Complexity | Axis Control | Description                     |
| ---------------------------------- | ---------- | ------------ | ------------------------------- |
| **[TrackMouse](track-mouse.md)**   | Simple     | ✓            | Element follows cursor movement |
| **[AiryMouse](airy-mouse.md)**     | Medium     | ✓            | Lightweight floating movement   |
| **[BounceMouse](bounce-mouse.md)** | Simple     | ✓            | Elastic cursor following        |

### 🔄 3D Transformations

| Animation                             | Complexity | Axis Control | Description                       |
| ------------------------------------- | ---------- | ------------ | --------------------------------- |
| **[Tilt3DMouse](tilt-3d-mouse.md)**   | Medium     | -            | 3D tilt based on pointer position |
| **[Track3DMouse](track-3d-mouse.md)** | Medium     | ✓            | 3D tracking with perspective      |
| **[SwivelMouse](swivel-mouse.md)**    | Complex    | -            | Pivot-point 3D rotation           |

### 📏 Scale & Deformation

| Animation                        | Complexity | Axis Control | Description                  |
| -------------------------------- | ---------- | ------------ | ---------------------------- |
| **[ScaleMouse](scale-mouse.md)** | Medium     | ✓            | Dynamic scaling on hover     |
| **[BlobMouse](blob-mouse.md)**   | Medium     | -            | Organic blob-like scaling    |
| **[SkewMouse](skew-mouse.md)**   | Medium     | ✓            | Skew transformation tracking |

### ✨ Visual Effects

| Animation                      | Complexity | Description                 |
| ------------------------------ | ---------- | --------------------------- |
| **[BlurMouse](blur-mouse.md)** | Complex    | Motion blur with 3D effects |
| **[SpinMouse](spin-mouse.md)** | Simple     | Rotation based on movement  |

### 🎨 Custom Behaviors

| Animation                          | Complexity | Description                |
| ---------------------------------- | ---------- | -------------------------- |
| **[CustomMouse](custom-mouse.md)** | Variable   | Programmable mouse effects |

## Quick Reference

### By Use Case

#### Card & Panel Interactions

**Best**: Tilt3DMouse, ScaleMouse, Track3DMouse  
**Alternative**: AiryMouse, BlobMouse

#### Cursor Followers

**Best**: TrackMouse, AiryMouse, BounceMouse  
**Alternative**: SpinMouse, CustomMouse

#### 3D Showcases

**Best**: Track3DMouse, SwivelMouse, Tilt3DMouse  
**Alternative**: BlurMouse, ScaleMouse

#### Creative Interfaces

**Best**: BlobMouse, SkewMouse, BlurMouse  
**Alternative**: CustomMouse, SpinMouse

#### Button & Interactive Elements

**Best**: ScaleMouse, Tilt3DMouse, AiryMouse  
**Alternative**: BounceMouse, BlobMouse

### By Complexity

#### Simple (Minimal configuration)

- TrackMouse, BounceMouse, SpinMouse

#### Medium (Directional/Axis controls)

- Tilt3DMouse, Track3DMouse, ScaleMouse, BlobMouse, SkewMouse, AiryMouse

#### Complex (Advanced 3D/Multiple properties)

- SwivelMouse, BlurMouse, CustomMouse

## Common Configuration Patterns

### Basic Mouse Animation

```typescript
import { getScrubScene } from '@wix/motion';

const scene = getScrubScene(
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

### Axis Constraints

```typescript
// Horizontal-only cursor following
const horizontalTrack = {
  type: 'TrackMouse',
  distance: { value: 100, unit: 'px' },
  axis: 'horizontal',
};

// Vertical-only scaling
const verticalScale = {
  type: 'ScaleMouse',
  distance: { value: 150, unit: 'px' },
  axis: 'vertical',
  scale: 1.2,
};
```

### Container-Scoped Effects

```typescript
// Mouse effect only within specific container
const scene = getScrubScene(
  targetElement,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: 'Tilt3DMouse',
      angle: 20,
    },
  },
  {
    trigger: 'pointer-move',
    element: containerElement, // Effect only when mouse is in container
  },
);
```

## Advanced Patterns

### Interactive Card Grid

```typescript
// Apply tilt effect to all cards
document.querySelectorAll('.interactive-card').forEach((card) => {
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
    },
    {
      trigger: 'pointer-move',
      element: card,
    },
  );

  // Add glow effect on hover
  card.addEventListener('pointerenter', () => {
    card.style.boxShadow = '0 10px 30px rgb(0 0 0 / 0.1)';
  });

  card.addEventListener('pointerleave', () => {
    card.style.boxShadow = '';
  });
});
```

### Cursor Follower System

```typescript
// Global cursor follower element
class CursorFollower {
  constructor() {
    this.element = this.createFollowerElement();
    this.setupTracking();
  }

  createFollowerElement() {
    const follower = document.createElement('div');
    follower.className = 'cursor-follower';
    follower.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: rgb(255 255 255 / 0.5);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference;
    `;
    document.body.appendChild(follower);
    return follower;
  }

  setupTracking() {
    this.scene = getScrubScene(
      this.element,
      {
        type: 'ScrubAnimationOptions',
        namedEffect: {
          type: 'TrackMouse',
          distance: { value: 0, unit: 'px' }, // Perfect following
          axis: 'both',
        },
        transitionDuration: 100,
        transitionEasing: 'easeOut',
      },
      {
        trigger: 'pointer-move',
      },
    );
  }
}

// Initialize cursor follower
const cursorFollower = new CursorFollower();
```

### Layered Mouse Effects

```typescript
// Multiple elements responding to same mouse movement
const mouseResponders = [
  {
    element: '.bg-layer',
    effect: { type: 'AiryMouse', distance: { value: 30, unit: 'px' } },
  },
  {
    element: '.mid-layer',
    effect: { type: 'TrackMouse', distance: { value: 50, unit: 'px' } },
  },
  {
    element: '.fg-layer',
    effect: { type: 'Tilt3DMouse', angle: 15 },
  },
];

mouseResponders.forEach(({ element, effect }) => {
  const el = document.querySelector(element);
  if (el) {
    const scene = getScrubScene(
      el,
      {
        type: 'ScrubAnimationOptions',
        namedEffect: effect,
      },
      {
        trigger: 'pointer-move',
        element: document.querySelector('.mouse-container'),
      },
    );
  }
});
```

### Responsive Mouse Behavior

```typescript
// Adjust mouse sensitivity based on device
const isTouchDevice = window.matchMedia('(hover: none)').matches;
const isLargeScreen = window.innerWidth > 1200;

let mouseConfig;
if (isTouchDevice) {
  // Disable mouse animations on touch devices
  mouseConfig = null;
} else if (isLargeScreen) {
  // Full mouse effects on large screens
  mouseConfig = {
    type: 'Tilt3DMouse',
    angle: 20,
    perspective: 800,
  };
} else {
  // Simplified effects on smaller screens
  mouseConfig = {
    type: 'ScaleMouse',
    scale: 1.05,
  };
}

if (mouseConfig) {
  setupMouseAnimation(element, mouseConfig);
}
```

## Framework Integration Patterns

### React Hook for Mouse Effects

```typescript
import { useEffect, useRef } from 'react';
import { getWebAnimation } from '@wix/motion';

function useMouseEffect(
  effectType: string,
  options: any = {},
  containerRef?: React.RefObject<HTMLElement>
) {
  const elementRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const container = containerRef?.current || elementRef.current;

    sceneRef.current = getScrubScene(elementRef.current, {
      type: 'ScrubAnimationOptions',
      namedEffect: { type: effectType, ...options },
      transitionDuration: options.transitionDuration || 200,
      transitionEasing: options.transitionEasing || 'easeOut'
    }, {
      trigger: 'pointer-move',
      element: container
    });

    return () => {
      if (sceneRef.current) {
        sceneRef.current.cancel();
      }
    };
  }, [effectType, JSON.stringify(options), containerRef]);

  return elementRef;
}

// Usage
function InteractiveCard({ children }) {
  const cardRef = useMouseEffect('Tilt3DMouse', {
    angle: 15,
    perspective: 1000,
  });

  return (
    <div ref={cardRef} className="interactive-card">
      {children}
    </div>
  );
}
```

### Vue Composition API

```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import { getWebAnimation } from '@wix/motion';

export function useMouseEffect(effectType: string, options: any = {}) {
  const elementRef = ref<HTMLElement>();
  let scene: any = null;

  const setupMouseEffect = () => {
    if (!elementRef.value) return;

    scene = getScrubScene(
      elementRef.value,
      {
        type: 'ScrubAnimationOptions',
        namedEffect: { type: effectType, ...options },
      },
      {
        trigger: 'pointer-move',
        element: elementRef.value,
      },
    );
  };

  const destroyMouseEffect = () => {
    if (scene) {
      scene.destroy();
      scene = null;
    }
  };

  onMounted(setupMouseEffect);
  onUnmounted(destroyMouseEffect);

  return { elementRef };
}
```

## Performance Considerations

### Touch Device Optimization

```typescript
// Disable mouse animations on touch-only devices
const supportsMouse = window.matchMedia('(hover: hover)').matches;

if (supportsMouse) {
  // Enable mouse animations
  setupMouseAnimations();
} else {
  // Use alternative touch interactions
  setupTouchInteractions();
}
```

### Performance Monitoring

```typescript
// Monitor mouse animation performance
let frameCount = 0;
let lastTime = performance.now();

function monitorMousePerformance() {
  frameCount++;
  const currentTime = performance.now();

  if (currentTime - lastTime >= 1000) {
    const fps = frameCount;
    console.log(`Mouse animation FPS: ${fps}`);

    if (fps < 30) {
      console.warn('Mouse animation performance degraded');
      // Could reduce complexity or disable animations
    }

    frameCount = 0;
    lastTime = currentTime;
  }

  requestAnimationFrame(monitorMousePerformance);
}
```

---

**[Back to All Presets](../) | [Browse Other Categories](../../categories/)**
