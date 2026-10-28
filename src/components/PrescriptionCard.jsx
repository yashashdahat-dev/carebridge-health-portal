/**
 * CareBridge — PrescriptionCard Component
 * File: src/components/PrescriptionCard.jsx
 * Styled via CSS Modules: PrescriptionCard.module.css
 */

import React from 'react';
import { useCareBridge } from '../context/CareBridgeContext.jsx';
import styles from './PrescriptionCard.module.css';

export function PrescriptionCard({ prescription, onToggleTaken }) {
  const { language, activeSpeechId, speak, stopAllSpeech } = useCareBridge();

  const {
    id,
    name,
    dosage,
    time,
    slot,
    purpose,
    taken,
    doctor,
    caution,
    instructions = {},
    translatedNames = {},
    translatedCategories = {}
  } = prescription;

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
      className={`${styles.prescriptionCard} ${taken ? styles.prescriptionTaken : ''}`}
      aria-labelledby={`med-heading-${id}`}
      tabIndex="0"
    >
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.medCategoryBadge}>
            {displayCategory}
          </span>
          <h3 id={`med-heading-${id}`} className={styles.medName}>
            {displayName}
          </h3>
          <span className={styles.medDosage}>{dosage}</span>
        </div>

        <div className={styles.takenCheckboxLabel}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={taken}
              onChange={() => onToggleTaken(id)}
              aria-label={`Mark ${name} as ${taken ? 'pending' : 'taken'}`}
            />
            <span className={`${styles.takenStatusPill} ${taken ? styles.pillTaken : styles.pillPending}`}>
              {taken ? '✓ Taken' : '○ Pending'}
            </span>
          </label>
        </div>
      </div>

      <div className={styles.scheduleRow}>
        <div>
          <strong>Intake Time:</strong> <time>{time}</time> <span>({slot || 'Scheduled'})</span>
        </div>
        {doctor && (
          <div>
            <strong>Doctor:</strong> <span>{doctor}</span>
          </div>
        )}
      </div>

      {caution && (
        <div className={styles.cautionBanner} role="note">
          <span aria-hidden="true">⚠️</span>
          <span><strong>Caution:</strong> {caution}</span>
        </div>
      )}

      {/* Multilingual Directions */}
      <div className={styles.instructionsBlock}>
        <div className={styles.instructionsHeaderRow}>
          <span className={styles.instructionsLabel}>
            Patient Directions ({language === 'hi' ? 'हिन्दी' : language === 'mr' ? 'मराठी' : 'English'}):
          </span>
          <button
            type="button"
            className={`${styles.btnSpeechCard} ${isSpeakingThis ? styles.speaking : ''}`}
            onClick={handleSpeak}
            aria-label={`Listen to directions for ${name}`}
          >
            {isSpeakingThis ? '⏹ Stop' : '🔊 Listen'}
          </button>
        </div>
        <p className={styles.instructionsBodyText}>{displayInstruction}</p>
      </div>
    </article>
  );
}
