/**
 * CareBridge — Footer Component
 * File: src/components/Footer.jsx
 * Styled via CSS Modules: Footer.module.css
 */

import React from 'react';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.appFooter} role="contentinfo">
      <div className={styles.footerTopContainer}>
        
        <div className={styles.footerBrandSummary}>
          <h3>CareBridge Health System</h3>
          <p>
            Emergency Department Triage &amp; Multilingual Ambulatory Care Portal.
            Built with accessible WCAG 2.1 AAA high-contrast tokens, Section 508 guidelines,
            and Emergency Severity Index (ESI) protocol integration.
          </p>
        </div>

        <div>
          <ul className={styles.footerComplianceList}>
            <li>
              <span className={styles.complianceBadge}>WCAG 2.1 Level AAA</span>
              <span>High-Contrast &amp; Scalable Font Engine</span>
            </li>
            <li>
              <span className={styles.complianceBadge}>Section 508</span>
              <span>Full Keyboard &amp; Screen Reader Optimization</span>
            </li>
            <li>
              <span className={styles.complianceBadge}>Clinical ESI</span>
              <span>Emergency Severity Index Triage Protocols</span>
            </li>
          </ul>

          <p className={styles.emergencyDisclaimer}>
            <strong>Important Clinical Advisory:</strong> In the event of an acute cardiovascular, neurological, or traumatic emergency, immediately notify the emergency physician or dial 108. CareBridge is an assistive workflow portal and does not replace professional clinical diagnosis.
          </p>
        </div>

      </div>

      <div className={styles.footerBottom}>
        <div className={styles.footerBottomContainer}>
          <p>© 2026 CareBridge Health System. All clinical rights reserved. Secure Protected Health Information (PHI) Portal.</p>
          <div>
            <span className={styles.statusDot} aria-hidden="true"></span>
            <span>System Status: <strong>All Clinical Services Operational</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
