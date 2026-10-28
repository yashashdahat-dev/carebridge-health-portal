/**
 * CareBridge — PatientTriageForm Component
 * File: src/components/PatientTriageForm.jsx
 * 
 * Demonstrates:
 * - Controlled inputs with React state
 * - Event handling: onChange, onSubmit, onClick
 * - useRef to focus the first invalid field on validation failure
 * - Automatic urgent priority assignment for critical symptoms
 * - Form reset, sample pre-fill, and accessible inline validation
 */

import React, { useState, useRef } from 'react';
import { CRITICAL_SYMPTOMS, SAMPLE_PATIENTS } from '../data/initialData.js';
import { assessTriagePriority } from '../utils/clinicalAnalytics.js';

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
  // Form Field Controlled States
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

  // Validation Error States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);

  // useRef hooks for focusing first invalid field on submission failure
  const nameRef = useRef(null);
  const mrnRef = useRef(null);
  const ageRef = useRef(null);
  const streamRef = useRef(null);
  const painRef = useRef(null);

  // Handle standard input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle symptom checkbox toggle
  const handleSymptomToggle = (symptom) => {
    setFormData((prev) => {
      const exists = prev.symptoms.includes(symptom);
      const updated = exists
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom];

      // Instant urgency feedback
      const priority = assessTriagePriority(prev.painLevel, updated);
      if (priority === 'urgent') {
        onAnnounce?.('Alert: Critical symptom selected. Triage will be classified as Urgent (Tier 1).', 'warning');
      }

      return { ...prev, symptoms: updated };
    });
  };

  // Handle accommodation checkbox toggle
  const handleAccommodationToggle = (acc) => {
    setFormData((prev) => {
      const exists = prev.accommodations.includes(acc);
      const updated = exists
        ? prev.accommodations.filter((a) => a !== acc)
        : [...prev.accommodations, acc];
      return { ...prev, accommodations: updated };
    });
  };

  // Form Validation with accessible useRef focus
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Patient legal or preferred name must be at least 2 characters.';
    }

    if (!formData.mrn.trim() || !/^MRN-\d{4,8}$/i.test(formData.mrn.trim())) {
      newErrors.mrn = 'Valid MRN format required (e.g., MRN-1082).';
    }

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 125) {
      newErrors.age = 'Patient age must be a valid number between 0 and 125.';
    }

    if (!formData.stream) {
      newErrors.stream = 'Please select a clinical triage stream.';
    }

    setErrors(newErrors);

    // useRef: Focus the very first invalid input
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

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      onAnnounce?.('Validation Error: Please correct the highlighted triage form fields.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate clinical priority tier automatically
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
        notes: formData.notes.trim() || 'No additional clinical remarks recorded.'
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

  // Pre-fill sample patient
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

  // Computed preview tier
  const previewPriority = assessTriagePriority(formData.painLevel, formData.symptoms);

  return (
    <section id="triage-section" className="triage-form-section" aria-labelledby="triage-heading">
      <div className="section-header-row">
        <div>
          <h2 id="triage-heading" className="section-title">Emergency Patient Triage Intake</h2>
          <p className="section-subtitle">Clinical assessment, pain scoring, and assistive accommodation registration</p>
        </div>
        <div className="form-quick-tools">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handlePrefill}
            aria-label="Prefill sample patient record for clinical testing"
          >
            ⚡ Sample Autofill
          </button>
        </div>
      </div>

      <form className="clinical-form triage-form" onSubmit={handleSubmit} noValidate>
        
        {/* Fieldset 1: Demographics */}
        <fieldset className="form-fieldset">
          <legend className="fieldset-legend">1. Patient Demographics &amp; Registration</legend>
          
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="triage-patient-name" className="form-label">
                Legal / Preferred Patient Name <span className="required-star">*</span>
              </label>
              <input
                ref={nameRef}
                id="triage-patient-name"
                name="name"
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="e.g. Ramesh Kulkarni"
                value={formData.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                required
              />
              {errors.name && (
                <span id="name-error" className="inline-field-error" role="alert">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="triage-patient-mrn" className="form-label">
                Medical Record Number (MRN) <span className="required-star">*</span>
              </label>
              <input
                ref={mrnRef}
                id="triage-patient-mrn"
                name="mrn"
                type="text"
                className={`form-control ${errors.mrn ? 'is-invalid' : ''}`}
                placeholder="MRN-1082"
                value={formData.mrn}
                onChange={handleChange}
                aria-invalid={Boolean(errors.mrn)}
                aria-describedby={errors.mrn ? 'mrn-error' : undefined}
                required
              />
              {errors.mrn && (
                <span id="mrn-error" className="inline-field-error" role="alert">
                  {errors.mrn}
                </span>
              )}
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label htmlFor="triage-patient-age" className="form-label">
                Age (Years) <span className="required-star">*</span>
              </label>
              <input
                ref={ageRef}
                id="triage-patient-age"
                name="age"
                type="number"
                min="0"
                max="125"
                className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                placeholder="e.g. 48"
                value={formData.age}
                onChange={handleChange}
                aria-invalid={Boolean(errors.age)}
                aria-describedby={errors.age ? 'age-error' : undefined}
                required
              />
              {errors.age && (
                <span id="age-error" className="inline-field-error" role="alert">
                  {errors.age}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="triage-patient-tel" className="form-label">
                Emergency Contact Phone
              </label>
              <input
                id="triage-patient-tel"
                name="tel"
                type="tel"
                className="form-control"
                placeholder="+91 98200 12345"
                value={formData.tel}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="triage-clinical-stream" className="form-label">
                Clinical Specialty Stream <span className="required-star">*</span>
              </label>
              <select
                ref={streamRef}
                id="triage-clinical-stream"
                name="stream"
                className={`form-control ${errors.stream ? 'is-invalid' : ''}`}
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

        {/* Fieldset 2: Pain Scale & Urgency Rating */}
        <fieldset className="form-fieldset">
          <legend className="fieldset-legend">2. Clinical Pain &amp; Vitals Assessment</legend>
          
          <div className="pain-scale-container">
            <div className="pain-label-row">
              <label htmlFor="pain-scale-slider" className="form-label">
                Patient Pain Score (1: Mild / Discomfort to 10: Incapacitating)
              </label>
              <output htmlFor="pain-scale-slider" className="pain-score-output">
                Level {formData.painLevel} / 10
              </output>
            </div>

            <input
              ref={painRef}
              id="pain-scale-slider"
              name="painLevel"
              type="range"
              min="1"
              max="10"
              className="pain-slider"
              value={formData.painLevel}
              onChange={handleChange}
              aria-valuemin="1"
              aria-valuemax="10"
              aria-valuenow={formData.painLevel}
            />

            <div className="pain-scale-ticks" aria-hidden="true">
              <span>1 (Mild)</span>
              <span>3</span>
              <span>5 (Moderate)</span>
              <span>7</span>
              <span>10 (Severe)</span>
            </div>

            {/* Live Triage Tier Preview Badge */}
            <div className="live-tier-preview">
              <span>Automated Priority Assessment:</span>
              <span className={`status-pill ${previewPriority === 'urgent' ? 'pill-emergency' : previewPriority === 'priority' ? 'pill-urgent' : 'pill-standard'}`}>
                {previewPriority.toUpperCase()} (Tier {previewPriority === 'urgent' ? 1 : previewPriority === 'priority' ? 2 : 3})
              </span>
            </div>
          </div>
        </fieldset>

        {/* Fieldset 3: Symptoms Checklist */}
        <fieldset className="form-fieldset">
          <legend className="fieldset-legend">3. Presenting Clinical Symptoms</legend>
          <div className="checkbox-grid">
            {AVAILABLE_SYMPTOMS.map((symptom) => {
              const isChecked = formData.symptoms.includes(symptom);
              const isCritical = CRITICAL_SYMPTOMS.includes(symptom);
              return (
                <label key={symptom} className={`checkbox-label ${isCritical ? 'critical-symptom-label' : ''}`}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleSymptomToggle(symptom)}
                  />
                  <span>
                    {symptom} {isCritical && <strong className="critical-tag">(Tier 1 Red Flag)</strong>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Fieldset 4: Accommodations */}
        <fieldset className="form-fieldset">
          <legend className="fieldset-legend">4. Patient Accommodations &amp; Accessibility</legend>
          <div className="checkbox-grid">
            {AVAILABLE_ACCOMMODATIONS.map((acc) => (
              <label key={acc} className="checkbox-label">
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

        {/* Fieldset 5: Clinical Notes */}
        <fieldset className="form-fieldset">
          <legend className="fieldset-legend">5. Clinical Notes &amp; Observations</legend>
          <div className="form-group">
            <label htmlFor="triage-notes" className="form-label">
              On-Duty Nurse / Physician Observations
            </label>
            <textarea
              id="triage-notes"
              name="notes"
              className="form-control"
              rows="3"
              placeholder="e.g. Diaphoretic, patient reports sudden onset while walking. Monitored vitals."
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>
        </fieldset>

        {/* Submit Actions */}
        <div className="form-actions-row">
          <button
            type="submit"
            className="btn btn-primary btn-submit-triage"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering Patient...' : '✓ Admit Patient to Queue'}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
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

