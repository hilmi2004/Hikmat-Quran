import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { TajweedVoiceTestItem, TajweedVoiceEvaluationResult } from '../../types/quran';
import { TAJWEED_VOICE_TEST_ITEMS } from '../../data/tajweedVoiceDataset';
import { tajweedVoiceService } from '../../services/ai/TajweedVoiceService';
import { isIOSNonSafari } from '../../utils/mobileSpeechHelper';

interface TajweedVoiceStudioProps {
  initialItemId?: string;
  onClose?: () => void;
}

export const TajweedVoiceStudio: React.FC<TajweedVoiceStudioProps> = ({
  initialItemId,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<TajweedVoiceTestItem>(
    TAJWEED_VOICE_TEST_ITEMS.find(i => i.id === initialItemId) || TAJWEED_VOICE_TEST_ITEMS[0]
  );

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);
  const [speechDialect, setSpeechDialect] = useState<string>('ar-SA');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [evaluationResult, setEvaluationResult] = useState<TajweedVoiceEvaluationResult | null>(null);

  // Audio Playback states
  const [isPlayingQari, setIsPlayingQari] = useState<boolean>(false);
  const [isPlayingUserVoice, setIsPlayingUserVoice] = useState<boolean>(false);

  const qariAudioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<any>(null);

  // Update selected item if initialItemId changes
  useEffect(() => {
    if (initialItemId) {
      const found = TAJWEED_VOICE_TEST_ITEMS.find(i => i.id === initialItemId);
      if (found) {
        setSelectedItem(found);
        setEvaluationResult(null);
        setLiveTranscript('');
      }
    }
  }, [initialItemId]);

  // Clean up audio & volume meter on unmount
  useEffect(() => {
    return () => {
      cleanupVolumeMeter();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (qariAudioRef.current) qariAudioRef.current.pause();
      if (userAudioRef.current) userAudioRef.current.pause();
    };
  }, []);

  const setupVolumeMeter = async (existingStream?: MediaStream) => {
    try {
      const stream = existingStream || tajweedVoiceService.getMediaStream() || await navigator.mediaDevices.getUserMedia({
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

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolumeLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn('[TajweedVoiceStudio] Volume meter could not be started:', e);
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

  // Start voice recording (Synchronously hooks Safari user gesture)
  const handleStartRecording = async () => {
    setEvaluationResult(null);
    setErrorMessage(null);
    setLiveTranscript('');
    setRecordingSeconds(0);

    if (qariAudioRef.current) qariAudioRef.current.pause();
    setIsPlayingQari(false);

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);

    try {
      tajweedVoiceService.setDialect(speechDialect);
      // Start test synchronously to capture Safari user activation
      const startTask = tajweedVoiceService.startTest(
        selectedItem,
        (transcript) => setLiveTranscript(transcript),
        (err) => setErrorMessage(err)
      );
      setIsRecording(true);
      await startTask;
      setupVolumeMeter(tajweedVoiceService.getMediaStream() || undefined);
    } catch (e: any) {
      clearInterval(timerIntervalRef.current);
      cleanupVolumeMeter();
      setErrorMessage(e.message || 'Microphone access failed.');
    }
  };

  // Stop recording & evaluate
  const handleStopRecording = async () => {
    clearInterval(timerIntervalRef.current);
    cleanupVolumeMeter();
    setIsRecording(false);

    try {
      const result = await tajweedVoiceService.stopTest();
      setEvaluationResult(result);
    } catch (e: any) {
      setErrorMessage(e.message || 'Error evaluating Tajweed audio.');
    }
  };

  // Play reference Qari audio (Sheikh Yasser Al-Dossary)
  const toggleQariAudio = () => {
    if (!selectedItem.audioAyahUrl) return;

    if (isPlayingQari && qariAudioRef.current) {
      qariAudioRef.current.pause();
      setIsPlayingQari(false);
      return;
    }

    if (userAudioRef.current) {
      userAudioRef.current.pause();
      setIsPlayingUserVoice(false);
    }

    if (!qariAudioRef.current) {
      qariAudioRef.current = new Audio(selectedItem.audioAyahUrl);
    } else {
      qariAudioRef.current.src = selectedItem.audioAyahUrl;
    }

    qariAudioRef.current.play().then(() => setIsPlayingQari(true)).catch(e => console.warn(e));
    qariAudioRef.current.onended = () => setIsPlayingQari(false);
  };

  // Play student's recorded voice
  const toggleUserVoice = () => {
    if (!evaluationResult?.userAudioUrl) return;

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
      userAudioRef.current = new Audio(evaluationResult.userAudioUrl);
    } else {
      userAudioRef.current.src = evaluationResult.userAudioUrl;
    }

    userAudioRef.current.play().then(() => setIsPlayingUserVoice(true)).catch(e => console.warn(e));
    userAudioRef.current.onended = () => setIsPlayingUserVoice(false);
  };

  // Filter items by category
  const categories = [
    { id: 'all', label: 'All Tajweed Drills' },
    { id: 'makharij_contrast', label: 'Makharij Contrasts (ق/ك, ص/س...)' },
    { id: 'qalqalah', label: 'Qalqalah (Echo / Bounce)' },
    { id: 'ghunnah', label: 'Ghunnah (Nasalization)' },
    { id: 'noon_sakinah', label: 'Noon Sakinah & Tanween' },
    { id: 'madd', label: 'Madd (Elongation)' },
    { id: 'tafkhim', label: 'Tafkhim & Tarqeeq' }
  ];

  const filteredItems = selectedCategory === 'all'
    ? TAJWEED_VOICE_TEST_ITEMS
    : TAJWEED_VOICE_TEST_ITEMS.filter(i => i.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Mobile Notice for iOS third-party browsers */}
      {isIOSNonSafari() && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">iPhone / iPad Browser Notice:</p>
            <p className="leading-relaxed text-stone-700 dark:text-stone-300">
              Apple restricts live Speech Recognition to Safari. For real-time Tajweed voice scoring on iOS, please open this app in Safari!
            </p>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-quran-emerald-900 text-white dark:bg-quran-gold-500 dark:text-stone-950 shadow-sm'
                : 'bg-stone-100 dark:bg-quran-dark-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Studio Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Practice Drill Navigator */}
        <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block px-1 mb-2">
            Available Tajweed Voice Tests ({filteredItems.length})
          </span>
          {filteredItems.map(item => {
            const isSelected = item.id === selectedItem.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setEvaluationResult(null);
                  setLiveTranscript('');
                  if (qariAudioRef.current) qariAudioRef.current.pause();
                  if (userAudioRef.current) userAudioRef.current.pause();
                  setIsPlayingQari(false);
                  setIsPlayingUserVoice(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-quran-dark-900 border-quran-gold-500 shadow-sm ring-2 ring-quran-gold-500/20'
                    : 'bg-stone-50 dark:bg-quran-dark-950/60 border-stone-200 dark:border-quran-dark-800 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-quran-emerald-100 dark:bg-quran-emerald-950 text-quran-emerald-800 dark:text-quran-gold-400">
                      {item.category.replace('_', ' ')}
                    </span>
                    {item.surahAyahRef && (
                      <span className="text-[10px] text-stone-400 font-sans">
                        {item.surahAyahRef}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{item.title}</p>
                  <p className="font-arabic text-sm text-quran-emerald-900 dark:text-quran-gold-400 font-bold">{item.targetArabic}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            );
          })}
        </div>

        {/* Right 2 Columns: Live Testing Arena */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 shadow-spiritual text-center relative overflow-hidden space-y-6">
            {/* Live Recording Top Banner with Volume Visualizer */}
            {isRecording && (
              <div className="absolute top-0 left-0 right-0 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-md animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                  <span>Tajweed Voice Assessment Active ({recordingSeconds}s) — Recite clearly</span>
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

            {/* Drill Metadata & Dialect */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-quran-gold-500/20 text-quran-gold-700 dark:text-quran-gold-300">
                {selectedItem.title}
              </span>

              {/* Acoustic Dialect Selector */}
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-semibold text-stone-400">Mic Model:</label>
                <select
                  value={speechDialect}
                  onChange={(e) => {
                    setSpeechDialect(e.target.value);
                    tajweedVoiceService.setDialect(e.target.value);
                  }}
                  className="px-2 py-1 rounded-xl bg-stone-100 dark:bg-quran-dark-950 border border-stone-200 dark:border-quran-dark-800 text-[11px] font-bold text-stone-800 dark:text-stone-200"
                >
                  <option value="ar-SA">🇸🇦 Saudi / Classical (ar-SA)</option>
                  <option value="ar-EG">🇪🇬 Egyptian Recitation (ar-EG)</option>
                  <option value="ar-AE">🇦🇪 Gulf Standard (ar-AE)</option>
                </select>
              </div>
            </div>

            {/* Target Arabic Text Canvas with Target Highlight */}
            <div className="py-4 space-y-2">
              <div
                dir="rtl"
                className="font-quran text-4xl sm:text-5xl text-stone-900 dark:text-stone-100 leading-relaxed font-bold select-none"
              >
                {selectedItem.targetArabic}
              </div>
              <p className="text-sm font-sans text-stone-500 font-medium">
                "{selectedItem.transliteration}"
              </p>
              {selectedItem.surahAyahRef && (
                <span className="text-xs font-bold text-quran-gold-600 dark:text-quran-gold-400">
                  Surah {selectedItem.surahAyahRef}
                </span>
              )}
            </div>

            {/* Coaching Instruction Pill */}
            <div className="p-4 rounded-2xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                <Info className="w-3.5 h-3.5 text-quran-gold-600" />
                <span>Anatomical Guidance:</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {selectedItem.coachingInstruction}
              </p>
            </div>

            {/* Live Detected Speech Stream */}
            {liveTranscript && (
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-quran-dark-950 text-xs text-stone-700 dark:text-stone-300 font-arabic text-right border border-stone-200 dark:border-quran-dark-800">
                <span className="text-[10px] text-stone-400 font-sans block text-left mb-1">Live Detected Speech:</span>
                {liveTranscript}
              </div>
            )}

            {/* Interactive Recording & Audio Control Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-quran-emerald-900 hover:bg-quran-emerald-950 text-white font-bold text-sm shadow-spiritual transition transform hover:-translate-y-0.5 active:scale-95 border border-quran-gold-500/30"
                >
                  <Mic className="w-4 h-4 text-quran-gold-400" />
                  <span>Start Tajweed Voice Test</span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg transition animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop & Evaluate Tajweed</span>
                </button>
              )}

              {/* Hear Sheikh Yasser Al-Dossary Reference */}
              {selectedItem.audioAyahUrl && (
                <button
                  onClick={toggleQariAudio}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-stone-50 dark:bg-quran-dark-950 hover:bg-stone-100 dark:hover:bg-quran-dark-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-quran-dark-800 font-semibold text-xs transition"
                >
                  {isPlayingQari ? (
                    <>
                      <Pause className="w-4 h-4 text-quran-gold-500" />
                      <span>Pause Sheikh Yasser Al-Dossary</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-quran-gold-500" />
                      <span>Hear Sheikh Yasser Al-Dossary</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* AI Tajweed Diagnostic Result Card */}
          {evaluationResult && (
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-spiritual space-y-6 animate-in fade-in ${
              evaluationResult.passed
                ? 'bg-white dark:bg-quran-dark-900 border-quran-emerald-300 dark:border-quran-emerald-800'
                : 'bg-white dark:bg-quran-dark-900 border-amber-300 dark:border-amber-800'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 dark:border-quran-dark-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    evaluationResult.passed
                      ? 'bg-quran-emerald-100 dark:bg-quran-emerald-950 text-quran-emerald-800 dark:text-quran-gold-400'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}>
                    {evaluationResult.accuracy}%
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                      {evaluationResult.feedbackTitle}
                    </h4>
                    <span className="text-xs text-stone-500 capitalize">
                      Evaluation Status: {evaluationResult.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Score badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  evaluationResult.passed
                    ? 'bg-quran-emerald-100 dark:bg-quran-emerald-900 text-quran-emerald-800 dark:text-quran-emerald-200'
                    : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                }`}>
                  {evaluationResult.passed ? '✓ Rule Mastered' : '⚠️ Practice Needed'}
                </span>
              </div>

              {/* Detailed Feedback & Anatomical Tip */}
              <div className="space-y-3 text-sm leading-relaxed text-stone-700 dark:text-stone-300 text-left">
                <p>{evaluationResult.detailedFeedback}</p>
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-quran-dark-950 border border-stone-200 dark:border-quran-dark-800">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block mb-1">
                    Anatomical Tip:
                  </span>
                  <p className="text-xs text-stone-600 dark:text-stone-400">{evaluationResult.anatomicalTip}</p>
                </div>
              </div>

              {/* Side-by-Side Dual Audio Replay */}
              <div className="p-4 rounded-2xl bg-quran-parchment-50 dark:bg-quran-dark-950 border border-quran-parchment-200 dark:border-quran-dark-800 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Auditory Contrast Check:
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  {/* User voice playback */}
                  {evaluationResult.userAudioUrl && (
                    <button
                      onClick={toggleUserVoice}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-quran-dark-900 hover:bg-stone-50 dark:hover:bg-quran-dark-800 text-xs font-semibold text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 shadow-sm transition"
                    >
                      {isPlayingUserVoice ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-rose-500" />
                          <span>Pause Your Voice</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-rose-500" />
                          <span>Hear How You Recited</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Sheikh Yasser Al-Dossary reference playback */}
                  {selectedItem.audioAyahUrl && (
                    <button
                      onClick={toggleQariAudio}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-quran-emerald-900 hover:bg-quran-emerald-950 text-white text-xs font-semibold shadow-sm transition"
                    >
                      {isPlayingQari ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-quran-gold-400" />
                          <span>Pause Qari</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-quran-gold-400" />
                          <span>Hear Sheikh Yasser Al-Dossary</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Retry button */}
                  <button
                    onClick={handleStartRecording}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-quran-dark-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
