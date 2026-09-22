import { TajweedVoiceTestItem } from '../types/quran';

export const TAJWEED_VOICE_TEST_ITEMS: TajweedVoiceTestItem[] = [
  // -------------------------------------------------------------
  // 1. Makharij Letter Contrast Drills
  // -------------------------------------------------------------
  {
    id: 'makhraj-qaf-kaf',
    category: 'makharij_contrast',
    title: 'Qāf (ق) vs Kāf (ك)',
    titleArabic: 'القاف والكاف',
    targetRule: 'tafkhim',
    targetArabic: 'قُلْ',
    transliteration: 'Qul',
    surahAyahRef: '112:1',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/112001.mp3',
    highlightLetter: 'ق',
    confusedWith: 'ك',
    expectedPhonetics: 'Deep uvular/back palate with Isti’la elevation',
    coachingInstruction: 'Elevate the extreme back of the tongue against the soft palate. Avoid letting it slide forward into the hard palate where light Kaf (ك) is formed.'
  },
  {
    id: 'makhraj-sad-sin',
    category: 'makharij_contrast',
    title: 'Ṣād (ص) vs Sīn (س)',
    titleArabic: 'الصاد والسين',
    targetRule: 'tafkhim',
    targetArabic: 'صِرَٰطَ',
    transliteration: 'Sirāt',
    surahAyahRef: '1:6',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001006.mp3',
    highlightLetter: 'ص',
    confusedWith: 'س',
    expectedPhonetics: 'Heavy compression (Iṭbāq) and elevation (Isti’la)',
    coachingInstruction: 'Trap the sound between the roof of the mouth and tongue with compression (Iṭbāq). Do not flatten the tongue into light Sin (س).'
  },
  {
    id: 'makhraj-dad-dha',
    category: 'makharij_contrast',
    title: 'Ḍād (ض) vs Ẓā’ (ظ)',
    titleArabic: 'الضاد والظاء',
    targetRule: 'tafkhim',
    targetArabic: 'ٱلضَّآلِّينَ',
    transliteration: 'Ad-Dāllīn',
    surahAyahRef: '1:7',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001007.mp3',
    highlightLetter: 'ض',
    confusedWith: 'ظ',
    expectedPhonetics: 'Lateral edge of the tongue against upper molars (Istitalah)',
    coachingInstruction: 'Press the side edge of the tongue against the upper molars. Do not stick the tip of the tongue out between the teeth, which turns it into Zha (ظ).'
  },
  {
    id: 'makhraj-ha-ha',
    category: 'makharij_contrast',
    title: 'Ḥā’ (ح) vs Hā’ (هـ)',
    titleArabic: 'الحاء والهاء',
    targetRule: 'contrast',
    targetArabic: 'ٱلْحَمْدُ',
    transliteration: 'Al-Hamd',
    surahAyahRef: '1:2',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001002.mp3',
    highlightLetter: 'ح',
    confusedWith: 'ه',
    expectedPhonetics: 'Clear mid-throat constriction (Wasat al-Halq)',
    coachingInstruction: 'Gently squeeze the middle of the throat to produce crisp Haa (ح). Do not drop down to the deep chest vocal cords which produces Haa (هـ).'
  },
  {
    id: 'makhraj-ayn-hamzah',
    category: 'makharij_contrast',
    title: '‘Ayn (ع) vs Hamzah (ء)',
    titleArabic: 'العين والهمزة',
    targetRule: 'contrast',
    targetArabic: 'عَلِيمٌ',
    transliteration: '‘Alīm',
    surahAyahRef: '2:115',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/002115.mp3',
    highlightLetter: 'ع',
    confusedWith: 'ا',
    expectedPhonetics: 'Mid-throat vocal contraction without abrupt glottal stopping',
    coachingInstruction: 'Contract the pharynx in the middle throat to produce a smooth, resonant Ayn (ع). Avoid turning it into a sharp glottal stop (Hamzah ء).'
  },

  // -------------------------------------------------------------
  // 2. Qalqalah (Echo & Bouncing Resonance)
  // -------------------------------------------------------------
  {
    id: 'qalqalah-falaq',
    category: 'qalqalah',
    title: 'Major Qalqalah (Kubra) on Qāf',
    titleArabic: 'قلقلة كبرى على القاف',
    targetRule: 'qalqalah',
    targetArabic: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ',
    transliteration: 'Qul a’ūdhu bi-rabbi-l-falaq',
    surahAyahRef: '113:1',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/113001.mp3',
    highlightLetter: 'ق',
    expectedPhonetics: 'Abrupt closure and strong explosive echoing release upon stopping',
    coachingInstruction: 'When stopping on Al-Falaq, seal the air momentarily at the Qaf articulation point and release it with a distinct echoing bounce without adding a fatha.'
  },
  {
    id: 'qalqalah-ahad',
    category: 'qalqalah',
    title: 'Major Qalqalah (Kubra) on Dāl',
    titleArabic: 'قلقلة كبرى على الدال',
    targetRule: 'qalqalah',
    targetArabic: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
    transliteration: 'Qul Huwa-llāhu Ahad',
    surahAyahRef: '112:1',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/112001.mp3',
    highlightLetter: 'د',
    expectedPhonetics: 'Resonant bouncing vibration upon stopping on Daal',
    coachingInstruction: 'Stop on Ahad with clean tongue-tip contact behind the upper incisors, followed by an immediate bouncing release.'
  },
  {
    id: 'qalqalah-yalid',
    category: 'qalqalah',
    title: 'Minor Qalqalah (Sughra) in Mid-Verse',
    titleArabic: 'قلقلة صغرى في وسط الآية',
    targetRule: 'qalqalah',
    targetArabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
    transliteration: 'Lam yalid wa-lam yūlad',
    surahAyahRef: '112:3',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/112003.mp3',
    highlightLetter: 'د',
    expectedPhonetics: 'Subtle quick bounce on Daal without pausing recitation flow',
    coachingInstruction: 'Give a crisp, subtle bounce to the Daal in "yalid" without breaking the rhythmic continuity of the verse.'
  },

  // -------------------------------------------------------------
  // 3. Ghunnah (Nasalization)
  // -------------------------------------------------------------
  {
    id: 'ghunnah-noon',
    category: 'ghunnah',
    title: 'Ghunnah on Nūn Mushaddadah (نّ)',
    titleArabic: 'غنة النون المشددة',
    targetRule: 'ghunnah',
    targetArabic: 'إِنَّ ٱلَّذِينَ كَفَرُوا',
    transliteration: 'Inna-lladhīna kafarū',
    surahAyahRef: '2:6',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/002006.mp3',
    highlightLetter: 'ن',
    expectedPhonetics: 'Full 2-count nasal resonance held in the Khayshum',
    coachingInstruction: 'Hold the nasal vibration on "Inna" for two full beats (harakat) before proceeding to "alladhīna". Do not rush through the shaddah.'
  },
  {
    id: 'ghunnah-meem',
    category: 'ghunnah',
    title: 'Ghunnah on Mīm Mushaddadah (مّ)',
    titleArabic: 'غنة الميم المشددة',
    targetRule: 'ghunnah',
    targetArabic: 'عَمَّ يَتَسَآءَلُونَ',
    transliteration: '‘Amma yatasā’alūn',
    surahAyahRef: '78:1',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/078001.mp3',
    highlightLetter: 'م',
    expectedPhonetics: 'Resonant 2-count nasal humming through closed lips',
    coachingInstruction: 'Close the lips gently and direct the sound through the nasal cavity for two measured counts on "‘Amma".'
  },

  // -------------------------------------------------------------
  // 4. Noon Sakinah & Tanween
  // -------------------------------------------------------------
  {
    id: 'noon-izhar',
    category: 'noon_sakinah',
    title: 'Iẓhār Ḥalqī (Clear Pronunciation)',
    titleArabic: 'إظهار حلقي',
    targetRule: 'izhar',
    targetArabic: 'أَنْعَمْتَ عَلَيْهِمْ',
    transliteration: 'An’amta ‘alayhim',
    surahAyahRef: '1:7',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001007.mp3',
    highlightLetter: 'ن',
    expectedPhonetics: 'Crisp noon without extra nasal prolongation or pause',
    coachingInstruction: 'Pronounce the Noon clearly at the gum ridge before Ayn without elongation (no extra ghunnah) and without sakt (pause).'
  },
  {
    id: 'noon-idgham',
    category: 'noon_sakinah',
    title: 'Idghām with Ghunnah (Merging into Yā)',
    titleArabic: 'إدغام بغنة',
    targetRule: 'idgham',
    targetArabic: 'مَن يَقُولُ',
    transliteration: 'May-yaqūl',
    surahAyahRef: '2:8',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/002008.mp3',
    highlightLetter: 'ي',
    expectedPhonetics: 'Complete assimilation of Noon into Ya with 2-count nasal resonance',
    coachingInstruction: 'Merge the Noon directly into the Ya while sustaining the nasal resonance (Ghunnah) for 2 counts: "May-yaqūl".'
  },
  {
    id: 'noon-ikhfa',
    category: 'noon_sakinah',
    title: 'Ikhfā’ Ḥaqīqī (Hiding before Shīn)',
    titleArabic: 'إخفاء حقيقي',
    targetRule: 'ikhfa',
    targetArabic: 'مِن شَرِّ مَا خَلَقَ',
    transliteration: 'Min sharri mā khalaq',
    surahAyahRef: '113:2',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/113002.mp3',
    highlightLetter: 'ش',
    expectedPhonetics: 'Concealed noon with tongue near Sheen and ongoing ghunnah',
    coachingInstruction: 'Prepare the tongue near the Sheen articulation point while letting the nasal sound flow continuously for 2 counts.'
  },

  // -------------------------------------------------------------
  // 5. Madd (Elongation & Timing)
  // -------------------------------------------------------------
  {
    id: 'madd-lazim',
    category: 'madd',
    title: 'Madd Lāzim Kalimī (6 Compulsory Counts)',
    titleArabic: 'مد لازم كلمي مثقل',
    targetRule: 'madd',
    targetArabic: 'وَلَا ٱلضَّآلِّينَ',
    transliteration: 'Wa-la-d-dāllīn',
    surahAyahRef: '1:7',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001007.mp3',
    highlightLetter: 'آ',
    expectedPhonetics: 'Full 6 measured counts (harakat) before merging into Shaddah',
    coachingInstruction: 'Extend the Madd letter for strictly 6 counts before smoothly transitioning into the doubled Lam (shaddah).'
  },
  {
    id: 'madd-jaiz',
    category: 'madd',
    title: 'Madd Jā’iz Munfaṣil (4-5 Counts)',
    titleArabic: 'مد جائز منفصل',
    targetRule: 'madd',
    targetArabic: 'إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ',
    transliteration: 'Innā a’taynāka-l-kawthar',
    surahAyahRef: '108:1',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/108001.mp3',
    highlightLetter: 'آ',
    expectedPhonetics: '4 to 5 counts elongation across word boundary',
    coachingInstruction: 'Hold the Alif at the end of "Innā" for 4 to 5 counts before pronouncing the Hamzah of "a’taynāka".'
  },

  // -------------------------------------------------------------
  // 6. Tafkhīm & Tarqīq (Heavy vs Light)
  // -------------------------------------------------------------
  {
    id: 'tafkhim-allah',
    category: 'tafkhim',
    title: 'Lafẓ al-Jalālah: Heavy (Tafkhīm) after Fatḥah',
    titleArabic: 'تغليظ لام لفظ الجلالة',
    targetRule: 'tafkhim',
    targetArabic: 'شَهِدَ ٱللَّهُ',
    transliteration: 'Shahida-llāh',
    surahAyahRef: '3:18',
    audioAyahUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/003018.mp3',
    highlightLetter: 'ل',
    expectedPhonetics: 'Full, elevated, heavy resonance on Lam in Allah',
    coachingInstruction: 'Because the preceding letter has a fatha, make the Lam in Allah heavy and full by raising the back of the tongue.'
  }
];
