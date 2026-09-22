import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { Mushaf } from './pages/Mushaf';
import { Learn } from './pages/Learn';
import { RecitationStudioPage } from './pages/RecitationStudioPage';
import { Hifz } from './pages/Hifz';
import { AudioPage } from './pages/AudioPage';
import { Search } from './pages/Search';
import { Progress } from './pages/Progress';
import { QuranTutorModal } from './components/tutor/QuranTutorModal';
import { Sparkles, MessageCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-quran-parchment-50 dark:bg-quran-dark-950 text-stone-900 dark:text-stone-100 flex flex-col transition-colors pb-20 md:pb-8">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
        {activeTab === 'mushaf' && <Mushaf />}
        {activeTab === 'learn' && <Learn />}
        {activeTab === 'practice' && <RecitationStudioPage />}
        {activeTab === 'hifz' && <Hifz />}
        {activeTab === 'audio' && <AudioPage />}
        {activeTab === 'search' && <Search />}
        {activeTab === 'progress' && <Progress />}
      </main>

      {/* Floating AI Quran Study Companion Button */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-40">
        <button
          onClick={() => setIsTutorOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-quran-emerald-950 text-quran-gold-400 hover:bg-black shadow-spiritual hover:shadow-gold-glow transition transform hover:scale-105 active:scale-95 border border-quran-gold-500/40 text-xs font-semibold"
          title="Ask Quran Study Companion"
        >
          <Sparkles className="w-4 h-4 text-quran-gold-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Quran Teacher</span>
        </button>
      </div>

      {/* AI Quran Tutor Modal */}
      <QuranTutorModal
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
      />
    </div>
  );
}

export default App;
