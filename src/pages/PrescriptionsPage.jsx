/**
 * CareBridge — Prescriptions Portal Page
 * File: src/pages/PrescriptionsPage.jsx
 */

import React, { useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useCareBridge } from '../context/CareBridgeContext.jsx';
import { PrescriptionList } from '../components/PrescriptionList.jsx';

export function PrescriptionsPage() {
  const {
    prescriptions = [],
    toggleMedicationTaken,
    addPrescription,
    announce,
    speak,
    language
  } = useCareBridge();

  const handleReadAllPrescriptions = useCallback(() => {
    if (!prescriptions.length) {
      announce('No scheduled medications to read aloud.', 'info');
      return;
    }

    const lines = prescriptions.map((med, idx) => {
      const name = med.translatedNames?.[language] || med.name;
      const inst = med.instructions?.[language] || med.instructions?.en || '';
      return `Medication ${idx + 1}: ${name}. ${med.dosage}. Scheduled time: ${med.time}. Directions: ${inst}.`;
    });

    const fullSpeech =
      `Daily Prescription Regimen. Total ${prescriptions.length} medications scheduled. ` +
      lines.join(' Next medication: ');
    speak(fullSpeech, language, 'all-meds');
  }, [prescriptions, language, speak, announce]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Multilingual Prescription Reader & Adherence</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
          Accessible daily medication schedules with English, Hindi, and Marathi voice synthesis.
        </p>
      </div>

      <PrescriptionList
        prescriptions={prescriptions}
        onToggleTaken={toggleMedicationTaken}
        onAddPrescription={addPrescription}
        onReadAllPrescriptions={handleReadAllPrescriptions}
        onAnnounce={announce}
      />

      {/* Nested Route Outlet for Sub-navigation / Details */}
      <Outlet />
    </div>
  );
}

export default PrescriptionsPage;

