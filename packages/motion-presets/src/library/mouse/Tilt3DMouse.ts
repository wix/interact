import { getMouseTransitionEasing, mapRange, parseDirection } from '../../utils';
import { CustomMouse } from './CustomMouse';
import { ScrubAnimationOptions, AnimationExtraOptions, Tilt3DMouse, Progress } from '../../types';

const DEFAULT_ANGLE = 5;

class Tilt3DMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { invert, angle, perspective } = this.options;

    // if progressX === 0, rotateX === -angle, if progressX === 0.5, rotateX === 0, if progressX === 1, rotateX === angle
    const rotateX = mapRange(0, 1, angle, -angle, progressY) * invert;
    const rotateY = mapRange(0, 1, -angle, angle, progressX) * invert;

    this.target.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(var(--motion-rotate, 0deg))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as Tilt3DMouse;
  const inverted = namedEffect.inverted ?? false;
  const angle = parseDirection(namedEffect.angle, [], DEFAULT_ANGLE, true) as number;
  const { perspective = 800 } = namedEffect;
  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    invert,
    angle,
    perspective,
  };

  return (target: HTMLElement) => new Tilt3DMouseAnimation(target, animationOptions);
}
