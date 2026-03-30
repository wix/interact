import type { PlaygroundState, Action } from '../types';

export function createInitialState(componentId = 'card'): PlaygroundState {
  return {
    config: {
      effects: {},
      interactions: [],
    },
    activeComponentId: componentId,
    selectedInteractionIndex: null,
    selectedEffectId: null,
    jsonPanelOpen: false,
    scrollPreview: {
      enabled: false,
      stageHeight: 3,
    },
  };
}

export function reduce(state: PlaygroundState, action: Action): PlaygroundState {
  switch (action.type) {
    case 'SELECT_COMPONENT':
      return {
        ...createInitialState(action.payload),
      };

    case 'SET_CONFIG':
      return {
        ...state,
        config: action.payload,
        selectedInteractionIndex: null,
        selectedEffectId: null,
      };

    case 'ADD_INTERACTION': {
      const newInteraction = {
        key: '',
        trigger: 'hover' as const,
        effects: [],
      };
      return {
        ...state,
        config: {
          ...state.config,
          interactions: [...state.config.interactions, newInteraction],
        },
        selectedInteractionIndex: state.config.interactions.length,
      };
    }

    case 'REMOVE_INTERACTION': {
      const interactions = state.config.interactions.filter((_, i) => i !== action.payload);
      const wasSelected = state.selectedInteractionIndex === action.payload;
      return {
        ...state,
        config: { ...state.config, interactions },
        selectedInteractionIndex: wasSelected ? null : state.selectedInteractionIndex,
        selectedEffectId: wasSelected ? null : state.selectedEffectId,
      };
    }

    case 'UPDATE_INTERACTION': {
      const { index, data } = action.payload;
      const interactions = state.config.interactions.map((interaction, i) =>
        i === index ? { ...interaction, ...data } : interaction,
      );
      return {
        ...state,
        config: { ...state.config, interactions },
      };
    }

    case 'SELECT_INTERACTION':
      return { ...state, selectedInteractionIndex: action.payload, selectedEffectId: null };

    case 'ADD_EFFECT': {
      const { id, effect } = action.payload;
      return {
        ...state,
        config: {
          ...state.config,
          effects: { ...state.config.effects, [id]: effect },
        },
        selectedEffectId: id,
      };
    }

    case 'UPDATE_EFFECT': {
      const { id, effect } = action.payload;
      return {
        ...state,
        config: {
          ...state.config,
          effects: { ...state.config.effects, [id]: effect },
        },
      };
    }

    case 'REMOVE_EFFECT': {
      const { [action.payload]: _removed, ...remainingEffects } = state.config.effects;
      return {
        ...state,
        config: { ...state.config, effects: remainingEffects },
        selectedEffectId: state.selectedEffectId === action.payload ? null : state.selectedEffectId,
      };
    }

    case 'SELECT_EFFECT':
      return { ...state, selectedEffectId: action.payload };

    case 'TOGGLE_JSON_PANEL':
      return { ...state, jsonPanelOpen: !state.jsonPanelOpen };

    case 'SET_SCROLL_PREVIEW':
      return {
        ...state,
        scrollPreview: { ...state.scrollPreview, ...action.payload },
      };

    case 'RESET_CONFIG':
      return {
        ...state,
        config: { effects: {}, interactions: [] },
        selectedInteractionIndex: null,
        selectedEffectId: null,
      };

    default:
      return state;
  }
}
