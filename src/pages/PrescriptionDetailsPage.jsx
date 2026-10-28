/**
 * CareBridge — Prescription Details Page (React Router useParams)
 * File: src/pages/PrescriptionDetailsPage.jsx
 */

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCareBridge } from '../context/CareBridgeContext.jsx';

export function PrescriptionDetailsPage() {
  const { id, prescriptionId } = useParams();
  const effectiveId = id || prescriptionId;
  const navigate = useNavigate();
  const { prescriptions = [], toggleMedicationTaken, speak, language, announce } = useCareBridge();

  const rx = prescriptions.find((m) => m.id === effectiveId);

  if (!rx) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--card-bg, #ffffff)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        <h2 style={{ color: '#dc2626' }}>Prescription Not Found</h2>
        <p style={{ color: 'var(--text-body, #64748b)' }}>No medication corresponds to ID: <code>{effectiveId}</code>.</p>
        <button
          onClick={() => navigate('/prescriptions')}
          style={{ marginTop: '1rem', padding: '0.6rem 1.25rem', backgroundColor: '#0284c7', color: '#ffffff', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
        >
          ← Return to Prescriptions
        </button>
      </div>
    );
  }

  const handleSpeak = (lang) => {
    const medName = rx.translatedNames?.[lang] || rx.name;
    const inst = rx.instructions?.[lang] || rx.instructions?.en || '';
    const speech = `Medication: ${medName}. Dosage: ${rx.dosage}. Scheduled time: ${rx.time}. Directions: ${inst}.`;
    speak(speech, lang, `${rx.id}-${lang}`);
    announce(`Reading instructions for ${medName} in ${lang.toUpperCase()}`, 'info');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/prescriptions" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
          ← Back to All Prescriptions
        </Link>
      </div>

      <article style={{ background: 'var(--card-bg, #ffffff)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px' }}>
              {rx.id.toUpperCase()}
            </span>
            <h2 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.75rem' }}>{rx.name}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
              Strength: <strong>{rx.dosage}</strong> • Scheduled Time: <strong>{rx.time}</strong> • Prescribed by: <strong>{rx.doctor}</strong>
            </p>
          </div>

          <button
            onClick={() => toggleMedicationTaken(rx.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              backgroundColor: rx.taken ? '#ecfdf5' : '#fef3c7',
              color: rx.taken ? '#065f46' : '#92400e',
              border: `1px solid ${rx.taken ? '#a7f3d0' : '#fde68a'}`
            }}
          >
            {rx.taken ? '✓ Marked as Taken' : '○ Mark as Taken'}
          </button>
        </div>

        {/* Multilingual Directions */}
        <div style={{ margin: '1.5rem 0' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Multilingual Patient Directions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--slate-50, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#0284c7' }}>English (EN)</strong>
                <button onClick={() => handleSpeak('en')} style={{ padding: '0.3rem 0.75rem', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                  🔊 Listen in English
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{rx.instructions.en}</p>
            </div>

            <div style={{ padding: '1rem', background: 'var(--slate-50, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#0284c7' }}>हिंदी / Hindi (HI)</strong>
                <button onClick={() => handleSpeak('hi')} style={{ padding: '0.3rem 0.75rem', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                  🔊 हिंदी में सुनें
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{rx.instructions.hi || rx.instructions.en}</p>
            </div>

            <div style={{ padding: '1rem', background: 'var(--slate-50, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#0284c7' }}>मराठी / Marathi (MR)</strong>
                <button onClick={() => handleSpeak('mr')} style={{ padding: '0.3rem 0.75rem', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                  🔊 मराठीत ऐका
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{rx.instructions.mr || rx.instructions.en}</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default PrescriptionDetailsPage;

