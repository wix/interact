import type { PlaygroundState, Action } from '../types';
import { createInitialState, reduce } from './reducer';

export class PlaygroundStore extends EventTarget {
  private state: PlaygroundState;

  constructor() {
    super();
    this.state = createInitialState();
  }

  getState(): Readonly<PlaygroundState> {
    return this.state;
  }

  dispatch(action: Action): void {
    const prev = this.state;
    this.state = reduce(this.state, action);
    if (this.state !== prev) {
      this.dispatchEvent(new CustomEvent('state-change', { detail: { action } }));
    }
  }
}

export const store = new PlaygroundStore();
