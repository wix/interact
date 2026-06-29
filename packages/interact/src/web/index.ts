import { defineInteractElement } from './defineInteractElement';
import { Interact } from '../core/Interact';

Interact.defineInteractElement = defineInteractElement;

export { add, remove } from '../dom/api';
export { generate } from '../core/css';
export {
  TEXT_SPLIT_STATE_ATTR,
  TEXT_SPLIT_PENDING,
  TEXT_SPLIT_DONE,
  markSplitTextHidden,
} from '../core/splitText';
export { Interact };

export * from '../types/external';
