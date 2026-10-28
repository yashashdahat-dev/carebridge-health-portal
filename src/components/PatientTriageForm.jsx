/**
 * CareBridge — PatientTriageForm Component
 * File: src/components/PatientTriageForm.jsx
 * Styled via CSS Modules: PatientTriageForm.module.css
 */

import React, { useState, useRef } from 'react';
import { CRITICAL_SYMPTOMS, SAMPLE_PATIENTS } from '../data/initialData.js';
import { assessTriagePriority } from '../utils/clinicalAnalytics.js';
import styles from './PatientTriageForm.module.css';

const AVAILABLE_SYMPTOMS = [
  'Chest Tightness / Dyspnea',
  'Severe Migraine / Vertigo',
  'Musculoskeletal Trauma',
  'High Fever (> 101°F)',
  'Acute Productive Cough',
  'Nausea / GI Distress',
  'Hypoglycemic Episode',
  'Skin Rash / Allergic Reaction'
];

const AVAILABLE_ACCOMMODATIONS = [
  'Wheelchair Access',
  'Audio Prescription',
  'Sign Language Interpreter',
  'Large-Print Summary',
  'Language Translator'
];

export function PatientTriageForm({ onAddPatient, onAnnounce }) {
  const [formData, setFormData] = useState({
    name: '',
    mrn: '',
    age: '',
    tel: '',
    arrivalDate: new Date().toISOString().split('T')[0],
    stream: 'Emergency Medicine',
    painLevel: 4,
    symptoms: [],
    accommodations: [],
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);

  // useRef hooks for focusing first invalid field on submission failure
  const nameRef = useRef(null);
  const mrnRef = useRef(null);
  const ageRef = useRef(null);
  const streamRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSymptomToggle = (symptom) => {
    setFormData((prev) => {
      const exists = prev.symptoms.includes(symptom);
      const updated = exists
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom];

      const priority = assessTriagePriority(prev.painLevel, updated);
      if (priority === 'urgent') {
        onAnnounce?.('Alert: Critical symptom selected. Patient triage prioritized as Urgent (Tier 1).', 'warning');
      }

      return { ...prev, symptoms: updated };
    });
  };

  const handleAccommodationToggle = (acc) => {
    setFormData((prev) => {
      const exists = prev.accommodations.includes(acc);
      const updated = exists
        ? prev.accommodations.filter((a) => a !== acc)
        : [...prev.accommodations, acc];
      return { ...prev, accommodations: updated };
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Patient name must be at least 2 characters.';
    }

    if (!formData.mrn.trim() || !/^MRN-\d{4,8}$/i.test(formData.mrn.trim())) {
      newErrors.mrn = 'Valid MRN format required (e.g., MRN-1082).';
    }

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 125) {
      newErrors.age = 'Patient age must be between 0 and 125.';
    }

    if (!formData.stream) {
      newErrors.stream = 'Please select a clinical triage stream.';
    }

    setErrors(newErrors);

    // Focus first invalid input using useRef
    if (newErrors.name && nameRef.current) {
      nameRef.current.focus();
    } else if (newErrors.mrn && mrnRef.current) {
      mrnRef.current.focus();
    } else if (newErrors.age && ageRef.current) {
      ageRef.current.focus();
    } else if (newErrors.stream && streamRef.current) {
      streamRef.current.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      onAnnounce?.('Validation Error: Please review highlighted triage form fields.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const calculatedPriority = assessTriagePriority(formData.painLevel, formData.symptoms);

      const newPatient = {
        id: 'P-' + Date.now().toString(36).toUpperCase(),
        name: formData.name.trim(),
        mrn: formData.mrn.trim().toUpperCase(),
        age: parseInt(formData.age, 10),
        tel: formData.tel.trim() || '+91 98000 00000',
        stream: formData.stream,
        painLevel: parseInt(formData.painLevel, 10),
        symptoms: formData.symptoms,
        accommodations: formData.accommodations,
        priority: calculatedPriority,
        arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: formData.notes.trim() || 'No additional remarks recorded.'
      };

      onAddPatient(newPatient);

      onAnnounce?.(
        `Patient ${newPatient.name} registered successfully. Priority assigned: ${calculatedPriority.toUpperCase()}.`,
        calculatedPriority === 'urgent' ? 'warning' : 'success'
      );

      // Reset form
      setFormData({
        name: '',
        mrn: '',
        age: '',
        tel: '',
        arrivalDate: new Date().toISOString().split('T')[0],
        stream: 'Emergency Medicine',
        painLevel: 4,
        symptoms: [],
        accommodations: [],
        notes: ''
      });
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrefill = () => {
    const sample = SAMPLE_PATIENTS[sampleIndex % SAMPLE_PATIENTS.length];
    setFormData({
      name: sample.name,
      mrn: sample.mrn,
      age: sample.age,
      tel: sample.tel,
      arrivalDate: new Date().toISOString().split('T')[0],
      stream: sample.stream,
      painLevel: sample.painLevel,
      symptoms: [...sample.symptoms],
      accommodations: [...sample.accommodations],
      notes: sample.notes
    });
    setSampleIndex((prev) => prev + 1);
    setErrors({});
    onAnnounce?.(`Autofilled sample data for ${sample.name}.`, 'info');
  };

  const previewPriority = assessTriagePriority(formData.painLevel, formData.symptoms);

  return (
    <section id="triage-section" className={styles.triageSection} aria-labelledby="triage-heading">
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 id="triage-heading" className={styles.sectionTitle}>Emergency Patient Triage Intake</h2>
          <p className={styles.sectionSubtitle}>Clinical assessment, pain scoring, and accommodation registration</p>
        </div>
        <div>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handlePrefill}
            aria-label="Prefill sample patient record"
          >
            ⚡ Sample Autofill
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        
        {/* Fieldset 1: Demographics */}
        <fieldset className={styles.formFieldset}>
          <legend className={styles.fieldsetLegend}>1. Patient Demographics &amp; Registration</legend>
          
          <div className={styles.formGrid2}>
            <div className={styles.formGroup}>
              <label htmlFor="triage-patient-name" className={styles.formLabel}>
                Legal / Preferred Patient Name <span className={styles.requiredStar}>*</span>
              </label>
              <input
                ref={nameRef}
                id="triage-patient-name"
                name="name"
                type="text"
                className={`${styles.formControl} ${errors.name ? styles.isInvalid : ''}`}
                placeholder="e.g. Ramesh Kulkarni"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <span className={styles.inlineFieldError}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="triage-patient-mrn" className={styles.formLabel}>
                Medical Record Number (MRN) <span className={styles.requiredStar}>*</span>
              </label>
              <input
                ref={mrnRef}
                id="triage-patient-mrn"
                name="mrn"
                type="text"
                className={`${styles.formControl} ${errors.mrn ? styles.isInvalid : ''}`}
                placeholder="MRN-1082"
                value={formData.mrn}
                onChange={handleChange}
                required
              />
              {errors.mrn && <span className={styles.inlineFieldError}>{errors.mrn}</span>}
            </div>
          </div>

          <div className={styles.formGrid3}>
            <div className={styles.formGroup}>
              <label htmlFor="triage-patient-age" className={styles.formLabel}>
                Age (Years) <span className={styles.requiredStar}>*</span>
              </label>
              <input
                ref={ageRef}
                id="triage-patient-age"
                name="age"
                type="number"
                min="0"
                max="125"
                className={`${styles.formControl} ${errors.age ? styles.isInvalid : ''}`}
                placeholder="48"
                value={formData.age}
                onChange={handleChange}
                required
              />
              {errors.age && <span className={styles.inlineFieldError}>{errors.age}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="triage-patient-tel" className={styles.formLabel}>
                Emergency Contact Phone
              </label>
              <input
                id="triage-patient-tel"
                name="tel"
                type="tel"
                className={styles.formControl}
                placeholder="+91 98200 12345"
                value={formData.tel}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="triage-clinical-stream" className={styles.formLabel}>
                Clinical Stream <span className={styles.requiredStar}>*</span>
              </label>
              <select
                ref={streamRef}
                id="triage-clinical-stream"
                name="stream"
                className={`${styles.formControl} ${errors.stream ? styles.isInvalid : ''}`}
                value={formData.stream}
                onChange={handleChange}
                required
              >
                <option value="Emergency Medicine">Emergency Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedic Trauma">Orthopedic Trauma</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Fieldset 2: Pain Scale */}
        <fieldset className={styles.formFieldset}>
          <legend className={styles.fieldsetLegend}>2. Pain &amp; Urgency Assessment</legend>
          <div className={styles.painScaleContainer}>
            <div className={styles.painLabelRow}>
              <label htmlFor="pain-scale-slider" className={styles.formLabel}>
                Patient Pain Score (1: Mild to 10: Incapacitating)
              </label>
              <output htmlFor="pain-scale-slider" className={styles.painScoreOutput}>
                Level {formData.painLevel} / 10
              </output>
            </div>
            <input
              id="pain-scale-slider"
              name="painLevel"
              type="range"
              min="1"
              max="10"
              className={styles.painSlider}
              value={formData.painLevel}
              onChange={handleChange}
            />
            <div className={styles.painScaleTicks}>
              <span>1 (Mild)</span>
              <span>5 (Moderate)</span>
              <span>10 (Severe)</span>
            </div>
            <div className={styles.liveTierPreview}>
              <span>Priority Rating:</span>
              <strong style={{ color: previewPriority === 'urgent' ? '#dc2626' : previewPriority === 'priority' ? '#d97706' : '#059669' }}>
                {previewPriority.toUpperCase()}
              </strong>
            </div>
          </div>
        </fieldset>

        {/* Fieldset 3: Symptoms */}
        <fieldset className={styles.formFieldset}>
          <legend className={styles.fieldsetLegend}>3. Presenting Clinical Symptoms</legend>
          <div className={styles.checkboxGrid}>
            {AVAILABLE_SYMPTOMS.map((symptom) => {
              const isChecked = formData.symptoms.includes(symptom);
              const isCritical = CRITICAL_SYMPTOMS.includes(symptom);
              return (
                <label key={symptom} className={`${styles.checkboxLabel} ${isCritical ? styles.criticalSymptomLabel : ''}`}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleSymptomToggle(symptom)}
                  />
                  <span>
                    {symptom} {isCritical && <span className={styles.criticalTag}>Tier 1 Red Flag</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Fieldset 4: Accommodations */}
        <fieldset className={styles.formFieldset}>
          <legend className={styles.fieldsetLegend}>4. Assistive Accommodations</legend>
          <div className={styles.checkboxGrid}>
            {AVAILABLE_ACCOMMODATIONS.map((acc) => (
              <label key={acc} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.accommodations.includes(acc)}
                  onChange={() => handleAccommodationToggle(acc)}
                />
                <span>♿ {acc}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Fieldset 5: Notes */}
        <fieldset className={styles.formFieldset}>
          <legend className={styles.fieldsetLegend}>5. Clinical Observations</legend>
          <textarea
            id="triage-notes"
            name="notes"
            className={styles.formControl}
            rows="3"
            placeholder="Clinical observations..."
            value={formData.notes}
            onChange={handleChange}
          ></textarea>
        </fieldset>

        <div className={styles.formActionsRow}>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : '✓ Admit Patient to Queue'}
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => {
              setFormData({
                name: '',
                mrn: '',
                age: '',
                tel: '',
                arrivalDate: new Date().toISOString().split('T')[0],
                stream: 'Emergency Medicine',
                painLevel: 4,
                symptoms: [],
                accommodations: [],
                notes: ''
              });
              setErrors({});
            }}
          >
            Clear Form
          </button>
        </div>

      </form>
    </section>
  );
}
