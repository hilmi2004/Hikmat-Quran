/**
 * Helper utility for cross-platform SpeechRecognition and Audio handling,
 * specifically addressing mobile Safari (iOS), Android Chrome, and WKWebView constraints.
 */

export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1)
  );
};

export const isIOSDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
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

export const getSpeechPlatformNotice = (): { type: 'warning' | 'info' | null; message: string } => {
  if (!isNativeSpeechSupported()) {
    if (isIOSDevice()) {
      return {
        type: 'warning',
        message: 'On iPhone and iPad, Apple only permits live speech recognition inside Safari. Please open Hikmat Quran in Safari for live auto-detection.'
      };
    }
    return {
      type: 'warning',
      message: 'Your current mobile browser does not support Web Speech API. Audio is recorded for playback; you can verify recited verses manually.'
    };
  }

  if (isIOSDevice()) {
    return {
      type: 'info',
      message: 'iOS Safari Recitation Active: Ensure "Enable Dictation" is turned on in iOS Settings > General > Keyboard for accurate Arabic recognition.'
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
