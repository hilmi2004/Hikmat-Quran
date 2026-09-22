import { Ayah, Reciter } from '../../types/quran';
import { RECITERS_LIST } from '../../data/quranDataset';

export type AudioPlaybackState = 'idle' | 'playing' | 'paused' | 'waiting_repeat' | 'user_turn';

export interface AudioListener {
  onStateChange?: (state: AudioPlaybackState) => void;
  onAyahChange?: (ayahId: string) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onRepeatProgress?: (currentRepeat: number, totalRepeats: number) => void;
}

export class AudioPlayerService {
  private audio: HTMLAudioElement;
  private currentReciter: Reciter = RECITERS_LIST[0];
  private currentAyah: Ayah | null = null;
  private playbackRate: number = 1.0;
  private repeatCountTarget: number = 1;
  private currentRepeatIndex: number = 1;
  private delayBetweenRepeatsMs: number = 1500;
  private state: AudioPlaybackState = 'idle';
  private listeners: AudioListener[] = [];
  private repeatTimeoutId: any = null;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';

    this.audio.addEventListener('play', () => this.setState('playing'));
    this.audio.addEventListener('pause', () => {
      if (this.state === 'playing') this.setState('paused');
    });
    this.audio.addEventListener('timeupdate', () => {
      this.notifyTimeUpdate(this.audio.currentTime, this.audio.duration || 0);
    });
    this.audio.addEventListener('ended', () => this.handleAudioEnded());
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public setReciter(reciter: Reciter) {
    this.currentReciter = reciter;
  }

  public getReciter(): Reciter {
    return this.currentReciter;
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    this.audio.playbackRate = rate;
  }

  public setRepeatTarget(repeats: number) {
    this.repeatCountTarget = Math.max(1, repeats);
  }

  public setDelayBetweenRepeats(ms: number) {
    this.delayBetweenRepeatsMs = ms;
  }

  public playAyah(ayah: Ayah, repeatTarget: number = 1) {
    if (this.repeatTimeoutId) {
      clearTimeout(this.repeatTimeoutId);
      this.repeatTimeoutId = null;
    }

    this.currentAyah = ayah;
    this.repeatCountTarget = repeatTarget;
    this.currentRepeatIndex = 1;

    // Resolve audio URL according to reciter standard
    // EveryAyah URL pattern: [BaseUrl]/[Surah (3 digits)][Ayah (3 digits)].mp3
    const surahPadded = String(ayah.surahNumber).padStart(3, '0');
    const ayahPadded = String(ayah.ayahNumber).padStart(3, '0');
    const streamUrl = `${this.currentReciter.baseUrl}${surahPadded}${ayahPadded}.mp3`;

    this.audio.src = streamUrl;
    this.audio.playbackRate = this.playbackRate;
    this.audio.play().catch(e => console.warn('[AudioPlayer] Playback failed or aborted:', e));

    this.listeners.forEach(l => {
      l.onAyahChange?.(ayah.id);
      l.onRepeatProgress?.(this.currentRepeatIndex, this.repeatCountTarget);
    });
  }

  public togglePlayPause() {
    if (this.audio.paused) {
      this.audio.play().catch(e => console.warn(e));
    } else {
      this.audio.pause();
    }
  }

  public pause() {
    this.audio.pause();
  }

  public stop() {
    if (this.repeatTimeoutId) {
      clearTimeout(this.repeatTimeoutId);
      this.repeatTimeoutId = null;
    }
    this.audio.pause();
    this.audio.currentTime = 0;
    this.setState('idle');
  }

  private handleAudioEnded() {
    if (this.currentRepeatIndex < this.repeatCountTarget) {
      this.currentRepeatIndex++;
      this.setState('waiting_repeat');
      this.listeners.forEach(l => l.onRepeatProgress?.(this.currentRepeatIndex, this.repeatCountTarget));

      this.repeatTimeoutId = setTimeout(() => {
        this.audio.currentTime = 0;
        this.audio.play().catch(e => console.warn(e));
      }, this.delayBetweenRepeatsMs);
    } else {
      this.setState('idle');
    }
  }

  private setState(state: AudioPlaybackState) {
    this.state = state;
    this.listeners.forEach(l => l.onStateChange?.(state));
  }

  private notifyTimeUpdate(current: number, total: number) {
    this.listeners.forEach(l => l.onTimeUpdate?.(current, total));
  }

  public getState(): AudioPlaybackState {
    return this.state;
  }

  public getCurrentAyah(): Ayah | null {
    return this.currentAyah;
  }
}

export const audioPlayerService = new AudioPlayerService();
