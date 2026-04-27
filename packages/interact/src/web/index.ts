import { defineInteractElement } from './defineInteractElement';
import { Interact } from '../core/Interact';

Interact.defineInteractElement = defineInteractElement;

export { add, remove } from '../dom/api';
export { generate } from '../core/css';
export { Interact };

export * from '../types/external';
