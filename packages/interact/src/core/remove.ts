import { deleteMountedController, getMountedController, Interact } from './Interact';
import TRIGGER_TO_HANDLER_MODULE_MAP from '../handlers';
import type { IInteractionController } from '../types';

/**
 * Removes all events and effects from an element based on config
 */
export function remove(controller: IInteractionController, removeFromCache: boolean = false): void {
  const { key } = controller;
  if (!key || Interact.getController(key) !== controller) {
    return;
  }
  const mounted = getMountedController(key);
  const isCurrent = () =>
    Interact.getController(key) === controller && getMountedController(key) === mounted;

  const instances = Interact.getInstancesForKey(key);
  const [instance, ...otherInstances] = instances;
  if (!instance) {
    deleteMountedController(key, mounted, removeFromCache);
    if (removeFromCache) {
      Interact.deleteController(key);
    }
    return;
  }

  const selectors = instances
    .flatMap((owner) => [...(owner.get(key)?.selectors ?? [])])
    .filter(Boolean)
    .join(',');
  let elements;

  if (selectors) {
    elements = [...controller.element.querySelectorAll(selectors)];

    if (!controller.useFirstChild) {
      elements.push(controller.element);
    }
  } else {
    elements = [controller.element];
  }

  removeElements(elements as HTMLElement[]);
  for (const owner of otherInstances) {
    if (!isCurrent()) {
      return;
    }
    owner.clearEffectPairsForKey(key);
    owner.clearMediaQueryListenersForKey(key);
  }

  if (!isCurrent()) {
    return;
  }
  deleteMountedController(key, mounted, removeFromCache);
  // React can't seem to recover in StrictMode since it doesn't invoke ref callback 2nd time
  instance.deleteController(key, removeFromCache);
}

export function removeListItems(roots: HTMLElement[], list?: { key: string; container: Element }) {
  if (list && roots.length > 0) {
    const removed = new Set<Element>(roots);
    for (const instance of Interact.getInstancesForKey(list.key)) {
      instance.removeListItemBindings(list.key, list.container, removed);
    }
  }
  removeElements(roots, list !== undefined);
}

function removeElements(elements: HTMLElement[], untrackedOnly = false) {
  const modules = Object.values(TRIGGER_TO_HANDLER_MODULE_MAP);

  for (const element of elements) {
    for (const module of modules) {
      if (untrackedOnly) {
        module.remove(element, true);
      } else {
        module.remove(element);
      }
    }
  }

  Interact.removeFromSequences(elements);
}
