# AnimationGroup

The `AnimationGroup` class manages multiple related animations as a cohesive unit, providing centralized control over timing, playback, and state management.

## Overview

`AnimationGroup` is the primary return type from `getWebAnimation()` for time-based animations and scroll-driven animations. It orchestrates multiple `Animation` instances, allowing you to control complex animation sequences with simple method calls.

### Key Features

- **Unified Control** - Play, pause, and control multiple animations together
- **Progress Tracking** - Monitor overall animation progress
- **State Management** - Access current playback state across all animations
- **Event Handling** - React to animation completion and state changes
- **Performance Optimized** - Efficient management of multiple animation instances

## Class Definition

```typescript
class AnimationGroup {
  animations: (Animation & {
    start?: RangeOffset;
    end?: RangeOffset;
  })[];
  options?: AnimationGroupOptions;
  ready: Promise<void>;

  constructor(animations: Animation[], options?: AnimationGroupOptions);

  // Control methods
  async play(callback?: () => void): Promise<void>;
  pause(): void;
  async reverse(callback?: () => void): Promise<void>;
  cancel(): void;

  // Progress and state
  getProgress(): number;
  progress(p: number): void;
  setPlaybackRate(rate: number): void;

  // Event handling
  async onFinish(callback: () => void): Promise<void>;

  // State properties
  get finished(): Promise<Animation>;
  get playState(): AnimationPlayState;
}
```

## Constructor

### Signature

```typescript
constructor(
  animations: Animation[],
  options?: AnimationGroupOptions
)
```

### Parameters

#### `animations` (required)

Array of Web Animations API `Animation` instances to manage.

#### `options` (optional)

Configuration options for the group:

```typescript
interface AnimationGroupOptions {
  trigger?: Partial<TriggerVariant>;
  startOffsetAdd?: string;
  endOffsetAdd?: string;
  measured?: Promise<void>;
}
```

## Properties

### `animations`

```typescript
animations: (Animation & {
  start?: RangeOffset;
  end?: RangeOffset;
})[]
```

Array of managed animations with optional scroll range information.

```typescript
const group = getWebAnimation(element, options);
console.log(`Managing ${group.animations.length} animations`);

// Access individual animations
group.animations.forEach((animation, index) => {
  console.log(`Animation ${index} state:`, animation.playState);
});
```

### `options`

```typescript
options?: AnimationGroupOptions
```

Configuration options passed during construction.

```typescript
const group = getWebAnimation(element, options);
if (group.options?.trigger) {
  console.log('Trigger type:', group.options.trigger);
}
```

### `ready`

```typescript
ready: Promise<void>;
```

Promise that resolves when all animations are prepared and ready to play.

```typescript
const group = getWebAnimation(element, options);

// Wait for animations to be ready
await group.ready;
console.log('All animations are prepared');

// Now safe to play
await group.play();
```

## Control Methods

### `play()`

Starts playback of all animations in the group.

#### Signature

```typescript
async play(callback?: () => void): Promise<void>
```

#### Parameters

- **`callback`** (optional) - Function called when playback starts

#### Returns

Promise that resolves when all animations begin playing.

#### Examples

```typescript
// Basic playback
const animation = getWebAnimation('#element', {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 1000,
});

await animation.play();
console.log('Animation started');
```

```typescript
// With callback
await animation.play(() => {
  console.log('Animation playback initiated');
  // Add loading states, analytics, etc.
});
```

```typescript
// Sequential animations
const intro = getWebAnimation('#intro', introOptions);
const main = getWebAnimation('#main', mainOptions);

await intro.play();
await main.play();
```

### `pause()`

Pauses all animations in the group.

#### Signature

```typescript
pause(): void
```

#### Examples

```typescript
const animation = getWebAnimation(element, options);

// Start animation
await animation.play();

// Pause after 2 seconds
setTimeout(() => {
  animation.pause();
  console.log('Animation paused');
}, 2000);
```

```typescript
// Pause on user interaction
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    animation.pause();
  } else {
    animation.play();
  }
});
```

### `reverse()`

Reverses the direction of all animations and starts playback.

#### Signature

```typescript
async reverse(callback?: () => void): Promise<void>
```

#### Parameters

- **`callback`** (optional) - Function called when reverse playback starts

#### Returns

Promise that resolves when reverse playback begins.

#### Examples

```typescript
const animation = getWebAnimation('#modal', {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'DropIn' },
  duration: 400,
});

// Show modal
await animation.play();

// Hide modal (reverse animation)
setTimeout(async () => {
  await animation.reverse();
  console.log('Modal hidden');
}, 3000);
```

```typescript
// Hover effect with reverse
const button = document.querySelector('#interactive-button');
const hoverAnimation = getWebAnimation(button, hoverOptions);

button.addEventListener('mouseenter', () => {
  hoverAnimation.play();
});

button.addEventListener('mouseleave', () => {
  hoverAnimation.reverse();
});
```

### `cancel()`

Cancels all animations and resets elements to their initial state.

#### Signature

```typescript
cancel(): void
```

#### Examples

```typescript
const animation = getWebAnimation(element, options);

// Start animation
await animation.play();

// Cancel if needed
if (shouldCancel) {
  animation.cancel();
  console.log('Animation cancelled and reset');
}
```

```typescript
// Component cleanup
class AnimatedComponent {
  private animation: AnimationGroup;

  constructor(element: HTMLElement) {
    this.animation = getWebAnimation(element, options);
  }

  destroy() {
    // Always cancel animations on cleanup
    this.animation.cancel();
  }
}
```

## Progress and State Methods

### `getProgress()`

Returns the current progress of the animation group as a value between 0 and 1.

#### Signature

```typescript
getProgress(): number
```

#### Returns

Number between 0 (start) and 1 (complete).

#### Examples

```typescript
const animation = getWebAnimation(element, options);
await animation.play();

// Monitor progress
const progressInterval = setInterval(() => {
  const progress = animation.getProgress();
  console.log(`Animation ${Math.round(progress * 100)}% complete`);

  if (progress >= 1) {
    clearInterval(progressInterval);
  }
}, 100);
```

```typescript
// Progress-based UI updates
const progressBar = document.querySelector('#progress-bar');
const animation = getWebAnimation('#content', options);

// Update progress bar during animation
const updateProgress = () => {
  const progress = animation.getProgress();
  progressBar.style.width = `${progress * 100}%`;

  if (progress < 1) {
    requestAnimationFrame(updateProgress);
  }
};

animation.play();
updateProgress();
```

### `progress()`

Manually sets the progress of all animations to a specific value.

#### Signature

```typescript
progress(p: number): void
```

#### Parameters

- **`p`** - Progress value between 0 and 1

#### Examples

```typescript
const animation = getWebAnimation(element, options);

// Jump to 50% progress
animation.progress(0.5);
```

```typescript
// Create a scrub controller
const scrubSlider = document.querySelector('#scrub-slider');
const animation = getWebAnimation('#animated-element', options);

scrubSlider.addEventListener('input', (e) => {
  const progress = e.target.value / 100; // Slider value 0-100
  animation.progress(progress);
});
```

```typescript
// Scroll-based manual control
window.addEventListener('scroll', () => {
  const scrollProgress = Math.min(
    window.scrollY / (document.body.scrollHeight - window.innerHeight),
    1,
  );

  animation.progress(scrollProgress);
});
```

### `setPlaybackRate()`

Changes the playback speed of all animations.

#### Signature

```typescript
setPlaybackRate(rate: number): void
```

#### Parameters

- **`rate`** - Playback rate multiplier (1 = normal, 2 = double speed, 0.5 = half speed)

#### Examples

```typescript
const animation = getWebAnimation(element, options);

// Start at normal speed
await animation.play();

// Speed up animation
animation.setPlaybackRate(2);

// Slow down animation
animation.setPlaybackRate(0.5);

// Pause (alternative to pause())
animation.setPlaybackRate(0);
```

```typescript
// Dynamic speed control
const speedControl = document.querySelector('#speed-control');
const animation = getWebAnimation('#element', options);

speedControl.addEventListener('change', (e) => {
  const speed = parseFloat(e.target.value);
  animation.setPlaybackRate(speed);
});

await animation.play();
```

## Event Handling

### `onFinish()`

Registers a callback to be called when all animations complete.

#### Signature

```typescript
async onFinish(callback: () => void): Promise<void>
```

#### Parameters

- **`callback`** - Function to call when animations finish

#### Returns

Promise that resolves when the callback is registered.

#### Examples

```typescript
const animation = getWebAnimation('#element', options);

// Register completion callback
await animation.onFinish(() => {
  console.log('Animation completed!');
  // Perform cleanup, trigger next animation, etc.
});

await animation.play();
```

```typescript
// Chain animations
const intro = getWebAnimation('#intro', introOptions);
const main = getWebAnimation('#main', mainOptions);

await intro.onFinish(async () => {
  console.log('Intro finished, starting main animation');
  await main.play();
});

await intro.play();
```

```typescript
// Modal close cleanup
const modalAnimation = getWebAnimation('#modal', exitOptions);

await modalAnimation.onFinish(() => {
  // Remove modal from DOM after animation
  document.querySelector('#modal').remove();
});

await modalAnimation.play();
```

## State Properties

### `finished`

Promise that resolves when all animations complete.

#### Signature

```typescript
get finished(): Promise<Animation>
```

#### Returns

Promise that resolves with the last animation to complete.

#### Examples

```typescript
const animation = getWebAnimation(element, options);
await animation.play();

// Wait for completion
await animation.finished;
console.log('All animations completed');
```

```typescript
// Handle completion with error handling
const animation = getWebAnimation(element, options);

try {
  await animation.play();
  await animation.finished;
  console.log('Animation completed successfully');
} catch (error) {
  console.log('Animation was cancelled or failed');
}
```

### `playState`

Current playback state of the animation group.

#### Signature

```typescript
get playState(): AnimationPlayState
```

#### Returns

- `'idle'` - Not started
- `'running'` - Currently playing
- `'paused'` - Paused
- `'finished'` - Completed

#### Examples

```typescript
const animation = getWebAnimation(element, options);

console.log('Initial state:', animation.playState); // 'idle'

await animation.play();
console.log('After play:', animation.playState); // 'running'

animation.pause();
console.log('After pause:', animation.playState); // 'paused'
```

```typescript
// State-based UI updates
const playButton = document.querySelector('#play-button');
const animation = getWebAnimation('#element', options);

function updateUI() {
  const state = animation.playState;

  switch (state) {
    case 'idle':
      playButton.textContent = 'Play';
      break;
    case 'running':
      playButton.textContent = 'Pause';
      break;
    case 'paused':
      playButton.textContent = 'Resume';
      break;
    case 'finished':
      playButton.textContent = 'Replay';
      break;
  }
}

// Update UI when state changes
setInterval(updateUI, 100);
```

## Advanced Usage Patterns

### Animation Sequencing

```typescript
class AnimationSequence {
  private animations: AnimationGroup[] = [];
  private currentIndex = 0;

  add(animation: AnimationGroup) {
    this.animations.push(animation);
    return this;
  }

  async play() {
    for (const animation of this.animations) {
      await animation.play();
      await animation.finished;
    }
  }

  async playParallel() {
    const promises = this.animations.map(async (animation) => {
      await animation.play();
      return animation.finished;
    });

    await Promise.all(promises);
  }

  pause() {
    this.animations.forEach((animation) => animation.pause());
  }

  cancel() {
    this.animations.forEach((animation) => animation.cancel());
  }
}

// Usage
const sequence = new AnimationSequence()
  .add(getWebAnimation('#intro', introOptions))
  .add(getWebAnimation('#main', mainOptions))
  .add(getWebAnimation('#outro', outroOptions));

await sequence.play();
```

### Progress Synchronization

```typescript
class SynchronizedAnimations {
  private groups: AnimationGroup[] = [];

  add(group: AnimationGroup) {
    this.groups.push(group);
    return this;
  }

  async play() {
    // Start all animations
    await Promise.all(this.groups.map((group) => group.play()));
  }

  syncProgress(progress: number) {
    // Set all animations to same progress
    this.groups.forEach((group) => {
      group.progress(progress);
    });
  }

  setSpeed(rate: number) {
    this.groups.forEach((group) => {
      group.setPlaybackRate(rate);
    });
  }

  getAverageProgress(): number {
    const total = this.groups.reduce((sum, group) => sum + group.getProgress(), 0);
    return total / this.groups.length;
  }
}
```

### State Machine Integration

```typescript
type AnimationState = 'idle' | 'entering' | 'active' | 'exiting';

class StatefulComponent {
  private state: AnimationState = 'idle';
  private enterAnimation: AnimationGroup;
  private exitAnimation: AnimationGroup;

  constructor(element: HTMLElement) {
    this.enterAnimation = getWebAnimation(element, {
      type: 'TimeAnimationOptions',
      namedEffect: { type: 'FadeIn' },
      duration: 300,
    });

    this.exitAnimation = getWebAnimation(element, {
      type: 'TimeAnimationOptions',
      namedEffect: { type: 'FadeIn' }, // Will be reversed
      duration: 300,
    });

    this.setupAnimationHandlers();
  }

  private async setupAnimationHandlers() {
    await this.enterAnimation.onFinish(() => {
      this.state = 'active';
      this.onEnterComplete();
    });

    await this.exitAnimation.onFinish(() => {
      this.state = 'idle';
      this.onExitComplete();
    });
  }

  async show() {
    if (this.state !== 'idle') return;

    this.state = 'entering';
    await this.enterAnimation.play();
  }

  async hide() {
    if (this.state !== 'active') return;

    this.state = 'exiting';
    await this.exitAnimation.reverse();
  }

  private onEnterComplete() {
    console.log('Component fully visible');
  }

  private onExitComplete() {
    console.log('Component fully hidden');
  }
}
```

## Performance Optimization

### Efficient State Monitoring

```typescript
class OptimizedAnimationMonitor {
  private rafId: number | null = null;
  private callbacks: ((progress: number) => void)[] = [];

  constructor(private group: AnimationGroup) {}

  addProgressCallback(callback: (progress: number) => void) {
    this.callbacks.push(callback);
    this.startMonitoring();
  }

  private startMonitoring() {
    if (this.rafId) return;

    const monitor = () => {
      const progress = this.group.getProgress();

      this.callbacks.forEach((callback) => {
        try {
          callback(progress);
        } catch (error) {
          console.warn('Progress callback error:', error);
        }
      });

      if (progress < 1 && this.group.playState === 'running') {
        this.rafId = requestAnimationFrame(monitor);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(monitor);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.callbacks = [];
  }
}
```

---

**Next**: Explore [Type Definitions](types.md) for complete TypeScript interfaces, or return to [Core Functions](core-functions.md) for animation creation methods.
