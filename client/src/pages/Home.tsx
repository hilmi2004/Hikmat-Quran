import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Brain, 
  Mic2, 
  Flame, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Sparkles,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { NavTab } from '../components/layout/Navbar';
import { db } from '../db/quranDexieDB';
import { HifzItem, MistakeRecord } from '../types/quran';

interface HomeProps {
  setActiveTab: (tab: NavTab) => void;
  onSelectSurah?: (surahNum: number) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  const [dueHifz, setDueHifz] = useState<HifzItem[]>([]);
  const [recentMistakes, setRecentMistakes] = useState<MistakeRecord[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      await db.initializeSeedData();
      const allHifz = await db.hifzItems.toArray();
      // Items due for review
      const due = allHifz.filter(item => new Date(item.nextDueDate) <= new Date());
      setDueHifz(due.length > 0 ? due : allHifz.slice(0, 2));

      const mistakes = await db.mistakes.toArray();
      setRecentMistakes(mistakes.filter(m => !m.resolved));
    }
    loadDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Spiritual Hero Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-quran-emerald-950 via-quran-emerald-900 to-quran-emerald-800 text-white p-6 sm:p-10 shadow-spiritual border border-quran-gold-500/20">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center pointer-events-none">
          <img src="/logo.png" alt="Hikmat Quran Emblem" className="w-56 h-56 object-contain drop-shadow-2xl animate-in fade-in" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-quran-gold-500/20 text-quran-gold-300 text-xs font-medium border border-quran-gold-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's Journey • Fajr to Isha Routine</span>
            <span className='font-italic font-sans text-sm'>The best of you are those who learn the Quran and teach it</span>
            
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-100 font-sans">
              Assalamu Alaikum wa Rahmatullah
            </h1>
            <p className="font-arabic text-xl sm:text-2xl text-quran-gold-300 mt-2 leading-relaxed">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </div>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            "And recite the Quran with measured, rhythmic recitation." (Surah Al-Muzzammil 73:4). Continue your personalized path of Tajweed mastery, fluent recitation, and steadfast Hifz.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('practice')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-quran-gold-500 hover:bg-quran-gold-400 text-stone-950 font-semibold text-sm shadow-md transition transform active:scale-95"
            >
              <Mic2 className="w-4 h-4" />
              <span>Quick Recite Ayah</span>
            </button>
            <button
              onClick={() => setActiveTab('mushaf')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-sm border border-white/10 transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Continue Reading (1:1)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Progress & Goal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Today's Reading</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">18 / 20 <span className="text-xs font-normal text-stone-500">mins</span></p>
            <div className="w-32 h-1.5 bg-stone-100 dark:bg-quran-dark-800 rounded-full overflow-hidden">
              <div className="h-full bg-quran-emerald-600 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-quran-emerald-50 dark:bg-quran-emerald-950/60 text-quran-emerald-700 dark:text-quran-emerald-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Hifz Retention</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{dueHifz.length} Ayahs <span className="text-xs font-normal text-rose-500">Due</span></p>
            <p className="text-xs text-stone-500">Surah Al-Fatiha & Al-Ikhlas</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('learn')}
          className="p-5 rounded-2xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm flex items-center justify-between cursor-pointer hover:border-quran-gold-500/60 hover:shadow-spiritual transition"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Tajweed Voice Studio</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">AI Voice Test</p>
            <p className="text-xs text-quran-emerald-700 dark:text-quran-gold-400 font-medium">Makharij & Rules Practice</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Quranic Habit</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">7 Days <span className="text-xs font-normal text-quran-gold-600">Streak</span></p>
            <p className="text-xs text-stone-500">Consistency over quantity</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-quran-gold-50 dark:bg-quran-gold-950/60 text-quran-gold-600 dark:text-quran-gold-400 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Study Hub: Continue Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Continue Learning & Hifz Revision Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Curriculum Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-quran-emerald-50 dark:bg-quran-emerald-950/80 text-quran-emerald-800 dark:text-quran-emerald-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Continue Tajweed Academy</h3>
                  <p className="text-xs text-stone-500">Curriculum progression based on mastery</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('learn')}
                className="text-xs font-semibold text-quran-emerald-700 dark:text-quran-gold-400 hover:underline flex items-center gap-1"
              >
                View all 21 courses <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-quran-parchment-50 dark:bg-quran-dark-950/70 border border-quran-parchment-200 dark:border-quran-dark-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-quran-gold-500/20 text-quran-gold-700 dark:text-quran-gold-400">
                  In Progress • Lesson 8
                </span>
                <span className="text-xs text-stone-500">65% Mastered</span>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 dark:text-stone-100">Makharij al-Huruf (Throat & Tongue Articulations)</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Master the distinct phonetic boundaries of heavy letters like Qaf (ق) vs light Kaf (ك), and middle-throat Haa (ح) vs Ha (هـ).
                </p>
              </div>
              <button
                onClick={() => setActiveTab('learn')}
                className="w-full py-2.5 rounded-xl bg-quran-emerald-900 hover:bg-quran-emerald-950 text-white text-xs font-semibold shadow-sm transition"
              >
                Resume Interactive Lesson
              </button>
            </div>
          </div>

          {/* Due Hifz Revisions (Spaced Repetition) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Today's Spaced Repetition Due</h3>
                  <p className="text-xs text-stone-500">Algorithmically timed to prevent forgetting curves</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('hifz')}
                className="text-xs font-semibold text-quran-emerald-700 dark:text-quran-gold-400 hover:underline flex items-center gap-1"
              >
                Launch Hifz Studio <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {dueHifz.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 dark:bg-quran-dark-950/60 border border-stone-100 dark:border-quran-dark-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-quran-emerald-100 dark:bg-quran-emerald-900 text-quran-emerald-800 dark:text-quran-emerald-300 font-bold text-xs flex items-center justify-center">
                      {item.surahNumber}:{item.ayahNumber}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                        {item.surahNumber === 1 ? 'Surah Al-Fatihah' : item.surahNumber === 112 ? 'Surah Al-Ikhlas' : `Surah ${item.surahNumber}`}
                      </p>
                      <p className="text-[11px] text-stone-500">Current Strength: {item.strength}% • Repetitions: {item.repetitions}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('hifz')}
                    className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-quran-emerald-800 hover:text-white dark:hover:bg-quran-emerald-800 text-xs font-medium transition"
                  >
                    Test Recall
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Historical Mistakes Alert & Daily Routine Schedule */}
        <div className="space-y-6">
          {/* Historical Weak Areas & Mistakes */}
          <div className="p-6 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Targeted Weak Ayah Drill</h3>
            </div>
            
            <p className="text-xs text-stone-600 dark:text-stone-400">
              The historical mistake engine caught recurring pronunciation/substitution in:
            </p>

            {recentMistakes.length > 0 ? (
              <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-800 dark:text-rose-300">Surah Al-Fatihah (1:7)</span>
                  <span className="text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 px-2 py-0.5 rounded-full font-medium">
                    Substituted
                  </span>
                </div>
                <p className="font-arabic text-sm text-stone-800 dark:text-stone-200 font-semibold">
                  ... وَلَا <span className="text-rose-600 underline">ٱلضَّآلِّينَ</span>
                </p>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  You recited <span className="font-arabic font-bold text-rose-600">الضالون</span> instead of genitive ending <span className="font-arabic font-bold text-quran-emerald-600">الضالين</span>.
                </p>
                <button
                  onClick={() => setActiveTab('practice')}
                  className="w-full mt-2 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium shadow-sm transition"
                >
                  Practice This Ayah
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 text-center text-xs text-stone-500">
                No active mistake records pending! You are reciting fluently.
              </div>
            )}
          </div>

          {/* Daily Quran Routine */}
          <div className="p-6 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-quran-emerald-600" />
              <span>Recommended Daily Routine</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950/60 border border-quran-parchment-100 dark:border-quran-dark-800">
                <span className="font-bold text-quran-emerald-700 dark:text-quran-gold-400 w-12 shrink-0">FAJR</span>
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">10 mins New Memorization</p>
                  <p className="text-stone-500 text-[11px]">Best mental retention when the mind is fresh</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950/60 border border-quran-parchment-100 dark:border-quran-dark-800">
                <span className="font-bold text-quran-emerald-700 dark:text-quran-gold-400 w-12 shrink-0">DHUHR</span>
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">15 mins Mushaf Tilawah</p>
                  <p className="text-stone-500 text-[11px]">Word-by-word contemplation & translation</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950/60 border border-quran-parchment-100 dark:border-quran-dark-800">
                <span className="font-bold text-quran-emerald-700 dark:text-quran-gold-400 w-12 shrink-0">ASR</span>
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">10 mins Tajweed Drill</p>
                  <p className="text-stone-500 text-[11px]">Makharij & articulation contrast practice</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950/60 border border-quran-parchment-100 dark:border-quran-dark-800">
                <span className="font-bold text-quran-emerald-700 dark:text-quran-gold-400 w-12 shrink-0">ISHA</span>
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">Spaced Repetition & Revision</p>
                  <p className="text-stone-500 text-[11px]">Review due items before rest</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
