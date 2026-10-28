/**
 * CareBridge — MedicationForm Component
 * File: src/components/MedicationForm.jsx
 * 
 * Demonstrates:
 * - Controlled input handling for medication entry
 * - Multilingual instruction fields
 * - Inline validation and accessible submission
 */

import React, { useState } from 'react';
import { format12HourTime } from '../utils/clinicalAnalytics.js';

export function MedicationForm({ onAddPrescription, onAnnounce }) {
  const [medData, setMedData] = useState({
    name: '',
    dosage: '',
    time: '08:00',
    slot: 'Morning Dose',
    purpose: 'Cardiovascular',
    doctor: 'Dr. Triage Attending',
    caution: '',
    instructionsEn: '',
    instructionsHi: '',
    instructionsMr: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!medData.name.trim() || medData.name.trim().length < 2) {
      newErrors.name = 'Medication name must be at least 2 characters.';
    }
    if (!medData.dosage.trim()) {
      newErrors.dosage = 'Dosage and strength are required (e.g. 500mg).';
    }
    if (!medData.time) {
      newErrors.time = 'Administration time is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      onAnnounce?.('Validation Error: Please fill in the required medication fields.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedTime = format12HourTime(medData.time);

      const newPrescription = {
        id: 'med-' + Date.now().toString(36),
        name: medData.name.trim(),
        dosage: medData.dosage.trim(),
        time: formattedTime,
        rawTime: medData.time,
        slot: medData.slot,
        purpose: medData.purpose,
        categoryTag: 'tag-general',
        taken: false,
        doctor: medData.doctor.trim() || 'Dr. Clinical Attending',
        caution: medData.caution.trim() || 'Take as instructed with water.',
        instructions: {
          en: medData.instructionsEn.trim() || `Take ${medData.dosage.trim()} daily at ${formattedTime}. Follow physician advice.`,
          hi: medData.instructionsHi.trim() || `प्रतिदिन ${formattedTime} बजे ${medData.dosage.trim()} लें। चिकित्सक की सलाह का पालन करें।`,
          mr: medData.instructionsMr.trim() || `दररोज ${formattedTime} वाजता ${medData.dosage.trim()} घ्या. डॉक्टरांच्या सल्ल्याचे पालन करा.`
        },
        translatedNames: {
          en: medData.name.trim(),
          hi: medData.name.trim(),
          mr: medData.name.trim()
        },
        translatedCategories: {
          en: medData.purpose,
          hi: medData.purpose,
          mr: medData.purpose
        }
      };

      onAddPrescription(newPrescription);
      onAnnounce?.(`Medication ${newPrescription.name} scheduled for ${formattedTime}.`, 'success');

      // Reset
      setMedData({
        name: '',
        dosage: '',
        time: '08:00',
        slot: 'Morning Dose',
        purpose: 'Cardiovascular',
        doctor: 'Dr. Triage Attending',
        caution: '',
        instructionsEn: '',
        instructionsHi: '',
        instructionsMr: ''
      });
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="add-medication-section" aria-labelledby="add-med-heading">
      <div className="section-header-row">
        <div>
          <h3 id="add-med-heading" className="section-title">Schedule New Patient Medication</h3>
          <p className="section-subtitle">Add daily prescription timing, cautions, and multilingual directions</p>
        </div>
      </div>

      <form className="clinical-form medication-form" onSubmit={handleSubmit} noValidate>
        
        <div className="form-grid-3">
          <div className="form-group">
            <label htmlFor="med-name" className="form-label">
              Medication Name <span className="required-star">*</span>
            </label>
            <input
              id="med-name"
              name="name"
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Paracetamol"
              value={medData.name}
              onChange={handleChange}
              aria-invalid={Boolean(errors.name)}
              required
            />
            {errors.name && <span className="inline-field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="med-dosage" className="form-label">
              Strength &amp; Dosage <span className="required-star">*</span>
            </label>
            <input
              id="med-dosage"
              name="dosage"
              type="text"
              className={`form-control ${errors.dosage ? 'is-invalid' : ''}`}
              placeholder="e.g. 500 mg Tablet"
              value={medData.dosage}
              onChange={handleChange}
              aria-invalid={Boolean(errors.dosage)}
              required
            />
            {errors.dosage && <span className="inline-field-error">{errors.dosage}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="med-time" className="form-label">
              Scheduled Time <span className="required-star">*</span>
            </label>
            <input
              id="med-time"
              name="time"
              type="time"
              className={`form-control ${errors.time ? 'is-invalid' : ''}`}
              value={medData.time}
              onChange={handleChange}
              required
            />
            {errors.time && <span className="inline-field-error">{errors.time}</span>}
          </div>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label htmlFor="med-slot" className="form-label">Dose Slot</label>
            <select
              id="med-slot"
              name="slot"
              className="form-control"
              value={medData.slot}
              onChange={handleChange}
            >
              <option value="Morning Dose">Morning Dose</option>
              <option value="Afternoon Dose">Afternoon Dose</option>
              <option value="Evening Dose">Evening Dose</option>
              <option value="Night Dose">Night Dose</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="med-purpose" className="form-label">Therapeutic Category</label>
            <input
              id="med-purpose"
              name="purpose"
              type="text"
              className="form-control"
              placeholder="e.g. Analgesic / Antipyretic"
              value={medData.purpose}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="med-caution" className="form-label">Interaction / Food Caution</label>
            <input
              id="med-caution"
              name="caution"
              type="text"
              className="form-control"
              placeholder="e.g. Must take after food"
              value={medData.caution}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Multilingual Directions */}
        <div className="form-grid-3">
          <div className="form-group">
            <label htmlFor="med-inst-en" className="form-label">Directions (English)</label>
            <input
              id="med-inst-en"
              name="instructionsEn"
              type="text"
              className="form-control"
              placeholder="Take 1 tablet after meals with water."
              value={medData.instructionsEn}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="med-inst-hi" className="form-label">Directions (हिन्दी)</label>
            <input
              id="med-inst-hi"
              name="instructionsHi"
              type="text"
              className="form-control"
              placeholder="भोजन के बाद 1 गोली पानी के साथ लें।"
              value={medData.instructionsHi}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="med-inst-mr" className="form-label">Directions (मराठी)</label>
            <input
              id="med-inst-mr"
              name="instructionsMr"
              type="text"
              className="form-control"
              placeholder="जेवणानंतर १ गोळी पाण्यासोबत घ्या."
              value={medData.instructionsMr}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions-row">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : '+ Schedule Medication'}
          </button>
        </div>
      </form>
    </section>
  );
}
