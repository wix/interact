import {
  ScrubAnimationOptions,
  AnimationExtraOptions,
  SwivelMouse,
  MousePivotAxis,
  Progress,
} from '../../types';
import { getMouseTransitionEasing, mapRange, parseDirection } from '../../utils';
import { CustomMouse } from './CustomMouse';

const PIVOTS = ['top', 'bottom', 'right', 'left', 'center-horizontal', 'center-vertical'] as const;

const DEFAULTS: Required<SwivelMouse> = {
  type: 'SwivelMouse',
  angle: 5,
  inverted: false,
  perspective: 800,
  pivot: 'center-horizontal',
};

export const schema = {
  angle: { type: 'number', min: 0, default: DEFAULTS.angle },
  inverted: { type: 'bool', default: DEFAULTS.inverted },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  pivot: { type: 'enum', values: PIVOTS, default: DEFAULTS.pivot },
};

const transformOrigins: Record<MousePivotAxis, [number, number]> = {
  top: [0, -50],
  bottom: [0, 50],
  right: [50, 0],
  left: [-50, 0],
  'center-horizontal': [0, 0],
  'center-vertical': [0, 0],
};

class SwivelMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    let rotateAxis = 'rotateX';
    let progress = progressY;
    let invertVertical = -1;

    const { pivot, angle, invert, perspective } = this.options;
    if (pivot === 'center-horizontal' || pivot === 'right' || pivot === 'left') {
      rotateAxis = 'rotateY';
      progress = progressX;
      invertVertical = 1;
    }

    const rotate = mapRange(0, 1, -angle, angle, progress) * invertVertical * invert;

    const [translateX, translateY] = transformOrigins[pivot as MousePivotAxis];
    const transform = `perspective(${perspective}px) translateX(${translateX}%) translateY(${translateY}%) ${rotateAxis}(${rotate}deg) translateX(${-translateX}%) translateY(${-translateY}%) rotate(var(--motion-rotate, 0deg))`;

    this.target.style.transform = transform;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as SwivelMouse;
  const {
    inverted = DEFAULTS.inverted,
    angle = DEFAULTS.angle,
    perspective = DEFAULTS.perspective,
  } = namedEffect;
  const pivot = parseDirection(namedEffect.pivot, PIVOTS, DEFAULTS.pivot) as MousePivotAxis;
  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    invert,
    angle,
    perspective,
    pivot,
  };

  return (target: HTMLElement) => new SwivelMouseAnimation(target, animationOptions);
}
