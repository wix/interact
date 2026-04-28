# Core Concepts

Understanding the fundamental concepts of Wix Motion will help you make the most of its 82+ animation presets and powerful API.

## Animation Architecture

Wix Motion is built around several key concepts that work together to provide a flexible and powerful animation system.

### Animation Types

There are two main animation types in Wix Motion:

#### 1. Time-Based Animations (`TimeAnimationOptions`)

These are traditional animations that run for a specific duration:

- **Entrance animations** - Elements appearing on screen
- **Ongoing animations** - Continuous looping effects

```typescript
{
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 1000,      // Duration in milliseconds
  easing: 'easeOut',   // Timing function
  iterations: 1,       // How many times to repeat
  delay: 0             // Start delay
}
```

#### 2. Scrub-Based Animations (`ScrubAnimationOptions`)

These animations are driven by external progress (scroll, mouse movement):

- **Scroll animations** - Respond to scroll position
- **Mouse animations** - Follow pointer movement
- **Background scroll animations** - Specialized for background media

```typescript
{
  type: 'ScrubAnimationOptions',
  namedEffect: { type: 'ParallaxScroll', speed: 0.5 },
  startOffset: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
  endOffset: { name: 'cover', offset: { value: 100, unit: 'percentage' } }
}
```

## Animation Categories

### 🎭 Entrance Animations

**Purpose**: Reveal elements with impact and style
**Duration**: Typically 300-1500ms
**Use Cases**: Page loads, modal openings, content reveals

**Common Patterns**:

- **Directional**: `top`, `right`, `bottom`, `left`, `center`
- **Scale-based**: Start from different sizes
- **3D transforms**: Perspective and rotation effects

```typescript
// Example: Arc entrance from the right
{
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'ArcIn',
    direction: 'right'
  },
  duration: 800
}
```

### 🔄 Ongoing Animations

**Purpose**: Continuous effects for attention and life
**Duration**: Usually 1-4 seconds with infinite iterations
**Use Cases**: Call-to-action emphasis, breathing UI, ambient motion

**Common Patterns**:

- **Intensity control**: Scale the effect strength
- **Bidirectional**: Many support `alternate` for back-and-forth motion

```typescript
// Example: Gentle pulsing effect
{
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Pulse',
    intensity: 0.8
  },
  duration: 2000,
  iterations: Infinity,
  alternate: true
}
```

### 📜 Scroll Animations

**Purpose**: Scroll-synchronized effects for storytelling
**Triggers**: `view-progress` with ViewTimeline API
**Use Cases**: Parallax, reveal-on-scroll, progressive disclosure

**Common Patterns**:

- **Range control**: `in`, `out`, `continuous`
- **Speed modifiers**: Control animation rate relative to scroll
- **Viewport binding**: Animations tied to element visibility

```typescript
// Example: Parallax background movement
{
  type: 'ScrubAnimationOptions',
  namedEffect: {
    type: 'ParallaxScroll',
    speed: 0.3,
    range: 'continuous'
  }
}
```

### 🖱️ Mouse Animations

**Purpose**: Interactive pointer-driven effects
**Triggers**: `pointer-move` events
**Use Cases**: Hover effects, cursor following, 3D interactions

**Common Patterns**:

- **Distance control**: How far effects extend from pointer
- **Axis constraints**: `horizontal`, `vertical`, `both`
- **Inversion**: Opposite direction movement

```typescript
// Example: 3D tilt following mouse
{
  type: 'ScrubAnimationOptions',
  namedEffect: {
    type: 'Tilt3DMouse',
    angle: 15,
    perspective: 800
  }
}
```

### 🖼️ Background Scroll Animations

**Purpose**: Specialized effects for background media
**Targets**: Elements with `data-motion-part` attributes
**Use Cases**: Hero sections, full-screen backgrounds, video overlays

**Common Patterns**:

- **Multi-layer**: Target different background layers
- **Measurement-aware**: Auto-calculate component dimensions
- **Perspective effects**: Advanced 3D transformations

```typescript
// Example: Background zoom on scroll
{
  type: 'ScrubAnimationOptions',
  namedEffect: {
    type: 'BgZoom',
    direction: 'in',
    zoom: 40
  }
}
```

## Configuration Patterns

### Named Effects vs Custom Effects

#### Named Effects (Recommended)

Use predefined animation presets:

```typescript
namedEffect: {
  type: 'BounceIn',
  direction: 'bottom'
}
```

#### Custom Keyframe Effects

Define your own keyframes:

```typescript
keyframeEffect: {
  name: 'myCustomAnimation',
  keyframes: [
    { opacity: 0, transform: 'scale(0)' },
    { opacity: 1, transform: 'scale(1)' }
  ]
}
```

#### Custom Script Effects

Full programmatic control:

```typescript
customEffect: {
  ranges: [
    { name: 'opacity', min: 0, max: 1 },
    { name: 'scale', min: 0, max: 1.2 },
  ];
}
```

### Easing Functions

Wix Motion provides both CSS and JavaScript easing functions:

#### CSS Easings (Performance Optimized)

```typescript
easing: 'easeInOut'; // CSS cubic-bezier
easing: 'linear'; // No acceleration
easing: 'backOut'; // Overshoot effect
easing: 'elasticOut'; // Bounce effect
```

#### JavaScript Easings (Full Control)

```typescript
easing: 'quintInOut'; // Smooth acceleration/deceleration
easing: 'circOut'; // Circular motion feel
easing: 'expoIn'; // Exponential acceleration
```

### Units and Measurements

Wix Motion supports multiple unit types:

```typescript
// Distance units
distance: { value: 100, unit: 'px' }
distance: { value: 50, unit: 'percentage' }
distance: { value: 2, unit: 'em' }
distance: { value: 100, unit: 'vh' }

// Angles (always in degrees)
angle: 45
direction: 270  // 0° = up, 90° = right, 180° = down, 270° = left

// Duration (milliseconds for time, percentage for scrub)
duration: 1000                          // Time-based
duration: { value: 50, unit: 'percentage' } // Scrub-based
```

## Rendering Modes

### Web Animations API (Default)

High-performance, JavaScript-controlled animations:

```typescript
import { getWebAnimation } from '@wix/motion';

const animation = getWebAnimation(element, options);
await animation.play();
```

**Advantages**:

- Fine-grained control
- Precise timing
- Dynamic modifications
- Event callbacks

**Use When**:

- Need animation control
- Complex timing requirements
- Interactive animations

### CSS Animations

Stylesheet-based animations for maximum performance:

```typescript
import { getCSSAnimation } from '@wix/motion';

const cssRules = getCSSAnimation('elementId', options);
// Insert rules into stylesheet
```

**Advantages**:

- GPU acceleration
- Better mobile performance
- Runs on compositor thread
- Survives JavaScript freezes

**Use When**:

- Simple, fire-and-forget animations
- Mobile-first applications
- Performance is critical

## Advanced Concepts

### Animation Groups

Multiple related animations managed together:

```typescript
const group = getWebAnimation(element, [
  { namedEffect: { type: 'FadeIn' }, duration: 500 },
  { namedEffect: { type: 'SlideIn' }, duration: 800, delay: 200 },
]);

// Control all animations together
await group.play();
group.pause();
group.setPlaybackRate(2);
```

### Measurement and Preparation

Pre-calculate layout for better performance:

```typescript
import { prepareAnimation } from '@wix/motion';

// Measure element dimensions before animating
prepareAnimation(element, animationOptions, () => {
  // Callback when measurements complete
  console.log('Ready to animate!');
});
```

### Scroll Ranges and Offsets

Fine-tune when scroll animations trigger:

```typescript
{
  type: 'ScrubAnimationOptions',
  namedEffect: { type: 'FadeScroll' },
  startOffset: {
    name: 'cover',                    // Viewport intersection
    offset: { value: 20, unit: 'percentage' }  // Start at 20% intersection
  },
  endOffset: {
    name: 'exit-crossing',            // Element leaving viewport
    offset: { value: 0, unit: 'percentage' }   // End immediately
  }
}
```

### CSS Custom Properties

Dynamic values through CSS variables:

```typescript
// Animation generates:
// --motion-scale: 1.2
// --motion-rotate: 45deg
// --motion-translate-x: 100px

// Use in your CSS:
.my-element {
  transform:
    scale(var(--motion-scale, 1))
    rotate(var(--motion-rotate, 0deg))
    translateX(var(--motion-translate-x, 0px));
}
```

### Sequences & Staggering

Sequences coordinate multiple AnimationGroups as a single timeline with easing-driven stagger delays. Instead of manually calculating `delay` offsets for each animation, a Sequence distributes timing automatically.

#### Offset Model

The stagger offset for each group is calculated with:

```
offset[i] = easing(i / last) * last * offsetMs
```

Where `i` is the group index, `last` is the final group's index, and `offsetMs` is the configured stagger interval. This produces:

- **Linear** — even spacing (0, 200, 400, 600, 800)
- **quadIn** — slow start then rapid (0, 50, 200, 450, 800)
- **sineOut** — fast start then gradual (0, 306, 565, 739, 800)

```typescript
import { getSequence } from '@wix/motion';

const items = document.querySelectorAll('.card');

const sequence = getSequence(
  { offset: 150, offsetEasing: 'quadIn' },
  Array.from(items).map((el) => ({
    target: el,
    options: {
      duration: 600,
      keyframeEffect: {
        name: 'fade-up',
        keyframes: [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
      },
    },
  })),
);

sequence.play();
```

#### Dynamic Groups

Groups can be added or removed at runtime. Both operations trigger automatic offset recalculation:

- **`addGroups(entries)`** — inserts groups at specified indices (e.g. when new list items appear)
- **`removeGroups(predicate)`** — removes matching groups, cancels their animations, and returns them (e.g. when DOM elements are removed)

#### Relationship to AnimationGroup

`Sequence` extends `AnimationGroup`, inheriting all playback controls (`play`, `pause`, `reverse`, `cancel`, `progress`, `setPlaybackRate`). The child `AnimationGroup` instances are stored in `animationGroups`, while the flattened `Animation` array is available via the inherited `animations` property.

## Performance Considerations

### Animation Lifecycle

1. **Preparation** - Measure elements, calculate values
2. **Creation** - Generate keyframes and effects
3. **Execution** - Run animations with optimal timing
4. **Cleanup** - Remove event listeners and references

### Best Practices

- Prefer CSS animations for simple, non-interactive effects
- Batch DOM measurements using `fastdom`
- Avoid creating animations in render loops
- Clean up animations when components unmount

### Browser Compatibility

- **Web Animations API**: Baseline - Wide Availability
- **ViewTimeline API**: Chrome 115+, Firefox/Safari with polyfill
- **CSS Animations**: Baseline - Wide Availability

## TypeScript Integration

Wix Motion is built with TypeScript and provides comprehensive type safety:

```typescript
import type {
  TimeAnimationOptions,
  ScrubAnimationOptions,
  EntranceAnimation,
  ScrollAnimation,
  AnimationGroup,
} from '@wix/motion';

// Type-safe configuration
const config: TimeAnimationOptions = {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' } as EntranceAnimation,
  duration: 1000,
};

// Typed return values
const animation: AnimationGroup = getWebAnimation(element, config);
```

## Next Steps

Now that you understand the core concepts:

- **[Explore Categories](categories/)** - Dive deep into each animation category
- **[API Reference](api/)** - Complete function documentation
- **[Performance Guide](guides/performance.md)** - Optimization techniques
- **[Advanced Patterns](guides/advanced-patterns.md)** - Complex animation scenarios
