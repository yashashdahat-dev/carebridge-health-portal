/**
 * CareBridge — Main Application Root Component
 * File: src/App.jsx
 * 
 * Demonstrates:
 * - Context API (CareBridgeContext for shared global state & reducer actions)
 * - Prop Drilling (Parent-to-child data & callbacks passed to PatientQueue, PatientCard, PrescriptionList)
 * - useMemo for derived state (filtered queue, priority counts, average pain, adherence)
 * - useCallback for optimized event handlers
 * - CSS Modules scoped layout (App.module.css)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useCareBridge } from './context/CareBridgeContext.jsx';
import {
  calculatePriorityCounts,
  calculateAveragePainScore,
  calculateAdherenceStats,
  areAllMedicationsCompleted,
  hasUrgentPatients
} from './utils/clinicalAnalytics.js';

import { StatusBanner } from './components/StatusBanner.jsx';
import { Header } from './components/Header.jsx';
import { DashboardSummary } from './components/DashboardSummary.jsx';
import { PatientTriageForm } from './components/PatientTriageForm.jsx';
import { PatientQueue } from './components/PatientQueue.jsx';
import { PrescriptionList } from './components/PrescriptionList.jsx';
import { Footer } from './components/Footer.jsx';

import styles from './App.module.css';

export function CareBridgeApp() {
  const {
    patientQueue,
    addPatient,
    completePatient,
    prescriptions,
    addPrescription,
    toggleMedicationTaken,
    announce,
    speak,
    language
  } = useCareBridge();

  // Local state for queue UI filtering and search (Local State Pattern)
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------------------------------------------------------------------
  // DERIVED STATE PATTERN (useMemo)
  // ---------------------------------------------------------------------------

  // 1. Filtered patient queue derived from source queue, filter, and search
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

  // 2. Priority counts derived via reduce()
  const priorityCounts = useMemo(() => {
    return calculatePriorityCounts(patientQueue);
  }, [patientQueue]);

  // 3. Average pain level derived via reduce()
  const averagePain = useMemo(() => {
    return calculateAveragePainScore(patientQueue);
  }, [patientQueue]);

  // 4. Medication adherence percentage derived via reduce()
  const adherenceStats = useMemo(() => {
    return calculateAdherenceStats(prescriptions);
  }, [prescriptions]);

  // 5. Critical urgency flag derived via some()
  const hasUrgent = useMemo(() => {
    return hasUrgentPatients(patientQueue);
  }, [patientQueue]);

  // 6. Complete adherence flag derived via every()
  const allMedsCompleted = useMemo(() => {
    return areAllMedicationsCompleted(prescriptions);
  }, [prescriptions]);

  // ---------------------------------------------------------------------------
  // CALLBACK EVENT HANDLERS (useCallback)
  // ---------------------------------------------------------------------------

  const handleCallPatient = useCallback((patient) => {
    const text = `Attention: Patient ${patient.name}, Medical Record ${patient.mrn}, please report to ${patient.stream} Consultation Room 1.`;
    speak(text, 'en', patient.id);
    announce(`Paging patient ${patient.name} to Consultation Room 1.`, 'info');
  }, [speak, announce]);

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

    const fullSpeech = `Daily Prescription Regimen. Total ${prescriptions.length} medications scheduled. ` + lines.join(' Next medication: ');
    speak(fullSpeech, language, 'all-meds');
  }, [prescriptions, language, speak, announce]);

  return (
    <div className={styles.carebridgeAppRoot}>
      
      {/* Keyboard Accessible Skip Link */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main clinical content
      </a>

      {/* Screen Reader Live Region & Active Audio Bar */}
      <StatusBanner />

      {/* Header Landmark */}
      <Header onReadAllPrescriptions={handleReadAllPrescriptions} />

      {/* Main Clinical Content Landmark */}
      <main id="main-content" className={styles.appMainContent}>
        <div className={styles.mainContentContainer}>

          {/* 1. Clinical Dashboard Summary (Prop Drilling derived metrics) */}
          <DashboardSummary
            queueCount={patientQueue.length}
            urgentCount={priorityCounts.urgent || 0}
            priorityCounts={priorityCounts}
            averagePain={averagePain}
            adherenceStats={adherenceStats}
            hasUrgent={hasUrgent}
            allMedsCompleted={allMedsCompleted}
          />

          {/* 2. Two-Column Clinical Intake & Queue View */}
          <div className={styles.portalTwoColumnLayout}>
            <div className={styles.columnTriageForm}>
              <PatientTriageForm
                onAddPatient={addPatient}
                onAnnounce={announce}
              />
            </div>
            
            <div className={styles.columnPatientQueue}>
              {/* Prop Drilling Example: Queue passes callbacks and list down */}
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

          {/* 3. Prescription Schedule & Multilingual Reader */}
          <PrescriptionList
            prescriptions={prescriptions}
            onToggleTaken={toggleMedicationTaken}
            onAddPrescription={addPrescription}
            onReadAllPrescriptions={handleReadAllPrescriptions}
            onAnnounce={announce}
          />

        </div>
      </main>

      {/* Footer Landmark */}
      <Footer />

    </div>
  );
}

export default function App() {
  return <CareBridgeApp />;
}
