/**
 * CareBridge — Patient Triage & Multilingual Prescription Portal
 * Module: speech.js (Web Speech API Integration & Accessible Audio Engine)
 */

'use strict';

import { CareBridgeError, logDiagnostic } from './errors.js';

export class SpeechServiceError extends CareBridgeError {
  constructor(action, reason, userMessage = 'Audio speech service is temporarily unavailable.') {
    super(`Web Speech API ${action} failed: ${reason}`, userMessage, { action, reason });
    this.name = 'SpeechServiceError';
    this.action = action;
  }
}

let activeUtterance = null;
let isSpeakingSequence = false;

/**
 * Locate best available voice matching requested language using Array.prototype.find().
 * 
 * @param {string} langCode - 'en' | 'hi' | 'mr'
 * @returns {SpeechSynthesisVoice|null}
 */
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
    // English (default)
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

/**
 * Cancel any ongoing speech synthesis safely
 */
export const stopSpeech = (onStopCallback = null) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch (err) {
    logDiagnostic(new SpeechServiceError('cancel', err?.message || 'Cancel operation failed'));
  } finally {
    isSpeakingSequence = false;
    activeUtterance = null;
    if (onStopCallback) onStopCallback();
  }
};

/**
 * Speak clinical text aloud using Web Speech API with try/catch/finally
 * 
 * @param {Object} options
 * @param {string} options.text - Clinical text to synthesize
 * @param {string} [options.lang='en'] - 'en' | 'hi' | 'mr'
 * @param {Function} [options.onStart] - Callback on start
 * @param {Function} [options.onEnd] - Callback on completion
 * @param {Function} [options.onError] - Callback on error
 */
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

    // Cancel prior speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Clear clinical pace
    utterance.pitch = 1.0;

    const localeMap = { en: 'en-US', hi: 'hi-IN', mr: 'mr-IN' };
    utterance.lang = localeMap[lang] || 'en-US';

    const matchedVoice = findBestVoice(lang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      try {
        if (onStart) onStart(text);
      } catch (cbErr) {
        logDiagnostic(cbErr, { phase: 'onStart' });
      }
    };

    utterance.onend = () => {
      activeUtterance = null;
      try {
        if (onEnd) onEnd();
      } catch (cbErr) {
        logDiagnostic(cbErr, { phase: 'onEnd' });
      }
    };

    utterance.onerror = (speechErr) => {
      const wrappedErr = new SpeechServiceError('utterance', speechErr.error || 'Audio playback interrupted');
      logDiagnostic(wrappedErr);
      activeUtterance = null;
      try {
        if (onError) onError(wrappedErr);
      } catch (cbErr) {
        logDiagnostic(cbErr, { phase: 'onError' });
      }
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (generalErr) {
    const wrapped = new SpeechServiceError('speakClinicalText', generalErr?.message);
    logDiagnostic(wrapped);
    if (onError) onError(wrapped);
  }
};

/**
 * Sequentially read an array of prescriptions aloud in the active language
 * 
 * @param {Array<Object>} prescriptions - Array of prescription objects
 * @param {string} lang - 'en' | 'hi' | 'mr'
 * @param {Object} handlers - UI status hooks
 */
export const readAllPrescriptionsAloud = (prescriptions = [], lang = 'en', { onNext, onComplete, onStop }) => {
  if (!prescriptions.length) {
    if (onStop) onStop();
    return;
  }

  isSpeakingSequence = true;
  let currentIndex = 0;

  const playStep = () => {
    try {
      if (!isSpeakingSequence || currentIndex >= prescriptions.length) {
        isSpeakingSequence = false;
        if (onComplete) onComplete();
        return;
      }

      const rx = prescriptions[currentIndex];
      const { name, translatedNames, dosage, time, instructions } = rx;
      const displayName = (translatedNames && translatedNames[lang]) || name;
      const instructionText = (instructions && instructions[lang]) || instructions?.en || '';

      let announcementText = '';
      if (lang === 'hi') {
        announcementText = `दवा संख्या ${currentIndex + 1}: ${displayName}, खुराक: ${dosage}, समय: ${time}। ${instructionText}`;
      } else if (lang === 'mr') {
        announcementText = `औषध क्रमांक ${currentIndex + 1}: ${displayName}, डोस: ${dosage}, वेळ: ${time}। ${instructionText}`;
      } else {
        announcementText = `Medication ${currentIndex + 1} of ${prescriptions.length}: ${displayName}, dosage ${dosage}, scheduled for ${time}. ${instructionText}`;
      }

      if (onNext) onNext(currentIndex + 1, prescriptions.length, displayName);
      currentIndex++;

      speakClinicalText({
        text: announcementText,
        lang,
        onEnd: () => {
          if (isSpeakingSequence) {
            setTimeout(playStep, 700);
          }
        },
        onError: () => {
          isSpeakingSequence = false;
          if (onStop) onStop();
        }
      });
    } catch (stepErr) {
      logDiagnostic(stepErr, { phase: 'playStep', currentIndex });
      isSpeakingSequence = false;
      if (onStop) onStop();
    }
  };

  playStep();
};

// Initialize voice roster early with defensive check
try {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      try {
        window.speechSynthesis.getVoices();
      } catch (e) {
        // Safe suppression
      }
    };
  }
} catch (e) {
  // Safe suppression for restricted browser environments
}
