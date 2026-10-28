/**
 * CareBridge — State Management Reducers
 * File: src/context/reducers.js
 * 
 * Predictable state management using useReducer for complex clinical transitions.
 */

export const PATIENT_ACTIONS = {
  ADD_PATIENT: 'PATIENT/ADD',
  COMPLETE_PATIENT: 'PATIENT/COMPLETE',
  SET_QUEUE: 'PATIENT/SET_QUEUE',
  CLEAR_QUEUE: 'PATIENT/CLEAR_QUEUE'
};

export const RX_ACTIONS = {
  ADD_PRESCRIPTION: 'RX/ADD',
  TOGGLE_TAKEN: 'RX/TOGGLE_TAKEN',
  SET_PRESCRIPTIONS: 'RX/SET_PRESCRIPTIONS'
};

/**
 * Patient Queue Reducer: Handles patient admissions and discharges predictably
 */
export function patientReducer(state, action) {
  switch (action.type) {
    case PATIENT_ACTIONS.ADD_PATIENT: {
      if (!action.payload || !action.payload.id) return state;
      // Immutable prepend
      return [action.payload, ...state];
    }

    case PATIENT_ACTIONS.COMPLETE_PATIENT: {
      return state.filter((patient) => patient.id !== action.payload);
    }

    case PATIENT_ACTIONS.SET_QUEUE: {
      return Array.isArray(action.payload) ? action.payload : state;
    }

    case PATIENT_ACTIONS.CLEAR_QUEUE: {
      return [];
    }

    default:
      return state;
  }
}

/**
 * Prescription Reducer: Handles medication schedules and adherence toggling
 */
export function prescriptionReducer(state, action) {
  switch (action.type) {
    case RX_ACTIONS.ADD_PRESCRIPTION: {
      if (!action.payload || !action.payload.id) return state;
      return [...state, action.payload];
    }

    case RX_ACTIONS.TOGGLE_TAKEN: {
      return state.map((med) => {
        if (med.id === action.payload) {
          return { ...med, taken: !med.taken };
        }
        return med;
      });
    }

    case RX_ACTIONS.SET_PRESCRIPTIONS: {
      return Array.isArray(action.payload) ? action.payload : state;
    }

    default:
      return state;
  }
}

