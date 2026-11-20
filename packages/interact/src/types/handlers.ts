import type { AnimationGroup } from '@wix/motion';
import type {
  TriggerType,
  ViewEnterParams,
  PointerMoveParams,
  AnimationEndParams,
} from './triggers';
import type { Effect, AnimationOptions } from './effects';
import type { IInteractionController } from './controller';

export type InteractionParamsTypes = {
  hover: Record<string, never>;
  click: Record<string, never>;
  viewEnter: ViewEnterParams;
  animationEnd: AnimationEndParams;
  viewProgress: ViewEnterParams;
  pointerMove: PointerMoveParams;
  activate: Record<string, never>;
  interest: Record<string, never>;
};

export type InteractOptions = {
  targetController?: IInteractionController;
  selectorCondition?: string;
  allowA11yTriggers?: boolean;
  animation?: AnimationGroup;
  sourceAnimationOptions?: AnimationOptions<'time'>;
};

export type InteractionHandlerModule<T extends TriggerType> = {
  registerOptionsGetter?: (getter: () => any) => void;
  add: (
    source: HTMLElement,
    target: HTMLElement,
    effect: Effect,
    options: InteractionParamsTypes[T],
    interactOptions: InteractOptions,
  ) => void | HandlerDisposer;
  remove: (element: HTMLElement, untrackedOnly?: boolean) => void;
};

export type ViewEnterHandlerModule = InteractionHandlerModule<'viewEnter'> & {
  setOptions: (options: Partial<ViewEnterParams>) => void;
};

export type TriggerHandlerMap<T extends TriggerType> = {
  [K in T]: InteractionHandlerModule<K>;
};

export type HandlerDisposer = ((finished?: boolean) => void) & {
  onDispose?: () => void;
};

export type HandlerObject = {
  source: HTMLElement;
  target: HTMLElement;
  cleanup: HandlerDisposer;
  handler?: (isIntersecting?: boolean, isFullExit?: boolean) => void;
};

export type HandlerObjectMap<T extends HandlerObject = HandlerObject> = WeakMap<
  HTMLElement,
  Set<T>
>;

export type TimeEffectHandler = {
  handler: (event: Event) => void;
  cleanup: () => void;
};
