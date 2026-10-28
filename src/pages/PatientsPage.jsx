/**
 * CareBridge — Patients Triage Page
 * File: src/pages/PatientsPage.jsx
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useCareBridge } from '../context/CareBridgeContext.jsx';
import { PatientTriageForm } from '../components/PatientTriageForm.jsx';
import { PatientQueue } from '../components/PatientQueue.jsx';
import styles from '../App.module.css';

export function PatientsPage() {
  const {
    patientQueue = [],
    addPatient,
    completePatient,
    announce,
    speak
  } = useCareBridge();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Derived filtered patient queue
  const filteredQueue = useMemo(() => {
    return patientQueue.filter((patient) => {
      if (activeFilter !== 'all' && patient.priority !== activeFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = patient.name.toLowerCase().includes(q);
      const matchMrn = patient.mrn.toLowerCase().includes(q);
      const matchStream = patient.stream.toLowerCase().includes(q);
      const matchSymptoms = patient.symptoms?.some((s) => s.toLowerCase().includes(q));

      return matchName || matchMrn || matchStream || matchSymptoms;
    });
  }, [patientQueue, activeFilter, searchQuery]);

  const handleCallPatient = useCallback(
    (patient) => {
      const text = `Attention: Patient ${patient.name}, Medical Record ${patient.mrn}, please report to ${patient.stream} Consultation Room 1.`;
      speak(text, 'en', patient.id);
      announce(`Paging patient ${patient.name} to Consultation Room 1.`, 'info');
    },
    [speak, announce]
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Emergency Patient Triage & Intake</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
          Evaluate emergency severity index, register walk-in patients, and manage the live consultation queue.
        </p>
      </div>

      <div className={styles.portalTwoColumnLayout}>
        <div className={styles.columnTriageForm}>
          <PatientTriageForm onAddPatient={addPatient} onAnnounce={announce} />
        </div>

        <div className={styles.columnPatientQueue}>
          <PatientQueue
            patients={filteredQueue}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            onFilterChange={setActiveFilter}
            onSearchChange={setSearchQuery}
            onCallPatient={handleCallPatient}
            onCompletePatient={completePatient}
          />
        </div>
      </div>

      {/* Nested Route Outlet for Sub-navigation / Details (PDF Page 6, 15) */}
      <Outlet />
    </div>
  );
}

export default PatientsPage;

