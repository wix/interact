import type { LengthValue } from '../../utils';
import { getMouseTransitionEasing, distance2d, mapRange, parseCssLength } from '../../utils';
import { quadInOut } from '@wix/motion';
import { CustomMouse } from './CustomMouse';
import { ScrubAnimationOptions, AnimationExtraOptions, BlurMouse, Progress } from '../../types';

const DEFAULTS: Required<BlurMouse> = {
  type: 'BlurMouse',
  angle: 5,
  blur: 16.57,
  inverted: false,
  perspective: 600,
  scale: 0.3,
  travel: { value: 80, unit: 'px' },
};

// the cursor's distance from the center is at most √0.5, at the corners, where the blur peaks
const PEAK_EASED_DISTANCE = quadInOut(Math.SQRT1_2);

export const schema = {
  angle: { type: 'number', min: 0, default: DEFAULTS.angle },
  blur: { type: 'number', min: 0, default: DEFAULTS.blur },
  inverted: { type: 'bool', default: DEFAULTS.inverted },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  travel: { type: 'length', default: DEFAULTS.travel },
};

class BlurMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { travel, angle, scale, invert, blur, perspective } = this.options;

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

    const maxScale = Math.min(scaleX, scaleY);

    // if progressX === 0, rotateX === -angle, if progressX === 0.5, rotateX === 0, if progressX === 1, rotateX === angle
    const rotateX = mapRange(0, 1, -angle, angle, progressY) * invert;
    const rotateY = mapRange(0, 1, angle, -angle, progressX) * invert;

    const transform = `perspective(${perspective}px) translateX(calc(${travel} * ${translateX})) translateY(calc(${travel} * ${translateY})) scale(${maxScale}, ${maxScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(var(--motion-rotate, 0deg))`;

    const progressDistance = distance2d([0.5, 0.5], [progressX, progressY]);
    const blurFilter = (blur * quadInOut(progressDistance)) / PEAK_EASED_DISTANCE;

    const filter = `blur(${blurFilter}px)`;

    this.target.style.transform = transform;
    this.target.style.filter = filter;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.filter = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as BlurMouse;
  const {
    inverted = DEFAULTS.inverted,
    angle = DEFAULTS.angle,
    scale = DEFAULTS.scale,
    blur = DEFAULTS.blur,
    perspective = DEFAULTS.perspective,
  } = namedEffect;
  const travel = parseCssLength(namedEffect.travel, DEFAULTS.travel as LengthValue);
  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(
          transitionEasing,
        )}, filter ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    travel,
    angle,
    scale,
    blur,
    perspective,
    invert,
  };

  return (target: HTMLElement) => new BlurMouseAnimation(target, animationOptions);
}
