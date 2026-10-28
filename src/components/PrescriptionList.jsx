/**
 * CareBridge — PrescriptionList Component
 * File: src/components/PrescriptionList.jsx
 * Styled via CSS Modules: PrescriptionList.module.css
 */

import React from 'react';
import { PrescriptionCard } from './PrescriptionCard.jsx';
import { MedicationForm } from './MedicationForm.jsx';
import styles from './PrescriptionList.module.css';

export function PrescriptionList({
  prescriptions = [],
  onToggleTaken,
  onAddPrescription,
  onReadAllPrescriptions,
  onAnnounce
}) {
  return (
    <section id="prescriptions-section" className={styles.prescriptionsSection} aria-labelledby="rx-heading">
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 id="rx-heading" className={styles.sectionTitle}>
            Multilingual Prescription Schedule &amp; Reader
          </h2>
          <p className={styles.sectionSubtitle}>
            Synchronized patient prescriptions with audio speech synthesis and adherence tracking
          </p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={onReadAllPrescriptions}
            aria-label="Read all scheduled medications aloud"
            style={{
              padding: '0.5rem 1rem',
              fontWeight: 700,
              fontSize: '0.8125rem',
              borderRadius: '6px',
              border: '1px solid var(--primary-600, #0284c7)',
              background: '#f0f9ff',
              color: 'var(--primary-700, #0369a1)',
              cursor: 'pointer'
            }}
          >
            🔊 Read All Regimens Aloud
          </button>
        </div>
      </div>

      {/* Grid of Prescription Cards */}
      <div className={styles.prescriptionsGrid}>
        {prescriptions.length === 0 ? (
          <div className={styles.emptyState} role="status">
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
