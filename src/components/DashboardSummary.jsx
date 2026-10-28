/**
 * CareBridge — DashboardSummary Component
 * File: src/components/DashboardSummary.jsx
 * 
 * Clinical analytics dashboard showing patient counts, priority distribution,
 * average pain scores, and medication adherence progress index.
 */

import React from 'react';

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
    <section id="analytics-section" className="dashboard-summary-section" aria-label="Clinical Metrics Summary">
      
      {/* Dynamic Emergency Alert Banner (Shown when urgent cases are waiting) */}
      {hasUrgent && (
        <div className="emergency-alert-banner alert-critical" role="alert" aria-live="assertive">
          <div className="alert-banner-content">
            <span className="alert-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </span>
            <div className="alert-text">
              <strong>CRITICAL CLINICAL ADVISORY:</strong> {urgentCount} Tier-1 Urgent patient(s) waiting in queue. Immediate physician evaluation required.
            </div>
          </div>
        </div>
      )}

      {/* 100% Adherence Completion Banner */}
      {allMedsCompleted && (
        <div className="all-completed-banner alert-success" role="status" aria-live="polite">
          <span className="check-icon" aria-hidden="true">✓</span>
          <span><strong>100% Adherence Achieved:</strong> All scheduled daily doses have been marked as taken!</span>
        </div>
      )}

      {/* Grid of Clinical Metric Cards */}
      <div className="metrics-grid">
        
        {/* Metric 1: Active Waiting Queue */}
        <div className="metric-card card-queue">
          <div className="metric-header">
            <span className="metric-label">Active Waiting Queue</span>
            <span className="metric-icon" aria-hidden="true">👥</span>
          </div>
          <div className="metric-body">
            <span className="metric-value">{queueCount}</span>
            <span className="metric-unit">Patients Admitted</span>
          </div>
          <div className="metric-footer">
            <div className="tier-pills-row">
              <span className="tier-pill pill-emergency">{priorityCounts.urgent || 0} Urgent</span>
              <span className="tier-pill pill-urgent">{priorityCounts.priority || 0} Priority</span>
              <span className="tier-pill pill-standard">{priorityCounts.routine || 0} Routine</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Emergency Triage Cases */}
        <div className={`metric-card card-urgent ${urgentCount > 0 ? 'card-has-urgent' : ''}`}>
          <div className="metric-header">
            <span className="metric-label">Urgent (Tier 1) Cases</span>
            <span className="metric-icon" aria-hidden="true">🚨</span>
          </div>
          <div className="metric-body">
            <span className="metric-value metric-urgent-val">{urgentCount}</span>
            <span className="metric-unit">Immediate Attention</span>
          </div>
          <div className="metric-footer">
            <span className="metric-subtext">Critical symptom / severe pain</span>
          </div>
        </div>

        {/* Metric 3: Average Pain Score */}
        <div className="metric-card card-pain">
          <div className="metric-header">
            <span className="metric-label">Mean Patient Pain</span>
            <span className="metric-icon" aria-hidden="true">📊</span>
          </div>
          <div className="metric-body">
            <span className="metric-value">{averagePain}</span>
            <span className="metric-unit">Scale: 1 – 10</span>
          </div>
          <div className="metric-footer">
            <span className="metric-subtext">Clinical visual-analog index</span>
          </div>
        </div>

        {/* Metric 4: Daily Adherence Index */}
        <div className="metric-card card-adherence">
          <div className="metric-header">
            <span className="metric-label">Dose Adherence Rate</span>
            <span className="metric-icon" aria-hidden="true">💊</span>
          </div>
          <div className="metric-body">
            <div className="adherence-stat-row">
              <span className="metric-value">{adherenceStats.percentage}%</span>
              <span className="metric-ratio">({adherenceStats.takenCount}/{adherenceStats.totalCount} Doses)</span>
            </div>
            <progress
              className="adherence-progress-bar"
              value={adherenceStats.percentage}
              max="100"
              aria-label={`Daily medication adherence: ${adherenceStats.percentage} percent`}
            >
              {adherenceStats.percentage}%
            </progress>
          </div>
          <div className="metric-footer">
            <span className="metric-subtext">
              {allMedsCompleted ? 'All doses taken today' : `${adherenceStats.totalCount - adherenceStats.takenCount} dose(s) pending`}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
