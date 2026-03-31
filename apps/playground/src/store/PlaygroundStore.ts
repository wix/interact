import type { PlaygroundState, Action } from '../types';
import { createInitialState, reduce } from './reducer';

const MAX_UNDO = 50;

const UNDOABLE_ACTIONS = new Set([
  'SELECT_COMPONENT',
  'SET_CONFIG',
  'ADD_INTERACTION',
  'REMOVE_INTERACTION',
  'UPDATE_INTERACTION',
  'ADD_EFFECT',
  'UPDATE_EFFECT',
  'REMOVE_EFFECT',
  'ADD_CONDITION',
  'UPDATE_CONDITION',
  'REMOVE_CONDITION',
  'ADD_SEQUENCE',
  'UPDATE_SEQUENCE',
  'REMOVE_SEQUENCE',
  'RESET_CONFIG',
]);

export class PlaygroundStore extends EventTarget {
  private state: PlaygroundState;
  private _undoStack: PlaygroundState[] = [];

  constructor() {
    super();
    this.state = createInitialState();
  }

  getState(): Readonly<PlaygroundState> {
    return this.state;
  }

  dispatch(action: Action): void {
    if (action.type === 'UNDO') {
      const prev = this._undoStack.pop();
      if (!prev) return;
      this.state = prev;
      this.dispatchEvent(new CustomEvent('state-change', { detail: { action } }));
      return;
    }

    const prev = this.state;

    if (UNDOABLE_ACTIONS.has(action.type)) {
      this._undoStack.push(prev);
      if (this._undoStack.length > MAX_UNDO) {
        this._undoStack.shift();
      }
    }

    this.state = reduce(this.state, action);
    if (this.state !== prev) {
      this.dispatchEvent(new CustomEvent('state-change', { detail: { action } }));
    }
  }

  get canUndo(): boolean {
    return this._undoStack.length > 0;
  }
}

export const store = new PlaygroundStore();
