/**
 * CareBridge — Header Component
 * File: src/components/Header.jsx
 */

import React, { useState, useEffect } from 'react';
import { AccessibilityToolbar } from './AccessibilityToolbar.jsx';

export function Header({ onReadAllPrescriptions }) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="app-header" role="banner">
      <AccessibilityToolbar onReadAllPrescriptions={onReadAllPrescriptions} />

      <div className="header-main">
        <div className="header-container">
          
          <div className="branding-group">
            <div className="brand-logo-mark" aria-hidden="true">
              <svg viewBox="0 0 40 40" width="38" height="38" fill="none">
                <rect width="40" height="40" rx="10" fill="url(#brand-grad)" />
                <path d="M20 9V31M9 20H31" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="round" />
                <circle cx="20" cy="20" r="4.5" fill="#bae6fd" />
                <defs>
                  <linearGradient id="brand-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0284c7" />
                    <stop offset="1" stopColor="#0f766e" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="brand-text">
              <h1 className="brand-title">CareBridge</h1>
              <p className="brand-tagline">
                Emergency Patient Triage &amp; Multilingual Prescription Portal
              </p>
            </div>
          </div>

          <div className="header-quick-info">
            <div className="info-chip chip-clock" aria-label={`Current hospital time: ${currentTime}`}>
              <svg className="icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="live-clock">{currentTime || '10:45 AM'}</span>
            </div>

            <div className="info-chip chip-emergency" role="status">
              <span className="pulse-dot" aria-hidden="true"></span>
              <span>Emergency Code: <strong>Ready</strong></span>
            </div>
          </div>

        </div>
      </div>

      {/* Primary Navigation Landmarks */}
      <nav className="app-nav" aria-label="Portal Clinical Navigation">
        <div className="nav-container">
          <ul className="nav-list">
            <li><a href="#triage-section" className="nav-link">Patient Triage</a></li>
            <li><a href="#queue-section" className="nav-link">Live Patient Queue</a></li>
            <li><a href="#prescriptions-section" className="nav-link">Multilingual Prescriptions</a></li>
            <li><a href="#analytics-section" className="nav-link">Clinical Dashboard</a></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
