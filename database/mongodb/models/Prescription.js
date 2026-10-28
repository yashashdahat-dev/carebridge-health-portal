/**
 * CareBridge — Mongoose Prescription Model
 * File: database/mongodb/models/Prescription.js
 */

import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const prescriptionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true },
    time: { type: String, required: true },
    mealTiming: {
      type: String,
      enum: ['before', 'with', 'after'],
      default: 'after'
    },
    doctor: { type: String, required: true },
    taken: { type: Boolean, default: false },
    lastTakenTime: { type: String, default: null },
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

export const Prescription = mongoose.models.Prescription || model('Prescription', prescriptionSchema);
export default Prescription;

