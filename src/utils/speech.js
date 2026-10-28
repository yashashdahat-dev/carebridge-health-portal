/**
 * CareBridge — Web Speech API Integration & Accessible Audio Engine
 * File: src/utils/speech.js
 */

import { CareBridgeError, logDiagnostic } from './errors.js';

export class SpeechServiceError extends CareBridgeError {
  constructor(action, reason, userMessage = 'Audio speech service is temporarily unavailable.') {
    super(`Web Speech API ${action} failed: ${reason}`, userMessage, { action, reason });
    this.name = 'SpeechServiceError';
    this.action = action;
  }
}

export const findBestVoice = (langCode = 'en') => {
  try {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || !voices.length) return null;

    if (langCode === 'hi') {
      return voices.find(({ lang }) => lang.toLowerCase().startsWith('hi')) || null;
    }
    if (langCode === 'mr') {
      return (
        voices.find(({ lang }) => lang.toLowerCase().startsWith('mr')) ||
        voices.find(({ lang }) => lang.toLowerCase().startsWith('hi')) ||
        null
      );
    }
    return (
      voices.find(({ lang }) => lang.toLowerCase() === 'en-in') ||
      voices.find(({ lang }) => lang.toLowerCase().startsWith('en-us')) ||
      voices.find(({ lang }) => lang.toLowerCase().startsWith('en')) ||
      null
    );
  } catch (err) {
    logDiagnostic(new SpeechServiceError('findBestVoice', err?.message || 'Failed to query system voices'));
    return null;
  }
};

export const stopSpeech = (onStopCallback = null) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch (err) {
    logDiagnostic(new SpeechServiceError('cancel', err?.message || 'Cancel operation failed'));
  } finally {
    if (onStopCallback) onStopCallback();
  }
};

export const speakClinicalText = ({
  text,
  lang = 'en',
  onStart = null,
  onEnd = null,
  onError = null
}) => {
  try {
    if (!('speechSynthesis' in window)) {
      const err = new SpeechServiceError('speak', 'Browser does not support window.speechSynthesis.');
      if (onError) onError(err);
      return;
    }

    if (!text || typeof text !== 'string') {
      const err = new SpeechServiceError('speak', 'No valid clinical text provided for speech playback.');
      if (onError) onError(err);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const localeMap = { en: 'en-US', hi: 'hi-IN', mr: 'mr-IN' };
    utterance.lang = localeMap[lang] || 'en-US';

    const matchedVoice = findBestVoice(lang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart(text);
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      logDiagnostic(new SpeechServiceError('utterance.onerror', e?.error || 'Speech error'));
      if (onEnd) onEnd();
      if (onError) onError(e);
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    logDiagnostic(new SpeechServiceError('speak', err?.message || 'Speech execution exception'));
    if (onEnd) onEnd();
    if (onError) onError(err);
  }
};

