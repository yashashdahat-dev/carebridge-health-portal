/**
 * CareBridge — PatientCard Component
 * File: src/components/PatientCard.jsx
 * Styled via CSS Modules: PatientCard.module.css
 */

import React from 'react';
import styles from './PatientCard.module.css';

export function PatientCard({ patient, onCallPatient, onCompletePatient }) {
  const {
    id,
    name,
    mrn,
    age,
    stream,
    painLevel,
    symptoms = [],
    accommodations = [],
    priority = 'routine',
    arrivalTime,
    notes
  } = patient;

  const priorityClass = priority === 'urgent'
    ? styles.cardUrgent
    : priority === 'priority'
      ? styles.cardPriority
      : styles.cardRoutine;

  const pillClass = priority === 'urgent'
    ? styles.pillEmergency
    : priority === 'priority'
      ? styles.pillUrgent
      : styles.pillStandard;

  return (
    <article
      className={`${styles.patientCard} ${priorityClass}`}
      aria-labelledby={`patient-name-${id}`}
      tabIndex="0"
    >
      <div className={styles.cardTopRow}>
        <div>
          <h3 id={`patient-name-${id}`} className={styles.patientName}>{name}</h3>
          <span className={styles.patientMrn}>{mrn}</span>
          <span className={styles.patientAge}>Age: {age}</span>
        </div>
        <div>
          <span className={`${styles.statusPill} ${pillClass}`}>
            ● {priority.toUpperCase()}
          </span>
        </div>
      </div>

      <div className={styles.cardClinicalRow}>
        <div className={styles.clinicalTag}>
          <strong>Stream:</strong> {stream}
        </div>
        <div className={styles.clinicalTag}>
          <strong>Pain Score:</strong> <span className={styles.painBadge}>{painLevel}/10</span>
        </div>
        {arrivalTime && (
          <div className={styles.clinicalTag}>
            <time dateTime={arrivalTime}>Admitted: {arrivalTime}</time>
          </div>
        )}
      </div>

      {symptoms.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '0.25rem' }}>
            Presenting Symptoms:
          </div>
          <div className={styles.symptomsContainer}>
            {symptoms.map((symptom, idx) => (
              <span key={`${id}-symptom-${idx}`} className={styles.symptomChip}>
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {accommodations.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '0.25rem' }}>
            Accommodations:
          </div>
          <div className={styles.accommodationsContainer}>
            {accommodations.map((acc, idx) => (
              <span key={`${id}-acc-${idx}`} className={styles.accommodationChip}>
                ♿ {acc}
              </span>
            ))}
          </div>
        </div>
      )}

      {notes && (
        <p className={styles.patientNotes}>
          <strong>Triage Notes:</strong> {notes}
        </p>
      )}

      <div className={styles.cardActions}>
        <button
          type="button"
          className={`${styles.btnAction} ${styles.btnCall}`}
          onClick={() => onCallPatient(patient)}
          aria-label={`Call patient ${name} to consultation room`}
        >
          📢 Call Patient
        </button>
        <button
          type="button"
          className={`${styles.btnAction} ${styles.btnComplete}`}
          onClick={() => onCompletePatient(id)}
          aria-label={`Mark consultation complete for ${name}`}
        >
          ✓ Complete / Discharge
        </button>
      </div>
    </article>
  );
}
