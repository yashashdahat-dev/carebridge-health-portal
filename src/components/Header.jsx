/**
 * CareBridge — Header Component
 * File: src/components/Header.jsx
 * Styled via CSS Modules: Header.module.css
 */

import React, { useState, useEffect } from 'react';
import { AccessibilityToolbar } from './AccessibilityToolbar.jsx';
import styles from './Header.module.css';

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
    <header className={styles.appHeader} role="banner">
      <AccessibilityToolbar onReadAllPrescriptions={onReadAllPrescriptions} />

      <div className={styles.headerMain}>
        <div className={styles.headerContainer}>
          
          <div className={styles.brandingGroup}>
            <div className={styles.brandLogoMark} aria-hidden="true">
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
            <div className={styles.brandText}>
              <h1 className={styles.brandTitle}>CareBridge</h1>
              <p className={styles.brandTagline}>
                Emergency Patient Triage &amp; Multilingual Prescription Portal
              </p>
            </div>
          </div>

          <div className={styles.headerQuickInfo}>
            <div className={`${styles.infoChip} ${styles.chipClock}`} aria-label={`Current hospital time: ${currentTime}`}>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{currentTime || '10:45 AM'}</span>
            </div>

            <div className={`${styles.infoChip} ${styles.chipEmergency}`} role="status">
              <span className={styles.pulseDot} aria-hidden="true"></span>
              <span>Emergency Code: <strong>Ready</strong></span>
            </div>
          </div>

        </div>
      </div>

      <nav className={styles.appNav} aria-label="Portal Clinical Navigation">
        <div className={styles.navContainer}>
          <ul className={styles.navList}>
            <li><a href="#triage-section" className={styles.navLink}>Patient Triage</a></li>
            <li><a href="#queue-section" className={styles.navLink}>Live Patient Queue</a></li>
            <li><a href="#prescriptions-section" className={styles.navLink}>Multilingual Prescriptions</a></li>
            <li><a href="#analytics-section" className={styles.navLink}>Clinical Dashboard</a></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
