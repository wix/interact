import type { InteractConfig } from '@wix/interact';
import type { Action, ScrollPreviewState } from '../types';

export const selectComponent = (id: string): Action => ({
  type: 'SELECT_COMPONENT',
  payload: id,
});

export const setConfig = (config: InteractConfig): Action => ({
  type: 'SET_CONFIG',
  payload: config,
});

export const addInteraction = (): Action => ({
  type: 'ADD_INTERACTION',
});

export const removeInteraction = (index: number): Action => ({
  type: 'REMOVE_INTERACTION',
  payload: index,
});

export const updateInteraction = (index: number, data: Partial<InteractConfig['interactions'][number]>): Action => ({
  type: 'UPDATE_INTERACTION',
  payload: { index, data },
});

export const selectInteraction = (index: number | null): Action => ({
  type: 'SELECT_INTERACTION',
  payload: index,
});

export const addEffect = (id: string, effect: InteractConfig['effects'][string]): Action => ({
  type: 'ADD_EFFECT',
  payload: { id, effect },
});

export const updateEffect = (id: string, effect: InteractConfig['effects'][string]): Action => ({
  type: 'UPDATE_EFFECT',
  payload: { id, effect },
});

export const removeEffect = (id: string): Action => ({
  type: 'REMOVE_EFFECT',
  payload: id,
});

export const selectEffect = (id: string | null): Action => ({
  type: 'SELECT_EFFECT',
  payload: id,
});

export const toggleJsonPanel = (): Action => ({
  type: 'TOGGLE_JSON_PANEL',
});

export const setScrollPreview = (preview: Partial<ScrollPreviewState>): Action => ({
  type: 'SET_SCROLL_PREVIEW',
  payload: preview,
});

export const resetConfig = (): Action => ({
  type: 'RESET_CONFIG',
});
