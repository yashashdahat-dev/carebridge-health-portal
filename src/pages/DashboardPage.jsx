/**
 * CareBridge — Clinical Dashboard Page
 * File: src/pages/DashboardPage.jsx
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCareBridge } from '../context/CareBridgeContext.jsx';
import { DashboardSummary } from '../components/DashboardSummary.jsx';
import {
  calculatePriorityCounts,
  calculateAveragePainScore,
  calculateAdherenceStats,
  areAllMedicationsCompleted,
  hasUrgentPatients
} from '../utils/clinicalAnalytics.js';

export function DashboardPage() {
  const { patientQueue = [], prescriptions = [] } = useCareBridge();

  const priorityCounts = useMemo(() => calculatePriorityCounts(patientQueue), [patientQueue]);
  const averagePain = useMemo(() => calculateAveragePainScore(patientQueue), [patientQueue]);
  const adherenceStats = useMemo(() => calculateAdherenceStats(prescriptions), [prescriptions]);
  const hasUrgent = useMemo(() => hasUrgentPatients(patientQueue), [patientQueue]);
  const allMedsCompleted = useMemo(() => areAllMedicationsCompleted(prescriptions), [prescriptions]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Clinical Operations Overview</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
            Real-time Emergency Severity Index (ESI) metrics, active waiting queue, and daily adherence monitoring.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to="/patients"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none'
            }}
          >
            <span>➕</span>
            <span>Intake Triage</span>
          </Link>
          <Link
            to="/prescriptions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--slate-100, #f1f5f9)',
              color: 'var(--text-body, #1e293b)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none'
            }}
          >
            <span>💊</span>
            <span>View Prescriptions</span>
          </Link>
        </div>
      </div>

      {/* 1. Core Metrics Summary */}
      <DashboardSummary
        queueCount={patientQueue.length}
        urgentCount={priorityCounts.urgent || 0}
        priorityCounts={priorityCounts}
        averagePain={averagePain}
        adherenceStats={adherenceStats}
        hasUrgent={hasUrgent}
        allMedsCompleted={allMedsCompleted}
      />

      {/* 2. Priority Queue Quick Highlights */}
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        
        {/* Urgent Attention Alert Card */}
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '5px solid #dc2626' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️</span>
            <span>Immediate Triage Attention</span>
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-body, #475569)', margin: '0 0 1rem 0' }}>
            {priorityCounts.urgent > 0
              ? `There are currently ${priorityCounts.urgent} patients in Urgent (Tier 1) priority requiring immediate bedside evaluation.`
              : 'All emergency patients have been triaged and transferred to consultation suites.'}
          </p>
          <Link to="/patients" style={{ fontSize: '0.8125rem', color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
            Review Triage Queue →
          </Link>
        </div>

        {/* Medication Regimen Card */}
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '5px solid #10b981' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💊</span>
            <span>Daily Adherence Regimen</span>
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-body, #475569)', margin: '0 0 1rem 0' }}>
            {adherenceStats.total > 0
              ? `${adherenceStats.taken} of ${adherenceStats.total} prescribed doses taken today (${adherenceStats.percentage}% compliance).`
              : 'No scheduled medications currently active for today.'}
          </p>
          <Link to="/prescriptions" style={{ fontSize: '0.8125rem', color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
            Access Multilingual Reader →
          </Link>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;

