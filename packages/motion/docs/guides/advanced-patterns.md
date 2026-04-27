# Advanced Usage Patterns

Sophisticated animation techniques and patterns for complex applications using Wix Motion. This guide covers advanced scenarios, custom development, and architectural patterns.

## Overview

This guide is designed for developers implementing complex animation systems, creating custom effects, or building animation-heavy applications. It covers:

- **Custom Animation Development** - Creating your own animation presets
- **Complex Timing Patterns** - Sequencing and orchestration
- **State-Driven Animations** - Integrating with application state
- **Advanced Scroll Patterns** - Sophisticated scroll interactions
- **Performance Architecture** - Building scalable animation systems

## Custom Animation Development

### Creating Custom Named Effects

Build your own animation presets that integrate seamlessly with Wix Motion's architecture.

#### Basic Custom Effect Structure

```typescript
// Define the effect type
interface MyCustomEffect extends BaseDataItemLike<'MyCustomEffect'> {
  intensity?: number;
  direction?: 'in' | 'out';
  color?: string;
}

// Implementation following Wix Motion patterns
export function web(options: TimeAnimationOptions & { namedEffect: MyCustomEffect }) {
  const { intensity = 1, direction = 'in', color = '#ff0000' } = options.namedEffect;

  return [
    {
      name: 'MyCustomEffect',
      keyframes: [
        {
          transform: direction === 'in' ? 'scale(0) rotate(0deg)' : 'scale(1) rotate(0deg)',
          backgroundColor: direction === 'in' ? 'transparent' : color,
          opacity: direction === 'in' ? 0 : 1,
        },
        {
          transform: direction === 'in' ? 'scale(1) rotate(360deg)' : 'scale(0) rotate(360deg)',
          backgroundColor: direction === 'in' ? color : 'transparent',
          opacity: direction === 'in' ? 1 : 0,
        },
      ],
      timing: {
        duration: options.duration || 1000,
        easing: options.easing || 'ease-out',
        fill: 'forwards',
      },
    },
  ];
}

export function getNames(options: TimeAnimationOptions & { namedEffect: MyCustomEffect }) {
  return ['MyCustomEffect'];
}

export function style(options: TimeAnimationOptions & { namedEffect: MyCustomEffect }) {
  // CSS version for better performance
  return web(options); // Can also return CSS-specific implementation
}

// Optional preparation function for measurements
export function prepare(
  options: TimeAnimationOptions & { namedEffect: MyCustomEffect },
  dom?: DomApi,
) {
  // Pre-calculate any measurements needed
  if (dom) {
    dom.measure((element) => {
      // Store measurements for animation
      const bounds = element.getBoundingClientRect();
      console.log('Element prepared:', bounds);
    });
  }
}
```

#### Advanced Custom Effect with Dynamic Parameters

```typescript
interface DynamicWaveEffect extends BaseDataItemLike<'DynamicWaveEffect'> {
  amplitude?: number;
  frequency?: number;
  phase?: number;
  axis?: 'x' | 'y' | 'both';
}

export function web(
  options: TimeAnimationOptions & { namedEffect: DynamicWaveEffect },
  dom?: DomApi,
) {
  const { amplitude = 50, frequency = 2, phase = 0, axis = 'both' } = options.namedEffect;
  const duration = options.duration || 2000;

  // Generate dynamic keyframes
  const keyframes = [];
  const steps = 20; // Number of keyframe steps

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const time = progress * duration;

    // Calculate wave position
    const waveValue = Math.sin((time / duration) * frequency * 2 * Math.PI + phase) * amplitude;

    let transform = '';
    switch (axis) {
      case 'x':
        transform = `translateX(${waveValue}px)`;
        break;
      case 'y':
        transform = `translateY(${waveValue}px)`;
        break;
      case 'both':
        const xWave = Math.sin((time / duration) * frequency * 2 * Math.PI + phase) * amplitude;
        const yWave = Math.cos((time / duration) * frequency * 2 * Math.PI + phase) * amplitude;
        transform = `translate(${xWave}px, ${yWave}px)`;
        break;
    }

    keyframes.push({ transform, offset: progress });
  }

  return [
    {
      name: 'DynamicWaveEffect',
      keyframes,
      timing: {
        duration,
        easing: 'linear',
        iterations: options.iterations || 1,
      },
    },
  ];
}
```

### Custom Scroll Effects

Create sophisticated scroll-driven animations with precise control.

#### Physics-Based Scroll Animation

```typescript
interface PhysicsScrollEffect extends BaseDataItemLike<'PhysicsScrollEffect'> {
  mass?: number;
  stiffness?: number;
  damping?: number;
  velocity?: number;
}

export default function create(
  options: ScrubAnimationOptions & { namedEffect: PhysicsScrollEffect },
) {
  const { mass = 1, stiffness = 100, damping = 10, velocity = 0 } = options.namedEffect;

  return [
    {
      name: 'PhysicsScrollEffect',
      keyframes: [
        { transform: 'translateY(0px)', offset: 0 },
        { transform: 'translateY(100px)', offset: 1 },
      ],
      timing: {
        duration: { value: 100, unit: 'percentage' },
      },
      custom: {
        mass,
        stiffness,
        damping,
        velocity,
      },
      // Custom progress calculation
      progressFunction: (scrollProgress: number, customData: any) => {
        // Implement spring physics
        const { mass, stiffness, damping } = customData;

        // Simplified spring equation
        const springForce = -stiffness * scrollProgress;
        const dampingForce = -damping * velocity;
        const acceleration = (springForce + dampingForce) / mass;

        // Apply physics-based transformation
        return Math.min(Math.max(scrollProgress + acceleration * 0.016, 0), 1);
      },
    },
  ];
}
```

#### Multi-Layer Parallax System

```typescript
class AdvancedParallaxSystem {
  private layers: ParallaxLayer[] = [];
  private scrollManager: ScrollManager;

  constructor() {
    this.scrollManager = new ScrollManager();
  }

  addLayer(element: HTMLElement, config: ParallaxLayerConfig): ParallaxLayer {
    const layer: ParallaxLayer = {
      element,
      config,
      animation: this.createLayerAnimation(element, config),
      bounds: null,
      isVisible: false,
    };

    this.layers.push(layer);
    this.setupIntersectionObserver(layer);

    return layer;
  }

  private createLayerAnimation(element: HTMLElement, config: ParallaxLayerConfig) {
    return getScrubScene(
      element,
      {
        type: 'ScrubAnimationOptions',
        namedEffect: {
          type: 'ParallaxScroll',
          speed: config.speed,
        },
        customEffect: {
          ranges: [
            { name: 'translateY', min: config.range.start, max: config.range.end },
            { name: 'opacity', min: config.opacity?.start || 1, max: config.opacity?.end || 1 },
            { name: 'scale', min: config.scale?.start || 1, max: config.scale?.end || 1 },
          ],
        },
      },
      {
        trigger: 'view-progress',
        element: config.viewport || document.body,
      },
    );
  }

  private setupIntersectionObserver(layer: ParallaxLayer) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          layer.isVisible = entry.isIntersecting;
          layer.bounds = entry.boundingClientRect;

          if (layer.isVisible) {
            this.enableLayerUpdates(layer);
          } else {
            this.disableLayerUpdates(layer);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: [0, 0.1, 0.5, 0.9, 1],
      },
    );

    observer.observe(layer.element);
    layer.observer = observer;
  }

  private enableLayerUpdates(layer: ParallaxLayer) {
    this.scrollManager.addUpdateCallback(layer.element.id, (scrollData) => {
      this.updateLayer(layer, scrollData);
    });
  }

  private disableLayerUpdates(layer: ParallaxLayer) {
    this.scrollManager.removeUpdateCallback(layer.element.id);
  }

  private updateLayer(layer: ParallaxLayer, scrollData: ScrollData) {
    if (!layer.isVisible || !layer.bounds) return;

    const progress = this.calculateLayerProgress(layer, scrollData);
    const transforms = this.calculateLayerTransforms(layer, progress);

    // Apply transforms efficiently
    layer.element.style.transform = `translate3d(${transforms.x}px, ${transforms.y}px, 0) scale(${transforms.scale})`;
    layer.element.style.opacity = transforms.opacity.toString();
  }

  private calculateLayerProgress(layer: ParallaxLayer, scrollData: ScrollData): number {
    const { scrollY, viewportHeight } = scrollData;
    const { top, height } = layer.bounds!;

    // Calculate when element enters and exits viewport
    const enterY = top + scrollY - viewportHeight;
    const exitY = top + scrollY + height;
    const totalDistance = exitY - enterY;

    // Current progress through the animation range
    const currentDistance = scrollY - enterY;
    return Math.max(0, Math.min(1, currentDistance / totalDistance));
  }

  private calculateLayerTransforms(layer: ParallaxLayer, progress: number) {
    const config = layer.config;

    return {
      x:
        this.interpolate(progress, config.range.start, config.range.end) *
        (config.axis?.includes('x') ? 1 : 0),
      y:
        this.interpolate(progress, config.range.start, config.range.end) *
        (config.axis?.includes('y') !== false ? 1 : 0),
      scale: config.scale ? this.interpolate(progress, config.scale.start, config.scale.end) : 1,
      opacity: config.opacity
        ? this.interpolate(progress, config.opacity.start, config.opacity.end)
        : 1,
    };
  }

  private interpolate(progress: number, start: number, end: number): number {
    return start + (end - start) * progress;
  }

  destroy() {
    this.layers.forEach((layer) => {
      if (layer.observer) {
        layer.observer.disconnect();
      }
      if (layer.animation) {
        layer.animation.destroy();
      }
    });
    this.layers = [];
    this.scrollManager.destroy();
  }
}

interface ParallaxLayerConfig {
  speed: number;
  range: { start: number; end: number };
  opacity?: { start: number; end: number };
  scale?: { start: number; end: number };
  axis?: 'x' | 'y' | 'both';
  viewport?: HTMLElement;
}

interface ParallaxLayer {
  element: HTMLElement;
  config: ParallaxLayerConfig;
  animation: any;
  bounds: DOMRect | null;
  isVisible: boolean;
  observer?: IntersectionObserver;
}

interface ScrollData {
  scrollY: number;
  scrollX: number;
  viewportHeight: number;
  viewportWidth: number;
  deltaY: number;
  velocity: number;
}

class ScrollManager {
  private callbacks = new Map<string, (data: ScrollData) => void>();
  private rafId: number | null = null;
  private lastScrollY = 0;
  private lastScrollTime = performance.now();
  private velocity = 0;

  addUpdateCallback(id: string, callback: (data: ScrollData) => void) {
    this.callbacks.set(id, callback);
    if (this.callbacks.size === 1) {
      this.startListening();
    }
  }

  removeUpdateCallback(id: string) {
    this.callbacks.delete(id);
    if (this.callbacks.size === 0) {
      this.stopListening();
    }
  }

  private startListening() {
    const onScroll = () => {
      if (this.rafId) return;

      this.rafId = requestAnimationFrame(() => {
        this.updateCallbacks();
        this.rafId = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  private stopListening() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private updateCallbacks() {
    const now = performance.now();
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - this.lastScrollY;
    const deltaTime = now - this.lastScrollTime;

    // Calculate velocity (pixels per millisecond)
    this.velocity = deltaTime > 0 ? deltaY / deltaTime : 0;

    const scrollData: ScrollData = {
      scrollY: currentScrollY,
      scrollX: window.scrollX,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      deltaY,
      velocity: this.velocity,
    };

    this.callbacks.forEach((callback) => {
      try {
        callback(scrollData);
      } catch (error) {
        console.warn('Scroll callback error:', error);
      }
    });

    this.lastScrollY = currentScrollY;
    this.lastScrollTime = now;
  }

  destroy() {
    this.callbacks.clear();
    this.stopListening();
  }
}
```

## Complex Timing and Orchestration

### Animation Sequences and Choreography

```typescript
class AnimationChoreographer {
  private timeline: AnimationTimeline = [];
  private globalSpeed = 1;
  private isPlaying = false;

  // Add animations to timeline
  sequence(animation: AnimationGroup, startTime: number = 0): this {
    this.timeline.push({
      animation,
      startTime,
      duration: this.getAnimationDuration(animation),
      status: 'pending',
    });

    // Sort by start time
    this.timeline.sort((a, b) => a.startTime - b.startTime);
    return this;
  }

  parallel(animations: AnimationGroup[], startTime: number = 0): this {
    animations.forEach((animation) => {
      this.sequence(animation, startTime);
    });
    return this;
  }

  stagger(animations: AnimationGroup[], staggerDelay: number = 100, startTime: number = 0): this {
    animations.forEach((animation, index) => {
      this.sequence(animation, startTime + index * staggerDelay);
    });
    return this;
  }

  // Advanced timing patterns
  overlap(
    firstAnimation: AnimationGroup,
    secondAnimation: AnimationGroup,
    overlapAmount: number,
  ): this {
    const firstDuration = this.getAnimationDuration(firstAnimation);
    const secondStartTime = Math.max(0, firstDuration - overlapAmount);

    this.sequence(firstAnimation, 0);
    this.sequence(secondAnimation, secondStartTime);
    return this;
  }

  // Play the entire timeline
  async play(): Promise<void> {
    this.isPlaying = true;
    const startTime = performance.now();

    // Start all animations at their scheduled times
    const timeoutIds: number[] = [];

    this.timeline.forEach((item) => {
      const delay = item.startTime / this.globalSpeed;

      const timeoutId = window.setTimeout(async () => {
        if (this.isPlaying) {
          item.status = 'playing';
          await item.animation.play();

          // Mark as completed when finished
          item.animation.finished
            .then(() => {
              item.status = 'completed';
            })
            .catch(() => {
              item.status = 'failed';
            });
        }
      }, delay);

      timeoutIds.push(timeoutId);
    });

    // Wait for all animations to complete
    const allAnimations = this.timeline.map((item) => item.animation.finished);
    try {
      await Promise.all(allAnimations);
    } catch (error) {
      console.warn('Some animations failed:', error);
    } finally {
      this.isPlaying = false;
      timeoutIds.forEach((id) => clearTimeout(id));
    }
  }

  pause(): void {
    this.isPlaying = false;
    this.timeline.forEach((item) => {
      if (item.status === 'playing') {
        item.animation.pause();
      }
    });
  }

  setSpeed(speed: number): void {
    this.globalSpeed = speed;
    this.timeline.forEach((item) => {
      item.animation.setPlaybackRate(speed);
    });
  }

  // Get total duration of the timeline
  getTotalDuration(): number {
    if (this.timeline.length === 0) return 0;

    const lastItem = this.timeline[this.timeline.length - 1];
    return lastItem.startTime + lastItem.duration;
  }

  // Reset timeline
  reset(): void {
    this.timeline.forEach((item) => {
      item.animation.cancel();
      item.status = 'pending';
    });
    this.isPlaying = false;
  }

  private getAnimationDuration(animation: AnimationGroup): number {
    // Calculate duration from animation options or default
    return 1000; // Simplified - would inspect actual animation
  }
}

interface AnimationTimelineItem {
  animation: AnimationGroup;
  startTime: number;
  duration: number;
  status: 'pending' | 'playing' | 'completed' | 'failed';
}

type AnimationTimeline = AnimationTimelineItem[];

// Usage example
const choreographer = new AnimationChoreographer();

const heroAnimation = getWebAnimation('#hero', heroOptions);
const titleAnimation = getWebAnimation('#title', titleOptions);
const subtitleAnimation = getWebAnimation('#subtitle', subtitleOptions);
const buttonAnimation = getWebAnimation('#cta-button', buttonOptions);

// Create complex sequence
await choreographer
  .sequence(heroAnimation, 0) // Start hero immediately
  .overlap(titleAnimation, heroAnimation, 200) // Title overlaps hero by 200ms
  .stagger([subtitleAnimation, buttonAnimation], 150, 500) // Stagger subtitle and button
  .setSpeed(1.2) // Play 20% faster
  .play();
```

### State-Driven Animation System

```typescript
interface AnimationState {
  id: string;
  animations: AnimationGroup[];
  transitions: Record<string, TransitionConfig>;
  onEnter?: () => void;
  onExit?: () => void;
}

interface TransitionConfig {
  to: string;
  condition?: () => boolean;
  animation?: AnimationGroup;
  duration?: number;
}

class StateMachine {
  private states = new Map<string, AnimationState>();
  private currentState: string | null = null;
  private isTransitioning = false;

  addState(state: AnimationState): this {
    this.states.set(state.id, state);
    return this;
  }

  addTransition(fromState: string, toState: string, config: Partial<TransitionConfig> = {}): this {
    const state = this.states.get(fromState);
    if (state) {
      state.transitions[toState] = {
        to: toState,
        condition: config.condition || (() => true),
        animation: config.animation,
        duration: config.duration || 300,
      };
    }
    return this;
  }

  async transition(toStateId: string): Promise<void> {
    if (this.isTransitioning || !this.states.has(toStateId)) {
      return;
    }

    const currentState = this.currentState ? this.states.get(this.currentState) : null;
    const newState = this.states.get(toStateId);

    if (!newState) return;

    // Check if transition is allowed
    if (currentState) {
      const transition = currentState.transitions[toStateId];
      if (!transition || (transition.condition && !transition.condition())) {
        return;
      }
    }

    this.isTransitioning = true;

    try {
      // Exit current state
      if (currentState) {
        await this.exitState(currentState);
      }

      // Perform transition animation if defined
      const transition = currentState?.transitions[toStateId];
      if (transition?.animation) {
        await transition.animation.play();
      }

      // Enter new state
      await this.enterState(newState);
      this.currentState = toStateId;
    } catch (error) {
      console.error('State transition failed:', error);
    } finally {
      this.isTransitioning = false;
    }
  }

  private async exitState(state: AnimationState): Promise<void> {
    // Call exit handler
    if (state.onExit) {
      state.onExit();
    }

    // Reverse all state animations
    const exitPromises = state.animations.map((animation) => animation.reverse());
    await Promise.all(exitPromises);
  }

  private async enterState(state: AnimationState): Promise<void> {
    // Call enter handler
    if (state.onEnter) {
      state.onEnter();
    }

    // Play all state animations
    const enterPromises = state.animations.map((animation) => animation.play());
    await Promise.all(enterPromises);
  }

  getCurrentState(): string | null {
    return this.currentState;
  }

  canTransitionTo(toStateId: string): boolean {
    if (!this.currentState) return true;

    const currentState = this.states.get(this.currentState);
    if (!currentState) return false;

    const transition = currentState.transitions[toStateId];
    return !!(transition && (!transition.condition || transition.condition()));
  }
}

// Usage example
const pageMachine = new StateMachine();

// Define states
const loadingState: AnimationState = {
  id: 'loading',
  animations: [
    getWebAnimation('#loading-spinner', spinnerOptions),
    getWebAnimation('#loading-text', fadeOptions),
  ],
  transitions: {},
  onEnter: () => console.log('Entering loading state'),
  onExit: () => console.log('Exiting loading state'),
};

const contentState: AnimationState = {
  id: 'content',
  animations: [
    getWebAnimation('#main-content', slideInOptions),
    getWebAnimation('#navigation', fadeInOptions),
  ],
  transitions: {},
  onEnter: () => console.log('Content loaded'),
  onExit: () => console.log('Leaving content'),
};

const errorState: AnimationState = {
  id: 'error',
  animations: [
    getWebAnimation('#error-message', shakeOptions),
    getWebAnimation('#retry-button', pulseOptions),
  ],
  transitions: {},
};

// Setup state machine
pageMachine
  .addState(loadingState)
  .addState(contentState)
  .addState(errorState)
  .addTransition('loading', 'content', {
    condition: () => window.dataLoaded === true,
    animation: getWebAnimation('#transition-overlay', fadeOutOptions),
  })
  .addTransition('loading', 'error', {
    condition: () => window.loadError === true,
  })
  .addTransition('error', 'loading', {
    animation: getWebAnimation('#retry-transition', slideUpOptions),
  });

// Use state machine
await pageMachine.transition('loading');

// Later, when data loads
window.dataLoaded = true;
await pageMachine.transition('content');
```

## Interactive Animation Patterns

### Gesture-Driven Animations

```typescript
class GestureAnimationController {
  private element: HTMLElement;
  private hammerjs: any; // HammerJS for gesture recognition
  private currentAnimation: AnimationGroup | null = null;
  private gestureStates = new Map<string, GestureState>();

  constructor(element: HTMLElement) {
    this.element = element;
    this.setupGestureRecognition();
  }

  private setupGestureRecognition() {
    // Initialize HammerJS or similar gesture library
    this.hammerjs = new Hammer(this.element);

    // Configure gestures
    this.hammerjs.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    this.hammerjs.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    this.hammerjs.get('pinch').set({ enable: true });
    this.hammerjs.get('rotate').set({ enable: true });

    // Bind gesture events
    this.hammerjs.on('swipe', this.handleSwipe.bind(this));
    this.hammerjs.on('pan', this.handlePan.bind(this));
    this.hammerjs.on('pinch', this.handlePinch.bind(this));
    this.hammerjs.on('rotate', this.handleRotate.bind(this));
  }

  private handleSwipe(event: any) {
    const direction = this.getSwipeDirection(event.direction);
    const velocity = event.velocity;

    // Create velocity-based animation
    const distance = Math.min(velocity * 200, 400); // Cap max distance

    const animation = getWebAnimation(this.element, {
      type: 'TimeAnimationOptions',
      namedEffect: {
        type: 'GlideIn',
        direction: this.directionToAngle(direction),
        distance: { value: distance, unit: 'px' },
      },
      duration: Math.max(300, 1000 / velocity), // Faster swipes = shorter duration
      easing: 'easeOut',
    });

    this.playAnimationWithFeedback(animation);
  }

  private handlePan(event: any) {
    if (!this.currentAnimation) {
      // Create scrub animation for panning
      this.currentAnimation = getWebAnimation(this.element, {
        type: 'ScrubAnimationOptions',
        namedEffect: {
          type: 'TrackMouse',
          distance: { value: 100, unit: 'px' },
          axis: 'both',
        },
        transitionDuration: 0, // Immediate response
      }) as AnimationGroup;
    }

    // Update animation progress based on pan distance
    const maxDistance = 200;
    const panDistance = Math.sqrt(event.deltaX ** 2 + event.deltaY ** 2);
    const progress = Math.min(panDistance / maxDistance, 1);

    this.currentAnimation.progress(progress);

    // Clean up on pan end
    if (event.isFinal) {
      this.currentAnimation.cancel();
      this.currentAnimation = null;
    }
  }

  private handlePinch(event: any) {
    const scale = event.scale;
    const scaleAnimation = getWebAnimation(this.element, {
      type: 'TimeAnimationOptions',
      namedEffect: {
        type: 'DropIn',
        initialScale: scale,
      },
      duration: 200,
    });

    this.playAnimationWithFeedback(scaleAnimation);
  }

  private handleRotate(event: any) {
    const rotation = event.rotation;
    const rotateAnimation = getWebAnimation(this.element, {
      type: 'TimeAnimationOptions',
      namedEffect: {
        type: 'SpinIn',
        direction: rotation > 0 ? 'clockwise' : 'counter-clockwise',
        spins: Math.abs(rotation) / 360,
      },
      duration: 500,
    });

    this.playAnimationWithFeedback(rotateAnimation);
  }

  private playAnimationWithFeedback(animation: AnimationGroup) {
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Add visual feedback
    this.element.style.filter = 'brightness(1.1)';

    animation.play().then(() => {
      // Reset visual feedback
      this.element.style.filter = '';
    });
  }

  private getSwipeDirection(hammerDirection: number): 'up' | 'down' | 'left' | 'right' {
    switch (hammerDirection) {
      case Hammer.DIRECTION_UP:
        return 'up';
      case Hammer.DIRECTION_DOWN:
        return 'down';
      case Hammer.DIRECTION_LEFT:
        return 'left';
      case Hammer.DIRECTION_RIGHT:
        return 'right';
      default:
        return 'up';
    }
  }

  private directionToAngle(direction: string): number {
    const angles = { up: 0, right: 90, down: 180, left: 270 };
    return angles[direction] || 0;
  }
}

interface GestureState {
  type: 'swipe' | 'pan' | 'pinch' | 'rotate';
  startTime: number;
  currentValue: number;
  velocity: number;
}
```

### Scroll-Based Storytelling

```typescript
class ScrollStorytellingEngine {
  private chapters: StoryChapter[] = [];
  private currentChapter = 0;
  private scrollManager: ScrollManager;
  private debug = false;

  constructor(debug = false) {
    this.debug = debug;
    this.scrollManager = new ScrollManager();
    this.setupScrollListener();
  }

  addChapter(chapter: StoryChapter): this {
    this.chapters.push(chapter);
    return this;
  }

  private setupScrollListener() {
    this.scrollManager.addUpdateCallback('storytelling', (scrollData) => {
      this.updateStory(scrollData);
    });
  }

  private updateStory(scrollData: ScrollData) {
    const { scrollY, viewportHeight } = scrollData;

    // Find current chapter based on scroll position
    const newChapter = this.findCurrentChapter(scrollY);

    if (newChapter !== this.currentChapter) {
      this.transitionToChapter(newChapter);
      this.currentChapter = newChapter;
    }

    // Update current chapter animations
    if (this.chapters[this.currentChapter]) {
      this.updateChapterAnimations(this.currentChapter, scrollData);
    }
  }

  private findCurrentChapter(scrollY: number): number {
    for (let i = 0; i < this.chapters.length; i++) {
      const chapter = this.chapters[i];
      const chapterStart = chapter.element.offsetTop;
      const chapterEnd = chapterStart + chapter.element.offsetHeight;

      if (scrollY >= chapterStart && scrollY < chapterEnd) {
        return i;
      }
    }

    // If past all chapters, stay on last chapter
    return Math.max(0, this.chapters.length - 1);
  }

  private async transitionToChapter(chapterIndex: number) {
    const chapter = this.chapters[chapterIndex];
    if (!chapter) return;

    // Call chapter enter callback
    if (chapter.onEnter) {
      chapter.onEnter(chapterIndex);
    }

    // Play chapter entrance animations
    if (chapter.entranceAnimations) {
      const entrancePromises = chapter.entranceAnimations.map((anim) => anim.play());
      await Promise.all(entrancePromises);
    }

    if (this.debug) {
      console.log(`Entered chapter ${chapterIndex}: ${chapter.title}`);
    }
  }

  private updateChapterAnimations(chapterIndex: number, scrollData: ScrollData) {
    const chapter = this.chapters[chapterIndex];
    if (!chapter.scrollAnimations) return;

    const chapterProgress = this.calculateChapterProgress(chapter, scrollData.scrollY);

    chapter.scrollAnimations.forEach((animation) => {
      // Update scroll-driven animations with current progress
      if (animation.progress) {
        animation.progress(chapterProgress);
      }
    });

    // Update any custom scroll behaviors
    if (chapter.onScroll) {
      chapter.onScroll(chapterProgress, scrollData);
    }
  }

  private calculateChapterProgress(chapter: StoryChapter, scrollY: number): number {
    const chapterStart = chapter.element.offsetTop;
    const chapterHeight = chapter.element.offsetHeight;
    const chapterEnd = chapterStart + chapterHeight;

    if (scrollY <= chapterStart) return 0;
    if (scrollY >= chapterEnd) return 1;

    return (scrollY - chapterStart) / chapterHeight;
  }

  // Advanced chapter transitions
  createChapterTransition(fromChapter: number, toChapter: number): AnimationGroup[] {
    const from = this.chapters[fromChapter];
    const to = this.chapters[toChapter];

    if (!from || !to) return [];

    const transitions: AnimationGroup[] = [];

    // Fade out previous chapter
    if (from.element) {
      transitions.push(
        getWebAnimation(from.element, {
          type: 'TimeAnimationOptions',
          namedEffect: { type: 'FadeIn' }, // Will be reversed
          duration: 500,
        }),
      );
    }

    // Fade in new chapter
    if (to.element) {
      transitions.push(
        getWebAnimation(to.element, {
          type: 'TimeAnimationOptions',
          namedEffect: { type: 'FadeIn' },
          duration: 500,
          delay: 250, // Slight overlap
        }),
      );
    }

    return transitions;
  }

  // Get story progress
  getStoryProgress(): StoryProgress {
    const totalChapters = this.chapters.length;
    const currentChapterProgress = this.chapters[this.currentChapter]
      ? this.calculateChapterProgress(this.chapters[this.currentChapter], window.scrollY)
      : 0;

    const overallProgress =
      totalChapters > 0 ? (this.currentChapter + currentChapterProgress) / totalChapters : 0;

    return {
      currentChapter: this.currentChapter,
      currentChapterProgress,
      overallProgress,
      chapterTitle: this.chapters[this.currentChapter]?.title || '',
    };
  }
}

interface StoryChapter {
  title: string;
  element: HTMLElement;
  entranceAnimations?: AnimationGroup[];
  scrollAnimations?: AnimationGroup[];
  onEnter?: (chapterIndex: number) => void;
  onScroll?: (progress: number, scrollData: ScrollData) => void;
  onExit?: (chapterIndex: number) => void;
}

interface StoryProgress {
  currentChapter: number;
  currentChapterProgress: number;
  overallProgress: number;
  chapterTitle: string;
}

// Usage example
const story = new ScrollStorytellingEngine(true);

story
  .addChapter({
    title: 'The Beginning',
    element: document.getElementById('chapter-1')!,
    entranceAnimations: [
      getWebAnimation('#chapter-1 h1', titleFadeOptions),
      getWebAnimation('#chapter-1 .content', contentSlideOptions),
    ],
    scrollAnimations: [getScrubScene('#chapter-1 .parallax-bg', parallaxOptions, scrollTrigger)[0]],
    onEnter: () => console.log('Story begins...'),
    onScroll: (progress) => {
      // Custom scroll behavior for this chapter
      document.getElementById('progress-bar')!.style.width = `${progress * 100}%`;
    },
  })
  .addChapter({
    title: 'The Journey',
    element: document.getElementById('chapter-2')!,
    entranceAnimations: [getWebAnimation('#chapter-2', journeyAnimationOptions)],
    onEnter: () => console.log('The journey begins...'),
  });
```

## Performance Architecture for Large Applications

### Animation Pool and Resource Management

```typescript
class AnimationPool {
  private pool = new Map<string, AnimationGroup[]>();
  private activeAnimations = new Map<string, AnimationGroup>();
  private maxPoolSize = 20;
  private preloadedEffects = new Set<string>();

  // Get animation from pool or create new one
  getAnimation(key: string, factory: () => AnimationGroup): AnimationGroup {
    let pool = this.pool.get(key) || [];

    let animation: AnimationGroup;
    if (pool.length > 0) {
      animation = pool.pop()!;
      this.resetAnimation(animation);
    } else {
      animation = factory();
    }

    this.activeAnimations.set(animation.id || key, animation);
    return animation;
  }

  // Return animation to pool
  releaseAnimation(animation: AnimationGroup, key: string) {
    const animationId = animation.id || key;
    this.activeAnimations.delete(animationId);

    // Reset animation state
    animation.cancel();

    // Add to pool if not full
    let pool = this.pool.get(key) || [];
    if (pool.length < this.maxPoolSize) {
      pool.push(animation);
      this.pool.set(key, pool);
    }
  }

  // Preload common animations
  preloadAnimations(preloadConfig: PreloadConfig[]) {
    preloadConfig.forEach((config) => {
      const pool: AnimationGroup[] = [];

      for (let i = 0; i < config.count; i++) {
        const animation = config.factory();
        pool.push(animation);
      }

      this.pool.set(config.key, pool);
      this.preloadedEffects.add(config.key);
    });
  }

  // Clean up unused animations
  cleanup() {
    const now = performance.now();

    this.pool.forEach((animations, key) => {
      // Remove old unused animations
      const activeAnimations = animations.filter((anim) => {
        const lastUsed = (anim as any).lastUsed || now;
        return now - lastUsed < 30000; // Keep for 30 seconds
      });

      if (activeAnimations.length === 0) {
        this.pool.delete(key);
      } else {
        this.pool.set(key, activeAnimations);
      }
    });
  }

  private resetAnimation(animation: AnimationGroup) {
    animation.cancel();
    animation.progress(0);
    (animation as any).lastUsed = performance.now();
  }

  // Get pool statistics
  getStats(): PoolStats {
    const totalPooled = Array.from(this.pool.values()).reduce((sum, pool) => sum + pool.length, 0);

    return {
      totalPooled,
      activeAnimations: this.activeAnimations.size,
      preloadedEffects: this.preloadedEffects.size,
      poolKeys: Array.from(this.pool.keys()),
    };
  }
}

interface PreloadConfig {
  key: string;
  count: number;
  factory: () => AnimationGroup;
}

interface PoolStats {
  totalPooled: number;
  activeAnimations: number;
  preloadedEffects: number;
  poolKeys: string[];
}

// Global animation manager
class GlobalAnimationManager {
  private pool = new AnimationPool();
  private performanceMonitor = new PerformanceMonitor();
  private isLowPerformanceMode = false;

  constructor() {
    this.setupPerformanceMonitoring();
    this.preloadCommonAnimations();
  }

  private setupPerformanceMonitoring() {
    setInterval(() => {
      const fps = this.performanceMonitor.getAverageFPS();
      const wasLowPerf = this.isLowPerformanceMode;

      this.isLowPerformanceMode = fps < 45;

      if (this.isLowPerformanceMode !== wasLowPerf) {
        this.handlePerformanceModeChange();
      }
    }, 2000);

    // Cleanup every 30 seconds
    setInterval(() => {
      this.pool.cleanup();
    }, 30000);
  }

  private handlePerformanceModeChange() {
    if (this.isLowPerformanceMode) {
      console.warn('Entering low performance mode');
      // Could disable complex animations, reduce quality, etc.
    } else {
      console.log('Performance improved, resuming normal mode');
    }
  }

  private preloadCommonAnimations() {
    this.pool.preloadAnimations([
      {
        key: 'fadeIn',
        count: 5,
        factory: () =>
          getWebAnimation(document.createElement('div'), {
            type: 'TimeAnimationOptions',
            namedEffect: { type: 'FadeIn' },
          }),
      },
      {
        key: 'slideIn',
        count: 3,
        factory: () =>
          getWebAnimation(document.createElement('div'), {
            type: 'TimeAnimationOptions',
            namedEffect: { type: 'SlideIn', direction: 'bottom' },
          }),
      },
    ]);
  }

  // Public API
  createOptimizedAnimation(element: HTMLElement, options: AnimationOptions): AnimationGroup {
    const key = this.generateAnimationKey(options);

    if (this.isLowPerformanceMode) {
      options = this.simplifyOptionsForPerformance(options);
    }

    return this.pool.getAnimation(key, () => getWebAnimation(element, options));
  }

  releaseAnimation(animation: AnimationGroup, options: AnimationOptions) {
    const key = this.generateAnimationKey(options);
    this.pool.releaseAnimation(animation, key);
  }

  private generateAnimationKey(options: AnimationOptions): string {
    // Create a key based on animation type and parameters
    if (options.namedEffect) {
      return `${options.namedEffect.type}_${JSON.stringify(options.namedEffect)}`;
    }
    return `custom_${options.type}`;
  }

  private simplifyOptionsForPerformance(options: AnimationOptions): AnimationOptions {
    // Simplify animations for low performance devices
    if (options.type === 'TimeAnimationOptions') {
      return {
        ...options,
        duration: Math.min(options.duration || 1000, 300),
        namedEffect: { type: 'FadeIn' }, // Use simplest animation
      };
    }
    return options;
  }

  getStats() {
    return {
      pool: this.pool.getStats(),
      performance: {
        isLowPerformanceMode: this.isLowPerformanceMode,
        currentFPS: this.performanceMonitor.getAverageFPS(),
      },
    };
  }
}

// Export singleton instance
export const animationManager = new GlobalAnimationManager();
```

---

**Next**: Continue with [Framework Integration](framework-integration.md) for React, Vue, and Angular patterns, or explore [Testing](testing.md) for animation testing strategies.
