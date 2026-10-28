/**
 * CareBridge — Patient Triage & Multilingual Prescription Portal
 * Module: data.js (Clinical Data Constants & Initial Application State)
 */

'use strict';

/**
 * List of critical clinical symptoms that automatically trigger urgent triage priority
 */
export const CRITICAL_SYMPTOMS = [
  'Chest Tightness / Dyspnea',
  'Severe Migraine / Vertigo',
  'Musculoskeletal Trauma'
];

/**
 * Priority tier configuration map
 */
export const PRIORITY_TIERS = {
  urgent: {
    label: 'Urgent (Tier 1)',
    badgeClass: 'pill-emergency',
    dotClass: 'alert',
    cardBorder: 'priority-emergency'
  },
  priority: {
    label: 'Priority (Tier 2)',
    badgeClass: 'pill-urgent',
    dotClass: 'warning',
    cardBorder: 'priority-urgent'
  },
  routine: {
    label: 'Routine (Tier 3)',
    badgeClass: 'pill-standard',
    dotClass: 'green',
    cardBorder: 'priority-standard'
  }
};

/**
 * Initial clinical patient triage queue
 */
export const INITIAL_PATIENT_QUEUE = [
  {
    id: 'P-101',
    name: 'Vikram Malhotra',
    mrn: 'MRN-72910',
    age: 58,
    tel: '+91 98201 11234',
    stream: 'Cardiology',
    painLevel: 9,
    symptoms: ['Chest Tightness / Dyspnea', 'High Fever (> 101°F)'],
    accommodations: ['Wheelchair Access', 'Audio Prescription'],
    priority: 'urgent',
    arrivalTime: '10:42 AM',
    notes: 'Retrosternal pressure, diaphoresis. SpO2: 92%, BP: 155/95.'
  },
  {
    id: 'P-102',
    name: 'Sunita Deshmukh',
    mrn: 'MRN-48201',
    age: 42,
    tel: '+91 98450 22345',
    stream: 'Orthopedic Trauma',
    painLevel: 6,
    symptoms: ['Musculoskeletal Trauma'],
    accommodations: ['Wheelchair Access', 'Sign Language Interpreter'],
    priority: 'priority',
    arrivalTime: '10:51 AM',
    notes: 'Suspected right distal radius fracture following fall. Peripheral pulse intact.'
  },
  {
    id: 'P-103',
    name: 'Aarav Patel',
    mrn: 'MRN-33129',
    age: 29,
    tel: '+91 97123 33456',
    stream: 'Pulmonology',
    painLevel: 3,
    symptoms: ['Acute Productive Cough'],
    accommodations: ['Large-Print Summary', 'Audio Prescription'],
    priority: 'routine',
    arrivalTime: '10:58 AM',
    notes: 'Persistent bronchial cough with clear sputum x 4 days. Afebrile.'
  },
  {
    id: 'P-104',
    name: 'Meera Joshi',
    mrn: 'MRN-61840',
    age: 64,
    tel: '+91 99234 44567',
    stream: 'Endocrinology',
    painLevel: 2,
    symptoms: ['Nausea / GI Distress'],
    accommodations: ['Large-Print Summary'],
    priority: 'routine',
    arrivalTime: '11:02 AM',
    notes: 'Mild postprandial nausea. Routine metabolic panel requested.'
  }
];

/**
 * Initial scheduled prescriptions with multilingual instructions
 */
export const INITIAL_PRESCRIPTIONS = [
  {
    id: 'med-1',
    name: 'Amlodipine Besylate',
    dosage: '5 mg',
    time: '08:00 AM',
    rawTime: '08:00',
    slot: 'Morning Dose',
    purpose: 'Antihypertensive',
    categoryTag: 'tag-cardio',
    taken: true,
    doctor: 'Dr. S. K. Rao (Cardiology)',
    caution: 'Avoid Grapefruit Juice',
    instructions: {
      en: 'Take 1 tablet in the morning at 08:00 AM with a full glass of water. Do not skip doses. Monitor blood pressure weekly.',
      hi: 'सुबह 08:00 बजे एक पूरे गिलास पानी के साथ 1 गोली लें। खुराक न छोड़ें। साप्ताहिक रूप से रक्तचाप की निगरानी करें।',
      mr: 'सकाळी 08:00 वाजता एका संपूर्ण ग्लास पाण्यासोबत 1 गोळी घ्या. डोस चुकवू नका. दर आठवड्याला रक्तदाब तपासा.'
    },
    translatedNames: {
      en: 'Amlodipine Besylate',
      hi: 'एम्लोडिपिन बेसिलेट',
      mr: 'अ‍ॅम्लोडिपाइन बेसिलेट'
    },
    translatedCategories: {
      en: 'Antihypertensive',
      hi: 'रक्तचाप रोधी (Antihypertensive)',
      mr: 'रक्तदाब विरोधी (Antihypertensive)'
    }
  },
  {
    id: 'med-2',
    name: 'Amoxicillin & Clavulanate (Augmentin)',
    dosage: '625 mg',
    time: '01:30 PM',
    rawTime: '13:30',
    slot: 'Afternoon Dose',
    purpose: 'Antibiotic',
    categoryTag: 'tag-antibiotic',
    taken: false,
    doctor: 'Dr. S. K. Rao (General Medicine)',
    caution: 'Must Take After Food',
    instructions: {
      en: 'Take 1 tablet by mouth twice daily immediately after meals for 7 days. Complete the entire prescribed course even if symptoms improve.',
      hi: 'भोजन के तुरंत बाद दिन में दो बार 1 गोली 7 दिनों तक लें। लक्षण बेहतर होने पर भी डॉक्टर द्वारा निर्धारित पूरा कोर्स अवश्य पूरा करें।',
      mr: 'जेवणानंतर लगेच दिवसातून दोनदा 1 गोळी 7 दिवस तोंडाने घ्या. लक्षणे सुधारली तरी लिहून दिलेला पूर्ण कोर्स पूर्ण करा.'
    },
    translatedNames: {
      en: 'Amoxicillin & Clavulanate (Augmentin)',
      hi: 'अमोक्सिसिलिन और क्लावुलानेट (ऑगमेंटिन)',
      mr: 'अमोक्सिसिलिन आणि क्लाव्ह्युलानेट (ऑगमेंटिन)'
    },
    translatedCategories: {
      en: 'Antibiotic',
      hi: 'एंटीबायोटिक (Antibiotic)',
      mr: 'अँटीबायोटिक (Antibiotic)'
    }
  },
  {
    id: 'med-3',
    name: 'Salbutamol (Albuterol) Inhaler',
    dosage: '100 mcg / puff',
    time: '06:00 PM',
    rawTime: '18:00',
    slot: 'Evening Dose',
    purpose: 'Bronchodilator',
    categoryTag: 'tag-respiratory',
    taken: true,
    doctor: 'Dr. P. Mehta (Pulmonology)',
    caution: 'Rinse Mouth After Use',
    instructions: {
      en: 'Inhale 2 puffs every 4 to 6 hours as needed for wheezing or shortness of breath. Rinse mouth thoroughly with water after inhalation.',
      hi: 'सांस फूलने या घबराहट होने पर आवश्यकतानुसार हर 4 से 6 घंटे में 2 पफ सांस द्वारा अंदर लें। इनहेलर उपयोग के बाद पानी से अच्छी तरह कुल्ला करें।',
      mr: 'घरघर किंवा श्वास घेण्यास अडचण आल्यास गरजेनुसार दर 4 ते 6 तासांनी 2 पफ श्वासावाटे घ्या. इनहेलर वापरल्यानंतर पाण्याने तोंड स्वच्छ धुवा.'
    },
    translatedNames: {
      en: 'Salbutamol (Albuterol) Inhaler',
      hi: 'साल्बुटामोल (अल्ब्युटेरॉल) इनहेलर',
      mr: 'साल्ब्युटामॉल (अल्ब्युटेरॉल) इनहेलर'
    },
    translatedCategories: {
      en: 'Bronchodilator',
      hi: 'श्वसन नलिका विस्तारक (Bronchodilator)',
      mr: 'श्वासनलिका विस्तारक (Bronchodilator)'
    }
  },
  {
    id: 'med-4',
    name: 'Metformin Hydrochloride',
    dosage: '500 mg',
    time: '08:30 PM',
    rawTime: '20:30',
    slot: 'Night Dose',
    purpose: 'Antidiabetic',
    categoryTag: 'tag-diabetes',
    taken: true,
    doctor: 'Dr. V. Nambiar (Endocrinology)',
    caution: 'Take With Food',
    instructions: {
      en: 'Take 1 tablet orally with dinner every evening. Swallow whole with water; do not crush or chew. Avoid alcohol consumption.',
      hi: 'प्रतिदिन शाम को रात्रिभोज के साथ 1 गोली मौखिक रूप से लें। पानी के साथ पूरी गोली निगलें, चबाएं नहीं। शराब के सेवन से बचें।',
      mr: 'दररोज संध्याकाळी रात्रीच्या जेवणासोबत 1 गोळी तोंडाने घ्या. पाण्यासोबत संपूर्ण गोळी गिळा, चावू नका. मद्यपान टाळा.'
    },
    translatedNames: {
      en: 'Metformin Hydrochloride',
      hi: 'मेटफॉर्मिन हाइड्रोक्लोराइड',
      mr: 'मेटफॉर्मिन हायड्रोक्लोराइड'
    },
    translatedCategories: {
      en: 'Antidiabetic',
      hi: 'मधुमेह रोधी (Antidiabetic)',
      mr: 'मधुमेह विरोधी (Antidiabetic)'
    }
  }
];

/**
 * Pre-filled sample patients for testing clinical intake
 */
export const SAMPLE_PATIENTS = [
  {
    name: 'Kavita Sundaram',
    mrn: 'MRN-91823',
    age: 52,
    tel: '+91 98201 44512',
    stream: 'Emergency Medicine',
    painLevel: 8,
    symptoms: ['Chest Tightness / Dyspnea', 'High Fever (> 101°F)'],
    accommodations: ['Wheelchair Access', 'Audio Prescription'],
    notes: 'Progressive substernal chest discomfort starting 2 hours prior to arrival. Known allergy to penicillin.'
  },
  {
    name: 'Devendra Chavan',
    mrn: 'MRN-55421',
    age: 38,
    tel: '+91 97654 32190',
    stream: 'Orthopedic Trauma',
    painLevel: 7,
    symptoms: ['Musculoskeletal Trauma'],
    accommodations: ['Wheelchair Access', 'Sign Language Interpreter'],
    notes: 'Closed trauma to left ankle after twisting injury during recreational sport. Bearing weight is intolerable.'
  },
  {
    name: 'Ananya Sen',
    mrn: 'MRN-24180',
    age: 67,
    tel: '+91 94331 88902',
    stream: 'Endocrinology / Diabetes',
    painLevel: 3,
    symptoms: ['Nausea / GI Distress'],
    accommodations: ['Large-Print Summary', 'Audio Prescription'],
    notes: 'Symptomatic fasting hypoglycemic tremor. Blood sugar corrected with glucose. Needs dose reconciliation.'
  }
];
