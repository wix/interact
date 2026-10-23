import { getMouseTransitionEasing, mapRange, parseDirection } from '../../utils';
import { CustomMouse } from './CustomMouse';
import { ScrubAnimationOptions, AnimationExtraOptions, Tilt3DMouse, Progress } from '../../types';

export const schema = {
  angle: { type: 'number', default: 5 },
  inverted: { type: 'bool', default: false },
  perspective: { type: 'number', min: 0, default: 800 },
} as const;

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
  const inverted = namedEffect.inverted ?? schema.inverted.default;
  const angle = parseDirection(namedEffect.angle, [], schema.angle.default, true) as number;
  const { perspective = schema.perspective.default } = namedEffect;
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

create.schema = schema;
