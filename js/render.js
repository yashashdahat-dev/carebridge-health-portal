/**
 * CareBridge — Patient Triage & Multilingual Prescription Portal
 * Module: render.js (Dynamic HTML Rendering with Template Literals & Functional Methods)
 */

'use strict';

import { PRIORITY_TIERS } from './data.js';
import { mergeClinicalTags } from './clinical.js';

/**
 * Render an individual patient card in the live triage queue
 * Uses Object destructuring and template literals.
 * 
 * @param {Object} patient - Patient data object
 * @returns {string} HTML markup string
 */
export const renderPatientCard = (patient) => {
  const {
    id,
    name,
    mrn,
    age,
    stream,
    painLevel,
    symptoms = [],
    accommodations = [],
    priority = 'routine',
    arrivalTime = ''
  } = patient;

  const tier = PRIORITY_TIERS[priority] || PRIORITY_TIERS.routine;
  const { label: priorityLabel, badgeClass, dotClass, cardBorder } = tier;

  // Pain badge rating class
  const numericPain = Number(painLevel);
  const painTagClass = numericPain >= 7 ? 'pain-high' : (numericPain >= 4 ? 'pain-mod' : 'pain-low');

  // Map accommodations using Array.prototype.map()
  const accommodationsHtml = accommodations.map((acc) => {
    if (acc.includes('Wheelchair')) return `<span class="acc-tag" title="Wheelchair Access">♿ Wheelchair</span>`;
    if (acc.includes('Sign')) return `<span class="acc-tag" title="Sign Language Interpreter">🤟 Sign Lang</span>`;
    if (acc.includes('Large')) return `<span class="acc-tag" title="Large Print Summary">🖨️ Large Print</span>`;
    if (acc.includes('Audio')) return `<span class="acc-tag" title="Audio Prescription">🔊 Audio Rx</span>`;
    return `<span class="acc-tag">${acc}</span>`;
  }).join('');

  // Combine symptoms and stream tag with rest-parameter utility mergeClinicalTags()
  const combinedClinicalTags = mergeClinicalTags(stream, ...symptoms.slice(0, 2));
  const tagsHtml = combinedClinicalTags.map((tag) => `
    <span class="tag-symptom">${tag}</span>
  `).join('');

  return `
    <article class="patient-card ${cardBorder}" data-priority="${priority}" data-id="${id}" tabindex="0" aria-labelledby="${id}-name">
      <div class="patient-card-top">
        <span class="priority-pill ${badgeClass}">
          <span class="status-dot ${dotClass}" aria-hidden="true"></span>
          ${priorityLabel}
        </span>
        <div class="arrival-time">
          <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Arrived: <time datetime="${arrivalTime}">${arrivalTime}</time>
        </div>
      </div>

      <div class="patient-info">
        <h3 id="${id}-name" class="patient-name">${name}</h3>
        <p class="patient-meta">
          <span>MRN: <strong>${mrn}</strong></span> • 
          <span>Age: <strong>${age} Yrs</strong></span> • 
          <span>Stream: <strong>${stream}</strong></span>
        </p>
      </div>

      <div class="patient-clinical-tags">
        ${tagsHtml}
        <span class="tag-pain ${painTagClass}">Pain: ${painLevel}/10</span>
      </div>

      <div class="patient-accommodations-row" aria-label="Requested Accommodations">
        ${accommodationsHtml}
      </div>

      <div class="patient-card-actions">
        <button type="button" class="btn btn-sm btn-call" data-action="call-patient" data-id="${id}">
          <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          Call Patient
        </button>
        <button type="button" class="btn btn-sm btn-complete" data-action="complete-patient" data-id="${id}">
          Mark Examined
        </button>
      </div>
    </article>
  `;
};

/**
 * Render entire live patient queue using Array.prototype.map()
 * 
 * @param {Array<Object>} queue - Filtered patient list
 * @returns {string} Combined HTML string
 */
export const renderPatientQueueList = (queue = []) => {
  if (!queue.length) {
    return `
      <div class="empty-queue-message" role="status">
        <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 12h8"></path>
        </svg>
        <p>No patients currently matching the active queue filter or search criteria.</p>
      </div>
    `;
  }
  return queue.map((patient) => renderPatientCard(patient)).join('');
};

/**
 * Render individual prescription card with multilingual translations.
 * Uses Object destructuring and template literals.
 * 
 * @param {Object} prescription - Prescription record
 * @param {string} lang - 'en' | 'hi' | 'mr'
 * @returns {string} HTML markup string
 */
export const renderPrescriptionCard = (prescription, lang = 'en') => {
  const {
    id,
    name,
    dosage,
    time,
    rawTime = '',
    slot = 'Scheduled Dose',
    purpose,
    categoryTag = 'tag-cardio',
    taken = false,
    doctor = 'Attending Physician',
    caution = 'Follow Standard Clinical Precautions',
    instructions = {},
    translatedNames = {},
    translatedCategories = {}
  } = prescription;

  const displayName = (translatedNames && translatedNames[lang]) || name;
  const displayCategory = (translatedCategories && translatedCategories[lang]) || purpose;
  const instructionText = (instructions && instructions[lang]) || instructions?.en || 'Take as clinically directed by physician.';

  const langBadges = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' };
  const currentLangLabel = langBadges[lang] || 'English';

  const cardStatusClass = taken ? 'status-taken' : 'status-pending';
  const takenBtnClass = taken ? 'btn-toggle-taken taken' : 'btn-toggle-taken';
  const takenBtnText = taken ? 'Completed' : 'Mark as Taken';

  const statusPillHtml = taken
    ? `
      <span class="med-status-pill pill-taken">
        <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Taken Today
      </span>
    `
    : `
      <span class="med-status-pill pill-pending">
        Due Next
      </span>
    `;

  return `
    <article class="med-card ${cardStatusClass}" data-id="${id}" data-taken="${taken}" tabindex="0" aria-labelledby="${id}-title">
      <div class="med-card-header">
        <div class="med-identity">
          <span class="med-category-tag ${categoryTag}">${displayCategory}</span>
          <h3 id="${id}-title" class="med-name">${displayName}</h3>
          <span class="med-strength">${dosage} • ${slot}</span>
        </div>
        
        <div class="med-timing">
          <time datetime="${rawTime || time}" class="time-pill">
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${time}
          </time>
          ${statusPillHtml}
        </div>
      </div>

      <div class="med-instructions-box">
        <div class="instruction-header">
          <span class="instruction-title">Dose Instructions &amp; Safety Guidance:</span>
          <span class="instruction-lang-tag">${currentLangLabel}</span>
        </div>
        <p class="instruction-text">${instructionText}</p>
      </div>

      <div class="med-meta-row">
        <span class="med-doctor-tag">${doctor}</span>
        <span class="med-caution-tag">${caution}</span>
      </div>

      <div class="med-card-actions">
        <button type="button" class="btn btn-audio-card" data-action="speak-prescription" data-id="${id}" aria-label="Listen to ${displayName} instructions aloud">
          <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <span>Listen Aloud</span>
        </button>

        <button type="button" class="${takenBtnClass}" data-action="toggle-taken" data-id="${id}" aria-pressed="${taken}">
          <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>${takenBtnText}</span>
        </button>
      </div>
    </article>
  `;
};

/**
 * Render all prescription cards using Array.prototype.map()
 * 
 * @param {Array<Object>} prescriptions - Prescriptions list
 * @param {string} lang - 'en' | 'hi' | 'mr'
 * @returns {string} Combined HTML string
 */
export const renderPrescriptionsGrid = (prescriptions = [], lang = 'en') => {
  if (!prescriptions.length) {
    return `<p class="empty-prescriptions-message">No scheduled prescriptions logged for today.</p>`;
  }
  return prescriptions.map((rx) => renderPrescriptionCard(rx, lang)).join('');
};

/**
 * Render priority breakdown using Object.entries()
 * 
 * @param {Record<string, number>} counts - { urgent: X, priority: Y, routine: Z }
 * @returns {string} HTML string
 */
export const renderPriorityDistribution = (counts = {}) => {
  return Object.entries(counts).map(([tierKey, count]) => {
    const tier = PRIORITY_TIERS[tierKey] || { label: tierKey };
    return `
      <span class="tier-chip tier-${tierKey}">
        <strong>${count}</strong> ${tier.label.split(' ')[0]}
      </span>
    `;
  }).join(' • ');
};

/**
 * Render Emergency Alert Banner when Array.some() finds an urgent patient
 * 
 * @param {number} urgentCount - Number of waiting urgent patients
 * @returns {string} HTML markup string
 */
export const renderEmergencyAlertBanner = (urgentCount) => {
  if (urgentCount <= 0) return '';
  return `
    <div class="clinical-emergency-alert" role="alert" aria-live="assertive">
      <div class="alert-icon-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="alert-content">
        <h4 class="alert-title">Active Urgent Triage Alert</h4>
        <p class="alert-body">
          <strong>${urgentCount} patient${urgentCount > 1 ? 's' : ''}</strong> in the active queue flagged for immediate emergency clinical evaluation (Tier 1 Resuscitation / High Urgency).
        </p>
      </div>
    </div>
  `;
};

/**
 * Render All Daily Doses Completed confirmation state when Array.every() returns true
 * 
 * @returns {string} HTML markup string
 */
export const renderAllDosesCompletedBanner = () => {
  return `
    <div class="doses-complete-banner" role="status" aria-live="polite">
      <div class="complete-badge-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="complete-badge-text">
        <h4 class="complete-title">All Daily Doses Completed (100% Adherence)</h4>
        <p class="complete-sub">All scheduled pharmacotherapeutic doses for the current cycle have been successfully administered and verified.</p>
      </div>
    </div>
  `;
};

/**
 * Render Accessible Clinical Status Banner (for live alerts, warnings, and confirmations)
 * Target container must have aria-live="polite"
 * 
 * @param {string} message - Clinical user message
 * @param {'info' | 'warning' | 'error' | 'success'} type - Notification severity
 * @returns {string} HTML markup string
 */
export const renderStatusBanner = (message, type = 'info') => {
  if (!message) return '';

  const icons = {
    info: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    warning: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    error: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    success: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`
  };

  return `
    <div class="clinical-live-banner banner-${type}" role="status">
      <div class="banner-icon-wrap" aria-hidden="true">${icons[type] || icons.info}</div>
      <div class="banner-msg-content">${message}</div>
    </div>
  `;
};

/**
 * Manage loading indicator state on buttons and interactive triggers.
 * Guarantees visual clarity, disables button during pending async operations,
 * and resets cleanly in finally blocks.
 * 
 * @param {HTMLButtonElement|null} button - Target button element
 * @param {boolean} isLoading - Loading active flag
 * @param {string} [loadingText='Processing...'] - Accessible interim text
 */
export const setElementLoading = (button, isLoading, loadingText = 'Processing...') => {
  if (!button) return;

  if (isLoading) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.classList.add('btn-loading');
    button.innerHTML = `
      <span class="spinner-border" aria-hidden="true"></span>
      <span>${loadingText}</span>
    `;
  } else {
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.classList.remove('btn-loading');
  }
};

