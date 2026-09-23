import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Volume2, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  VolumeX,
  BookOpen,
  Info,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { db } from '../db/quranDexieDB';
import { Ayah, Surah, Reciter } from '../types/quran';
import { SURAH_LIST, RECITERS_LIST } from '../data/quranDataset';
import { quranContentService } from '../services/quran/QuranContentService';
import { localRecitationEngine } from '../services/ai/LocalRecitationEngine';
import { RecitationDiagnosticReport, RecitedWordEvaluation } from '../services/ai/RecitationEngine';
import { getSpeechPlatformNotice, isIOSNonSafari, isMobileDevice } from '../utils/mobileSpeechHelper';

export const RecitationStudioPage: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>(SURAH_LIST);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [selectedAyahIndex, setSelectedAyahIndex] = useState<number>(0);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS_LIST[0]); // Sheikh Yasser Al-Dossary

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);
  const [speechDialect, setSpeechDialect] = useState<string>('ar-SA');
  const [precisionMode, setPrecisionMode] = useState<'balanced' | 'strict'>('balanced');
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [liveMatchedWordIndices, setLiveMatchedWordIndices] = useState<number[]>([]);
  const [liveMistakeWordIndices, setLiveMistakeWordIndices] = useState<number[]>([]);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<RecitationDiagnosticReport | null>(null);
  const [autoAdvanceOnMastery, setAutoAdvanceOnMastery] = useState<boolean>(true);
  const [advanceNotice, setAdvanceNotice] = useState<string | null>(null);

  // Sync refs to guarantee zero stale-closure latency in async speech callbacks
  const selectedAyahIndexRef = useRef<number>(0);
  const ayahsRef = useRef<Ayah[]>([]);
  const autoAdvanceRef = useRef<boolean>(true);
  const advanceTimerRef = useRef<any>(null);

  useEffect(() => {
    selectedAyahIndexRef.current = selectedAyahIndex;
  }, [selectedAyahIndex]);

  useEffect(() => {
    ayahsRef.current = ayahs;
  }, [ayahs]);

  useEffect(() => {
    autoAdvanceRef.current = autoAdvanceOnMastery;
  }, [autoAdvanceOnMastery]);

  // Subtle pleasant spiritual chime on Ayah mastery
  const playMasteryChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: C5
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: G5
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.12);
      gain2.gain.setValueAtTime(0.18, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch (e) {
      // AudioContext blocked or not supported
    }
  };

  // Active inspected mistake word
  const [selectedMistake, setSelectedMistake] = useState<RecitedWordEvaluation | null>(null);

  // Audio elements for Qari correction & user voice replay
  const [isPlayingQari, setIsPlayingQari] = useState<boolean>(false);
  const [isPlayingUserVoice, setIsPlayingUserVoice] = useState<boolean>(false);
  const qariAudioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<any>(null);

  // Load ayahs when Surah changes
  useEffect(() => {
    async function loadSurah() {
      await db.initializeSeedData();
      const loaded = await quranContentService.getOrFetchSurahAyahs(selectedSurahNumber);
      setAyahs(loaded);
      ayahsRef.current = loaded;
      setSelectedAyahIndex(0);
      selectedAyahIndexRef.current = 0;
      setDiagnosticReport(null);
      setSelectedMistake(null);
      setLiveTranscript('');
      setLiveMatchedWordIndices([]);
      setLiveMistakeWordIndices([]);
    }
    loadSurah();
  }, [selectedSurahNumber]);

  const currentAyah = ayahs[selectedAyahIndex];

  // Real-time audio volume visualizer loop with shared stream (zero device conflict)
  const setupVolumeMeter = async (existingStream?: MediaStream) => {
    try {
      // On mobile, never open a new getUserMedia stream just for the volume meter to avoid locking out SpeechRecognition
      const isMobile = isMobileDevice();
      if (isMobile && !existingStream && !localRecitationEngine.getMediaStream()) {
        return;
      }
      const stream = existingStream || localRecitationEngine.getMediaStream() || await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      console.warn('[VolumeMeter] Mic stream for visualizer skipped:', e);
    }
  };

  const cleanupVolumeMeter = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicVolumeLevel(0);
  };

  // Live Instant Auto-Advance when Ayah is Mastered during recitation
  const handleAyahCompleteLive = (masteredAyah: Ayah) => {
    if (!autoAdvanceRef.current) return;

    const currIdx = selectedAyahIndexRef.current;
    const currentAyahs = ayahsRef.current;

    if (currIdx + 1 < currentAyahs.length) {
      const nextIdx = currIdx + 1;
      const nextAyah = currentAyahs[nextIdx];

      playMasteryChime();

      setAdvanceNotice(`🎉 Ayah ${masteredAyah.ayahNumber} Mastered! Moving to Ayah ${nextAyah.ayahNumber}...`);

      // Immediately show the next Ayah without any delay!
      selectedAyahIndexRef.current = nextIdx;
      setSelectedAyahIndex(nextIdx);
      setActiveWordIndex(-1);
      setLiveMatchedWordIndices([]);
      setLiveMistakeWordIndices([]);
      setDiagnosticReport(null);
      setSelectedMistake(null);

      // Seamlessly advance engine to target the next verse without stopping microphone
      localRecitationEngine.setTargetAyah(nextAyah);

      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        setAdvanceNotice(null);
      }, 2000);
    } else {
      // Completed all ayahs in the Surah
      playMasteryChime();
      setAdvanceNotice(`🎉 Masha'Allah! You have completed all ayahs of this Surah!`);

      clearInterval(timerIntervalRef.current);
      cleanupVolumeMeter();
      setIsRecording(false);
      setActiveWordIndex(-1);
      localRecitationEngine.stopListening().catch(() => {});

      // Set 100% mastered report for this final Ayah so all words show emerald/mastered (not red)!
      const completedReport: RecitationDiagnosticReport = {
        ayahId: masteredAyah.id,
        surahNumber: masteredAyah.surahNumber,
        ayahNumber: masteredAyah.ayahNumber,
        overallAccuracy: 100,
        wordEvaluations: masteredAyah.words.map((w, idx) => ({
          wordIndex: idx,
          canonicalWord: w.arabic,
          recitedWord: w.arabic,
          status: 'correct',
          confidence: 1.0
        })),
        detectedMistakesCount: 0,
        weakWords: [],
        tajweedObservations: ["Masha'Allah! You have completed all ayahs of this Surah with excellence!"],
        speechConfidenceScore: 1.0,
        isUncertain: false,
        rawTranscript: masteredAyah.words.map(w => w.arabic).join(' ')
      };
      setDiagnosticReport(completedReport);
      setSelectedMistake(null);
      setLiveMatchedWordIndices(masteredAyah.words.map((_, i) => i));
      setLiveMistakeWordIndices([]);
    }
  };

  // Start live microphone recitation (Synchronously hooks Safari user gesture)
  const handleStartRecording = async () => {
    if (!currentAyah) return;
    setDiagnosticReport(null);
    setSelectedMistake(null);
    setErrorMessage(null);
    setActiveWordIndex(0);
    setLiveMatchedWordIndices([]);
    setLiveMistakeWordIndices([]);
    setLiveTranscript('');
    setRecordingSeconds(0);

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);

    try {
      // Start listening synchronously FIRST to satisfy iOS Safari gesture activation
      const startTask = localRecitationEngine.startListening(
        currentAyah,
        (wordIdx, transcript, correctIndices, mistakeIndices) => {
          setActiveWordIndex(wordIdx);
          setLiveTranscript(transcript);
          if (correctIndices) setLiveMatchedWordIndices(correctIndices);
          if (mistakeIndices) setLiveMistakeWordIndices(mistakeIndices);
          if (transcript) setMicVolumeLevel(75);
        },
        (err) => {
          setErrorMessage(err);
        },
        handleAyahCompleteLive
      );
      setIsRecording(true);
      await startTask;
      // Connect volume visualizer to the engine's stream once acquired (desktop only to prevent mobile mic lock)
      if (!isMobileDevice()) {
        setupVolumeMeter(localRecitationEngine.getMediaStream() || undefined);
      }
    } catch (e: any) {
      clearInterval(timerIntervalRef.current);
      cleanupVolumeMeter();
      setErrorMessage(e.message || 'Failed to access microphone.');
    }
  };

  // Stop recording & run diagnostic evaluation
  const handleStopRecording = async () => {
    clearInterval(timerIntervalRef.current);
    cleanupVolumeMeter();
    setIsRecording(false);
    setActiveWordIndex(-1);
    setLiveMatchedWordIndices([]);
    setLiveMistakeWordIndices([]);

    try {
      const report = await localRecitationEngine.stopListening();
      setDiagnosticReport(report);

      // Auto-select the first mistake for the student
      const firstMistake = report.wordEvaluations.find(w => w.status !== 'correct');
      if (firstMistake) {
        setSelectedMistake(firstMistake);
      }

      // Fast Auto-Advance on Ayah Mastery if stopped when verse was 100%
      if (report.overallAccuracy >= 95 && report.detectedMistakesCount === 0 && autoAdvanceRef.current && currentAyah) {
        if (selectedAyahIndex + 1 < ayahs.length) {
          const nextAyahNumber = currentAyah.ayahNumber + 1;
          playMasteryChime();
          setAdvanceNotice(`🎉 Ayah ${currentAyah.ayahNumber} Mastered! Moving to Ayah ${nextAyahNumber}...`);
          setTimeout(() => {
            const nextIdx = selectedAyahIndex + 1;
            selectedAyahIndexRef.current = nextIdx;
            setSelectedAyahIndex(nextIdx);
            setDiagnosticReport(null);
            setSelectedMistake(null);
            setLiveTranscript('');
            setAdvanceNotice(null);
          }, 600);
        }
      }

      // Log genuine mistakes to database (only if words were actually spoken)
      if (report.detectedMistakesCount > 0 && report.overallAccuracy > 0 && currentAyah) {
        for (const ev of report.wordEvaluations) {
          if (ev.status !== 'correct') {
            await db.mistakes.add({
              id: `mistake-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              surahNumber: currentAyah.surahNumber,
              ayahNumber: currentAyah.ayahNumber,
              wordExpected: ev.canonicalWord,
              wordRecited: ev.recitedWord || '',
              mistakeType: ev.status,
              confidence: ev.confidence,
              timestamp: new Date().toISOString(),
              notes: ev.feedback || 'Detected in Recitation Studio',
              resolved: false
            });
          }
        }
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error processing recitation.');
    }
  };

  // Re-evaluate with manual transcript adjustment if speech recognizer misheard ambient sounds
  const handleReevaluateTranscript = async (customTranscript: string) => {
    if (!currentAyah) return;
    try {
      const report = await localRecitationEngine.stopListening(customTranscript);
      setDiagnosticReport(report);
      const firstMistake = report.wordEvaluations.find(w => w.status !== 'correct');
      setSelectedMistake(firstMistake || null);
    } catch (e: any) {
      setErrorMessage(e.message);
    }
  };

  // Play Sheikh Yasser Al-Dossary (or selected Qari)
  const playQariAudio = () => {
    if (!currentAyah) return;
    if (isPlayingQari && qariAudioRef.current) {
      qariAudioRef.current.pause();
      setIsPlayingQari(false);
      return;
    }

    const surahPadded = String(currentAyah.surahNumber).padStart(3, '0');
    const ayahPadded = String(currentAyah.ayahNumber).padStart(3, '0');
    const streamUrl = `${selectedReciter.baseUrl}${surahPadded}${ayahPadded}.mp3`;

    if (!qariAudioRef.current) {
      qariAudioRef.current = new Audio(streamUrl);
    } else {
      qariAudioRef.current.src = streamUrl;
    }

    qariAudioRef.current.play().then(() => setIsPlayingQari(true)).catch(e => console.warn(e));
    qariAudioRef.current.onended = () => setIsPlayingQari(false);
  };

  // Playback the student's own voice
  const playUserVoice = () => {
    if (!diagnosticReport?.userAudioUrl) return;
    if (isPlayingUserVoice && userAudioRef.current) {
      userAudioRef.current.pause();
      setIsPlayingUserVoice(false);
      return;
    }

    if (!userAudioRef.current) {
      userAudioRef.current = new Audio(diagnosticReport.userAudioUrl);
    } else {
      userAudioRef.current.src = diagnosticReport.userAudioUrl;
    }

    userAudioRef.current.play().then(() => setIsPlayingUserVoice(true)).catch(e => console.warn(e));
    userAudioRef.current.onended = () => setIsPlayingUserVoice(false);
  };

  const handleNextAyah = () => {
    if (selectedAyahIndex + 1 < ayahs.length) {
      const nextIdx = selectedAyahIndex + 1;
      selectedAyahIndexRef.current = nextIdx;
      setSelectedAyahIndex(nextIdx);
      setDiagnosticReport(null);
      setSelectedMistake(null);
      setLiveTranscript('');
      setActiveWordIndex(-1);
      setLiveMatchedWordIndices([]);
      setLiveMistakeWordIndices([]);
      if (isRecording) {
        localRecitationEngine.setTargetAyah(ayahs[nextIdx]);
      }
      if (qariAudioRef.current) qariAudioRef.current.pause();
      if (userAudioRef.current) userAudioRef.current.pause();
    }
  };

  const handlePrevAyah = () => {
    if (selectedAyahIndex > 0) {
      const prevIdx = selectedAyahIndex - 1;
      selectedAyahIndexRef.current = prevIdx;
      setSelectedAyahIndex(prevIdx);
      setDiagnosticReport(null);
      setSelectedMistake(null);
      setLiveTranscript('');
      setActiveWordIndex(-1);
      setLiveMatchedWordIndices([]);
      setLiveMistakeWordIndices([]);
      if (isRecording) {
        localRecitationEngine.setTargetAyah(ayahs[prevIdx]);
      }
      if (qariAudioRef.current) qariAudioRef.current.pause();
      if (userAudioRef.current) userAudioRef.current.pause();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Mobile Notice for iOS third-party browsers */}
      {isIOSNonSafari() && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Notice for iPhone & iPad users:</p>
            <p className="leading-relaxed text-stone-700 dark:text-stone-300">
              Apple restricts live Speech Recognition exclusively to Safari. In other mobile browsers, live speech highlights may not trigger. Please open Hikmat Quran directly in Safari for the optimal live experience, or use manual recitation confirmation.
            </p>
          </div>
        </div>
      )}

      {/* Studio Header & Configuration Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Surah Dropdown (All 114 Surahs) */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Surah:</label>
          <select
            value={selectedSurahNumber}
            onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-quran-gold-500/50"
          >
            {surahs.map(s => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.nameEnglish} ({s.nameArabic})
              </option>
            ))}
          </select>
        </div>

        {/* Qari Selector (Featuring Sheikh Yasser Al-Dossary) */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Teacher Qari:</label>
          <select
            value={selectedReciter.id}
            onChange={(e) => {
              const r = RECITERS_LIST.find(rec => rec.id === e.target.value);
              if (r) setSelectedReciter(r);
            }}
            className="px-3 py-2 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 text-xs font-bold text-quran-emerald-900 dark:text-quran-gold-300 focus:outline-none focus:ring-2 focus:ring-quran-gold-500/50"
          >
            {RECITERS_LIST.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Speech Recognition Dialect Tuning */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider hidden sm:block">Mic Dialect:</label>
          <select
            value={speechDialect}
            onChange={(e) => {
              setSpeechDialect(e.target.value);
              localRecitationEngine.setDialect(e.target.value);
            }}
            className="px-2.5 py-2 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none"
            title="Acoustic Speech Recognition Dialect"
          >
            <option value="ar-SA">🇸🇦 Saudi / Classical (ar-SA)</option>
            <option value="ar-EG">🇪🇬 Egyptian Recitation (ar-EG)</option>
            <option value="ar-AE">🇦🇪 Gulf Standard (ar-AE)</option>
            <option value="ar-QA">🇶🇦 Qatar / Gulf (ar-QA)</option>
            <option value="ar-MA">🇲🇦 Morocco / Maghreb (ar-MA)</option>
          </select>
        </div>

        {/* Precision Sensitivity Mode */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider hidden sm:block">Precision:</label>
          <select
            value={precisionMode}
            onChange={(e) => {
              const mode = e.target.value as 'balanced' | 'strict';
              setPrecisionMode(mode);
              localRecitationEngine.setPrecisionMode(mode);
            }}
            className="px-2.5 py-2 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none"
            title="Recitation Precision Sensitivity"
          >
            <option value="balanced">🎯 Balanced (Adaptive)</option>
            <option value="strict">📏 Strict (Tajweed & Letter Precision)</option>
          </select>
        </div>

        {/* Ayah Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevAyah}
            disabled={selectedAyahIndex === 0}
            className="p-2 rounded-xl bg-stone-100 dark:bg-quran-dark-800 disabled:opacity-40 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
            title="Previous Ayah"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
            Ayah {selectedAyahIndex + 1} of {ayahs.length}
          </span>
          <button
            onClick={handleNextAyah}
            disabled={selectedAyahIndex + 1 >= ayahs.length}
            className="p-2 rounded-xl bg-stone-100 dark:bg-quran-dark-800 disabled:opacity-40 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
            title="Next Ayah"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {currentAyah ? (
        <div className="space-y-6 relative">
          {/* Floating Advance Notice Toast */}
          {advanceNotice && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl bg-quran-emerald-950/95 text-white font-bold text-sm shadow-2xl border-2 border-quran-gold-400 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ring-4 ring-quran-gold-500/20">
              <Sparkles className="w-5 h-5 text-quran-gold-400 animate-spin" />
              <span>{advanceNotice}</span>
            </div>
          )}

          {/* Main Large Recitation Canvas */}
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-spiritual text-center relative overflow-hidden space-y-6">
            {/* Live recording banner with real mic volume bar */}
            {isRecording && (
              <div className="absolute top-0 left-0 right-0 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-md">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                  <span>Microphone Active ({recordingSeconds}s) — Recite in Arabic</span>
                </div>
                {/* Live Mic Volume Visualizer Bar */}
                <div className="w-48 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-quran-gold-400 transition-all duration-100 rounded-full"
                    style={{ width: `${Math.max(8, micVolumeLevel)}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                Surah {currentAyah.surahNumber}, Ayah {currentAyah.ayahNumber} • {surahs[selectedSurahNumber - 1]?.nameArabic}
              </span>
            </div>

            {/* Quranic Text with Inline Mistake Highlighting */}
            <div
              dir="rtl"
              className="font-quran text-4xl sm:text-5xl lg:text-6xl text-stone-900 dark:text-stone-100 py-4 leading-[2.6] flex flex-wrap items-center justify-center gap-x-3.5 gap-y-3"
            >
              {currentAyah.words.map((word, idx) => {
                const evalItem = diagnosticReport?.wordEvaluations.find(e => e.wordIndex === idx);
                let highlightStyle = 'hover:text-quran-emerald-800 dark:hover:text-quran-gold-400';

                if (isRecording) {
                  if (liveMistakeWordIndices.includes(idx)) {
                    // Mistake detected live!
                    highlightStyle = 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-2 border-rose-500 animate-pulse font-bold scale-105';
                  } else if (liveMatchedWordIndices.includes(idx)) {
                    // Confirmed correct word (turns serene emerald green!)
                    highlightStyle = 'bg-quran-emerald-100/90 dark:bg-quran-emerald-950/70 text-quran-emerald-900 dark:text-quran-gold-300 border border-quran-emerald-400 dark:border-quran-emerald-700 shadow-sm';
                  } else if (activeWordIndex === idx) {
                    // Currently active spoken word: vivid glowing gold pulsing circle/halo moving from word to word!
                    highlightStyle = 'bg-quran-gold-400 dark:bg-quran-gold-500 text-stone-950 scale-110 font-bold shadow-gold-glow ring-4 ring-quran-gold-400/60 animate-pulse';
                  }
                } else if (diagnosticReport && evalItem) {
                  if (evalItem.status === 'correct') {
                    highlightStyle = 'bg-quran-emerald-100/80 dark:bg-quran-emerald-950/60 text-quran-emerald-900 dark:text-quran-gold-300 border border-quran-emerald-300 dark:border-quran-emerald-800';
                  } else {
                    // MISTAKE HIGHLIGHTED IN ROSE/RED
                    highlightStyle = 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-2 border-rose-500 animate-pulse font-bold scale-105';
                  }
                }

                return (
                  <span
                    key={word.position}
                    onClick={() => {
                      if (evalItem && evalItem.status !== 'correct') {
                        setSelectedMistake(evalItem);
                      }
                    }}
                    className={`cursor-pointer px-3 py-1 rounded-2xl transition-all duration-200 ${highlightStyle}`}
                    title={evalItem?.status !== 'correct' && evalItem ? `Mistake detected: Click to hear Sheikh ${selectedReciter.name.split(' ')[1]} correct it!` : ''}
                  >
                    {word.arabic}
                  </span>
                );
              })}
              <span className="font-arabic text-2xl text-quran-gold-600 dark:text-quran-gold-400 px-2 select-none">
                ۝{currentAyah.ayahNumber}
              </span>
            </div>

            {/* Translation */}
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-xl mx-auto font-sans leading-relaxed">
              "{currentAyah.translationEnglish}"
            </p>

            {/* Live stream preview */}
            {liveTranscript && (
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-quran-dark-950 text-xs text-stone-600 dark:text-stone-300 font-arabic text-right border border-stone-200 dark:border-quran-dark-800">
                <span className="text-[10px] text-stone-400 font-sans block text-left mb-1">Detected Speech Stream:</span>
                {liveTranscript}
              </div>
            )}
          </div>

          {/* Recitation Trigger & Audio Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-quran-emerald-900 hover:bg-quran-emerald-950 text-white font-bold text-base shadow-spiritual transition transform hover:-translate-y-0.5 active:scale-95 border border-quran-gold-500/30"
              >
                <Mic className="w-5 h-5 text-quran-gold-400" />
                <span>Start Recitation</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg transition animate-pulse"
              >
                <Square className="w-5 h-5" />
                <span>Stop & Analyze Mistakes</span>
              </button>
            )}

            {/* Auto-Advance Toggle */}
            <button
              onClick={() => setAutoAdvanceOnMastery(prev => !prev)}
              className={`flex items-center gap-2 px-4 py-4 rounded-2xl border text-xs font-semibold transition ${
                autoAdvanceOnMastery
                  ? 'bg-quran-emerald-50 dark:bg-quran-emerald-950/60 border-quran-emerald-400 text-quran-emerald-800 dark:text-quran-emerald-300'
                  : 'bg-stone-100 dark:bg-quran-dark-800 border-stone-200 text-stone-500'
              }`}
              title="Automatically advance to the next Ayah once this Ayah is mastered"
            >
              <Sparkles className={`w-4 h-4 ${autoAdvanceOnMastery ? 'text-quran-gold-500' : 'text-stone-400'}`} />
              <span>Auto-Advance: {autoAdvanceOnMastery ? 'ON' : 'OFF'}</span>
            </button>

            {/* Listen to Qari reference */}
            <button
              onClick={playQariAudio}
              className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-white dark:bg-quran-dark-900 hover:bg-stone-50 dark:hover:bg-quran-dark-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-quran-dark-800 font-semibold text-sm shadow-sm transition"
            >
              {isPlayingQari ? <Pause className="w-4 h-4 text-quran-gold-500" /> : <Volume2 className="w-4 h-4 text-quran-gold-500" />}
              <span>Hear Sheikh {selectedReciter.name.split(' ')[1]}</span>
            </button>

            {/* Quick manual advance for mobile or teacher session */}
            <button
              onClick={() => handleAyahCompleteLive(currentAyah)}
              className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-quran-emerald-50 dark:bg-quran-emerald-950/50 hover:bg-quran-emerald-100 dark:hover:bg-quran-emerald-900/60 text-quran-emerald-800 dark:text-quran-emerald-300 border border-quran-emerald-300 dark:border-quran-emerald-800 font-semibold text-xs shadow-sm transition active:scale-95"
              title="Confirm mastery of this verse and move to the next Ayah"
            >
              <CheckCircle2 className="w-4 h-4 text-quran-emerald-600 dark:text-quran-gold-400" />
              <span>Ayah Mastered • Next →</span>
            </button>

            {/* Replay student's own voice if recorded */}
            {diagnosticReport?.userAudioUrl && (
              <button
                onClick={playUserVoice}
                className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900 font-semibold text-sm shadow-sm transition"
              >
                {isPlayingUserVoice ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>Replay My Recitation</span>
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
              {errorMessage}
            </div>
          )}

          {/* Mobile / Silent Recognizer Recitation Fallback: Audio was captured */}
          {diagnosticReport && diagnosticReport.overallAccuracy === 0 && diagnosticReport.userAudioUrl && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-quran-emerald-600 dark:text-quran-gold-400 shrink-0" />
                <span>Your voice was recorded successfully! If live speech detection was restricted on your mobile browser, you can confirm this Ayah:</span>
              </div>
              <button
                onClick={() => handleAyahCompleteLive(currentAyah)}
                className="px-4 py-2 rounded-xl bg-quran-emerald-800 hover:bg-quran-emerald-900 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-quran-gold-400" />
                <span>Confirm Recitation & Next</span>
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* MISTAKE CORRECTION CARD */}
          {/* ======================================================== */}
          {selectedMistake && (
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/70 dark:bg-rose-950/40 border-2 border-rose-500 shadow-spiritual space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-900/60 pb-3">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-base">
                    Mistake Detected on: <span className="font-arabic text-2xl font-bold">{selectedMistake.canonicalWord}</span>
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 uppercase">
                  {selectedMistake.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-2xl bg-white dark:bg-quran-dark-900 border border-stone-200 dark:border-stone-800">
                  <span className="text-xs font-semibold text-stone-400 block mb-1">Expected Canonical Word:</span>
                  <p className="font-arabic text-3xl font-bold text-quran-emerald-800 dark:text-quran-gold-400">
                    {selectedMistake.canonicalWord}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-quran-dark-900 border border-stone-200 dark:border-stone-800">
                  <span className="text-xs font-semibold text-stone-400 block mb-1">What Was Heard:</span>
                  <p className="font-arabic text-3xl font-bold text-rose-600">
                    {selectedMistake.recitedWord || 'Skipped / Silence'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                {selectedMistake.feedback}
              </p>

              {/* Action Buttons to Hear Qari vs Hear Own Voice */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={playQariAudio}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-quran-emerald-900 hover:bg-quran-emerald-950 text-white font-bold text-xs shadow-sm transition"
                >
                  <Volume2 className="w-4 h-4 text-quran-gold-400" />
                  <span>Hear Sheikh {selectedReciter.name.split(' ')[1]} Recite Correctly</span>
                </button>

                {diagnosticReport?.userAudioUrl && (
                  <button
                    onClick={playUserVoice}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-quran-dark-900 hover:bg-stone-100 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 font-bold text-xs shadow-sm transition"
                  >
                    <Play className="w-4 h-4" />
                    <span>Hear How You Recited It</span>
                  </button>
                )}

                <button
                  onClick={handleStartRecording}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 font-semibold text-xs transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Reciting Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Overall Diagnostic Performance Report */}
          {diagnosticReport && (
            <div className="p-6 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Recitation Accuracy</p>
                  <p className={`text-3xl font-bold ${diagnosticReport.overallAccuracy === 0 ? 'text-rose-600' : 'text-quran-emerald-800 dark:text-quran-gold-400'}`}>
                    {diagnosticReport.overallAccuracy}%
                  </p>
                  {diagnosticReport.overallAccuracy === 0 && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">
                      No recitation detected. Make sure your microphone is enabled and speak clearly in Arabic.
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Mistakes Detected</p>
                  <p className="text-2xl font-bold text-rose-600">
                    {diagnosticReport.detectedMistakesCount} {diagnosticReport.detectedMistakesCount === 1 ? 'word' : 'words'}
                  </p>
                </div>

                <button
                  onClick={handleNextAyah}
                  disabled={selectedAyahIndex + 1 >= ayahs.length}
                  className="flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-quran-emerald-900 hover:bg-quran-emerald-950 text-white text-xs font-bold shadow-sm transition"
                >
                  <span>Continue to Next Ayah ({selectedAyahIndex + 2})</span>
                  <ChevronRight className="w-4 h-4 text-quran-gold-400" />
                </button>
              </div>

              {/* Manual Speech Verification / Override Input */}
              <div className="pt-3 border-t border-stone-100 dark:border-quran-dark-800 text-xs flex flex-col sm:flex-row items-center gap-2">
                <span className="text-stone-400 shrink-0 font-medium">Verify Recited Arabic Words:</span>
                <input 
                  type="text" 
                  defaultValue={diagnosticReport.rawTranscript}
                  placeholder="Words captured by microphone..."
                  dir="rtl"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-quran-dark-950 border border-stone-200 dark:border-quran-dark-800 font-arabic text-sm text-stone-800 dark:text-stone-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleReevaluateTranscript((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input) handleReevaluateTranscript(input.value);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 font-semibold text-xs transition shrink-0"
                >
                  Re-evaluate
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-stone-500 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800">
          Loading Surah {selectedSurahNumber}...
        </div>
      )}
    </div>
  );
};
