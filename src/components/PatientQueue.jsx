/**
 * CareBridge — PatientQueue Component
 * File: src/components/PatientQueue.jsx
 * Styled via CSS Modules: PatientQueue.module.css
 */

import React, { useRef } from 'react';
import { PatientCard } from './PatientCard.jsx';
import styles from './PatientQueue.module.css';

export function PatientQueue({
  patients = [],
  activeFilter = 'all',
  searchQuery = '',
  onFilterChange,
  onSearchChange,
  onCallPatient,
  onCompletePatient
}) {
  const searchInputRef = useRef(null);

  const handleFocusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <section id="queue-section" className={styles.queueSection} aria-labelledby="queue-heading">
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 id="queue-heading" className={styles.sectionTitle}>
            Live Clinical Patient Queue
          </h2>
          <p className={styles.sectionSubtitle}>
            Real-time waiting queue prioritized by Emergency Severity Index (ESI)
          </p>
        </div>
        <div>
          <button
            type="button"
            className={styles.filterBtn}
            style={{ border: '1px solid #cbd5e1' }}
            onClick={handleFocusSearch}
            aria-label="Focus search patient input"
          >
            🔍 Focus Search
          </button>
        </div>
      </div>

      <div className={styles.queueControlsBar} role="region" aria-label="Queue Filter and Search Options">
        
        {/* Urgency Filter Tabs */}
        <div className={styles.filterTabsGroup} role="tablist" aria-label="Filter queue by priority tier">
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'all'}
            className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.active : ''}`}
            onClick={() => onFilterChange('all')}
          >
            All Patients
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'urgent'}
            className={`${styles.filterBtn} ${activeFilter === 'urgent' ? styles.active : ''}`}
            onClick={() => onFilterChange('urgent')}
          >
            Urgent (Tier 1)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'priority'}
            className={`${styles.filterBtn} ${activeFilter === 'priority' ? styles.active : ''}`}
            onClick={() => onFilterChange('priority')}
          >
            Priority (Tier 2)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'routine'}
            className={`${styles.filterBtn} ${activeFilter === 'routine' ? styles.active : ''}`}
            onClick={() => onFilterChange('routine')}
          >
            Routine (Tier 3)
          </button>
        </div>

        {/* Search Input with useRef */}
        <div className={styles.searchInputWrap}>
          <label htmlFor="queue-search" className="sr-only">Search patients</label>
          <input
            ref={searchInputRef}
            id="queue-search"
            type="search"
            className={styles.queueSearchInput}
            placeholder="Search patient, MRN, symptoms..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

      </div>

      <div className={styles.queueResultsMeta} role="status" aria-live="polite">
        Showing <strong>{patients.length}</strong> patient(s) in active view
      </div>

      <div className={styles.patientCardsContainer}>
        {patients.length === 0 ? (
          <div className={styles.emptyQueueState} role="status">
            <span className={styles.emptyIcon} aria-hidden="true">📋</span>
            <h3>No Patients Found</h3>
            <p>
              {searchQuery
                ? `No patients match the search query "${searchQuery}".`
                : `There are currently no patients waiting in the ${activeFilter.toUpperCase()} tier.`}
            </p>
          </div>
        ) : (
          patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onCallPatient={onCallPatient}
              onCompletePatient={onCompletePatient}
            />
          ))
        )}
      </div>
    </section>
  );
}
