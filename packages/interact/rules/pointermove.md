# PointerMove Trigger Rules for @wix/interact

These rules help generate pointer-driven interactions using the `@wix/interact` library. PointerMove triggers create real-time animations that respond to mouse movement over elements, perfect for 3D effects, cursor followers, and interactive cards.

## Core Concepts

### Effect Types for PointerMove

The `pointerMove` trigger provides 2D progress (x and y coordinates). You can use:

1. **`namedEffect`** (Preferred): Pre-built mouse presets from `@wix/motion-presets` that handle 2D progress internally
2. **`customEffect`** (Advanced): Custom function receiving the 2D progress object for full control
3. **`keyframeEffect`** (Single-axis): The pointer position on a single axis is mapped to linear 0-1 progress for keyframe animations. Use `axis: 'x'` or `axis: 'y'` (defaults to `'y'`)

### Hit Area Configuration (`hitArea`)

The `hitArea` parameter determines where mouse movement is tracked:

| Value    | Behavior                                              | Best For                                 |
| -------- | ----------------------------------------------------- | ---------------------------------------- |
| `'self'` | Tracks mouse within the source element's bounds only  | Local hover effects, card interactions   |
| `'root'` | Tracks mouse anywhere in the viewport (document root) | Global cursor followers, ambient effects |

### Progress Object Structure (for `customEffect`)

When using `customEffect` with `pointerMove`, the progress parameter is an object:

```typescript
type Progress = {
  x: number; // 0-1: horizontal position (0 = left edge, 1 = right edge)
  y: number; // 0-1: vertical position (0 = top edge, 1 = bottom edge)
  v?: {
    // Velocity (optional)
    x: number; // Horizontal velocity
    y: number; // Vertical velocity
  };
  active?: boolean; // Whether mouse is currently in the hit area
};
```

### Centering with `centeredToTarget`

Controls how the progress range is calculated:

| Value   | Behavior                                           | Use When                                 |
| ------- | -------------------------------------------------- | ---------------------------------------- |
| `true`  | Centers the coordinate range at the target element | Source and target are different elements |
| `false` | Uses source element bounds for calculations        | Cursor followers, global effects         |

## Rule 1: Single Element Pointer Effects with 3D Named Effects

**Use Case**: Interactive 3D transformations on individual elements that respond to mouse position (e.g., card tilting, 3D product showcases, interactive buttons)

**When to Apply**:

- For interactive card hover effects
- When creating 3D product showcases
- For engaging button interactions
- When building interactive UI elements that respond to mouse movement

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: '[HIT_AREA]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            namedEffect: {
                type: '[3D_EFFECT_TYPE]',
                [EFFECT_PROPERTIES]
            },
            centeredToTarget: [CENTERED_TO_TARGET],
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[SOURCE_KEY]`: Unique identifier for source element that tracks mouse movement
- `[TARGET_KEY]`: Unique identifier for target element to animate (can be same as source or different)
- `[HIT_AREA]`: 'self' (mouse within source element) or 'root' (mouse anywhere in viewport)
- `[3D_EFFECT_TYPE]`: 'Tilt3DMouse', 'Track3DMouse', 'SwivelMouse'
- `[EFFECT_PROPERTIES]`: Named effect specific properties (angle, perspective, direction, etc.)
- `[CENTERED_TO_TARGET]`: true (center range at target) or false (use source element bounds)
- `[UNIQUE_EFFECT_ID]`: Optional unique identifier

**Example - Interactive Product Card**:

```typescript
{
    key: 'product-card',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'product-card',
            namedEffect: {
                type: 'Tilt3DMouse',
                angle: 15,
                perspective: 1000
            }
        }
    ]
}
```

---

## Rule 2: Single Element Pointer Effects with Movement Named Effects

**Use Case**: Cursor-following and position-tracking effects on individual elements (e.g., floating elements, cursor followers, responsive decorations)

**When to Apply**:

- For cursor-following elements
- When creating floating responsive decorations
- For interactive element positioning
- When building mouse-aware UI components

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: '[HIT_AREA]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            namedEffect: {
                type: '[MOVEMENT_EFFECT_TYPE]',
                distance: { value: [DISTANCE_VALUE], unit: '[DISTANCE_UNIT]' },
                axis: '[AXIS_CONSTRAINT]'
            },
            centeredToTarget: [CENTERED_TO_TARGET],
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[MOVEMENT_EFFECT_TYPE]`: 'TrackMouse', 'AiryMouse', 'BounceMouse'
- `[DISTANCE_VALUE]`: Numeric value for movement distance
- `[DISTANCE_UNIT]`: 'px', 'percentage', 'vw', 'vh'
- `[AXIS_CONSTRAINT]`: 'both', 'horizontal', 'vertical'
- Other variables same as Rule 1

**Example - Cursor Follower Element**:

```typescript
{
    key: 'cursor-follower',
    trigger: 'pointerMove',
    params: {
        hitArea: 'root'
    },
    effects: [
        {
            namedEffect: {
                type: 'TrackMouse',
                distance: { value: 50, unit: 'percentage' },
                axis: 'both'
            },
            centeredToTarget: false
        }
    ]
}
```

**Example - Floating Decoration**:

```typescript
{
    key: 'hero-section',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'floating-element',
            namedEffect: {
                type: 'AiryMouse',
                distance: { value: 30, unit: 'px' },
                axis: 'both'
            },
            centeredToTarget: true,
            effectId: 'hero-float'
        }
    ]
}
```

---

## Rule 3: Single Element Pointer Effects with Scale Named Effects

**Use Case**: Dynamic scaling and deformation effects on individual elements based on mouse position (e.g., interactive scaling, organic transformations, blob effects)

**When to Apply**:

- For interactive scaling buttons
- When creating organic blob-like interactions
- For dynamic size responsive elements
- When building creative morphing interfaces

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: '[HIT_AREA]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            namedEffect: {
                type: '[SCALE_EFFECT_TYPE]',
                [SCALE_PROPERTIES]
            },
            centeredToTarget: [CENTERED_TO_TARGET],
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[SCALE_EFFECT_TYPE]`: 'ScaleMouse', 'BlobMouse', 'SkewMouse'
- `[SCALE_PROPERTIES]`: Effect-specific properties (scale, distance, axis)
- Other variables same as Rule 1

**Example - Interactive Scale Button**:

```typescript
{
    key: 'scale-button',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'scale-button',
            namedEffect: {
                type: 'ScaleMouse',
                scale: 1.1,
                distance: { value: 100, unit: 'px' },
                axis: 'both'
            },
            centeredToTarget: true
        }
    ]
}
```

**Example - Organic Blob Effect**:

```typescript
{
    key: 'blob-container',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'blob-shape',
            namedEffect: {
                type: 'BlobMouse',
                intensity: 0.8,
                smoothness: 0.6
            },
            effectId: 'blob-morph'
        }
    ]
}
```

---

## Rule 4: Single Element Pointer Effects with Visual Named Effects

**Use Case**: Visual effect transformations on individual elements based on mouse position (e.g., motion blur, rotation effects, visual filters)

**When to Apply**:

- For creative visual interfaces
- When adding motion blur to interactions
- For rotation-based mouse effects
- When creating dynamic visual feedback

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: '[HIT_AREA]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            namedEffect: {
                type: '[VISUAL_EFFECT_TYPE]',
                [VISUAL_PROPERTIES]
            },
            centeredToTarget: [CENTERED_TO_TARGET],
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[VISUAL_EFFECT_TYPE]`: 'BlurMouse', 'SpinMouse'
- `[VISUAL_PROPERTIES]`: Effect-specific properties (blur amount, rotation speed)
- Other variables same as Rule 1

**Example - Motion Blur Card**:

```typescript
{
    key: 'motion-card',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'motion-card',
            namedEffect: {
                type: 'BlurMouse',
                blurAmount: 5,
                motionIntensity: 0.7
            },
            centeredToTarget: true
        }
    ]
}
```

**Example - Spinning Element**:

```typescript
{
    key: 'spin-trigger',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'spinning-icon',
            namedEffect: {
                type: 'SpinMouse',
                rotationSpeed: 0.5,
                direction: 'clockwise'
            },
            centeredToTarget: false,
            effectId: 'icon-spin'
        }
    ]
}
```

---

## Rule 5: Multi-Element Pointer Parallax Effects with Named Effects

**Use Case**: Coordinated pointer-driven animations across multiple elements creating layered parallax effects (e.g., multi-layer backgrounds, depth effects, coordinated element responses)

**When to Apply**:

- For multi-layer background effects
- When creating depth and parallax interactions
- For coordinated UI element responses
- When building immersive pointer-driven experiences

**Pattern**:

```typescript
{
    key: '[CONTAINER_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: '[HIT_AREA]'
    },
    effects: [
        {
            key: '[BACKGROUND_LAYER_KEY]',
            namedEffect: {
                type: '[BACKGROUND_EFFECT_TYPE]',
                distance: { value: [BACKGROUND_DISTANCE], unit: '[DISTANCE_UNIT]' }
            },
            centeredToTarget: [CENTERED_TO_TARGET]
        },
        {
            key: '[MIDGROUND_LAYER_KEY]',
            namedEffect: {
                type: '[MIDGROUND_EFFECT_TYPE]',
                distance: { value: [MIDGROUND_DISTANCE], unit: '[DISTANCE_UNIT]' }
            },
            centeredToTarget: [CENTERED_TO_TARGET]
        },
        {
            key: '[FOREGROUND_LAYER_KEY]',
            namedEffect: {
                type: '[FOREGROUND_EFFECT_TYPE]',
                distance: { value: [FOREGROUND_DISTANCE], unit: '[DISTANCE_UNIT]' }
            },
            centeredToTarget: [CENTERED_TO_TARGET]
        }
    ]
}
```

**Variables**:

- `[CONTAINER_KEY]`: Unique identifier for container element tracking mouse
- `[*_LAYER_KEY]`: Unique identifier for different layer elements
- `[*_EFFECT_TYPE]`: Named effects for each layer (typically movement effects)
- `[*_DISTANCE]`: Movement distance for each layer (creating depth)
- Other variables same as previous rules

**Example - Parallax Card Layers**:

```typescript
{
    key: 'parallax-card',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'bg-layer',
            namedEffect: {
                type: 'AiryMouse',
                distance: { value: 15, unit: 'px' },
                axis: 'both'
            },
            centeredToTarget: true
        },
        {
            key: 'mid-layer',
            namedEffect: {
                type: 'TrackMouse',
                distance: { value: 25, unit: 'px' },
                axis: 'both'
            },
            centeredToTarget: true
        },
        {
            key: 'fg-layer',
            namedEffect: {
                type: 'BounceMouse',
                distance: { value: 35, unit: 'px' },
                axis: 'both'
            },
            centeredToTarget: true
        }
    ]
}
```

**Example - Multi-Layer Hero Section**:

```typescript
{
    key: 'hero-container',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'hero-bg',
            namedEffect: {
                type: 'AiryMouse',
                distance: { value: 20, unit: 'px' },
                axis: 'both'
            },
            centeredToTarget: true
        },
        {
            key: 'hero-content',
            namedEffect: {
                type: 'TrackMouse',
                distance: { value: 40, unit: 'px' },
                axis: 'horizontal'
            },
            centeredToTarget: true
        },
        {
            key: 'hero-decorations',
            namedEffect: {
                type: 'ScaleMouse',
                scale: 1.05,
                distance: { value: 60, unit: 'px' }
            },
            centeredToTarget: true
        }
    ]
}
```

---

## Rule 6: Coordinated Group Pointer Effects with Named Effects

**Use Case**: Synchronized pointer-driven animations across related elements with different responses (e.g., card grids, navigation menus, interactive galleries)

**When to Apply**:

- For interactive card grids
- When building responsive navigation systems
- For gallery hover effects
- When creating coordinated interface responses

**Pattern**:

```typescript
{
    key: '[CONTAINER_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: '[HIT_AREA]'
    },
    effects: [
        {
            key: '[PRIMARY_ELEMENTS_KEY]',
            namedEffect: {
                type: '[PRIMARY_EFFECT_TYPE]',
                [PRIMARY_EFFECT_PROPERTIES]
            },
            centeredToTarget: [PRIMARY_CENTERED]
        },
        {
            key: '[SECONDARY_ELEMENTS_KEY]',
            namedEffect: {
                type: '[SECONDARY_EFFECT_TYPE]',
                [SECONDARY_EFFECT_PROPERTIES]
            },
            centeredToTarget: [SECONDARY_CENTERED]
        }
    ]
}
```

**Variables**:

- `[PRIMARY_ELEMENTS_KEY]`: Unique identifier for primary responsive elements
- `[SECONDARY_ELEMENTS_KEY]`: Unique identifier for secondary responsive elements
- `[PRIMARY_EFFECT_TYPE]`: Named effect for primary elements
- `[SECONDARY_EFFECT_TYPE]`: Named effect for secondary elements
- `[*_EFFECT_PROPERTIES]`: Properties specific to each effect type
- `[*_CENTERED]`: Centering configuration for each element group
- Other variables same as previous rules

**Example - Interactive Card Grid**:

```typescript
{
    key: 'card-grid',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'grid-card',
            namedEffect: {
                type: 'Tilt3DMouse',
                angle: 12,
                perspective: 1000
            },
            centeredToTarget: true
        },
        {
            key: 'card-shadow',
            namedEffect: {
                type: 'AiryMouse',
                distance: { value: 20, unit: 'px' },
                axis: 'both'
            },
            centeredToTarget: true
        }
    ]
}
```

**Example - Navigation Menu Response**:

```typescript
{
    key: 'nav-container',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'nav-item',
            namedEffect: {
                type: 'ScaleMouse',
                scale: 1.05,
                distance: { value: 80, unit: 'px' }
            },
            centeredToTarget: true
        },
        {
            key: 'nav-indicator',
            namedEffect: {
                type: 'TrackMouse',
                distance: { value: 15, unit: 'px' },
                axis: 'horizontal'
            },
            centeredToTarget: false
        }
    ]
}
```

---

## Rule 7: Global Cursor Follower Effects with Named Effects

**Use Case**: Page-wide cursor following elements that respond to mouse movement anywhere (e.g., custom cursors, global decorative followers, interactive overlays)

**When to Apply**:

- For custom cursor implementations
- When creating global interactive overlays
- For page-wide decorative followers
- When building immersive cursor experiences

**Pattern**:

```typescript
{
    key: '[FOLLOWER_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: 'root'
    },
    effects: [
        {
            namedEffect: {
                type: '[FOLLOWER_EFFECT_TYPE]',
                distance: { value: [FOLLOWER_DISTANCE], unit: '[DISTANCE_UNIT]' },
                [FOLLOWER_PROPERTIES]
            },
            centeredToTarget: false,
            effectId: '[FOLLOWER_EFFECT_ID]'
        }
    ]
}
```

**Variables**:

- `[FOLLOWER_KEY]`: Unique identifier for cursor follower element
- `[FOLLOWER_EFFECT_TYPE]`: 'TrackMouse', 'AiryMouse', 'BounceMouse'
- `[FOLLOWER_DISTANCE]`: Distance/lag for follower (0 for perfect following)
- `[FOLLOWER_PROPERTIES]`: Additional effect properties
- `[FOLLOWER_EFFECT_ID]`: Unique identifier for the follower effect
- Other variables same as previous rules

**Example - Custom Cursor Follower**:

```typescript
{
    key: 'custom-cursor',
    trigger: 'pointerMove',
    params: {
        hitArea: 'root'
    },
    effects: [
        {
            namedEffect: {
                type: 'TrackMouse',
                distance: { value: 0, unit: 'px' },
                axis: 'both'
            },
            centeredToTarget: false,
            effectId: 'global-cursor'
        }
    ]
}
```

**Example - Floating Decoration Follower**:

```typescript
{
    key: 'floating-decoration',
    trigger: 'pointerMove',
    params: {
        hitArea: 'root'
    },
    effects: [
        {
            namedEffect: {
                type: 'AiryMouse',
                distance: { value: 50, unit: 'px' },
                axis: 'both'
            },
            centeredToTarget: false,
            effectId: 'decoration-follower'
        }
    ]
}
```

---

## Rule 8: Custom Pointer Effects with customEffect

**Use Case**: When you need full control over pointer-driven animations that cannot be achieved with named effects, such as custom physics, complex multi-property animations, or unique visual transformations.

**When to Apply**:

- For custom physics-based animations
- When creating unique visual effects not covered by named effects
- When controlling WebGL/WebGPU effects or other JavaScript controlled effects
- For complex DOM manipulations based on mouse position
- When implementing grid-based or particle effects
- For animations requiring access to velocity data

**IMPORTANT**: Only use `customEffect` when `namedEffect` cannot achieve the desired result. Named effects are optimized and GPU-friendly.

**Pattern - Basic customEffect**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: '[HIT_AREA]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            customEffect: (element, progress) => {
                // progress.x: 0-1 horizontal position
                // progress.y: 0-1 vertical position
                // progress.v: { x, y } velocity (optional)
                // progress.active: boolean (optional)

                [CUSTOM_ANIMATION_LOGIC]
            },
            centeredToTarget: [CENTERED_TO_TARGET]
        }
    ]
}
```

**Variables**:

- `[SOURCE_KEY]`: Unique identifier for source element tracking mouse movement
- `[TARGET_KEY]`: Unique identifier for target element to animate
- `[HIT_AREA]`: 'self' or 'root'
- `[CUSTOM_ANIMATION_LOGIC]`: Your custom animation code using the progress object
- `[CENTERED_TO_TARGET]`: true or false

**Example - Custom Rotation Based on Mouse Position**:

```typescript
{
    key: 'rotation-container',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            customEffect: (element, progress) => {
                // Convert progress to angle (0-360 degrees)
                const angle = Math.atan2(
                    progress.y - 0.5,
                    progress.x - 0.5
                ) * (180 / Math.PI);

                element.style.transform = `rotate(${angle}deg)`;
            },
            centeredToTarget: true
        }
    ]
}
```

**Example - Magnetic Effect with Distance Calculation**:

```typescript
{
    key: 'magnetic-button',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            customEffect: (element, progress) => {
                // Calculate distance from center (0.5, 0.5)
                const dx = (progress.x - 0.5) * 2; // -1 to 1
                const dy = (progress.y - 0.5) * 2; // -1 to 1

                // Apply magnetic pull effect
                const maxMove = 20; // pixels
                const moveX = dx * maxMove;
                const moveY = dy * maxMove;

                element.style.transform = `translate(${moveX}px, ${moveY}px)`;
            },
            centeredToTarget: true
        }
    ]
}
```

**Example - Velocity-Based Motion Blur**:

```typescript
{
    key: 'velocity-element',
    trigger: 'pointerMove',
    params: {
        hitArea: 'root'
    },
    effects: [
        {
            customEffect: (element, progress) => {
                // Use velocity for motion blur intensity
                const velocity = progress.v || { x: 0, y: 0 };
                const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

                // Apply blur based on speed
                const blurAmount = Math.min(speed * 0.5, 10);
                element.style.filter = `blur(${blurAmount}px)`;

                // Move element towards mouse
                const offsetX = (progress.x - 0.5) * 100;
                const offsetY = (progress.y - 0.5) * 100;
                element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            },
            centeredToTarget: false
        }
    ]
}
```

**Example - Grid Cell Rotation Effect**:

```typescript
// First, cache grid cell positions for performance
const cellCache = new Map();
// Cache viewport size
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
// ... populate cache with cell center positions
// ... update `windowWidth/height` on window `resize` event

{
    key: 'interactive-grid',
    trigger: 'pointerMove',
    params: {
        hitArea: 'root'
    },
    effects: [
        {
            customEffect: (element, progress) => {
                // Convert progress to viewport coordinates
                const mouseX = progress.x * windowWidth;
                const mouseY = progress.y * windowHeight;

                // Iterate through cached grid cells
                for (const [cell, cache] of cellCache) {
                    const deltaX = mouseX - cache.x;
                    const deltaY = mouseY - cache.y;

                    // Calculate angle pointing towards mouse
                    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;

                    // Calculate distance-based intensity
                    const dist = Math.sqrt(deltaX ** 2 + deltaY ** 2);
                    const intensity = Math.max(0, 1 - dist / 500);

                    cell.style.transform = `rotate(${angle}deg) scale(${1 + intensity * 0.2})`;
                }
            },
            centeredToTarget: false
        }
    ]
}
```

**Example - Active State Handling**:

```typescript
{
    key: 'active-aware-element',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            customEffect: (element, progress) => {
                if (!progress.active) {
                    // Mouse left the hit area - reset or animate out
                    element.style.transform = 'scale(1)';
                    element.style.opacity = '0.7';
                    return;
                }

                // Mouse is active in hit area
                const scale = 1 + (1 - Math.abs(progress.x - 0.5) * 2) * 0.1;
                element.style.transform = `scale(${scale})`;
                element.style.opacity = '1';
            },
            centeredToTarget: true
        }
    ]
}
```

### customEffect with Transition Smoothing

For smoother animations, you can use `transitionDuration` and `transitionEasing`:

```typescript
{
    key: 'smooth-custom',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            customEffect: (element, progress) => {
                const x = (progress.x - 0.5) * 50;
                const y = (progress.y - 0.5) * 50;
                element.style.transform = `translate(${x}px, ${y}px)`;
            },
            transitionDuration: 100,
            transitionEasing: 'easeOut',
            centeredToTarget: true
        }
    ]
}
```

---

## Rule 9: Multi-Element Custom Parallax with customEffect

**Use Case**: Complex parallax effects with custom physics or non-standard transformations across multiple layers.

**When to Apply**:

- For parallax with custom easing or physics
- When layers need different calculation methods
- For effects combining multiple CSS properties

**Pattern**:

```typescript
{
    key: '[CONTAINER_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: '[HIT_AREA]'
    },
    effects: [
        {
            key: '[LAYER_1_KEY]',
            customEffect: (element, progress) => {
                [LAYER_1_CUSTOM_LOGIC]
            },
            centeredToTarget: true
        },
        {
            key: '[LAYER_2_KEY]',
            customEffect: (element, progress) => {
                [LAYER_2_CUSTOM_LOGIC]
            },
            centeredToTarget: true
        }
    ]
}
```

**Example - Depth-Based Custom Parallax**:

```typescript
{
    key: 'parallax-scene',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'bg-stars',
            customEffect: (element, progress) => {
                // Background: subtle movement, inverted direction
                const x = (0.5 - progress.x) * 10;
                const y = (0.5 - progress.y) * 10;
                element.style.transform = `translate(${x}px, ${y}px)`;
            },
            centeredToTarget: true
        },
        {
            key: 'mid-clouds',
            customEffect: (element, progress) => {
                // Midground: moderate movement with rotation
                const x = (progress.x - 0.5) * 30;
                const y = (progress.y - 0.5) * 20;
                const rotation = (progress.x - 0.5) * 5;
                element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            },
            centeredToTarget: true
        },
        {
            key: 'fg-elements',
            customEffect: (element, progress) => {
                // Foreground: strong movement with scale
                const x = (progress.x - 0.5) * 60;
                const y = (progress.y - 0.5) * 40;
                const scale = 1 + Math.abs(progress.x - 0.5) * 0.1;
                element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            },
            centeredToTarget: true
        }
    ]
}
```

---

## Rule 10: KeyframeEffect with Axis Mapping

**Use Case**: When you want to use standard keyframe animations driven by pointer movement along a single axis (e.g., horizontal sliders, vertical progress indicators, single-axis parallax effects)

**When to Apply**:

- For slider-like interactions driven by horizontal mouse position
- For vertical scroll-like effects driven by vertical mouse position
- When you have existing keyframe animations you want to control with pointer movement
- For simple linear interpolation effects along one axis

**Pattern**:

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: '[HIT_AREA]',
        axis: '[AXIS]'  // 'x' or 'y'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            keyframeEffect: {
                name: '[ANIMATION_NAME]',
                keyframes: [
                    { [PROPERTY]: '[START_VALUE]' },
                    { [PROPERTY]: '[END_VALUE]' }
                ]
            },
            fill: '[FILL_MODE]',
            centeredToTarget: [CENTERED_TO_TARGET]
        }
    ]
}
```

**Variables**:

- `[SOURCE_KEY]`: Unique identifier for source element tracking mouse movement
- `[TARGET_KEY]`: Unique identifier for target element to animate
- `[HIT_AREA]`: 'self' or 'root'
- `[AXIS]`: 'x' (maps x position) or 'y' (maps y position) - **defaults to 'y'** (in `params`)
- `[ANIMATION_NAME]`: Name for the keyframe animation
- `[PROPERTY]`: CSS property to animate (transform, opacity, etc.)
- `[START_VALUE]`: Value at progress 0 (left/top edge)
- `[END_VALUE]`: Value at progress 1 (right/bottom edge)
- `[FILL_MODE]`: 'none', 'forwards', 'backwards', 'both'
- `[CENTERED_TO_TARGET]`: true or false

**Example - Horizontal Slider with Multiple Targets**:

This example shows a pointer-driven slider where the X position controls both a sliding element and an indicator's opacity/scale.

```typescript
{
    interactions: [
        {
            key: 'pointer-container',
            trigger: 'pointerMove',
            params: { hitArea: 'self', axis: 'x' },
            effects: [
                {
                    key: 'pointer-slider',
                    effectId: 'slide-effect',
                },
                {
                    key: 'pointer-indicator',
                    effectId: 'indicator-effect',
                },
            ],
        },
    ],
    effects: {
        'slide-effect': {
            keyframeEffect: {
                name: 'slide-x',
                keyframes: [
                    { transform: 'translateX(0px)' },
                    { transform: 'translateX(220px)' },
                ],
            },
            fill: 'both',
        },
        'indicator-effect': {
            keyframeEffect: {
                name: 'indicator-fade-scale',
                keyframes: [
                    { opacity: '0.3', transform: 'scale(0.8)' },
                    { opacity: '1', transform: 'scale(1)' },
                ],
            },
            fill: 'both',
        },
    },
}
```

**Important Notes**:

- `axis` defaults to `'y'` when using `keyframeEffect` with `pointerMove`
- For 2D effects that need both axes, you can use composite animations (Rule 11), `namedEffect`, or `customEffect`

---

## Rule 11: Multi-Axis KeyframeEffect (X + Y)

**Use Case**: Independent X/Y axis control using two `keyframeEffect` animations on the same target.

**Pattern**:
Define two interactions on the same source/target pair—one for `axis: 'x'`, one for `axis: 'y'`. When animating the same CSS property (e.g. `transform`), use the `composite` option to combine the effects.

**Example - 2D Scale Control**:

X axis controls `scaleX`, Y axis controls `scaleY`.

```typescript
{
    interactions: [
        {
            key: 'composite-add-container',
            trigger: 'pointerMove',
            params: { hitArea: 'self', axis: 'x' },
            effects: [
                {
                    key: 'composite-add-ball',
                    effectId: 'scale-x-effect',
                },
            ],
        },
        {
            key: 'composite-add-container',
            trigger: 'pointerMove',
            params: { hitArea: 'self', axis: 'y' },
            effects: [
                {
                    key: 'composite-add-ball',
                    effectId: 'scale-y-effect',
                },
            ],
        },
    ],
    effects: {
        'scale-x-effect': {
            keyframeEffect: {
                name: 'scale-x',
                keyframes: [
                    { transform: 'scaleX(0.5)' },
                    { transform: 'scaleX(1.5)' },
                ],
            },
            fill: 'both',
            composite: 'add',
        },
        'scale-y-effect': {
            keyframeEffect: {
                name: 'scale-y',
                keyframes: [
                    { transform: 'scaleY(0.5)' },
                    { transform: 'scaleY(1.5)' },
                ],
            },
            fill: 'both',
            composite: 'add',
        },
    },
}
```

---

## Advanced Patterns and Combinations

### Responsive Pointer Effects

`pointerMove` only fires on pointer-capable devices, but touch users still visit the page. Use the `conditions` config map to define device/motion guards — condition IDs are arbitrary strings you define, matched against the media query predicates you provide.

```typescript
{
    conditions: {
        // Only run pointer effects on devices that support hover (non-touch)
        'supports-hover': { type: 'media', predicate: '(hover: hover)' },
        // Suppress animations for users who prefer reduced motion
        'prefers-motion': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
    },
    interactions: [
        {
            key: 'responsive-element',
            trigger: 'pointerMove',
            conditions: ['supports-hover', 'prefers-motion'],
            params: { hitArea: 'self' },
            effects: [
                {
                    key: 'responsive-element',
                    namedEffect: { type: 'Tilt3DMouse', angle: 20, perspective: 800 },
                    centeredToTarget: true
                }
            ]
        }
    ]
}
```

### Contextual Hit Areas

Different hit areas for different interaction contexts:

```typescript
// Local interaction - mouse must be over element
{
    key: 'local-card',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'local-card',
            namedEffect: {
                type: 'Tilt3DMouse',
                angle: 15
            },
            centeredToTarget: true
        }
    ]
},
// Global interaction - responds to mouse anywhere
{
    key: 'global-background',
    trigger: 'pointerMove',
    params: {
        hitArea: 'root'
    },
    effects: [
        {
            key: 'ambient-element',
            namedEffect: {
                type: 'AiryMouse',
                distance: { value: 30, unit: 'px' }
            },
            centeredToTarget: false
        }
    ]
}
```

### Axis-Constrained Effects

Controlling movement direction for specific design needs:

```typescript
{
    key: 'constrained-container',
    trigger: 'pointerMove',
    params: {
        hitArea: 'self'
    },
    effects: [
        {
            key: 'horizontal-slider',
            namedEffect: {
                type: 'TrackMouse',
                distance: { value: 100, unit: 'px' },
                axis: 'horizontal'
            },
            centeredToTarget: true
        },
        {
            key: 'vertical-indicator',
            namedEffect: {
                type: 'ScaleMouse',
                scale: 1.2,
                distance: { value: 150, unit: 'px' },
                axis: 'vertical'
            },
            centeredToTarget: true
        }
    ]
}
```

---

## Best Practices for PointerMove Interactions

### Effect Type Selection Guidelines

**When to use `namedEffect` (Preferred)**:

1. For standard mouse-tracking effects (tilt, track, scale, blur)
2. When GPU-optimized performance is critical
3. For effects that match preset behavior (3D tilt, elastic following)
4. When you don't need custom physics or calculations

**When to use `customEffect`**:

1. For custom physics-based animations (springs, gravity)
2. When you need access to velocity data (`progress.v`)
3. For complex DOM manipulations (updating multiple elements)
4. When creating effects not covered by named presets
5. For grid/particle systems with many elements
6. For controlling WebGL/WebGPU effects

**When to use `keyframeEffect`**:

1. When you want single-axis control using the `axis` parameter ('x' or 'y')
2. For slider-like interactions driven by pointer position along one axis
3. For 2D control, use two `keyframeEffect` interactions with `composite` (see Rule 11)

### Performance Guidelines

1. **Limit simultaneous pointer effects** - too many can cause performance issues
2. **Test on various devices** - pointer sensitivity varies across hardware
3. **Cache DOM queries outside `customEffect` callbacks** - avoid repeated `querySelector` calls inside the callback
4. **Use `requestAnimationFrame` sparingly** - the library already handles frame timing
5. **Prefer `namedEffect` over `customEffect`** - named effects are optimized for GPU acceleration

### Hit Area Guidelines

1. **Use `hitArea: 'self'`** for local element interactions (cards, buttons, hover effects)
2. **Use `hitArea: 'root'`** for global cursor followers and ambient effects
3. **Consider container boundaries** when choosing hit areas
4. **Test hit area responsiveness** across different screen sizes
5. **`'self'`** is more performant than `'root'` - use when possible

### Centering Guidelines

1. **Set `centeredToTarget: true`** when target differs from source (e.g., animating child element from parent)
2. **Use `centeredToTarget: false`** for cursor followers and global effects
3. **Test centering behavior** with different element sizes
4. **Consider responsive design** when setting centering
5. **Centering affects how progress.x/y map to element position**

### Common Use Cases by Pattern

**Single Element 3D Effects (Rule 1)** - `namedEffect`:

- Interactive product cards
- 3D showcase elements
- Immersive button interactions
- Portfolio item presentations

**Movement Followers (Rule 2)** - `namedEffect`:

- Cursor follower elements
- Floating decorative elements
- Responsive UI indicators
- Interactive overlays

**Scale & Deformation (Rule 3)** - `namedEffect`:

- Organic interface elements
- Interactive morphing shapes
- Creative scaling buttons
- Blob-like interactions

**Visual Effects (Rule 4)** - `namedEffect`:

- Creative interface elements
- Motion blur interactions
- Spinning decorative elements
- Dynamic visual feedback

**Multi-Element Parallax (Rule 5)** - `namedEffect`:

- Layered background effects
- Depth-based interactions
- Immersive hero sections
- Complex scene responses

**Group Coordination (Rule 6)** - `namedEffect`:

- Interactive card grids
- Navigation menu systems
- Gallery hover effects
- Coordinated UI responses

**Global Followers (Rule 7)** - `namedEffect`:

- Custom cursor implementations
- Page-wide decorative elements
- Global interactive overlays
- Immersive cursor experiences

**Custom Pointer Effects (Rule 8)** - `customEffect`:

- Grid-based rotation systems
- Magnetic pull/push effects
- Physics-based animations
- Velocity-reactive effects
- Complex DOM manipulations
- Particle systems

**Multi-Element Custom Parallax (Rule 9)** - `customEffect`:

- Non-linear parallax physics
- Layers with different calculation methods
- Combined transform effects per layer
- Custom easing per element

**Single-Axis Keyframe Control (Rule 10)** - `keyframeEffect`:

- Horizontal slider interactions
- Vertical progress indicators
- Single-axis reveal effects
- Linear interpolation along one axis

**Composite Keyframe (Rule 11)** - Two `keyframeEffect` + `composite`:

- 2D element positioning with pointer
- Combined X/Y transform animations
- Independent axis control with keyframes
- Declarative 2D animations without customEffect

### Troubleshooting Common Issues

**Poor pointer responsiveness**:

- Verify `hitArea` configuration
- Test `centeredToTarget` settings
- Ensure target elements are properly positioned

**Performance issues**:

- Reduce number of simultaneous effects
- Use simpler named effects
- Check for CSS conflicts
- Test on lower-end devices
- In customEffect: cache DOM queries outside the callback
- Avoid creating objects inside customEffect callbacks

**customEffect not updating smoothly**:

- Add `transitionDuration` and `transitionEasing` for smoother transitions
- Avoid expensive calculations inside the callback
- Consider debouncing complex logic

**customEffect progress values unexpected**:

- Remember x/y are 0-1 normalized (not pixel values)
- Check `centeredToTarget` setting affects coordinate mapping
- Verify `hitArea` matches expected tracking area
- Use `progress.active` to handle edge cases

**Unexpected behavior on touch devices**:

- Implement appropriate conditions for touch vs. mouse
- Provide touch-friendly alternatives
- Test pointer events on mobile devices
- Consider disabling complex effects on touch

**Effects not triggering**:

- Verify source element exists and is visible
- Check `data-interact-key` matches CSS selector
- Ensure proper hit area configuration
- Test mouse event propagation

---

## Quick Reference: Effect Type Selection

| Requirement                 | Use This                                   | Why                                                    |
| --------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| Standard 3D tilt            | `namedEffect: { type: 'Tilt3DMouse' }`     | GPU-optimized, battle-tested                           |
| Cursor following            | `namedEffect: { type: 'TrackMouse' }`      | Built-in physics                                       |
| Horizontal progress control | `keyframeEffect` + `params: { axis: 'x' }` | Maps x position to keyframes                           |
| Vertical progress control   | `keyframeEffect` + `params: { axis: 'y' }` | Maps y position to keyframes                           |
| Multi-axis keyframe (X + Y) | Two interactions with `keyframeEffect`     | Use `composite: 'add'` or `'accumulate'` for same prop |
| Custom physics              | `customEffect`                             | Full control over calculations                         |
| Velocity-based effects      | `customEffect`                             | Access to `progress.v`                                 |
| Grid/particle systems       | `customEffect`                             | Can manipulate many elements                           |
