import { Ayah } from '../../types/quran';
import { IRecitationEngine, RecitationDiagnosticReport, RecitedWordEvaluation } from './RecitationEngine';
import { isMobileDevice, isIOSDevice, getSupportedAudioMimeType } from '../../utils/mobileSpeechHelper';

/**
 * Advanced Quranic Phonetic Normalization.
 * Standardizes Quranic orthography to match acoustic speech recognition:
 * - Unifies all forms of Alif & Hamza (أ, إ, آ, ٱ, ء, ؤ, ئ -> ا)
 * - Converts dagger alif (ٰ) to standard vowel space
 * - Removes diacritics, sukoon, shaddah, tanween, waslah, and decorative glyphs
 * - Converts Ta Marbutah (ة) to Haa (ه)
 * - Converts Alif Maqsura (ى) to Yaa (ي)
 * - Handles Lam Shamsiyyah and elisions
 */
export function normalizeQuranicPhonetics(text: string): string {
  if (!text) return '';
  return text
    // Expand Uthmani waw/ya with dagger alif (e.g., صلوٰة -> صلاة, زكوٰة -> زكاة)
    .replace(/[\u0648\u0649]\u0670/g, 'ا')
    // Expand standalone dagger alif to full alif (e.g., مَٰلِكِ -> مالك, ٱلْعَٰلَمِينَ -> العالمين, ٱلصِّرَٰطَ -> الصراط)
    .replace(/\u0670/g, 'ا')
    // Remove all harakat, sukoon, shaddah, tanween, and Quranic recitation glyphs
    .replace(/[\u064B-\u065F\u06D6-\u06ED]/g, '')
    // Normalize all alif & hamza variants (أ, إ, آ, ٱ, ء, ؤ, ئ -> ا)
    .replace(/[أإآٱءؤئ]/g, 'ا')
    // Normalize taa marbutah to haa
    .replace(/ة/g, 'ه')
    // Normalize alif maqsura to yaa
    .replace(/ى/g, 'ي')
    // Standardize Quranic rasm words where speech engines transcribe modern standard spelling
    .replace(/الرحمان/g, 'الرحمن')
    .replace(/هاذا/g, 'هذا')
    .replace(/ذالك/g, 'ذلك')
    .replace(/لاكن/g, 'لكن')
    .replace(/الاه/g, 'اله')
    .replace(/السموات/g, 'السماوات')
    .replace(/باسم/g, 'بسم')
    // Remove tatweel & punctuation
    .replace(/[ـ.,\/#!$%\^&\*;:{}=\-_`~()؟«»""'']/g, '')
    .trim();
}

export function normalizeArabicText(text: string): string {
  return normalizeQuranicPhonetics(text);
}

/**
 * Consolidates standalone single-letter Arabic prefixes (و, ف, ب, ل, ك, أ, ال)
 * which speech recognizers often split from the succeeding word.
 * E.g. ["و", "إياك"] -> ["وإياك"]
/**
 * Consolidates standalone single-letter Arabic prefixes (و, ف, ب, ل, ك, أ, ال)
 * and compound vocatives (يا + ايها -> ياايها) which speech recognizers often split.
 */
export function consolidateArabicPrefixes(tokens: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim();
    if (!token) continue;

    // Handle "يا" + "ايها" -> "ياايها" (unifying with Uthmani "يَٰأَيُّهَا")
    if (
      (token === 'يا' || token === 'يأ') &&
      i + 1 < tokens.length &&
      (tokens[i + 1].startsWith('ايها') || tokens[i + 1].startsWith('أيها') || tokens[i + 1].startsWith('ايتها') || tokens[i + 1].startsWith('أيتها'))
    ) {
      result.push('يا' + tokens[i + 1].trim());
      i++;
      continue;
    }

    // Handle "و" + "لا" -> "ولا"
    if (token === 'و' && i + 1 < tokens.length && tokens[i + 1] === 'لا') {
      result.push('ولا');
      i++;
      continue;
    }

    // Split "والضالين" or "ولاالضالين" into "ولا" + "الضالين"
    if (token === 'والضالين' || token === 'ولاالضالين') {
      result.push('ولا');
      result.push('الضالين');
      continue;
    }

    // If token is a single connective letter or prefix and there is a next token
    if (['و', 'ف', 'ب', 'ل', 'ك', 'أ', 'ال'].includes(token) && i + 1 < tokens.length) {
      result.push(token + tokens[i + 1].trim());
      i++; // skip next token as it's merged
    } else {
      result.push(token);
    }
  }
  return result;
}

/**
 * Determines whether a spoken token is phonetically equivalent to a canonical Quranic word,
 * accounting for classical Tajweed pronunciation, Uthmani orthography, Waslah/Shamsiyyah elisions,
 * tanween variations, and speech recognition transcription characteristics.
 */
export function areQuranicWordsPhoneticallyEquivalent(
  canonicalWord: string,
  spokenToken: string,
  isStrict: boolean = false
): boolean {
  if (!canonicalWord || !spokenToken) return false;

  const normCan = normalizeQuranicPhonetics(canonicalWord);
  const normSpk = normalizeQuranicPhonetics(spokenToken);

  // 1. Direct normalized match
  if (normCan === normSpk) return true;

  // In strict mode, exact normalized match is required
  if (isStrict) return false;

  // 2. Waslah / Lam Shamsiyyah prefix equivalence:
  // In recitation: "الصراط" <=> "صراط", "الرحمن" <=> "رحمن", "الناس" <=> "ناس"
  if (normCan.startsWith('ال') && normCan.slice(2) === normSpk) return true;
  if (normSpk.startsWith('ال') && normSpk.slice(2) === normCan) return true;

  // 3. Conjunction & Preposition attachment tolerance (و, ف, ب, ل, ك):
  for (const prefix of ['و', 'ف', 'ب', 'ل', 'ك']) {
    if (normCan.startsWith(prefix) && normCan.slice(prefix.length) === normSpk) return true;
    if (normSpk.startsWith(prefix) && normSpk.slice(prefix.length) === normCan) return true;
  }

  // 4. Tanween nunation tolerance at word end:
  // "احد" <=> "احدا" <=> "احدن", "كفوا" <=> "كفو"
  const stripNunation = (s: string) => s.replace(/[ان]$/, '');
  if (stripNunation(normCan) === stripNunation(normSpk)) return true;

  // 5. Quranic rasm dagger-alif & elongation equivalence:
  // e.g. "مالك" <=> "ملك", "هاذا" <=> "هذا", "الرحمان" <=> "الرحمن", "داود" <=> "داوود"
  const stripLongVowels = (s: string) => s.replace(/[اوي]/g, '');
  const canBase = stripLongVowels(normCan);
  const spkBase = stripLongVowels(normSpk);
  if (canBase === spkBase && canBase.length >= 3) {
    return true;
  }

  // 6. Terminal Hamza elision:
  // "كفوا" <=> "كفؤ", "شيء" <=> "شي", "سوء" <=> "سو"
  const stripTerminalHamza = (s: string) => s.replace(/[ءا]$/, '');
  if (stripTerminalHamza(normCan) === stripTerminalHamza(normSpk) && normCan.length >= 3) {
    return true;
  }

  // 7. Minor 1-character variance on long words in balanced mode:
  // (e.g. "المستقيم" length 8 vs "المستقين" dist 1)
  if (!isStrict) {
    const dist = levenshteinDistance(normCan, normSpk);
    if (dist === 1 && normCan.length >= 6) {
      return true;
    }
  }

  return false;
}

export interface InvocationExtractionResult {
  hasInvocation: boolean;
  invocationType?: 'basmalah' | 'istiadhah' | 'both';
  invocationTokens: string[];
  verseTokens: string[];
}

/**
 * Checks if a token sequence starting at startIndex matches the opening Basmalah ("بسم الله الرحمن الرحيم").
 */
export function isBasmalahTokenSequence(tokens: string[], startIndex: number = 0): { isMatch: boolean; length: number } {
  if (startIndex >= tokens.length) return { isMatch: false, length: 0 };

  const norm = (s: string) => normalizeQuranicPhonetics(s);
  const t0 = norm(tokens[startIndex]);
  // Must begin with "بسم" or "باسم"
  if (t0 !== 'بسم' && t0 !== 'باسم' && !t0.startsWith('بسم') && !t0.startsWith('باسم')) {
    return { isMatch: false, length: 0 };
  }

  let matched = 1;
  let len = 1;

  // Check 2nd word: "الله" or "لله"
  if (startIndex + 1 < tokens.length) {
    const t1 = norm(tokens[startIndex + 1]);
    if (t1 === 'الله' || t1 === 'لله') {
      matched++;
      len = 2;

      // Check 3rd word: "الرحمن" or "رحمن" or "الرحمان"
      if (startIndex + 2 < tokens.length) {
        const t2 = norm(tokens[startIndex + 2]);
        if (t2 === 'الرحمن' || t2 === 'رحمن' || t2 === 'الرحمان' || t2 === 'رحمان') {
          matched++;
          len = 3;

          // Check 4th word: "الرحيم" or "رحيم"
          if (startIndex + 3 < tokens.length) {
            const t3 = norm(tokens[startIndex + 3]);
            if (t3 === 'الرحيم' || t3 === 'رحيم') {
              matched++;
              len = 4;
            }
          }
        }
      }
    }
  }

  // At least "بسم الله" (2 tokens) or up to full Basmalah (4 tokens)
  if (matched >= 2) {
    return { isMatch: true, length: len };
  }

  return { isMatch: false, length: 0 };
}

/**
 * Checks if a token sequence starting at startIndex matches the Isti'adhah ("أعوذ بالله من الشيطان الرجيم").
 */
export function isIstiadhahTokenSequence(tokens: string[], startIndex: number = 0): { isMatch: boolean; length: number } {
  if (startIndex >= tokens.length) return { isMatch: false, length: 0 };

  const norm = (s: string) => normalizeQuranicPhonetics(s);
  const t0 = norm(tokens[startIndex]);
  if (t0 !== 'اعوذ' && t0 !== 'عوذ') {
    return { isMatch: false, length: 0 };
  }

  let matched = 1;
  let len = 1;

  // Lookahead for: بالله / من / الشيطان / الرجيم
  if (startIndex + 1 < tokens.length) {
    const t1 = norm(tokens[startIndex + 1]);
    if (t1 === 'بالله' || t1 === 'لله' || t1 === 'الله') {
      matched++;
      len = 2;

      if (startIndex + 2 < tokens.length) {
        const t2 = norm(tokens[startIndex + 2]);
        if (t2 === 'من') {
          matched++;
          len = 3;

          if (startIndex + 3 < tokens.length) {
            const t3 = norm(tokens[startIndex + 3]);
            if (t3 === 'الشيطان' || t3 === 'شيطان') {
              matched++;
              len = 4;

              if (startIndex + 4 < tokens.length) {
                const t4 = norm(tokens[startIndex + 4]);
                if (t4 === 'الرجيم' || t4 === 'رجيم') {
                  matched++;
                  len = 5;
                }
              }
            }
          }
        }
      }
    }
  }

  if (matched >= 2) {
    return { isMatch: true, length: len };
  }

  return { isMatch: false, length: 0 };
}

/**
 * Detects and separates introductory Isti'adhah ("أعوذ بالله من الشيطان الرجيم")
 * and/or Basmalah ("بسم الله الرحمن الرحيم") from spoken tokens.
 *
 * This prevents the words of the opening invocation (such as "الرحمن" in the Basmalah)
 * from being falsely matched as the text of the first verse of Surahs like Surah Ar-Rahman (55:1),
 * Surah Al-Ikhlas (112:1), Surah An-Nas (114:1), etc.
 */
export function extractIntroductoryInvocation(
  tokens: string[],
  isBasmalahPartOfVerse: boolean = false
): InvocationExtractionResult {
  if (isBasmalahPartOfVerse || !tokens || tokens.length === 0) {
    return {
      hasInvocation: false,
      invocationTokens: [],
      verseTokens: tokens
    };
  }

  let offset = 0;
  const invocationTokens: string[] = [];
  let hasIstiadhah = false;
  let hasBasmalah = false;

  // 1. Check for Isti'adhah at start
  const istiadhahCheck = isIstiadhahTokenSequence(tokens, offset);
  if (istiadhahCheck.isMatch) {
    hasIstiadhah = true;
    for (let i = 0; i < istiadhahCheck.length; i++) {
      invocationTokens.push(tokens[offset + i]);
    }
    offset += istiadhahCheck.length;
  }

  // 2. Check for Basmalah (either at start or after Isti'adhah)
  const basmalahCheck = isBasmalahTokenSequence(tokens, offset);
  if (basmalahCheck.isMatch) {
    hasBasmalah = true;
    for (let i = 0; i < basmalahCheck.length; i++) {
      invocationTokens.push(tokens[offset + i]);
    }
    offset += basmalahCheck.length;
  }

  const hasInvocation = hasIstiadhah || hasBasmalah;
  return {
    hasInvocation,
    invocationType: hasIstiadhah && hasBasmalah ? 'both' : hasBasmalah ? 'basmalah' : hasIstiadhah ? 'istiadhah' : undefined,
    invocationTokens,
    verseTokens: tokens.slice(offset)
  };
}

/**
 * Computes Levenshtein distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Finds the minimum edit distance of candidate string against any sliding window of fullVerse.
 * Enables accurate multi-alternative hypothesis rescoring regardless of recitation position.
 */
export function bestWindowDistance(fullVerse: string, candidate: string): number {
  if (!fullVerse || !candidate) return 999;
  const cLen = candidate.length;
  if (fullVerse.length <= cLen) {
    return levenshteinDistance(fullVerse, candidate);
  }
  let minD = 999;
  const maxStart = fullVerse.length - cLen;
  for (let start = 0; start <= maxStart; start++) {
    const sub = fullVerse.substring(start, start + cLen);
    const d = levenshteinDistance(sub, candidate);
    if (d < minD) minD = d;
    if (minD === 0) break;
  }
  return minD;
}

export interface AlignmentPair {
  canonicalIndex: number;
  canonicalWord: string;
  spokenToken?: string;
  distance: number;
  status: 'correct' | 'substituted' | 'skipped';
}

/**
 * Needleman-Wunsch Global Sequence Alignment for Quranic recitation words.
 * Resolves token insertions, deletions, and substitutions with optimal global score.
 */
export function alignQuranicWordSequences(
  canonicalWords: string[],
  spokenTokens: string[],
  isStrict: boolean = false
): AlignmentPair[] {
  const n = canonicalWords.length;
  const m = spokenTokens.length;

  const MATCH_SCORE = 3;
  const MISMATCH_PENALTY = -2;
  const GAP_PENALTY = -2;

  // Initialize DP table
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i * GAP_PENALTY;
  for (let j = 0; j <= m; j++) dp[0][j] = j * GAP_PENALTY;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const isMatch = areQuranicWordsPhoneticallyEquivalent(
        canonicalWords[i - 1],
        spokenTokens[j - 1],
        isStrict
      );

      const score = isMatch ? MATCH_SCORE : MISMATCH_PENALTY;

      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + score,   // match/mismatch
        dp[i - 1][j] + GAP_PENALTY, // canonical deletion (skipped in speech)
        dp[i][j - 1] + GAP_PENALTY  // spoken insertion (extra word)
      );
    }
  }

  // Traceback
  let i = n;
  let j = m;
  const pairs: AlignmentPair[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const isMatch = areQuranicWordsPhoneticallyEquivalent(
        canonicalWords[i - 1],
        spokenTokens[j - 1],
        isStrict
      );
      const score = isMatch ? MATCH_SCORE : MISMATCH_PENALTY;

      const normCan = normalizeQuranicPhonetics(canonicalWords[i - 1]);
      const normSpk = normalizeQuranicPhonetics(spokenTokens[j - 1]);
      const dist = levenshteinDistance(normCan, normSpk);

      if (dp[i][j] === dp[i - 1][j - 1] + score) {
        pairs.unshift({
          canonicalIndex: i - 1,
          canonicalWord: canonicalWords[i - 1],
          spokenToken: spokenTokens[j - 1],
          distance: dist,
          status: isMatch ? 'correct' : 'substituted'
        });
        i--;
        j--;
        continue;
      }
    }

    if (i > 0 && dp[i][j] === dp[i - 1][j] + GAP_PENALTY) {
      // Canonical word was skipped in speech
      pairs.unshift({
        canonicalIndex: i - 1,
        canonicalWord: canonicalWords[i - 1],
        distance: 99,
        status: 'skipped'
      });
      i--;
    } else {
      // Extra spoken token (insertion)
      j--;
    }
  }

  return pairs;
}

export class LocalRecitationEngine implements IRecitationEngine {
  private recognition: any = null;
  private listening: boolean = false;
  private currentAyah: Ayah | null = null;
  private recognizedTranscript: string = '';
  private latestInterimText: string = '';
  private currentWordIdx: number = 0;
  private isStrictPrecision: boolean = false;

  // Real-time live auto-advance and token tracking
  private consumedTokensCount: number = 0;
  private confirmedCorrectIndices: Set<number> = new Set<number>();
  private isTransitioning: boolean = false;
  private onAyahCompleteCb?: (masteredAyah: Ayah) => void;
  private onProgressCb?: (
    currentWordIndex: number,
    currentTranscript: string,
    correctIndices?: number[],
    mistakeIndices?: number[]
  ) => void;

  // MediaRecorder audio capture
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private userAudioBlobUrl: string | null = null;
  private mediaStream: MediaStream | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.maxAlternatives = 5; // Examine top 5 hypotheses for Quranic precision
          this.recognition.lang = 'ar-SA';
        } catch (e) {
          console.warn('[RecitationEngine] SpeechRecognition init warning:', e);
        }
      }
    }
  }

  isListening(): boolean {
    return this.listening;
  }

  getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  setDialect(langCode: string) {
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  setPrecisionMode(mode: 'balanced' | 'strict') {
    this.isStrictPrecision = mode === 'strict';
  }

  setTargetAyah(nextAyah: Ayah) {
    this.currentAyah = nextAyah;
    this.currentWordIdx = 0;
    this.confirmedCorrectIndices.clear();
    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);
  }

  async startListening(
    targetAyah: Ayah,
    onProgress: (
      currentWordIndex: number,
      currentTranscript: string,
      correctIndices?: number[],
      mistakeIndices?: number[]
    ) => void,
    onError: (err: string) => void,
    onAyahComplete?: (masteredAyah: Ayah) => void
  ): Promise<void> {
    this.currentAyah = targetAyah;
    this.recognizedTranscript = '';
    this.latestInterimText = '';
    this.currentWordIdx = 0;
    this.consumedTokensCount = 0;
    this.confirmedCorrectIndices.clear();
    this.isTransitioning = false;
    this.onProgressCb = onProgress;
    this.onAyahCompleteCb = onAyahComplete;
    this.audioChunks = [];
    this.userAudioBlobUrl = null;
    this.listening = true;

    // 1. CRITICAL FOR MOBILE (iOS Safari & Android):
    // Start SpeechRecognition SYNCHRONOUSLY FIRST in the direct user gesture callstack!
    // iOS Safari automatically terminates user activation context after any async await tick.
    if (this.recognition) {
      const isMobile = isMobileDevice();
      // On mobile WebKit, continuous=true causes immediate abort or crash.
      this.recognition.continuous = !isMobile;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = isMobile ? 1 : 5;

      this.recognition.onend = () => {
        // Keep-alive: If student is still reciting and took a breath, seamlessly restart
        if (this.listening) {
          try {
            this.recognition.start();
          } catch (e) {
            // Already active or resetting
          }
        }
      };

      this.recognition.onresult = (event: any) => {
        let fullTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          let bestText = res[0].transcript;
          if (res.length > 1 && this.currentAyah) {
            const verseNorm = normalizeQuranicPhonetics(this.currentAyah.textSimple);
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

        const activeText = fullTranscript.trim();
        this.recognizedTranscript = activeText;
        const rawTokens = activeText.split(/\s+/).filter(Boolean);
        const consolidated = consolidateArabicPrefixes(rawTokens);

        // Self-heal if SpeechRecognition restarted on breath pause
        if (consolidated.length < this.consumedTokensCount) {
          this.consumedTokensCount = 0;
        }

        const currentTokens = consolidated.slice(this.consumedTokensCount);
        if (!this.currentAyah) return;
        const targetWords = this.currentAyah.words.map(w => w.arabic);

        if (currentTokens.length === 0) {
          if (this.onProgressCb) {
            this.onProgressCb(
              this.currentWordIdx,
              activeText,
              Array.from(this.confirmedCorrectIndices),
              []
            );
          }
          return;
        }

        // Needleman-Wunsch global alignment on the actual verse tokens
        const isBasmalahVerse = this.currentAyah.surahNumber === 1 && this.currentAyah.ayahNumber === 1;
        const { hasInvocation, invocationTokens, verseTokens } = extractIntroductoryInvocation(currentTokens, isBasmalahVerse);

        if (verseTokens.length === 0) {
          // Student only spoke opening Basmalah/Isti'adhah so far!
          // Do NOT advance or match with the verse!
          if (this.onProgressCb) {
            const invocationLabel = hasInvocation ? `(${invocationTokens.join(' ')})` : '';
            this.onProgressCb(
              0,
              `${activeText} ${invocationLabel}`.trim(),
              [],
              []
            );
          }
          return;
        }

        const alignment = alignQuranicWordSequences(targetWords, verseTokens, this.isStrictPrecision);
        const currentMistakeIndices: number[] = [];
        let matchedCount = 0;

        for (const pair of alignment) {
          if (pair.status === 'correct') {
            this.confirmedCorrectIndices.add(pair.canonicalIndex);
            matchedCount++;
          } else if (pair.status === 'substituted') {
            if (!this.confirmedCorrectIndices.has(pair.canonicalIndex)) {
              currentMistakeIndices.push(pair.canonicalIndex);
            }
          }
        }

        const confirmedList = Array.from(this.confirmedCorrectIndices).sort((a, b) => a - b);
        this.currentWordIdx = confirmedList.length > 0 ? confirmedList[confirmedList.length - 1] : 0;

        if (this.onProgressCb) {
          this.onProgressCb(this.currentWordIdx, activeText, confirmedList, currentMistakeIndices);
        }

        // Check for extraneous inserted words (Ziyadah)
        const extraTokensCount = Math.max(0, verseTokens.length - matchedCount);
        const hasDisqualifyingExtraWords = targetWords.length <= 2
          ? extraTokensCount > 0
          : extraTokensCount > Math.max(1, Math.floor(targetWords.length * 0.15));

        // Live verse mastery check
        const isMastered = (
          this.confirmedCorrectIndices.size === targetWords.length &&
          currentMistakeIndices.length === 0 &&
          !hasDisqualifyingExtraWords &&
          !this.isTransitioning
        );

        if (isMastered) {
          this.isTransitioning = true;
          this.consumedTokensCount = consolidated.length;
          const masteredAyah = this.currentAyah;
          if (this.onAyahCompleteCb) {
            this.onAyahCompleteCb(masteredAyah);
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[RecitationEngine] Speech error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          if (event.error === 'not-allowed') {
            onError('Microphone or Speech Recognition permission was denied. On iPhone/iPad, please enable Siri & Dictation in iOS Settings > General > Keyboard.');
          } else if (event.error === 'audio-capture') {
            onError('Microphone is busy. Please close other recording apps and try again.');
          } else {
            onError(`Speech Notice: ${event.error}`);
          }
        }
      };

      try {
        this.recognition.start();
      } catch (e) {
        console.warn('[RecitationEngine] Synchronous recognition start error:', e);
      }
    } else {
      console.log('[RecitationEngine] Web Speech API not natively available; recording audio via MediaRecorder.');
    }

    // 2. Initialize Microphone Audio Recording with Studio Acoustic Quality
    // Started after speech recognition to avoid audio device locking conflicts
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
        this.mediaStream = stream;
        const mimeType = getSupportedAudioMimeType();
        this.mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };
        this.mediaRecorder.start(250);
      } catch (micErr: any) {
        console.warn('[RecitationEngine] Microphone recording unavailable:', micErr);
        if (!this.recognition) {
          onError("Microphone access could not be obtained. Please allow microphone permissions in your browser.");
        }
      }
    }
  }

  async stopListening(transcriptOverride?: string): Promise<RecitationDiagnosticReport> {
    this.listening = false;

    // Detach keep-alive before stopping SpeechRecognition
    if (this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
    }

    // Stop MediaRecorder and create playable audio URL
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.warn(e);
      }
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    if (this.audioChunks.length > 0) {
      const mimeType = getSupportedAudioMimeType() || 'audio/webm';
      const audioBlob = new Blob(this.audioChunks, { type: mimeType });
      this.userAudioBlobUrl = URL.createObjectURL(audioBlob);
    }

    if (!this.currentAyah) {
      throw new Error("No active ayah set during recitation evaluation.");
    }

    // Combine final transcript with any remaining interim text
    const fullSpoken = transcriptOverride !== undefined
      ? transcriptOverride.trim()
      : this.recognizedTranscript.trim();

    const canonicalWords = this.currentAyah.words.map(w => w.arabic);
    const rawTokens = fullSpoken.split(/\s+/).filter(Boolean);
    const spokenTokens = consolidateArabicPrefixes(rawTokens);

    // Slicing out tokens consumed by previously mastered ayahs
    const currentTokens = transcriptOverride !== undefined
      ? spokenTokens
      : (this.consumedTokensCount > 0 && spokenTokens.length >= this.consumedTokensCount
          ? spokenTokens.slice(this.consumedTokensCount)
          : spokenTokens);

    const isBasmalahVerse = this.currentAyah.surahNumber === 1 && this.currentAyah.ayahNumber === 1;
    const { hasInvocation, invocationTokens, verseTokens } = extractIntroductoryInvocation(currentTokens, isBasmalahVerse);

    // If nothing was spoken for the verse itself, report 0% accuracy and mark all words as skipped!
    if (verseTokens.length === 0) {
      const allSkipped: RecitedWordEvaluation[] = canonicalWords.map((canonical, i) => ({
        wordIndex: i,
        canonicalWord: canonical,
        status: 'skipped',
        confidence: 0.95,
        feedback: hasInvocation
          ? `Opening invocation (${invocationTokens.join(' ')}) detected, but Ayah ${this.currentAyah?.ayahNumber} (${canonical}) was not recited.`
          : `No recitation detected for this word.`
      }));

      const surahPadded = String(this.currentAyah.surahNumber).padStart(3, '0');
      const ayahPadded = String(this.currentAyah.ayahNumber).padStart(3, '0');
      const qariUrl = `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/${surahPadded}${ayahPadded}.mp3`;

      return {
        ayahId: this.currentAyah.id,
        surahNumber: this.currentAyah.surahNumber,
        ayahNumber: this.currentAyah.ayahNumber,
        overallAccuracy: 0,
        wordEvaluations: allSkipped,
        detectedMistakesCount: canonicalWords.length,
        weakWords: canonicalWords,
        tajweedObservations: hasInvocation
          ? [`Introductory invocation (${invocationTokens.join(' ')}) was detected, but no recitation of Ayah ${this.currentAyah.ayahNumber} (${canonicalWords.join(' ')}) was detected. Please recite the verse itself into your microphone.`]
          : ["No speech audio detected. Please recite the verse clearly into your microphone."],
        speechConfidenceScore: 0,
        isUncertain: true,
        userAudioUrl: this.userAudioBlobUrl || undefined,
        qariAudioUrl: qariUrl,
        rawTranscript: currentTokens.join(' ')
      };
    }

    // Run Needleman-Wunsch sequence alignment on verseTokens!
    const alignment = alignQuranicWordSequences(canonicalWords, verseTokens, this.isStrictPrecision);

    const wordEvaluations: RecitedWordEvaluation[] = [];
    const weakWords: string[] = [];
    const tajweedObservations: string[] = [];
    let correctCount = 0;

    for (const pair of alignment) {
      const wasConfirmed = this.confirmedCorrectIndices.has(pair.canonicalIndex);
      const isWordCorrect = wasConfirmed || pair.status === 'correct';

      if (isWordCorrect) {
        wordEvaluations.push({
          wordIndex: pair.canonicalIndex,
          canonicalWord: pair.canonicalWord,
          recitedWord: pair.spokenToken || pair.canonicalWord,
          status: 'correct',
          confidence: 0.98
        });
        correctCount++;
      } else if (pair.status === 'substituted') {
        wordEvaluations.push({
          wordIndex: pair.canonicalIndex,
          canonicalWord: pair.canonicalWord,
          recitedWord: pair.spokenToken,
          status: 'substituted',
          confidence: 0.90,
          feedback: `You recited "${pair.spokenToken}" instead of "${pair.canonicalWord}". Check vowel/harakah accuracy.`
        });
        weakWords.push(pair.canonicalWord);
      } else {
        wordEvaluations.push({
          wordIndex: pair.canonicalIndex,
          canonicalWord: pair.canonicalWord,
          status: 'skipped',
          confidence: 0.95,
          feedback: `Word omitted during recitation: "${pair.canonicalWord}".`
        });
        weakWords.push(pair.canonicalWord);
      }
    }

    // Inspect Tajweed markers on the active verse
    if (this.currentAyah.tajweedTokens) {
      for (const token of this.currentAyah.tajweedTokens) {
        if (token.rule === 'qalqalah') {
          tajweedObservations.push(`Ensure crisp bouncing resonance (Qalqalah) on [${token.text}].`);
        } else if (token.rule === 'ghunnah') {
          tajweedObservations.push(`Maintain full 2-count nasalization (Ghunnah) on [${token.text}].`);
        } else if (token.rule === 'madd') {
          tajweedObservations.push(`Observe required elongation counts on [${token.text}].`);
        }
      }
    }

    const extraTokensCount = Math.max(0, verseTokens.length - correctCount);
    if (extraTokensCount > 0) {
      tajweedObservations.push(`Detected ${extraTokensCount} extraneous or inserted word(s) not belonging to this Ayah.`);
    }

    const effectiveCorrect = Math.max(0, correctCount - extraTokensCount);
    const accuracy = Math.round((effectiveCorrect / Math.max(canonicalWords.length, 1)) * 100);
    const confidenceScore = spokenTokens.length > 0 ? 0.94 : 0.88;

    const surahPadded = String(this.currentAyah.surahNumber).padStart(3, '0');
    const ayahPadded = String(this.currentAyah.ayahNumber).padStart(3, '0');
    const qariUrl = `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/${surahPadded}${ayahPadded}.mp3`;

    return {
      ayahId: this.currentAyah.id,
      surahNumber: this.currentAyah.surahNumber,
      ayahNumber: this.currentAyah.ayahNumber,
      overallAccuracy: accuracy,
      wordEvaluations,
      detectedMistakesCount: Math.max(weakWords.length, canonicalWords.length - effectiveCorrect),
      weakWords,
      tajweedObservations,
      speechConfidenceScore: confidenceScore,
      isUncertain: false,
      userAudioUrl: this.userAudioBlobUrl || undefined,
      qariAudioUrl: qariUrl,
      rawTranscript: currentTokens.join(' ')
    };
  }
}

export const localRecitationEngine = new LocalRecitationEngine();
