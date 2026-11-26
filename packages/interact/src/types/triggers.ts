import type { LengthPercentage, RangeOffset } from '@wix/motion';

export type { RangeOffset };

export type PointerMoveAxis = 'x' | 'y';

export type TriggerType =
  | 'hover'
  | 'click'
  | 'viewEnter'
  | 'animationEnd'
  | 'viewProgress'
  | 'pointerMove'
  | 'activate'
  | 'interest'
  | 'scrollState';

export type EventTriggerKind = 'toggle' | 'enterLeave';
export type EventTriggerConfigToggle = readonly string[] | string[];
export type EventTriggerConfigEnterLeave = {
  enter?: readonly string[];
  leave?: readonly string[];
};

export type EventTriggerConfig = string | EventTriggerConfigToggle | EventTriggerConfigEnterLeave;

export type EventTriggerParams = {
  eventConfig: EventTriggerConfig;
};

export type ViewEnterParams = {
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

export type ScrollDirection = 'end' | 'start';

export type ScrollStateParams = {
  offset?: number | LengthPercentage;
  direction?: ScrollDirection;
  axis?: 'y' | 'x';
  scroller?: 'root' | 'self' | 'nearest';
};

export type TriggerParams =
  | ViewEnterParams
  | PointerMoveParams
  | AnimationEndParams
  | ScrollStateParams;
