# Framework Integration

Comprehensive guide for integrating Wix Motion with popular frontend frameworks including React, Vue, Angular, and others.

## Overview

Wix Motion is framework-agnostic but requires careful integration with reactive frameworks to avoid memory leaks and ensure optimal performance. This guide provides patterns, hooks, components, and best practices for each major framework.

### Integration Principles

1. **Lifecycle Management** - Properly create and destroy animations with component lifecycles
2. **Reactive Updates** - Handle dynamic prop changes and state updates
3. **Performance Optimization** - Minimize re-renders and unnecessary animation recreations
4. **TypeScript Support** - Maintain strong typing across framework boundaries
5. **SSR Compatibility** - Handle server-side rendering gracefully

## React Integration

### Core React Hook

```typescript
import { useRef, useEffect, useCallback, useMemo } from 'react';
import { getWebAnimation, AnimationGroup, AnimationOptions } from '@wix/motion';

interface UseAnimationOptions {
  autoPlay?: boolean;
  dependencies?: React.DependencyList;
  disabled?: boolean;
}

export function useAnimation(
  animationOptions: AnimationOptions,
  options: UseAnimationOptions = {},
): {
  ref: React.RefObject<HTMLElement>;
  animation: AnimationGroup | null;
  play: () => Promise<void>;
  pause: () => void;
  cancel: () => void;
  progress: (p: number) => void;
} {
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<AnimationGroup | null>(null);
  const { autoPlay = false, dependencies = [], disabled = false } = options;

  // Memoize animation options to prevent unnecessary recreations
  const memoizedOptions = useMemo(() => animationOptions, dependencies);

  // Create animation when element and options are ready
  useEffect(() => {
    if (!elementRef.current || disabled) return;

    // Clean up previous animation
    if (animationRef.current) {
      animationRef.current.cancel();
    }

    // Create new animation
    animationRef.current = getWebAnimation(elementRef.current, memoizedOptions);

    // Auto-play if requested
    if (autoPlay) {
      animationRef.current.play();
    }

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
        animationRef.current = null;
      }
    };
  }, [memoizedOptions, autoPlay, disabled]);

  // Animation control methods
  const play = useCallback(async () => {
    if (animationRef.current) {
      await animationRef.current.play();
    }
  }, []);

  const pause = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.pause();
    }
  }, []);

  const cancel = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.cancel();
    }
  }, []);

  const progress = useCallback((p: number) => {
    if (animationRef.current) {
      animationRef.current.progress(p);
    }
  }, []);

  return {
    ref: elementRef,
    animation: animationRef.current,
    play,
    pause,
    cancel,
    progress,
  };
}
```

### React Components

#### Basic Animation Component

```typescript
import React, { forwardRef } from 'react';
import { useAnimation } from './useAnimation';
import { AnimationOptions } from '@wix/motion';

interface AnimatedElementProps extends React.HTMLAttributes<HTMLDivElement> {
  animationOptions: AnimationOptions;
  autoPlay?: boolean;
  disabled?: boolean;
  onAnimationComplete?: () => void;
  children?: React.ReactNode;
}

export const AnimatedElement = forwardRef<HTMLDivElement, AnimatedElementProps>(
  ({ animationOptions, autoPlay, disabled, onAnimationComplete, children, ...props }, forwardedRef) => {
    const { ref, animation, play } = useAnimation(animationOptions, {
      autoPlay,
      disabled,
      dependencies: [animationOptions]
    });

    // Handle animation completion
    React.useEffect(() => {
      if (animation && onAnimationComplete) {
        animation.onFinish(onAnimationComplete);
      }
    }, [animation, onAnimationComplete]);

    return (
      <div
        ref={(node) => {
          // Handle both forwarded ref and internal ref
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
```

#### Advanced Animation Component with State

```typescript
interface AnimatedContainerProps {
  children: React.ReactNode;
  animationType: 'fadeIn' | 'slideIn' | 'bounceIn';
  direction?: 'top' | 'right' | 'bottom' | 'left';
  duration?: number;
  trigger?: 'immediate' | 'intersection' | 'manual';
  className?: string;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animationType,
  direction = 'bottom',
  duration = 800,
  trigger = 'intersection',
  className
}) => {
  const [shouldAnimate, setShouldAnimate] = React.useState(trigger === 'immediate');

  // Generate animation options based on props
  const animationOptions = React.useMemo((): AnimationOptions => {
    const baseOptions = {
      type: 'TimeAnimationOptions' as const,
      duration,
      easing: 'easeOut'
    };

    switch (animationType) {
      case 'fadeIn':
        return {
          ...baseOptions,
          namedEffect: { type: 'FadeIn' }
        };
      case 'slideIn':
        return {
          ...baseOptions,
          namedEffect: { type: 'SlideIn', direction }
        };
      case 'bounceIn':
        return {
          ...baseOptions,
          namedEffect: { type: 'BounceIn', direction }
        };
      default:
        return {
          ...baseOptions,
          namedEffect: { type: 'FadeIn' }
        };
    }
  }, [animationType, direction, duration]);

  const { ref } = useAnimation(animationOptions, {
    autoPlay: shouldAnimate,
    disabled: !shouldAnimate,
    dependencies: [animationOptions, shouldAnimate]
  });

  // Intersection observer for trigger
  React.useEffect(() => {
    if (trigger !== 'intersection' || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setShouldAnimate(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [trigger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
```

#### Scroll Animation Hook

[TBD]

### React Usage Examples

```tsx
// Basic usage
function App() {
  return (
    <AnimatedContainer
      animationType="slideIn"
      direction="bottom"
      trigger="intersection"
      className="hero-section"
    >
      <h1>Welcome to our site!</h1>
      <p>This content slides in when visible.</p>
    </AnimatedContainer>
  );
}

// Advanced usage with custom hook
function CustomAnimatedComponent() {
  const { ref, play, pause, progress } = useAnimation({
    type: 'TimeAnimationOptions',
    namedEffect: { type: 'BounceIn' },
    duration: 1000,
  });

  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <div ref={ref} className="animated-box">
        Animated Content
      </div>
      <button onClick={handleToggle}>{isPlaying ? 'Pause' : 'Play'}</button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        onChange={(e) => progress(parseFloat(e.target.value))}
      />
    </div>
  );
}

// Scroll animation usage
[TBD];
```

## Vue Integration

### Vue Composables

```typescript
// useAnimation.ts
import { ref, onMounted, onUnmounted, watch, Ref } from 'vue';
import { getWebAnimation, AnimationGroup, AnimationOptions } from '@wix/motion';

export function useAnimation(
  elementRef: Ref<HTMLElement | undefined>,
  animationOptions: Ref<AnimationOptions> | AnimationOptions,
  options: {
    autoPlay?: boolean;
    disabled?: Ref<boolean> | boolean;
  } = {},
) {
  const animation = ref<AnimationGroup | null>(null);
  const isPlaying = ref(false);
  const progress = ref(0);

  const { autoPlay = false, disabled = false } = options;

  function createAnimation() {
    if (!elementRef.value) return;

    // Clean up existing animation
    if (animation.value) {
      animation.value.cancel();
    }

    const options =
      typeof animationOptions === 'object' && 'value' in animationOptions
        ? animationOptions.value
        : animationOptions;

    animation.value = getWebAnimation(elementRef.value, options);

    if (autoPlay) {
      play();
    }
  }

  async function play() {
    if (animation.value) {
      isPlaying.value = true;
      await animation.value.play();
    }
  }

  function pause() {
    if (animation.value) {
      animation.value.pause();
      isPlaying.value = false;
    }
  }

  function cancel() {
    if (animation.value) {
      animation.value.cancel();
      isPlaying.value = false;
      progress.value = 0;
    }
  }

  function setProgress(p: number) {
    if (animation.value) {
      animation.value.progress(p);
      progress.value = p;
    }
  }

  // Watch for changes in animation options
  watch(
    () =>
      typeof animationOptions === 'object' && 'value' in animationOptions
        ? animationOptions.value
        : animationOptions,
    createAnimation,
    { deep: true },
  );

  // Watch for element changes
  watch(elementRef, createAnimation);

  // Watch for disabled state
  watch(
    () => (typeof disabled === 'object' && 'value' in disabled ? disabled.value : disabled),
    (isDisabled) => {
      if (isDisabled && animation.value) {
        animation.value.cancel();
      } else if (!isDisabled) {
        createAnimation();
      }
    },
  );

  onMounted(createAnimation);

  onUnmounted(() => {
    if (animation.value) {
      animation.value.cancel();
    }
  });

  return {
    animation: readonly(animation),
    isPlaying: readonly(isPlaying),
    progress: readonly(progress),
    play,
    pause,
    cancel,
    setProgress,
  };
}
```

### Vue Components

```vue
<!-- AnimatedElement.vue -->
<template>
  <div ref="elementRef" :class="className">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAnimation } from './composables/useAnimation';
import type { AnimationOptions } from '@wix/motion';

interface Props {
  animationOptions: AnimationOptions;
  autoPlay?: boolean;
  disabled?: boolean;
  className?: string;
}

interface Emits {
  (e: 'animationComplete'): void;
  (e: 'animationStart'): void;
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: false,
  disabled: false,
});

const emit = defineEmits<Emits>();

const elementRef = ref<HTMLElement>();

const { animation, play, pause, cancel, setProgress } = useAnimation(
  elementRef,
  computed(() => props.animationOptions),
  {
    autoPlay: props.autoPlay,
    disabled: computed(() => props.disabled),
  },
);

// Watch for animation completion
watch(animation, (newAnimation) => {
  if (newAnimation) {
    newAnimation.onFinish(() => {
      emit('animationComplete');
    });
  }
});

// Expose methods to parent
defineExpose({
  play,
  pause,
  cancel,
  setProgress,
});
</script>
```

```vue
<!-- ScrollAnimatedSection.vue -->
[TBD]
```

### Vue Usage Examples

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <!-- Basic animation -->
    <AnimatedElement
      :animation-options="fadeInOptions"
      :auto-play="true"
      @animation-complete="onFadeComplete"
    >
      <h1>Welcome!</h1>
    </AnimatedElement>

    <!-- Controlled animation -->
    <AnimatedElement
      ref="controlledAnimation"
      :animation-options="slideInOptions"
      class="controlled-section"
    >
      <p>Controlled animation content</p>
    </AnimatedElement>

    <button @click="playControlled">Play Animation</button>

    <!-- Scroll animation -->
    [TBD]
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AnimatedElement from './components/AnimatedElement.vue';
import ScrollAnimatedSection from './components/ScrollAnimatedSection.vue';

const controlledAnimation = ref();

const fadeInOptions = {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 800,
};

const slideInOptions = {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'SlideIn', direction: 'left' },
  duration: 1000,
};

const parallaxOptions = {
  type: 'ScrubAnimationOptions',
  namedEffect: { type: 'ParallaxScroll', speed: 0.3 },
};

function onFadeComplete() {
  console.log('Fade animation completed');
}

function playControlled() {
  controlledAnimation.value?.play();
}
</script>
```

## Angular Integration

### Angular Service

```typescript
// animation.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  getWebAnimation,
  getScrubScene,
  AnimationGroup,
  AnimationOptions,
  ScrubAnimationOptions,
} from '@wix/motion';

@Injectable({
  providedIn: 'root',
})
export class AnimationService implements OnDestroy {
  private animations = new Map<string, AnimationGroup>();
  private animationStates = new Map<string, BehaviorSubject<AnimationState>>();

  createAnimation(
    id: string,
    element: HTMLElement,
    options: AnimationOptions,
  ): Observable<AnimationState> {
    // Clean up existing animation
    this.destroyAnimation(id);

    const animation = getWebAnimation(element, options);
    this.animations.set(id, animation);

    // Create state subject
    const stateSubject = new BehaviorSubject<AnimationState>({
      id,
      state: 'idle',
      progress: 0,
    });
    this.animationStates.set(id, stateSubject);

    // Monitor animation state
    this.monitorAnimation(id, animation, stateSubject);

    return stateSubject.asObservable();
  }

  createScrollAnimation(
    id: string,
    element: HTMLElement,
    options: ScrubAnimationOptions,
    trigger?: any,
  ): Observable<AnimationState> {
    // Clean up existing
    this.destroyAnimation(id);

    const scene = getScrubScene(
      element,
      options,
      trigger || {
        trigger: 'view-progress',
        element: document.body,
      },
    );

    // Store scene reference
    (this.animations as any).set(id, scene);

    const stateSubject = new BehaviorSubject<AnimationState>({
      id,
      state: 'idle',
      progress: 0,
    });
    this.animationStates.set(id, stateSubject);

    // Monitor scroll progress
    this.monitorScrollAnimation(id, scene, stateSubject);

    return stateSubject.asObservable();
  }

  private monitorAnimation(
    id: string,
    animation: AnimationGroup,
    stateSubject: BehaviorSubject<AnimationState>,
  ) {
    const updateState = () => {
      const state: AnimationState = {
        id,
        state: animation.playState,
        progress: animation.getProgress(),
      };
      stateSubject.next(state);

      if (animation.playState === 'running') {
        requestAnimationFrame(updateState);
      }
    };

    animation.ready.then(() => {
      updateState();
    });

    animation.onFinish(() => {
      stateSubject.next({
        id,
        state: 'finished',
        progress: 1,
      });
    });
  }

  private monitorScrollAnimation(
    id: string,
    scene: any,
    stateSubject: BehaviorSubject<AnimationState>,
  ) {
    const updateProgress = () => {
      if (Array.isArray(scene) && scene[0]) {
        const progress = scene[0].getProgress();
        stateSubject.next({
          id,
          state: 'running',
          progress,
        });
      }

      requestAnimationFrame(updateProgress);
    };

    updateProgress();
  }

  async playAnimation(id: string): Promise<void> {
    const animation = this.animations.get(id);
    if (animation && 'play' in animation) {
      await animation.play();
    }
  }

  pauseAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation && 'pause' in animation) {
      animation.pause();
    }
  }

  setAnimationProgress(id: string, progress: number): void {
    const animation = this.animations.get(id);
    if (animation && 'progress' in animation) {
      animation.progress(progress);
    }
  }

  destroyAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      if ('cancel' in animation) {
        animation.cancel();
      } else if ('destroy' in animation) {
        (animation as any).destroy();
      }
      this.animations.delete(id);
    }

    const stateSubject = this.animationStates.get(id);
    if (stateSubject) {
      stateSubject.complete();
      this.animationStates.delete(id);
    }
  }

  ngOnDestroy(): void {
    // Clean up all animations
    this.animations.forEach((_, id) => {
      this.destroyAnimation(id);
    });
  }
}

interface AnimationState {
  id: string;
  state: 'idle' | 'running' | 'paused' | 'finished';
  progress: number;
}
```

### Angular Directive

```typescript
// animated.directive.ts
import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { AnimationService } from './animation.service';
import { AnimationOptions } from '@wix/motion';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appAnimated]',
})
export class AnimatedDirective implements OnInit, OnDestroy, OnChanges {
  @Input('appAnimated') animationOptions!: AnimationOptions;
  @Input() autoPlay = false;
  @Input() disabled = false;
  @Input() animationId?: string;

  @Output() animationStateChange = new EventEmitter<any>();
  @Output() animationComplete = new EventEmitter<void>();

  private id: string;
  private subscription?: Subscription;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private animationService: AnimationService,
  ) {
    this.id = this.animationId || `animation_${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnInit(): void {
    this.createAnimation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animationOptions'] && !changes['animationOptions'].firstChange) {
      this.createAnimation();
    }

    if (changes['disabled']) {
      if (this.disabled) {
        this.animationService.destroyAnimation(this.id);
      } else {
        this.createAnimation();
      }
    }
  }

  ngOnDestroy(): void {
    this.animationService.destroyAnimation(this.id);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private createAnimation(): void {
    if (this.disabled || !this.animationOptions) return;

    this.subscription?.unsubscribe();

    this.subscription = this.animationService
      .createAnimation(this.id, this.elementRef.nativeElement, this.animationOptions)
      .subscribe((state) => {
        this.animationStateChange.emit(state);

        if (state.state === 'finished') {
          this.animationComplete.emit();
        }
      });

    if (this.autoPlay) {
      this.play();
    }
  }

  async play(): Promise<void> {
    await this.animationService.playAnimation(this.id);
  }

  pause(): void {
    this.animationService.pauseAnimation(this.id);
  }

  setProgress(progress: number): void {
    this.animationService.setAnimationProgress(this.id, progress);
  }
}
```

### Angular Component

```typescript
// animated-container.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AnimationOptions } from '@wix/motion';

@Component({
  selector: 'app-animated-container',
  template: `
    <div
      [appAnimated]="animationOptions"
      [autoPlay]="autoPlay"
      [disabled]="disabled"
      [class]="className"
      (animationStateChange)="onStateChange($event)"
      (animationComplete)="animationComplete.emit()"
    >
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedContainerComponent {
  @Input() animationOptions!: AnimationOptions;
  @Input() autoPlay = false;
  @Input() disabled = false;
  @Input() className?: string;

  @Output() animationStateChange = new EventEmitter<any>();
  @Output() animationComplete = new EventEmitter<void>();

  onStateChange(state: any): void {
    this.animationStateChange.emit(state);
  }
}
```

### Angular Usage Examples

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { AnimationOptions } from '@wix/motion';

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <!-- Basic animation -->
      <app-animated-container
        [animationOptions]="fadeInOptions"
        [autoPlay]="true"
        (animationComplete)="onFadeComplete()"
      >
        <h1>Welcome to our Angular app!</h1>
      </app-animated-container>

      <!-- Controlled animation -->
      <div
        [appAnimated]="slideInOptions"
        #controlledAnimation="appAnimated"
        class="controlled-section"
      >
        <p>Controlled animation content</p>
      </div>

      <button (click)="controlledAnimation.play()">Play Animation</button>

      <!-- Dynamic animation -->
      <app-animated-container
        [animationOptions]="dynamicOptions"
        [autoPlay]="shouldAutoPlay"
        (animationStateChange)="onStateChange($event)"
      >
        <div class="dynamic-content">Dynamic content</div>
      </app-animated-container>

      <button (click)="changeAnimation()">Change Animation</button>
    </div>
  `,
})
export class AppComponent {
  fadeInOptions: AnimationOptions = {
    type: 'TimeAnimationOptions',
    namedEffect: { type: 'FadeIn' },
    duration: 800,
  };

  slideInOptions: AnimationOptions = {
    type: 'TimeAnimationOptions',
    namedEffect: { type: 'SlideIn', direction: 'bottom' },
    duration: 1000,
  };

  dynamicOptions: AnimationOptions = this.fadeInOptions;
  shouldAutoPlay = false;

  onFadeComplete(): void {
    console.log('Fade animation completed');
  }

  onStateChange(state: any): void {
    console.log('Animation state:', state);
  }

  changeAnimation(): void {
    this.dynamicOptions =
      this.dynamicOptions === this.fadeInOptions ? this.slideInOptions : this.fadeInOptions;
    this.shouldAutoPlay = true;
  }
}
```

## Universal Patterns

### SSR-Safe Animation Initialization

```typescript
// ssr-safe-animation.ts
export function createSSRSafeAnimation(
  element: HTMLElement | null,
  options: AnimationOptions,
  fallback?: () => void,
): AnimationGroup | null {
  // Check if we're in browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('Animations not available in SSR environment');
    if (fallback) fallback();
    return null;
  }

  // Check for animation support
  if (!element || !('animate' in HTMLElement.prototype)) {
    console.warn('Web Animations API not supported');
    if (fallback) fallback();
    return null;
  }

  try {
    return getWebAnimation(element, options);
  } catch (error) {
    console.error('Animation creation failed:', error);
    if (fallback) fallback();
    return null;
  }
}
```

### Cross-Framework Animation Manager

```typescript
// universal-animation-manager.ts
interface FrameworkAdapter {
  onMount?: (callback: () => void) => void;
  onUnmount?: (callback: () => void) => void;
  watch?: <T>(value: () => T, callback: (newValue: T) => void) => void;
  ref?: <T>(initialValue: T) => { value: T };
}

export class UniversalAnimationManager {
  private animations = new Map<string, AnimationGroup>();
  private adapter: FrameworkAdapter;

  constructor(adapter: FrameworkAdapter) {
    this.adapter = adapter;
  }

  createAnimation(
    id: string,
    getElement: () => HTMLElement | null,
    getOptions: () => AnimationOptions,
    config: {
      autoPlay?: boolean;
      dependencies?: any[];
    } = {},
  ) {
    const createFn = () => {
      const element = getElement();
      const options = getOptions();

      if (!element) return;

      // Clean up existing
      this.destroyAnimation(id);

      // Create new animation
      const animation = createSSRSafeAnimation(element, options, () => {
        // Fallback: just ensure element is visible
        element.style.opacity = '1';
      });

      if (animation) {
        this.animations.set(id, animation);

        if (config.autoPlay) {
          animation.play();
        }
      }
    };

    // Initial creation
    if (this.adapter.onMount) {
      this.adapter.onMount(createFn);
    } else {
      createFn();
    }

    // Watch for changes
    if (this.adapter.watch && config.dependencies) {
      this.adapter.watch(getOptions, createFn);
    }

    // Cleanup
    if (this.adapter.onUnmount) {
      this.adapter.onUnmount(() => {
        this.destroyAnimation(id);
      });
    }

    return {
      play: () => this.animations.get(id)?.play(),
      pause: () => this.animations.get(id)?.pause(),
      cancel: () => this.destroyAnimation(id),
      progress: (p: number) => this.animations.get(id)?.progress(p),
    };
  }

  destroyAnimation(id: string) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.cancel();
      this.animations.delete(id);
    }
  }

  destroyAll() {
    this.animations.forEach((animation) => animation.cancel());
    this.animations.clear();
  }
}
```

## Best Practices Summary

### ✅ Do

- **Cleanup animations** on component unmount
- **Use refs/reactive patterns** for element access
- **Memoize animation options** to prevent unnecessary recreations
- **Handle SSR gracefully** with proper environment checks
- **Implement error boundaries** for animation failures

### ❌ Don't

- **Forget to clean up** animations and event listeners
- **Recreate animations** on every prop change
- **Block rendering** with synchronous custom animation operations

### Performance Tips

1. **Lazy load animations below the fold** for better initial page load
2. **Use CSS animations** with SSR as much as possible
3. **Batch DOM operations** when creating multiple animations
4. **Implement intersection observers** for viewport-based animations
5. **Monitor performance** and adapt animation complexity

---

**Complete**: You now have comprehensive framework integration patterns for Wix Motion. Return to the [Guide Overview](README.md) or continue with [Testing](testing.md) for animation testing strategies.
