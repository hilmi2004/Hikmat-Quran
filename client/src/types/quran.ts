export type TajweedRuleType =
  | 'ghunnah'
  | 'qalqalah'
  | 'idgham'
  | 'ikhfa'
  | 'izhar'
  | 'madd'
  | 'tafkhim'
  | 'iqlab'
  | 'tarqiq'
  | 'none';

export interface QuranWord {
  position: number;
  arabic: string;
  transliteration: string;
  translation: string;
  root?: string;
  partOfSpeech?: string;
  tajweedRule?: TajweedRuleType;
}

export interface TajweedToken {
  text: string;
  rule: TajweedRuleType;
  explanation?: string;
}

export interface Ayah {
  id: string; // e.g. "1:1"
  surahNumber: number;
  ayahNumber: number;
  juzNumber: number;
  pageNumber: number;
  hizbNumber?: number;
  textUthmani: string;
  textSimple: string; // diacritic-free for fuzzy search
  translationEnglish: string;
  transliteration: string;
  tafsir?: {
    source: string;
    text: string;
  };
  words: QuranWord[];
  tajweedTokens?: TajweedToken[];
  audioUrl?: string;
}

export interface Surah {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  totalAyahs: number;
  startPage: number;
  juzNumber: number;
}

export interface HifzItem {
  id: string; // "surah:ayah"
  surahNumber: number;
  ayahNumber: number;
  repetitions: number;
  intervalDays: number;
  easeFactor: number; // SM-2 default 2.5
  lastReviewedDate?: string;
  nextDueDate: string;
  strength: number; // 0-100
  history: Array<{
    date: string;
    grade: number; // 0 to 5
    accuracyScore: number;
  }>;
}

export interface MistakeRecord {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  wordIndex?: number;
  wordExpected: string;
  wordRecited?: string;
  mistakeType: 'skipped' | 'substituted' | 'pronunciation' | 'transition' | 'word_order' | 'extra';
  confidence: number;
  timestamp: string;
  notes?: string;
  resolved: boolean;
}

export interface TajweedLesson {
  id: string;
  courseNumber: number;
  lessonNumber: number;
  title: string;
  titleArabic: string;
  category: string;
  description: string;
  explanation: string;
  ruleName: TajweedRuleType;
  examples: Array<{
    arabic: string;
    surahAyah: string;
    highlightRule: string;
    note: string;
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  mastered: boolean;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  label?: string;
  createdAt: string;
}

export interface ReadingProgress {
  lastSurahNumber: number;
  lastAyahNumber: number;
  lastPageNumber: number;
  updatedAt: string;
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  style: 'Murattal' | 'Mujawwad' | 'Muallim (Teacher)';
  baseUrl: string;
}

export interface TajweedVoiceTestItem {
  id: string;
  category: 'makharij_contrast' | 'qalqalah' | 'ghunnah' | 'noon_sakinah' | 'madd' | 'tafkhim';
  title: string;
  titleArabic: string;
  targetRule: TajweedRuleType | 'contrast';
  targetArabic: string;
  transliteration: string;
  surahAyahRef?: string;
  audioAyahUrl?: string; // Sheikh Yasser Al-Dossary
  highlightLetter: string;
  confusedWith?: string;
  expectedPhonetics: string;
  coachingInstruction: string;
}

export interface TajweedVoiceEvaluationResult {
  accuracy: number; // 0-100
  passed: boolean;
  status: 'flawless' | 'good' | 'needs_practice' | 'silent' | 'incorrect';
  recognizedText: string;
  targetArabic: string;
  detectedRuleApplication: boolean;
  feedbackTitle: string;
  detailedFeedback: string;
  anatomicalTip: string;
  userAudioUrl?: string;
  qariAudioUrl?: string;
}

