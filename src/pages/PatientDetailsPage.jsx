/**
 * CareBridge — Patient Details Page (React Router useParams)
 * File: src/pages/PatientDetailsPage.jsx
 * 
 * Demonstrates:
 * - useParams() to extract route parameter :id (Task 06)
 * - useNavigate() for programmatic navigation
 * - Complete clinical detail view with vitals and speech call
 */

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCareBridge } from '../context/CareBridgeContext.jsx';

export function PatientDetailsPage() {
  const { id, patientId } = useParams();
  const effectiveId = id || patientId;
  const navigate = useNavigate();
  const { patientQueue = [], completePatient, speak, announce } = useCareBridge();

  const patient = patientQueue.find((p) => p.id === effectiveId);

  if (!patient) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--card-bg, #ffffff)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        <h2 style={{ color: '#dc2626' }}>Patient Record Not Found</h2>
        <p style={{ color: 'var(--text-body, #64748b)' }}>
          No active patient in the waiting queue corresponds to ID: <code>{effectiveId}</code>.
        </p>
        <button
          onClick={() => navigate('/patients')}
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.25rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ← Return to Triage Queue
        </button>
      </div>
    );
  }

  const handleCall = () => {
    const text = `Attention: Patient ${patient.name}, Medical Record ${patient.mrn}, please report to ${patient.stream} Consultation Room 1.`;
    speak(text, 'en', patient.id);
    announce(`Paging patient ${patient.name} to Consultation Room 1.`, 'info');
  };

  const handleDischarge = () => {
    completePatient(patient.id);
    announce(`Patient ${patient.name} discharged from triage queue.`, 'success');
    navigate('/patients');
  };

  const priorityColor =
    patient.priority === 'urgent'
      ? '#dc2626'
      : patient.priority === 'priority'
      ? '#f59e0b'
      : '#10b981';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Back Breadcrumb */}
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/patients" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
          ← Back to Live Queue
        </Link>
      </div>

      <article style={{ background: 'var(--card-bg, #ffffff)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderTop: `6px solid ${priorityColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px' }}>
              {patient.mrn}
            </span>
            <h2 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.75rem' }}>{patient.name}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
              Age: <strong>{patient.age}</strong> • Contact: <strong>{patient.tel || 'N/A'}</strong> • Arrival: <strong>{patient.arrivalTime}</strong>
            </p>
          </div>

          <span
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.8125rem',
              textTransform: 'uppercase',
              backgroundColor: patient.priority === 'urgent' ? '#fee2e2' : patient.priority === 'priority' ? '#fef3c7' : '#ecfdf5',
              color: priorityColor
            }}
          >
            ● {patient.priority} (Tier {patient.priority === 'urgent' ? '1' : patient.priority === 'priority' ? '2' : '3'})
          </span>
        </div>

        {/* Clinical Parameters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ background: 'var(--slate-50, #f8fafc)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Stream</span>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 700, fontSize: '1.125rem', color: '#0284c7' }}>{patient.stream}</p>
          </div>

          <div style={{ background: 'var(--slate-50, #f8fafc)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>NRS Pain Score</span>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 800, fontSize: '1.125rem', color: patient.painLevel >= 8 ? '#dc2626' : '#f59e0b' }}>
              {patient.painLevel} / 10
            </p>
          </div>
        </div>

        {/* Symptoms & Accommodations */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase' }}>Reported Symptoms</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {patient.symptoms?.length ? (
              patient.symptoms.map((s, idx) => (
                <span key={idx} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.8125rem' }}>
                  {s}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>No symptoms recorded.</span>
            )}
          </div>
        </div>

        {/* Clinical Notes */}
        {patient.notes && (
          <div style={{ marginBottom: '2rem', padding: '1rem', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
            <strong style={{ fontSize: '0.8125rem', color: '#92400e' }}>Attending Physician Notes:</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#78350f' }}>{patient.notes}</p>
          </div>
        )}

        {/* Actions Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleCall}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span>📢</span>
            <span>Page Patient via Voice</span>
          </button>

          <button
            onClick={handleDischarge}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ✓ Complete Consultation & Discharge
          </button>
        </div>

      </article>
    </div>
  );
}

export default PatientDetailsPage;

