import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Mic, 
  Sparkles, 
  Clock, 
  Repeat, 
  CheckCircle2 
} from 'lucide-react';
import { db } from '../db/quranDexieDB';
import { Ayah, Reciter } from '../types/quran';
import { RECITERS_LIST } from '../data/quranDataset';
import { audioPlayerService, AudioPlaybackState } from '../services/audio/AudioPlayerService';

export const AudioPage: React.FC = () => {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [selectedAyahId, setSelectedAyahId] = useState<string>('1:1');
  const [activeReciter, setActiveReciter] = useState<Reciter>(RECITERS_LIST[0]);
  const [audioState, setAudioState] = useState<AudioPlaybackState>('idle');
  const [repeatsTarget, setRepeatsTarget] = useState<number>(3);
  const [currentRepeat, setCurrentRepeat] = useState<number>(1);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [delaySecs, setDelaySecs] = useState<number>(2);
  const [isListenRepeatActive, setIsListenRepeatActive] = useState<boolean>(false);
  const [userTurnPrompt, setUserTurnPrompt] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      await db.initializeSeedData();
      const list = await db.ayahs.toArray();
      setAyahs(list);
    }
    loadData();

    const unsubscribe = audioPlayerService.subscribe({
      onStateChange: (state) => {
        setAudioState(state);
        if (state === 'waiting_repeat' && isListenRepeatActive) {
          setUserTurnPrompt(true);
        } else {
          setUserTurnPrompt(false);
        }
      },
      onAyahChange: (id) => setSelectedAyahId(id),
      onRepeatProgress: (curr, total) => {
        setCurrentRepeat(curr);
        setRepeatsTarget(total);
      }
    });

    return () => {
      unsubscribe();
      audioPlayerService.stop();
    };
  }, [isListenRepeatActive]);

  const activeAyah = ayahs.find(a => a.id === selectedAyahId) || ayahs[0];

  const handleTogglePlay = () => {
    if (audioState === 'playing') {
      audioPlayerService.pause();
    } else {
      if (activeAyah) {
        audioPlayerService.setReciter(activeReciter);
        audioPlayerService.setPlaybackRate(playbackSpeed);
        audioPlayerService.setDelayBetweenRepeats(delaySecs * 1000);
        audioPlayerService.playAyah(activeAyah, repeatsTarget);
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    audioPlayerService.setPlaybackRate(speed);
  };

  const handleReciterChange = (reciterId: string) => {
    const reciter = RECITERS_LIST.find(r => r.id === reciterId);
    if (reciter) {
      setActiveReciter(reciter);
      audioPlayerService.setReciter(reciter);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Audio Hub Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-quran-emerald-50 dark:bg-quran-emerald-950 text-quran-emerald-800 dark:text-quran-gold-400 text-xs font-semibold">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Multi-Reciter Audio & Listen-and-Repeat Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Sacred Tilawah Audio Engine
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
          High fidelity Quranic audio from world-renowned Qaris. Practice with customizable ayah repetitions, variable gap intervals, and interactive teacher-student cadence.
        </p>
      </div>

      {/* Reciter Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {RECITERS_LIST.map((reciter) => (
          <button
            key={reciter.id}
            onClick={() => handleReciterChange(reciter.id)}
            className={`p-4 rounded-2xl border text-left transition ${
              activeReciter.id === reciter.id
                ? 'bg-white dark:bg-quran-dark-900 border-quran-gold-500 shadow-spiritual ring-2 ring-quran-gold-500/30'
                : 'bg-stone-50 dark:bg-quran-dark-950/60 border-stone-200 dark:border-quran-dark-800 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-quran-emerald-100 dark:bg-quran-emerald-900 text-quran-emerald-800 dark:text-quran-emerald-300">
                {reciter.style}
              </span>
            </div>
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-2">{reciter.name}</p>
            <p className="font-arabic text-sm text-stone-500">{reciter.arabicName}</p>
          </button>
        ))}
      </div>

      {/* Active Ayah Audio Player Card */}
      {activeAyah && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-spiritual text-center space-y-6 relative overflow-hidden">
          {/* User repetition indicator */}
          {userTurnPrompt && (
            <div className="p-3 rounded-2xl bg-quran-gold-500 text-stone-950 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
              <Mic className="w-4 h-4" />
              <span>YOUR TURN: Repeat the Ayah aloud before the reciter plays again!</span>
            </div>
          )}

          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Surah {activeAyah.surahNumber}, Ayah {activeAyah.ayahNumber}
            </span>
            <div dir="rtl" className="font-quran text-3xl sm:text-5xl text-stone-900 dark:text-stone-100 py-6 leading-[2.5]">
              {activeAyah.textUthmani} ۝{activeAyah.ayahNumber}
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto font-sans leading-relaxed">
              "{activeAyah.translationEnglish}"
            </p>
          </div>

          {/* Loop Progress Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 dark:bg-quran-dark-950 text-xs text-stone-600 dark:text-stone-300">
            <Repeat className="w-3.5 h-3.5 text-quran-gold-600" />
            <span>Repetition: {currentRepeat} of {repeatsTarget}</span>
          </div>

          {/* Player Main Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleTogglePlay}
              className="w-16 h-16 rounded-full bg-quran-emerald-900 hover:bg-quran-emerald-950 text-quran-gold-400 flex items-center justify-center shadow-spiritual transition transform hover:scale-105 active:scale-95 border-2 border-quran-gold-500/40"
            >
              {audioState === 'playing' ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
          </div>

          {/* Advanced Player Tuning: Speed, Repeats, Gap */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100 dark:border-quran-dark-800 text-xs">
            {/* Playback Speed */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-500 uppercase tracking-wider block">Speed</label>
              <div className="flex items-center justify-center gap-1.5">
                {[0.75, 0.85, 1.0, 1.25].map(s => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      playbackSpeed === s
                        ? 'bg-quran-emerald-900 text-white dark:bg-quran-gold-500 dark:text-stone-950'
                        : 'bg-stone-100 dark:bg-quran-dark-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Ayah Repetition Count */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-500 uppercase tracking-wider block">Loop Repeats</label>
              <div className="flex items-center justify-center gap-1.5">
                {[1, 3, 5, 10].map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setRepeatsTarget(r);
                      audioPlayerService.setRepeatTarget(r);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      repeatsTarget === r
                        ? 'bg-quran-emerald-900 text-white dark:bg-quran-gold-500 dark:text-stone-950'
                        : 'bg-stone-100 dark:bg-quran-dark-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            </div>

            {/* Delay Gap Between Repetitions */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-500 uppercase tracking-wider block">Gap Interval</label>
              <div className="flex items-center justify-center gap-1.5">
                {[0, 2, 4, 6].map(d => (
                  <button
                    key={d}
                    onClick={() => {
                      setDelaySecs(d);
                      audioPlayerService.setDelayBetweenRepeats(d * 1000);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      delaySecs === d
                        ? 'bg-quran-emerald-900 text-white dark:bg-quran-gold-500 dark:text-stone-950'
                        : 'bg-stone-100 dark:bg-quran-dark-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
