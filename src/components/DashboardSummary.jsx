/**
 * CareBridge — DashboardSummary Component
 * File: src/components/DashboardSummary.jsx
 * Styled via CSS Modules: DashboardSummary.module.css
 */

import React from 'react';
import styles from './DashboardSummary.module.css';

export function DashboardSummary({
  queueCount,
  urgentCount,
  priorityCounts,
  averagePain,
  adherenceStats,
  hasUrgent,
  allMedsCompleted
}) {
  return (
    <section id="analytics-section" className={styles.dashboardSummarySection} aria-label="Clinical Metrics Summary">
      
      {/* Dynamic Emergency Alert Banner */}
      {hasUrgent && (
        <div className={styles.emergencyAlertBanner} role="alert" aria-live="assertive">
          <div className={styles.alertBannerContent}>
            <span className={styles.alertIconWrap} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </span>
            <div>
              <strong>CRITICAL CLINICAL ADVISORY:</strong> {urgentCount} Tier-1 Urgent patient(s) waiting in queue. Immediate physician evaluation required.
            </div>
          </div>
        </div>
      )}

      {/* 100% Adherence Completion Banner */}
      {allMedsCompleted && (
        <div className={styles.allCompletedBanner} role="status" aria-live="polite">
          <span aria-hidden="true">✓</span>
          <span><strong>100% Adherence Achieved:</strong> All scheduled daily doses have been marked as taken!</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className={styles.metricsGrid}>
        
        {/* Metric 1: Active Waiting Queue */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Active Waiting Queue</span>
            <span className={styles.metricIcon} aria-hidden="true">👥</span>
          </div>
          <div className={styles.metricBody}>
            <span className={styles.metricValue}>{queueCount}</span>
            <span className={styles.metricUnit}>Patients Admitted</span>
          </div>
          <div className={styles.metricFooter}>
            <div className={styles.tierPillsRow}>
              <span className={`${styles.tierPill} ${styles.pillEmergency}`}>{priorityCounts.urgent || 0} Urgent</span>
              <span className={`${styles.tierPill} ${styles.pillUrgent}`}>{priorityCounts.priority || 0} Priority</span>
              <span className={`${styles.tierPill} ${styles.pillStandard}`}>{priorityCounts.routine || 0} Routine</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Emergency Triage Cases */}
        <div className={`${styles.metricCard} ${urgentCount > 0 ? styles.cardHasUrgent : ''}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Urgent (Tier 1) Cases</span>
            <span className={styles.metricIcon} aria-hidden="true">🚨</span>
          </div>
          <div className={styles.metricBody}>
            <span className={`${styles.metricValue} ${styles.metricUrgentVal}`}>{urgentCount}</span>
            <span className={styles.metricUnit}>Immediate Evaluation</span>
          </div>
          <div className={styles.metricFooter}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>
              Critical symptoms / severe pain
            </span>
          </div>
        </div>

        {/* Metric 3: Average Pain Score */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Mean Patient Pain</span>
            <span className={styles.metricIcon} aria-hidden="true">📊</span>
          </div>
          <div className={styles.metricBody}>
            <span className={styles.metricValue}>{averagePain}</span>
            <span className={styles.metricUnit}>Scale: 1 – 10</span>
          </div>
          <div className={styles.metricFooter}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>
              Clinical visual-analog index
            </span>
          </div>
        </div>

        {/* Metric 4: Daily Adherence Index */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Dose Adherence Rate</span>
            <span className={styles.metricIcon} aria-hidden="true">💊</span>
          </div>
          <div className={styles.metricBody}>
            <div className={styles.adherenceStatRow}>
              <span className={styles.metricValue}>{adherenceStats.percentage}%</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>
                ({adherenceStats.takenCount}/{adherenceStats.totalCount} Doses)
              </span>
            </div>
            <progress
              className={styles.adherenceProgressBar}
              value={adherenceStats.percentage}
              max="100"
              aria-label={`Daily medication adherence: ${adherenceStats.percentage} percent`}
            >
              {adherenceStats.percentage}%
            </progress>
          </div>
          <div className={styles.metricFooter}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>
              {allMedsCompleted ? 'All doses taken today' : `${adherenceStats.totalCount - adherenceStats.takenCount} dose(s) pending`}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
