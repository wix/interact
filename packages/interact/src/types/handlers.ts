import type { AnimationGroup } from '@wix/motion';
import type {
  TriggerType,
  StateParams,
  PointerTriggerParams,
  ViewEnterParams,
  PointerMoveParams,
  AnimationEndParams,
} from './triggers';
import type { Effect } from './effects';
import type { IInteractionController } from './controller';

export type InteractionParamsTypes = {
  hover: StateParams | PointerTriggerParams;
  click: StateParams | PointerTriggerParams;
  viewEnter: ViewEnterParams;
  pageVisible: ViewEnterParams;
  animationEnd: AnimationEndParams;
  viewProgress: ViewEnterParams;
  pointerMove: PointerMoveParams;
  activate: StateParams | PointerTriggerParams;
  interest: StateParams | PointerTriggerParams;
};

export type InteractOptions = {
  reducedMotion?: boolean;
  targetController?: IInteractionController;
  selectorCondition?: string;
  allowA11yTriggers?: boolean;
  animation?: AnimationGroup;
};

export type InteractionHandlerModule<T extends TriggerType> = {
  registerOptionsGetter?: (getter: () => any) => void;
  add: (
    source: HTMLElement,
    target: HTMLElement,
    effect: Effect,
    options: InteractionParamsTypes[T],
    interactOptions: InteractOptions,
  ) => void;
  remove: (element: HTMLElement) => void;
};

export type ViewEnterHandlerModule = InteractionHandlerModule<'viewEnter'> & {
  setOptions: (options: Partial<ViewEnterParams>) => void;
};

export type TriggerHandlerMap<T extends TriggerType> = {
  [K in T]: InteractionHandlerModule<K>;
};

export type HandlerObject = {
  source: HTMLElement;
  target: HTMLElement;
  cleanup: () => void;
  handler?: (isIntersecting?: boolean) => void;
};

export type HandlerObjectMap = WeakMap<HTMLElement, Set<HandlerObject>>;
