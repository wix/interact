import { getAnimation } from '@wix/motion';
import type { AnimationGroup } from '@wix/motion';
import type {
  TimeEffect,
  TransitionEffect,
  StateParams,
  PointerTriggerParams,
  EffectBase,
  IInteractionController,
  EventTriggerConfigEnterLeave,
} from '../types';
import { effectToAnimationOptions } from './utilities';
import fastdom from 'fastdom';

export function createTimeEffectHandler(
  element: HTMLElement,
  effect: TimeEffect & EffectBase,
  options: PointerTriggerParams,
  reducedMotion: boolean = false,
  selectorCondition?: string,
  enterLeave?: EventTriggerConfigEnterLeave,
  preCreatedAnimation?: AnimationGroup,
): ((event: Event) => void) | null {
  const animation =
    preCreatedAnimation ||
    (getAnimation(
      element,
      effectToAnimationOptions(effect),
      undefined,
      reducedMotion,
    ) as AnimationGroup | null);

  if (!animation) {
    return null;
  }

  let initialPlay = true;
  const type = options.type || 'alternate';

  return (event: Event) => {
    if (selectorCondition && !element.matches(selectorCondition)) return;

    const isToggle = !enterLeave;
    const isEnter = enterLeave?.enter?.includes(event.type);
    const isLeave = enterLeave?.leave?.includes(event.type);

    if (isEnter || isToggle) {
      if (type === 'alternate' || type === 'state') {
        if (initialPlay) {
          initialPlay = false;
          animation.play();
        } else if (type === 'alternate') {
          animation.reverse();
        } else if (type === 'state') {
          if (animation.playState === 'running') {
            animation.pause();
          } else if (animation.playState !== 'finished') {
            animation.play();
          }
        }
      } else {
        animation.progress(0);
        delete element.dataset.interactEnter;
        if (animation.isCSS) {
          const setEnterDone = () => {
            fastdom.mutate(() => {
              element.dataset.interactEnter = 'done';
            });
          };

          animation.onFinish(setEnterDone);
          animation.onAbort(setEnterDone);
        }
        animation.play();
      }
      return;
    }

    if (isLeave) {
      if (type === 'alternate') {
        animation.reverse();
      } else if (type === 'repeat') {
        animation.cancel();
        fastdom.mutate(() => {
          delete element.dataset.interactEnter;
        });
      } else if (type === 'state' && animation.playState === 'running') {
        animation.pause();
      }
    }
  };
}

export function createTransitionHandler(
  element: HTMLElement,
  targetController: IInteractionController,
  {
    effectId,
    listContainer,
    listItemSelector,
  }: TransitionEffect & EffectBase & { effectId: string },
  options: StateParams,
  selectorCondition?: string,
  enterLeave?: EventTriggerConfigEnterLeave,
): (event: Event) => void {
  const shouldSetStateOnElement = !!listContainer;
  const method = options.method || 'toggle';
  const isToggle = method === 'toggle';

  return (event: Event) => {
    if (selectorCondition && !element.matches(selectorCondition)) return;

    const item: HTMLElement | null | undefined = shouldSetStateOnElement
      ? (element.closest(
          `${listContainer} > ${listItemSelector || ''}:has(:scope)`,
        ) as HTMLElement | null)
      : undefined; // undefined when no listContainer so controller delegates to element.toggleEffect
    const isToggleMode = !enterLeave;
    const isEnter = enterLeave?.enter?.includes(event.type);
    const isLeave = enterLeave?.leave?.includes(event.type);

    if (isToggleMode) {
      targetController.toggleEffect(effectId, method, item);
    } else {
      if (isEnter) {
        targetController.toggleEffect(effectId, isToggle ? 'add' : method, item);
      }
      if (isLeave && isToggle) {
        targetController.toggleEffect(effectId, 'remove', item);
      }
    }
  };
}
