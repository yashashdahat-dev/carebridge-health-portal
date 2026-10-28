/**
 * CareBridge — Navigation Component (React Router NavLink)
 * File: src/components/Navigation.jsx
 * 
 * Demonstrates:
 * - <NavLink> route-aware active state highlighting (Task 06)
 * - Accessible keyboard navigation
 * - Scoped styling via Navigation.module.css
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCareBridge } from '../context/CareBridgeContext.jsx';
import styles from './Navigation.module.css';

export function Navigation() {
  const { patientQueue = [], prescriptions = [] } = useCareBridge();

  const urgentCount = patientQueue.filter((p) => p.priority === 'urgent').length;
  const pendingRxCount = prescriptions.filter((rx) => !rx.taken).length;

  return (
    <nav className={styles.navBar} aria-label="Clinical Navigation">
      <div className={styles.navContainer}>
        <ul className={styles.navLinksList}>
          
          <li className={styles.navItem}>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span>📊</span>
              <span>Clinical Dashboard</span>
            </NavLink>
          </li>

          <li className={styles.navItem}>
            <NavLink
              to="/patients"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span>🏥</span>
              <span>Patient Triage</span>
              {urgentCount > 0 ? (
                <span className={`${styles.badgeIndicator} ${styles.badgeUrgent}`} title={`${urgentCount} Urgent Patients`}>
                  {urgentCount} Urgent
                </span>
              ) : (
                <span className={styles.badgeIndicator}>
                  {patientQueue.length}
                </span>
              )}
            </NavLink>
          </li>

          <li className={styles.navItem}>
            <NavLink
              to="/prescriptions"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span>💊</span>
              <span>Prescription Portal</span>
              {pendingRxCount > 0 && (
                <span className={styles.badgeIndicator} title={`${pendingRxCount} Medications Pending`}>
                  {pendingRxCount} Due
                </span>
              )}
            </NavLink>
          </li>

          <li className={styles.navItem}>
            <NavLink
              to="/accessibility"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span>⚙️</span>
              <span>Accessibility Center</span>
            </NavLink>
          </li>

        </ul>

        <div className={styles.portalStatus} aria-live="polite">
          <span className={styles.statusDot} aria-hidden="true"></span>
          <span>Online Care Network</span>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

