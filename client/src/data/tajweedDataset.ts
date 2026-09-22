import { TajweedLesson } from '../types/quran';

export const TAJWEED_CURRICULUM: TajweedLesson[] = [
  {
    id: "tajweed-1",
    courseNumber: 1,
    lessonNumber: 1,
    title: "Quran Reading Foundations",
    titleArabic: "أسس تلاوة القرآن",
    category: "Foundations",
    description: "The sacred art of Tilawah, adab (etiquette) of the Quran, and the distinction between Tartil and ordinary reading.",
    explanation: "Tajweed linguistically means 'betterment' or 'making something excellent'. In Quranic sciences, it refers to giving each letter its rightful due from its articulation point and descriptive characteristics. Reciting with Tajweed preserves the preservation of meaning and honors divine revelation.",
    ruleName: "none",
    examples: [
      { arabic: "وَرَتِّلِ ٱلْقُرْءَانَ تَرْتِيلًا", surahAyah: "73:4", highlightRule: "تَرْتِيلًا", note: "And recite the Quran with measured, rhythmic recitation." }
    ],
    quiz: [
      {
        question: "What is the primary spiritual and linguistic objective of Tajweed?",
        options: [
          "To speed up recitation time",
          "To give each letter its rightful articulation and characteristics without distortion",
          "To sing melodies with personal improvisation",
          "Only for Arab native speakers"
        ],
        correctIndex: 1,
        explanation: "Tajweed ensures the Quran is recited exactly as revealed to Prophet Muhammad (peace be upon him) with preservation of pronunciation and vowels."
      }
    ],
    mastered: true
  },
  {
    id: "tajweed-8",
    courseNumber: 8,
    lessonNumber: 1,
    title: "Makharij al-Huruf (Articulation Points)",
    titleArabic: "مخارج الحروف",
    category: "Articulation",
    description: "The 5 primary regions of origin for Arabic phonemes: Al-Jawf, Al-Halq, Al-Lisan, Ash-Shafatan, and Al-Khayshum.",
    explanation: "Makharij (plural of Makhraj) are the specific physical locations from which letters originate when vocalized. There are 5 general areas containing 17 specific articulation points according to Imam Ibn al-Jazari.",
    ruleName: "tafkhim",
    examples: [
      { arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", surahAyah: "113:1", highlightRule: "ق", note: "Qaf originates from the deepest back of the tongue hitting the soft palate." },
      { arabic: "ٱلْحَمْدُ لِلَّهِ", surahAyah: "1:2", highlightRule: "ح", note: "Haa (ح) originates from the middle of the throat (Adna al-Halq)." }
    ],
    quiz: [
      {
        question: "From where does the letter Qaf (ق) articulate?",
        options: [
          "The tip of the tongue touching top teeth",
          "The deepest back of the tongue raised against the soft palate",
          "The middle of the lips",
          "The nasal cavity"
        ],
        correctIndex: 1,
        explanation: "Qaf originates from Aqsa al-Lisan (the deepest back of the tongue) contacting the soft palate, distinguishing it from Kaf (ك) which hits the hard and soft palate lower down."
      }
    ],
    mastered: false
  },
  {
    id: "tajweed-10",
    courseNumber: 10,
    lessonNumber: 1,
    title: "Noon Sakinah & Tanween: Izhar & Idgham",
    titleArabic: "أحكام النون الساكنة والتنوين",
    category: "Noon & Tanween",
    description: "The 4 foundational rules when Noon Sakinah (نْ) or Tanween (ـً ـٍ ـٌ) meets surrounding letters.",
    explanation: "Whenever a non-voweled Noon or Tanween appears, it undergoes one of four phonetic transformations: 1. Izhar (Clear pronunciation before throat letters: ء هـ ع ح غ خ), 2. Idgham (Merging into ي ر م ل و ن), 3. Iqlab (Turning into Meem before ب), or 4. Ikhfa (Hiding with nasalization before 15 letters).",
    ruleName: "idgham",
    examples: [
      { arabic: "أَنْعَمْتَ", surahAyah: "1:7", highlightRule: "أَنْعَ", note: "Izhar: Noon followed by 'Ayn pronounced clearly with no extra elongation." },
      { arabic: "مَن يَقُولُ", surahAyah: "2:8", highlightRule: "مَن يَقُولُ", note: "Idgham with Ghunnah: Noon merges into Ya with 2-count nasal resonance." },
      { arabic: "مِن شَرِّ", surahAyah: "113:2", highlightRule: "مِن شَرِّ", note: "Ikhfa: Noon hidden before Sheen with continuous ghunnah." }
    ],
    quiz: [
      {
        question: "Which rule applies when Noon Sakinah meets the letter Baa (ب)?",
        options: [
          "Idgham",
          "Izhar Halqi",
          "Iqlab (turning the sound into a subtle Meem with Ghunnah)",
          "Qalqalah"
        ],
        correctIndex: 2,
        explanation: "Iqlab transforms the unvoweled Noon sound into a gentle Meem with Ghunnah and light lip contact, indicated in the Mushaf by a tiny Meem (ۢ)."
      }
    ],
    mastered: false
  },
  {
    id: "tajweed-13",
    courseNumber: 13,
    lessonNumber: 1,
    title: "Qalqalah (Echo / Bouncing Mechanism)",
    titleArabic: "أحكام القلقلة",
    category: "Acoustics",
    description: "The acoustic vibration and sudden release on the five letters of 'Qutb Jad' (ق ط ب ج د) when in a state of Sukoon.",
    explanation: "Qalqalah creates an audible echoing resonance without adding an extra vowel (harakah). It has levels: Sughra (minor, in the middle of a word or continuous speech e.g. يَلِدْ وَلَمْ), Kubra (major, on a stopped letter at the end of an ayah e.g. ٱلْفَلَقِ), and Akbar (greatest, when stopping on a shaddah e.g. بِٱلْحَقِّ).",
    ruleName: "qalqalah",
    examples: [
      { arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", surahAyah: "112:1", highlightRule: "أَحَدٌ", note: "Major Qalqalah on Daal upon stopping." },
      { arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", surahAyah: "112:3", highlightRule: "يَلِدْ", note: "Minor Qalqalah on Daal in mid-sentence." }
    ],
    quiz: [
      {
        question: "What are the five letters that trigger Qalqalah when bearing Sukoon?",
        options: [
          "ت ث ج ح خ",
          "ق ط ب ج د (Gathered in the mnemonic: قُطْبُ جَدٍّ)",
          "ي ر م ل و",
          "ء هـ ع ح غ"
        ],
        correctIndex: 1,
        explanation: "The mnemonic is Qutb Jad (ق, ط, ب, ج, د). When any of these has a Sukoon or is stopped upon, Qalqalah activates."
      }
    ],
    mastered: false
  },
  {
    id: "tajweed-17",
    courseNumber: 17,
    lessonNumber: 1,
    title: "Madd Rules (Elongation & Timing)",
    titleArabic: "أحكام المد وأوزانه",
    category: "Timing & Elongation",
    description: "Understanding natural elongation (Madd Tabee'i = 2 counts) vs secondary elongations (4, 5, or 6 counts).",
    explanation: "The letters of Madd are Alif preceded by Fatha, Waw preceded by Damma, and Yaa preceded by Kasra. Madd Tabee'i is held for 2 counts (the time to open or close a finger at natural pace). When followed by Hamzah or Sukoon/Shaddah, it lengthens to 4, 5, or 6 counts.",
    ruleName: "madd",
    examples: [
      { arabic: "ٱلرَّحْمَٰنِ", surahAyah: "1:3", highlightRule: "مَٰ", note: "Madd Tabee'i: 2 counts." },
      { arabic: "وَلَا ٱلضَّآلِّينَ", surahAyah: "1:7", highlightRule: "ضَّآلِّ", note: "Madd Lazim Kalimi Muthaqqal: 6 obligatory counts due to succeeding shaddah." }
    ],
    quiz: [
      {
        question: "How many counts of elongation must be observed for Madd Lazim (such as in 'Ad-Dāllīn')?",
        options: [
          "2 counts",
          "4 counts",
          "Strictly 6 counts (harakat)",
          "Optional 1 count"
        ],
        correctIndex: 2,
        explanation: "Madd Lazim is compulsory (lazim) across all ten authentic Qira'at to be held for 6 counts."
      }
    ],
    mastered: false
  }
];
