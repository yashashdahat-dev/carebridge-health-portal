/**
 * CareBridge — Footer Component
 * File: src/components/Footer.jsx
 */

import React from 'react';

export function Footer() {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-top-container">

        <div className="footer-brand-summary">
          <h3>CareBridge Health System</h3>
          <p>
            Emergency Department Triage &amp; Multilingual Ambulatory Care Portal.
            Built with accessible WCAG 2.1 AAA high-contrast tokens, Section 508 guidelines,
            and Emergency Severity Index (ESI) protocol integration.
          </p>
        </div>

        <div className="footer-compliance-section">
          <ul className="footer-compliance-list">
            <li>
              <span className="compliance-badge">WCAG 2.1 Level AAA</span>
              <span>High-Contrast &amp; Scalable Font Engine</span>
            </li>
            <li>
              <span className="compliance-badge">Section 508</span>
              <span>Full Keyboard &amp; Screen Reader Optimization</span>
            </li>
            <li>
              <span className="compliance-badge">Clinical ESI</span>
              <span>Emergency Severity Index Triage Protocols</span>
            </li>
          </ul>

          <p className="emergency-disclaimer">
            <strong>Important Clinical Advisory:</strong> In the event of an acute cardiovascular, neurological, or traumatic emergency, immediately notify the emergency physician or dial 108. CareBridge is an assistive workflow portal and does not replace professional clinical diagnosis.
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© 2026 CareBridge Health System. All clinical rights reserved. Secure Protected Health Information (PHI) Portal.</p>
          <p className="system-status">
            <span className="status-dot green" aria-hidden="true"></span>
            <span>System Status: <strong>All Clinical Services Operational</strong></span>
          </p>
        </div>
      </div>
    </footer>
  );
}

