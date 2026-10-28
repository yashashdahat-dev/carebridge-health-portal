/**
 * CareBridge — Global Context Provider
 * File: src/context/CareBridgeContext.jsx
 * 
 * Provides:
 * - Reducer-driven state management for patients (patientReducer)
 * - Reducer-driven state management for prescriptions (prescriptionReducer)
 * - Accessibility preferences via useLocalStorage (theme, scale, language, wide spacing)
 * - Live announcements (aria-live) and Web Speech API orchestration
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { patientReducer, prescriptionReducer, PATIENT_ACTIONS, RX_ACTIONS } from './reducers.js';
import { INITIAL_PATIENT_QUEUE, INITIAL_PRESCRIPTIONS } from '../data/initialData.js';
import { speakClinicalText, stopSpeech as cancelSpeech } from '../utils/speech.js';

const CareBridgeContext = createContext(null);

export function CareBridgeProvider({ children }) {
  // 1. Accessibility Preferences persisted with useLocalStorage custom hook
  const [theme, setTheme] = useLocalStorage('carebridge_theme', 'light');
  const [fontScale, setFontScale] = useLocalStorage('carebridge_font_scale', 'md');
  const [isWideSpacing, setIsWideSpacing] = useLocalStorage('carebridge_wide_spacing', false);
  const [language, setLanguage] = useLocalStorage('carebridge_language', 'en');

  // 2. Persistent storage backers for patients & prescriptions
  const [storedPatients, setStoredPatients] = useLocalStorage('carebridge_triage_records', INITIAL_PATIENT_QUEUE);
  const [storedPrescriptions, setStoredPrescriptions] = useLocalStorage('carebridge_prescriptions', INITIAL_PRESCRIPTIONS);

  // 3. Reducer-based State Management
  const [patientQueue, dispatchPatients] = useReducer(patientReducer, storedPatients);
  const [prescriptions, dispatchPrescriptions] = useReducer(prescriptionReducer, storedPrescriptions);

  // Synchronize reducers with localStorage on changes
  useEffect(() => {
    setStoredPatients(patientQueue);
  }, [patientQueue, setStoredPatients]);

  useEffect(() => {
    setStoredPrescriptions(prescriptions);
  }, [prescriptions, setStoredPrescriptions]);

  // Synchronize root HTML attributes for dynamic theme and text scaling
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-font-size', fontScale);
    if (isWideSpacing) {
      root.setAttribute('data-spacing', 'wide');
    } else {
      root.removeAttribute('data-spacing');
    }
  }, [theme, fontScale, isWideSpacing]);

  // 4. Live Announcements State
  const [announcement, setAnnouncement] = useState({
    message: 'System Ready. Clinical Portal operational.',
    type: 'success',
    id: Date.now()
  });

  const announce = useCallback((message, type = 'info') => {
    setAnnouncement({
      message,
      type,
      id: Date.now()
    });
  }, []);

  // 5. Web Speech API Playback State
  const [activeSpeechId, setActiveSpeechId] = useState(null);
  const [isGlobalSpeaking, setIsGlobalSpeaking] = useState(false);

  const speak = useCallback((text, lang = language, itemId = null) => {
    setActiveSpeechId(itemId);
    setIsGlobalSpeaking(true);

    speakClinicalText({
      text,
      lang,
      onStart: () => {
        announce(`Reading aloud: ${text.substring(0, 50)}...`, 'info');
      },
      onEnd: () => {
        setActiveSpeechId(null);
        setIsGlobalSpeaking(false);
      },
      onError: () => {
        setActiveSpeechId(null);
        setIsGlobalSpeaking(false);
        announce('Audio synthesis interrupted.', 'warning');
      }
    });
  }, [language, announce]);

  const stopAllSpeech = useCallback(() => {
    cancelSpeech(() => {
      setActiveSpeechId(null);
      setIsGlobalSpeaking(false);
      announce('Audio playback stopped.', 'info');
    });
  }, [announce]);

  // 6. Action Dispatch Helpers
  const addPatient = useCallback((patient) => {
    dispatchPatients({ type: PATIENT_ACTIONS.ADD_PATIENT, payload: patient });
  }, []);

  const completePatient = useCallback((patientId) => {
    const target = patientQueue.find((p) => p.id === patientId);
    dispatchPatients({ type: PATIENT_ACTIONS.COMPLETE_PATIENT, payload: patientId });
    if (target) {
      announce(`Consultation complete for ${target.name}. Patient discharged from queue.`, 'success');
    }
  }, [patientQueue, announce]);

  const addPrescription = useCallback((prescription) => {
    dispatchPrescriptions({ type: RX_ACTIONS.ADD_PRESCRIPTION, payload: prescription });
  }, []);

  const toggleMedicationTaken = useCallback((medId) => {
    dispatchPrescriptions({ type: RX_ACTIONS.TOGGLE_TAKEN, payload: medId });
    const target = prescriptions.find((m) => m.id === medId);
    if (target) {
      const nextTaken = !target.taken;
      announce(
        `Medication "${target.name}" marked as ${nextTaken ? 'Taken ✓' : 'Pending Dose ○'}.`,
        nextTaken ? 'success' : 'info'
      );
    }
  }, [prescriptions, announce]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Unified dispatch handler for standard action types (PDF Page 6-7)
  const dispatch = useCallback((action) => {
    if (!action || !action.type) return;
    switch (action.type) {
      case 'SET_PATIENTS':
      case PATIENT_ACTIONS.SET_PATIENTS:
        dispatchPatients({ type: PATIENT_ACTIONS.SET_PATIENTS, payload: action.payload });
        break;
      case 'ADD_PATIENT':
      case PATIENT_ACTIONS.ADD_PATIENT:
        dispatchPatients({ type: PATIENT_ACTIONS.ADD_PATIENT, payload: action.payload });
        break;
      case 'REMOVE_PATIENT':
      case 'COMPLETE_PATIENT':
      case PATIENT_ACTIONS.COMPLETE_PATIENT:
        dispatchPatients({ type: PATIENT_ACTIONS.COMPLETE_PATIENT, payload: action.payload });
        break;
      case 'SET_PRESCRIPTIONS':
      case RX_ACTIONS.SET_PRESCRIPTIONS:
        dispatchPrescriptions({ type: RX_ACTIONS.SET_PRESCRIPTIONS, payload: action.payload });
        break;
      case 'ADD_PRESCRIPTION':
      case RX_ACTIONS.ADD_PRESCRIPTION:
        dispatchPrescriptions({ type: RX_ACTIONS.ADD_PRESCRIPTION, payload: action.payload });
        break;
      case 'TOGGLE_MEDICATION':
      case RX_ACTIONS.TOGGLE_TAKEN:
        dispatchPrescriptions({ type: RX_ACTIONS.TOGGLE_TAKEN, payload: action.payload });
        break;
      case 'SET_ERROR':
        setError(action.payload);
        if (action.payload) {
          announce(`Error: ${action.payload}`, 'warning');
        }
        break;
      case 'SET_STATUS':
        if (action.payload) {
          announce(action.payload, 'info');
        }
        break;
      case 'LOAD_PREFERENCES':
        if (action.payload?.theme) setTheme(action.payload.theme);
        if (action.payload?.language) setLanguage(action.payload.language);
        if (action.payload?.fontScale) setFontScale(action.payload.fontScale);
        break;
      default:
        console.warn(`[CareBridgeContext] Unhandled dispatch action: ${action.type}`);
    }
  }, [announce, setTheme, setLanguage, setFontScale]);

  const value = {
    // Accessibility Preferences
    theme,
    setTheme,
    fontScale,
    setFontScale,
    isWideSpacing,
    setIsWideSpacing,
    language,
    setLanguage,

    // Patient State & Actions (Reducer)
    patientQueue,
    patients: patientQueue,
    addPatient,
    completePatient,

    // Prescription State & Actions (Reducer)
    prescriptions,
    addPrescription,
    toggleMedicationTaken,

    // Unified dispatch & status state (PDF Section 3.3)
    dispatch,
    error,
    setError,
    loading,
    setLoading,

    // State object container
    state: {
      patients: patientQueue,
      prescriptions,
      theme,
      language,
      fontScale,
      isWideSpacing,
      error,
      loading
    },

    // Speech & Announcements
    announcement,
    announce,
    activeSpeechId,
    isGlobalSpeaking,
    speak,
    stopAllSpeech
  };

  return (
    <CareBridgeContext.Provider value={value}>
      {children}
    </CareBridgeContext.Provider>
  );
}

export function useCareBridge() {
  const context = useContext(CareBridgeContext);
  if (!context) {
    throw new Error('useCareBridge must be used within a CareBridgeProvider');
  }
  return context;
}
