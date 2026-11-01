import type { LengthValue } from '../../utils';
import { getMouseTransitionEasing, mapRange, parseLengthLazy } from '../../utils';
import { CustomMouse } from './CustomMouse';
import { ScrubAnimationOptions, AnimationExtraOptions, BlobMouse, Progress } from '../../types';

const DEFAULTS: Required<BlobMouse> = {
  type: 'BlobMouse',
  inverted: false,
  scale: 1.4,
  travel: { value: 200, unit: 'px' },
};

export const schema = {
  inverted: { type: 'bool', default: DEFAULTS.inverted },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  travel: { type: 'length', default: DEFAULTS.travel },
};

class BlobMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { travel, scale, invert } = this.options;
    const translateX = mapRange(0, 1, -1, 1, progressX) * invert;
    const translateY = mapRange(0, 1, -1, 1, progressY) * invert;

    // if progressX === 0 || progressX === 1, scaleX === scale, if progressX === 0.5, scaleX === 1
    const scaleX =
      progressX < 0.5
        ? mapRange(0, 0.5, scale, 1, progressX)
        : mapRange(0.5, 1, 1, scale, progressX);

    // if progressY === 0 || progressY === 1, scaleY === scale, if progressY === 0.5, scaleY === 1
    const scaleY =
      progressY < 0.5
        ? mapRange(0, 0.5, scale, 1, progressY)
        : mapRange(0.5, 1, 1, scale, progressY);

    this.target.style.transform = `translateX(calc(${travel} * ${translateX})) translateY(calc(${travel} * ${translateY})) scale(${scaleX}, ${scaleY}) rotate(var(--motion-rotate, 0deg))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as BlobMouse;
  const { inverted = DEFAULTS.inverted, scale = DEFAULTS.scale } = namedEffect;
  const travel = parseLengthLazy(namedEffect.travel, DEFAULTS.travel as LengthValue);

  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    invert,
    travel,
    scale,
  };

  return (target: HTMLElement) => new BlobMouseAnimation(target, animationOptions);
}
