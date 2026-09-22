import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  Layers, 
  Repeat, 
  HelpCircle,
  Award,
  Mic,
  Square,
  Volume2,
  Pause,
  Play,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { db } from '../db/quranDexieDB';
import { Ayah, HifzItem, Reciter, QuranWord } from '../types/quran';
import { SURAH_LIST, RECITERS_LIST } from '../data/quranDataset';
import { quranContentService } from '../services/quran/QuranContentService';
import { calculateNextReview, getStrengthCategory, getStrengthColor } from '../services/hifz/SrsScheduler';
import { 
  normalizeQuranicPhonetics, 
  consolidateArabicPrefixes, 
  alignQuranicWordSequences,
  bestWindowDistance,
  extractIntroductoryInvocation
} from '../services/ai/LocalRecitationEngine';

export type HifzMode = 
  | 'tasma'           // Blind Oral Recall: Shows verse numbers, fills up as you recite
  | 'partial_mask'    // Alternating words masked
  | 'word_reveal'     // Progressive tap to reveal
  | 'first_letters'   // Only first letters visible
  | 'hidden'          // Fully hidden
  | 'transition'      // Ayah-to-ayah transition trainer
  | 'mutashabihat';   // Similar Ayah contrast

interface WordState {
  word: QuranWord;
  status: 'hidden' | 'correct' | 'mistake';
  recitedText?: string;
}

interface AyahTasmaState {
  ayahNumber: number;
  isCompleted: boolean;
  hasMistake: boolean;
  wordStates: WordState[];
}

interface MistakeDetail {
  ayahNumber: number;
  wordIndex: number;
  expectedWord: string;
  recitedWord: string;
  ayahAudioUrl?: string;
  userAudioUrl?: string;
}

export const Hifz: React.FC = () => {
  // Surah & Reciter state
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(true);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS_LIST[0]); // Sheikh Yasser Al-Dossary default

  // Mode selection: Tasma' (oral recall) is the default primary mode
  const [selectedMode, setSelectedMode] = useState<HifzMode>('tasma');

  // Spaced Repetition queue & active ayah
  const [hifzItems, setHifzItems] = useState<HifzItem[]>([]);
  const [activeAyahIndex, setActiveAyahIndex] = useState<number>(0);

  // Tasma' (Blind Recall) Live Recitation state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [accumulatedSpokenTokens, setAccumulatedSpokenTokens] = useState<string[]>([]);
  const [tasmaAyahStates, setTasmaAyahStates] = useState<AyahTasmaState[]>([]);
  const [activeMistake, setActiveMistake] = useState<MistakeDetail | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [revealedWordIndex, setRevealedWordIndex] = useState<number>(0);
  const [firstWordPeeks, setFirstWordPeeks] = useState<Record<number, boolean>>({});
  const [masteredAyahToast, setMasteredAyahToast] = useState<string | null>(null);
  const [autoAdvanceOnMastery, setAutoAdvanceOnMastery] = useState<boolean>(true);

  // Subtle pleasant spiritual chime on Ayah mastery
  const playMasteryChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: 523.25 Hz (C5)
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

      // Note 2: 783.99 Hz (G5)
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
      // AudioContext blocked or not supported in environment
    }
  };

  // Audio Playback states
  const [isPlayingQari, setIsPlayingQari] = useState<boolean>(false);
  const [isPlayingUserVoice, setIsPlayingUserVoice] = useState<boolean>(false);
  const [userRecordedAudioUrl, setUserRecordedAudioUrl] = useState<string | null>(null);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);

  // Audio refs & engine refs
  const qariAudioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<any>(null);

  // Tracking refs for continuous multi-ayah oral flow
  const consumedTokensCountRef = useRef<number>(0);
  const activeAyahIndexRef = useRef<number>(0);
  const latestSpokenTokensCountRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);
  const tasmaAyahStatesRef = useRef<AyahTasmaState[]>([]);

  // 1. Load Surah Ayahs & Hifz SRS data
  useEffect(() => {
    async function loadSurahData() {
      setIsLoadingAyahs(true);
      await db.initializeSeedData();

      const items = await db.hifzItems.toArray();
      setHifzItems(items);

      const loadedAyahs = await quranContentService.getOrFetchSurahAyahs(selectedSurahNumber);
      setAyahs(loadedAyahs);
      setActiveAyahIndex(0);
      setRevealedWordIndex(0);
      setFirstWordPeeks({});
      setActiveMistake(null);
      setSessionCompleted(false);

      consumedTokensCountRef.current = 0;
      activeAyahIndexRef.current = 0;
      latestSpokenTokensCountRef.current = 0;
      isTransitioningRef.current = false;

      // Initialize Tasma' states for each ayah in this Surah
      const initialTasmaStates: AyahTasmaState[] = loadedAyahs.map(a => ({
        ayahNumber: a.ayahNumber,
        isCompleted: false,
        hasMistake: false,
        wordStates: a.words.map(w => ({
          word: w,
          status: 'hidden'
        }))
      }));
      tasmaAyahStatesRef.current = initialTasmaStates;
      setTasmaAyahStates(initialTasmaStates);
      setIsLoadingAyahs(false);
    }

    loadSurahData();
  }, [selectedSurahNumber]);

  // Clean up recording & volume meter on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
      if (qariAudioRef.current) qariAudioRef.current.pause();
      if (userAudioRef.current) userAudioRef.current.pause();
    };
  }, []);

  const currentAyah = ayahs[activeAyahIndex] || ayahs[0];
  const nextAyah = ayahs[activeAyahIndex + 1] || null;

  // Real-time audio volume visualizer
  const setupVolumeMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setMicVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn('[Hifz] Volume meter could not be initialized:', e);
    }
  };

  const cleanupRecording = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setMicVolumeLevel(0);
  };

  // -------------------------------------------------------------
  // TASMA' ORAL RECALL: START / STOP / PROCESS RECITATION
  // -------------------------------------------------------------
  const startTasmaRecitation = async () => {
    if (!currentAyah) return;

    setActiveMistake(null);
    setLiveTranscript('');
    setAccumulatedSpokenTokens([]);
    setRecordingSeconds(0);
    setSessionCompleted(false);

    consumedTokensCountRef.current = 0;
    activeAyahIndexRef.current = activeAyahIndex;
    isTransitioningRef.current = false;

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);

    await setupVolumeMeter();

    // Setup MediaRecorder for replaying student's voice
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.start(250);
        mediaRecorderRef.current = recorder;
      } catch (e) {
        console.warn('[Hifz] MediaRecorder error:', e);
      }
    }

    // Setup Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 5;
        recognition.lang = 'ar-SA';

        recognition.onresult = (event: any) => {
          let fullTranscript = '';
          const targetAyah = ayahs[activeAyahIndexRef.current];
          const verseNorm = targetAyah ? normalizeQuranicPhonetics(targetAyah.textSimple) : '';

          for (let i = 0; i < event.results.length; ++i) {
            const res = event.results[i];
            let bestText = res[0].transcript;

            // Pick candidate hypothesis with highest phonetic fidelity to target Ayah
            if (res.length > 1 && verseNorm) {
              let minScore = 999;
              for (let alt = 0; alt < res.length; alt++) {
                const candidate = res[alt].transcript;
                const candNorm = normalizeQuranicPhonetics(candidate);
                const dist = bestWindowDistance(verseNorm, candNorm);
                if (dist < minScore) {
                  minScore = dist;
                  bestText = candidate;
                }
              }
            }

            fullTranscript += ' ' + bestText;
          }

          const currentStream = fullTranscript.trim();
          setLiveTranscript(currentStream);

          if (currentStream) {
            processSpokenRecitation(currentStream);
          }
        };

        recognition.onerror = (e: any) => {
          if (e.error !== 'no-speech' && e.error !== 'aborted') {
            console.warn('[Hifz] Speech error:', e.error);
          }
        };

        // Keep-alive on breath pause
        recognition.onend = () => {
          if (isRecording) {
            try {
              recognition.start();
              consumedTokensCountRef.current = 0;
            } catch (err) {}
          }
        };

        speechRecognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (e) {
          console.warn('[Hifz] Recognition start error:', e);
        }
      }
    }

    setIsRecording(true);
  };

  const stopTasmaRecitation = () => {
    setIsRecording(false);
    cleanupRecording();

    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.onend = null;
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setUserRecordedAudioUrl(URL.createObjectURL(blob));
    }
  };

  // Live matching & progressive filling logic with seamless multi-ayah flow
  const processSpokenRecitation = (transcript: string) => {
    const rawTokens = transcript.split(/\s+/).filter(Boolean);
    const spokenTokens = consolidateArabicPrefixes(rawTokens);
    latestSpokenTokensCountRef.current = spokenTokens.length;

    const currIdx = activeAyahIndexRef.current;
    const targetAyah = ayahs[currIdx];
    if (!targetAyah || tasmaAyahStatesRef.current.length === 0) return;

    // Self-heal: if speech recognition restarted on pause, spokenTokens may be shorter than consumed
    if (spokenTokens.length < consumedTokensCountRef.current) {
      consumedTokensCountRef.current = 0;
    }

    // Slice out the tokens that belong to the current active Ayah
    const currentAyahTokens = spokenTokens.slice(consumedTokensCountRef.current);
    if (currentAyahTokens.length === 0) return;

    // Detect and separate opening Basmalah/Isti'adhah if this is not Surah 1 Ayah 1
    const isBasmalahVerse = targetAyah.surahNumber === 1 && targetAyah.ayahNumber === 1;
    const { verseTokens } = extractIntroductoryInvocation(currentAyahTokens, isBasmalahVerse);
    if (verseTokens.length === 0) return;

    const canonicalWords = targetAyah.words.map(w => w.arabic);
    const alignment = alignQuranicWordSequences(canonicalWords, verseTokens);

    const currentAyahState = tasmaAyahStatesRef.current[currIdx];
    let hasError = false;

    const updatedWords: WordState[] = targetAyah.words.map((w, wIdx) => {
      const existingState = currentAyahState?.wordStates[wIdx];

      // 1. If this word was already confirmed correct, it remains correct!
      // A previously confirmed correct word must never be reverted or flagged red by later speech.
      if (existingState && existingState.status === 'correct') {
        return existingState;
      }

      const pair = alignment.find(a => a.canonicalIndex === wIdx);

      if (pair) {
        if (pair.status === 'correct') {
          return {
            word: w,
            status: 'correct',
            recitedText: pair.spokenToken
          };
        } else if (pair.status === 'substituted') {
          hasError = true;
          return {
            word: w,
            status: 'mistake',
            recitedText: pair.spokenToken
          };
        }
      }

      return { word: w, status: 'hidden' };
    });

    const correctCount = updatedWords.filter(w => w.status === 'correct').length;
    const isAyahMastered = correctCount === canonicalWords.length && !hasError;

    // Synchronously update ref and trigger state re-render
    const newStates = [...tasmaAyahStatesRef.current];
    newStates[currIdx] = {
      ayahNumber: targetAyah.ayahNumber,
      isCompleted: isAyahMastered,
      hasMistake: hasError,
      wordStates: updatedWords
    };
    tasmaAyahStatesRef.current = newStates;
    setTasmaAyahStates(newStates);

    // AUTOMATIC PROGRESSION:
    // When the student masters this verse, automatically flow into the next verse!
    if (isAyahMastered && !isTransitioningRef.current && autoAdvanceOnMastery) {
      if (currIdx + 1 < ayahs.length) {
        isTransitioningRef.current = true;
        const nextIdx = currIdx + 1;
        const nextAyahNumber = targetAyah.ayahNumber + 1;

        // Play subtle spiritual reward chime
        playMasteryChime();

        // Consume all tokens spoken up to this completed Ayah
        consumedTokensCountRef.current = spokenTokens.length;
        activeAyahIndexRef.current = nextIdx;
        setActiveAyahIndex(nextIdx);

        setMasteredAyahToast(`🎉 Ayah ${targetAyah.ayahNumber} Mastered! Flowing to Ayah ${nextAyahNumber}...`);

        // Smoothly scroll down to center the new Ayah card
        setTimeout(() => {
          const el = document.getElementById(`tasma-ayah-${nextAyahNumber}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);

        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 500);

        setTimeout(() => {
          setMasteredAyahToast(null);
        }, 3000);
      } else {
        // All Ayahs in this Surah finished!
        playMasteryChime();
        setSessionCompleted(true);
        stopTasmaRecitation();
      }
    }
  };

  // Play Sheikh Yasser Al-Dossary reference
  const playQariAudio = (ayah: Ayah) => {
    if (isPlayingQari && qariAudioRef.current) {
      qariAudioRef.current.pause();
      setIsPlayingQari(false);
      return;
    }

    if (userAudioRef.current) {
      userAudioRef.current.pause();
      setIsPlayingUserVoice(false);
    }

    const surahPadded = String(ayah.surahNumber).padStart(3, '0');
    const ayahPadded = String(ayah.ayahNumber).padStart(3, '0');
    const url = `${selectedReciter.baseUrl}${surahPadded}${ayahPadded}.mp3`;

    if (!qariAudioRef.current) {
      qariAudioRef.current = new Audio(url);
    } else {
      qariAudioRef.current.src = url;
    }

    qariAudioRef.current.play().then(() => setIsPlayingQari(true)).catch(e => console.warn(e));
    qariAudioRef.current.onended = () => setIsPlayingQari(false);
  };

  // Play student's recorded voice
  const playUserVoice = () => {
    if (!userRecordedAudioUrl) return;

    if (isPlayingUserVoice && userAudioRef.current) {
      userAudioRef.current.pause();
      setIsPlayingUserVoice(false);
      return;
    }

    if (qariAudioRef.current) {
      qariAudioRef.current.pause();
      setIsPlayingQari(false);
    }

    if (!userAudioRef.current) {
      userAudioRef.current = new Audio(userRecordedAudioUrl);
    } else {
      userAudioRef.current.src = userRecordedAudioUrl;
    }

    userAudioRef.current.play().then(() => setIsPlayingUserVoice(true)).catch(e => console.warn(e));
    userAudioRef.current.onended = () => setIsPlayingUserVoice(false);
  };

  // Memory Peek First Word Hint
  const handlePeekFirstWord = (ayahNumber: number) => {
    setFirstWordPeeks(prev => ({
      ...prev,
      [ayahNumber]: true
    }));
  };

  // Submit SM-2 Recall Grade
  const submitGrade = async (grade: number) => {
    const activeItem = hifzItems.find(i => i.id === `${selectedSurahNumber}:${currentAyah.ayahNumber}`) || {
      id: `${selectedSurahNumber}:${currentAyah.ayahNumber}`,
      surahNumber: selectedSurahNumber,
      ayahNumber: currentAyah.ayahNumber,
      repetitions: 1,
      intervalDays: 1,
      easeFactor: 2.5,
      lastReviewedDate: new Date().toISOString(),
      nextDueDate: new Date(Date.now() + 86400000).toISOString(),
      strength: 60,
      history: []
    };

    const updated = calculateNextReview(activeItem, grade);
    await db.hifzItems.put(updated);

    const refreshed = await db.hifzItems.toArray();
    setHifzItems(refreshed);

    const gradeDescriptions = [
      "Needs review",
      "Struggled",
      "Developing",
      "Good recall",
      "Strong retention",
      "Flawless mastery"
    ];
    setReviewSuccessMessage(`Recorded: ${gradeDescriptions[grade]}! Next revision in ${updated.intervalDays} day(s).`);

    setTimeout(() => {
      setReviewSuccessMessage(null);
    }, 2500);
  };

  // Calculate current completion statistics
  const completedAyahsCount = tasmaAyahStates.filter(s => s.isCompleted).length;
  const mistakeWordsCount = tasmaAyahStates.reduce((acc, curr) => {
    return acc + curr.wordStates.filter(w => w.status === 'mistake').length;
  }, 0);
  const totalWordsCount = ayahs.reduce((acc, a) => acc + a.words.length, 0);
  const revealedWordsCount = tasmaAyahStates.reduce((acc, curr) => {
    return acc + curr.wordStates.filter(w => w.status === 'correct').length;
  }, 0);
  const completionPercentage = totalWordsCount > 0 ? Math.round((revealedWordsCount / totalWordsCount) * 100) : 0;

  if (isLoadingAyahs || ayahs.length === 0 || !currentAyah) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-quran-gold-500 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-stone-600 dark:text-stone-300">
          Loading Surah {SURAH_LIST[selectedSurahNumber - 1]?.nameEnglish || selectedSurahNumber} for Hifz Coach...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Bar */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200 dark:border-amber-900">
          <Brain className="w-3.5 h-3.5" />
          <span>Hifz Coach • Multi-Surah Memorization & Blind Recall</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Quran Memorization & Oral Tasma’ Studio
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-2xl mx-auto leading-relaxed">
          Recite from memory across all 114 Surahs. Watch verses fill up in real time as you recite, catch and correct mistakes in red, and calibrate with Sheikh Yasser Al-Dossary.
        </p>
      </div>

      {/* Control Bar: Surah Picker, Mode Selector & Qari Selector */}
      <div className="p-4 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* All 114 Surahs Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Surah:</label>
          <select
            value={selectedSurahNumber}
            onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-quran-gold-500"
          >
            {SURAH_LIST.map((surah) => (
              <option key={surah.number} value={surah.number}>
                {surah.number}. {surah.nameEnglish} ({surah.nameArabic}) • {surah.totalAyahs} Ayahs
              </option>
            ))}
          </select>
        </div>

        {/* Qari Selection */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider hidden sm:block">Qari:</label>
          <select
            value={selectedReciter.id}
            onChange={(e) => {
              const r = RECITERS_LIST.find(rec => rec.id === e.target.value);
              if (r) setSelectedReciter(r);
            }}
            className="px-3 py-2 rounded-xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 text-xs font-bold text-quran-emerald-900 dark:text-quran-gold-300 focus:outline-none"
          >
            {RECITERS_LIST.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-quran-dark-950 border border-stone-200 dark:border-quran-dark-800">
          <button
            onClick={() => setSelectedMode('tasma')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              selectedMode === 'tasma'
                ? 'bg-quran-emerald-900 text-white dark:bg-quran-gold-500 dark:text-stone-950 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-quran-gold-400" />
            <span>🎙️ Tasma’ (Blind Recall)</span>
          </button>
          <button
            onClick={() => setSelectedMode('partial_mask')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedMode === 'partial_mask'
                ? 'bg-white dark:bg-quran-dark-800 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Partial Mask
          </button>
          <button
            onClick={() => setSelectedMode('transition')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedMode === 'transition'
                ? 'bg-white dark:bg-quran-dark-800 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Transitions
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: TASMA' (BLIND RECALL & FILL AS YOU RECITE)        */}
      {/* ======================================================== */}
      {selectedMode === 'tasma' && (
        <div className="space-y-6 relative">
          {/* Floating Smooth Mastery Toast Banner */}
          {masteredAyahToast && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl bg-quran-emerald-950/95 text-white font-bold text-sm shadow-2xl border-2 border-quran-gold-400 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ring-4 ring-quran-gold-500/20">
              <Sparkles className="w-5 h-5 text-quran-gold-400 animate-spin" />
              <span>{masteredAyahToast}</span>
            </div>
          )}

          {/* Live Recitation Control Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-spiritual text-center relative overflow-hidden space-y-6">
            {/* Live recording top banner with volume visualizer */}
            {isRecording && (
              <div className="absolute top-0 left-0 right-0 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-md animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                  <span>Oral Tasma’ Active ({recordingSeconds}s) — Recite Surah {SURAH_LIST[selectedSurahNumber - 1]?.nameEnglish} from memory</span>
                </div>
                {/* Real-time volume visualizer */}
                <div className="w-48 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-quran-gold-400 transition-all duration-100 rounded-full"
                    style={{ width: `${Math.max(10, micVolumeLevel)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Surah Progress Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 dark:border-quran-dark-800 pb-4">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block">
                  Surah {selectedSurahNumber} • {SURAH_LIST[selectedSurahNumber - 1]?.nameEnglish}
                </span>
                <span className="font-arabic text-2xl font-bold text-quran-emerald-900 dark:text-quran-gold-400">
                  سُورَةُ {SURAH_LIST[selectedSurahNumber - 1]?.nameArabic}
                </span>
              </div>

              {/* Progress metrics */}
              <div className="flex items-center gap-4 text-left">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Recall Progress</span>
                  <span className="text-sm font-bold text-stone-800 dark:text-stone-200">
                    {completedAyahsCount} / {ayahs.length} Ayahs ({completionPercentage}%)
                  </span>
                </div>
                {mistakeWordsCount > 0 && (
                  <div>
                    <span className="text-[10px] text-rose-500 uppercase font-bold block">Mistakes</span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      {mistakeWordsCount} flagged in red
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Recitation Trigger Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  onClick={startTasmaRecitation}
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-quran-emerald-900 hover:bg-quran-emerald-950 text-white font-bold text-base shadow-spiritual transition transform hover:-translate-y-0.5 active:scale-95 border border-quran-gold-500/30"
                >
                  <Mic className="w-5 h-5 text-quran-gold-400" />
                  <span>Start Reciting from Memory</span>
                </button>
              ) : (
                <button
                  onClick={stopTasmaRecitation}
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg transition animate-pulse"
                >
                  <Square className="w-5 h-5" />
                  <span>Pause / Stop Recitation</span>
                </button>
              )}

              {/* Auto-Flow Toggle Button */}
              <button
                onClick={() => setAutoAdvanceOnMastery(prev => !prev)}
                className={`flex items-center gap-2 px-4 py-4 rounded-2xl border text-xs font-semibold transition ${
                  autoAdvanceOnMastery
                    ? 'bg-quran-emerald-50 dark:bg-quran-emerald-950/60 border-quran-emerald-400 text-quran-emerald-800 dark:text-quran-emerald-300'
                    : 'bg-stone-100 dark:bg-quran-dark-800 border-stone-200 text-stone-500'
                }`}
                title="Automatically proceed to recite the next Ayah once the current Ayah is mastered"
              >
                <Sparkles className={`w-4 h-4 ${autoAdvanceOnMastery ? 'text-quran-gold-500' : 'text-stone-400'}`} />
                <span>Auto-Flow: {autoAdvanceOnMastery ? 'ON' : 'OFF'}</span>
              </button>

              {/* Hear Sheikh Yasser Al-Dossary current Ayah reference */}
              <button
                onClick={() => playQariAudio(currentAyah)}
                className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-stone-50 dark:bg-quran-dark-950 hover:bg-stone-100 dark:hover:bg-quran-dark-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-quran-dark-800 font-semibold text-xs transition"
              >
                {isPlayingQari ? (
                  <>
                    <Pause className="w-4 h-4 text-quran-gold-500" />
                    <span>Pause Qari</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-quran-gold-500" />
                    <span>Listen to Ayah {currentAyah.ayahNumber}</span>
                  </>
                )}
              </button>

              {/* Reset Surah Button */}
              <button
                onClick={() => {
                  stopTasmaRecitation();
                  const resetStates: AyahTasmaState[] = ayahs.map(a => ({
                    ayahNumber: a.ayahNumber,
                    isCompleted: false,
                    hasMistake: false,
                    wordStates: a.words.map(w => ({ word: w, status: 'hidden' }))
                  }));
                  setTasmaAyahStates(resetStates);
                  setActiveAyahIndex(0);
                  activeAyahIndexRef.current = 0;
                  consumedTokensCountRef.current = 0;
                  setActiveMistake(null);
                  setSessionCompleted(false);
                }}
                className="flex items-center gap-1.5 px-4 py-4 rounded-2xl bg-stone-100 dark:bg-quran-dark-800 hover:bg-stone-200 text-stone-600 dark:text-stone-400 text-xs font-semibold transition"
                title="Restart Surah from beginning"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart</span>
              </button>
            </div>

            {/* Live speech feedback stream */}
            {liveTranscript && (
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-quran-dark-950 text-xs text-stone-700 dark:text-stone-300 font-arabic text-right border border-stone-200 dark:border-quran-dark-800 animate-in fade-in">
                <span className="text-[10px] text-stone-400 font-sans block text-left mb-1">
                  Active Microphone Stream (Targeting Ayah {currentAyah.ayahNumber}):
                </span>
                {liveTranscript}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* THE BLIND RECALL CANVAS: DYNAMIC FILL-AS-YOU-RECITE GRID */}
          {/* ======================================================== */}
          <div className="space-y-4">
            {ayahs.map((ayah, aIdx) => {
              const ayahState = tasmaAyahStates[aIdx];
              const isActive = aIdx === activeAyahIndex;
              const isCompleted = ayahState?.isCompleted;
              const hasMistake = ayahState?.hasMistake;
              const isPeeked = firstWordPeeks[ayah.ayahNumber];

              return (
                <div
                  key={ayah.id}
                  id={`tasma-ayah-${ayah.ayahNumber}`}
                  onClick={() => {
                    if (activeAyahIndex !== aIdx) {
                      activeAyahIndexRef.current = aIdx;
                      setActiveAyahIndex(aIdx);
                      consumedTokensCountRef.current = latestSpokenTokensCountRef.current;
                    }
                  }}
                  className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-quran-dark-900 border-quran-gold-500 shadow-spiritual ring-2 ring-quran-gold-500/20'
                      : isCompleted
                      ? 'bg-quran-emerald-50/30 dark:bg-quran-emerald-950/20 border-quran-emerald-200 dark:border-quran-emerald-900'
                      : 'bg-stone-50/60 dark:bg-quran-dark-950/40 border-stone-200 dark:border-quran-dark-800 opacity-80'
                  }`}
                >
                  {/* Top Bar for this Ayah: Number badge, Qari preview, Hint peek */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center ${
                        isCompleted
                          ? 'bg-quran-emerald-600 text-white'
                          : isActive
                          ? 'bg-quran-gold-500 text-stone-950'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                      }`}>
                        {ayah.ayahNumber}
                      </span>
                      <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                        Ayah {ayah.ayahNumber}
                      </span>

                      {/* Status pill */}
                      {isCompleted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-quran-emerald-100 dark:bg-quran-emerald-950 text-quran-emerald-700 dark:text-quran-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Mastered
                        </span>
                      )}
                      {hasMistake && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Mistake Detected
                        </span>
                      )}
                    </div>

                    {/* Assistance Hint Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Peek First Word Hint */}
                      {!isCompleted && (
                        <button
                          onClick={() => handlePeekFirstWord(ayah.ayahNumber)}
                          className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-quran-dark-800 hover:bg-stone-200 text-[11px] font-semibold text-stone-600 dark:text-stone-300 flex items-center gap-1 transition"
                          title="Peek first word to jog memory"
                        >
                          <Lightbulb className="w-3 h-3 text-amber-500" />
                          <span>Peek Opening</span>
                        </button>
                      )}

                      {/* Hear Sheikh Yasser Al-Dossary preview */}
                      <button
                        onClick={() => playQariAudio(ayah)}
                        className="p-1.5 rounded-xl bg-stone-100 dark:bg-quran-dark-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 transition"
                        title={`Listen to Sheikh ${selectedReciter.name} recite Ayah ${ayah.ayahNumber}`}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-quran-gold-500" />
                      </button>
                    </div>
                  </div>

                  {/* Words Display Canvas: DYNAMIC FILL-AS-YOU-RECITE */}
                  <div
                    dir="rtl"
                    className="font-quran text-3xl sm:text-4xl lg:text-5xl text-stone-900 dark:text-stone-100 py-2 leading-[2.6] flex flex-wrap items-center justify-center gap-x-3.5 gap-y-3"
                  >
                    {ayah.words.map((w, wIdx) => {
                      const wordState = ayahState?.wordStates[wIdx];
                      const isRevealed = wordState?.status === 'correct';
                      const isMistake = wordState?.status === 'mistake';
                      const isFirstWordAndPeeked = wIdx === 0 && isPeeked;

                      let wordStyle = 'bg-stone-200/70 dark:bg-stone-800/60 text-transparent min-w-[70px] inline-block text-center rounded-2xl select-none';

                      if (isRevealed) {
                        wordStyle = 'bg-quran-emerald-50 dark:bg-quran-emerald-950/70 text-quran-emerald-950 dark:text-quran-gold-300 border border-quran-emerald-300 dark:border-quran-emerald-800 px-3 py-1 rounded-2xl font-bold shadow-sm animate-in zoom-in-95';
                      } else if (isMistake) {
                        // HIGHLIGHTED IN BRIGHT RED / ROSE
                        wordStyle = 'bg-rose-100 dark:bg-rose-950/90 text-rose-700 dark:text-rose-200 border-2 border-rose-500 px-3 py-1 rounded-2xl font-bold shadow-md animate-pulse cursor-pointer';
                      } else if (isFirstWordAndPeeked) {
                        wordStyle = 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 px-3 py-1 rounded-2xl font-medium';
                      }

                      return (
                        <span
                          key={w.position}
                          onClick={() => {
                            if (isMistake) {
                              setActiveMistake({
                                ayahNumber: ayah.ayahNumber,
                                wordIndex: wIdx,
                                expectedWord: w.arabic,
                                recitedWord: wordState?.recitedText || '',
                                ayahAudioUrl: ayah.audioUrl,
                                userAudioUrl: userRecordedAudioUrl || undefined
                              });
                            }
                          }}
                          className={`transition duration-200 ${wordStyle}`}
                          title={isMistake ? "Mistake detected! Tap to hear Sheikh Yasser Al-Dossary correct it" : ""}
                        >
                          {isRevealed || isFirstWordAndPeeked || isCompleted
                            ? w.arabic
                            : isMistake
                            ? wordState?.recitedText || w.arabic
                            : '••••••'}
                        </span>
                      );
                    })}

                    <span className="font-arabic text-2xl text-quran-gold-600 dark:text-quran-gold-400 px-2 select-none">
                      ۝{ayah.ayahNumber}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* INTERACTIVE MISTAKE CORRECTION MODAL / CARD             */}
          {/* ======================================================== */}
          {activeMistake && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-quran-dark-900 border-2 border-rose-500 shadow-2xl space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-quran-dark-800 pb-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-5 h-5" />
                  <h4 className="font-bold text-base">
                    Mistake Detected on Ayah {activeMistake.ayahNumber}
                  </h4>
                </div>
                <button
                  onClick={() => setActiveMistake(null)}
                  className="text-xs font-semibold text-stone-400 hover:text-stone-600"
                >
                  ✕ Close
                </button>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                {/* Expected Word */}
                <div className="p-5 rounded-2xl bg-quran-emerald-50 dark:bg-quran-emerald-950/60 border border-quran-emerald-200 dark:border-quran-emerald-800 space-y-2">
                  <span className="text-xs font-bold text-quran-emerald-800 dark:text-quran-emerald-300 uppercase">
                    Expected Word (Correct)
                  </span>
                  <div className="font-quran text-5xl font-bold text-quran-emerald-950 dark:text-quran-gold-300">
                    {activeMistake.expectedWord}
                  </div>
                  <p className="text-xs text-stone-500">As written in the authentic Uthmani script.</p>
                </div>

                {/* What Student Recited */}
                <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 space-y-2">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase">
                    What You Recited
                  </span>
                  <div className="font-arabic text-5xl font-bold text-rose-700 dark:text-rose-400">
                    {activeMistake.recitedWord || 'Omitted'}
                  </div>
                  <p className="text-xs text-stone-500">Acoustic transcript detected a substitution/slip.</p>
                </div>
              </div>

              {/* Audio Playback & Correction Action Bar */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {/* Hear Sheikh Yasser Al-Dossary */}
                <button
                  onClick={() => {
                    const ayah = ayahs.find(a => a.ayahNumber === activeMistake.ayahNumber);
                    if (ayah) playQariAudio(ayah);
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-quran-emerald-900 hover:bg-quran-emerald-950 text-white font-bold text-xs shadow-md transition"
                >
                  <Volume2 className="w-4 h-4 text-quran-gold-400" />
                  <span>Hear Sheikh Yasser Al-Dossary Recite Correctly</span>
                </button>

                {/* Hear Student's Voice */}
                {userRecordedAudioUrl && (
                  <button
                    onClick={playUserVoice}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-100 dark:bg-quran-dark-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-semibold text-xs transition"
                  >
                    <Play className="w-4 h-4 text-rose-500" />
                    <span>Hear How You Recited It</span>
                  </button>
                )}

                {/* Retry Ayah */}
                <button
                  onClick={() => {
                    setActiveAyahIndex(activeMistake.ayahNumber - 1);
                    setActiveMistake(null);
                    startTasmaRecitation();
                  }}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-sm transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry This Ayah</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* COMPLETION BANNER & SM-2 INTERVAL SCHEDULING             */}
          {/* ======================================================== */}
          {sessionCompleted && (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-quran-emerald-900 to-quran-emerald-950 text-white shadow-2xl text-center space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-quran-gold-500/20 text-quran-gold-400 flex items-center justify-center mx-auto border-2 border-quran-gold-500">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold">Masha'Allah! Surah Memorization Completed</h3>
                <p className="text-xs text-quran-parchment-200 mt-1">
                  You recited all {ayahs.length} Ayahs of Surah {SURAH_LIST[selectedSurahNumber - 1]?.nameEnglish} from memory!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 max-w-md mx-auto flex items-center justify-around text-center">
                <div>
                  <span className="text-[10px] uppercase text-quran-gold-400 font-bold block">Accuracy</span>
                  <span className="text-2xl font-bold">{completionPercentage}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-quran-gold-400 font-bold block">Mistakes</span>
                  <span className="text-2xl font-bold">{mistakeWordsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-quran-gold-400 font-bold block">Time</span>
                  <span className="text-2xl font-bold">{recordingSeconds}s</span>
                </div>
              </div>

              {/* SM-2 Recall Rating */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-quran-gold-300 block">
                  Rate your fluency to schedule next review in Spaced Repetition (SM-2):
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    { grade: 0, label: '0 • Forgot' },
                    { grade: 1, label: '1 • Hard' },
                    { grade: 2, label: '2 • Hesitant' },
                    { grade: 3, label: '3 • Good' },
                    { grade: 4, label: '4 • Strong' },
                    { grade: 5, label: '5 • Flawless' },
                  ].map((btn) => (
                    <button
                      key={btn.grade}
                      onClick={() => submitGrade(btn.grade)}
                      className="px-4 py-2 rounded-xl bg-white/15 hover:bg-quran-gold-500 hover:text-stone-950 font-bold text-xs transition"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: VISUAL OCCLUSION DRILLS                         */}
      {/* ======================================================== */}
      {selectedMode === 'partial_mask' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-spiritual text-center space-y-6">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">
            Visual Partial Masking • Ayah {currentAyah.ayahNumber}
          </div>

          <div
            dir="rtl"
            className="font-quran text-4xl sm:text-5xl lg:text-6xl text-stone-900 dark:text-stone-100 py-6 leading-[2.6] flex flex-wrap items-center justify-center gap-x-4 gap-y-3"
          >
            {currentAyah.words.map((word, idx) => {
              const isMasked = idx % 2 === 1;
              return (
                <span
                  key={word.position}
                  className={`px-3 py-1 rounded-2xl select-none transition ${
                    isMasked
                      ? 'bg-stone-200 dark:bg-stone-800 text-transparent hover:text-stone-500 cursor-pointer min-w-[70px] inline-block text-center'
                      : 'hover:text-quran-emerald-800 dark:hover:text-quran-gold-400'
                  }`}
                  title={isMasked ? "Hover to peek" : ""}
                >
                  {isMasked ? '•••••' : word.arabic}
                </span>
              );
            })}
            <span className="font-arabic text-2xl text-quran-gold-600 dark:text-quran-gold-400 px-2 select-none">
              ۝{currentAyah.ayahNumber}
            </span>
          </div>

          {/* Ayah Navigation */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setActiveAyahIndex(prev => Math.max(0, prev - 1))}
              disabled={activeAyahIndex === 0}
              className="p-2.5 rounded-xl bg-stone-100 dark:bg-quran-dark-800 disabled:opacity-40 text-stone-700 dark:text-stone-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-stone-500">
              Ayah {activeAyahIndex + 1} of {ayahs.length}
            </span>
            <button
              onClick={() => setActiveAyahIndex(prev => Math.min(ayahs.length - 1, prev + 1))}
              disabled={activeAyahIndex >= ayahs.length - 1}
              className="p-2.5 rounded-xl bg-stone-100 dark:bg-quran-dark-800 disabled:opacity-40 text-stone-700 dark:text-stone-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 3: AYAH TRANSITIONS                                 */}
      {/* ======================================================== */}
      {selectedMode === 'transition' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-spiritual space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
              Ayah-to-Ayah Transition Trainer
            </span>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-2">
              Recall the opening of the succeeding verse
            </h3>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-quran-emerald-50/60 dark:bg-quran-emerald-950/40 border border-quran-emerald-200 dark:border-quran-emerald-900/50 text-right">
              <span className="text-xs font-bold text-quran-emerald-800 dark:text-quran-gold-300 block mb-2 font-sans">
                Ayah {currentAyah.ayahNumber} (Ending):
              </span>
              <p dir="rtl" className="font-quran text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 leading-relaxed">
                {currentAyah.textUthmani} ۝{currentAyah.ayahNumber}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-stone-400 text-xs uppercase font-bold tracking-widest">
              <ArrowRight className="w-4 h-4 text-quran-gold-500 animate-pulse" />
              <span>Recall opening of next verse</span>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-right">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400 block mb-2 font-sans">
                Ayah {currentAyah.ayahNumber + 1} (Opening):
              </span>
              {nextAyah ? (
                <p dir="rtl" className="font-quran text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 leading-relaxed">
                  {nextAyah.textUthmani} ۝{nextAyah.ayahNumber}
                </p>
              ) : (
                <p className="text-xs text-stone-500 font-sans">End of Surah. Transition to opening of next Surah.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {reviewSuccessMessage && (
        <div className="p-4 rounded-2xl bg-quran-emerald-100 dark:bg-quran-emerald-950/80 text-quran-emerald-900 dark:text-quran-gold-300 text-xs font-semibold flex items-center justify-center gap-2 border border-quran-emerald-300 dark:border-quran-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-quran-emerald-600 dark:text-quran-gold-400" />
          <span>{reviewSuccessMessage}</span>
        </div>
      )}
    </div>
  );
};
