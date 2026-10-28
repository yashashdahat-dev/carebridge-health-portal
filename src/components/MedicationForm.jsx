/**
 * CareBridge — MedicationForm Component
 * File: src/components/MedicationForm.jsx
 * Styled via CSS Modules: MedicationForm.module.css
 */

import React, { useState } from 'react';
import { format12HourTime } from '../utils/clinicalAnalytics.js';
import styles from './MedicationForm.module.css';

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
    <section className={styles.addMedSection} aria-labelledby="add-med-heading">
      <h3 id="add-med-heading" className={styles.sectionTitle}>Schedule New Patient Medication</h3>
      <p className={styles.sectionSubtitle}>Add daily prescription timing, cautions, and multilingual directions</p>

      <form onSubmit={handleSubmit} noValidate>
        
        <div className={styles.formGrid3}>
          <div className={styles.formGroup}>
            <label htmlFor="med-name" className={styles.formLabel}>
              Medication Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="med-name"
              name="name"
              type="text"
              className={`${styles.formControl} ${errors.name ? styles.isInvalid : ''}`}
              placeholder="e.g. Paracetamol"
              value={medData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className={styles.inlineFieldError}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="med-dosage" className={styles.formLabel}>
              Strength &amp; Dosage <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="med-dosage"
              name="dosage"
              type="text"
              className={`${styles.formControl} ${errors.dosage ? styles.isInvalid : ''}`}
              placeholder="e.g. 500 mg Tablet"
              value={medData.dosage}
              onChange={handleChange}
              required
            />
            {errors.dosage && <span className={styles.inlineFieldError}>{errors.dosage}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="med-time" className={styles.formLabel}>
              Scheduled Time <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="med-time"
              name="time"
              type="time"
              className={`${styles.formControl} ${errors.time ? styles.isInvalid : ''}`}
              value={medData.time}
              onChange={handleChange}
              required
            />
            {errors.time && <span className={styles.inlineFieldError}>{errors.time}</span>}
          </div>
        </div>

        <div className={styles.formGrid3}>
          <div className={styles.formGroup}>
            <label htmlFor="med-slot" className={styles.formLabel}>Dose Slot</label>
            <select
              id="med-slot"
              name="slot"
              className={styles.formControl}
              value={medData.slot}
              onChange={handleChange}
            >
              <option value="Morning Dose">Morning Dose</option>
              <option value="Afternoon Dose">Afternoon Dose</option>
              <option value="Evening Dose">Evening Dose</option>
              <option value="Night Dose">Night Dose</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="med-purpose" className={styles.formLabel}>Therapeutic Category</label>
            <input
              id="med-purpose"
              name="purpose"
              type="text"
              className={styles.formControl}
              placeholder="e.g. Analgesic"
              value={medData.purpose}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="med-caution" className={styles.formLabel}>Interaction Caution</label>
            <input
              id="med-caution"
              name="caution"
              type="text"
              className={styles.formControl}
              placeholder="e.g. Take with water"
              value={medData.caution}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.formGrid3}>
          <div className={styles.formGroup}>
            <label htmlFor="med-inst-en" className={styles.formLabel}>Directions (English)</label>
            <input
              id="med-inst-en"
              name="instructionsEn"
              type="text"
              className={styles.formControl}
              placeholder="Take 1 tablet after meals"
              value={medData.instructionsEn}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="med-inst-hi" className={styles.formLabel}>Directions (हिन्दी)</label>
            <input
              id="med-inst-hi"
              name="instructionsHi"
              type="text"
              className={styles.formControl}
              placeholder="भोजन के बाद लें"
              value={medData.instructionsHi}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="med-inst-mr" className={styles.formLabel}>Directions (मराठी)</label>
            <input
              id="med-inst-mr"
              name="instructionsMr"
              type="text"
              className={styles.formControl}
              placeholder="जेवणानंतर घ्या"
              value={medData.instructionsMr}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.formActionsRow}>
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : '+ Schedule Medication'}
          </button>
        </div>
      </form>
    </section>
  );
}
