/**
 * CareBridge — Accessibility Center Page
 * File: src/pages/AccessibilityPage.jsx
 */

import React from 'react';
import { useCareBridge } from '../context/CareBridgeContext.jsx';

export function AccessibilityPage() {
  const {
    theme,
    setTheme,
    fontScale,
    setFontScale,
    isWideSpacing,
    setIsWideSpacing,
    language,
    setLanguage,
    announce
  } = useCareBridge();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Accessibility & Assistive Technology Center</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
          Section 508 and WCAG 2.1 Level AAA compliant preferences for vision, cognitive, and hearing accommodations.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* 1. Theme Configuration */}
        <section style={{ background: 'var(--card-bg, #ffffff)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>Visual Theme & Contrast</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #64748b)', margin: '0 0 1rem 0' }}>
            Choose a visual palette that provides optimum contrast for low vision or light sensitivity.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {['light', 'dark', 'high-contrast'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  announce(`Theme switched to ${t.toUpperCase()}`, 'info');
                }}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  border: theme === t ? '2px solid #0284c7' : '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: theme === t ? '#f0f9ff' : 'var(--slate-50, #f8fafc)',
                  color: theme === t ? '#0284c7' : 'var(--text-body, #1e293b)'
                }}
              >
                {t === 'light' ? '☀️ Standard Light' : t === 'dark' ? '🌙 Dark Mode' : '👁️ High-Contrast AAA'}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Text Scaling */}
        <section style={{ background: 'var(--card-bg, #ffffff)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>Dynamic Text Scaling</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #64748b)', margin: '0 0 1rem 0' }}>
            Enlarge typography across clinical records without breaking layout structures.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { id: 'sm', label: 'Default (100%)' },
              { id: 'md', label: 'Medium (112%)' },
              { id: 'lg', label: 'Large (125%)' },
              { id: 'xl', label: 'Extra Large (150%)' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setFontScale(s.id);
                  announce(`Text size set to ${s.label}`, 'info');
                }}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  border: fontScale === s.id ? '2px solid #0284c7' : '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: fontScale === s.id ? '#f0f9ff' : 'var(--slate-50, #f8fafc)',
                  color: fontScale === s.id ? '#0284c7' : 'var(--text-body, #1e293b)'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* 3. Wide Spacing Toggle */}
        <section style={{ background: 'var(--card-bg, #ffffff)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>Cognitive & Dyslexia Wide Spacing</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #64748b)', margin: '0 0 1rem 0' }}>
            Expands letter spacing and line heights for patients with cognitive reading accommodations.
          </p>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={isWideSpacing}
              onChange={(e) => {
                setIsWideSpacing(e.target.checked);
                announce(`Wide spacing ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
              }}
              style={{ width: '1.25rem', height: '1.25rem', accentColor: '#0284c7' }}
            />
            <span>Enable Wide Letter & Line Spacing Mode</span>
          </label>
        </section>

        {/* 4. Primary Multilingual Voice */}
        <section style={{ background: 'var(--card-bg, #ffffff)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>Primary Audio Language</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #64748b)', margin: '0 0 1rem 0' }}>
            Select default speech synthesis voice for prescription read-aloud and emergency paging.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[
              { code: 'en', label: 'English (EN)' },
              { code: 'hi', label: 'हिंदी / Hindi (HI)' },
              { code: 'mr', label: 'मराठी / Marathi (MR)' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  announce(`Primary language set to ${lang.label}`, 'info');
                }}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  border: language === lang.code ? '2px solid #0284c7' : '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: language === lang.code ? '#f0f9ff' : 'var(--slate-50, #f8fafc)',
                  color: language === lang.code ? '#0284c7' : 'var(--text-body, #1e293b)'
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default AccessibilityPage;

