import { Interact } from './Interact';
import TRIGGER_TO_HANDLER_MODULE_MAP from '../handlers';
import type { IInteractionController } from '../types';

/**
 * Removes all events and effects from an element based on config
 */
export function remove(controller: IInteractionController, removeFromCache: boolean = false): void {
  const key = controller.key as string;
  const instance = Interact.getInstance(key);

  if (!instance) {
    return;
  }

  const selectors = [...(instance.get(key)?.selectors.values() || [])].filter(Boolean).join(',');
  let elements;

  if (selectors) {
    elements = [...controller.element.querySelectorAll(selectors)];

    if (!controller.useFirstChild) {
      elements.push(controller.element);
    }
  } else {
    elements = [controller.element];
  }

  removeListItems(elements as HTMLElement[]);

  // React can't seem to recover in StrictMode since it doesn't invoke ref callback 2nd time
  instance.deleteController(key, removeFromCache);
}

export function removeListItems(elements: HTMLElement[]) {
  const modules = Object.values(TRIGGER_TO_HANDLER_MODULE_MAP);

  for (const element of elements) {
    for (const module of modules) {
      module.remove(element);
    }
  }

  Interact.removeFromSequences(elements);
}
