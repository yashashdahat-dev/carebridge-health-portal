/**
 * CareBridge — PatientCard Component
 * File: src/components/PatientCard.jsx
 */

import React from 'react';
import { PRIORITY_TIERS } from '../data/initialData.js';

export function PatientCard({ patient, onCallPatient, onCompletePatient }) {
  const {
    id,
    name,
    mrn,
    age,
    tel,
    stream,
    painLevel,
    symptoms = [],
    accommodations = [],
    priority = 'routine',
    arrivalTime,
    notes
  } = patient;

  const tier = PRIORITY_TIERS[priority] || PRIORITY_TIERS.routine;

  return (
    <article
      className={`patient-queue-card card-${priority} ${tier.cardBorder || ''}`}
      aria-labelledby={`patient-name-${id}`}
      tabIndex="0"
    >
      <div className="card-top-row">
        <div className="patient-primary-meta">
          <h3 id={`patient-name-${id}`} className="patient-card-name">{name}</h3>
          <span className="patient-card-mrn">{mrn}</span>
          <span className="patient-card-age">Age: {age}</span>
        </div>
        <div className="patient-priority-badge-wrap">
          <span className={`status-pill ${tier.badgeClass || 'pill-standard'}`}>
            <span className={`dot ${tier.dotClass || 'green'}`} aria-hidden="true"></span>
            {tier.label || priority.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="card-clinical-row">
        <div className="clinical-tag stream-tag">
          <strong>Stream:</strong> {stream}
        </div>
        <div className="clinical-tag pain-tag">
          <strong>Pain Score:</strong> <span className="pain-badge">{painLevel}/10</span>
        </div>
        {arrivalTime && (
          <div className="clinical-tag time-tag">
            <time dateTime={arrivalTime}>Admitted: {arrivalTime}</time>
          </div>
        )}
      </div>

      {/* Symptoms list */}
      {symptoms.length > 0 && (
        <div className="patient-symptoms-section">
          <span className="label-heading">Presenting Symptoms:</span>
          <div className="symptoms-chips-container">
            {symptoms.map((symptom, idx) => (
              <span key={`${id}-symptom-${idx}`} className="symptom-chip">
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Accommodations */}
      {accommodations.length > 0 && (
        <div className="patient-accommodations-section">
          <span className="label-heading">Assistive Accommodations:</span>
          <div className="accommodations-chips-container">
            {accommodations.map((acc, idx) => (
              <span key={`${id}-acc-${idx}`} className="accommodation-chip">
                ♿ {acc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Notes */}
      {notes && (
        <p className="patient-clinical-notes">
          <strong>Triage Notes:</strong> {notes}
        </p>
      )}

      {/* Actions */}
      <div className="patient-card-actions">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => onCallPatient(patient)}
          aria-label={`Call patient ${name} to consultation room`}
        >
          <span aria-hidden="true">📢</span> Call Patient
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-success"
          onClick={() => onCompletePatient(id)}
          aria-label={`Mark consultation complete for ${name}`}
        >
          <span aria-hidden="true">✓</span> Complete / Discharge
        </button>
      </div>
    </article>
  );
}

