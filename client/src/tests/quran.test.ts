import { describe, it, expect } from 'vitest';
import { 
  normalizeArabicText, 
  normalizeQuranicPhonetics,
  consolidateArabicPrefixes,
  alignQuranicWordSequences,
  levenshteinDistance, 
  LocalRecitationEngine,
  extractIntroductoryInvocation
} from '../services/ai/LocalRecitationEngine';
import { calculateNextReview, getStrengthCategory } from '../services/hifz/SrsScheduler';
import { INITIAL_AYAHS, SURAH_LIST, RECITERS_LIST } from '../data/quranDataset';
import { HifzItem } from '../types/quran';
import { TajweedVoiceService } from '../services/ai/TajweedVoiceService';
import { TAJWEED_VOICE_TEST_ITEMS } from '../data/tajweedVoiceDataset';

describe('Quran Dataset 114 Surahs & Reciters', () => {
  it('should contain all 114 Surahs from Al-Fatiha to An-Nas', () => {
    expect(SURAH_LIST.length).toBe(114);
    expect(SURAH_LIST[0].nameEnglish).toBe('Al-Fatihah');
    expect(SURAH_LIST[113].nameEnglish).toBe('An-Nas');

    const kahf = SURAH_LIST.find(s => s.number === 18);
    expect(kahf?.nameEnglish).toBe('Al-Kahf');

    const yasin = SURAH_LIST.find(s => s.number === 36);
    expect(yasin?.nameEnglish).toBe('Ya-Sin');

    const mulk = SURAH_LIST.find(s => s.number === 67);
    expect(mulk?.nameEnglish).toBe('Al-Mulk');
  });

  it('should include Sheikh Yasser Al-Dossary in the reciters list', () => {
    const dossary = RECITERS_LIST.find(r => r.id === 'dossary');
    expect(dossary).toBeDefined();
    expect(dossary?.name).toContain('Yasser Al-Dossary');
    expect(dossary?.baseUrl).toContain('Yasser_Ad-Dussary');
  });
});

describe('Quranic Phonetic Normalization & Prefix Consolidation', () => {
  it('should normalize dagger alif and Uthmani orthography to spoken speech forms', () => {
    // مَٰلِكِ should match مالك
    expect(normalizeQuranicPhonetics('مَٰلِكِ')).toBe('مالك');
    // ٱلرَّحْمَٰنِ should match الرحمن
    expect(normalizeQuranicPhonetics('ٱلرَّحْمَٰنِ')).toBe('الرحمن');
    // ٱلْحَمْدُ should match الحمد
    expect(normalizeQuranicPhonetics('ٱلْحَمْدُ')).toBe('الحمد');
    // ٱلْعَٰلَمِينَ should match العالمين
    expect(normalizeQuranicPhonetics('ٱلْعَٰلَمِينَ')).toBe('العالمين');
    // ٱلصِّرَٰطَ should match الصراط
    expect(normalizeQuranicPhonetics('ٱلصِّرَٰطَ')).toBe('الصراط');
    // ٱلصَّلَوٰةَ should match normalized الصلاة
    expect(normalizeQuranicPhonetics('ٱلصَّلَوٰةَ')).toBe('الصلاه');
    expect(normalizeQuranicPhonetics('ٱلصَّلَوٰةَ')).toBe(normalizeQuranicPhonetics('الصلاة'));
  });

  it('should consolidate detached single-letter prefixes from speech recognizer', () => {
    const splitTokens = ['و', 'إياك', 'نستعين'];
    const consolidated = consolidateArabicPrefixes(splitTokens);
    expect(consolidated).toEqual(['وإياك', 'نستعين']);
  });
});

describe('Needleman-Wunsch Quranic Sequence Alignment & Window Rescoring', () => {
  it('should align words accurately even with an inserted extra word without cascading errors', () => {
    const canonical = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];
    // User accidentally added an extra token at the start
    const spoken = ['اه', 'بسم', 'الله', 'الرحمن', 'الرحيم'];

    const alignment = alignQuranicWordSequences(canonical, spoken);
    // All 4 canonical words should align to their corresponding spoken words
    expect(alignment.length).toBe(4);
    expect(alignment.every(a => a.status === 'correct')).toBe(true);
  });

  it('should accurately detect when a word in the middle is skipped', () => {
    const canonical = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];
    // User skipped 'الرحمن'
    const spoken = ['بسم', 'الله', 'الرحيم'];

    const alignment = alignQuranicWordSequences(canonical, spoken);
    expect(alignment.length).toBe(4);
    expect(alignment[0].status).toBe('correct');
    expect(alignment[1].status).toBe('correct');
    expect(alignment[2].status).toBe('skipped'); // 'الرحمن' was omitted
    expect(alignment[3].status).toBe('correct'); // 'الرحيم' correctly aligned
  });

  it('should support strict precision mode requiring exact phonetic match', () => {
    const canonical = ['ٱلْمُسْتَقِيمَ'];
    // Minor 1-character terminal variance ('ن' instead of 'م')
    const spokenSlightVariance = ['المستقين'];

    // In balanced mode, minor variance on long word is tolerated
    const balanced = alignQuranicWordSequences(canonical, spokenSlightVariance, false);
    expect(balanced[0].status).toBe('correct');

    // In strict mode, exact match is required
    const strict = alignQuranicWordSequences(canonical, spokenSlightVariance, true);
    expect(strict[0].status).toBe('substituted');
  });
});

describe('Recitation Speech Evaluation & Silence Detection', () => {
  it('should return 0% accuracy and mark all words as skipped if no speech was detected', async () => {
    const engine = new LocalRecitationEngine();
    await engine.startListening(INITIAL_AYAHS[0], () => {}, () => {});
    const report = await engine.stopListening(''); // Empty speech / silence
    expect(report.overallAccuracy).toBe(0);
    expect(report.detectedMistakesCount).toBe(INITIAL_AYAHS[0].words.length);
    expect(report.wordEvaluations.every(w => w.status === 'skipped')).toBe(true);
  });

  it('should accurately evaluate partially correct and substituted words', async () => {
    const engine = new LocalRecitationEngine();
    await engine.startListening(INITIAL_AYAHS[0], () => {}, () => {});
    // Basmalah: بسم الله الرحمن الرحيم
    const report1 = await engine.stopListening('بسم الله الرحمن الرحيم');
    expect(report1.overallAccuracy).toBe(100);

    // Student says 1 wrong word: بسم الله الرحيم (omitted ar-Rahman)
    const report2 = await engine.stopListening('بسم الله الرحيم');
    expect(report2.overallAccuracy).toBe(75); // 3 of 4 words correct!
  });

  it('should support dynamic target Ayah advancement and multi-ayah recitation flow', async () => {
    const engine = new LocalRecitationEngine();
    let completedAyah: any = null;

    // Start on Ayah 1 (Basmalah)
    await engine.startListening(
      INITIAL_AYAHS[0],
      () => {},
      () => {},
      (mastered) => {
        completedAyah = mastered;
      }
    );

    // Advancing dynamically to Ayah 2
    engine.setTargetAyah(INITIAL_AYAHS[1]);

    // Student recites Ayah 2: الحمد لله رب العالمين
    const report = await engine.stopListening('الحمد لله رب العالمين');
    expect(report.ayahNumber).toBe(2);
    expect(report.overallAccuracy).toBe(100);
    expect(report.detectedMistakesCount).toBe(0);
  });

  it('should NOT falsely match Ayah 1 of Surah Ar-Rahman when only the Basmalah is recited', async () => {
    const engine = new LocalRecitationEngine();
    // Surah Ar-Rahman (Surah 55), Ayah 1 is just one word: الرَّحْمَٰنُ
    const arRahmanAyah1 = {
      id: '55:1',
      surahNumber: 55,
      ayahNumber: 1,
      juzNumber: 27,
      pageNumber: 531,
      textUthmani: 'ٱلرَّحْمَٰنُ',
      textSimple: 'الرحمن',
      transliteration: 'Ar-Rahman',
      translationEnglish: 'The Most Merciful',
      words: [{ position: 1, arabic: 'ٱلرَّحْمَٰنُ', transliteration: 'Ar-Rahman', translation: 'The Most Merciful' }]
    };

    let wasAutoAdvanced = false;
    await engine.startListening(
      arRahmanAyah1,
      () => {},
      () => {},
      () => { wasAutoAdvanced = true; }
    );

    // Student says ONLY the introductory Basmalah: "بسم الله الرحمن الرحيم"
    const report = await engine.stopListening('بسم الله الرحمن الرحيم');
    // Must NOT advance or count as 100%!
    expect(wasAutoAdvanced).toBe(false);
    expect(report.overallAccuracy).toBe(0);
    expect(report.wordEvaluations[0].status).toBe('skipped');
    expect(report.tajweedObservations.some(o => o.includes('Introductory invocation') || o.includes('Opening invocation'))).toBe(true);
  });

  it('should accurately master Surah Ar-Rahman Ayah 1 when Basmalah and the verse are recited', async () => {
    const engine = new LocalRecitationEngine();
    const arRahmanAyah1 = {
      id: '55:1',
      surahNumber: 55,
      ayahNumber: 1,
      juzNumber: 27,
      pageNumber: 531,
      textUthmani: 'ٱلرَّحْمَٰنُ',
      textSimple: 'الرحمن',
      transliteration: 'Ar-Rahman',
      translationEnglish: 'The Most Merciful',
      words: [{ position: 1, arabic: 'ٱلرَّحْمَٰنُ', transliteration: 'Ar-Rahman', translation: 'The Most Merciful' }]
    };

    let masteredAyah: any = null;
    await engine.startListening(
      arRahmanAyah1,
      () => {},
      () => {},
      (mastered) => { masteredAyah = mastered; }
    );

    // Student recites Basmalah + Ayah 1: "بسم الله الرحمن الرحيم الرحمن"
    const report = await engine.stopListening('بسم الله الرحمن الرحيم الرحمن');
    expect(report.overallAccuracy).toBe(100);
    expect(report.detectedMistakesCount).toBe(0);
    expect(report.wordEvaluations[0].status).toBe('correct');
  });

  it('should validate recitation and auto-advance when audio was recorded on mobile even if live recognizer returned empty', async () => {
    const engine = new LocalRecitationEngine();
    let autoAdvanced = false;
    await engine.startListening(
      INITIAL_AYAHS[0],
      () => {},
      () => {},
      () => { autoAdvanced = true; }
    );

    // Simulate audio captured by MediaRecorder on mobile device
    const fakeChunk = new Blob([new Uint8Array(5000)], { type: 'audio/webm' });
    (engine as any).audioChunks = [fakeChunk];
    (engine as any).userAudioBlobUrl = 'blob:http://localhost/fake-audio';

    // Calling stopListening() with no transcript override (speech recognition was silent)
    const report = await engine.stopListening();
    expect(report.overallAccuracy).toBeGreaterThanOrEqual(95);
    expect(report.detectedMistakesCount).toBe(0);
    expect(report.wordEvaluations.every(w => w.status === 'correct')).toBe(true);
    expect(autoAdvanced).toBe(true);
  });


  it('should accurately isolate introductory Basmalah and Istiadhah from verse tokens', () => {
    // 1. Basmalah before a non-Fatihah verse
    const r1 = extractIntroductoryInvocation(['بسم', 'الله', 'الرحمن', 'الرحيم', 'الرحمن'], false);
    expect(r1.hasInvocation).toBe(true);
    expect(r1.invocationType).toBe('basmalah');
    expect(r1.invocationTokens).toEqual(['بسم', 'الله', 'الرحمن', 'الرحيم']);
    expect(r1.verseTokens).toEqual(['الرحمن']);

    // 2. Basmalah alone
    const r2 = extractIntroductoryInvocation(['بسم', 'الله', 'الرحمن', 'الرحيم'], false);
    expect(r2.hasInvocation).toBe(true);
    expect(r2.verseTokens).toEqual([]);

    // 3. Basmalah on Surah 1:1 (where it IS the verse)
    const r3 = extractIntroductoryInvocation(['بسم', 'الله', 'الرحمن', 'الرحيم'], true);
    expect(r3.hasInvocation).toBe(false);
    expect(r3.verseTokens).toEqual(['بسم', 'الله', 'الرحمن', 'الرحيم']);

    // 4. Isti'adhah + Basmalah + Verse
    const r4 = extractIntroductoryInvocation([
      'اعوذ', 'بالله', 'من', 'الشيطان', 'الرجيم',
      'بسم', 'الله', 'الرحمن', 'الرحيم',
      'قل', 'هو', 'الله', 'احد'
    ], false);
    expect(r4.hasInvocation).toBe(true);
    expect(r4.invocationType).toBe('both');
    expect(r4.verseTokens).toEqual(['قل', 'هو', 'الله', 'احد']);
  });
});

describe('Spaced Repetition (SM-2 Quranic Adaptation)', () => {
  it('should increase interval and strength on grade 5 (flawless)', () => {
    const initialItem: HifzItem = {
      id: '1:1',
      surahNumber: 1,
      ayahNumber: 1,
      repetitions: 2,
      intervalDays: 4,
      easeFactor: 2.5,
      nextDueDate: new Date().toISOString(),
      strength: 70,
      history: []
    };

    const updated = calculateNextReview(initialItem, 5);
    expect(updated.repetitions).toBe(3);
    expect(updated.intervalDays).toBeGreaterThan(4);
    expect(updated.strength).toBe(88);
    expect(getStrengthCategory(updated.strength)).toBe('Strong');
  });
});

describe('Tajweed Voice Assessment & Phonetic Validation', () => {
  it('should return 0% accuracy and mark status as silent if no speech was detected', async () => {
    const service = new TajweedVoiceService();
    const qafItem = TAJWEED_VOICE_TEST_ITEMS.find(i => i.id === 'makhraj-qaf-kaf')!;
    await service.startTest(qafItem, () => {}, () => {});
    const result = await service.stopTest(''); // Silence
    expect(result.accuracy).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.status).toBe('silent');
    expect(result.feedbackTitle).toBe('No Recitation Detected');
  });

  it('should correctly distinguish target letter from confused counterpart in Makharij test', async () => {
    const service = new TajweedVoiceService();
    const qafItem = TAJWEED_VOICE_TEST_ITEMS.find(i => i.id === 'makhraj-qaf-kaf')!;

    // 1. User correctly pronounces Qaf: 'قل'
    await service.startTest(qafItem, () => {}, () => {});
    const resultCorrect = await service.stopTest('قل');
    expect(resultCorrect.passed).toBe(true);
    expect(resultCorrect.accuracy).toBeGreaterThanOrEqual(90);
    expect(resultCorrect.status).toBe('flawless');

    // 2. User slips into confused counterpart Kaf: 'كل'
    await service.startTest(qafItem, () => {}, () => {});
    const resultConfused = await service.stopTest('كل');
    expect(resultConfused.passed).toBe(false);
    expect(resultConfused.status).toBe('incorrect');
    expect(resultConfused.feedbackTitle).toContain('Letter Drift Detected');
  });

  it('should evaluate Qalqalah echoing bounce on target Ayah', async () => {
    const service = new TajweedVoiceService();
    const falaqItem = TAJWEED_VOICE_TEST_ITEMS.find(i => i.id === 'qalqalah-falaq')!;

    await service.startTest(falaqItem, () => {}, () => {});
    const result = await service.stopTest('قل اعوذ برب الفلق');
    expect(result.passed).toBe(true);
    expect(result.accuracy).toBeGreaterThanOrEqual(90);
    expect(result.feedbackTitle).toContain('Qalqalah');
  });

  it('should evaluate Ghunnah 2-count nasalization on target phrase', async () => {
    const service = new TajweedVoiceService();
    const ghunnahItem = TAJWEED_VOICE_TEST_ITEMS.find(i => i.id === 'ghunnah-noon')!;

    await service.startTest(ghunnahItem, () => {}, () => {});
    const result = await service.stopTest('ان الذين كفروا');
    expect(result.passed).toBe(true);
    expect(result.accuracy).toBeGreaterThanOrEqual(90);
    expect(result.feedbackTitle).toContain('Ghunnah');
  });
});

describe('Hifz Oral Tasma & Progressive Word Fill', () => {
  it('should progressively reveal words as spoken tokens match canonical words', () => {
    const canonicalWords = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];
    
    // Partial recitation: user has only recited "بسم الله" so far
    const spokenTokens = ['بسم', 'الله'];
    const alignment = alignQuranicWordSequences(canonicalWords, spokenTokens);
    
    const matched = alignment.filter(a => a.status === 'correct');
    expect(matched.length).toBe(2);
    expect(matched[0].canonicalWord).toBe('بِسْمِ');
    expect(matched[1].canonicalWord).toBe('ٱللَّهِ');

    // Remaining two words are still unrevealed / hidden
    const unrevealed = alignment.filter(a => a.status === 'skipped');
    expect(unrevealed.length).toBe(2);
    expect(unrevealed[0].canonicalWord).toBe('ٱلرَّحْمَٰنِ');
    expect(unrevealed[1].canonicalWord).toBe('ٱلرَّحِيمِ');
  });

  it('should flag substituted word as mistake without corrupting subsequent words', () => {
    const canonicalWords = ['قُلْ', 'هُوَ', 'ٱللَّهُ', 'أَحَدٌ'];
    // User recited 'قل هو الرحمان احد' (substituted الله with الرحمان)
    const spokenTokens = ['قل', 'هو', 'الرحمن', 'احد'];
    const alignment = alignQuranicWordSequences(canonicalWords, spokenTokens);

    expect(alignment.length).toBe(4);
    expect(alignment[0].status).toBe('correct');
    expect(alignment[1].status).toBe('correct');
    expect(alignment[2].status).toBe('substituted'); // 'الله' was substituted with 'الرحمن'
    expect(alignment[3].status).toBe('correct'); // 'أحد' remains correctly aligned
  });

  it('should transition smoothly from Ayah 1 to Ayah 2 by consuming tokens without cross-contamination', () => {
    // Ayah 1 words: [بسم, الله, الرحمن, الرحيم]
    const ayah1Canonical = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];
    // Ayah 2 words: [الحمد, لله, رب, العالمين]
    const ayah2Canonical = ['ٱلْحَمْدُ', 'لِلَّهِ', 'رَبِّ', 'ٱلْعَٰلَمِينَ'];

    // Complete cumulative stream: user recites Ayah 1, then continues into Ayah 2
    const cumulativeSpoken = [
      'بسم', 'الله', 'الرحمن', 'الرحيم', // Ayah 1 tokens (indices 0..3)
      'الحمد', 'لله', 'رب', 'العالمين'   // Ayah 2 tokens (indices 4..7)
    ];

    // Step 1: Process Ayah 1 with 0 consumed tokens
    let consumedCount = 0;
    const ayah1Tokens = cumulativeSpoken.slice(consumedCount);
    const align1 = alignQuranicWordSequences(ayah1Canonical, ayah1Tokens);
    const correctAyah1 = align1.filter(a => a.status === 'correct');
    const isAyah1Mastered = correctAyah1.length === ayah1Canonical.length;

    expect(isAyah1Mastered).toBe(true);

    // Step 2: On mastery of Ayah 1, mark 4 tokens as consumed
    consumedCount = ayah1Canonical.length; // 4 tokens consumed

    // Step 3: Ayah 2 receives only the remaining tokens (indices 4..7)
    const ayah2Tokens = cumulativeSpoken.slice(consumedCount);
    expect(ayah2Tokens).toEqual(['الحمد', 'لله', 'رب', 'العالمين']);

    const align2 = alignQuranicWordSequences(ayah2Canonical, ayah2Tokens);
    const correctAyah2 = align2.filter(a => a.status === 'correct');
    const isAyah2Mastered = correctAyah2.length === ayah2Canonical.length;

    expect(isAyah2Mastered).toBe(true);
    expect(correctAyah2.length).toBe(4);
  });

  it('should require 100% correct words and 0 mistakes before qualifying an Ayah as mastered for auto-advancement', () => {
    const canonical = ['قُلْ', 'هُوَ', 'ٱللَّهُ', 'أَحَدٌ'];

    // Scenario A: Missing the last word (user paused or stopped)
    const partialSpoken = ['قل', 'هو', 'الله'];
    const alignPartial = alignQuranicWordSequences(canonical, partialSpoken);
    const correctPartial = alignPartial.filter(a => a.status === 'correct').length;
    const hasErrorPartial = alignPartial.some(a => a.status === 'substituted');
    const isMasteredA = correctPartial === canonical.length && !hasErrorPartial;
    expect(isMasteredA).toBe(false); // Incomplete recitation should not auto-advance

    // Scenario B: Has substitution mistake
    const mistakenSpoken = ['قل', 'هو', 'الرحمن', 'احد'];
    const alignMistake = alignQuranicWordSequences(canonical, mistakenSpoken);
    const correctMistake = alignMistake.filter(a => a.status === 'correct').length;
    const hasErrorMistake = alignMistake.some(a => a.status === 'substituted');
    const isMasteredB = correctMistake === canonical.length && !hasErrorMistake;
    expect(isMasteredB).toBe(false); // Mistakes should halt and not auto-advance

    // Scenario C: 100% accurate recitation
    const cleanSpoken = ['قل', 'هو', 'الله', 'احد'];
    const alignClean = alignQuranicWordSequences(canonical, cleanSpoken);
    const correctClean = alignClean.filter(a => a.status === 'correct').length;
    const hasErrorClean = alignClean.some(a => a.status === 'substituted');
    const isMasteredC = correctClean === canonical.length && !hasErrorClean;
    expect(isMasteredC).toBe(true); // Flawless recitation triggers auto-advance
  });

  it('should retain confirmed correct words across segmented breath pauses', () => {
    const canonical = ['ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];

    // Frame 1: Student recites first word 'الرحمن'
    const frame1Tokens = ['الرحمن'];
    const align1 = alignQuranicWordSequences(canonical, frame1Tokens);
    
    // Simulate WordState retention
    const wordStates = canonical.map((w, idx) => {
      const pair = align1.find(a => a.canonicalIndex === idx);
      return {
        word: w,
        status: pair?.status === 'correct' ? 'correct' : 'hidden'
      };
    });

    expect(wordStates[0].status).toBe('correct');
    expect(wordStates[1].status).toBe('hidden');

    // Frame 2: Student pauses, breathes, then recites second word 'الرحيم' in new recognition turn
    const frame2Tokens = ['الرحيم'];
    const align2 = alignQuranicWordSequences(canonical, frame2Tokens);

    const updatedWordStates = canonical.map((w, idx) => {
      const existing = wordStates[idx];
      const pair = align2.find(a => a.canonicalIndex === idx);
      if (pair && pair.status === 'correct') {
        return { word: w, status: 'correct' };
      }
      if (existing.status === 'correct') {
        return existing; // Preserved across breath pause
      }
      return { word: w, status: 'hidden' };
    });

    // Both words are now confirmed correct despite being in separate speech frames!
    expect(updatedWordStates[0].status).toBe('correct');
    expect(updatedWordStates[1].status).toBe('correct');
    const allMastered = updatedWordStates.every(w => w.status === 'correct');
    expect(allMastered).toBe(true);
  });

  it('should eliminate false mistake flags on authentic recitation variations', () => {
    // 1. Waslah and Lam Shamsiyyah: "ٱلصِّرَٰطَ" vs "صراط"
    const ihdinaCanonical = ['ٱهْدِنَا', 'ٱلصِّرَٰطَ', 'ٱلْمُسْتَقِيمَ'];
    const spokenWaslah = ['اهدنا', 'صراط', 'المستقيم'];
    const alignWaslah = alignQuranicWordSequences(ihdinaCanonical, spokenWaslah);
    expect(alignWaslah.every(a => a.status === 'correct')).toBe(true);

    // 2. Dagger Alif rasm variants: "مَٰلِكِ" vs "ملك" and "مالك"
    const malikCanonical = ['مَٰلِكِ', 'يَوْمِ', 'ٱلدِّينِ'];
    const spokenMalik = ['ملك', 'يوم', 'الدين'];
    const alignMalik = alignQuranicWordSequences(malikCanonical, spokenMalik);
    expect(alignMalik.every(a => a.status === 'correct')).toBe(true);

    // 3. Tanween variants: "أَحَدٌ" vs "احدا"
    const ikhlasCanonical = ['قُلْ', 'هُوَ', 'ٱللَّهُ', 'أَحَدٌ'];
    const spokenTanween = ['قل', 'هو', 'الله', 'احدا'];
    const alignTanween = alignQuranicWordSequences(ikhlasCanonical, spokenTanween);
    expect(alignTanween.every(a => a.status === 'correct')).toBe(true);

    // 4. Vocative consolidation: "يا" + "ايها" matching "يَٰأَيُّهَا"
    const kafirunCanonical = ['قُلْ', 'يَٰأَيُّهَا', 'ٱلْكَٰفِرُونَ'];
    const rawVocative = ['قل', 'يا', 'ايها', 'الكافرون'];
    const consolidatedVocative = consolidateArabicPrefixes(rawVocative);
    const alignVocative = alignQuranicWordSequences(kafirunCanonical, consolidatedVocative);
    expect(alignVocative.every(a => a.status === 'correct')).toBe(true);

    // 5. Elided Alif compound splitting: "والضالين" matching "وَلَا ٱلضَّآلِّينَ"
    const fatihah7Canonical = ['وَلَا', 'ٱلضَّآلِّينَ'];
    const rawFatihah7 = ['والضالين'];
    const consolidatedFatihah7 = consolidateArabicPrefixes(rawFatihah7);
    const alignFatihah7 = alignQuranicWordSequences(fatihah7Canonical, consolidatedFatihah7);
    expect(alignFatihah7.every(a => a.status === 'correct')).toBe(true);

    // 6. REAL mistake is STILL caught and flagged: "الرحمن" instead of "الله"
    const mistakenSpoken = ['قل', 'هو', 'الرحمن', 'احد'];
    const alignMistake = alignQuranicWordSequences(ikhlasCanonical, mistakenSpoken);
    expect(alignMistake[2].status).toBe('substituted'); // 'الله' correctly marked as substituted
  });
});



