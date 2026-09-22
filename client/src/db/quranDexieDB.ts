import Dexie, { Table } from 'dexie';
import { Surah, Ayah, HifzItem, MistakeRecord, Bookmark, TajweedLesson } from '../types/quran';
import { SURAH_LIST, INITIAL_AYAHS } from '../data/quranDataset';
import { TAJWEED_CURRICULUM } from '../data/tajweedDataset';

export class HikmatQuranDatabase extends Dexie {
  surahs!: Table<Surah, number>;
  ayahs!: Table<Ayah, string>;
  hifzItems!: Table<HifzItem, string>;
  mistakes!: Table<MistakeRecord, string>;
  bookmarks!: Table<Bookmark, string>;
  tajweedLessons!: Table<TajweedLesson, string>;

  constructor() {
    super('HikmatQuranDB');
    this.version(1).stores({
      surahs: 'number, nameEnglish, revelationType, juzNumber',
      ayahs: 'id, surahNumber, ayahNumber, juzNumber, pageNumber, textSimple',
      hifzItems: 'id, surahNumber, ayahNumber, nextDueDate, strength',
      mistakes: 'id, surahNumber, ayahNumber, mistakeType, resolved',
      bookmarks: 'id, surahNumber, ayahNumber, createdAt',
      tajweedLessons: 'id, courseNumber, lessonNumber, category, ruleName, mastered'
    });
  }

  async initializeSeedData(): Promise<void> {
    const surahCount = await this.surahs.count();
    if (surahCount < 114) {
      console.log('[HikmatDB] Seeding canonical Surahs and Ayahs offline...');
      await this.surahs.bulkPut(SURAH_LIST);
      await this.ayahs.bulkPut(INITIAL_AYAHS);
      await this.tajweedLessons.bulkPut(TAJWEED_CURRICULUM);

      // Seed initial Hifz items for Surah Al-Fatiha and Al-Ikhlas
      const initialHifz: HifzItem[] = [
        {
          id: "1:1",
          surahNumber: 1,
          ayahNumber: 1,
          repetitions: 5,
          intervalDays: 14,
          easeFactor: 2.6,
          lastReviewedDate: new Date().toISOString(),
          nextDueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
          strength: 95,
          history: [{ date: new Date().toISOString(), grade: 5, accuracyScore: 100 }]
        },
        {
          id: "1:2",
          surahNumber: 1,
          ayahNumber: 2,
          repetitions: 4,
          intervalDays: 7,
          easeFactor: 2.4,
          lastReviewedDate: new Date(Date.now() - 6 * 86400000).toISOString(),
          nextDueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
          strength: 82,
          history: [{ date: new Date().toISOString(), grade: 4, accuracyScore: 92 }]
        },
        {
          id: "112:1",
          surahNumber: 112,
          ayahNumber: 1,
          repetitions: 3,
          intervalDays: 3,
          easeFactor: 2.5,
          lastReviewedDate: new Date(Date.now() - 4 * 86400000).toISOString(),
          nextDueDate: new Date(Date.now() - 1 * 86400000).toISOString(), // overdue for revision today!
          strength: 65,
          history: [{ date: new Date().toISOString(), grade: 3, accuracyScore: 78 }]
        }
      ];
      await this.hifzItems.bulkPut(initialHifz);

      // Seed initial mistake to demonstrate historical mistake engine
      const initialMistakes: MistakeRecord[] = [
        {
          id: "mistake-1",
          surahNumber: 1,
          ayahNumber: 7,
          wordIndex: 8,
          wordExpected: "ٱلضَّآلِّينَ",
          wordRecited: "الضالون",
          mistakeType: "substituted",
          confidence: 0.94,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          notes: "Notice the kasrah and Yaa (الضَّالِّينَ) vs nominative (الضالون).",
          resolved: false
        }
      ];
      await this.mistakes.bulkPut(initialMistakes);
      console.log('[HikmatDB] Offline seed complete.');
    }
  }
}

export const db = new HikmatQuranDatabase();
