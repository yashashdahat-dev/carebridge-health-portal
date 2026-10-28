/**
 * CareBridge — StatusBanner Component
 * File: src/components/StatusBanner.jsx
 * 
 * Provides visible and screen-reader accessible live notifications (WCAG AAA).
 */

import React, { useEffect } from 'react';
import { useCareBridge } from '../context/CareBridgeContext.jsx';

export function StatusBanner() {
  const { announcement, isGlobalSpeaking, stopAllSpeech } = useCareBridge();

  return (
    <>
      {/* Global Accessible Live Region for Screen Readers */}
      <div
        id="live-announcer"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement?.message}
      </div>

      {/* Visible Active Speech Status Banner */}
      {isGlobalSpeaking && (
        <aside
          className="speech-status-banner"
          role="region"
          aria-label="Active Text-to-Speech Playback"
        >
          <div className="banner-container">
            <span className="speech-pulse-indicator" aria-hidden="true"></span>
            <span className="speech-reading-message">
              Audio Reading Active: Screen reader voice is synthesizing clinical instructions.
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={stopAllSpeech}
              aria-label="Stop audio reading"
            >
              Stop Audio
            </button>
          </div>
        </aside>
      )}

      {/* Visual Clinical Alert Status Bar */}
      {announcement?.message && (
        <div
          className={`status-banner status-${announcement.type || 'info'}`}
          role="status"
          aria-live="polite"
        >
          <div className="status-banner-content">
            <span className={`status-indicator-dot dot-${announcement.type || 'info'}`} aria-hidden="true"></span>
            <span className="status-text">{announcement.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
