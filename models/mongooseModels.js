/**
 * CareBridge — Mongoose NoSQL Schemas & Models
 * File: models/mongooseModels.js
 * 
 * Demonstrates:
 * - Document-oriented schema declaration with new Schema() (PDF Page 3)
 * - Schema types (String, Number, Boolean, Date, Array)
 * - Built-in & custom validation rules (required, min, max, minlength, match)
 * - Virtuals (computed non-persisted document properties)
 * - Pre-save hooks (middleware before saving document to MongoDB collection)
 */

/**
 * Creates Mongoose schemas and models.
 * @param {object} mongoose - Mongoose instance or mock ODM
 */
export function initMongooseModels(mongoose) {
  const { Schema, model } = mongoose;

  // 1. Patient Document Schema
  const patientSchema = new Schema(
    {
      id: {
        type: String,
        required: true,
        unique: true
      },
      name: {
        type: String,
        required: [true, 'Patient legal name is mandatory'],
        minlength: [2, 'Name must contain at least 2 characters'],
        trim: true
      },
      mrn: {
        type: String,
        required: [true, 'Medical Record Number (MRN) is mandatory'],
        unique: true,
        uppercase: true,
        match: [/^MRN-\d{4,6}$/i, 'MRN must follow format MRN-XXXXX']
      },
      age: {
        type: Number,
        required: true,
        min: [0, 'Age cannot be negative'],
        max: [125, 'Age exceeds biological maximum']
      },
      tel: {
        type: String,
        trim: true
      },
      stream: {
        type: String,
        default: 'General Medicine',
        enum: ['Cardiology', 'Orthopedic Trauma', 'Neurology', 'General Medicine', 'Pediatrics']
      },
      painLevel: {
        type: Number,
        required: true,
        min: [1, 'Pain score must be at least 1'],
        max: [10, 'Pain score maximum is 10']
      },
      priority: {
        type: String,
        enum: ['urgent', 'priority', 'routine'],
        default: 'routine'
      },
      symptoms: [{ type: String, trim: true }],
      accommodations: [{ type: String, trim: true }],
      arrivalTime: {
        type: String,
        required: true
      },
      notes: {
        type: String,
        default: ''
      },
      discharged: {
        type: Boolean,
        default: false
      }
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
  );

  // Virtual property: determines high clinical urgency flag
  patientSchema.virtual('isEmergency').get(function () {
    return this.priority === 'urgent' || this.painLevel >= 8;
  });

  // Pre-save middleware hook (PDF Page 3: validates & normalizes before database write)
  patientSchema.pre('save', function (next) {
    if (this.mrn) {
      this.mrn = this.mrn.toUpperCase();
    }
    if (this.painLevel >= 8 && this.priority !== 'urgent') {
      this.priority = 'urgent';
    }
    if (typeof next === 'function') next();
  });

  // 2. Multilingual Prescription Document Schema
  const prescriptionSchema = new Schema(
    {
      id: {
        type: String,
        required: true,
        unique: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      dosage: {
        type: String,
        required: true
      },
      time: {
        type: String,
        required: true
      },
      mealTiming: {
        type: String,
        enum: ['before', 'with', 'after'],
        default: 'after'
      },
      doctor: {
        type: String,
        required: true
      },
      taken: {
        type: Boolean,
        default: false
      },
      lastTakenTime: {
        type: String,
        default: null
      },
      instructions: {
        en: { type: String, required: true },
        hi: { type: String, default: '' },
        mr: { type: String, default: '' }
      },
      translatedNames: {
        en: { type: String, default: '' },
        hi: { type: String, default: '' },
        mr: { type: String, default: '' }
      }
    },
    {
      timestamps: true
    }
  );

  const Patient = model('Patient', patientSchema);
  const Prescription = model('Prescription', prescriptionSchema);

  return { Patient, Prescription, patientSchema, prescriptionSchema };
}

export default initMongooseModels;
