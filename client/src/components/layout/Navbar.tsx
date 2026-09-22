import React from 'react';
import { 
  BookOpen, 
  Home, 
  GraduationCap, 
  Mic2, 
  Brain, 
  Volume2, 
  Search, 
  BarChart2, 
  Moon, 
  Sun, 
  WifiOff
} from 'lucide-react';

export type NavTab = 
  | 'home'
  | 'mushaf'
  | 'learn'
  | 'practice'
  | 'hifz'
  | 'audio'
  | 'search'
  | 'progress';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'mushaf', label: 'Mushaf', icon: BookOpen },
    { id: 'learn', label: 'Tajweed', icon: GraduationCap },
    { id: 'practice', label: 'Recite & AI', icon: Mic2 },
    { id: 'hifz', label: 'Hifz Coach', icon: Brain },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-quran-dark-900/95 backdrop-blur-md border-b border-quran-parchment-200 dark:border-quran-dark-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Offline Shield */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-quran-emerald-950 to-quran-emerald-900 p-1 flex items-center justify-center shadow-spiritual border border-quran-gold-500/40 group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/logo.png" alt="Hikmat Quran Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight text-quran-emerald-950 dark:text-stone-100 font-sans">
                  Hikmat Quran
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-quran-emerald-50 dark:bg-quran-emerald-950/80 text-quran-emerald-800 dark:text-quran-emerald-400 font-medium border border-quran-emerald-200 dark:border-quran-emerald-800 flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Offline Ready
                </span>
              </div>
              <p className="text-[11px] text-stone-700 dark:text-stone-300 font-arabic leading-none">
                حِكْمَةُ الْقُرْآنِ
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as NavTab)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-quran-emerald-900 text-white dark:bg-quran-emerald-800 dark:text-quran-gold-300 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-quran-emerald-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-quran-dark-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-quran-gold-400' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Dark mode toggle & Fast Quran Quick CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-quran-dark-800 transition"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-quran-gold-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-quran-gold-500 hover:bg-quran-gold-600 text-stone-950 font-medium text-xs shadow-spiritual transition"
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span>Quick Recite</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-quran-dark-900/95 border-t border-quran-parchment-200 dark:border-quran-dark-800 backdrop-blur-md px-2 py-1.5">
        <div className="grid grid-cols-5 gap-1 text-center">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'mushaf', label: 'Mushaf', icon: BookOpen },
            { id: 'learn', label: 'Tajweed', icon: GraduationCap },
            { id: 'practice', label: 'Recite', icon: Mic2 },
            { id: 'hifz', label: 'Hifz', icon: Brain },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as NavTab)}
                className={`flex flex-col items-center py-1 rounded-md text-[11px] font-medium transition ${
                  isActive
                    ? 'text-quran-emerald-800 dark:text-quran-gold-400 font-semibold'
                    : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
