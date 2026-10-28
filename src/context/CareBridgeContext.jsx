/**
 * CareBridge — Application-Wide Context Provider
 * File: src/context/CareBridgeContext.jsx
 * 
 * Provides accessibility settings (theme, fontScale, wideSpacing, language),
 * screen reader live region announcements, and Web Speech API orchestration.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { speakClinicalText, stopSpeech as cancelSpeech } from '../utils/speech.js';

const CareBridgeContext = createContext(null);

export function CareBridgeProvider({ children }) {
  // Accessibility Preferences persisted in localStorage with useLocalStorage hook
  const [theme, setTheme] = useLocalStorage('carebridge_theme', 'light');
  const [fontScale, setFontScale] = useLocalStorage('carebridge_font_scale', 'md');
  const [isWideSpacing, setIsWideSpacing] = useLocalStorage('carebridge_wide_spacing', false);
  const [language, setLanguage] = useLocalStorage('carebridge_language', 'en');

  // Status and Announcement Banner State
  const [announcement, setAnnouncement] = useState({
    message: 'System Ready. Clinical Portal operational.',
    type: 'success',
    id: Date.now()
  });

  // Audio Speech Playback Tracking State
  const [activeSpeechId, setActiveSpeechId] = useState(null);
  const [isGlobalSpeaking, setIsGlobalSpeaking] = useState(false);

  // Sync HTML root attributes with preferences
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

  // Announce messages to screen reader and status banner
  const announce = useCallback((message, type = 'info') => {
    setAnnouncement({
      message,
      type,
      id: Date.now()
    });
  }, []);

  // Web Speech API speak function
  const speak = useCallback((text, lang = language, itemId = null) => {
    setActiveSpeechId(itemId);
    setIsGlobalSpeaking(true);

    speakClinicalText({
      text,
      lang,
      onStart: () => {
        announce(`Reading aloud: ${text.substring(0, 60)}...`, 'info');
      },
      onEnd: () => {
        setActiveSpeechId(null);
        setIsGlobalSpeaking(false);
      },
      onError: () => {
        setActiveSpeechId(null);
        setIsGlobalSpeaking(false);
        announce('Audio playback was interrupted or unavailable.', 'warning');
      }
    });
  }, [language, announce]);

  // Stop any active speech
  const stopAllSpeech = useCallback(() => {
    cancelSpeech(() => {
      setActiveSpeechId(null);
      setIsGlobalSpeaking(false);
      announce('Audio playback stopped.', 'info');
    });
  }, [announce]);

  const value = {
    theme,
    setTheme,
    fontScale,
    setFontScale,
    isWideSpacing,
    setIsWideSpacing,
    language,
    setLanguage,
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

