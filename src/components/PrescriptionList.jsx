/**
 * CareBridge — PrescriptionList Component
 * File: src/components/PrescriptionList.jsx
 * 
 * Component composition holding the prescriptions grid,
 * speech audio triggers, and the MedicationForm.
 */

import React from 'react';
import { PrescriptionCard } from './PrescriptionCard.jsx';
import { MedicationForm } from './MedicationForm.jsx';

export function PrescriptionList({
  prescriptions = [],
  onToggleTaken,
  onAddPrescription,
  onReadAllPrescriptions,
  onAnnounce
}) {
  return (
    <section id="prescriptions-section" className="prescriptions-portal-section" aria-labelledby="rx-heading">
      <div className="section-header-row">
        <div>
          <h2 id="rx-heading" className="section-title">
            Multilingual Prescription Schedule &amp; Reader
          </h2>
          <p className="section-subtitle">
            Synchronized patient prescriptions with audio speech synthesis and adherence tracking
          </p>
        </div>
        <div className="rx-quick-tools">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={onReadAllPrescriptions}
            aria-label="Read all scheduled medications aloud"
          >
            🔊 Read All Regimens Aloud
          </button>
        </div>
      </div>

      {/* Grid of Prescription Cards */}
      <div className="prescriptions-grid">
        {prescriptions.length === 0 ? (
          <div className="empty-rx-state" role="status">
            <p>No active medications scheduled for this patient.</p>
          </div>
        ) : (
          prescriptions.map((med) => (
            <PrescriptionCard
              key={med.id}
              prescription={med}
              onToggleTaken={onToggleTaken}
            />
          ))
        )}
      </div>

      {/* Add New Prescription Form Component */}
      <MedicationForm
        onAddPrescription={onAddPrescription}
        onAnnounce={onAnnounce}
      />
    </section>
  );
}

