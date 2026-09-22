import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle, 
  Volume2, 
  Sparkles, 
  Mic, 
  Layers, 
  ShieldCheck,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { db } from '../db/quranDexieDB';
import { TajweedLesson } from '../types/quran';
import { TajweedVoiceStudio } from '../components/tajweed/TajweedVoiceStudio';

export const Learn: React.FC = () => {
  const [lessons, setLessons] = useState<TajweedLesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>('tajweed-8');
  const [activeTab, setActiveTab] = useState<'makharij' | 'curriculum' | 'voice_studio'>('voice_studio');
  const [selectedVoiceStudioItemId, setSelectedVoiceStudioItemId] = useState<string>('makhraj-qaf-kaf');

  // Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  // Makharij Anatomical Trainer State
  const [selectedRegion, setSelectedRegion] = useState<string>('al-lisan');
  const [selectedContrastPair, setSelectedContrastPair] = useState<{
    letter1: string;
    letter2: string;
    name1: string;
    name2: string;
    explanation: string;
  }>({
    letter1: 'ق',
    letter2: 'ك',
    name1: 'Qāf (Deep heavy)',
    name2: 'Kāf (Light mid-palate)',
    explanation: 'Qaf articulates from the extreme back of the tongue raised against the soft palate with heavy elevation (Isti’la). Kaf articulates slightly lower where soft and hard palates meet with air release (Hams).'
  });

  const [recordedComparisonFeedback, setRecordedComparisonFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadLessons() {
      await db.initializeSeedData();
      const list = await db.tajweedLessons.toArray();
      setLessons(list);
    }
    loadLessons();
  }, []);

  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];

  const handleQuizSubmit = (optionIndex: number) => {
    setSelectedQuizAnswer(optionIndex);
    setIsAnswerSubmitted(true);
  };

  const anatomicalRegions = [
    { id: 'al-jawf', name: 'Al-Jawf (الجَوْف)', english: 'The Oral & Chest Cavity', letters: 'ا / و / ي', desc: 'The open empty space of the throat and mouth. Origin of the 3 lengthened letters of Madd.' },
    { id: 'al-halq', name: 'Al-Halq (الحَلْق)', english: 'The Throat', letters: 'ء هـ / ع ح / غ خ', desc: 'Bottom throat (ء, هـ), middle throat (ع, ح), and upper throat nearest tongue (غ, خ).' },
    { id: 'al-lisan', name: 'Al-Lisan (اللِّسَان)', english: 'The Tongue (18 Letters)', letters: 'ق ك ج ش ي ض ل ن ر ط د ت ص ز س ظ ذ ث', desc: 'The primary articulatory organ containing 10 specific articulation points.' },
    { id: 'ash-shafatan', name: 'Ash-Shafatan (الشَّفَتَان)', english: 'The Two Lips', letters: 'ف / ب م و', desc: 'Lip contact (Baa, Meem), lower lip to upper teeth (Faa), and uncompressed rounded lips (Waw).' },
    { id: 'al-khayshum', name: 'Al-Khayshum (الخَيْشُوم)', english: 'The Nasal Cavity', letters: 'Ghunnah (الغنة)', desc: 'The internal nasal passage through which the sustained resonant Ghunnah vibrates.' }
  ];

  const contrastPairs = [
    { letter1: 'ق', letter2: 'ك', name1: 'Qāf', name2: 'Kāf', explanation: 'Qaf is deeply heavy from the soft palate; Kaf is forward and features whisper/air release (Hams).' },
    { letter1: 'ص', letter2: 'س', name1: 'Ṣād', name2: 'Sīn', explanation: 'Ṣād has tongue elevation and compression (Isti’la + Iṭbāq), whereas Sīn is flat and light (Istifāl).' },
    { letter1: 'ض', letter2: 'ظ', name1: 'Ḍād', name2: 'Ẓā’', explanation: 'Ḍād articulates from the side edge of the tongue against upper molars; Ẓā’ from the tip touching top front teeth.' },
    { letter1: 'ط', letter2: 'ت', name1: 'Ṭā’', name2: 'Tā’', explanation: 'Ṭā’ is the heaviest letter in Arabic (Iṭbāq + Qalqalah); Tā’ is light with aspiration upon stopping.' },
    { letter1: 'ح', letter2: 'هـ', name1: 'Ḥā’', name2: 'Hā’', explanation: 'Ḥā’ is compressed from the middle throat (Al-Halq); Hā’ is from the deepest bottom throat vocal cords.' },
    { letter1: 'ع', letter2: 'ء', name1: '‘Ayn', name2: 'Hamzah', explanation: '‘Ayn is squeezed from middle throat with voice clarity; Hamzah is a glottal stop from deepest throat.' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Academy Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-quran-emerald-100 dark:bg-quran-emerald-950/80 text-quran-emerald-800 dark:text-quran-gold-400 text-xs font-semibold border border-quran-emerald-200 dark:border-quran-emerald-800">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Complete Tajweed & Makharij Curriculum</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Quranic Articulation & Applied Tajweed
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto">
          Study traditional rules with verified explanations, interactive anatomical articulation charts, and phoneme contrast exercises.
        </p>
      </div>

      {/* Main Mode Tabs: Voice Studio vs Makharij Trainer vs Curriculum */}
      <div className="flex items-center justify-center">
        <div className="p-1 rounded-2xl bg-stone-100 dark:bg-quran-dark-900 border border-stone-200 dark:border-quran-dark-800 flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('voice_studio')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'voice_studio'
                ? 'bg-white dark:bg-quran-dark-800 text-quran-emerald-900 dark:text-quran-gold-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-quran-gold-500" />
            <span>🎙️ Tajweed Voice Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('makharij')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'makharij'
                ? 'bg-white dark:bg-quran-dark-800 text-quran-emerald-900 dark:text-quran-gold-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Makharij & Articulation Trainer
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'curriculum'
                ? 'bg-white dark:bg-quran-dark-800 text-quran-emerald-900 dark:text-quran-gold-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Tajweed Lessons & Quizzes
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: MAKHAARIJ TRAINER (Anatomical & Letter Contrast) */}
      {/* ======================================================== */}
      {activeTab === 'makharij' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Anatomical Regions Interactive Selector */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {anatomicalRegions.map(region => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedRegion === region.id
                    ? 'bg-white dark:bg-quran-dark-900 border-quran-gold-500 shadow-spiritual ring-2 ring-quran-gold-500/30'
                    : 'bg-stone-50 dark:bg-quran-dark-950/60 border-stone-200 dark:border-quran-dark-800 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-arabic text-lg font-bold text-quran-emerald-900 dark:text-quran-gold-400">
                    {region.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-stone-400">
                    Region
                  </span>
                </div>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">{region.english}</p>
                <p className="font-arabic text-sm text-stone-600 dark:text-stone-400 mt-2 font-semibold">
                  {region.letters}
                </p>
              </button>
            ))}
          </div>

          {/* Detailed Region Anatomical Spotlight */}
          {(() => {
            const activeReg = anatomicalRegions.find(r => r.id === selectedRegion)!;
            return (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-spiritual grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-quran-emerald-50 dark:bg-quran-emerald-950 text-quran-emerald-800 dark:text-quran-emerald-300 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Anatomical Makhraj Overview</span>
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {activeReg.name} — {activeReg.english}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                    {activeReg.desc}
                  </p>
                  <div className="p-4 rounded-2xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">Letters produced in this region:</span>
                    <span className="font-arabic text-3xl font-bold text-quran-emerald-950 dark:text-quran-gold-400">
                      {activeReg.letters}
                    </span>
                  </div>
                </div>

                {/* Visual Anatomical Diagram Representation */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-quran-parchment-100 to-stone-100 dark:from-quran-dark-950 dark:to-stone-900 flex flex-col items-center justify-center text-center border border-stone-200 dark:border-stone-800">
                  <div className="w-24 h-24 rounded-full border-4 border-quran-gold-500/40 flex items-center justify-center font-arabic text-4xl font-bold text-quran-emerald-900 dark:text-quran-gold-300 shadow-gold-glow mb-3">
                    {activeReg.letters.split(' ')[0]}
                  </div>
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    {activeReg.english}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Verified according to Ibn al-Jazari's Muqaddimah
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Letter Contrast Practice Studio */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-spiritual space-y-6">
            <div className="border-b border-stone-100 dark:border-quran-dark-800 pb-4">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-400">
                Acoustic Contrast Exercises
              </span>
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                Commonly Confused Letter Contrasts
              </h3>
              <p className="text-xs text-stone-500">
                A foundational reason for recitation errors is blending heavy letters with light counterparts. Practice distinguishing them:
              </p>
            </div>

            {/* Contrast Pair Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {contrastPairs.map((pair, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedContrastPair(pair);
                    setRecordedComparisonFeedback(null);
                  }}
                  className={`p-3 rounded-2xl border text-center transition ${
                    selectedContrastPair.letter1 === pair.letter1
                      ? 'bg-quran-emerald-900 text-white dark:bg-quran-gold-500 dark:text-stone-950 shadow-sm font-bold'
                      : 'bg-stone-50 dark:bg-quran-dark-950 border-stone-200 dark:border-quran-dark-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span className="font-arabic text-xl block mb-0.5">{pair.letter1} / {pair.letter2}</span>
                  <span className="text-[10px] block opacity-80">{pair.name1} vs {pair.name2}</span>
                </button>
              ))}
            </div>

            {/* Active Contrast Drill Board */}
            <div className="p-6 rounded-2xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
                <div className="p-5 rounded-2xl bg-white dark:bg-quran-dark-900 border border-stone-200 dark:border-stone-800 space-y-2">
                  <span className="text-xs font-bold text-quran-emerald-800 dark:text-quran-gold-400 uppercase">
                    {selectedContrastPair.name1}
                  </span>
                  <div className="font-arabic text-6xl font-bold text-stone-900 dark:text-stone-100">
                    {selectedContrastPair.letter1}
                  </div>
                  <p className="text-xs text-stone-500">Notice the elevation and fullness of sound.</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-quran-dark-900 border border-stone-200 dark:border-stone-800 space-y-2">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase">
                    {selectedContrastPair.name2}
                  </span>
                  <div className="font-arabic text-6xl font-bold text-stone-900 dark:text-stone-100">
                    {selectedContrastPair.letter2}
                  </div>
                  <p className="text-xs text-stone-500">Notice the light, relaxed, open palate posture.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-quran-dark-900 text-xs text-stone-700 dark:text-stone-300 leading-relaxed border border-stone-200 dark:border-stone-800">
                <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">Tajweed Rule Contrast Explanation:</span>
                {selectedContrastPair.explanation}
              </div>

              {/* Practice Recorder Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    let itemId = 'makhraj-qaf-kaf';
                    if (selectedContrastPair.letter1 === 'ق') itemId = 'makhraj-qaf-kaf';
                    else if (selectedContrastPair.letter1 === 'ص') itemId = 'makhraj-sad-sin';
                    else if (selectedContrastPair.letter1 === 'ض') itemId = 'makhraj-dad-dha';
                    else if (selectedContrastPair.letter1 === 'ط') itemId = 'makhraj-qaf-kaf';
                    else if (selectedContrastPair.letter1 === 'ح') itemId = 'makhraj-ha-ha';
                    else if (selectedContrastPair.letter1 === 'ع') itemId = 'makhraj-ayn-hamzah';
                    setSelectedVoiceStudioItemId(itemId);
                    setActiveTab('voice_studio');
                  }}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-quran-emerald-900 hover:bg-quran-emerald-950 text-white text-xs font-bold shadow-sm transition transform hover:-translate-y-0.5"
                >
                  <Mic className="w-4 h-4 text-quran-gold-400" />
                  <span>Test [{selectedContrastPair.letter1}] Pronunciation with Microphone in Voice Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: 21-COURSE CURRICULUM & INTERACTIVE QUIZZES     */}
      {/* ======================================================== */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Left: Lessons Directory */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Curriculum Courses
            </h3>
            <div className="space-y-2">
              {lessons.map(lesson => {
                const isActive = lesson.id === activeLessonId;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setActiveLessonId(lesson.id);
                      setIsAnswerSubmitted(false);
                      setSelectedQuizAnswer(null);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                      isActive
                        ? 'bg-white dark:bg-quran-dark-900 border-quran-gold-500 shadow-sm ring-2 ring-quran-gold-500/20'
                        : 'bg-stone-50 dark:bg-quran-dark-950/60 border-stone-200 dark:border-quran-dark-800 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-quran-emerald-100 dark:bg-quran-emerald-900 text-quran-emerald-800 dark:text-quran-emerald-300">
                          Course {lesson.courseNumber}
                        </span>
                        {lesson.mastered && (
                          <span className="text-[10px] font-semibold text-quran-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Mastered
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{lesson.title}</p>
                      <p className="font-arabic text-sm text-stone-500">{lesson.titleArabic}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 2 Cols: Active Lesson Content & Mastery Quiz */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-spiritual space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-quran-gold-500/20 text-quran-gold-700 dark:text-quran-gold-400">
                    Course {activeLesson.courseNumber} • {activeLesson.category}
                  </span>
                  <span className="font-arabic text-xl font-bold text-quran-emerald-900 dark:text-quran-gold-400">
                    {activeLesson.titleArabic}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">
                  {activeLesson.title}
                </h2>
                <p className="text-xs text-stone-500 mt-1">{activeLesson.description}</p>
              </div>

              {/* Explanation Text */}
              <div className="p-4 rounded-2xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {activeLesson.explanation}
              </div>

              {/* Quranic Demonstrations & Examples */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Examples From The Quran
                </h4>
                {activeLesson.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-quran-dark-950 border border-stone-200 dark:border-quran-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-quran-gold-600 dark:text-quran-gold-400">
                          Surah {ex.surahAyah}
                        </span>
                        <button
                          onClick={() => {
                            let targetItemId = 'qalqalah-falaq';
                            if (activeLesson.ruleName === 'qalqalah') targetItemId = 'qalqalah-falaq';
                            else if (activeLesson.ruleName === 'ghunnah') targetItemId = 'ghunnah-noon';
                            else if (activeLesson.ruleName === 'idgham') targetItemId = 'noon-idgham';
                            else if (activeLesson.ruleName === 'izhar') targetItemId = 'noon-izhar';
                            else if (activeLesson.ruleName === 'ikhfa') targetItemId = 'noon-ikhfa';
                            else if (activeLesson.ruleName === 'madd') targetItemId = 'madd-lazim';
                            else if (activeLesson.ruleName === 'tafkhim') targetItemId = 'makhraj-qaf-kaf';
                            setSelectedVoiceStudioItemId(targetItemId);
                            setActiveTab('voice_studio');
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-quran-emerald-100 dark:bg-quran-emerald-950 hover:bg-quran-emerald-200 text-quran-emerald-900 dark:text-quran-gold-400 text-[10px] font-bold transition"
                          title="Test your voice on this Tajweed rule"
                        >
                          <Mic className="w-3 h-3" />
                          <span>Test Voice</span>
                        </button>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400">{ex.note}</p>
                    </div>
                    <div dir="rtl" className="font-quran text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {ex.arabic}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Mastery Quiz */}
              {activeLesson.quiz.length > 0 && (
                <div className="p-6 rounded-2xl bg-stone-50 dark:bg-quran-dark-950 border border-stone-200 dark:border-quran-dark-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-quran-gold-600" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-stone-100">
                      Mastery Quiz (Must answer correctly to unlock advancement)
                    </h4>
                  </div>

                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    {activeLesson.quiz[0].question}
                  </p>

                  <div className="space-y-2">
                    {activeLesson.quiz[0].options.map((option, idx) => {
                      let btnStyle = 'bg-white dark:bg-quran-dark-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-quran-gold-500';
                      if (isAnswerSubmitted) {
                        if (idx === activeLesson.quiz[0].correctIndex) {
                          btnStyle = 'bg-quran-emerald-100 dark:bg-quran-emerald-950 border-quran-emerald-500 text-quran-emerald-900 dark:text-quran-emerald-200 font-bold';
                        } else if (idx === selectedQuizAnswer) {
                          btnStyle = 'bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-200';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswerSubmitted}
                          onClick={() => handleQuizSubmit(idx)}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs transition ${btnStyle}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswerSubmitted && (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-quran-dark-900 text-xs text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 animate-in fade-in">
                      <span className="font-bold block text-stone-900 dark:text-stone-100 mb-1">
                        {selectedQuizAnswer === activeLesson.quiz[0].correctIndex ? 'Correct! Mastery Recorded.' : 'Not quite. Review the explanation:'}
                      </span>
                      {activeLesson.quiz[0].explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: TAJWEED VOICE STUDIO (Real Audio Recording)  */}
      {/* ======================================================== */}
      {activeTab === 'voice_studio' && (
        <div className="animate-in fade-in">
          <TajweedVoiceStudio initialItemId={selectedVoiceStudioItemId} />
        </div>
      )}
    </div>
  );
};
