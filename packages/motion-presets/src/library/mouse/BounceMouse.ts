import { ScrubAnimationOptions, AnimationExtraOptions, BounceMouse, TrackMouse } from '../../types';
import { parseLengthOrCalc } from '../../utils';
import createTrack, { AXES } from './TrackMouse';

export const schema = {
  axis: { type: 'enum', values: AXES, default: 'both' },
  distance: { type: 'length', default: { value: 80, unit: 'px' } },
  inverted: { type: 'bool', default: false },
} as const;

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const namedEffect = options.namedEffect as BounceMouse;
  const distance = parseLengthOrCalc(namedEffect.distance, schema.distance.default);
  const { transitionEasing = 'elastic' } = options;
  return createTrack({
    ...options,
    transitionEasing,
    namedEffect: { ...options.namedEffect, distance } as TrackMouse,
  });
}

create.schema = schema;
