import { db } from '../../db/quranDexieDB';
import { Ayah, QuranWord, TajweedRuleType } from '../../types/quran';

export class QuranContentService {
  /**
   * Loads all ayahs for a given Surah from IndexedDB.
   * If not present, downloads verified Uthmani script and English translation,
   * then permanently caches all verses into IndexedDB for offline access.
   */
  async getOrFetchSurahAyahs(surahNumber: number): Promise<Ayah[]> {
    // 1. Check local offline database first
    const cached = await db.ayahs.where('surahNumber').equals(surahNumber).toArray();
    if (cached.length > 0) {
      return cached.sort((a, b) => a.ayahNumber - b.ayahNumber);
    }

    // 2. Fetch from verified Quran API
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Surah ${surahNumber} content.`);
      }

      const json = await response.json();
      const uthmaniData = json.data[0];
      const englishData = json.data[1];

      const newAyahs: Ayah[] = uthmaniData.ayahs.map((item: any, idx: number) => {
        const arabicText: string = item.text;
        const enItem = englishData.ayahs[idx];
        const translationEnglish = enItem ? enItem.text : '';
        const ayahNum = item.numberInSurah;
        const juzNum = item.juz;
        const pageNum = item.page;

        // Break down into words
        const rawWords = arabicText.trim().split(/\s+/);
        const words: QuranWord[] = rawWords.map((w, wIdx) => {
          let rule: TajweedRuleType = 'none';
          if (/[قطبجد]/.test(w) && /ْ/.test(w)) rule = 'qalqalah';
          else if (/ّ/.test(w) && /[نم]/.test(w)) rule = 'ghunnah';
          else if (/[~آ]/.test(w) || /[\u0670]/.test(w)) rule = 'madd';

          return {
            position: wIdx + 1,
            arabic: w,
            transliteration: '',
            translation: '',
            tajweedRule: rule
          };
        });

        const surahPadded = String(surahNumber).padStart(3, '0');
        const ayahPadded = String(ayahNum).padStart(3, '0');

        return {
          id: `${surahNumber}:${ayahNum}`,
          surahNumber,
          ayahNumber: ayahNum,
          juzNumber: juzNum,
          pageNumber: pageNum,
          textUthmani: arabicText,
          textSimple: arabicText.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, ''),
          translationEnglish,
          transliteration: '',
          words,
          audioUrl: `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/${surahPadded}${ayahPadded}.mp3`
        };
      });

      // Permanently store into Dexie IndexedDB
      await db.ayahs.bulkPut(newAyahs);
      console.log(`[QuranContentService] Surah ${surahNumber} (${newAyahs.length} ayahs) permanently cached offline.`);
      return newAyahs;
    } catch (err) {
      console.warn(`[QuranContentService] Offline fetch error for Surah ${surahNumber}:`, err);
      // If network fails and nothing in DB, return empty array
      return [];
    }
  }
}

export const quranContentService = new QuranContentService();
