# Type Definitions

Complete TypeScript type reference for Wix Motion's animation system. This guide covers all interfaces, types, and enums used throughout the library.

## Overview

Wix Motion provides comprehensive TypeScript support with detailed type definitions for:

- **Core Configuration Types** - Animation options and parameters
- **Named Effect Types** - All 82+ animation presets with their specific options
- **Animation Control Types** - Return types and control interfaces
- **Utility Types** - Measurements, directions, and helper types
- **Advanced Types** - Custom effects and trigger configurations

## Core Configuration Types

### `TimeAnimationOptions`

Configuration for time-based animations (entrance and ongoing animations).

```typescript
interface TimeAnimationOptions {
  type: 'TimeAnimationOptions';
  keyframeEffect?: MotionKeyframeEffect; // Native KeyframeEffects
  namedEffect?: NamedEffect; // Pre-registered named effects
  customEffect?: CustomEffect; // JS-based custom effect
  duration?: number; // Milliseconds
  delay?: number; // Milliseconds
  endDelay?: number; // Milliseconds
  easing?: string; // CSS or JS easing function
  iterations?: number; // Number of repeats (Infinity or 0 for infinite)
  alternate?: boolean; // Alternating effect direction on each iteration
  fill?: AnimationFillMode; // 'none' | 'backwards' | 'forwards' | 'both'
  reversed?: boolean; // Play in reverse
}
```

#### Examples

```typescript
// Basic entrance animation
const fadeInOptions: TimeAnimationOptions = {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 800,
  easing: 'easeOut',
  fill: 'backwards',
};

// Complex bounce animation
const bounceOptions: TimeAnimationOptions = {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'BounceIn',
    direction: 'bottom',
  },
  duration: 1200,
  delay: 300,
  easing: 'backOut',
  fill: 'backwards',
};

// Infinite pulse animation
const pulseOptions: TimeAnimationOptions = {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Pulse',
    intensity: 0.8,
  },
  duration: 2000,
  iterations: Infinity,
  alternate: true,
};
```

### `ScrubAnimationOptions`

Configuration for scrub-based animations (scroll, mouse, and background scroll).

```typescript
interface ScrubAnimationOptions {
  type: 'ScrubAnimationOptions';
  keyframeEffect?: MotionKeyframeEffect;
  namedEffect?: NamedEffect;
  customEffect?: CustomEffect;
  startOffset?: RangeOffset; // animation-range-start for usage with view() timelines
  endOffset?: RangeOffset; // animation-range-end for usage with view() timelines
  playbackRate?: number; // Speed multiplier
  easing?: string; // Transition easing
  iterations?: number; // Usually 1 for scrub animations
  fill?: AnimationFillMode;
  alternate?: boolean;
  reversed?: boolean;
  transitionDuration?: number; // For mouse animations (ms)
  transitionDelay?: number; // For mouse animations (ms)
  transitionEasing?: ScrubTransitionEasing;
  centeredToTarget?: boolean; // For mouse animations
  duration?: LengthPercentage; // Scroll-based duration
}
```

#### Examples

```typescript
// Scroll parallax animation
const parallaxOptions: ScrubAnimationOptions = {
  type: 'ScrubAnimationOptions',
  namedEffect: {
    type: 'ParallaxScroll',
    speed: 0.3,
  },
  startOffset: { name: 'cover' },
  endOffset: { name: 'exit' },
};

// Mouse tilt animation
const mouseOptions: ScrubAnimationOptions = {
  type: 'ScrubAnimationOptions',
  namedEffect: {
    type: 'Tilt3DMouse',
    angle: 15,
    perspective: 800,
  },
  transitionDuration: 200,
  transitionEasing: 'easeOut',
};

// Background zoom animation
const bgOptions: ScrubAnimationOptions = {
  type: 'ScrubAnimationOptions',
  namedEffect: {
    type: 'BgZoom',
    direction: 'in',
    zoom: 40,
  },
};
```

## Named Effect Types

### Entrance Animations

Time-based animations for element reveals and transitions.

#### Base Interface

```typescript
type BaseDataItemLike<Type extends string = string> = {
  id?: string;
  type: Type;
};
```

#### Common Types

```typescript
// Simple fade entrance
type FadeIn = BaseDataItemLike<'FadeIn'>;

// Directional arc entrance
type ArcIn = BaseDataItemLike<'ArcIn'> & {
  direction: EffectFourDirections; // 'top' | 'right' | 'bottom' | 'left'
};

// Bouncing entrance
type BounceIn = BaseDataItemLike<'BounceIn'> & {
  direction: EffectFourDirections | 'center';
  distanceFactor?: number;
};

// Custom directional entrance
type GlideIn = BaseDataItemLike<'GlideIn'> & {
  direction: number; // Angle in degrees
  distance: UnitLengthPercentage; // Movement distance
  startFromOffScreen?: boolean;
};
```

#### Examples

```typescript
// Simple fade
const fadeIn: FadeIn = { type: 'FadeIn' };

// Arc from right
const arcIn: ArcIn = {
  type: 'ArcIn',
  direction: 'right',
};

// Bounce from bottom
const bounceIn: BounceIn = {
  type: 'BounceIn',
  direction: 'bottom',
};

// Custom glide at 45 degrees
const glideIn: GlideIn = {
  type: 'GlideIn',
  direction: 45,
  distance: { value: 100, unit: 'px' },
};
```

### Ongoing Animations

Continuous looping animations for attention and ambient motion.

#### Common Types

```typescript
// Pulsing scale effect
type Pulse = BaseDataItemLike<'Pulse'> & {
  intensity?: number; // 0.1 - 2.0 multiplier
};

// Breathing movement
type Breathe = BaseDataItemLike<'Breathe'> & {
  direction: 'vertical' | 'horizontal' | 'center';
  distance: UnitLengthPercentage;
};

// Spinning rotation
type Spin = BaseDataItemLike<'Spin'> & {
  direction: 'clockwise' | 'counter-clockwise';
};

// Directional poking
type Poke = BaseDataItemLike<'Poke'> & {
  direction: EffectFourDirections;
  intensity?: number;
};
```

#### Examples

```typescript
// Soft pulse
const pulse: Pulse = {
  type: 'Pulse',
  intensity: 0.6,
};

// Vertical breathing
const breathe: Breathe = {
  type: 'Breathe',
  direction: 'vertical',
  distance: { value: 10, unit: 'px' },
};

// Clockwise spinning
const spin: Spin = {
  type: 'Spin',
  direction: 'clockwise',
};
```

### Scroll Animations

Scroll-driven effects synchronized to viewport position.

#### Common Types

```typescript
// Basic parallax scrolling
type ParallaxScroll = BaseDataItemLike<'ParallaxScroll'> & {
  speed: number; // Movement speed multiplier
  range?: EffectScrollRange; // 'in' | 'out' | 'continuous'
};

// Fade based on scroll
type FadeScroll = BaseDataItemLike<'FadeScroll'> & {
  range: EffectScrollRange;
  opacity: number; // Target opacity
};

// Movement on scroll
type MoveScroll = BaseDataItemLike<'MoveScroll'> & {
  angle: number; // Movement direction
  range?: EffectScrollRange;
  distance?: UnitLengthPercentage;
};

// Scaling on scroll
type GrowScroll = BaseDataItemLike<'GrowScroll'> & {
  direction: EffectNineDirections; // Includes corners + center
  range?: EffectScrollRange;
  scale?: number;
  speed?: number; // Y-axis movement
};
```

#### Examples

```typescript
// Slow parallax background
const parallax: ParallaxScroll = {
  type: 'ParallaxScroll',
  speed: 0.3,
};

// Fade in on scroll
const fadeScroll: FadeScroll = {
  type: 'FadeScroll',
  range: 'in',
  opacity: 1,
};

// Move diagonally
const moveScroll: MoveScroll = {
  type: 'MoveScroll',
  angle: 225,
  distance: { value: 200, unit: 'px' },
  range: 'in',
};
```

### Mouse Animations

Interactive pointer-driven effects.

#### Common Types

```typescript
// Element following mouse
type TrackMouse = BaseDataItemLike<'TrackMouse'> & {
  distance?: UnitLengthPercentage;
  axis?: MouseEffectAxis; // 'both' | 'horizontal' | 'vertical'
  inverted?: boolean;
};

// 3D tilt based on mouse
type Tilt3DMouse = BaseDataItemLike<'Tilt3DMouse'> & {
  angle?: number; // Maximum tilt angle
  perspective?: number; // 3D perspective distance
  inverted?: boolean;
};

// Scale based on mouse proximity
type ScaleMouse = BaseDataItemLike<'ScaleMouse'> & {
  distance?: UnitLengthPercentage;
  axis?: MouseEffectAxis;
  scale?: number; // Maximum scale
  scaleDirection: EffectScaleDirection; // 'up' | 'down'
  inverted?: boolean;
};
```

#### Examples

```typescript
// Track mouse movement
const trackMouse: TrackMouse = {
  type: 'TrackMouse',
  distance: { value: 50, unit: 'px' },
  axis: 'both',
};

// 3D tilt effect
const tiltMouse: Tilt3DMouse = {
  type: 'Tilt3DMouse',
  angle: 15,
  perspective: 800,
};

// Scale on hover
const scaleMouse: ScaleMouse = {
  type: 'ScaleMouse',
  scale: 1.1,
  scaleDirection: 'up',
};
```

### Background Scroll Animations

Specialized effects for background media elements.

#### Common Types

```typescript
// Background parallax
type BgParallax = BaseDataItemLike<'BgParallax'> & {
  speed?: number;
};

// Background zoom
type BgZoom = BaseDataItemLike<'BgZoom'> & {
  direction: 'in' | 'out';
  zoom?: number; // Zoom intensity
};

// Background fade
type BgFade = BaseDataItemLike<'BgFade'> & {
  range: 'in' | 'out';
};

// Complex 3D background effect
type BgFake3D = BaseDataItemLike<'BgFake3D'> & {
  stretch?: number; // Y-axis stretch
  zoom?: number; // 3D zoom distance
};
```

#### Examples

```typescript
// Background parallax
const bgParallax: BgParallax = {
  type: 'BgParallax',
  speed: 0.5,
};

// Zoom in effect
const bgZoom: BgZoom = {
  type: 'BgZoom',
  direction: 'in',
  zoom: 30,
};

// Complex 3D effect
const bg3D: BgFake3D = {
  type: 'BgFake3D',
  stretch: 1.3,
  zoom: 20,
};
```

## Utility Types

### Measurements and Units

```typescript
// Length with unit
type Length = {
  value: number;
  unit: 'px' | 'em' | 'rem' | 'vh' | 'vw' | 'vmin' | 'vmax';
};

// Percentage
type Percentage = {
  value: number;
  unit: 'percentage';
};

// Combined length/percentage
type LengthPercentage = Length | Percentage;
type UnitLengthPercentage = LengthPercentage;

// 2D point
type Point = [number, number];
```

#### Examples

```typescript
// Different measurement types
const pixelDistance: Length = { value: 100, unit: 'px' };
const remDistance: Length = { value: 2, unit: 'rem' };
const viewportDistance: Length = { value: 50, unit: 'vh' };
const percentDistance: Percentage = { value: 75, unit: 'percentage' };

// Points for coordinates
const centerPoint: Point = [0.5, 0.5];
const topLeft: Point = [0, 0];
```

### Directions and Positions

```typescript
// Four main directions
type EffectFourDirections = 'top' | 'right' | 'bottom' | 'left';

// Eight directions (includes corners)
type EffectEightDirections =
  | EffectFourDirections
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

// Nine directions (includes center)
type EffectNineDirections = EffectEightDirections | 'center';

// Two-way directions
type EffectTwoSides = 'left' | 'right';

// Corner positions
type EffectFourCorners = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

// Scroll ranges
type EffectScrollRange = 'in' | 'out' | 'continuous';

// Scale directions
type EffectScaleDirection = 'up' | 'down';
```

### Mouse-Specific Types

```typescript
// Mouse effect axes
type MouseEffectAxis = 'both' | 'horizontal' | 'vertical';

// Mouse pivot points
type MousePivotAxis = 'top' | 'bottom' | 'right' | 'left' | 'center-horizontal' | 'center-vertical';

// Mouse progress information
type Progress = {
  x: number; // Normalized X position (0-1)
  y: number; // Normalized Y position (0-1)
  v?: { x: number; y: number }; // Velocity vector
  active?: boolean; // Is interaction active
};
```

## Animation Control Types

### `AnimationGroup`

Main control interface returned by `getWebAnimation()`.

```typescript
interface AnimationGroup {
  animations: (Animation & {
    start?: RangeOffset;
    end?: RangeOffset;
  })[];
  options?: AnimationGroupOptions;
  ready: Promise<void>;

  // Control methods
  getProgress(): number;
  play(callback?: () => void): Promise<void>;
  pause(): void;
  reverse(callback?: () => void): Promise<void>;
  progress(p: number): void;
  cancel(): void;
  setPlaybackRate(rate: number): void;
  onFinish(callback: () => void): Promise<void>;

  // State properties
  get finished(): Promise<Animation>;
  get playState(): AnimationPlayState;
}
```

### Mouse Animation Interfaces

```typescript
// Basic mouse animation interface
interface MouseAnimationInstance {
  target: HTMLElement;
  play(): void;
  progress(progress: Progress): void;
  cancel(): void;
}

// Extended interface for custom mouse animations
interface CustomMouseAnimationInstance extends MouseAnimationInstance {
  getProgress(): Progress;
}

// Factory function type
type MouseAnimationFactory = (element: HTMLElement) => MouseAnimationInstance;
```

### Scroll Scene Interfaces

```typescript
// Scroll-driven scene
interface ScrubScrollScene {
  start: RangeOffset;
  end: RangeOffset;
  viewSource: HTMLElement;
  ready: Promise<void>;
  getProgress(): number;
  effect(timestamp: any, progress: number): void;
  disabled: boolean;
  destroy(): void;
  groupId?: string;
}

// Pointer-driven scene
interface ScrubPointerScene {
  target?: HTMLElement;
  centeredToTarget?: boolean;
  transitionDuration?: number;
  transitionEasing?: ScrubTransitionEasing;
  getProgress(): Progress;
  effect(progress: Progress): void;
  disabled: boolean;
  destroy(): void;
  allowActiveEvent?: boolean;
}
```

## Advanced Configuration Types

### Range Offsets

Precise control over scroll animation timing.

```typescript
type RangeOffset = {
  name?: 'entry' | 'exit' | 'contain' | 'cover' | 'entry-crossing' | 'exit-crossing';
  offset?: LengthPercentage;
};
```

#### Examples

```typescript
// Start when element is 20% visible
const startOffset: RangeOffset = {
  name: 'entry',
  offset: { value: 20, unit: 'percentage' },
};

// End 100px before element exits
const endOffset: RangeOffset = {
  name: 'exit',
  offset: { value: 100, unit: 'px' },
};

// Cover entire viewport interaction
const coverRange: RangeOffset = { name: 'cover' };
```

### Trigger Variants

Configuration for how animations are triggered.

```typescript
type TriggerVariant = {
  id: string;
  trigger: 'view-progress' | 'pointer-move';
  componentId: string;
};
```

#### Examples

```typescript
// Scroll trigger
const scrollTrigger: TriggerVariant = {
  id: 'scroll-animation-1',
  trigger: 'view-progress',
  componentId: 'hero-section',
};

// Mouse trigger
const mouseTrigger: TriggerVariant = {
  id: 'mouse-animation-1',
  trigger: 'pointer-move',
  componentId: 'interactive-card',
};
```

### Custom Effects

For creating completely custom animations.

```typescript
type CustomEffect = {
  ranges: {
    name: string;
    min: number;
    max: number;
    step?: number;
  }[];
};

type MotionKeyframeEffect = BaseDataItemLike<'KeyframeEffect'> & {
  name: string;
  keyframes: Keyframe[];
};
```

#### Examples

```typescript
// Custom progress ranges
const customEffect: CustomEffect = {
  ranges: [
    { name: 'opacity', min: 0, max: 1, step: 0.01 },
    { name: 'scale', min: 0.5, max: 1.5, step: 0.01 },
    { name: 'rotation', min: 0, max: 360, step: 1 },
  ],
};

// Custom keyframe effect
const keyframeEffect: MotionKeyframeEffect = {
  type: 'KeyframeEffect',
  name: 'customBounce',
  keyframes: [
    { transform: 'scale(0) rotate(0deg)', opacity: 0 },
    { transform: 'scale(1.2) rotate(180deg)', opacity: 0.8 },
    { transform: 'scale(1) rotate(360deg)', opacity: 1 },
  ],
};
```

### Easing Types

```typescript
// Scrub transition easing options
type ScrubTransitionEasing = 'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce';

// Animation fill modes
type AnimationFillMode = 'none' | 'backwards' | 'forwards' | 'both';
```

## Union Types

### Combined Named Effects

```typescript
// All entrance animations
type EntranceAnimation = FadeIn | ArcIn | BounceIn | SlideIn | FlipIn |
  DropIn | ExpandIn | GlideIn | SpinIn | PunchIn | /* ... and more */;

// All ongoing animations
type OngoingAnimation = Pulse | Breathe | Spin | Wiggle | Flash |
  Bounce | Swing | Poke | /* ... and more */;

// All scroll animations
type ScrollAnimation = ParallaxScroll | FadeScroll | MoveScroll |
  GrowScroll | RevealScroll | /* ... and more */;

// All mouse animations
type MouseAnimation = TrackMouse | Tilt3DMouse | ScaleMouse |
  BlurMouse | /* ... and more */;

// All background scroll animations
type BackgroundScrollAnimation = BgParallax | BgZoom | BgFade |
  BgRotate | /* ... and more */;

// Union of all named effects
type NamedEffect = EntranceAnimation | OngoingAnimation | ScrollAnimation |
  MouseAnimation | BackgroundScrollAnimation;
```

### Animation Options Union

```typescript
// Main options type
type AnimationOptions = (TimeAnimationOptions | ScrubAnimationOptions) & AnimationExtraOptions;

// Extra options for custom behavior
type AnimationExtraOptions = {
  effectId?: string;
  effect?: (
    progress: () =>
      | number
      | {
          x: number | undefined;
          y: number | undefined;
        },
  ) => void;
};
```

## Type Guards and Utilities

### Type Guard Functions

```typescript
// Check if options are time-based
function isTimeAnimation(options: AnimationOptions): options is TimeAnimationOptions {
  return options.type === 'TimeAnimationOptions';
}

// Check if options are scrub-based
function isScrubAnimation(options: AnimationOptions): options is ScrubAnimationOptions {
  return options.type === 'ScrubAnimationOptions';
}

// Check if effect is entrance animation
function isEntranceAnimation(effect: NamedEffect): effect is EntranceAnimation {
  return ['FadeIn', 'ArcIn', 'BounceIn', 'SlideIn' /* ... */].includes(effect.type);
}
```

### Utility Type Functions

```typescript
// Extract effect type from options
type ExtractEffectType<T extends AnimationOptions> = T extends { namedEffect: infer E } ? E : never;

// Create typed animation options
function createTimeAnimation<T extends EntranceAnimation | OngoingAnimation>(
  namedEffect: T,
  options?: Partial<Omit<TimeAnimationOptions, 'type' | 'namedEffect'>>,
): TimeAnimationOptions {
  return {
    type: 'TimeAnimationOptions',
    namedEffect,
    duration: 1000,
    ...options,
  };
}

function createScrubAnimation<
  T extends ScrollAnimation | MouseAnimation | BackgroundScrollAnimation,
>(
  namedEffect: T,
  options?: Partial<Omit<ScrubAnimationOptions, 'type' | 'namedEffect'>>,
): ScrubAnimationOptions {
  return {
    type: 'ScrubAnimationOptions',
    namedEffect,
    ...options,
  };
}
```

#### Usage Examples

```typescript
// Type-safe entrance animation
const fadeAnimation = createTimeAnimation({ type: 'FadeIn' }, { duration: 800, easing: 'easeOut' });

// Type-safe scroll animation
const parallaxAnimation = createScrubAnimation(
  { type: 'ParallaxScroll', speed: 0.3 },
  { startOffset: { name: 'cover' } },
);

// Type guards in use
function handleAnimation(options: AnimationOptions) {
  if (isTimeAnimation(options)) {
    // TypeScript knows this is TimeAnimationOptions
    console.log('Duration:', options.duration);
  } else if (isScrubAnimation(options)) {
    // TypeScript knows this is ScrubAnimationOptions
    console.log('Start offset:', options.startOffset);
  }
}
```

## Sequence Types

### `SequenceOptions`

Configuration for stagger timing when creating a `Sequence`.

```typescript
type SequenceOptions = {
  delay?: number; // Base delay (ms) for all groups. Default: 0
  offset?: number; // Stagger interval (ms) between groups. Default: 0
  offsetEasing?: string | ((p: number) => number); // Easing for offset distribution. Default: linear
};
```

Named easing strings (`'quadIn'`, `'sineOut'`, `'cubicBezier(0.4, 0, 0.2, 1)'`, etc.) are resolved to JS functions via `getJsEasing()`. Invalid strings fall back to `linear`.

#### Examples

```typescript
// Linear 200ms stagger
const linearOpts: SequenceOptions = { offset: 200 };

// Quadratic-in stagger with base delay
const quadOpts: SequenceOptions = {
  delay: 100,
  offset: 200,
  offsetEasing: 'quadIn',
};

// Custom cubic easing function
const customOpts: SequenceOptions = {
  offset: 300,
  offsetEasing: (p) => p * p * p,
};
```

### `AnimationGroupArgs`

Declarative target/options pair used by `getSequence()` and `createAnimationGroups()` to build `AnimationGroup` instances.

```typescript
type AnimationGroupArgs = {
  target: HTMLElement | HTMLElement[] | string | null;
  options: AnimationOptions;
  context?: Record<string, any>;
};
```

**Properties:**

- `target` — Element(s) to animate. `HTMLElement[]` and `string` selectors expand to one group per element.
- `options` — Animation configuration (`TimeAnimationOptions` or `ScrubAnimationOptions`).
- `context` — Optional context forwarded to animation creation (e.g. `{ reducedMotion: true }`).

### `IndexedGroup`

Specifies a group and its insertion position for `Sequence.addGroups()`.

```typescript
type IndexedGroup = {
  index: number;
  group: AnimationGroup;
};
```

**Properties:**

- `index` — Position in the `animationGroups` array where the group should be inserted.
- `group` — The `AnimationGroup` instance to insert.

## Advanced Type Patterns

### Generic Animation Factory

```typescript
interface AnimationFactory<T extends NamedEffect> {
  create(effect: T, options?: Partial<AnimationOptions>): AnimationGroup;
  getDefaults(effect: T): Partial<AnimationOptions>;
}

class TypedAnimationFactory<T extends NamedEffect> implements AnimationFactory<T> {
  create(effect: T, options: Partial<AnimationOptions> = {}): AnimationGroup {
    const animationOptions: AnimationOptions = {
      type: this.getAnimationType(effect),
      namedEffect: effect,
      ...this.getDefaults(effect),
      ...options,
    } as AnimationOptions;

    return getWebAnimation(this.target, animationOptions);
  }

  private getAnimationType(effect: T): 'TimeAnimationOptions' | 'ScrubAnimationOptions' {
    // Implementation would check effect type and return appropriate type
    return isEntranceAnimation(effect) || isOngoingAnimation(effect)
      ? 'TimeAnimationOptions'
      : 'ScrubAnimationOptions';
  }

  getDefaults(effect: T): Partial<AnimationOptions> {
    // Return sensible defaults based on effect type
    return {};
  }
}
```

---

**Complete**: You now have comprehensive TypeScript type definitions for Wix Motion. Return to the [API Overview](README.md) or explore [Advanced Usage Patterns](../guides/advanced-patterns.md) for implementation examples.
