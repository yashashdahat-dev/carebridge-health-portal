/**
 * CareBridge — PrescriptionCard Component
 * File: src/components/PrescriptionCard.jsx
 * Styled via CSS Modules: PrescriptionCard.module.css
 */

import React from 'react';
import { Link } from 'react-router-dom';
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
  const displayInstruction =
    instructions[language] || instructions.en || 'Take as clinically directed by physician.';

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
          <h3 id={`med-heading-${id}`} className={styles.medTitle}>
            <Link to={`/prescriptions/${id}`} style={{ color: 'inherit', textDecoration: 'none' }} title="View medication details">
              {displayName}
            </Link>
          </h3>
          <span className={styles.medDosage}>{dosage}</span>
          {displayCategory && <span className={styles.medCategory}>{displayCategory}</span>}
        </div>

        <div>
          <label className={styles.adherenceToggleLabel}>
            <input
              type="checkbox"
              className={styles.adherenceCheckbox}
              checked={Boolean(taken)}
              onChange={() => onToggleTaken(id)}
              aria-label={`Mark ${name} as ${taken ? 'pending' : 'taken'}`}
            />
            <span
              className={`${styles.takenStatusPill} ${
                taken ? styles.pillTaken : styles.pillPending
              }`}
            >
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
          <span>
            <strong>Caution:</strong> {caution}
          </span>
        </div>
      )}

      {/* Multilingual Directions */}
      <div className={styles.instructionsBlock}>
        <div className={styles.instructionsHeaderRow}>
          <span className={styles.instructionsLabel}>
            Patient Directions ({language === 'hi' ? 'हिंदी' : language === 'mr' ? 'मराठी' : 'English'}):
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to={`/prescriptions/${id}`}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                background: '#f1f5f9',
                color: '#334155',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              👁️ Details
            </Link>
            <button
              type="button"
              className={`${styles.btnSpeechCard} ${isSpeakingThis ? styles.speaking : ''}`}
              onClick={handleSpeak}
              aria-label={`Listen to directions for ${name}`}
            >
              {isSpeakingThis ? '⏹ Stop' : '🔊 Listen'}
            </button>
          </div>
        </div>
        <p className={styles.instructionsBodyText}>{displayInstruction}</p>
      </div>
    </article>
  );
}

export default PrescriptionCard;
