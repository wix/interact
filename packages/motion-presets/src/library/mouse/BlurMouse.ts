import {
  getCssUnits,
  getMouseTransitionEasing,
  distance2d,
  mapRange,
  parseLength,
  parseDirection,
} from '../../utils';
import { quadInOut } from '@wix/motion';
import { CustomMouse } from './CustomMouse';
import { ScrubAnimationOptions, AnimationExtraOptions, BlurMouse, Progress } from '../../types';

const DEFAULT_DISTANCE = { value: 80, unit: 'px' };
const DEFAULT_ANGLE = 5;

class BlurMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { distance, angle, scale, invert, blur, perspective } = this.options;

    const translateX = mapRange(0, 1, -distance.value, distance.value, progressX) * invert;
    const translateY = mapRange(0, 1, -distance.value, distance.value, progressY) * invert;

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

    const units = getCssUnits(distance.unit);

    const transform = `perspective(${perspective}px) translateX(${translateX}${units}) translateY(${translateY}${units}) scale(${maxScale}, ${maxScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(var(--motion-rotate, 0deg))`;

    const progressDistance = distance2d([0.5, 0.5], [progressX, progressY]);
    const blurFilter = Math.round(mapRange(0, 1, 0, blur, quadInOut(progressDistance)));

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
  const inverted = namedEffect.inverted ?? false;
  const distance = parseLength(namedEffect.distance, DEFAULT_DISTANCE);
  const angle = parseDirection(namedEffect.angle, [], DEFAULT_ANGLE, true) as number;
  const { scale = 0.3, blur = 20, perspective = 600 } = namedEffect;
  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(
          transitionEasing,
        )}, filter ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    distance,
    angle,
    scale,
    blur,
    perspective,
    invert,
  };

  return (target: HTMLElement) => new BlurMouseAnimation(target, animationOptions);
}
