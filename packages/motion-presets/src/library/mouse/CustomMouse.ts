import type { AnimationExtraOptions, Progress, ScrubAnimationOptions } from '../../types';

export class CustomMouse {
  target: HTMLElement;
  options: Record<string, any>;
  currentProgress: Progress;

  constructor(target: HTMLElement, options?: Record<string, any>) {
    this.target = target;
    this.options = options || {};
    this.currentProgress = { x: 0.5, y: 0.5, v: { x: 0, y: 0 }, active: true };

    this.play();
  }

  progress({ x, y, v, active }: Progress) {
    this.currentProgress = { x, y, v, active };
    if (typeof this.options.customEffect === 'function') {
      this.options.customEffect(this.target, this.currentProgress);
    }
  }

  cancel() {
    this.currentProgress = { x: 0.5, y: 0.5, v: { x: 0, y: 0 } };
  }

  getProgress() {
    return this.currentProgress;
  }

  play() {
    if (this.options.transition && this.target) {
      this.target.style.transition = this.options.transition;
    }
  }
}

export function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  return (target: HTMLElement) => new CustomMouse(target, options);
}
