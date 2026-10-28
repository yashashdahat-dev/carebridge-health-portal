/**
 * CareBridge — Patient Triage & Multilingual Prescription Reader
 * Accessible, Responsive Clinical Portal Controller
 */

'use strict';

(function () {
  // -------------------------------------------------------------------------
  // 1. DATA STORES & TRANSLATION DICTIONARIES
  // -------------------------------------------------------------------------
  
  // Multilingual translation map for pre-loaded and generated prescriptions
  const PRESCRIPTION_TRANSLATIONS = {
    'med-1': {
      en: {
        name: 'Amlodipine Besylate',
        category: 'Antihypertensive',
        strength: '5 mg • Oral Tablet',
        instruction: 'Take 1 tablet in the morning at 08:00 AM with a full glass of water. Do not skip doses. Monitor blood pressure weekly.',
        doctor: 'Dr. S. K. Rao (Cardiology)',
        caution: 'Avoid Grapefruit Juice'
      },
      hi: {
        name: 'एम्लोडिपिन बेसिलेट',
        category: 'रक्तचाप रोधी (Antihypertensive)',
        strength: '5 मि.ग्रा. • मौखिक गोली',
        instruction: 'सुबह 08:00 बजे एक पूरे गिलास पानी के साथ 1 गोली लें। खुराक न छोड़ें। साप्ताहिक रूप से रक्तचाप की निगरानी करें।',
        doctor: 'डॉ. एस. के. राव (कार्डियोलॉजी)',
        caution: 'चकोतरे (ग्रेपफ्रूट) का रस न पिएं'
      },
      mr: {
        name: 'अ‍ॅम्लोडिपाइन बेसिलेट',
        category: 'रक्तदाब विरोधी (Antihypertensive)',
        strength: '5 मि.ग्रॅ. • तोंडाने घ्यायची गोळी',
        instruction: 'सकाळी 08:00 वाजता एका संपूर्ण ग्लास पाण्यासोबत 1 गोळी घ्या. डोस चुकवू नका. दर आठवड्याला रक्तदाब तपासा.',
        doctor: 'डॉ. एस. के. राव (हृदयरोग तज्ज्ञ)',
        caution: 'मोसंबी/ग्रेपफ्रूटचा रस पिणे टाळा'
      }
    },
    'med-2': {
      en: {
        name: 'Amoxicillin & Clavulanate (Augmentin)',
        category: 'Antibiotic',
        strength: '625 mg • Oral Film-Coated Tablet',
        instruction: 'Take 1 tablet by mouth twice daily immediately after meals for 7 days. Complete the entire prescribed course even if symptoms improve.',
        doctor: 'Dr. S. K. Rao (General Medicine)',
        caution: 'Must Take After Food'
      },
      hi: {
        name: 'अमोक्सिसिलिन और क्लावुलानेट (ऑगमेंटिन)',
        category: 'एंटीबायोटिक (Antibiotic)',
        strength: '625 मि.ग्रा. • फिल्म-कोटेड गोली',
        instruction: 'भोजन के तुरंत बाद दिन में दो बार 1 गोली 7 दिनों तक लें। लक्षण बेहतर होने पर भी डॉक्टर द्वारा निर्धारित पूरा कोर्स अवश्य पूरा करें।',
        doctor: 'डॉ. एस. के. राव (जनरल मेडिसिन)',
        caution: 'भोजन के बाद ही सेवन करें'
      },
      mr: {
        name: 'अमोक्सिसिलिन आणि क्लाव्ह्युलानेट (ऑगमेंटिन)',
        category: 'अँटीबायोटिक (Antibiotic)',
        strength: '625 मि.ग्रॅ. • फिल्म-कोटेड गोळी',
        instruction: 'जेवणानंतर लगेच दिवसातून दोनदा 1 गोळी 7 दिवस तोंडाने घ्या. लक्षणे सुधारली तरी लिहून दिलेला पूर्ण कोर्स पूर्ण करा.',
        doctor: 'डॉ. एस. के. राव (जनरल मेडिसिन)',
        caution: 'जेवणानंतरच घेणे अनिवार्य आहे'
      }
    },
    'med-3': {
      en: {
        name: 'Salbutamol (Albuterol) Inhaler',
        category: 'Bronchodilator',
        strength: '100 mcg / actuation • Metered Dose Inhaler',
        instruction: 'Inhale 2 puffs every 4 to 6 hours as needed for wheezing or shortness of breath. Rinse mouth thoroughly with water after inhalation.',
        doctor: 'Dr. P. Mehta (Pulmonology)',
        caution: 'Rinse Mouth After Use'
      },
      hi: {
        name: 'साल्बुटामोल (अल्ब्युटेरॉल) इनहेलर',
        category: 'श्वसन नलिका विस्तारक (Bronchodilator)',
        strength: '100 एमसीजी / पफ • मीटर डोज इनहेलर',
        instruction: 'सांस फूलने या घबराहट होने पर आवश्यकतानुसार हर 4 से 6 घंटे में 2 पफ सांस द्वारा अंदर लें। इनहेलर उपयोग के बाद पानी से अच्छी तरह कुल्ला करें।',
        doctor: 'डॉ. पी. मेहता (पल्मोनोलॉजी)',
        caution: 'उपयोग के बाद कुल्ला अवश्य करें'
      },
      mr: {
        name: 'साल्ब्युटामॉल (अल्ब्युटेरॉल) इनहेलर',
        category: 'श्वासनलिका विस्तारक (Bronchodilator)',
        strength: '100 एमसीजी / पफ • मीटर डोस इनहेलर',
        instruction: 'घरघर किंवा श्वास घेण्यास अडचण आल्यास गरजेनुसार दर 4 ते 6 तासांनी 2 पफ श्वासावाटे घ्या. इनहेलर वापरल्यानंतर पाण्याने तोंड स्वच्छ धुवा.',
        doctor: 'डॉ. पी. मेहता (फुफ्फुस तज्ज्ञ)',
        caution: 'वापरानंतर गुळण्या करा'
      }
    },
    'med-4': {
      en: {
        name: 'Metformin Hydrochloride',
        category: 'Antidiabetic',
        strength: '500 mg • Extended Release Tablet',
        instruction: 'Take 1 tablet orally with dinner every evening. Swallow whole with water; do not crush or chew. Avoid alcohol consumption.',
        doctor: 'Dr. V. Nambiar (Endocrinology)',
        caution: 'Take With Food'
      },
      hi: {
        name: 'मेटफॉर्मिन हाइड्रोक्लोराइड',
        category: 'मधुमेह रोधी (Antidiabetic)',
        strength: '500 मि.ग्रा. • एक्सटेंडेड रिलीज गोली',
        instruction: 'प्रतिदिन शाम को रात्रिभोज के साथ 1 गोली मौखिक रूप से लें। पानी के साथ पूरी गोली निगलें, चबाएं नहीं। शराब के सेवन से बचें।',
        doctor: 'डॉ. वी. नांबियार (एंडोक्रिनोलॉजी)',
        caution: 'भोजन के साथ लें'
      },
      mr: {
        name: 'मेटफॉर्मिन हायड्रोक्लोराइड',
        category: 'मधुमेह विरोधी (Antidiabetic)',
        strength: '500 मि.ग्रॅ. • एक्स्टेंडेड रिलीज गोळी',
        instruction: 'दररोज संध्याकाळी रात्रीच्या जेवणासोबत 1 गोळी तोंडाने घ्या. पाण्यासोबत संपूर्ण गोळी गिळा, चावू नका. मद्यपान टाळा.',
        doctor: 'डॉ. वी. नांबियार (मधुमेह तज्ज्ञ)',
        caution: 'जेवणासोबत घ्या'
      }
    }
  };

  // State
  let currentLanguage = 'en';
  let isWideSpacing = false;
  let activeSpeechUtterance = null;
  let isReadingAll = false;

  // -------------------------------------------------------------------------
  // 2. DOM REFERENCES
  // -------------------------------------------------------------------------
  const dom = {
    html: document.documentElement,
    liveAnnouncer: document.getElementById('live-announcer'),
    liveClock: document.getElementById('live-clock'),

    // Toolbar
    themeBtns: {
      light: document.getElementById('theme-light-btn'),
      dark: document.getElementById('theme-dark-btn'),
      hc: document.getElementById('theme-hc-btn')
    },
    fontBtns: {
      decrease: document.getElementById('font-decrease-btn'),
      reset: document.getElementById('font-reset-btn'),
      increase: document.getElementById('font-increase-btn')
    },
    wideSpacingBtn: document.getElementById('wide-spacing-btn'),
    langBtns: {
      en: document.getElementById('lang-en-btn'),
      hi: document.getElementById('lang-hi-btn'),
      mr: document.getElementById('lang-mr-btn')
    },
    globalSpeechBtn: document.getElementById('global-speech-btn'),
    stopSpeechBtn: document.getElementById('stop-speech-btn'),
    speechBtnText: document.getElementById('speech-btn-text'),
    speechBanner: document.getElementById('speech-status-banner'),
    speechReadingMsg: document.getElementById('speech-reading-message'),
    bannerStopSpeechBtn: document.getElementById('banner-stop-speech-btn'),

    // Triage Form
    triageForm: document.getElementById('triage-intake-form'),
    patientName: document.getElementById('patient-name'),
    patientMrn: document.getElementById('patient-mrn'),
    patientAge: document.getElementById('patient-age'),
    patientTel: document.getElementById('patient-tel'),
    patientArrivalDate: document.getElementById('patient-arrival-date'),
    visitCategory: document.getElementById('visit-category'),
    painRange: document.getElementById('pain-range'),
    painOutput: document.getElementById('pain-output'),
    clinicalNotes: document.getElementById('clinical-notes'),
    btnPrefillTriage: document.getElementById('btn-prefill-triage'),
    btnResetTriage: document.getElementById('btn-reset-triage'),

    // Queue
    queueList: document.getElementById('patient-queue-list'),
    queueCountBadge: document.getElementById('queue-count-badge'),
    statQueueCount: document.getElementById('stat-queue-count'),
    filterCountAll: document.getElementById('filter-count-all'),
    filterBtns: document.querySelectorAll('.btn-filter'),

    // Medications & Prescriptions
    activeLangBadge: document.getElementById('active-lang-badge'),
    btnReadAllMeds: document.getElementById('btn-read-all-meds'),
    addMedForm: document.getElementById('add-medication-form'),
    medNameInput: document.getElementById('med-name'),
    medDosageInput: document.getElementById('med-dosage'),
    medTimeInput: document.getElementById('med-time'),
    medFreqSelect: document.getElementById('med-frequency'),
    medInstructionType: document.getElementById('med-instruction-type'),
    medDoctorInput: document.getElementById('med-doctor'),
    prescriptionsGrid: document.getElementById('prescriptions-grid'),

    // Adherence
    topAdherenceProgress: document.getElementById('top-adherence-progress'),
    mainAdherenceProgress: document.getElementById('main-adherence-progress'),
    statAdherencePct: document.getElementById('stat-adherence-pct'),
    statAdherenceRatio: document.getElementById('stat-adherence-ratio'),
    adherenceScoreVal: document.getElementById('adherence-score-val'),
    adherenceRatioText: document.getElementById('adherence-ratio-text'),
    adherenceStatusMessage: document.getElementById('adherence-status-message'),
    statAccommodationsCount: document.getElementById('stat-accommodations-count')
  };

  // -------------------------------------------------------------------------
  // 3. ANNOUNCER & CLOCK UTILITIES
  // -------------------------------------------------------------------------
  
  /**
   * Send an accessible message to screen readers via aria-live="polite"
   * @param {string} message 
   */
  function announce(message) {
    if (!dom.liveAnnouncer) return;
    dom.liveAnnouncer.textContent = '';
    // Small timeout ensures screen readers re-trigger the announcement
    setTimeout(() => {
      dom.liveAnnouncer.textContent = message;
    }, 50);
  }

  /**
   * Update clinical clock continuously
   */
  function initClock() {
    function update() {
      const now = new Date();
      const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      if (dom.liveClock) {
        dom.liveClock.textContent = now.toLocaleDateString('en-US', options) + ' IST';
        dom.liveClock.setAttribute('datetime', now.toISOString());
      }
    }
    update();
    setInterval(update, 1000);

    // Default arrival date to today
    if (dom.patientArrivalDate) {
      const today = new Date().toISOString().split('T')[0];
      dom.patientArrivalDate.value = today;
    }
  }

  // -------------------------------------------------------------------------
  // 4. THEME & ACCESSIBILITY BAR CONTROLS
  // -------------------------------------------------------------------------

  function setTheme(theme) {
    dom.html.setAttribute('data-theme', theme);
    localStorage.setItem('carebridge_theme', theme);

    Object.values(dom.themeBtns).forEach(btn => {
      if (btn) {
        const matches = btn.getAttribute('data-theme-val') === theme;
        btn.classList.toggle('active', matches);
        btn.setAttribute('aria-checked', matches ? 'true' : 'false');
      }
    });

    const labelMap = {
      light: 'Standard Light Clinical Mode',
      dark: 'Dark Contrast Mode',
      'high-contrast': 'WCAG AAA High-Contrast Yellow on Black'
    };
    announce(`Theme switched to ${labelMap[theme] || theme}`);
  }

  function initTheme() {
    const saved = localStorage.getItem('carebridge_theme') || 'light';
    setTheme(saved);

    dom.themeBtns.light?.addEventListener('click', () => setTheme('light'));
    dom.themeBtns.dark?.addEventListener('click', () => setTheme('dark'));
    dom.themeBtns.hc?.addEventListener('click', () => setTheme('high-contrast'));
  }

  // Font Scaling
  const fontSizes = ['sm', 'md', 'lg', 'xl'];
  let currentFontIdx = 1; // 'md' default

  function setFontSize(sizeIndex) {
    currentFontIdx = Math.max(0, Math.min(fontSizes.length - 1, sizeIndex));
    const sizeName = fontSizes[currentFontIdx];
    dom.html.setAttribute('data-font-size', sizeName);
    localStorage.setItem('carebridge_font_size', sizeName);

    dom.fontBtns.decrease?.classList.toggle('active', currentFontIdx === 0);
    dom.fontBtns.reset?.classList.toggle('active', currentFontIdx === 1);
    dom.fontBtns.increase?.classList.toggle('active', currentFontIdx >= 2);

    const labels = { sm: '88% (Decreased)', md: '100% (Default)', lg: '118% (Large)', xl: '135% (Extra Large)' };
    announce(`Clinical text size adjusted to ${labels[sizeName]}`);
  }

  function initFontScaling() {
    const saved = localStorage.getItem('carebridge_font_size') || 'md';
    const idx = fontSizes.indexOf(saved);
    setFontSize(idx !== -1 ? idx : 1);

    dom.fontBtns.decrease?.addEventListener('click', () => setFontSize(currentFontIdx - 1));
    dom.fontBtns.reset?.addEventListener('click', () => setFontSize(1));
    dom.fontBtns.increase?.addEventListener('click', () => setFontSize(currentFontIdx + 1));
  }

  // Wide Spacing Toggle
  function initWideSpacing() {
    dom.wideSpacingBtn?.addEventListener('click', () => {
      isWideSpacing = !isWideSpacing;
      if (isWideSpacing) {
        dom.html.setAttribute('data-text-spacing', 'wide');
        dom.wideSpacingBtn.setAttribute('aria-pressed', 'true');
        announce('Wide text spacing enabled for enhanced readability.');
      } else {
        dom.html.removeAttribute('data-text-spacing');
        dom.wideSpacingBtn.setAttribute('aria-pressed', 'false');
        announce('Standard text spacing restored.');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 5. MULTILINGUAL PRESCRIPTION SYSTEM
  // -------------------------------------------------------------------------

  function setLanguage(lang) {
    if (!['en', 'hi', 'mr'].includes(lang)) return;
    currentLanguage = lang;

    // Update buttons
    Object.entries(dom.langBtns).forEach(([k, btn]) => {
      if (btn) {
        const matches = k === lang;
        btn.classList.toggle('active', matches);
        btn.setAttribute('aria-checked', matches ? 'true' : 'false');
      }
    });

    const langNames = {
      en: 'English (EN)',
      hi: 'हिन्दी - Hindi (HI)',
      mr: 'मराठी - Marathi (MR)'
    };

    if (dom.activeLangBadge) {
      dom.activeLangBadge.textContent = langNames[lang];
    }

    // Translate all rendered cards
    translateAllPrescriptions(lang);

    announce(`Prescription language switched to ${langNames[lang]}. Instructions updated.`);
  }

  function translateAllPrescriptions(lang) {
    const cards = dom.prescriptionsGrid?.querySelectorAll('.med-card') || [];
    cards.forEach(card => {
      const medId = card.getAttribute('data-id');
      const instructionEl = card.querySelector('.instruction-text');
      const langTagEl = card.querySelector('.instruction-lang-tag');
      const medNameEl = card.querySelector('.med-name');
      const categoryEl = card.querySelector('.med-category-tag');
      const strengthEl = card.querySelector('.med-strength');
      const cautionEl = card.querySelector('.med-caution-tag');

      const data = PRESCRIPTION_TRANSLATIONS[medId];
      if (data && data[lang]) {
        const t = data[lang];
        if (instructionEl) instructionEl.textContent = t.instruction;
        if (medNameEl) medNameEl.textContent = t.name;
        if (categoryEl) categoryEl.textContent = t.category;
        if (strengthEl) strengthEl.textContent = t.strength;
        if (cautionEl && t.caution) cautionEl.textContent = t.caution;
      }

      const langLabels = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' };
      if (langTagEl) langTagEl.textContent = langLabels[lang] || 'English';
    });
  }

  function initLanguage() {
    dom.langBtns.en?.addEventListener('click', () => setLanguage('en'));
    dom.langBtns.hi?.addEventListener('click', () => setLanguage('hi'));
    dom.langBtns.mr?.addEventListener('click', () => setLanguage('mr'));
  }

  // -------------------------------------------------------------------------
  // 6. WEB SPEECH API (AUDIO READOUT)
  // -------------------------------------------------------------------------

  function getBestVoiceForLang(lang) {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (lang === 'hi') {
      return voices.find(v => v.lang.startsWith('hi')) || voices.find(v => v.lang.startsWith('hi-IN'));
    }
    if (lang === 'mr') {
      return (
        voices.find(v => v.lang.startsWith('mr')) ||
        voices.find(v => v.lang.startsWith('hi')) ||
        null
      );
    }
    // English
    return (
      voices.find(v => v.lang === 'en-IN') ||
      voices.find(v => v.lang === 'en-US') ||
      voices.find(v => v.lang.startsWith('en'))
    );
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isReadingAll = false;
    activeSpeechUtterance = null;
    hideSpeechBanner();
    if (dom.stopSpeechBtn) dom.stopSpeechBtn.classList.add('hidden');
    if (dom.speechBtnText) dom.speechBtnText.textContent = 'Listen to Prescriptions';
    announce('Audio readout stopped.');
  }

  function showSpeechBanner(message) {
    if (dom.speechBanner && dom.speechReadingMsg) {
      dom.speechReadingMsg.textContent = message;
      dom.speechBanner.classList.remove('hidden');
    }
    if (dom.stopSpeechBtn) dom.stopSpeechBtn.classList.remove('hidden');
    if (dom.speechBtnText) dom.speechBtnText.textContent = 'Audio Active...';
  }

  function hideSpeechBanner() {
    if (dom.speechBanner) dom.speechBanner.classList.add('hidden');
    if (dom.stopSpeechBtn) dom.stopSpeechBtn.classList.add('hidden');
    if (dom.speechBtnText) dom.speechBtnText.textContent = 'Listen to Prescriptions';
  }

  function speakText(text, lang = currentLanguage, onEndCallback = null) {
    if (!('speechSynthesis' in window)) {
      alert('Web Speech API is not supported in this browser. Please use a modern browser like Chrome, Edge, or Firefox.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for clear clinical comprehension
    utterance.pitch = 1.0;

    const langCodeMap = { en: 'en-US', hi: 'hi-IN', mr: 'mr-IN' };
    utterance.lang = langCodeMap[lang] || 'en-US';

    const voice = getBestVoiceForLang(lang);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      announce(`Playing audio instructions in ${lang.toUpperCase()}: ${text}`);
    };

    utterance.onend = () => {
      if (!isReadingAll) {
        hideSpeechBanner();
      }
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      hideSpeechBanner();
      if (onEndCallback) onEndCallback();
    };

    activeSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function readCardAloud(card) {
    const medName = card.querySelector('.med-name')?.textContent || 'Medication';
    const strength = card.querySelector('.med-strength')?.textContent || '';
    const time = card.querySelector('.time-pill')?.textContent.trim() || '';
    const instruction = card.querySelector('.instruction-text')?.textContent || '';
    const caution = card.querySelector('.med-caution-tag')?.textContent || '';

    let textToSpeak = '';
    if (currentLanguage === 'hi') {
      textToSpeak = `दवा का नाम: ${medName}। खुराक: ${strength}। समय: ${time}। निर्देश: ${instruction}। सावधानी: ${caution}।`;
    } else if (currentLanguage === 'mr') {
      textToSpeak = `औषधाचे नाव: ${medName}। डोस: ${strength}। वेळ: ${time}। सूचना: ${instruction}। काळजी: ${caution}।`;
    } else {
      textToSpeak = `Prescription for: ${medName}. Strength: ${strength}. Scheduled time: ${time}. Clinical directions: ${instruction}. Clinical precaution: ${caution}.`;
    }

    showSpeechBanner(`Reading: ${medName} (${currentLanguage.toUpperCase()})`);
    speakText(textToSpeak, currentLanguage);
  }

  function readAllPrescriptionsSequentially() {
    const cards = Array.from(dom.prescriptionsGrid?.querySelectorAll('.med-card') || []);
    if (cards.length === 0) return;

    isReadingAll = true;
    let index = 0;

    function playNext() {
      if (!isReadingAll || index >= cards.length) {
        isReadingAll = false;
        hideSpeechBanner();
        announce('Completed reading all scheduled medications.');
        return;
      }

      const card = cards[index];
      const medName = card.querySelector('.med-name')?.textContent || 'Medication';
      const strength = card.querySelector('.med-strength')?.textContent || '';
      const time = card.querySelector('.time-pill')?.textContent.trim() || '';
      const instruction = card.querySelector('.instruction-text')?.textContent || '';

      let text = '';
      if (currentLanguage === 'hi') {
        text = `दवा संख्या ${index + 1}: ${medName}, समय ${time}। ${instruction}`;
      } else if (currentLanguage === 'mr') {
        text = `औषध क्रमांक ${index + 1}: ${medName}, वेळ ${time}। ${instruction}`;
      } else {
        text = `Medication ${index + 1} of ${cards.length}: ${medName}, scheduled at ${time}. ${instruction}`;
      }

      showSpeechBanner(`Reading ${index + 1} of ${cards.length}: ${medName}`);
      index++;
      speakText(text, currentLanguage, () => {
        setTimeout(playNext, 800); // polite pause between prescriptions
      });
    }

    playNext();
  }

  function initSpeechControls() {
    dom.globalSpeechBtn?.addEventListener('click', () => {
      readAllPrescriptionsSequentially();
    });

    dom.btnReadAllMeds?.addEventListener('click', () => {
      readAllPrescriptionsSequentially();
    });

    dom.stopSpeechBtn?.addEventListener('click', stopSpeech);
    dom.bannerStopSpeechBtn?.addEventListener('click', stopSpeech);

    // Warm up voices on supported platforms
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }

  // -------------------------------------------------------------------------
  // 7. PATIENT TRIAGE FORM & LIVE PAIN SCALE
  // -------------------------------------------------------------------------

  function updatePainOutput(val) {
    if (!dom.painOutput) return;

    let text = '';
    let badgeClass = '';

    if (val <= 3) {
      text = `${val} — Mild Discomfort (Triage Level 4/5)`;
      badgeClass = 'pain-mild';
    } else if (val <= 6) {
      text = `${val} — Moderate Discomfort (Triage Level 3)`;
      badgeClass = 'pain-moderate';
    } else {
      text = `${val} — Severe Acute Pain (High Priority Triage)`;
      badgeClass = 'pain-severe';
    }

    dom.painOutput.textContent = text;
    dom.painOutput.className = `pain-output-badge ${badgeClass}`;

    // Highlight active ticks
    const ticks = document.querySelectorAll('.pain-meter-scale .tick');
    ticks.forEach((tick, i) => {
      const tickNum = i + 1;
      tick.classList.toggle('active', tickNum <= val);
      tick.classList.toggle('current', tickNum === Number(val));
    });
  }

  function initPainSlider() {
    if (!dom.painRange) return;
    dom.painRange.addEventListener('input', (e) => {
      updatePainOutput(Number(e.target.value));
    });
    updatePainOutput(Number(dom.painRange.value));
  }

  // Sample data autofill for rapid testing & realistic clinical presentation
  const SAMPLE_PATIENTS = [
    {
      name: 'Kavita Sundaram',
      mrn: 'MRN-91823',
      age: 52,
      tel: '+91 98201 44512',
      category: 'Emergency Medicine',
      pain: 8,
      symptoms: ['Chest Tightness / Dyspnea', 'High Fever (> 101°F)'],
      accommodations: ['Wheelchair Access', 'Audio Prescription'],
      notes: 'Patient reports progressive retrosternal pressure starting 2 hours ago. BP: 154/92. Penicillin allergy confirmed.'
    },
    {
      name: 'Devendra Chavan',
      mrn: 'MRN-55421',
      age: 38,
      tel: '+91 97654 32190',
      category: 'Orthopedic Trauma',
      pain: 7,
      symptoms: ['Musculoskeletal Trauma'],
      accommodations: ['Wheelchair Access', 'Sign Language Interpreter'],
      notes: 'Suspected right distal radius fracture following low-speed bicycle fall. Pulse present distally.'
    },
    {
      name: 'Ananya Sen',
      mrn: 'MRN-24180',
      age: 67,
      tel: '+91 94331 88902',
      category: 'Endocrinology / Diabetes',
      pain: 3,
      symptoms: ['Nausea / GI Distress'],
      accommodations: ['Large-Print Summary', 'Audio Prescription'],
      notes: 'Fasting hypoglycemia episode (CBG: 58 mg/dL) resolved with oral dextrose. Needs prescription review.'
    }
  ];
  let samplePatientIndex = 0;

  function prefillSamplePatient() {
    const p = SAMPLE_PATIENTS[samplePatientIndex % SAMPLE_PATIENTS.length];
    samplePatientIndex++;

    if (dom.patientName) dom.patientName.value = p.name;
    if (dom.patientMrn) dom.patientMrn.value = p.mrn;
    if (dom.patientAge) dom.patientAge.value = p.age;
    if (dom.patientTel) dom.patientTel.value = p.tel;
    if (dom.visitCategory) dom.visitCategory.value = p.category;
    if (dom.painRange) {
      dom.painRange.value = p.pain;
      updatePainOutput(p.pain);
    }
    if (dom.clinicalNotes) dom.clinicalNotes.value = p.notes;

    // Set symptoms checkboxes
    document.querySelectorAll('input[name="symptoms"]').forEach(cb => {
      cb.checked = p.symptoms.includes(cb.value);
    });

    // Set accommodations checkboxes
    document.querySelectorAll('input[name="accommodations"]').forEach(cb => {
      cb.checked = p.accommodations.includes(cb.value);
    });

    // Clear any previous error states
    clearValidationErrors(dom.triageForm);

    announce(`Form prefilled with sample patient: ${p.name}, Age ${p.age}. Ready for submission.`);
  }

  function validateInput(input, errorEl) {
    const isValid = input.checkValidity();
    input.setAttribute('aria-invalid', !isValid ? 'true' : 'false');
    if (errorEl) {
      errorEl.classList.toggle('hidden', isValid);
    }
    return isValid;
  }

  function clearValidationErrors(form) {
    if (!form) return;
    form.querySelectorAll('.form-control').forEach(ctrl => {
      ctrl.setAttribute('aria-invalid', 'false');
    });
    form.querySelectorAll('.form-error').forEach(err => {
      err.classList.add('hidden');
    });
  }

  function initTriageForm() {
    dom.btnPrefillTriage?.addEventListener('click', prefillSamplePatient);

    dom.btnResetTriage?.addEventListener('click', () => {
      clearValidationErrors(dom.triageForm);
      setTimeout(() => {
        updatePainOutput(Number(dom.painRange?.value || 4));
        announce('Triage form cleared.');
      }, 50);
    });

    // Real-time validation feedback on blur
    [dom.patientName, dom.patientMrn, dom.patientAge, dom.patientTel, dom.patientArrivalDate].forEach(field => {
      if (!field) return;
      const errorEl = document.getElementById(field.id.replace('patient-', '') + '-error');
      field.addEventListener('blur', () => validateInput(field, errorEl));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') {
          validateInput(field, errorEl);
        }
      });
    });

    // Form Submission
    dom.triageForm?.addEventListener('submit', (e) => {
      e.preventDefault();

      let isFormValid = true;
      const requiredFields = [
        { el: dom.patientName, err: document.getElementById('name-error') },
        { el: dom.patientMrn, err: document.getElementById('mrn-error') },
        { el: dom.patientAge, err: document.getElementById('age-error') },
        { el: dom.patientTel, err: document.getElementById('tel-error') },
        { el: dom.patientArrivalDate, err: document.getElementById('date-error') }
      ];

      requiredFields.forEach(f => {
        if (f.el && !validateInput(f.el, f.err)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        const firstInvalid = dom.triageForm.querySelector('[aria-invalid="true"]');
        firstInvalid?.focus();
        announce('Triage form contains errors. Please correct the highlighted fields.');
        return;
      }

      // Collect data
      const painScore = Number(dom.painRange.value);
      const symptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(cb => cb.value);
      const accommodations = Array.from(document.querySelectorAll('input[name="accommodations"]:checked')).map(cb => cb.value);
      const category = dom.visitCategory.value;

      // Calculate Clinical Triage Priority
      let priority = 'standard';
      let priorityLabel = 'Standard (Level 3)';
      let pillClass = 'pill-standard';
      let dotClass = 'green';

      const isHighSymptom = symptoms.some(s => s.includes('Chest') || s.includes('Trauma'));
      if (painScore >= 8 || isHighSymptom) {
        priority = 'emergency';
        priorityLabel = 'Emergency (Level 1)';
        pillClass = 'pill-emergency';
        dotClass = 'alert';
      } else if (painScore >= 5 || symptoms.includes('High Fever (> 101°F)')) {
        priority = 'urgent';
        priorityLabel = 'Urgent (Level 2)';
        pillClass = 'pill-urgent';
        dotClass = 'warning';
      }

      // Format current time for <time>
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timeVal = now.toISOString().slice(11, 16);
      const patientId = 'P-' + Math.floor(1000 + Math.random() * 9000);

      // Create new patient card
      const newCard = document.createElement('article');
      newCard.className = `patient-card priority-${priority}`;
      newCard.setAttribute('data-priority', priority);
      newCard.setAttribute('data-id', patientId);
      newCard.setAttribute('tabindex', '0');
      newCard.setAttribute('aria-labelledby', `${patientId}-name`);

      // Pain tag class
      const painTagClass = painScore >= 7 ? 'pain-high' : (painScore >= 4 ? 'pain-mod' : 'pain-low');

      // Accommodations badges
      const accBadgesHtml = accommodations.map(acc => {
        if (acc.includes('Wheelchair')) return `<span class="acc-tag" title="Wheelchair Required">♿ Wheelchair</span>`;
        if (acc.includes('Sign')) return `<span class="acc-tag" title="Sign Language Interpreter">🤟 Sign Lang</span>`;
        if (acc.includes('Large')) return `<span class="acc-tag" title="Large Print Summary">🖨️ Large Print</span>`;
        if (acc.includes('Audio')) return `<span class="acc-tag" title="Audio Prescription">🔊 Audio Rx</span>`;
        return `<span class="acc-tag">${acc}</span>`;
      }).join('');

      // Symptom tags
      const symptomsHtml = symptoms.length > 0 
        ? symptoms.slice(0, 2).map(s => `<span class="tag-symptom">${s}</span>`).join('')
        : `<span class="tag-symptom">Routine Ambulatory</span>`;

      newCard.innerHTML = `
        <div class="patient-card-top">
          <span class="priority-pill ${pillClass}">
            <span class="status-dot ${dotClass}" aria-hidden="true"></span>
            ${priorityLabel}
          </span>
          <div class="arrival-time">
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Arrived: <time datetime="${timeVal}">${timeStr}</time>
          </div>
        </div>

        <div class="patient-info">
          <h3 id="${patientId}-name" class="patient-name">${dom.patientName.value}</h3>
          <p class="patient-meta">
            <span>MRN: <strong>${dom.patientMrn.value}</strong></span> • 
            <span>Age: <strong>${dom.patientAge.value} Yrs</strong></span> • 
            <span>Stream: <strong>${category}</strong></span>
          </p>
        </div>

        <div class="patient-clinical-tags">
          ${symptomsHtml}
          <span class="tag-pain ${painTagClass}">Pain: ${painScore}/10</span>
        </div>

        <div class="patient-accommodations-row" aria-label="Requested Accommodations">
          ${accBadgesHtml}
        </div>

        <div class="patient-card-actions">
          <button type="button" class="btn btn-sm btn-call" data-action="call" data-patient="${dom.patientName.value}">
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            Call Patient
          </button>
          <button type="button" class="btn btn-sm btn-complete" data-action="complete" data-id="${patientId}">
            Mark Examined
          </button>
        </div>
      `;

      // Insert at appropriate priority position (emergency first)
      if (priority === 'emergency') {
        dom.queueList?.prepend(newCard);
      } else {
        dom.queueList?.appendChild(newCard);
      }

      // Update counters
      updateQueueStats();

      // Reset form
      const submittedPatient = dom.patientName.value;
      dom.triageForm.reset();
      clearValidationErrors(dom.triageForm);
      updatePainOutput(4);

      // Announcement & smooth focus
      announce(`Triage intake confirmed. Patient ${submittedPatient} enqueued with ${priorityLabel}.`);
      newCard.focus();
    });
  }

  // -------------------------------------------------------------------------
  // 8. LIVE PATIENT QUEUE ACTIONS & FILTERING
  // -------------------------------------------------------------------------

  function updateQueueStats() {
    const cards = dom.queueList?.querySelectorAll('.patient-card') || [];
    const totalCount = cards.length;

    let emergencyCount = 0;
    let urgentCount = 0;
    let standardCount = 0;

    cards.forEach(card => {
      const p = card.getAttribute('data-priority');
      if (p === 'emergency') emergencyCount++;
      else if (p === 'urgent') urgentCount++;
      else standardCount++;
    });

    if (dom.queueCountBadge) dom.queueCountBadge.textContent = totalCount;
    if (dom.statQueueCount) dom.statQueueCount.textContent = totalCount;
    if (dom.filterCountAll) dom.filterCountAll.textContent = totalCount;

    // Update accommodation count estimate
    const accTags = dom.queueList?.querySelectorAll('.acc-tag') || [];
    if (dom.statAccommodationsCount) {
      dom.statAccommodationsCount.textContent = accTags.length;
    }
  }

  function filterQueue(priorityFilter) {
    const cards = dom.queueList?.querySelectorAll('.patient-card') || [];
    cards.forEach(card => {
      const p = card.getAttribute('data-priority');
      if (priorityFilter === 'all' || p === priorityFilter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });

    dom.filterBtns.forEach(btn => {
      const active = btn.getAttribute('data-filter') === priorityFilter;
      btn.classList.toggle('active', active);
    });

    announce(`Patient queue filtered by: ${priorityFilter.toUpperCase()}`);
  }

  function initQueueInteractions() {
    // Queue Filter Buttons
    dom.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        filterQueue(filter);
      });
    });

    // Queue Card Action Delegator
    dom.queueList?.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const action = target.getAttribute('data-action');
      if (action === 'call') {
        const patientName = target.getAttribute('data-patient') || 'Patient';
        const callText = `Calling patient ${patientName} to Station 4B for clinical assessment.`;
        speakText(callText, 'en');
        announce(callText);
      } else if (action === 'complete') {
        const card = target.closest('.patient-card');
        const patientName = card.querySelector('.patient-name')?.textContent || 'Patient';
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        setTimeout(() => {
          card.remove();
          updateQueueStats();
          announce(`Patient ${patientName} examination complete and discharged from triage queue.`);
        }, 300);
      }
    });
  }

  // -------------------------------------------------------------------------
  // 9. PRESCRIPTION SYSTEM & ADD MEDICATION FORM
  // -------------------------------------------------------------------------

  function initPrescriptionGridInteractions() {
    dom.prescriptionsGrid?.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const action = btn.getAttribute('data-action');
      const card = btn.closest('.med-card');
      if (!card) return;

      if (action === 'speak-card') {
        readCardAloud(card);
      } else if (action === 'toggle-taken') {
        const isTaken = card.getAttribute('data-taken') === 'true';
        const newState = !isTaken;
        card.setAttribute('data-taken', newState ? 'true' : 'false');
        btn.setAttribute('aria-pressed', newState ? 'true' : 'false');

        // Toggle card visual state
        card.classList.toggle('status-taken', newState);
        card.classList.toggle('status-pending', !newState);
        btn.classList.toggle('taken', newState);

        const btnSpan = btn.querySelector('span');
        if (btnSpan) {
          btnSpan.textContent = newState ? 'Completed' : 'Mark as Taken';
        }

        const medName = card.querySelector('.med-name')?.textContent || 'Medication';
        const statusPill = card.querySelector('.med-status-pill');
        if (statusPill) {
          if (newState) {
            statusPill.className = 'med-status-pill pill-taken';
            statusPill.innerHTML = `
              <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Taken Today
            `;
          } else {
            statusPill.className = 'med-status-pill pill-pending';
            statusPill.textContent = 'Due Next';
          }
        }

        updateAdherenceProgress();
        announce(`${medName} marked as ${newState ? 'taken' : 'pending'}. Adherence updated.`);
      }
    });
  }

  function initAddMedicationForm() {
    dom.addMedForm?.addEventListener('submit', (e) => {
      e.preventDefault();

      let isFormValid = true;
      const fields = [
        { el: dom.medNameInput, err: document.getElementById('med-name-err') },
        { el: dom.medDosageInput, err: document.getElementById('med-dose-err') },
        { el: dom.medTimeInput, err: document.getElementById('med-time-err') }
      ];

      fields.forEach(f => {
        if (f.el && !validateInput(f.el, f.err)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        dom.addMedForm.querySelector('[aria-invalid="true"]')?.focus();
        announce('Add medication form contains errors. Please complete all required fields.');
        return;
      }

      const medName = dom.medNameInput.value.trim();
      const dosage = dom.medDosageInput.value.trim();
      const timeVal = dom.medTimeInput.value;
      const freq = dom.medFreqSelect.value;
      const foodType = dom.medInstructionType.value;
      const doctor = dom.medDoctorInput.value || 'Dr. S. K. Rao, MD';

      // Format 12-hour time string
      const [h, m] = timeVal.split(':');
      const hourNum = parseInt(h, 10);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const formattedHour = (hourNum % 12) || 12;
      const timeDisplay = `${String(formattedHour).padStart(2, '0')}:${m} ${ampm}`;

      const newMedId = 'med-' + (Date.now());

      // Generate instructions in 3 languages
      const foodText = {
        'after-food': {
          en: 'immediately after meals with water',
          hi: 'भोजन के तुरंत बाद पानी के साथ',
          mr: 'जेवणानंतर लगेच पाण्यासोबत'
        },
        'before-food': {
          en: 'on an empty stomach (30 minutes before food)',
          hi: 'खाली पेट (भोजन से 30 मिनट पहले)',
          mr: 'रिकाम्या पोटी (जेवणापूर्वी 30 मिनिटे)'
        },
        'with-food': {
          en: 'with meals to prevent stomach upset',
          hi: 'पेट की गड़बड़ी से बचने के लिए भोजन के साथ',
          mr: 'पोटाचा त्रास टाळण्यासाठी जेवणासोबत'
        },
        'independent': {
          en: 'with or without food',
          hi: 'भोजन के साथ या बिना भोजन के',
          mr: 'जेवणासोबत किंवा जेवणाशिवाय'
        }
      }[foodType] || { en: 'with water', hi: 'पानी के साथ', mr: 'पाण्यासोबत' };

      PRESCRIPTION_TRANSLATIONS[newMedId] = {
        en: {
          name: medName,
          category: 'Clinical Prescription',
          strength: `${dosage} • Oral Formulation`,
          instruction: `Take ${dosage} ${foodText.en} as prescribed (${freq}). Do not exceed recommended dosage.`,
          doctor: doctor,
          caution: 'Verify with Clinical Pharmacist'
        },
        hi: {
          name: medName,
          category: 'चिकित्सीय पर्ची (Prescription)',
          strength: `${dosage} • मौखिक दवा`,
          instruction: `${dosage} खुराक ${foodText.hi} लें (${freq})। अनुशंसित खुराक से अधिक न लें।`,
          doctor: doctor,
          caution: 'फार्मासिस्ट से परामर्श लें'
        },
        mr: {
          name: medName,
          category: 'वैद्यकीय प्रिस्क्रिप्शन (Prescription)',
          strength: `${dosage} • तोंडाने घ्यायचे औषध`,
          instruction: `${dosage} डोस ${foodText.mr} घ्या (${freq})। डॉक्टरांनी सांगितलेल्या प्रमाणापेक्षा जास्त घेऊ नका.`,
          doctor: doctor,
          caution: 'फार्मासिस्टकडून खात्री करा'
        }
      };

      // Create new medication card element
      const card = document.createElement('article');
      card.className = 'med-card status-pending';
      card.setAttribute('data-id', newMedId);
      card.setAttribute('data-taken', 'false');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-labelledby', `${newMedId}-title`);

      const t = PRESCRIPTION_TRANSLATIONS[newMedId][currentLanguage];
      const langLabels = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' };

      card.innerHTML = `
        <div class="med-card-header">
          <div class="med-identity">
            <span class="med-category-tag tag-respiratory">${t.category}</span>
            <h3 id="${newMedId}-title" class="med-name">${t.name}</h3>
            <span class="med-strength">${t.strength}</span>
          </div>
          
          <div class="med-timing">
            <time datetime="${timeVal}" class="time-pill">
              <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${timeDisplay}
            </time>
            <span class="med-status-pill pill-pending">Due Next</span>
          </div>
        </div>

        <div class="med-instructions-box">
          <div class="instruction-header">
            <span class="instruction-title">Dose Instructions &amp; Safety Guidance:</span>
            <span class="instruction-lang-tag">${langLabels[currentLanguage]}</span>
          </div>
          <p class="instruction-text">${t.instruction}</p>
        </div>

        <div class="med-meta-row">
          <span class="med-doctor-tag">${doctor}</span>
          <span class="med-caution-tag">${t.caution}</span>
        </div>

        <div class="med-card-actions">
          <button type="button" class="btn btn-audio-card" data-action="speak-card" aria-label="Listen to ${medName} instructions aloud">
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <span>Listen Aloud</span>
          </button>

          <button type="button" class="btn btn-toggle-taken" data-action="toggle-taken" data-id="${newMedId}" aria-pressed="false">
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Mark as Taken</span>
          </button>
        </div>
      `;

      dom.prescriptionsGrid?.appendChild(card);
      dom.addMedForm.reset();
      clearValidationErrors(dom.addMedForm);
      updateAdherenceProgress();

      announce(`Prescription for ${medName} scheduled at ${timeDisplay} added to patient regimen.`);
      card.focus();
    });
  }

  // -------------------------------------------------------------------------
  // 10. DAILY MEDICATION ADHERENCE PROGRESS MONITOR (<progress>)
  // -------------------------------------------------------------------------

  function updateAdherenceProgress() {
    const cards = dom.prescriptionsGrid?.querySelectorAll('.med-card') || [];
    const total = cards.length;
    if (total === 0) return;

    let taken = 0;
    cards.forEach(card => {
      if (card.getAttribute('data-taken') === 'true') {
        taken++;
      }
    });

    const percentage = Math.round((taken / total) * 100);

    // Update <progress> elements
    if (dom.topAdherenceProgress) {
      dom.topAdherenceProgress.value = percentage;
      dom.topAdherenceProgress.textContent = `${percentage}%`;
    }
    if (dom.mainAdherenceProgress) {
      dom.mainAdherenceProgress.value = percentage;
      dom.mainAdherenceProgress.textContent = `${percentage}%`;
    }

    // Update text labels
    if (dom.statAdherencePct) dom.statAdherencePct.textContent = `${percentage}%`;
    if (dom.statAdherenceRatio) dom.statAdherenceRatio.textContent = `${taken} of ${total} doses taken`;
    if (dom.adherenceScoreVal) dom.adherenceScoreVal.textContent = `${percentage}%`;
    if (dom.adherenceRatioText) dom.adherenceRatioText.textContent = `${taken} of ${total} Doses Logged`;

    // Dynamic feedback message
    if (dom.adherenceStatusMessage) {
      if (percentage === 100) {
        dom.adherenceStatusMessage.textContent = 'Excellent Clinical Adherence: 100% of all scheduled doses completed today.';
      } else if (percentage >= 70) {
        dom.adherenceStatusMessage.textContent = `Optimal Adherence Recorded: ${percentage}% completed (${taken}/${total} doses logged). On track.`;
      } else if (percentage >= 40) {
        dom.adherenceStatusMessage.textContent = `Moderate Adherence: ${percentage}% completed (${taken}/${total} doses logged). Remaining doses scheduled.`;
      } else {
        dom.adherenceStatusMessage.textContent = `Attention Required: Only ${percentage}% adherence logged today. Follow up with patient.`;
      }
    }
  }

  // -------------------------------------------------------------------------
  // 11. INITIALIZATION ON DOM READY
  // -------------------------------------------------------------------------
  function init() {
    initClock();
    initTheme();
    initFontScaling();
    initWideSpacing();
    initLanguage();
    initSpeechControls();
    initPainSlider();
    initTriageForm();
    initQueueInteractions();
    initPrescriptionGridInteractions();
    initAddMedicationForm();
    updateAdherenceProgress();
    updateQueueStats();

    // Welcome Screen Reader Announcement
    announce('CareBridge Clinical Portal loaded. Ready for patient triage and accessible prescription management.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
