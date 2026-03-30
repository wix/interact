import type { InteractConfig, Condition, SequenceConfig } from '@wix/interact';

export interface ScrollPreviewState {
  enabled: boolean;
  stickyTop?: number;
  stickyBottom?: number;
  stageHeight: number;
}

export type EffectContext =
  | { source: 'interaction' }
  | { source: 'sequence'; sequenceId: string; effectIndex: number };

export interface PlaygroundState {
  config: InteractConfig;
  activeComponentId: string;
  selectedInteractionIndex: number | null;
  selectedEffectId: string | null;
  selectedEffectContext: EffectContext | null;
  jsonPanelOpen: boolean;
  scrollPreview: ScrollPreviewState;
}

export type Action =
  | { type: 'SELECT_COMPONENT'; payload: string }
  | { type: 'SET_CONFIG'; payload: InteractConfig }
  | { type: 'ADD_INTERACTION' }
  | { type: 'REMOVE_INTERACTION'; payload: number }
  | { type: 'UPDATE_INTERACTION'; payload: { index: number; data: Partial<InteractConfig['interactions'][number]> } }
  | { type: 'SELECT_INTERACTION'; payload: number | null }
  | { type: 'ADD_EFFECT'; payload: { id: string; effect: InteractConfig['effects'][string] } }
  | { type: 'UPDATE_EFFECT'; payload: { id: string; effect: InteractConfig['effects'][string] } }
  | { type: 'REMOVE_EFFECT'; payload: string }
  | { type: 'SELECT_EFFECT'; payload: { id: string | null; context?: EffectContext } }
  | { type: 'TOGGLE_JSON_PANEL' }
  | { type: 'SET_SCROLL_PREVIEW'; payload: Partial<ScrollPreviewState> }
  | { type: 'RESET_CONFIG' }
  | { type: 'ADD_CONDITION'; payload: { id: string; condition: Condition } }
  | { type: 'UPDATE_CONDITION'; payload: { id: string; condition: Condition } }
  | { type: 'REMOVE_CONDITION'; payload: string }
  | { type: 'ADD_SEQUENCE'; payload: { id: string; sequence: SequenceConfig } }
  | { type: 'UPDATE_SEQUENCE'; payload: { id: string; sequence: SequenceConfig } }
  | { type: 'REMOVE_SEQUENCE'; payload: string };
