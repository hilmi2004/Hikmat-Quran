/**
 * Helper utility for cross-platform SpeechRecognition and Audio handling,
 * specifically addressing mobile Safari (iOS), Android Chrome, and WKWebView constraints.
 */

export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isIPad = (navigator.platform === 'MacIntel' || /Macintosh/i.test(ua)) && (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);
  return isMobileUA || isIPad;
};

export const isIOSDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

export const isAndroidDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
};

/**
 * Checks if the user is on iOS in a third-party browser (Chrome, Firefox, Brave, in-app)
 * where Apple disables the Web Speech API inside WKWebView.
 */
export const isIOSNonSafari = (): boolean => {
  if (!isIOSDevice()) return false;
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // Chrome on iOS contains 'CriOS', Firefox contains 'FxiOS', Edge contains 'EdgiOS'
  const isChromeIOS = /CriOS/i.test(ua);
  const isFirefoxIOS = /FxiOS/i.test(ua);
  const isEdgeIOS = /EdgiOS/i.test(ua);
  const isBraveIOS = /Brave/i.test(ua);
  const isInApp = /FBAN|FBAV|Instagram|Line|Twitter|Telegram/i.test(ua);
  return isChromeIOS || isFirefoxIOS || isEdgeIOS || isBraveIOS || isInApp;
};

export const isNativeSpeechSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
};

export const isSpeechRecognitionReliableOnDevice = (): boolean => {
  if (!isNativeSpeechSupported()) return false;
  // iOS third-party browsers have null/broken speech recognition
  if (isIOSNonSafari()) return false;
  return true;
};

export const getSpeechPlatformNotice = (): { type: 'warning' | 'info' | null; message: string } => {
  if (!isNativeSpeechSupported()) {
    if (isIOSDevice()) {
      return {
        type: 'warning',
        message: 'On iPhone and iPad, Apple permits live speech recognition exclusively in Safari. In other mobile browsers, Studio Audio Evaluation is automatically used.'
      };
    }
    return {
      type: 'warning',
      message: 'Your current mobile browser uses Studio Audio Evaluation for recitation analysis.'
    };
  }

  if (isIOSDevice()) {
    return {
      type: 'info',
      message: 'iOS Safari Recitation Active: Ensure "Enable Dictation" is turned on in iOS Settings > General > Keyboard for live Arabic speech recognition.'
    };
  }

  return { type: null, message: '' };
};

export const getSupportedAudioMimeType = (): string => {
  if (typeof MediaRecorder === 'undefined') return '';
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
    'audio/wav'
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
};

export interface AcousticAudioMetrics {
  durationSeconds: number;
  hasVoiceEnergy: boolean;
  peakRms: number;
  averageRms: number;
}

/**
 * Analyzes an audio blob to measure voice energy, volume, and speech duration.
 * Provides client-side fallback validation when Web Speech API is blocked or returns empty.
 */
export async function analyzeAudioBlob(blob: Blob): Promise<AcousticAudioMetrics> {
  const fallbackDuration = Math.max(1, blob.size / 16000); // Rough estimation if decode fails

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) {
      return {
        durationSeconds: fallbackDuration,
        hasVoiceEnergy: blob.size > 2048,
        peakRms: 0.1,
        averageRms: 0.05
      };
    }

    const ctx = new AudioCtx();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const durationSeconds = audioBuffer.duration;

    // Calculate RMS energy across 50ms windows
    const windowSize = Math.floor(sampleRate * 0.05);
    let totalRms = 0;
    let peakRms = 0;
    let voicedWindows = 0;
    const totalWindows = Math.floor(channelData.length / windowSize);

    for (let i = 0; i < totalWindows; i++) {
      let sumSq = 0;
      const offset = i * windowSize;
      for (let j = 0; j < windowSize; j++) {
        const val = channelData[offset + j];
        sumSq += val * val;
      }
      const rms = Math.sqrt(sumSq / windowSize);
      totalRms += rms;
      if (rms > peakRms) peakRms = rms;
      if (rms > 0.015) voicedWindows++; // Voice threshold above room silence
    }

    const averageRms = totalWindows > 0 ? totalRms / totalWindows : 0;
    const hasVoiceEnergy = voicedWindows >= 4 && peakRms > 0.02;

    await ctx.close().catch(() => {});

    return {
      durationSeconds,
      hasVoiceEnergy,
      peakRms,
      averageRms
    };
  } catch (err) {
    // If browser cannot decode specific container (e.g. webm on old iOS Safari), fallback safely
    return {
      durationSeconds: fallbackDuration,
      hasVoiceEnergy: blob.size > 2048,
      peakRms: 0.1,
      averageRms: 0.05
    };
  }
}

