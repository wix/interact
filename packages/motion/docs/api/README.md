# API Reference

Complete reference for all Wix Motion functions, types, and classes.

## Core Functions

### [Animation Creation](core-functions.md)

- `getWebAnimation()` - Create Web Animations API instances
- `getScrubScene()` - Generate scroll/pointer-driven scenes
- `getCSSAnimation()` - Generate CSS animation rules
- `prepareAnimation()` - Pre-calculate measurements

### [Animation Group](animation-group.md)

- `AnimationGroup` class - Manage multiple related animations
- Control methods and properties
- Event handling and callbacks

### [Sequence](sequence.md)

- `Sequence` class - Coordinate multiple AnimationGroups with staggered delay offsets
- `addGroups()` / `removeGroups()` for dynamic group management
- Easing-driven offset calculation

### [Sequence Creation](get-sequence.md)

- `getSequence()` - Create a Sequence from target/options pairs
- `createAnimationGroups()` - Build AnimationGroups without a Sequence wrapper

### [Type Definitions](types.md)

- Complete TypeScript interfaces
- Animation option types
- Named effect definitions
- Utility types

## Quick Reference

### Basic Animation Creation

```typescript
import { getWebAnimation } from '@wix/motion';

const animation = getWebAnimation(
  element,           // HTMLElement | string | null
  animationOptions,  // TimeAnimationOptions | ScrubAnimationOptions
  trigger?,          // TriggerVariant (for scroll/mouse)
  options?           // Record<string, any>
);
```

### Scroll Scene Creation

```typescript
import { getScrubScene } from '@wix/motion';

const scene = getScrubScene(
  element,           // HTMLElement | string | null
  animationOptions,  // ScrubAnimationOptions
  trigger,           // TriggerVariant
  sceneOptions?      // Record<string, any>
);
```

### CSS Animation Generation

```typescript
import { getCSSAnimation } from '@wix/motion';

const cssRules = getCSSAnimation(
  target,            // string | null (element ID)
  animationOptions,  // AnimationOptions
  trigger?           // TriggerVariant
);
```

### Animation Preparation

```typescript
import { prepareAnimation } from '@wix/motion';

prepareAnimation(
  target,            // HTMLElement | string | null
  animation,         // AnimationOptions
  callback?          // () => void
);
```

### Sequence Creation

```typescript
import { getSequence } from '@wix/motion';

const sequence = getSequence(
  { offset: 200, offsetEasing: 'quadIn' },
  items.map((el) => ({
    target: el,
    options: { name: 'FadeIn', duration: 600 },
  })),
);
sequence.play();
```

## Types Overview

### Main Interfaces

```typescript
// Time-based animation options
interface TimeAnimationOptions {
  type: 'TimeAnimationOptions';
  namedEffect?: NamedEffect;
  keyframeEffect?: MotionKeyframeEffect;
  customEffect?: CustomEffect;
  duration?: number;
  delay?: number;
  easing?: string;
  iterations?: number;
  // ... more properties
}

// Scroll/mouse-driven animation options
interface ScrubAnimationOptions {
  type: 'ScrubAnimationOptions';
  namedEffect?: NamedEffect;
  keyframeEffect?: MotionKeyframeEffect;
  customEffect?: CustomEffect;
  startOffset?: RangeOffset;
  endOffset?: RangeOffset;
  // ... more properties
}

// Animation control group
interface AnimationGroup {
  animations: Animation[];
  ready: Promise<void>;
  play(callback?: () => void): Promise<void>;
  pause(): void;
  cancel(): void;
  progress(p: number): void;
  // ... more methods
}

// Sequence options
interface SequenceOptions {
  delay?: number;
  offset?: number;
  offsetEasing?: string | ((p: number) => number);
}

// Arguments for building animation groups
interface AnimationGroupArgs {
  target: HTMLElement | HTMLElement[] | string | null;
  options: AnimationOptions;
  context?: Record<string, any>;
}

// Indexed group for addGroups()
interface IndexedGroup {
  index: number;
  group: AnimationGroup;
}
```

### Named Effect Types

```typescript
// Entrance animations
type EntranceAnimation = FadeIn | ArcIn | BounceIn | SlideIn | FlipIn | DropIn | ExpandIn | GlideIn;
// ... all entrance types

// Ongoing animations
type OngoingAnimation = Pulse | Breathe | Spin | Wiggle | Flash | Bounce | Swing | Poke;
// ... all ongoing types

// Scroll animations
type ScrollAnimation =
  | ParallaxScroll
  | FadeScroll
  | GrowScroll
  | RevealScroll
  | TiltScroll
  | MoveScroll;
// ... all scroll types

// Mouse animations
type MouseAnimation = TrackMouse | Tilt3DMouse | ScaleMouse | BlurMouse | SwivelMouse | SpinMouse;
// ... all mouse types

// Background scroll animations
type BackgroundScrollAnimation =
  | BgParallax
  | BgZoom
  | BgFade
  | BgRotate
  | BgPan
  | BgCloseUp
  | BgSkew
  | BgPullBack;
// ... all background types
```

---

Explore each section for detailed documentation and examples.
