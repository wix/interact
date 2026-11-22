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
  ) => void;
  remove: (element: HTMLElement) => void;
};

/**
 * Records the trigger's events on `source` while an interaction on it is held back by its plugins,
 * so the trigger attached later can replay them.
 */
export type TriggerLatch<T extends TriggerType> = (
  source: HTMLElement,
  options?: InteractionParamsTypes[T],
) => void;

export type ViewEnterHandlerModule = InteractionHandlerModule<'viewEnter'> & {
  setOptions: (options: Partial<ViewEnterParams>) => void;
  /** Records an entry of `source` while its trigger is held back, replayed by a later `once` add. */
  latch: TriggerLatch<'viewEnter'>;
};

export type AnimationEndHandlerModule = InteractionHandlerModule<'animationEnd'> & {
  /** Records the `animationend` events of `source` while its trigger is held back, replayed by a later add. */
  latch: TriggerLatch<'animationEnd'>;
};

export type TriggerHandlerMap<T extends TriggerType> = {
  [K in T]: InteractionHandlerModule<K>;
};

export type HandlerObject = {
  source: HTMLElement;
  target: HTMLElement;
  cleanup: () => void;
  handler?: (isIntersecting?: boolean, isFullExit?: boolean) => void;
};

export type HandlerObjectMap = WeakMap<HTMLElement, Set<HandlerObject>>;

export type TimeEffectHandler = {
  handler: (event: Event) => void;
  cleanup: () => void;
};
