/**
 * CareBridge — Root Application Component
 * File: src/App.jsx
 * 
 * Demonstrates:
 * - Lifting State Up (Shared patientQueue and prescriptions)
 * - useMemo (Derived filtered queue, priority counts, average pain score, adherence stats)
 * - useCallback (Optimized event handlers for patient & medication updates)
 * - useContext (Consumed via useCareBridge)
 * - useLocalStorage (Custom hook for persistence)
 * - Component Composition (Header, DashboardSummary, PatientTriageForm, PatientQueue, PrescriptionList, Footer)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useCareBridge } from './context/CareBridgeContext.jsx';
import { INITIAL_PATIENT_QUEUE, INITIAL_PRESCRIPTIONS } from './data/initialData.js';
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

export function CareBridgeApp() {
  const { announce, speak, language } = useCareBridge();

  // 1. Shared State Lifted Up: Patient Queue & Prescriptions (Persisted via custom hook)
  const [patientQueue, setPatientQueue] = useLocalStorage('carebridge_triage_records', INITIAL_PATIENT_QUEUE);
  const [prescriptions, setPrescriptions] = useLocalStorage('carebridge_prescriptions', INITIAL_PRESCRIPTIONS);

  // 2. Queue UI Filter & Search State
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------------------------------------------------------------------
  // 3. useMemo DERIVED METRICS & FILTERED DATA
  // ---------------------------------------------------------------------------

  // Filtered queue based on active priority tab and text search
  const filteredQueue = useMemo(() => {
    return patientQueue.filter((patient) => {
      // 1. Filter by priority tier
      if (activeFilter !== 'all' && patient.priority !== activeFilter) {
        return false;
      }
      // 2. Filter by search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = patient.name.toLowerCase().includes(q);
      const matchMrn = patient.mrn.toLowerCase().includes(q);
      const matchStream = patient.stream.toLowerCase().includes(q);
      const matchSymptoms = patient.symptoms?.some((s) => s.toLowerCase().includes(q));

      return matchName || matchMrn || matchStream || matchSymptoms;
    });
  }, [patientQueue, activeFilter, searchQuery]);

  // Derived priority counts: urgent, priority, routine
  const priorityCounts = useMemo(() => {
    return calculatePriorityCounts(patientQueue);
  }, [patientQueue]);

  // Derived mean pain score across all waiting patients
  const averagePain = useMemo(() => {
    return calculateAveragePainScore(patientQueue);
  }, [patientQueue]);

  // Derived medication adherence rate
  const adherenceStats = useMemo(() => {
    return calculateAdherenceStats(prescriptions);
  }, [prescriptions]);

  // Derived boolean: are any urgent patients currently waiting?
  const hasUrgent = useMemo(() => {
    return hasUrgentPatients(patientQueue);
  }, [patientQueue]);

  // Derived boolean: are all daily doses completed?
  const allMedsCompleted = useMemo(() => {
    return areAllMedicationsCompleted(prescriptions);
  }, [prescriptions]);

  // ---------------------------------------------------------------------------
  // 4. useCallback EVENT HANDLERS (Stable function references)
  // ---------------------------------------------------------------------------

  // Add newly registered patient
  const handleAddPatient = useCallback((newPatient) => {
    setPatientQueue((prev) => [newPatient, ...prev]);
  }, [setPatientQueue]);

  // Discharge / complete patient
  const handleCompletePatient = useCallback((patientId) => {
    setPatientQueue((prev) => {
      const target = prev.find((p) => p.id === patientId);
      const updated = prev.filter((p) => p.id !== patientId);
      if (target) {
        announce(`Consultation complete for ${target.name}. Patient discharged from queue.`, 'success');
      }
      return updated;
    });
  }, [setPatientQueue, announce]);

  // Audio announce patient call
  const handleCallPatient = useCallback((patient) => {
    const text = `Attention: Patient ${patient.name}, Medical Record ${patient.mrn}, please proceed to ${patient.stream} Consultation Room 1.`;
    speak(text, 'en', patient.id);
    announce(`Paging patient ${patient.name} to Consultation Room 1.`, 'info');
  }, [speak, announce]);

  // Toggle medication taken state
  const handleToggleMedication = useCallback((medId) => {
    setPrescriptions((prev) => {
      return prev.map((med) => {
        if (med.id === medId) {
          const nextTaken = !med.taken;
          announce(
            `Medication "${med.name}" marked as ${nextTaken ? 'Taken ✓' : 'Pending Dose ○'}.`,
            nextTaken ? 'success' : 'info'
          );
          return { ...med, taken: nextTaken };
        }
        return med;
      });
    });
  }, [setPrescriptions, announce]);

  // Add newly scheduled medication
  const handleAddPrescription = useCallback((newMed) => {
    setPrescriptions((prev) => [...prev, newMed]);
  }, [setPrescriptions]);

  // Read all scheduled prescriptions aloud
  const handleReadAllPrescriptions = useCallback(() => {
    if (!prescriptions.length) {
      announce('No scheduled medications to read aloud.', 'info');
      return;
    }

    const lines = prescriptions.map((med, idx) => {
      const name = med.translatedNames?.[language] || med.name;
      const inst = med.instructions?.[language] || med.instructions?.en || '';
      return `Medication ${idx + 1}: ${name}. ${med.dosage}. Intake time: ${med.time}. Directions: ${inst}.`;
    });

    const fullSpeech = `Daily Prescription Regimen. Total ${prescriptions.length} medications scheduled. ` + lines.join(' Next medication: ');
    speak(fullSpeech, language, 'all-meds');
  }, [prescriptions, language, speak, announce]);

  return (
    <div className="carebridge-app-root">
      
      {/* Keyboard Accessible Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main clinical content
      </a>

      {/* Screen Reader & Visual Status Banner */}
      <StatusBanner />

      {/* App Header with Toolbar and Navigation */}
      <Header onReadAllPrescriptions={handleReadAllPrescriptions} />

      {/* Main Clinical Content Landmark */}
      <main id="main-content" className="app-main-content">
        <div className="main-content-container">

          {/* 1. Clinical Dashboard Metrics Summary */}
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
          <div className="portal-two-column-layout">
            <div className="column-triage-form">
              <PatientTriageForm
                onAddPatient={handleAddPatient}
                onAnnounce={announce}
              />
            </div>
            
            <div className="column-patient-queue">
              <PatientQueue
                patients={filteredQueue}
                activeFilter={activeFilter}
                searchQuery={searchQuery}
                onFilterChange={setActiveFilter}
                onSearchChange={setSearchQuery}
                onCallPatient={handleCallPatient}
                onCompletePatient={handleCompletePatient}
              />
            </div>
          </div>

          {/* 3. Prescription Schedule & Multilingual Reader */}
          <PrescriptionList
            prescriptions={prescriptions}
            onToggleTaken={handleToggleMedication}
            onAddPrescription={handleAddPrescription}
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
