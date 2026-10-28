/**
 * CareBridge — PatientCard Component
 * File: src/components/PatientCard.jsx
 * Styled via CSS Modules: PatientCard.module.css
 */

import React from 'react';
import { Link } from 'react-router-dom';
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

  const priorityClass =
    priority === 'urgent'
      ? styles.cardUrgent
      : priority === 'priority'
      ? styles.cardPriority
      : styles.cardRoutine;

  const pillClass =
    priority === 'urgent'
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
          <h3 id={`patient-name-${id}`} className={styles.patientName}>
            <Link to={`/patients/${id}`} style={{ color: 'inherit', textDecoration: 'none' }} title="View patient details">
              {name}
            </Link>
          </h3>
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
        <span className={styles.clinicalTag}>
          <strong>Dept:</strong> {stream}
        </span>
        <span className={styles.clinicalTag}>
          <strong>Pain:</strong> <span className={styles.painBadge}>{painLevel}/10</span>
        </span>
        <span className={styles.clinicalTag}>
          <strong>Arrived:</strong> {arrivalTime}
        </span>
      </div>

      {symptoms && symptoms.length > 0 && (
        <div className={styles.symptomsContainer} aria-label="Reported symptoms">
          {symptoms.map((sym, idx) => (
            <span key={idx} className={styles.symptomChip}>
              {sym}
            </span>
          ))}
        </div>
      )}

      {accommodations && accommodations.length > 0 && (
        <div className={styles.accommodationsContainer} aria-label="Required accommodations">
          {accommodations.map((acc, idx) => (
            <span key={idx} className={styles.accommodationChip}>
              ♿ {acc}
            </span>
          ))}
        </div>
      )}

      {notes && (
        <p className={styles.patientNotes}>
          <strong>Note:</strong> {notes}
        </p>
      )}

      <div className={styles.cardActions}>
        <Link
          to={`/patients/${id}`}
          className={`${styles.btnAction}`}
          style={{ textDecoration: 'none', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', display: 'inline-flex', alignItems: 'center' }}
          aria-label={`View clinical record for ${name}`}
        >
          👁️ Details
        </Link>
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

export default PatientCard;
