import { AnimationGroup } from './AnimationGroup';
import type { IndexedGroup, SequenceOptions } from './types';
import { linear } from './easings';
import { getJsEasing } from './utils';

/**
 * @class Sequence
 *
 * Manages multiple AnimationGroups as a coordinated timeline with staggered delays.
 * Extends AnimationGroup to inherit the playback control API while delegating
 * to child AnimationGroup instances.
 */
export class Sequence extends AnimationGroup {
  animationGroups: AnimationGroup[];
  delay: number;
  offset: number;
  offsetEasing: (p: number) => number;
  private timingOptions: { delay: number; duration: number; iterations: number }[][];

  constructor(animationGroups: AnimationGroup[], options: SequenceOptions = {}) {
    const allAnimations = animationGroups.flatMap((group) => [...group.animations]);
    super(allAnimations);

    this.animationGroups = animationGroups;
    this.delay = options.delay ?? 0;
    this.offset = options.offset ?? 0;
    this.offsetEasing =
      typeof options.offsetEasing === 'function'
        ? options.offsetEasing
        : (getJsEasing(options.offsetEasing) ?? linear);

    this.timingOptions = this.animationGroups.map((g) => {
      return g.getTimingOptions().map(({ delay, duration, iterations }) => {
        return {
          delay,
          duration: Number.isFinite(duration) ? duration : 0,
          iterations: Number.isFinite(iterations) ? iterations : 1,
        };
      });
    });

    this.applyOffsets();

    this.ready = Promise.all(animationGroups.map((g) => g.ready)).then(() => {});
  }

  /**
   * Calculates stagger delay offsets for each animation group using the formula:
   *   easing(i / last) * last * offset
   * where i is the group index and last is the index of the final group.
   */
  private calculateOffsets(): number[] {
    const count = this.animationGroups.length;
    if (count <= 1) return [0];

    const last = count - 1;

    return Array.from(
      { length: count },
      (_, i) => (this.offsetEasing(i / last) * last * this.offset) | 0,
    );
  }

  private applyOffsets(): void {
    if (this.animationGroups.length === 0 || this.animations.length === 0) return;

    const offsets = this.calculateOffsets();
    const sequenceDuration = this.getSequenceActiveDuration(offsets);

    this.animationGroups.forEach((group, groupIdx) => {
      group.animations.forEach((animation, animIdx) => {
        const effect = animation.effect;

        if (!effect) return;

        const { delay: baseDelay, duration, iterations } = this.timingOptions[groupIdx][animIdx];
        const delay = baseDelay + offsets[groupIdx];
        const endDelay = sequenceDuration - (delay + duration * iterations);

        // add the sequence delay to the animation delay at the end - it doesn't need to affect the endDelay
        effect.updateTiming({ delay: delay + this.delay, endDelay });
      });
    });
  }

  private getSequenceActiveDuration(offsets: number[]): number {
    const result: number[] = [];

    for (let i = 0; i < this.timingOptions.length; i++) {
      const activeDuration = this.timingOptions[i].reduce((max, options) => {
        if (!options) return max;

        const { delay, duration, iterations } = options;

        return Math.max(max, delay + duration * iterations);
      }, 0);

      result.push(offsets[i] + activeDuration);
    }

    return Math.max(...result);
  }

  /**
   * Inserts new AnimationGroups at specified indices, then recalculates
   * stagger offsets for all groups. Each entry specifies the target index
   * in the animationGroups array where the group should be inserted.
   */
  addGroups(entries: IndexedGroup[]): void {
    if (entries.length === 0) return;

    const sorted = [...entries].sort((a, b) => b.index - a.index);

    for (const { index, group } of sorted) {
      const clampedIndex = Math.min(index, this.animationGroups.length);
      this.animationGroups.splice(clampedIndex, 0, group);
      this.timingOptions.splice(clampedIndex, 0, group.getTimingOptions());

      const flatAnimations = [...group.animations];
      const insertAt = this.animationGroups
        .slice(0, clampedIndex)
        .reduce((sum, g) => sum + g.animations.length, 0);
      this.animations.splice(insertAt, 0, ...flatAnimations);
    }

    this.applyOffsets();
    this.ready = Promise.all(this.animationGroups.map((g) => g.ready)).then(() => {});
  }

  /**
   * Removes AnimationGroups that match the predicate, then recalculates
   * stagger offsets for remaining groups. Cancelled animations in removed
   * groups are returned.
   */
  removeGroups(predicate: (group: AnimationGroup) => boolean): AnimationGroup[] {
    const removed: AnimationGroup[] = [];
    const keptGroups: AnimationGroup[] = [];
    const keptTimingOptions: { delay: number; duration: number; iterations: number }[][] = [];

    for (let i = 0; i < this.animationGroups.length; i++) {
      if (predicate(this.animationGroups[i])) {
        removed.push(this.animationGroups[i]);
      } else {
        keptGroups.push(this.animationGroups[i]);
        keptTimingOptions.push(this.timingOptions[i]);
      }
    }

    if (removed.length === 0) return removed;

    for (const group of removed) {
      group.cancel();
    }

    this.animationGroups = keptGroups;
    this.timingOptions = keptTimingOptions;
    this.animations = keptGroups.flatMap((group) => [...group.animations]);

    this.applyOffsets();
    this.ready = Promise.all(this.animationGroups.map((g) => g.ready)).then(() => {});

    return removed;
  }

  async onFinish(callback: () => void): Promise<void> {
    try {
      await Promise.all(this.animationGroups.map((group) => group.finished));
      callback();
    } catch (_error) {
      console.warn('animation was interrupted - aborting onFinish callback - ', _error);
    }
  }
}
