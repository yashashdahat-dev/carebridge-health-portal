/**
 * CareBridge — AccessibilityToolbar Component
 * File: src/components/AccessibilityToolbar.jsx
 * 
 * Provides theme selection, text scaling, dyslexia wide-spacing,
 * multilingual switching, and global speech playback controls.
 */

import React from 'react';
import { useCareBridge } from '../context/CareBridgeContext.jsx';

export function AccessibilityToolbar({ onReadAllPrescriptions }) {
  const {
    theme,
    setTheme,
    fontScale,
    setFontScale,
    isWideSpacing,
    setIsWideSpacing,
    language,
    setLanguage,
    isGlobalSpeaking,
    stopAllSpeech,
    announce
  } = useCareBridge();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    announce(`Theme switched to ${newTheme.toUpperCase()}`, 'info');
  };

  const handleFontDecrease = () => {
    const scales = ['sm', 'md', 'lg', 'xl'];
    const idx = scales.indexOf(fontScale);
    if (idx > 0) {
      setFontScale(scales[idx - 1]);
      announce(`Text size decreased to ${scales[idx - 1]}`, 'info');
    }
  };

  const handleFontReset = () => {
    setFontScale('md');
    announce('Text size reset to default 100%', 'info');
  };

  const handleFontIncrease = () => {
    const scales = ['sm', 'md', 'lg', 'xl'];
    const idx = scales.indexOf(fontScale);
    if (idx < scales.length - 1) {
      setFontScale(scales[idx + 1]);
      announce(`Text size increased to ${scales[idx + 1]}`, 'info');
    }
  };

  const handleWideSpacingToggle = () => {
    const nextVal = !isWideSpacing;
    setIsWideSpacing(nextVal);
    announce(`Wide text spacing ${nextVal ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const names = { en: 'English', hi: 'Hindi (हिन्दी)', mr: 'Marathi (मराठी)' };
    announce(`Prescription language switched to ${names[lang] || lang}`, 'info');
  };

  return (
    <div className="accessibility-toolbar" role="region" aria-label="Accessibility and Language Settings">
      <div className="toolbar-container">
        
        {/* Contrast & Theme Switching */}
        <div className="toolbar-group" role="group" aria-labelledby="theme-label">
          <span id="theme-label" className="toolbar-label">
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            Theme:
          </span>
          <div className="button-group" role="radiogroup" aria-labelledby="theme-label">
            <button
              type="button"
              className={`btn-tool ${theme === 'light' ? 'active' : ''}`}
              role="radio"
              aria-checked={theme === 'light'}
              onClick={() => handleThemeChange('light')}
            >
              Light
            </button>
            <button
              type="button"
              className={`btn-tool ${theme === 'dark' ? 'active' : ''}`}
              role="radio"
              aria-checked={theme === 'dark'}
              onClick={() => handleThemeChange('dark')}
            >
              Dark
            </button>
            <button
              type="button"
              className={`btn-tool ${theme === 'high-contrast' ? 'active' : ''}`}
              role="radio"
              aria-checked={theme === 'high-contrast'}
              onClick={() => handleThemeChange('high-contrast')}
            >
              High-Contrast
            </button>
          </div>
        </div>

        {/* Text Size Scaling */}
        <div className="toolbar-group" role="group" aria-labelledby="fontsize-label">
          <span id="fontsize-label" className="toolbar-label">
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 7 4 4 20 4 20 7"></polyline>
              <line x1="9" y1="20" x2="15" y2="20"></line>
              <line x1="12" y1="4" x2="12" y2="20"></line>
            </svg>
            Text Size:
          </span>
          <div className="button-group">
            <button
              type="button"
              className={`btn-tool ${fontScale === 'sm' ? 'active' : ''}`}
              onClick={handleFontDecrease}
              aria-label="Decrease text size (A minus)"
            >
              A−
            </button>
            <button
              type="button"
              className={`btn-tool ${fontScale === 'md' ? 'active' : ''}`}
              onClick={handleFontReset}
              aria-label="Default text size (100 percent)"
            >
              100%
            </button>
            <button
              type="button"
              className={`btn-tool ${fontScale === 'lg' || fontScale === 'xl' ? 'active' : ''}`}
              onClick={handleFontIncrease}
              aria-label="Increase text size (A plus)"
            >
              A+
            </button>
          </div>
        </div>

        {/* Dyslexia / Wide Spacing Toggle */}
        <div className="toolbar-group">
          <button
            type="button"
            className={`btn-tool btn-toggle ${isWideSpacing ? 'active' : ''}`}
            aria-pressed={isWideSpacing}
            onClick={handleWideSpacingToggle}
          >
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <polyline points="6 8 2 12 6 16"></polyline>
              <polyline points="18 8 22 12 18 16"></polyline>
            </svg>
            <span>Wide Spacing</span>
          </button>
        </div>

        {/* Multilingual Language Selector */}
        <div className="toolbar-group" role="group" aria-labelledby="lang-label">
          <span id="lang-label" className="toolbar-label">
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            Language:
          </span>
          <div className="button-group" role="radiogroup" aria-labelledby="lang-label">
            <button
              type="button"
              className={`btn-tool ${language === 'en' ? 'active' : ''}`}
              role="radio"
              aria-checked={language === 'en'}
              onClick={() => handleLanguageChange('en')}
            >
              English
            </button>
            <button
              type="button"
              className={`btn-tool ${language === 'hi' ? 'active' : ''}`}
              role="radio"
              aria-checked={language === 'hi'}
              onClick={() => handleLanguageChange('hi')}
            >
              हिन्दी
            </button>
            <button
              type="button"
              className={`btn-tool ${language === 'mr' ? 'active' : ''}`}
              role="radio"
              aria-checked={language === 'mr'}
              onClick={() => handleLanguageChange('mr')}
            >
              मराठी
            </button>
          </div>
        </div>

        {/* Web Speech Audio Controls */}
        <div className="toolbar-group speech-controls-group">
          {isGlobalSpeaking ? (
            <button
              type="button"
              className="btn-tool btn-speech btn-speech-stop"
              onClick={stopAllSpeech}
              aria-label="Stop current audio reading"
            >
              <svg className="icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="6" width="12" height="12"></rect>
              </svg>
              <span>Stop Audio</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-tool btn-speech"
              onClick={onReadAllPrescriptions}
              aria-label="Read all active prescription instructions aloud"
            >
              <svg className="icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <span>Read Meds Aloud</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
