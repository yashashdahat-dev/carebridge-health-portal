/**
 * CareBridge — StatusBanner Component
 * File: src/components/StatusBanner.jsx
 * Styled via CSS Modules: StatusBanner.module.css
 */

import React from 'react';
import { useCareBridge } from '../context/CareBridgeContext.jsx';
import styles from './StatusBanner.module.css';

export function StatusBanner() {
  const { announcement, isGlobalSpeaking, stopAllSpeech } = useCareBridge();

  const statusTypeClass = announcement?.type === 'success'
    ? styles.statusSuccess
    : announcement?.type === 'warning'
      ? styles.statusWarning
      : announcement?.type === 'error'
        ? styles.statusError
        : styles.statusInfo;

  return (
    <>
      <div
        id="live-announcer"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement?.message}
      </div>

      {isGlobalSpeaking && (
        <aside
          className={styles.speechStatusBanner}
          role="region"
          aria-label="Active Text-to-Speech Playback"
        >
          <div className={styles.bannerContainer}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={styles.speechPulseIndicator} aria-hidden="true"></span>
              <span>Audio Reading Active: Synthesizing clinical instructions.</span>
            </div>
            <button
              type="button"
              onClick={stopAllSpeech}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              aria-label="Stop audio reading"
            >
              Stop Audio
            </button>
          </div>
        </aside>
      )}

      {announcement?.message && (
        <div
          className={`${styles.statusBanner} ${statusTypeClass}`}
          role="status"
          aria-live="polite"
        >
          <div className={styles.statusBannerContent}>
            <span className={styles.statusIndicatorDot} aria-hidden="true"></span>
            <span>{announcement.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
