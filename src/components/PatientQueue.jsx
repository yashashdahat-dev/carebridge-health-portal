/**
 * CareBridge — PatientQueue Component
 * File: src/components/PatientQueue.jsx
 * 
 * Demonstrates useRef for search input focus, filter controls,
 * and component composition using PatientCard.
 */

import React, { useRef } from 'react';
import { PatientCard } from './PatientCard.jsx';

export function PatientQueue({
  patients = [],
  activeFilter = 'all',
  searchQuery = '',
  onFilterChange,
  onSearchChange,
  onCallPatient,
  onCompletePatient
}) {
  // useRef implementation: Allows accessible focus jumping to the search input
  const searchInputRef = useRef(null);

  const handleFocusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <section id="queue-section" className="patient-queue-section" aria-labelledby="queue-heading">
      <div className="section-header-row">
        <div>
          <h2 id="queue-heading" className="section-title">
            Live Clinical Patient Queue
          </h2>
          <p className="section-subtitle">
            Real-time waiting queue prioritized by Emergency Severity Index (ESI)
          </p>
        </div>
        <div className="queue-quick-actions">
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={handleFocusSearch}
            aria-label="Focus search patient input"
          >
            🔍 Focus Search
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="queue-controls-bar" role="region" aria-label="Queue Filter and Search Options">
        
        {/* Urgency Filter Tabs */}
        <div className="filter-tabs-group" role="tablist" aria-label="Filter queue by priority tier">
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'all'}
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            All Patients
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'urgent'}
            className={`filter-btn ${activeFilter === 'urgent' ? 'active' : ''}`}
            onClick={() => onFilterChange('urgent')}
          >
            Urgent (Tier 1)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'priority'}
            className={`filter-btn ${activeFilter === 'priority' ? 'active' : ''}`}
            onClick={() => onFilterChange('priority')}
          >
            Priority (Tier 2)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'routine'}
            className={`filter-btn ${activeFilter === 'routine' ? 'active' : ''}`}
            onClick={() => onFilterChange('routine')}
          >
            Routine (Tier 3)
          </button>
        </div>

        {/* Search Input (with useRef) */}
        <div className="search-input-wrap">
          <label htmlFor="queue-search" className="sr-only">Search patients by name, MRN, or symptoms</label>
          <input
            ref={searchInputRef}
            id="queue-search"
            type="search"
            className="form-control queue-search-input"
            placeholder="Search patient, MRN, or symptoms..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

      </div>

      {/* Matching Results Counter */}
      <div className="queue-results-meta" role="status" aria-live="polite">
        Showing <strong>{patients.length}</strong> patient(s) in active view
      </div>

      {/* Patient Cards List */}
      <div className="patient-cards-container">
        {patients.length === 0 ? (
          <div className="empty-queue-state" role="status">
            <span className="empty-icon" aria-hidden="true">📋</span>
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
