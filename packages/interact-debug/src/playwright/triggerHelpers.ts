import type { Page } from '@playwright/test';
import type { TriggerType } from '../types';
import {
  hoverElement,
  unhoverElement,
  clickElement,
  movePointerWithinElement,
} from './pointerHelpers';
import { scrollToKey, scrollToProgress, scrollBy } from './scrollHelpers';

/**
 * Fire a trigger action on a keyed element.
 * Dispatches the appropriate browser action for each trigger type.
 */
export async function fireTrigger(page: Page, trigger: TriggerType, key: string): Promise<void> {
  switch (trigger) {
    case 'hover':
    case 'interest':
      await hoverElement(page, key);
      break;

    case 'click':
    case 'activate':
      await clickElement(page, key);
      break;

    case 'viewEnter':
    case 'pageVisible':
      await scrollToKey(page, key);
      break;

    case 'viewProgress':
      await scrollToProgress(page, key, 0.5);
      break;

    case 'pointerMove':
      await movePointerWithinElement(page, key, 0.5, 0.5);
      break;

    case 'animationEnd':
      // No-op: animationEnd fires automatically when a previous animation finishes
      break;
  }
}

/**
 * Reverse/undo a trigger action (for alternate/state testing).
 */
export async function reverseTrigger(page: Page, trigger: TriggerType, key: string): Promise<void> {
  switch (trigger) {
    case 'hover':
    case 'interest':
      await unhoverElement(page);
      break;

    case 'click':
    case 'activate':
      await clickElement(page, key);
      break;

    case 'viewEnter':
    case 'pageVisible':
      await scrollBy(page, -500);
      break;

    case 'viewProgress':
      await scrollToProgress(page, key, 0);
      break;

    case 'pointerMove':
      await movePointerWithinElement(page, key, 0, 0);
      break;

    case 'animationEnd':
      break;
  }
}
