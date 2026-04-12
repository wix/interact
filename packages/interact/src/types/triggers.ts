import type { RangeOffset } from '@wix/motion';

export type { RangeOffset };

export type PointerMoveAxis = 'x' | 'y';

export type TriggerType =
  | 'hover'
  | 'click'
  | 'viewEnter'
  | 'pageVisible'
  | 'animationEnd'
  | 'viewProgress'
  | 'pointerMove'
  | 'activate'
  | 'interest';

export type EventTriggerKind = 'toggle' | 'enterLeave';
export type EventTriggerConfigToggle = readonly string[] | string[];
export type EventTriggerConfigEnterLeave = {
  enter?: readonly string[];
  leave?: readonly string[];
};

export type EventTriggerConfig = string | EventTriggerConfigToggle | EventTriggerConfigEnterLeave;

export type TimeAnimationTriggerType = 'once' | 'repeat' | 'alternate' | 'state';

export type TransitionMethod = 'add' | 'remove' | 'toggle' | 'clear';

export type StateParams = {
  method: TransitionMethod;
};

export type PointerTriggerParams = {
  type?: TimeAnimationTriggerType;
};

export type EventTriggerParams = (StateParams | PointerTriggerParams) & {
  eventConfig: EventTriggerConfig;
};

export type ViewEnterParams = {
  type?: TimeAnimationTriggerType;
  threshold?: number;
  inset?: string;
  useSafeViewEnter?: boolean;
};

export type PointerMoveParams = {
  hitArea?: 'root' | 'self';
  axis?: PointerMoveAxis;
};

export type AnimationEndParams = {
  effectId: string;
};

export type TriggerParams =
  | StateParams
  | PointerTriggerParams
  | ViewEnterParams
  | PointerMoveParams
  | AnimationEndParams;
