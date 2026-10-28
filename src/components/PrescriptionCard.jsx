/**
 * CareBridge — PrescriptionCard Component
 * File: src/components/PrescriptionCard.jsx
 * 
 * Demonstrates:
 * - Multilingual rendering (English, Hindi, Marathi) via CareBridgeContext
 * - Web Speech API text-to-speech integration
 * - Interactive medication completion toggle
 */

import React from 'react';
import { useCareBridge } from '../context/CareBridgeContext.jsx';

export function PrescriptionCard({ prescription, onToggleTaken }) {
  const { language, activeSpeechId, speak, stopAllSpeech } = useCareBridge();

  const {
    id,
    name,
    dosage,
    time,
    slot,
    purpose,
    categoryTag,
    taken,
    doctor,
    caution,
    instructions = {},
    translatedNames = {},
    translatedCategories = {}
  } = prescription;

  // Localized strings based on active language in context
  const displayName = translatedNames[language] || name;
  const displayCategory = translatedCategories[language] || purpose;
  const displayInstruction = instructions[language] || instructions.en || 'Take as clinically directed by physician.';

  const isSpeakingThis = activeSpeechId === id;

  const handleSpeak = () => {
    if (isSpeakingThis) {
      stopAllSpeech();
    } else {
      const speechText = `${displayName}. ${dosage}. Scheduled at ${time}. ${displayInstruction}`;
      speak(speechText, language, id);
    }
  };

  return (
    <article
      className={`prescription-card ${taken ? 'prescription-taken' : 'prescription-pending'}`}
      aria-labelledby={`med-heading-${id}`}
      tabIndex="0"
    >
      <div className="prescription-card-header">
        <div>
          <span className={`med-category-badge ${categoryTag || 'tag-general'}`}>
            {displayCategory}
          </span>
          <h3 id={`med-heading-${id}`} className="med-name">
            {displayName}
          </h3>
          <span className="med-dosage-text">{dosage}</span>
        </div>

        <div className="prescription-status-toggle">
          <label className="taken-checkbox-label">
            <input
              type="checkbox"
              checked={taken}
              onChange={() => onToggleTaken(id)}
              aria-label={`Mark ${name} as ${taken ? 'pending' : 'taken'}`}
            />
            <span className={`taken-status-pill ${taken ? 'pill-taken' : 'pill-pending'}`}>
              {taken ? '✓ Dose Taken' : '○ Pending Dose'}
            </span>
          </label>
        </div>
      </div>

      <div className="med-schedule-row">
        <div className="schedule-item">
          <span className="schedule-label">Intake Time:</span>
          <time className="schedule-time">{time}</time>
          <span className="schedule-slot">({slot || 'Scheduled'})</span>
        </div>
        {doctor && (
          <div className="schedule-item doctor-item">
            <span className="schedule-label">Prescribing Clinician:</span>
            <span className="doctor-name">{doctor}</span>
          </div>
        )}
      </div>

      {caution && (
        <div className="med-caution-banner" role="note">
          <span className="caution-icon" aria-hidden="true">⚠️</span>
          <span><strong>Clinical Caution:</strong> {caution}</span>
        </div>
      )}

      {/* Multilingual Directions */}
      <div className="med-instructions-block">
        <div className="instructions-header-row">
          <span className="instructions-label">
            Patient Directions ({language === 'hi' ? 'हिन्दी' : language === 'mr' ? 'मराठी' : 'English'}):
          </span>
          <button
            type="button"
            className={`btn-speech-card ${isSpeakingThis ? 'speaking' : ''}`}
            onClick={handleSpeak}
            aria-label={`Listen to audio directions for ${name} in ${language}`}
          >
            <span aria-hidden="true">{isSpeakingThis ? '⏹ Stop' : '🔊 Listen'}</span>
          </button>
        </div>
        <p className="instructions-body-text">{displayInstruction}</p>
      </div>
    </article>
  );
}
