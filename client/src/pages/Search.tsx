import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, 
  Mic, 
  BookOpen, 
  Tag, 
  ChevronRight, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { db } from '../db/quranDexieDB';
import { Ayah, Surah } from '../types/quran';
import { normalizeArabicText } from '../services/ai/LocalRecitationEngine';

interface SearchProps {
  onSelectAyah?: (surahNum: number, ayahNum: number) => void;
}

export const Search: React.FC<SearchProps> = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<Ayah[]>([]);
  const [allAyahs, setAllAyahs] = useState<Ayah[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      await db.initializeSeedData();
      const a = await db.ayahs.toArray();
      const s = await db.surahs.toArray();
      setAllAyahs(a);
      setSurahs(s);
    }
    loadData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTopic(null);
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const qLower = query.toLowerCase().trim();
    const qNormArabic = normalizeArabicText(query);

    const matches = allAyahs.filter(ayah => {
      // 1. Surah:Ayah match (e.g. "1:2")
      if (ayah.id.includes(qLower)) return true;

      // 2. English translation keyword
      if (ayah.translationEnglish.toLowerCase().includes(qLower)) return true;

      // 3. Transliteration match
      if (ayah.transliteration.toLowerCase().includes(qLower)) return true;

      // 4. Normalized Arabic text search
      if (normalizeArabicText(ayah.textSimple).includes(qNormArabic) || normalizeArabicText(ayah.textUthmani).includes(qNormArabic)) {
        return true;
      }

      return false;
    });

    setResults(matches);
  };

  const handleTopicFilter = (topic: string, keywords: string[]) => {
    setActiveTopic(topic);
    setSearchQuery('');
    const matches = allAyahs.filter(ayah => {
      const en = ayah.translationEnglish.toLowerCase();
      return keywords.some(k => en.includes(k));
    });
    setResults(matches);
  };

  const topics = [
    { name: 'Mercy (Rahmah)', keywords: ['merciful', 'mercy', 'entirely merciful'] },
    { name: 'Praise & Gratitude', keywords: ['praise', 'worship', 'gratitude'] },
    { name: 'Guidance (Hidayah)', keywords: ['guide', 'straight path', 'way'] },
    { name: 'Refuge & Protection', keywords: ['refuge', 'evil', 'whisperer', 'daybreak'] },
    { name: 'Tawhid (Oneness)', keywords: ['one', 'eternal', 'refuge', 'equivalent'] },
    { name: 'Creation & Life', keywords: ['dominion', 'created', 'death', 'life'] }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Offline Quranic Search
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
          Instant multi-field indexing: Search by Arabic (tashkeel-free or vowelled), English words, transliteration, or chapter and verse reference.
        </p>
      </div>

      {/* Main Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
          <SearchIcon className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search e.g. 'Merciful', 'الحمد', 'Bismillah', or '1:1'..."
          className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-quran-gold-500 shadow-sm text-sm sm:text-base"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-stone-400 hover:text-stone-600 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Topic Filter Tags */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
          Explore by Quranic Topic:
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {topics.map(t => (
            <button
              key={t.name}
              onClick={() => handleTopicFilter(t.name, t.keywords)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                activeTopic === t.name
                  ? 'bg-quran-emerald-900 text-white dark:bg-quran-gold-500 dark:text-stone-950 font-bold shadow-sm'
                  : 'bg-white dark:bg-quran-dark-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-quran-dark-800 hover:bg-stone-50'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.length > 0 ? (
          <>
            <p className="text-xs font-semibold text-stone-500">
              Found {results.length} matching {results.length === 1 ? 'ayah' : 'ayahs'}
            </p>
            {results.map((ayah) => {
              const surah = surahs.find(s => s.number === ayah.surahNumber);
              return (
                <div
                  key={ayah.id}
                  className="p-6 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs border-b border-stone-100 dark:border-quran-dark-800 pb-2">
                    <span className="font-bold text-quran-emerald-800 dark:text-quran-gold-400">
                      Surah {surah ? surah.nameEnglish : ayah.surahNumber} ({ayah.surahNumber}:{ayah.ayahNumber})
                    </span>
                    <span className="text-stone-400">
                      Juz {ayah.juzNumber} • Page {ayah.pageNumber}
                    </span>
                  </div>

                  <div dir="rtl" className="font-quran text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 leading-relaxed text-right">
                    {ayah.textUthmani} ۝{ayah.ayahNumber}
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                    "{ayah.translationEnglish}"
                  </p>
                </div>
              );
            })}
          </>
        ) : (
          (searchQuery || activeTopic) && (
            <div className="p-12 text-center text-stone-500 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800">
              No matching verses found for "{searchQuery || activeTopic}". Try searching for words like 'mercy', 'all-knowing', 'fatihah', or '1:1'.
            </div>
          )
        )}
      </div>
    </div>
  );
};
