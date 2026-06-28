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
    selectedEffectContext: null,
    bottomPanel: 'none',
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
        config: { ...action.payload, effects: action.payload.effects ?? {} },
        selectedInteractionIndex: null,
        selectedEffectId: null,
        selectedEffectContext: null,
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
        selectedEffectContext: wasSelected ? null : state.selectedEffectContext,
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
      return {
        ...state,
        selectedInteractionIndex: action.payload,
        selectedEffectId: null,
        selectedEffectContext: null,
      };

    case 'ADD_EFFECT': {
      const { id, effect } = action.payload;
      return {
        ...state,
        config: {
          ...state.config,
          effects: { ...state.config.effects, [id]: effect },
        },
        selectedEffectId: id,
        selectedEffectContext: { source: 'interaction' },
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
      const wasSelected = state.selectedEffectId === action.payload;
      return {
        ...state,
        config: { ...state.config, effects: remainingEffects },
        selectedEffectId: wasSelected ? null : state.selectedEffectId,
        selectedEffectContext: wasSelected ? null : state.selectedEffectContext,
      };
    }

    case 'SELECT_EFFECT':
      return {
        ...state,
        selectedEffectId: action.payload.id,
        selectedEffectContext: action.payload.id
          ? (action.payload.context ?? { source: 'interaction' })
          : null,
      };

    case 'SET_BOTTOM_PANEL':
      return { ...state, bottomPanel: action.payload };

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
        selectedEffectContext: null,
      };

    case 'ADD_CONDITION': {
      const { id, condition } = action.payload;
      return {
        ...state,
        config: {
          ...state.config,
          conditions: { ...state.config.conditions, [id]: condition },
        },
      };
    }

    case 'UPDATE_CONDITION': {
      const { id, condition } = action.payload;
      return {
        ...state,
        config: {
          ...state.config,
          conditions: { ...state.config.conditions, [id]: condition },
        },
      };
    }

    case 'REMOVE_CONDITION': {
      const condId = action.payload;
      const { [condId]: _removed, ...remainingConditions } = state.config.conditions ?? {};
      const stripConditionRef = (arr: string[] | undefined) =>
        arr ? arr.filter((c) => c !== condId) : undefined;
      const interactions = state.config.interactions.map((interaction) => ({
        ...interaction,
        conditions: stripConditionRef(interaction.conditions),
        effects: interaction.effects?.map((eff) => ({
          ...eff,
          conditions: stripConditionRef((eff as { conditions?: string[] }).conditions),
        })),
        sequences: interaction.sequences?.map((seq) => ({
          ...seq,
          conditions: stripConditionRef((seq as { conditions?: string[] }).conditions),
        })),
      }));
      const effects = Object.fromEntries(
        Object.entries(state.config.effects).map(([eid, eff]) => [
          eid,
          { ...eff, conditions: stripConditionRef(eff.conditions) },
        ]),
      );
      return {
        ...state,
        config: {
          ...state.config,
          conditions: Object.keys(remainingConditions).length > 0 ? remainingConditions : undefined,
          interactions,
          effects,
        },
      };
    }

    case 'ADD_SEQUENCE': {
      const { id, sequence } = action.payload;
      return {
        ...state,
        config: {
          ...state.config,
          sequences: { ...state.config.sequences, [id]: sequence },
        },
      };
    }

    case 'UPDATE_SEQUENCE': {
      const { id, sequence } = action.payload;
      return {
        ...state,
        config: {
          ...state.config,
          sequences: { ...state.config.sequences, [id]: sequence },
        },
      };
    }

    case 'REMOVE_SEQUENCE': {
      const seqId = action.payload;
      const { [seqId]: _removedSeq, ...remainingSequences } = state.config.sequences ?? {};
      const interactionsUpdated = state.config.interactions.map((interaction) => ({
        ...interaction,
        sequences: interaction.sequences?.filter(
          (s) => !('sequenceId' in s && s.sequenceId === seqId),
        ),
      }));
      const ctxCleared =
        state.selectedEffectContext?.source === 'sequence' &&
        state.selectedEffectContext.sequenceId === seqId;
      return {
        ...state,
        config: {
          ...state.config,
          sequences: Object.keys(remainingSequences).length > 0 ? remainingSequences : undefined,
          interactions: interactionsUpdated,
        },
        selectedEffectId: ctxCleared ? null : state.selectedEffectId,
        selectedEffectContext: ctxCleared ? null : state.selectedEffectContext,
      };
    }

    default:
      return state;
  }
}
