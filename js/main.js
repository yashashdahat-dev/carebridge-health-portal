/**
 * CareBridge — Patient Triage & Multilingual Prescription Portal
 * Module: main.js (Application State Controller & Event Orchestrator)
 */

'use strict';

import {
  INITIAL_PATIENT_QUEUE,
  INITIAL_PRESCRIPTIONS,
  SAMPLE_PATIENTS,
  PRIORITY_TIERS
} from './data.js';

import {
  assessTriagePriority,
  calculatePriorityCounts,
  calculateAveragePainScore,
  calculateAdherenceStats,
  areAllMedicationsCompleted,
  hasUrgentPatients,
  validateRequiredFields,
  format12HourTime,
  validateTriageSubmission,
  validateMedicationSubmission,
  saveQueueToStorage,
  loadQueueFromStorage,
  savePrescriptionsToStorage,
  loadPrescriptionsFromStorage,
  fetchMedicationSafetyData
} from './clinical.js';

import {
  ValidationError,
  ApiError,
  StorageError,
  logDiagnostic
} from './errors.js';

import {
  speakClinicalText,
  stopSpeech,
  readAllPrescriptionsAloud
} from './speech.js';

import {
  renderPatientQueueList,
  renderPrescriptionsGrid,
  renderPriorityDistribution,
  renderEmergencyAlertBanner,
  renderAllDosesCompletedBanner,
  renderStatusBanner,
  setElementLoading
} from './render.js';

// ---------------------------------------------------------------------------
// 1. APPLICATION STATE (let & const ES6+ conventions)
// ---------------------------------------------------------------------------
let triageQueue = [...INITIAL_PATIENT_QUEUE];
let prescriptions = [...INITIAL_PRESCRIPTIONS];

let activeFilter = 'all'; // 'all' | 'urgent' | 'priority' | 'routine'
let searchQuery = '';
let currentLanguage = 'en'; // 'en' | 'hi' | 'mr'
const fontScaleSteps = ['sm', 'md', 'lg', 'xl'];
let activeFontIndex = 1; // default 'md'
let isWideSpacing = false;
let sampleIndex = 0;

// ---------------------------------------------------------------------------
// 2. DOM SELECTOR REGISTRY
// ---------------------------------------------------------------------------
const dom = {
  html: document.documentElement,
  liveAnnouncer: document.getElementById('live-announcer'),
  liveClock: document.getElementById('live-clock'),
  alertContainer: document.getElementById('emergency-alert-container'),

  // Accessibility Toolbar
  themeBtns: {
    light: document.getElementById('theme-light-btn'),
    dark: document.getElementById('theme-dark-btn'),
    hc: document.getElementById('theme-hc-btn')
  },
  fontBtns: {
    decrease: document.getElementById('font-decrease-btn'),
    reset: document.getElementById('font-reset-btn'),
    increase: document.getElementById('font-increase-btn')
  },
  wideSpacingBtn: document.getElementById('wide-spacing-btn'),
  langBtns: {
    en: document.getElementById('lang-en-btn'),
    hi: document.getElementById('lang-hi-btn'),
    mr: document.getElementById('lang-mr-btn')
  },
  globalSpeechBtn: document.getElementById('global-speech-btn'),
  stopSpeechBtn: document.getElementById('stop-speech-btn'),
  speechBtnText: document.getElementById('speech-btn-text'),
  speechBanner: document.getElementById('speech-status-banner'),
  speechReadingMsg: document.getElementById('speech-reading-message'),
  bannerStopSpeechBtn: document.getElementById('banner-stop-speech-btn'),

  // Summary Metrics
  statQueueCount: document.getElementById('stat-queue-count'),
  statUrgentCount: document.getElementById('stat-urgent-count'),
  statAvgPain: document.getElementById('stat-avg-pain'),
  statAdherencePct: document.getElementById('stat-adherence-pct'),
  statAdherenceRatio: document.getElementById('stat-adherence-ratio'),
  topAdherenceProgress: document.getElementById('top-adherence-progress'),
  statAccommodationsCount: document.getElementById('stat-accommodations-count'),

  // Triage Intake Form
  triageForm: document.getElementById('triage-intake-form'),
  patientName: document.getElementById('patient-name'),
  patientMrn: document.getElementById('patient-mrn'),
  patientAge: document.getElementById('patient-age'),
  patientTel: document.getElementById('patient-tel'),
  patientArrivalDate: document.getElementById('patient-arrival-date'),
  visitCategory: document.getElementById('visit-category'),
  painRange: document.getElementById('pain-range'),
  painOutput: document.getElementById('pain-output'),
  clinicalNotes: document.getElementById('clinical-notes'),
  btnPrefillTriage: document.getElementById('btn-prefill-triage'),
  btnResetTriage: document.getElementById('btn-reset-triage'),

  // Live Patient Queue
  queueSearchInput: document.getElementById('queue-search-input'),
  queueListContainer: document.getElementById('patient-queue-list'),
  queueCountBadge: document.getElementById('queue-count-badge'),
  filterBtns: document.querySelectorAll('.btn-filter'),
  filterCountAll: document.getElementById('filter-count-all'),
  priorityBreakdownRow: document.getElementById('priority-breakdown-row'),

  // Multilingual Prescriptions
  activeLangBadge: document.getElementById('active-lang-badge'),
  btnReadAllMeds: document.getElementById('btn-read-all-meds'),
  prescriptionsGrid: document.getElementById('prescriptions-grid'),
  dosesCompletedContainer: document.getElementById('doses-completed-container'),
  addMedForm: document.getElementById('add-medication-form'),
  medNameInput: document.getElementById('med-name'),
  medDosageInput: document.getElementById('med-dosage'),
  medTimeInput: document.getElementById('med-time'),
  medFreqSelect: document.getElementById('med-frequency'),
  medInstructionType: document.getElementById('med-instruction-type'),
  medDoctorInput: document.getElementById('med-doctor'),

  // Adherence Monitor Section
  mainAdherenceProgress: document.getElementById('main-adherence-progress'),
  adherenceScoreVal: document.getElementById('adherence-score-val'),
  adherenceRatioText: document.getElementById('adherence-ratio-text'),
  adherenceStatusMessage: document.getElementById('adherence-status-message'),

  // Accessible Live Status Notification Area (aria-live="polite")
  clinicalStatusBanner: document.getElementById('clinical-status-banner'),
  btnAddPrescription: document.getElementById('btn-add-prescription')
};

// ---------------------------------------------------------------------------
// 3. ACCESSIBLE ANNOUNCEMENT & SYSTEM CLOCK UTILITIES
// ---------------------------------------------------------------------------
let statusDismissTimer = null;

/**
 * Announce clinical message to assistive technologies (screen readers) via
 * aria-live="polite", and render an accessible visual status banner.
 * 
 * @param {string} message - Clinical message text
 * @param {'info' | 'warning' | 'error' | 'success'} type - Notification severity
 */
const announce = (message, type = 'info') => {
  if (!message) return;

  // 1. Screen Reader announcement
  if (dom.liveAnnouncer) {
    dom.liveAnnouncer.textContent = '';
    setTimeout(() => {
      dom.liveAnnouncer.textContent = message;
    }, 50);
  }

  // 2. Visual accessible status banner
  if (dom.clinicalStatusBanner) {
    dom.clinicalStatusBanner.innerHTML = renderStatusBanner(message, type);

    // Auto-dismiss transient notices, keep error notices visible until user action
    clearTimeout(statusDismissTimer);
    if (type !== 'error') {
      statusDismissTimer = setTimeout(() => {
        if (dom.clinicalStatusBanner) {
          dom.clinicalStatusBanner.innerHTML = '';
        }
      }, 7000);
    }
  }
};

const updateClock = () => {
  if (!dom.liveClock) return;
  const now = new Date();
  const options = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  dom.liveClock.textContent = `${now.toLocaleDateString('en-US', options)} IST`;
  dom.liveClock.setAttribute('datetime', now.toISOString());
};

// ---------------------------------------------------------------------------
// 4. METRICS & ANALYTICS CONTROLLER (Functional reduce & Object.entries)
// ---------------------------------------------------------------------------
const updateClinicalAnalytics = () => {
  // 1. Triage priority tier breakdown via reduce()
  const priorityCounts = calculatePriorityCounts(triageQueue);
  const totalInQueue = triageQueue.length;

  // 2. Average pain score via reduce()
  const avgPain = calculateAveragePainScore(triageQueue);

  // 3. Medication adherence stats via reduce()
  const { takenCount, totalCount, percentage } = calculateAdherenceStats(prescriptions);

  // 4. Check if any patient is Urgent via some()
  const isUrgentActive = hasUrgentPatients(triageQueue);

  // 5. Check if all scheduled doses completed via every()
  const isAllMedicationTaken = areAllMedicationsCompleted(prescriptions);

  // Update DOM Top Summary Cards
  if (dom.statQueueCount) dom.statQueueCount.textContent = totalInQueue;
  if (dom.queueCountBadge) dom.queueCountBadge.textContent = totalInQueue;
  if (dom.filterCountAll) dom.filterCountAll.textContent = totalInQueue;

  if (dom.statUrgentCount) {
    dom.statUrgentCount.textContent = `${priorityCounts.urgent} Urgent • ${priorityCounts.priority} Priority`;
  }

  if (dom.statAvgPain) {
    dom.statAvgPain.textContent = avgPain;
  }

  // Update Priority Distribution using Object.entries()
  if (dom.priorityBreakdownRow) {
    dom.priorityBreakdownRow.innerHTML = renderPriorityDistribution(priorityCounts);
  }

  // Render Emergency Alert Banner using some()
  if (dom.alertContainer) {
    dom.alertContainer.innerHTML = isUrgentActive
      ? renderEmergencyAlertBanner(priorityCounts.urgent)
      : '';
  }

  // Update Medication Adherence Progress
  if (dom.statAdherencePct) dom.statAdherencePct.textContent = `${percentage}%`;
  if (dom.statAdherenceRatio) dom.statAdherenceRatio.textContent = `${takenCount} of ${totalCount} doses taken`;
  if (dom.topAdherenceProgress) {
    dom.topAdherenceProgress.value = percentage;
    dom.topAdherenceProgress.textContent = `${percentage}%`;
  }
  if (dom.mainAdherenceProgress) {
    dom.mainAdherenceProgress.value = percentage;
    dom.mainAdherenceProgress.textContent = `${percentage}%`;
  }
  if (dom.adherenceScoreVal) dom.adherenceScoreVal.textContent = `${percentage}%`;
  if (dom.adherenceRatioText) dom.adherenceRatioText.textContent = `${takenCount} of ${totalCount} Doses Logged`;

  // Render All Doses Completed Banner using every()
  if (dom.dosesCompletedContainer) {
    dom.dosesCompletedContainer.innerHTML = isAllMedicationTaken
      ? renderAllDosesCompletedBanner()
      : '';
  }

  // Dynamic feedback message
  if (dom.adherenceStatusMessage) {
    if (percentage === 100) {
      dom.adherenceStatusMessage.textContent = 'Excellent Clinical Compliance: 100% of all daily scheduled doses completed and verified.';
    } else if (percentage >= 70) {
      dom.adherenceStatusMessage.textContent = `Optimal Adherence Recorded: ${percentage}% completed (${takenCount}/${totalCount} doses logged). Treatment regimen on track.`;
    } else if (percentage >= 40) {
      dom.adherenceStatusMessage.textContent = `Moderate Adherence: ${percentage}% completed (${takenCount}/${totalCount} doses logged). Remaining doses scheduled for today.`;
    } else {
      dom.adherenceStatusMessage.textContent = `Attention Required: Only ${percentage}% adherence logged today. Follow up with patient for dose administration.`;
    }
  }

  // Active Assistive Accommodations Count via flatMap & filter
  if (dom.statAccommodationsCount) {
    const totalAccommodations = triageQueue
      .map(({ accommodations }) => accommodations || [])
      .reduce((sum, list) => sum + list.length, 0);
    dom.statAccommodationsCount.textContent = totalAccommodations;
  }
};

// ---------------------------------------------------------------------------
// 5. PATIENT QUEUE CONTROLLER (Functional filter & find)
// ---------------------------------------------------------------------------
const getFilteredQueue = () => {
  const query = searchQuery.trim().toLowerCase();

  // 1. Filter by urgency tier with Array.prototype.filter()
  const tierFiltered = triageQueue.filter(({ priority }) => {
    return activeFilter === 'all' || priority === activeFilter;
  });

  // 2. Filter by search query with Array.prototype.filter()
  if (!query) {
    return tierFiltered;
  }

  return tierFiltered.filter(({ name, mrn, stream, symptoms = [] }) => {
    const matchName = name.toLowerCase().includes(query);
    const matchMrn = mrn.toLowerCase().includes(query);
    const matchStream = stream.toLowerCase().includes(query);
    const matchSymptoms = symptoms.some((s) => s.toLowerCase().includes(query));
    return matchName || matchMrn || matchStream || matchSymptoms;
  });
};

const renderQueue = () => {
  if (!dom.queueListContainer) return;
  // Clone array before sorting using spread operator
  const filtered = getFilteredQueue();
  const sortedQueue = [...filtered].sort((a, b) => {
    const rank = { urgent: 1, priority: 2, routine: 3 };
    return rank[a.priority] - rank[b.priority];
  });

  dom.queueListContainer.innerHTML = renderPatientQueueList(sortedQueue);
};

// ---------------------------------------------------------------------------
// 6. PRESCRIPTION RENDERER & INTERACTION CONTROLLER (Functional map)
// ---------------------------------------------------------------------------
const renderPrescriptions = () => {
  if (!dom.prescriptionsGrid) return;
  dom.prescriptionsGrid.innerHTML = renderPrescriptionsGrid(prescriptions, currentLanguage);
};

const toggleMedicationTaken = (targetId) => {
  try {
    // Immutable state update using map() and object spread
    prescriptions = prescriptions.map((rx) => {
      if (rx.id === targetId) {
        return { ...rx, taken: !rx.taken };
      }
      return rx;
    });

    // Safely persist to storage
    try {
      savePrescriptionsToStorage(prescriptions);
    } catch (storageErr) {
      logDiagnostic(storageErr, { action: 'toggleMedicationTaken:storage' });
    }

    // Find updated prescription record using find()
    const updatedRx = prescriptions.find(({ id }) => id === targetId);
    const { name, taken } = updatedRx || { name: 'Medication', taken: false };

    renderPrescriptions();
    updateClinicalAnalytics();

    announce(`${name} marked as ${taken ? 'Completed' : 'Pending'}. Adherence metrics recalculated.`, 'info');
  } catch (err) {
    logDiagnostic(err, { action: 'toggleMedicationTaken', targetId });
    announce('Could not update medication status.', 'warning');
  }
};

// ---------------------------------------------------------------------------
// 7. PATIENT TRIAGE INTAKE FORM (Spread operator & destructuring)
// ---------------------------------------------------------------------------
const updatePainScaleLiveOutput = (val) => {
  if (!dom.painOutput) return;
  const score = Number(val);

  let text = '';
  let badgeClass = '';

  if (score <= 3) {
    text = `${score} — Mild Discomfort (Routine Tier 3)`;
    badgeClass = 'pain-mild';
  } else if (score <= 6) {
    text = `${score} — Moderate Discomfort (Priority Tier 2)`;
    badgeClass = 'pain-moderate';
  } else {
    text = `${score} — Severe Acute Pain (Urgent Tier 1)`;
    badgeClass = 'pain-severe';
  }

  dom.painOutput.textContent = text;
  dom.painOutput.className = `pain-output-badge ${badgeClass}`;

  // Update scale tick indicators
  const ticks = document.querySelectorAll('.pain-meter-scale .tick');
  ticks.forEach((tick, idx) => {
    const num = idx + 1;
    tick.classList.toggle('active', num <= score);
    tick.classList.toggle('current', num === score);
  });
};

const autoFillSamplePatient = () => {
  const sample = SAMPLE_PATIENTS[sampleIndex % SAMPLE_PATIENTS.length];
  sampleIndex++;

  const { name, mrn, age, tel, stream, painLevel, symptoms, accommodations, notes } = sample;

  if (dom.patientName) dom.patientName.value = name;
  if (dom.patientMrn) dom.patientMrn.value = mrn;
  if (dom.patientAge) dom.patientAge.value = age;
  if (dom.patientTel) dom.patientTel.value = tel;
  if (dom.visitCategory) dom.visitCategory.value = stream;
  if (dom.painRange) {
    dom.painRange.value = painLevel;
    updatePainScaleLiveOutput(painLevel);
  }
  if (dom.clinicalNotes) dom.clinicalNotes.value = notes;

  // Set symptom checkboxes
  document.querySelectorAll('input[name="symptoms"]').forEach((cb) => {
    cb.checked = symptoms.includes(cb.value);
  });

  // Set accommodation checkboxes
  document.querySelectorAll('input[name="accommodations"]').forEach((cb) => {
    cb.checked = accommodations.includes(cb.value);
  });

  // Clear any existing validation highlights
  dom.triageForm?.querySelectorAll('.form-control').forEach((el) => {
    el.setAttribute('aria-invalid', 'false');
  });
  dom.triageForm?.querySelectorAll('.form-error').forEach((el) => {
    el.classList.add('hidden');
  });

  announce(`Triage form auto-filled with sample patient: ${name}, Age ${age}. Ready for submission.`);
};

const handleTriageFormSubmit = (e) => {
  e.preventDefault();

  const submitBtn = dom.triageForm?.querySelector('button[type="submit"]');
  setElementLoading(submitBtn, true, 'Evaluating & Enqueuing...');

  try {
    const requiredInputs = [
      dom.patientName,
      dom.patientMrn,
      dom.patientAge,
      dom.patientTel,
      dom.patientArrivalDate
    ].filter(Boolean);

    // Validate required inputs using Array.prototype.every()
    const isAllValid = validateRequiredFields(requiredInputs);

    if (!isAllValid) {
      requiredInputs.forEach((input) => {
        const isBlank = !input.value || !input.value.trim().length;
        input.setAttribute('aria-invalid', isBlank ? 'true' : 'false');
        const errEl = document.getElementById(`${input.id.replace('patient-', '')}-error`);
        if (errEl) errEl.classList.toggle('hidden', !isBlank);
      });

      const firstInvalid = dom.triageForm.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      throw new ValidationError(
        firstInvalid?.id || 'triageForm',
        'Mandatory triage fields are blank.',
        'Triage intake form has missing mandatory fields. Please check highlighted inputs.'
      );
    }

    // Collect and destructure form data
    const name = dom.patientName.value.trim();
    const mrn = dom.patientMrn.value.trim();
    const age = Number(dom.patientAge.value);
    const tel = dom.patientTel.value.trim();
    const stream = dom.visitCategory.value;
    const painLevel = Number(dom.painRange.value);
    const notes = dom.clinicalNotes?.value.trim() || 'No additional remarks.';

    const symptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(({ value }) => value);
    const accommodations = Array.from(document.querySelectorAll('input[name="accommodations"]:checked')).map(({ value }) => value);

    // Validate biological and clinical boundaries (throws ValidationError if invalid)
    validateTriageSubmission({ name, mrn, age, painLevel, stream });

    // Assess priority via functional clinical priority engine (uses some())
    const priority = assessTriagePriority(painLevel, symptoms);

    const now = new Date();
    const arrivalTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newPatientId = `P-${Date.now().toString().slice(-4)}`;

    const newPatient = {
      id: newPatientId,
      name,
      mrn,
      age,
      tel,
      stream,
      painLevel,
      symptoms,
      accommodations,
      priority,
      arrivalTime,
      notes
    };

    // Immutable queue update using the spread operator ([...triageQueue, newPatient])
    triageQueue = [newPatient, ...triageQueue];

    // Persist to LocalStorage with custom StorageError protection
    try {
      saveQueueToStorage(triageQueue);
    } catch (storageErr) {
      // Patient is still stored in memory for the active shift
      announce(`${storageErr.userMessage} (Patient enqueued in active memory).`, 'warning');
    }

    // Reset form
    dom.triageForm.reset();
    if (dom.patientArrivalDate) {
      dom.patientArrivalDate.value = new Date().toISOString().split('T')[0];
    }
    updatePainScaleLiveOutput(4);

    // Re-render queue and analytics
    renderQueue();
    updateClinicalAnalytics();

    const priorityMeta = PRIORITY_TIERS[priority] || { label: priority };
    announce(`Patient ${name} successfully enqueued under ${priorityMeta.label}.`, 'success');

    // Focus newly added card
    const newCard = document.querySelector(`[data-id="${newPatientId}"]`);
    newCard?.focus();
  } catch (err) {
    if (err instanceof ValidationError) {
      announce(err.userMessage, 'warning');
      const target = document.getElementById(err.field);
      if (target) {
        target.setAttribute('aria-invalid', 'true');
        target.focus();
      }
    } else if (err instanceof StorageError) {
      announce(err.userMessage, 'error');
    } else {
      announce('An unexpected error occurred while processing patient triage intake.', 'error');
    }
    logDiagnostic(err, { operation: 'handleTriageFormSubmit' });
  } finally {
    // Guaranteed loading state reset
    setElementLoading(submitBtn, false);
  }
};

// ---------------------------------------------------------------------------
// 8. ADD MEDICATION FORM (Spread operator & multilingual setup)
// ---------------------------------------------------------------------------
const handleAddMedicationSubmit = async (e) => {
  e.preventDefault();

  const submitBtn = dom.btnAddPrescription || dom.addMedForm?.querySelector('button[type="submit"]');
  setElementLoading(submitBtn, true, 'Verifying & Scheduling...');

  try {
    const name = dom.medNameInput.value.trim();
    const dosage = dom.medDosageInput.value.trim();
    const rawTime = dom.medTimeInput.value;
    const freq = dom.medFreqSelect.value;
    const foodType = dom.medInstructionType.value;
    const doctor = dom.medDoctorInput.value.trim() || 'Dr. S. K. Rao, MD';

    // Validate medication form data (throws ValidationError if missing)
    validateMedicationSubmission({ name, dosage, time: rawTime });

    // Asynchronous clinical database interaction with Fetch API & ApiError handling
    try {
      const safetyData = await fetchMedicationSafetyData(name);
      if (safetyData?.warnings) {
        console.info(`[Formulary Warning Check] ${name}: ${safetyData.warnings.slice(0, 80)}...`);
      }
    } catch (apiErr) {
      if (apiErr instanceof ApiError) {
        // Display user-friendly notification without blocking local patient scheduling
        announce(`Clinical Note: ${apiErr.userMessage}`, 'warning');
      }
      logDiagnostic(apiErr, { operation: 'handleAddMedicationSubmit:fetchSafety' });
    }

    const formattedTime = format12HourTime(rawTime);
    const newMedId = `med-${Date.now().toString().slice(-4)}`;

    const foodPhrases = {
      'after-food': {
        en: 'immediately after meals with water',
        hi: 'भोजन के तुरंत बाद पानी के साथ',
        mr: 'जेवणानंतर लगेच पाण्यासोबत'
      },
      'before-food': {
        en: 'on an empty stomach (30 minutes before food)',
        hi: 'खाली पेट (भोजन से 30 मिनट पहले)',
        mr: 'रिकाम्या पोटी (जेवणापूर्वी 30 मिनिटे)'
      },
      'with-food': {
        en: 'with meals to prevent stomach irritation',
        hi: 'पेट की जलन से बचने के लिए भोजन के साथ',
        mr: 'पोटाचा त्रास टाळण्यासाठी जेवणासोबत'
      },
      'independent': {
        en: 'with or without food as comfortable',
        hi: 'भोजन के साथ या बिना भोजन के',
        mr: 'जेवणासोबत किंवा जेवणाशिवाय'
      }
    }[foodType] || { en: 'with water', hi: 'पानी के साथ', mr: 'पाण्यासोबत' };

    const newMedication = {
      id: newMedId,
      name,
      dosage,
      time: formattedTime,
      rawTime,
      slot: freq,
      purpose: 'Prescribed Regimen',
      categoryTag: 'tag-cardio',
      taken: false,
      doctor,
      caution: 'Verify with Clinical Pharmacist',
      instructions: {
        en: `Take ${dosage} ${foodPhrases.en} (${freq}). Complete the scheduled therapeutic cycle.`,
        hi: `${dosage} खुराक ${foodPhrases.hi} लें (${freq})। चिकित्सक द्वारा निर्देशित चक्र पूरा करें।`,
        mr: `${dosage} डोस ${foodPhrases.mr} घ्या (${freq})। डॉक्टरांनी सांगितलेला उपचार पूर्ण करा.`
      },
      translatedNames: {
        en: name,
        hi: name,
        mr: name
      },
      translatedCategories: {
        en: 'Prescribed Regimen',
        hi: 'चिकित्सीय पर्ची (Prescribed Regimen)',
        mr: 'वैद्यकीय उपचार (Prescribed Regimen)'
      }
    };

    // Immutable array update using the spread operator ([...prescriptions, newMedication])
    prescriptions = [...prescriptions, newMedication];

    // Persist to LocalStorage with StorageError protection
    try {
      savePrescriptionsToStorage(prescriptions);
    } catch (storageErr) {
      announce(`${storageErr.userMessage} (Prescription kept in active session).`, 'warning');
    }

    dom.addMedForm.reset();
    renderPrescriptions();
    updateClinicalAnalytics();

    announce(`Prescription for ${name} scheduled for ${formattedTime} added to patient regimen.`, 'success');
  } catch (err) {
    if (err instanceof ValidationError) {
      announce(err.userMessage, 'warning');
      const target = document.getElementById(err.field);
      if (target) {
        target.setAttribute('aria-invalid', 'true');
        target.focus();
      }
    } else if (err instanceof StorageError) {
      announce(err.userMessage, 'error');
    } else {
      announce('An unexpected issue occurred while scheduling the prescription.', 'error');
    }
    logDiagnostic(err, { operation: 'handleAddMedicationSubmit' });
  } finally {
    // Guaranteed loading reset
    setElementLoading(submitBtn, false);
  }
};

// ---------------------------------------------------------------------------
// 9. ACCESSIBILITY, THEME & FONT CONTROLLERS
// ---------------------------------------------------------------------------
const setTheme = (themeName) => {
  dom.html.setAttribute('data-theme', themeName);
  localStorage.setItem('carebridge_theme', themeName);

  Object.entries(dom.themeBtns).forEach(([key, btn]) => {
    if (btn) {
      const isMatch = btn.getAttribute('data-theme-val') === themeName;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
    }
  });

  const labels = {
    light: 'Standard Light Clinical Mode',
    dark: 'Dark Clinical Contrast Mode',
    'high-contrast': 'WCAG AAA High-Contrast Yellow on Black'
  };
  announce(`Theme switched to ${labels[themeName] || themeName}.`);
};

const setFontSize = (stepIndex) => {
  activeFontIndex = Math.max(0, Math.min(fontScaleSteps.length - 1, stepIndex));
  const stepName = fontScaleSteps[activeFontIndex];
  dom.html.setAttribute('data-font-size', stepName);
  localStorage.setItem('carebridge_font_scale', stepName);

  dom.fontBtns.decrease?.classList.toggle('active', activeFontIndex === 0);
  dom.fontBtns.reset?.classList.toggle('active', activeFontIndex === 1);
  dom.fontBtns.increase?.classList.toggle('active', activeFontIndex >= 2);

  const scaleDescriptions = {
    sm: '88% Compact',
    md: '100% Standard',
    lg: '118% Large Text',
    xl: '135% Extra Large Text'
  };
  announce(`Text size adjusted to ${scaleDescriptions[stepName]}.`);
};

const toggleWideTextSpacing = () => {
  isWideSpacing = !isWideSpacing;
  if (isWideSpacing) {
    dom.html.setAttribute('data-text-spacing', 'wide');
    dom.wideSpacingBtn?.setAttribute('aria-pressed', 'true');
    announce('Wide letter, word, and line spacing enabled for enhanced visual accessibility.');
  } else {
    dom.html.removeAttribute('data-text-spacing');
    dom.wideSpacingBtn?.setAttribute('aria-pressed', 'false');
    announce('Standard text spacing restored.');
  }
};

const setLanguage = (langCode) => {
  if (!['en', 'hi', 'mr'].includes(langCode)) return;
  currentLanguage = langCode;

  Object.entries(dom.langBtns).forEach(([code, btn]) => {
    if (btn) {
      const isMatch = code === langCode;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
    }
  });

  const langDisplay = {
    en: 'English (EN)',
    hi: 'हिन्दी - Hindi (HI)',
    mr: 'मराठी - Marathi (MR)'
  };

  if (dom.activeLangBadge) {
    dom.activeLangBadge.textContent = langDisplay[langCode];
  }

  // Re-render prescriptions with new language
  renderPrescriptions();

  announce(`Prescription language switched to ${langDisplay[langCode]}. All instruction texts updated.`);
};

// ---------------------------------------------------------------------------
// 10. AUDIO & VOICE READOUT HANDLERS (Functional find & speech synthesis)
// ---------------------------------------------------------------------------
const showSpeechActiveBanner = (message) => {
  if (dom.speechBanner && dom.speechReadingMsg) {
    dom.speechReadingMsg.textContent = message;
    dom.speechBanner.classList.remove('hidden');
  }
  if (dom.stopSpeechBtn) dom.stopSpeechBtn.classList.remove('hidden');
  if (dom.speechBtnText) dom.speechBtnText.textContent = 'Audio Active...';
};

const hideSpeechActiveBanner = () => {
  if (dom.speechBanner) dom.speechBanner.classList.add('hidden');
  if (dom.stopSpeechBtn) dom.stopSpeechBtn.classList.add('hidden');
  if (dom.speechBtnText) dom.speechBtnText.textContent = 'Listen to Prescriptions';
};

const handleCallPatient = (patientId) => {
  // Find patient record using Array.prototype.find()
  const patient = triageQueue.find(({ id }) => id === patientId);
  if (!patient) return;

  const { name, stream } = patient;
  const announcement = `Paging patient ${name} to Ambulatory Care Unit Station 4B for ${stream} evaluation.`;

  showSpeechActiveBanner(`Calling: ${name} to Station 4B`);
  speakClinicalText({
    text: announcement,
    lang: 'en',
    onEnd: hideSpeechActiveBanner,
    onError: hideSpeechActiveBanner
  });
  announce(announcement);
};

const handleCompletePatient = (patientId) => {
  try {
    // Find patient record using Array.prototype.find()
    const patient = triageQueue.find(({ id }) => id === patientId);
    const patientName = patient?.name || 'Patient';

    // Immutable removal using Array.prototype.filter()
    triageQueue = triageQueue.filter(({ id }) => id !== patientId);

    // Persist removal to storage
    try {
      saveQueueToStorage(triageQueue);
    } catch (storageErr) {
      logDiagnostic(storageErr, { action: 'handleCompletePatient:storage' });
    }

    renderQueue();
    updateClinicalAnalytics();

    announce(`Patient ${patientName} marked as examined and discharged from the live clinical queue.`, 'info');
  } catch (err) {
    logDiagnostic(err, { action: 'handleCompletePatient', patientId });
    announce('Could not complete patient triage discharge.', 'warning');
  }
};

const handleReadSinglePrescription = (medId) => {
  // Find prescription using Array.prototype.find()
  const rx = prescriptions.find(({ id }) => id === medId);
  if (!rx) return;

  const { name, translatedNames, dosage, time, instructions, caution } = rx;
  const displayName = (translatedNames && translatedNames[currentLanguage]) || name;
  const instructionText = (instructions && instructions[currentLanguage]) || instructions?.en || '';

  let speechText = '';
  if (currentLanguage === 'hi') {
    speechText = `दवा: ${displayName}। खुराक: ${dosage}। समय: ${time}। निर्देश: ${instructionText}। सावधानी: ${caution}।`;
  } else if (currentLanguage === 'mr') {
    speechText = `औषध: ${displayName}। डोस: ${dosage}। वेळ: ${time}। सूचना: ${instructionText}। काळजी: ${caution}।`;
  } else {
    speechText = `Prescription: ${displayName}. Dosage: ${dosage}. Scheduled for: ${time}. Clinical instruction: ${instructionText}. Precaution: ${caution}.`;
  }

  showSpeechActiveBanner(`Reading: ${displayName} (${currentLanguage.toUpperCase()})`);
  speakClinicalText({
    text: speechText,
    lang: currentLanguage,
    onEnd: hideSpeechActiveBanner,
    onError: hideSpeechActiveBanner
  });
};

const handleReadAllPrescriptions = () => {
  showSpeechActiveBanner(`Reading scheduled prescriptions (${currentLanguage.toUpperCase()})...`);
  readAllPrescriptionsAloud(prescriptions, currentLanguage, {
    onNext: (step, total, medName) => {
      showSpeechActiveBanner(`Reading ${step} of ${total}: ${medName}`);
    },
    onComplete: () => {
      hideSpeechActiveBanner();
      announce('Completed reading daily scheduled medications.');
    },
    onStop: hideSpeechActiveBanner
  });
};

// ---------------------------------------------------------------------------
// 11. EVENT LISTENERS INITIALIZATION (Arrow Functions)
// ---------------------------------------------------------------------------
const initEventListeners = () => {
  // Theme Buttons
  dom.themeBtns.light?.addEventListener('click', () => setTheme('light'));
  dom.themeBtns.dark?.addEventListener('click', () => setTheme('dark'));
  dom.themeBtns.hc?.addEventListener('click', () => setTheme('high-contrast'));

  // Font Scaling Buttons
  dom.fontBtns.decrease?.addEventListener('click', () => setFontSize(activeFontIndex - 1));
  dom.fontBtns.reset?.addEventListener('click', () => setFontSize(1));
  dom.fontBtns.increase?.addEventListener('click', () => setFontSize(activeFontIndex + 1));

  // Wide Spacing Toggle
  dom.wideSpacingBtn?.addEventListener('click', toggleWideTextSpacing);

  // Language Buttons
  dom.langBtns.en?.addEventListener('click', () => setLanguage('en'));
  dom.langBtns.hi?.addEventListener('click', () => setLanguage('hi'));
  dom.langBtns.mr?.addEventListener('click', () => setLanguage('mr'));

  // Global Speech Buttons
  dom.globalSpeechBtn?.addEventListener('click', handleReadAllPrescriptions);
  dom.btnReadAllMeds?.addEventListener('click', handleReadAllPrescriptions);
  dom.stopSpeechBtn?.addEventListener('click', () => stopSpeech(hideSpeechActiveBanner));
  dom.bannerStopSpeechBtn?.addEventListener('click', () => stopSpeech(hideSpeechActiveBanner));

  // Pain Slider
  dom.painRange?.addEventListener('input', (e) => {
    updatePainScaleLiveOutput(e.target.value);
  });

  // Triage Form Actions
  dom.btnPrefillTriage?.addEventListener('click', autoFillSamplePatient);
  dom.btnResetTriage?.addEventListener('click', () => {
    dom.triageForm?.reset();
    setTimeout(() => {
      updatePainScaleLiveOutput(4);
      announce('Triage form reset.');
    }, 50);
  });
  dom.triageForm?.addEventListener('submit', handleTriageFormSubmit);

  // Live Queue Filter Tabs
  dom.filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.getAttribute('data-filter') || 'all';
      dom.filterBtns.forEach((b) => b.classList.toggle('active', b === btn));
      renderQueue();
      announce(`Patient queue filtered by ${activeFilter.toUpperCase()} urgency tier.`);
    });
  });

  // Live Queue Search Input
  dom.queueSearchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderQueue();
  });

  // Event Delegation for Patient Queue Actions
  dom.queueListContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const patientId = btn.getAttribute('data-id');

    if (action === 'call-patient') {
      handleCallPatient(patientId);
    } else if (action === 'complete-patient') {
      handleCompletePatient(patientId);
    }
  });

  // Add Medication Form
  dom.addMedForm?.addEventListener('submit', handleAddMedicationSubmit);

  // Event Delegation for Prescription Card Actions
  dom.prescriptionsGrid?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const medId = btn.getAttribute('data-id');

    if (action === 'speak-prescription') {
      handleReadSinglePrescription(medId);
    } else if (action === 'toggle-taken') {
      toggleMedicationTaken(medId);
    }
  });
};

// ---------------------------------------------------------------------------
// 12. INITIAL BOOTSTRAP & ERROR BOUNDARIES
// ---------------------------------------------------------------------------
const bootstrap = () => {
  // 1. Safely restore persistent clinical data from LocalStorage
  try {
    triageQueue = loadQueueFromStorage(INITIAL_PATIENT_QUEUE);
  } catch (err) {
    logDiagnostic(err, { phase: 'loadQueueFromStorage' });
    triageQueue = [...INITIAL_PATIENT_QUEUE];
  }

  try {
    prescriptions = loadPrescriptionsFromStorage(INITIAL_PRESCRIPTIONS);
  } catch (err) {
    logDiagnostic(err, { phase: 'loadPrescriptionsFromStorage' });
    prescriptions = [...INITIAL_PRESCRIPTIONS];
  }

  // 2. Restore saved theme and font size with try/catch
  try {
    const savedTheme = localStorage.getItem('carebridge_theme') || 'light';
    setTheme(savedTheme);

    const savedScale = localStorage.getItem('carebridge_font_scale') || 'md';
    const scaleIdx = fontScaleSteps.indexOf(savedScale);
    setFontSize(scaleIdx !== -1 ? scaleIdx : 1);
  } catch (err) {
    logDiagnostic(err, { phase: 'restoreSettings' });
  }

  // 3. Initialize clock and default arrival date
  updateClock();
  setInterval(updateClock, 1000);

  if (dom.patientArrivalDate) {
    dom.patientArrivalDate.value = new Date().toISOString().split('T')[0];
  }

  updatePainScaleLiveOutput(dom.painRange?.value || 4);

  // 4. Initial functional rendering
  renderQueue();
  renderPrescriptions();
  updateClinicalAnalytics();

  // 5. Attach all arrow-function event listeners
  initEventListeners();

  announce('CareBridge Clinical Portal loaded. Ready for patient triage and multilingual prescription management.', 'success');
};

// Global unhandled promise rejection error boundary
window.addEventListener('unhandledrejection', (event) => {
  logDiagnostic(event.reason || new Error('Unhandled Promise Rejection'), { source: 'window.unhandledrejection' });
  announce('A background clinical data sync encountered an issue. Portal functions remain operational.', 'warning');
  event.preventDefault(); // Prevents silent crashes while logging safely
});

// Global runtime error boundary
window.addEventListener('error', (event) => {
  logDiagnostic(event.error || new Error(event.message), { source: 'window.error' });
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
