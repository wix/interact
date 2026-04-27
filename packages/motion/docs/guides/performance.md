# Performance Optimization

Complete guide to optimizing Wix Motion animations for smooth 60fps performance across all devices and use cases.

## Overview

Wix Motion is designed for high performance, but complex animations and large-scale implementations require careful optimization. This guide covers performance principles, optimization techniques, and best practices for maintaining smooth animations.

### Performance Principles

1. **Minimize Layout Thrashing** - Use only transform, fitler, and opacity properties when possible
2. **Batch DOM Operations** - Group measurements and mutations using `fastdom`
3. **Optimize Animation Lifecycle** - Prepare, create, and clean up efficiently
4. **Choose Appropriate Rendering** - Balance CSS vs JavaScript animations
5. **Respect Device Capabilities** - Adapt to mobile and low-power devices

## Rendering Strategy Selection

### CSS Animations vs Web Animations API

Choose the right rendering approach based on your use case:

#### Use CSS Animations (`getCSSAnimation`) where possible:

```typescript
const cssRules = getCSSAnimation('hero-element', {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 800
});

// Insert into a stylesheet
const sheet = new CSSStyleSheet();
style.insertRule(cssRules);
document.adoptedStyleSheets.push(sheet);

// OR render to a style tag on server-side using plain strings
<sytle>`${cssRules}`</style>

// OR render to a style tag on server-side using a framework (e.g. React)
<style>{cssRules}</style>
```

#### Use Web Animations API (`getWebAnimation`) For:

```typescript
// ✅ Interactive animations requiring control
const interactiveAnimation = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'BounceIn' },
});

// Control based on user interaction
button.addEventListener('click', async () => {
  await interactiveAnimation.play();
});

// ✅ Dynamic parameter changes
const dynamicAnimation = getWebAnimation(element, baseOptions);

// Change speed based on performance
if (performance.now() - lastFrame > 16) {
  dynamicAnimation.setPlaybackRate(0.5); // Slow down if dropping frames
}

// ✅ Complex timing sequences
const sequence = [
  getWebAnimation(intro, introOptions),
  getWebAnimation(main, mainOptions),
  getWebAnimation(outro, outroOptions),
];

for (const animation of sequence) {
  await animation.play();
  await animation.finished;
}
```

## DOM Performance Optimization

### Efficient Measurement and Mutation

Use `fastdom` to batch DOM operations and prevent layout thrashing:

```typescript
import fastdom from 'fastdom';

class OptimizedAnimationManager {
  private measurementQueue: (() => void)[] = [];
  private mutationQueue: (() => void)[] = [];

  // Batch measurements
  queueMeasurement(fn: () => void) {
    this.measurementQueue.push(fn);

    if (this.measurementQueue.length === 1) {
      fastdom.measure(() => {
        this.measurementQueue.forEach((measurement) => measurement());
        this.measurementQueue = [];
      });
    }
  }

  // Batch mutations
  queueMutation(fn: () => void) {
    this.mutationQueue.push(fn);

    if (this.mutationQueue.length === 1) {
      fastdom.mutate(() => {
        this.mutationQueue.forEach((mutation) => mutation());
        this.mutationQueue = [];
      });
    }
  }

  // Optimized element preparation
  prepareElements(elements: HTMLElement[], options: AnimationOptions[]) {
    // Batch all measurements first
    const measurements: any[] = [];

    fastdom.measure(() => {
      elements.forEach((element, index) => {
        measurements[index] = {
          width: element.offsetWidth,
          height: element.offsetHeight,
          bounds: element.getBoundingClientRect(),
        };
      });
    });

    // Then batch all preparations
    fastdom.mutate(() => {
      elements.forEach((element, index) => {
        prepareAnimation(element, options[index]);
      });
    });
  }
}
```

### Minimize Reflows and Repaints

#### ✅ Preferred Properties (GPU Accelerated)

```typescript
// Use transform instead of changing position
const optimizedMove = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  keyframeEffect: {
    type: 'KeyframeEffect',
    name: 'optimizedMove',
    keyframes: [
      { transform: 'translateX(0px)' }, // ✅ GPU accelerated
      { transform: 'translateX(100px)' },
    ],
  },
});

// Use scale instead of width/height
const optimizedResize = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  keyframeEffect: {
    type: 'KeyframeEffect',
    name: 'optimizedResize',
    keyframes: [
      { transform: 'scale(0.5)' }, // ✅ GPU accelerated
      { transform: 'scale(1)' },
    ],
  },
});
```

#### ❌ Avoid Layout Properties

```typescript
// ❌ These properties cause expensive layout recalculations
const expensiveAnimation = {
  keyframes: [
    { width: '100px', height: '100px', left: '0px', top: '0px' },
    { width: '200px', height: '200px', left: '50px', top: '50px' },
  ],
};

// ✅ Use transforms instead
const efficientAnimation = {
  keyframes: [
    { transform: 'translate(0px, 0px) scale(1)' },
    { transform: 'translate(50px, 50px) scale(2)' },
  ],
};
```

## Performance Monitoring and Debugging

### Animation Performance Profiler

```typescript
class AnimationProfiler {
  private profiles = new Map<string, PerformanceProfile>();

  startProfiling(animationId: string) {
    const profile: PerformanceProfile = {
      startTime: performance.now(),
      frameCount: 0,
      droppedFrames: 0,
      totalDuration: 0,
      lastFrameTime: performance.now(),
    };

    this.profiles.set(animationId, profile);
    this.monitorAnimation(animationId);
  }

  private monitorAnimation(animationId: string) {
    const profile = this.profiles.get(animationId);
    if (!profile) return;

    const monitor = () => {
      const now = performance.now();
      const frameTime = now - profile.lastFrameTime;

      profile.frameCount++;
      profile.totalDuration = now - profile.startTime;

      // Detect dropped frames (> 16.67ms for 60fps)
      if (frameTime > 20) {
        profile.droppedFrames++;
      }

      profile.lastFrameTime = now;

      // Continue monitoring
      if (this.profiles.has(animationId)) {
        requestAnimationFrame(monitor);
      }
    };

    requestAnimationFrame(monitor);
  }

  stopProfiling(animationId: string): PerformanceReport | null {
    const profile = this.profiles.get(animationId);
    if (!profile) return null;

    this.profiles.delete(animationId);

    const avgFPS = (profile.frameCount / profile.totalDuration) * 1000;
    const dropRate = (profile.droppedFrames / profile.frameCount) * 100;

    return {
      animationId,
      duration: profile.totalDuration,
      averageFPS: avgFPS,
      frameDropRate: dropRate,
      totalFrames: profile.frameCount,
      droppedFrames: profile.droppedFrames,
      performance: this.getPerformanceRating(avgFPS, dropRate),
    };
  }

  private getPerformanceRating(fps: number, dropRate: number): 'excellent' | 'good' | 'poor' {
    if (fps >= 55 && dropRate < 5) return 'excellent';
    if (fps >= 45 && dropRate < 10) return 'good';
    return 'poor';
  }
}

interface PerformanceProfile {
  startTime: number;
  frameCount: number;
  droppedFrames: number;
  totalDuration: number;
  lastFrameTime: number;
}

interface PerformanceReport {
  animationId: string;
  duration: number;
  averageFPS: number;
  frameDropRate: number;
  totalFrames: number;
  droppedFrames: number;
  performance: 'excellent' | 'good' | 'poor';
}
```

### Debug Tools

```typescript
class AnimationDebugger {
  private isDebugMode = false;
  private debugOverlay: HTMLElement | null = null;

  enableDebugMode() {
    this.isDebugMode = true;
    this.createDebugOverlay();
  }

  disableDebugMode() {
    this.isDebugMode = false;
    this.removeDebugOverlay();
  }

  logAnimationStats(animation: AnimationGroup, label: string) {
    if (!this.isDebugMode) return;

    console.group(`🎬 Animation: ${label}`);
    console.log('State:', animation.playState);
    console.log('Progress:', animation.getProgress());
    console.log('Animation count:', animation.animations.length);

    // Log individual animation details
    animation.animations.forEach((anim, index) => {
      console.log(`Animation ${index}:`, {
        effect: anim.effect,
        playState: anim.playState,
        currentTime: anim.currentTime,
        startTime: anim.startTime,
      });
    });

    console.groupEnd();
  }

  measureAnimationImpact(
    element: HTMLElement,
    beforeCallback: () => void,
    afterCallback: () => void,
  ) {
    if (!this.isDebugMode) return;

    // Measure before animation
    const beforeMetrics = this.captureMetrics();
    beforeCallback();

    // Measure after animation
    requestAnimationFrame(() => {
      const afterMetrics = this.captureMetrics();
      this.reportMetricsDiff(beforeMetrics, afterMetrics);
      afterCallback();
    });
  }

  private captureMetrics() {
    return {
      timestamp: performance.now(),
      memory: (performance as any).memory
        ? {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
          }
        : null,
      timing: performance.getEntriesByType('measure').length,
    };
  }

  private reportMetricsDiff(before: any, after: any) {
    console.group('📊 Performance Impact');
    console.log('Duration:', after.timestamp - before.timestamp, 'ms');

    if (before.memory && after.memory) {
      const memoryDiff = after.memory.used - before.memory.used;
      console.log('Memory change:', memoryDiff, 'bytes');
    }

    console.groupEnd();
  }

  private createDebugOverlay() {
    if (this.debugOverlay) return;

    this.debugOverlay = document.createElement('div');
    this.debugOverlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgb(0 0 0 / 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      pointer-events: none;
    `;

    document.body.appendChild(this.debugOverlay);
    this.updateDebugOverlay();
  }

  private updateDebugOverlay() {
    if (!this.debugOverlay) return;

    const updateStats = () => {
      if (!this.debugOverlay) return;

      const memory = (performance as any).memory;
      const fps = this.calculateFPS();

      this.debugOverlay.innerHTML = `
        <div>FPS: ${fps.toFixed(1)}</div>
        ${memory ? `<div>Memory: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>` : ''}
        <div>Animations: ${document.getAnimations().length}</div>
      `;

      if (this.isDebugMode) {
        requestAnimationFrame(updateStats);
      }
    };

    updateStats();
  }

  private calculateFPS(): number {
    // Simple FPS calculation
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 60;

    const measure = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measure);
    };

    measure();
    return fps;
  }

  private removeDebugOverlay() {
    if (this.debugOverlay) {
      this.debugOverlay.remove();
      this.debugOverlay = null;
    }
  }
}
```

## Performance Checklist

### ✅ Pre-Animation Optimization

- [ ] Choose appropriate rendering method (CSS vs JavaScript)
- [ ] Batch DOM measurements using `fastdom` or similar
- [ ] Pre-calculate complex values during idle time

### ✅ Animation Creation Optimization

- [ ] Prefer transform, opacity properties
- [ ] Set up proper cleanup for memory management
- [ ] Consider device capabilities and user preferences

### ✅ Runtime Optimization

- [ ] Pause infinite animations when out of viewport
- [ ] Adjust animation complexity based on performance
- [ ] Clean up animations when components unmount

---

**Next**: Explore [Advanced Patterns](advanced-patterns.md) for complex animation scenarios, or return to the [API Reference](../api/) for function documentation.
