/**
 * CareBridge — Mongoose Patient Model
 * File: database/mongodb/models/Patient.js
 */

import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const patientSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: {
      type: String,
      required: [true, 'Patient legal name is mandatory'],
      minlength: [2, 'Name must contain at least 2 characters'],
      trim: true
    },
    mrn: {
      type: String,
      required: [true, 'MRN is mandatory'],
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
    tel: { type: String, trim: true },
    stream: {
      type: String,
      default: 'General Medicine',
      enum: ['Cardiology', 'Orthopedic Trauma', 'Neurology', 'General Medicine', 'Pediatrics']
    },
    painLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    priority: {
      type: String,
      enum: ['urgent', 'priority', 'routine'],
      default: 'routine'
    },
    symptoms: [{ type: String, trim: true }],
    accommodations: [{ type: String, trim: true }],
    arrivalTime: { type: String, required: true },
    notes: { type: String, default: '' },
    discharged: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

patientSchema.virtual('isEmergency').get(function () {
  return this.priority === 'urgent' || this.painLevel >= 8;
});

patientSchema.pre('save', function (next) {
  if (this.mrn) {
    this.mrn = this.mrn.toUpperCase();
  }
  if (this.painLevel >= 8 && this.priority !== 'urgent') {
    this.priority = 'urgent';
  }
  if (typeof next === 'function') next();
});

export const Patient = mongoose.models.Patient || model('Patient', patientSchema);
export default Patient;

