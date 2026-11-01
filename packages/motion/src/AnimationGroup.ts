import { AnimationGroupOptions, RangeOffset } from './types';

/**
 * @class AnimationGroup
 *
 * A wrapper object for simulating a GroupEffect and managing multiple animations.
 * See: https://www.w3.org/TR/web-animations-2/#grouping-and-synchronization
 */
export class AnimationGroup {
  animations: (Animation & {
    start?: RangeOffset;
    end?: RangeOffset;
  })[];
  options?: AnimationGroupOptions;
  ready: Promise<void>;
  isCSS: boolean;
  longestAnimation: Animation;

  constructor(animations: Animation[], options?: AnimationGroupOptions) {
    this.animations = animations;
    this.options = options;
    this.ready = options?.measured || Promise.resolve();
    this.isCSS = animations[0] instanceof CSSAnimation;
    this.longestAnimation = this._getAnimationWithLongestEndTime();
  }

  _getAnimationWithLongestEndTime() {
    return this.animations.reduce((longest, current) => {
      const longestEndTime = longest.effect?.getComputedTiming().endTime ?? 0;
      const currentEndTime = current.effect?.getComputedTiming().endTime ?? 0;
      return longestEndTime > currentEndTime ? longest : current;
    }, this.animations[0]);
  }

  getProgress() {
    return this.longestAnimation?.effect?.getComputedTiming().progress || 0;
  }

  async play(callback?: () => void): Promise<void> {
    await this.ready;

    for (const animation of this.animations) {
      animation.play();
    }

    // TODO: Wait for all animations to be ready, using allSettled to handle rejections gracefully
    // await Promise.allSettled(
    await Promise.all(this.animations.map((animation) => animation.ready));

    if (callback) {
      callback();
    }
  }

  pause() {
    for (const animation of this.animations) {
      animation.pause();
    }
  }

  async reverse(callback?: () => void): Promise<void> {
    await this.ready;

    for (const animation of this.animations) {
      animation.reverse();
    }

    // TODO: Wait for all animations to be ready, using allSettled to handle rejections gracefully
    // await Promise.allSettled(
    await Promise.all(this.animations.map((animation) => animation.ready));

    if (callback) {
      callback();
    }
  }

  progress(p: number) {
    for (const animation of this.animations) {
      const { delay, duration, iterations } = animation.effect!.getTiming();
      const time =
        (Number.isFinite(duration) ? (duration as number) : 0) *
        (Number.isFinite(iterations) ? (iterations as number) : 1);
      animation.currentTime = ((delay || 0) + time) * p;
    }
  }

  cancel() {
    for (const animation of this.animations) {
      animation.cancel();
    }
  }

  setPlaybackRate(rate: number) {
    for (const animation of this.animations) {
      animation.playbackRate = rate;
    }
  }

  async onFinish(callback: () => void): Promise<void> {
    try {
      await Promise.all(this.animations.map((animation) => animation.finished));

      const a = this.animations[0];

      if (a && !this.isCSS) {
        const target = (a.effect as KeyframeEffect)?.target;

        if (target) {
          const effectId = this.options?.effectId || a.id;
          const endEvent = new CustomEvent('animationend', { detail: { effectId } });
          target.dispatchEvent(endEvent);
        }
      }

      callback();
    } catch (_error) {
      console.warn('animation was interrupted - aborting onFinish callback - ', _error);
    }
  }

  async onAbort(callback: () => void): Promise<void> {
    try {
      await Promise.all(this.animations.map((animation) => animation.finished));
    } catch (error: any) {
      if (error.name === 'AbortError') {
        const a = this.animations[0];

        if (a && !this.isCSS) {
          const target = (a.effect as KeyframeEffect)?.target;

          if (target) {
            const cancelEvent = new Event('animationcancel');
            target.dispatchEvent(cancelEvent);
          }
        }

        callback();
      }
    }
  }

  get finished() {
    return Promise.all(this.animations.map((animation) => animation.finished));
  }

  get playState() {
    return this.animations.some((a) => a.playState === 'running')
      ? 'running'
      : this.animations[0]?.playState;
  }

  hasAnimationName(name: string): boolean {
    return this.animations.some((a) => (a as CSSAnimation).animationName === name);
  }

  hasAnimationId(id: string): boolean {
    return this.animations.some((a) => a.id === id);
  }

  getTimingOptions() {
    return this.animations.map((a) => {
      const timing = a.effect?.getTiming();
      const delay = timing?.delay ?? 0;
      const duration = Number(timing?.duration) || 0;
      const iterations = timing?.iterations ?? 1;

      return {
        delay,
        duration,
        iterations,
      };
    });
  }
}
