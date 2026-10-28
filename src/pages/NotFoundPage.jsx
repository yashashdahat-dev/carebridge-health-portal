/**
 * CareBridge — Not Found Page (404 Fallback)
 * File: src/pages/NotFoundPage.jsx
 */

import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', background: 'var(--card-bg, #ffffff)', padding: '3rem 2rem', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">
        🩺
      </div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-heading, #0f172a)' }}>
        404 — Clinical Route Not Found
      </h2>
      <p style={{ color: 'var(--text-body, #64748b)', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>
        The requested clinical destination or patient subroute does not exist in the active CareBridge directory.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link
          to="/"
          style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            borderRadius: '6px',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          Return to Dashboard
        </Link>
        <Link
          to="/patients"
          style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: 'var(--slate-100, #f1f5f9)',
            color: 'var(--text-body, #1e293b)',
            border: '1px solid var(--border-color, #cbd5e1)',
            borderRadius: '6px',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          View Triage Queue
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;

