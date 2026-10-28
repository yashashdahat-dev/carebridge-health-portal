/**
 * CareBridge — Isolated Tailwind CSS Showcase
 * File: src/examples/TailwindShowcase.jsx
 * 
 * Demonstrates:
 * - Utility-first styling with Tailwind CSS classes
 * - Layout (flex, grid, items-center, justify-between)
 * - Spacing (p-6, gap-4, my-3)
 * - Typography (text-lg, font-semibold, text-slate-800)
 * - Colors (bg-sky-50, text-sky-700, border-sky-200)
 * - Responsive breakpoints (grid-cols-1 md:grid-cols-3)
 * - Transitions and focus states (hover:shadow-md, focus:ring-2)
 * 
 * NOTE: As required by the architectural constraints, this component is kept
 * completely isolated in src/examples/ and does not pollute the primary clinical portal.
 */

import React, { useState } from 'react';

/**
 * Isolated Clinical Patient Summary Card styled with Tailwind CSS utility classes.
 */
export function TailwindPatientCard({
  patient = {
    name: 'Sunita Sharma',
    mrn: 'CRB-2026-904',
    department: 'Cardiology',
    priority: 'Urgent',
    scheduledTime: '10:30 AM',
    vitals: { bp: '138/88', hr: '84 bpm', spO2: '98%' }
  }
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Dynamic priority styling using Tailwind conditional utility strings
  const priorityBadgeStyle =
    patient.priority.toLowerCase() === 'urgent'
      ? 'bg-red-100 text-red-800 border-red-200'
      : patient.priority.toLowerCase() === 'priority'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  return (
    <div className="max-w-xl mx-auto my-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden font-sans">
      {/* Card Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
            {patient.mrn}
          </span>
          <h4 className="text-lg font-bold text-slate-900 mt-1">
            {patient.name}
          </h4>
          <p className="text-xs text-slate-500">
            Assigned: <span className="font-medium text-slate-700">{patient.department}</span> • Time: {patient.scheduledTime}
          </p>
        </div>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${priorityBadgeStyle}`}
        >
          ● {patient.priority}
        </span>
      </div>

      {/* Card Body — Vitals Grid */}
      <div className="p-5 bg-slate-50/50">
        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Triage Vitals Check
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
            <span className="block text-xs text-slate-500">Blood Pressure</span>
            <span className="text-sm font-bold text-slate-800">{patient.vitals.bp}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
            <span className="block text-xs text-slate-500">Heart Rate</span>
            <span className="text-sm font-bold text-slate-800">{patient.vitals.hr}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
            <span className="block text-xs text-slate-500">Oxygen (SpO2)</span>
            <span className="text-sm font-bold text-slate-800">{patient.vitals.spO2}</span>
          </div>
        </div>
      </div>

      {/* Expandable Notes */}
      {isExpanded && (
        <div className="p-5 bg-amber-50/40 border-t border-amber-100 text-xs text-amber-900 space-y-1">
          <p className="font-semibold">Clinical Note:</p>
          <p>
            Patient presenting with exertion-related chest tightness. Multilingual Hindi instructions requested.
          </p>
        </div>
      )}

      {/* Card Footer Actions */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 underline focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
        >
          {isExpanded ? 'Hide Clinical Notes' : 'View Clinical Notes'}
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            Page Patient
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            Admit to Room
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Isolated Tailwind Showcase Container for developer verification.
 */
export function TailwindShowcase() {
  return (
    <div className="p-6 bg-slate-100 rounded-2xl max-w-2xl mx-auto my-6 border border-slate-300">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900">
          Tailwind CSS Utility-Class Showcase
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Demonstrates layout, responsive grids, and design tokens using utility classes,
          strictly isolated from the primary CSS Modules clinical portal.
        </p>
      </div>

      <TailwindPatientCard />
    </div>
  );
}

export default TailwindShowcase;
