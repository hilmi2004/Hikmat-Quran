import { Ayah } from '../../types/quran';

export interface RecitedWordEvaluation {
  wordIndex: number;
  canonicalWord: string;
  recitedWord?: string;
  status: 'correct' | 'substituted' | 'skipped' | 'extra';
  confidence: number; // 0.0 - 1.0
  feedback?: string;
  tajweedRule?: string;
}

export interface RecitationDiagnosticReport {
  ayahId: string;
  surahNumber: number;
  ayahNumber: number;
  overallAccuracy: number; // 0 - 100 %
  wordEvaluations: RecitedWordEvaluation[];
  detectedMistakesCount: number;
  weakWords: string[];
  tajweedObservations: string[];
  speechConfidenceScore: number;
  isUncertain: boolean;
  userAudioUrl?: string; // Playback of the user's actual microphone recording
  qariAudioUrl?: string; // Reference recitation by selected Qari (e.g. Sheikh Yasser Al-Dossary)
  rawTranscript: string;
}

export interface IRecitationEngine {
  startListening(
    targetAyah: Ayah,
    onProgress: (
      currentWordIndex: number,
      currentTranscript: string,
      correctIndices?: number[],
      mistakeIndices?: number[]
    ) => void,
    onError: (err: string) => void,
    onAyahComplete?: (masteredAyah: Ayah) => void
  ): Promise<void>;
  
  stopListening(transcriptOverride?: string): Promise<RecitationDiagnosticReport>;
  
  setTargetAyah?(ayah: Ayah): void;

  isListening(): boolean;
}
