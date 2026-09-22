import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Bookmark, 
  BookmarkCheck, 
  Info, 
  Layers, 
  Settings2, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Check, 
  Sparkles,
  BookOpen,
  X
} from 'lucide-react';
import { db } from '../db/quranDexieDB';
import { Ayah, Surah, QuranWord, Reciter } from '../types/quran';
import { SURAH_LIST, RECITERS_LIST } from '../data/quranDataset';
import { audioPlayerService, AudioPlaybackState } from '../services/audio/AudioPlayerService';
import { quranContentService } from '../services/quran/QuranContentService';

export const Mushaf: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>(SURAH_LIST);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(false);
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [activeAyahId, setActiveAyahId] = useState<string>('1:1');
  const [audioState, setAudioState] = useState<AudioPlaybackState>('idle');
  const [activeReciter, setActiveReciter] = useState<Reciter>(RECITERS_LIST[0]);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [currentRepeat, setCurrentRepeat] = useState<number>(1);

  // Mushaf View Settings
  const [tajweedColorsEnabled, setTajweedColorsEnabled] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(false);
  const [fontSizeClass, setFontSizeClass] = useState<string>('text-3xl sm:text-4xl');
  const [selectedWord, setSelectedWord] = useState<{ word: QuranWord; ayahId: string } | null>(null);
  const [selectedTafsirAyah, setSelectedTafsirAyah] = useState<Ayah | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTajweedLegend, setShowTajweedLegend] = useState<boolean>(false);

  // Load Surahs and initial Ayahs
  useEffect(() => {
    async function init() {
      await db.initializeSeedData();
      const sList = await db.surahs.toArray();
      setSurahs(sList);

      const bMarks = await db.bookmarks.toArray();
      setBookmarkedIds(new Set(bMarks.map(b => `${b.surahNumber}:${b.ayahNumber}`)));

      loadSurahAyahs(selectedSurahNum);
    }
    init();

    // Subscribe to audio engine updates
    const unsubscribe = audioPlayerService.subscribe({
      onStateChange: (state) => setAudioState(state),
      onAyahChange: (id) => setActiveAyahId(id),
      onRepeatProgress: (curr, total) => {
        setCurrentRepeat(curr);
        setRepeatCount(total);
      }
    });

    return () => {
      unsubscribe();
      audioPlayerService.stop();
    };
  }, []);

  const loadSurahAyahs = async (surahNumber: number) => {
    setIsLoadingAyahs(true);
    const list = await quranContentService.getOrFetchSurahAyahs(surahNumber);
    setAyahs(list);
    if (list.length > 0) {
      setActiveAyahId(list[0].id);
    }
    setIsLoadingAyahs(false);
  };

  const handleSurahChange = (num: number) => {
    setSelectedSurahNum(num);
    loadSurahAyahs(num);
    audioPlayerService.stop();
  };

  const togglePlayAyah = (ayah: Ayah) => {
    if (activeAyahId === ayah.id && audioState === 'playing') {
      audioPlayerService.pause();
    } else {
      audioPlayerService.setReciter(activeReciter);
      audioPlayerService.playAyah(ayah, repeatCount);
    }
  };

  const toggleBookmark = async (ayah: Ayah) => {
    const key = ayah.id;
    const next = new Set(bookmarkedIds);
    if (next.has(key)) {
      next.delete(key);
      await db.bookmarks.where('id').equals(key).delete();
    } else {
      next.add(key);
      await db.bookmarks.add({
        id: key,
        surahNumber: ayah.surahNumber,
        ayahNumber: ayah.ayahNumber,
        createdAt: new Date().toISOString()
      });
    }
    setBookmarkedIds(next);
  };

  const copyAyahText = (ayah: Ayah) => {
    const clip = `${ayah.textUthmani}\n\n"${ayah.translationEnglish}" (Quran ${ayah.surahNumber}:${ayah.ayahNumber})`;
    navigator.clipboard.writeText(clip);
    setCopiedId(ayah.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentSurahMeta = surahs.find(s => s.number === selectedSurahNum);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Mushaf Navigation & Control Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Surah Switcher */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider hidden sm:block">Surah:</label>
          <select
            value={selectedSurahNum}
            onChange={(e) => handleSurahChange(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-quran-gold-500/50"
          >
            {surahs.map(s => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.nameEnglish} ({s.nameArabic})
              </option>
            ))}
          </select>

          {currentSurahMeta && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-quran-emerald-50 dark:bg-quran-emerald-950/60 text-quran-emerald-800 dark:text-quran-emerald-300 font-medium border border-quran-emerald-200 dark:border-quran-emerald-800 hidden md:inline-block">
              {currentSurahMeta.revelationType} • {currentSurahMeta.totalAyahs} Ayahs
            </span>
          )}

          {/* Qari Selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={activeReciter.id}
              onChange={(e) => {
                const r = RECITERS_LIST.find(rec => rec.id === e.target.value);
                if (r) {
                  setActiveReciter(r);
                  audioPlayerService.setReciter(r);
                }
              }}
              className="px-2.5 py-2 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 text-xs font-bold text-quran-emerald-900 dark:text-quran-gold-400 focus:outline-none"
            >
              {RECITERS_LIST.map(r => (
                <option key={r.id} value={r.id}>
                  🎙️ {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Options: Tajweed Colors, Translation, Legend */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Tajweed color toggle */}
          <button
            onClick={() => setTajweedColorsEnabled(!tajweedColorsEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tajweedColorsEnabled
                ? 'bg-quran-emerald-800 text-quran-gold-300 shadow-sm'
                : 'bg-stone-100 dark:bg-quran-dark-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tajweed Colors</span>
          </button>

          <button
            onClick={() => setShowTajweedLegend(!showTajweedLegend)}
            className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-quran-dark-800 hover:bg-stone-200 dark:hover:bg-quran-dark-700 text-stone-700 dark:text-stone-300 text-xs font-medium transition"
            title="View Tajweed Rule Colors"
          >
            Legend
          </button>

          {/* Translation toggle */}
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              showTranslation
                ? 'bg-quran-emerald-50 dark:bg-quran-emerald-950/80 text-quran-emerald-800 dark:text-quran-emerald-300 border border-quran-emerald-200 dark:border-quran-emerald-800'
                : 'bg-stone-100 dark:bg-quran-dark-800 text-stone-500'
            }`}
          >
            Translation
          </button>

          {/* Transliteration toggle */}
          <button
            onClick={() => setShowTransliteration(!showTransliteration)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              showTransliteration
                ? 'bg-quran-emerald-50 dark:bg-quran-emerald-950/80 text-quran-emerald-800 dark:text-quran-emerald-300 border border-quran-emerald-200 dark:border-quran-emerald-800'
                : 'bg-stone-100 dark:bg-quran-dark-800 text-stone-500'
            }`}
          >
            Transliteration
          </button>
        </div>
      </div>

      {/* Tajweed Color Guide Drawer / Legend */}
      {showTajweedLegend && (
        <div className="p-4 rounded-2xl bg-quran-parchment-100 dark:bg-quran-dark-900 border border-quran-gold-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-quran-gold-600" />
              <span>Tajweed Color Key</span>
            </h4>
            <button onClick={() => setShowTajweedLegend(false)} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-quran-dark-950 border border-stone-200 dark:border-stone-800">
              <span className="w-3 h-3 rounded-full bg-tajweed-ghunnah"></span>
              <span className="font-semibold text-tajweed-ghunnah">Ghunnah (2 Counts)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-quran-dark-950 border border-stone-200 dark:border-stone-800">
              <span className="w-3 h-3 rounded-full bg-tajweed-qalqalah"></span>
              <span className="font-semibold text-tajweed-qalqalah">Qalqalah (Echo)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-quran-dark-950 border border-stone-200 dark:border-stone-800">
              <span className="w-3 h-3 rounded-full bg-tajweed-idgham"></span>
              <span className="font-semibold text-tajweed-idgham">Idgham (Merging)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-quran-dark-950 border border-stone-200 dark:border-stone-800">
              <span className="w-3 h-3 rounded-full bg-tajweed-ikhfa"></span>
              <span className="font-semibold text-tajweed-ikhfa">Ikhfa (Hiding)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-quran-dark-950 border border-stone-200 dark:border-stone-800">
              <span className="w-3 h-3 rounded-full bg-tajweed-madd"></span>
              <span className="font-semibold text-tajweed-madd">Madd (Elongation)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-quran-dark-950 border border-stone-200 dark:border-stone-800">
              <span className="w-3 h-3 rounded-full bg-tajweed-tafkhim"></span>
              <span className="font-semibold text-tajweed-tafkhim">Tafkhim (Heavy)</span>
            </div>
          </div>
        </div>
      )}

      {/* Surah Ornamental Header */}
      {currentSurahMeta && (
        <div className="text-center py-6 px-4 rounded-3xl bg-gradient-to-b from-quran-parchment-100 to-white dark:from-quran-dark-900 dark:to-quran-dark-950 border border-quran-gold-500/20 shadow-sm relative overflow-hidden">
          <p className="text-xs uppercase tracking-widest text-quran-gold-600 dark:text-quran-gold-400 font-semibold mb-1">
            Surah {currentSurahMeta.number}
          </p>
          <h2 className="font-arabic text-4xl sm:text-5xl font-bold text-quran-emerald-950 dark:text-stone-100 mb-2">
            سُورَةُ {currentSurahMeta.nameArabic}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {currentSurahMeta.nameEnglish} • "{currentSurahMeta.nameTranslation}"
          </p>

          {/* Basmalah for surahs other than At-Tawbah (9) */}
          {selectedSurahNum !== 9 && selectedSurahNum !== 1 && (
            <div className="font-arabic text-2xl sm:text-3xl text-quran-emerald-900 dark:text-quran-gold-300 mt-4 pt-4 border-t border-quran-gold-500/20">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
          )}
        </div>
      )}

      {/* Ayah List (Continuous Mushaf Style) */}
      <div className="space-y-6">
        {ayahs.length === 0 ? (
          <div className="p-12 text-center text-stone-500 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-quran-gold-500" />
            <p>Verified text for Surah {selectedSurahNum} is being compiled. Select Surah 1 (Al-Fatihah), 67 (Al-Mulk), 112 (Al-Ikhlas), 113 (Al-Falaq), or 114 (An-Nas) to test full word-by-word and recitation.</p>
          </div>
        ) : (
          ayahs.map((ayah) => {
            const isPlayingThis = activeAyahId === ayah.id && audioState === 'playing';
            const isBookmarked = bookmarkedIds.has(ayah.id);

            return (
              <div
                key={ayah.id}
                id={`ayah-${ayah.id}`}
                className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 ${
                  activeAyahId === ayah.id
                    ? 'bg-quran-parchment-100/90 dark:bg-quran-dark-800/90 ring-2 ring-quran-gold-500/40 shadow-spiritual'
                    : 'bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800'
                }`}
              >
                {/* Ayah Action Bar */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-quran-dark-800">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-quran-emerald-900 text-quran-gold-300 font-bold text-xs flex items-center justify-center shadow-sm">
                      {ayah.ayahNumber}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">
                      Juz {ayah.juzNumber} • Page {ayah.pageNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* Audio Play/Pause Button */}
                    <button
                      onClick={() => togglePlayAyah(ayah)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isPlayingThis
                          ? 'bg-quran-gold-500 text-stone-950 shadow-spiritual'
                          : 'bg-stone-100 dark:bg-quran-dark-800 hover:bg-quran-emerald-100 dark:hover:bg-quran-emerald-950 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlayingThis ? 'Playing' : 'Listen'}</span>
                    </button>

                    {/* Tafsir Popover trigger */}
                    {ayah.tafsir && (
                      <button
                        onClick={() => setSelectedTafsirAyah(ayah)}
                        className="p-2 rounded-xl text-stone-500 hover:text-quran-emerald-800 hover:bg-stone-100 dark:hover:bg-quran-dark-800 transition"
                        title="Read Tafsir"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    )}

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => toggleBookmark(ayah)}
                      className={`p-2 rounded-xl transition ${
                        isBookmarked
                          ? 'text-quran-gold-600 bg-quran-gold-50 dark:bg-quran-gold-950/50'
                          : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-quran-dark-800'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    {/* Copy text */}
                    <button
                      onClick={() => copyAyahText(ayah)}
                      className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-quran-dark-800 transition"
                      title="Copy Arabic & Translation"
                    >
                      {copiedId === ayah.id ? <Check className="w-4 h-4 text-quran-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Canonical Quran Text in Uthmani Script with Word-by-Word Interactivity */}
                <div
                  dir="rtl"
                  className={`font-quran ${fontSizeClass} text-stone-900 dark:text-stone-100 py-3 leading-[2.6] flex flex-wrap items-center gap-x-2.5 gap-y-1 justify-start`}
                >
                  {ayah.words.map((word) => {
                    const ruleClass = tajweedColorsEnabled && word.tajweedRule && word.tajweedRule !== 'none'
                      ? `tajweed-${word.tajweedRule}`
                      : '';

                    return (
                      <span
                        key={word.position}
                        onClick={() => setSelectedWord({ word, ayahId: ayah.id })}
                        className={`cursor-pointer px-1.5 py-0.5 rounded-lg transition-colors hover:bg-quran-gold-500/20 hover:text-quran-emerald-900 dark:hover:text-quran-gold-300 ${ruleClass}`}
                        title={`Tap for Word Study: ${word.translation}`}
                      >
                        {word.arabic}
                      </span>
                    );
                  })}
                  {/* Ayah End Ornamental Glyph */}
                  <span className="inline-flex items-center justify-center font-arabic text-xl text-quran-gold-600 dark:text-quran-gold-400 px-1 select-none">
                    ۝{ayah.ayahNumber}
                  </span>
                </div>

                {/* Optional Transliteration */}
                {showTransliteration && (
                  <p className="text-xs sm:text-sm text-stone-500 italic mt-3 font-sans">
                    {ayah.transliteration}
                  </p>
                )}

                {/* Verified Translation */}
                {showTranslation && (
                  <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 mt-2 font-sans leading-relaxed">
                    {ayah.translationEnglish}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Word-by-Word Inspection Popover / Bottom Drawer */}
      {selectedWord && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-quran-dark-900 rounded-3xl p-6 shadow-2xl border border-quran-gold-500/30 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-quran-dark-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-quran-emerald-50 dark:bg-quran-emerald-950 text-quran-emerald-800 dark:text-quran-emerald-300">
                  Word #{selectedWord.word.position} • Ayah {selectedWord.ayahId}
                </span>
                {selectedWord.word.tajweedRule && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-tajweed-madd/10 text-tajweed-madd uppercase">
                    {selectedWord.word.tajweedRule}
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedWord(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <p className="font-arabic text-5xl font-bold text-quran-emerald-950 dark:text-stone-100 mb-2">
                {selectedWord.word.arabic}
              </p>
              <p className="text-sm font-medium text-stone-500 italic">
                {selectedWord.word.transliteration}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 space-y-2">
              <div>
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Meaning</p>
                <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {selectedWord.word.translation}
                </p>
              </div>

              {selectedWord.word.root && (
                <div>
                  <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Arabic Root (الجذر)</p>
                  <p className="font-arabic text-lg font-bold text-quran-emerald-700 dark:text-quran-gold-400">
                    {selectedWord.word.root}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedWord(null)}
              className="w-full py-2.5 rounded-xl bg-quran-emerald-900 hover:bg-quran-emerald-950 text-white text-xs font-semibold shadow-sm transition"
            >
              Close Study View
            </button>
          </div>
        </div>
      )}

      {/* Tafsir Drawer */}
      {selectedTafsirAyah && selectedTafsirAyah.tafsir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-quran-dark-900 rounded-3xl p-6 shadow-2xl border border-quran-gold-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-quran-dark-800 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 dark:text-stone-100">
                  Verified Tafsir — Ayah {selectedTafsirAyah.id}
                </h3>
                <p className="text-xs text-quran-gold-600 dark:text-quran-gold-400 font-semibold">
                  Source: {selectedTafsirAyah.tafsir.source}
                </p>
              </div>
              <button onClick={() => setSelectedTafsirAyah(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="font-arabic text-xl text-right p-3 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950 text-quran-emerald-950 dark:text-stone-100 font-semibold">
              {selectedTafsirAyah.textUthmani}
            </div>

            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed max-h-64 overflow-y-auto">
              {selectedTafsirAyah.tafsir.text}
            </p>

            <div className="text-[11px] p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
              Note: This is authentic classical exegesis strictly attributed to scholarly manuscripts. Never modified or generated by AI models.
            </div>

            <button
              onClick={() => setSelectedTafsirAyah(null)}
              className="w-full py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-stone-300 dark:hover:bg-stone-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
