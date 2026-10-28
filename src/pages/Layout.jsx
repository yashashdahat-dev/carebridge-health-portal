/**
 * CareBridge — Root Application Layout (React Router <Outlet>)
 * File: src/pages/Layout.jsx
 * 
 * Demonstrates:
 * - Nested layout component with <Outlet /> (Task 06)
 * - Persistent accessibility banner, header, navigation, and footer
 */

import React, { useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useCareBridge } from '../context/CareBridgeContext.jsx';
import { StatusBanner } from '../components/StatusBanner.jsx';
import { Header } from '../components/Header.jsx';
import { Navigation } from '../components/Navigation.jsx';
import { Footer } from '../components/Footer.jsx';
import styles from '../App.module.css';

export function Layout() {
  const { prescriptions, language, speak, announce } = useCareBridge();

  const handleReadAllPrescriptions = useCallback(() => {
    if (!prescriptions.length) {
      announce('No scheduled medications to read aloud.', 'info');
      return;
    }

    const lines = prescriptions.map((med, idx) => {
      const name = med.translatedNames?.[language] || med.name;
      const inst = med.instructions?.[language] || med.instructions?.en || '';
      return `Medication ${idx + 1}: ${name}. ${med.dosage}. Scheduled time: ${med.time}. Directions: ${inst}.`;
    });

    const fullSpeech =
      `Daily Prescription Regimen. Total ${prescriptions.length} medications scheduled. ` +
      lines.join(' Next medication: ');
    speak(fullSpeech, language, 'all-meds');
  }, [prescriptions, language, speak, announce]);

  return (
    <div className={styles.carebridgeAppRoot}>
      {/* Keyboard Accessible Skip Link */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main clinical content
      </a>

      {/* Screen Reader Live Region & Active Audio Bar */}
      <StatusBanner />

      {/* Header Landmark */}
      <Header onReadAllPrescriptions={handleReadAllPrescriptions} />

      {/* Route-Aware Navigation Bar (Task 06) */}
      <Navigation />

      {/* Main Routed Content (<Outlet />) */}
      <main id="main-content" className={styles.appMainContent}>
        <div className={styles.mainContentContainer}>
          <Outlet />
        </div>
      </main>

      {/* Footer Landmark */}
      <Footer />
    </div>
  );
}

export default Layout;

