import {
  ScrubAnimationOptions,
  AnimationExtraOptions,
  SpinMouse,
  Progress,
  MouseEffectAxis,
} from '../../types';
import { getMouseTransitionEasing, getAngleInDeg, parseDirection } from '../../utils';
import { CustomMouse } from './CustomMouse';

const DEFAULT_AXIS: MouseEffectAxis = 'both';
const AXES = ['both', 'horizontal', 'vertical'] as const;

class SpinMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { invert, axis } = this.options;

    const rotation =
      getAngleInDeg(
        [0.5, 0.5],
        [axis === 'vertical' ? 0 : progressX, axis === 'horizontal' ? 0 : progressY],
        90,
      ) * invert;

    this.target.style.transform = `rotate(calc(${rotation}deg + var(--motion-rotate, 0deg)))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing = 'linear' } = options;
  const namedEffect = options.namedEffect as SpinMouse;
  const inverted = namedEffect.inverted ?? false;
  const axis = parseDirection(namedEffect.axis, AXES, DEFAULT_AXIS) as MouseEffectAxis;
  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    invert,
    axis,
  };

  return (target: HTMLElement) => new SpinMouseAnimation(target, animationOptions);
}

export function web(options: ScrubAnimationOptions & AnimationExtraOptions) {
  return create(options);
}
