import { Surah, Ayah, Reciter } from '../types/quran';

export const SURAH_LIST: Surah[] = [
  { number: 1, nameArabic: "الفاتحة", nameEnglish: "Al-Fatihah", nameTranslation: "The Opening", revelationType: "Meccan", totalAyahs: 7, startPage: 1, juzNumber: 1 },
  { number: 2, nameArabic: "البقرة", nameEnglish: "Al-Baqarah", nameTranslation: "The Cow", revelationType: "Medinan", totalAyahs: 286, startPage: 2, juzNumber: 1 },
  { number: 3, nameArabic: "آل عمران", nameEnglish: "Ali 'Imran", nameTranslation: "Family of Imran", revelationType: "Medinan", totalAyahs: 200, startPage: 50, juzNumber: 3 },
  { number: 4, nameArabic: "النساء", nameEnglish: "An-Nisa", nameTranslation: "The Women", revelationType: "Medinan", totalAyahs: 176, startPage: 77, juzNumber: 4 },
  { number: 5, nameArabic: "المائدة", nameEnglish: "Al-Ma'idah", nameTranslation: "The Table Spread", revelationType: "Medinan", totalAyahs: 120, startPage: 106, juzNumber: 6 },
  { number: 6, nameArabic: "الأنعام", nameEnglish: "Al-An'am", nameTranslation: "The Cattle", revelationType: "Meccan", totalAyahs: 165, startPage: 128, juzNumber: 7 },
  { number: 7, nameArabic: "الأعراف", nameEnglish: "Al-A'raf", nameTranslation: "The Heights", revelationType: "Meccan", totalAyahs: 206, startPage: 151, juzNumber: 8 },
  { number: 8, nameArabic: "الأنفال", nameEnglish: "Al-Anfal", nameTranslation: "The Spoils of War", revelationType: "Medinan", totalAyahs: 75, startPage: 177, juzNumber: 9 },
  { number: 9, nameArabic: "التوبة", nameEnglish: "At-Tawbah", nameTranslation: "The Repentance", revelationType: "Medinan", totalAyahs: 129, startPage: 187, juzNumber: 10 },
  { number: 10, nameArabic: "يونس", nameEnglish: "Yunus", nameTranslation: "Jonah", revelationType: "Meccan", totalAyahs: 109, startPage: 208, juzNumber: 11 },
  { number: 11, nameArabic: "هود", nameEnglish: "Hud", nameTranslation: "Hud", revelationType: "Meccan", totalAyahs: 123, startPage: 221, juzNumber: 11 },
  { number: 12, nameArabic: "يوسف", nameEnglish: "Yusuf", nameTranslation: "Joseph", revelationType: "Meccan", totalAyahs: 111, startPage: 235, juzNumber: 12 },
  { number: 13, nameArabic: "الرعد", nameEnglish: "Ar-Ra'd", nameTranslation: "The Thunder", revelationType: "Medinan", totalAyahs: 43, startPage: 249, juzNumber: 13 },
  { number: 14, nameArabic: "إبراهيم", nameEnglish: "Ibrahim", nameTranslation: "Abraham", revelationType: "Meccan", totalAyahs: 52, startPage: 255, juzNumber: 13 },
  { number: 15, nameArabic: "الحجر", nameEnglish: "Al-Hijr", nameTranslation: "The Rocky Tract", revelationType: "Meccan", totalAyahs: 99, startPage: 262, juzNumber: 14 },
  { number: 16, nameArabic: "النحل", nameEnglish: "An-Nahl", nameTranslation: "The Bee", revelationType: "Meccan", totalAyahs: 128, startPage: 267, juzNumber: 14 },
  { number: 17, nameArabic: "الإسراء", nameEnglish: "Al-Isra", nameTranslation: "The Night Journey", revelationType: "Meccan", totalAyahs: 111, startPage: 282, juzNumber: 15 },
  { number: 18, nameArabic: "الكهف", nameEnglish: "Al-Kahf", nameTranslation: "The Cave", revelationType: "Meccan", totalAyahs: 110, startPage: 293, juzNumber: 15 },
  { number: 19, nameArabic: "مريم", nameEnglish: "Maryam", nameTranslation: "Mary", revelationType: "Meccan", totalAyahs: 98, startPage: 305, juzNumber: 16 },
  { number: 20, nameArabic: "طه", nameEnglish: "Ta-Ha", nameTranslation: "Ta-Ha", revelationType: "Meccan", totalAyahs: 135, startPage: 312, juzNumber: 16 },
  { number: 21, nameArabic: "الأنبياء", nameEnglish: "Al-Anbiya", nameTranslation: "The Prophets", revelationType: "Meccan", totalAyahs: 112, startPage: 322, juzNumber: 17 },
  { number: 22, nameArabic: "الحج", nameEnglish: "Al-Hajj", nameTranslation: "The Pilgrimage", revelationType: "Medinan", totalAyahs: 78, startPage: 332, juzNumber: 17 },
  { number: 23, nameArabic: "المؤمنون", nameEnglish: "Al-Mu'minun", nameTranslation: "The Believers", revelationType: "Meccan", totalAyahs: 118, startPage: 342, juzNumber: 18 },
  { number: 24, nameArabic: "النور", nameEnglish: "An-Nur", nameTranslation: "The Light", revelationType: "Medinan", totalAyahs: 64, startPage: 350, juzNumber: 18 },
  { number: 25, nameArabic: "الفرقان", nameEnglish: "Al-Furqan", nameTranslation: "The Criterion", revelationType: "Meccan", totalAyahs: 77, startPage: 359, juzNumber: 18 },
  { number: 26, nameArabic: "الشعراء", nameEnglish: "Ash-Shu'ara", nameTranslation: "The Poets", revelationType: "Meccan", totalAyahs: 227, startPage: 367, juzNumber: 19 },
  { number: 27, nameArabic: "النمل", nameEnglish: "An-Naml", nameTranslation: "The Ant", revelationType: "Meccan", totalAyahs: 93, startPage: 377, juzNumber: 19 },
  { number: 28, nameArabic: "القصص", nameEnglish: "Al-Qasas", nameTranslation: "The Stories", revelationType: "Meccan", totalAyahs: 88, startPage: 385, juzNumber: 20 },
  { number: 29, nameArabic: "العنكبوت", nameEnglish: "Al-'Ankabut", nameTranslation: "The Spider", revelationType: "Meccan", totalAyahs: 69, startPage: 396, juzNumber: 20 },
  { number: 30, nameArabic: "الروم", nameEnglish: "Ar-Rum", nameTranslation: "The Romans", revelationType: "Meccan", totalAyahs: 60, startPage: 404, juzNumber: 21 },
  { number: 31, nameArabic: "لقمان", nameEnglish: "Luqman", nameTranslation: "Luqman", revelationType: "Meccan", totalAyahs: 34, startPage: 411, juzNumber: 21 },
  { number: 32, nameArabic: "السجدة", nameEnglish: "As-Sajdah", nameTranslation: "The Prostration", revelationType: "Meccan", totalAyahs: 30, startPage: 415, juzNumber: 21 },
  { number: 33, nameArabic: "الأحزاب", nameEnglish: "Al-Ahzab", nameTranslation: "The Combined Forces", revelationType: "Medinan", totalAyahs: 73, startPage: 418, juzNumber: 21 },
  { number: 34, nameArabic: "سبأ", nameEnglish: "Saba", nameTranslation: "Sheba", revelationType: "Meccan", totalAyahs: 54, startPage: 428, juzNumber: 22 },
  { number: 35, nameArabic: "فاطر", nameEnglish: "Fatir", nameTranslation: "Originator", revelationType: "Meccan", totalAyahs: 45, startPage: 434, juzNumber: 22 },
  { number: 36, nameArabic: "يس", nameEnglish: "Ya-Sin", nameTranslation: "Ya-Sin", revelationType: "Meccan", totalAyahs: 83, startPage: 440, juzNumber: 22 },
  { number: 37, nameArabic: "الصافات", nameEnglish: "As-Saffat", nameTranslation: "Those who set the Ranks", revelationType: "Meccan", totalAyahs: 182, startPage: 446, juzNumber: 23 },
  { number: 38, nameArabic: "ص", nameEnglish: "Sad", nameTranslation: "The Letter Sad", revelationType: "Meccan", totalAyahs: 88, startPage: 453, juzNumber: 23 },
  { number: 39, nameArabic: "الزمر", nameEnglish: "Az-Zumar", nameTranslation: "The Troops", revelationType: "Meccan", totalAyahs: 75, startPage: 458, juzNumber: 23 },
  { number: 40, nameArabic: "غافر", nameEnglish: "Ghafir", nameTranslation: "The Forgiver", revelationType: "Meccan", totalAyahs: 85, startPage: 467, juzNumber: 24 },
  { number: 41, nameArabic: "فصلت", nameEnglish: "Fussilat", nameTranslation: "Explained in Detail", revelationType: "Meccan", totalAyahs: 54, startPage: 477, juzNumber: 24 },
  { number: 42, nameArabic: "الشورى", nameEnglish: "Ash-Shuraa", nameTranslation: "The Consultation", revelationType: "Meccan", totalAyahs: 53, startPage: 483, juzNumber: 25 },
  { number: 43, nameArabic: "الزخرف", nameEnglish: "Az-Zukhruf", nameTranslation: "The Ornaments of Gold", revelationType: "Meccan", totalAyahs: 89, startPage: 489, juzNumber: 25 },
  { number: 44, nameArabic: "الدخان", nameEnglish: "Ad-Dukhan", nameTranslation: "The Smoke", revelationType: "Meccan", totalAyahs: 59, startPage: 496, juzNumber: 25 },
  { number: 45, nameArabic: "الجاثية", nameEnglish: "Al-Jathiyah", nameTranslation: "The Crouching", revelationType: "Meccan", totalAyahs: 37, startPage: 499, juzNumber: 25 },
  { number: 46, nameArabic: "الأحقاف", nameEnglish: "Al-Ahqaf", nameTranslation: "The Wind-Curved Sandhills", revelationType: "Meccan", totalAyahs: 35, startPage: 502, juzNumber: 26 },
  { number: 47, nameArabic: "محمد", nameEnglish: "Muhammad", nameTranslation: "Muhammad", revelationType: "Medinan", totalAyahs: 38, startPage: 507, juzNumber: 26 },
  { number: 48, nameArabic: "الفتح", nameEnglish: "Al-Fath", nameTranslation: "The Victory", revelationType: "Medinan", totalAyahs: 29, startPage: 511, juzNumber: 26 },
  { number: 49, nameArabic: "الحجرات", nameEnglish: "Al-Hujurat", nameTranslation: "The Rooms", revelationType: "Medinan", totalAyahs: 18, startPage: 515, juzNumber: 26 },
  { number: 50, nameArabic: "ق", nameEnglish: "Qaf", nameTranslation: "The Letter Qaf", revelationType: "Meccan", totalAyahs: 45, startPage: 518, juzNumber: 26 },
  { number: 51, nameArabic: "الذاريات", nameEnglish: "Adh-Dhariyat", nameTranslation: "The Winnowing Winds", revelationType: "Meccan", totalAyahs: 60, startPage: 520, juzNumber: 26 },
  { number: 52, nameArabic: "الطور", nameEnglish: "At-Tur", nameTranslation: "The Mount", revelationType: "Meccan", totalAyahs: 49, startPage: 523, juzNumber: 27 },
  { number: 53, nameArabic: "النجم", nameEnglish: "An-Najm", nameTranslation: "The Star", revelationType: "Meccan", totalAyahs: 62, startPage: 526, juzNumber: 27 },
  { number: 54, nameArabic: "القمر", nameEnglish: "Al-Qamar", nameTranslation: "The Moon", revelationType: "Meccan", totalAyahs: 55, startPage: 528, juzNumber: 27 },
  { number: 55, nameArabic: "الرحمن", nameEnglish: "Ar-Rahman", nameTranslation: "The Beneficent", revelationType: "Medinan", totalAyahs: 78, startPage: 531, juzNumber: 27 },
  { number: 56, nameArabic: "الواقعة", nameEnglish: "Al-Waqi'ah", nameTranslation: "The Inevitable", revelationType: "Meccan", totalAyahs: 96, startPage: 534, juzNumber: 27 },
  { number: 57, nameArabic: "الحديد", nameEnglish: "Al-Hadid", nameTranslation: "The Iron", revelationType: "Medinan", totalAyahs: 29, startPage: 537, juzNumber: 27 },
  { number: 58, nameArabic: "المجادلة", nameEnglish: "Al-Mujadila", nameTranslation: "The Pleading Woman", revelationType: "Medinan", totalAyahs: 22, startPage: 542, juzNumber: 28 },
  { number: 59, nameArabic: "الحشر", nameEnglish: "Al-Hashr", nameTranslation: "The Exile", revelationType: "Medinan", totalAyahs: 24, startPage: 545, juzNumber: 28 },
  { number: 60, nameArabic: "الممتحنة", nameEnglish: "Al-Mumtahanah", nameTranslation: "She that is to be examined", revelationType: "Medinan", totalAyahs: 13, startPage: 549, juzNumber: 28 },
  { number: 61, nameArabic: "الصف", nameEnglish: "As-Saf", nameTranslation: "The Ranks", revelationType: "Medinan", totalAyahs: 14, startPage: 551, juzNumber: 28 },
  { number: 62, nameArabic: "الجمعة", nameEnglish: "Al-Jumu'ah", nameTranslation: "Friday", revelationType: "Medinan", totalAyahs: 11, startPage: 553, juzNumber: 28 },
  { number: 63, nameArabic: "المنافقون", nameEnglish: "Al-Munafiqun", nameTranslation: "The Hypocrites", revelationType: "Medinan", totalAyahs: 11, startPage: 554, juzNumber: 28 },
  { number: 64, nameArabic: "التغابن", nameEnglish: "At-Taghabun", nameTranslation: "The Mutual Disillusion", revelationType: "Medinan", totalAyahs: 18, startPage: 556, juzNumber: 28 },
  { number: 65, nameArabic: "الطلاق", nameEnglish: "At-Talaq", nameTranslation: "The Divorce", revelationType: "Medinan", totalAyahs: 12, startPage: 558, juzNumber: 28 },
  { number: 66, nameArabic: "التحريم", nameEnglish: "At-Tahrim", nameTranslation: "The Prohibition", revelationType: "Medinan", totalAyahs: 12, startPage: 560, juzNumber: 28 },
  { number: 67, nameArabic: "الملك", nameEnglish: "Al-Mulk", nameTranslation: "The Sovereignty", revelationType: "Meccan", totalAyahs: 30, startPage: 562, juzNumber: 29 },
  { number: 68, nameArabic: "القلم", nameEnglish: "Al-Qalam", nameTranslation: "The Pen", revelationType: "Meccan", totalAyahs: 52, startPage: 564, juzNumber: 29 },
  { number: 69, nameArabic: "الحاقة", nameEnglish: "Al-Haqqah", nameTranslation: "The Reality", revelationType: "Meccan", totalAyahs: 52, startPage: 566, juzNumber: 29 },
  { number: 70, nameArabic: "المعارج", nameEnglish: "Al-Ma'arij", nameTranslation: "The Ascending Stairways", revelationType: "Meccan", totalAyahs: 44, startPage: 568, juzNumber: 29 },
  { number: 71, nameArabic: "نوح", nameEnglish: "Nuh", nameTranslation: "Noah", revelationType: "Meccan", totalAyahs: 28, startPage: 570, juzNumber: 29 },
  { number: 72, nameArabic: "الجن", nameEnglish: "Al-Jinn", nameTranslation: "The Jinn", revelationType: "Meccan", totalAyahs: 28, startPage: 572, juzNumber: 29 },
  { number: 73, nameArabic: "المزمل", nameEnglish: "Al-Muzzammil", nameTranslation: "The Enshrouded One", revelationType: "Meccan", totalAyahs: 20, startPage: 574, juzNumber: 29 },
  { number: 74, nameArabic: "المدثر", nameEnglish: "Al-Muddathir", nameTranslation: "The Cloaked One", revelationType: "Meccan", totalAyahs: 56, startPage: 575, juzNumber: 29 },
  { number: 75, nameArabic: "القيامة", nameEnglish: "Al-Qiyamah", nameTranslation: "The Resurrection", revelationType: "Meccan", totalAyahs: 40, startPage: 577, juzNumber: 29 },
  { number: 76, nameArabic: "الإنسان", nameEnglish: "Al-Insan", nameTranslation: "The Human", revelationType: "Medinan", totalAyahs: 31, startPage: 578, juzNumber: 29 },
  { number: 77, nameArabic: "المرسلات", nameEnglish: "Al-Mursalat", nameTranslation: "The Emissaries", revelationType: "Meccan", totalAyahs: 50, startPage: 580, juzNumber: 29 },
  { number: 78, nameArabic: "النبأ", nameEnglish: "An-Naba", nameTranslation: "The Tidings", revelationType: "Meccan", totalAyahs: 40, startPage: 582, juzNumber: 30 },
  { number: 79, nameArabic: "النازعات", nameEnglish: "An-Nazi'at", nameTranslation: "Those who drag forth", revelationType: "Meccan", totalAyahs: 46, startPage: 583, juzNumber: 30 },
  { number: 80, nameArabic: "عبس", nameEnglish: "'Abasa", nameTranslation: "He Frowned", revelationType: "Meccan", totalAyahs: 42, startPage: 585, juzNumber: 30 },
  { number: 81, nameArabic: "التكوير", nameEnglish: "At-Takwir", nameTranslation: "The Overthrowing", revelationType: "Meccan", totalAyahs: 29, startPage: 586, juzNumber: 30 },
  { number: 82, nameArabic: "الانفطار", nameEnglish: "Al-Infitar", nameTranslation: "The Cleaving", revelationType: "Meccan", totalAyahs: 19, startPage: 587, juzNumber: 30 },
  { number: 83, nameArabic: "المطففين", nameEnglish: "Al-Mutaffifin", nameTranslation: "The Defrauding", revelationType: "Meccan", totalAyahs: 36, startPage: 587, juzNumber: 30 },
  { number: 84, nameArabic: "الانشقاق", nameEnglish: "Al-Inshiqaq", nameTranslation: "The Splitting Open", revelationType: "Meccan", totalAyahs: 25, startPage: 589, juzNumber: 30 },
  { number: 85, nameArabic: "البروج", nameEnglish: "Al-Buruj", nameTranslation: "The Mansions of the Stars", revelationType: "Meccan", totalAyahs: 22, startPage: 590, juzNumber: 30 },
  { number: 86, nameArabic: "الطارق", nameEnglish: "At-Tariq", nameTranslation: "The Morning Star", revelationType: "Meccan", totalAyahs: 17, startPage: 591, juzNumber: 30 },
  { number: 87, nameArabic: "الأعلى", nameEnglish: "Al-A'la", nameTranslation: "The Most High", revelationType: "Meccan", totalAyahs: 19, startPage: 591, juzNumber: 30 },
  { number: 88, nameArabic: "الغاشية", nameEnglish: "Al-Ghashiyah", nameTranslation: "The Overwhelming", revelationType: "Meccan", totalAyahs: 26, startPage: 592, juzNumber: 30 },
  { number: 89, nameArabic: "الفجر", nameEnglish: "Al-Fajr", nameTranslation: "The Dawn", revelationType: "Meccan", totalAyahs: 30, startPage: 593, juzNumber: 30 },
  { number: 90, nameArabic: "البلد", nameEnglish: "Al-Balad", nameTranslation: "The City", revelationType: "Meccan", totalAyahs: 20, startPage: 594, juzNumber: 30 },
  { number: 91, nameArabic: "الشمس", nameEnglish: "Ash-Shams", nameTranslation: "The Sun", revelationType: "Meccan", totalAyahs: 15, startPage: 595, juzNumber: 30 },
  { number: 92, nameArabic: "الليل", nameEnglish: "Al-Layl", nameTranslation: "The Night", revelationType: "Meccan", totalAyahs: 21, startPage: 595, juzNumber: 30 },
  { number: 93, nameArabic: "الضحى", nameEnglish: "Ad-Duhaa", nameTranslation: "The Morning Hours", revelationType: "Meccan", totalAyahs: 11, startPage: 596, juzNumber: 30 },
  { number: 94, nameArabic: "الشرح", nameEnglish: "Ash-Sharh", nameTranslation: "The Relief", revelationType: "Meccan", totalAyahs: 8, startPage: 596, juzNumber: 30 },
  { number: 95, nameArabic: "التين", nameEnglish: "At-Tin", nameTranslation: "The Fig", revelationType: "Meccan", totalAyahs: 8, startPage: 597, juzNumber: 30 },
  { number: 96, nameArabic: "العلق", nameEnglish: "Al-'Alaq", nameTranslation: "The Clot", revelationType: "Meccan", totalAyahs: 19, startPage: 597, juzNumber: 30 },
  { number: 97, nameArabic: "القدر", nameEnglish: "Al-Qadr", nameTranslation: "The Power", revelationType: "Meccan", totalAyahs: 5, startPage: 598, juzNumber: 30 },
  { number: 98, nameArabic: "البينة", nameEnglish: "Al-Bayyinah", nameTranslation: "The Clear Proof", revelationType: "Medinan", totalAyahs: 8, startPage: 598, juzNumber: 30 },
  { number: 99, nameArabic: "الزلزلة", nameEnglish: "Az-Zalzalah", nameTranslation: "The Earthquake", revelationType: "Medinan", totalAyahs: 8, startPage: 599, juzNumber: 30 },
  { number: 100, nameArabic: "العاديات", nameEnglish: "Al-'Adiyat", nameTranslation: "The Courser", revelationType: "Meccan", totalAyahs: 11, startPage: 599, juzNumber: 30 },
  { number: 101, nameArabic: "القارعة", nameEnglish: "Al-Qari'ah", nameTranslation: "The Calamity", revelationType: "Meccan", totalAyahs: 11, startPage: 600, juzNumber: 30 },
  { number: 102, nameArabic: "التكاثر", nameEnglish: "At-Takathur", nameTranslation: "The Rivalry in world increase", revelationType: "Meccan", totalAyahs: 8, startPage: 600, juzNumber: 30 },
  { number: 103, nameArabic: "العصر", nameEnglish: "Al-'Asr", nameTranslation: "The Declining Day", revelationType: "Meccan", totalAyahs: 3, startPage: 601, juzNumber: 30 },
  { number: 104, nameArabic: "الهمزة", nameEnglish: "Al-Humazah", nameTranslation: "The Traducer", revelationType: "Meccan", totalAyahs: 9, startPage: 601, juzNumber: 30 },
  { number: 105, nameArabic: "الفيل", nameEnglish: "Al-Fil", nameTranslation: "The Elephant", revelationType: "Meccan", totalAyahs: 5, startPage: 601, juzNumber: 30 },
  { number: 106, nameArabic: "قريش", nameEnglish: "Quraysh", nameTranslation: "Quraysh", revelationType: "Meccan", totalAyahs: 4, startPage: 602, juzNumber: 30 },
  { number: 107, nameArabic: "الماعون", nameEnglish: "Al-Ma'un", nameTranslation: "The Small Kindnesses", revelationType: "Meccan", totalAyahs: 7, startPage: 602, juzNumber: 30 },
  { number: 108, nameArabic: "الكوثر", nameEnglish: "Al-Kawthar", nameTranslation: "The Abundance", revelationType: "Meccan", totalAyahs: 3, startPage: 602, juzNumber: 30 },
  { number: 109, nameArabic: "الكافرون", nameEnglish: "Al-Kafirun", nameTranslation: "The Disbelievers", revelationType: "Meccan", totalAyahs: 6, startPage: 603, juzNumber: 30 },
  { number: 110, nameArabic: "النصر", nameEnglish: "An-Nasr", nameTranslation: "The Divine Support", revelationType: "Medinan", totalAyahs: 3, startPage: 603, juzNumber: 30 },
  { number: 111, nameArabic: "المسد", nameEnglish: "Al-Masad", nameTranslation: "The Palm Fiber", revelationType: "Meccan", totalAyahs: 5, startPage: 603, juzNumber: 30 },
  { number: 112, nameArabic: "الإخلاص", nameEnglish: "Al-Ikhlas", nameTranslation: "The Sincerity", revelationType: "Meccan", totalAyahs: 4, startPage: 604, juzNumber: 30 },
  { number: 113, nameArabic: "الفلق", nameEnglish: "Al-Falaq", nameTranslation: "The Daybreak", revelationType: "Meccan", totalAyahs: 5, startPage: 604, juzNumber: 30 },
  { number: 114, nameArabic: "الناس", nameEnglish: "An-Nas", nameTranslation: "Mankind", revelationType: "Meccan", totalAyahs: 6, startPage: 604, juzNumber: 30 }
];

export const RECITERS_LIST: Reciter[] = [
  { 
    id: 'dossary', 
    name: 'Sheikh Yasser Al-Dossary', 
    arabicName: 'الشيخ ياسر الدوسري (إمام الحرم المكي)', 
    style: 'Murattal', 
    baseUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/' 
  },
  { 
    id: 'alafasy', 
    name: 'Mishary Rashid Alafasy', 
    arabicName: 'مشاري راشد العفاسي', 
    style: 'Murattal', 
    baseUrl: 'https://everyayah.com/data/Alafasy_128kbps/' 
  },
  { 
    id: 'husary', 
    name: 'Mahmoud Khalil Al-Husary', 
    arabicName: 'محمود خليل الحصري', 
    style: 'Muallim (Teacher)', 
    baseUrl: 'https://everyayah.com/data/Husary_128kbps/' 
  },
  { 
    id: 'muaiqly', 
    name: 'Sheikh Maher Al-Muaiqly', 
    arabicName: 'الشيخ ماهر المعيقلي', 
    style: 'Murattal', 
    baseUrl: 'https://everyayah.com/data/Maher_AlMuaiqly_64kbps/' 
  },
  { 
    id: 'ghamdi', 
    name: 'Sheikh Saad Al-Ghamdi', 
    arabicName: 'الشيخ سعد الغامدي', 
    style: 'Murattal', 
    baseUrl: 'https://everyayah.com/data/Ghamadi_40kbps/' 
  },
  { 
    id: 'abdulbasit', 
    name: 'Abdul Basit Abdul Samad', 
    arabicName: 'عبد الباسط عبد الصمد', 
    style: 'Mujawwad', 
    baseUrl: 'https://everyayah.com/data/AbdulSamad_64kbps_QuranExplorer.Com/' 
  },
  { 
    id: 'minshawi', 
    name: 'Mohamed Siddiq Al-Minshawi', 
    arabicName: 'محمد صديق المنشاوي', 
    style: 'Murattal', 
    baseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/' 
  }
];

export const INITIAL_AYAHS: Ayah[] = [
  // --- SURAH 1: AL-FATIHA (1:1 - 1:7) ---
  {
    id: "1:1",
    surahNumber: 1,
    ayahNumber: 1,
    juzNumber: 1,
    pageNumber: 1,
    textUthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    textSimple: "بسم الله الرحمن الرحيم",
    translationEnglish: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    transliteration: "Bismillāhir-raḥmānir-raḥīm",
    tafsir: {
      source: "Tafsir Ibn Kathir",
      text: "Basmalah begins with Allah's name. Ar-Rahman implies mercy extending to all creations, while Ar-Rahim refers especially to believers on the Day of Judgment."
    },
    words: [
      { position: 1, arabic: "بِسْمِ", transliteration: "Bismi", translation: "In the name", root: "سمو" },
      { position: 2, arabic: "ٱللَّهِ", transliteration: "Allāh", translation: "of Allah", root: "اله", tajweedRule: "tafkhim" },
      { position: 3, arabic: "ٱلرَّحْمَٰنِ", transliteration: "ar-Raḥmāni", translation: "the Entirely Merciful", root: "رحم", tajweedRule: "madd" },
      { position: 4, arabic: "ٱلرَّحِيمِ", transliteration: "ar-Raḥīm", translation: "the Especially Merciful", root: "رحم", tajweedRule: "madd" }
    ],
    tajweedTokens: [
      { text: "بِسْمِ", rule: "none" },
      { text: "ٱللَّهِ", rule: "tafkhim", explanation: "Lam Jalalah is pronounced heavy/tafkhim or tarqiq depending on preceding vowel." },
      { text: "ٱلرَّحْمَٰنِ", rule: "madd", explanation: "Madd Tabee'i on the dagger alif." },
      { text: "ٱلرَّحِيمِ", rule: "madd", explanation: "Madd 'Arid li-s-Sukoon when pausing (2, 4, or 6 harakat)." }
    ],
    audioUrl: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001001.mp3"
  },
  {
    id: "1:2",
    surahNumber: 1,
    ayahNumber: 2,
    juzNumber: 1,
    pageNumber: 1,
    textUthmani: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
    textSimple: "الحمد لله رب العالمين",
    translationEnglish: "[All] praise is [due] to Allah, Lord of the worlds -",
    transliteration: "Al-ḥamdu lillāhi Rabbil-'ālamīn",
    tafsir: {
      source: "Tafsir as-Sa'di",
      text: "All praise belongs solely to Allah, the Creator and Sustainer of all existence."
    },
    words: [
      { position: 1, arabic: "ٱلْحَمْدُ", transliteration: "Al-ḥamdu", translation: "[All] praise", root: "حمد" },
      { position: 2, arabic: "لِلَّهِ", transliteration: "lillāhi", translation: "[is due] to Allah", root: "اله", tajweedRule: "tarqiq" },
      { position: 3, arabic: "رَبِّ", transliteration: "Rabbi", translation: "Lord", root: "ربب", tajweedRule: "tafkhim" },
      { position: 4, arabic: "ٱلْعَٰلَمِينَ", transliteration: "al-'ālamīn", translation: "of the worlds", root: "علم", tajweedRule: "madd" }
    ],
    audioUrl: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001002.mp3"
  },
  {
    id: "1:3",
    surahNumber: 1,
    ayahNumber: 3,
    juzNumber: 1,
    pageNumber: 1,
    textUthmani: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    textSimple: "الرحمن الرحيم",
    translationEnglish: "The Entirely Merciful, the Especially Merciful,",
    transliteration: "Ar-Raḥmānir-Raḥīm",
    words: [
      { position: 1, arabic: "ٱلرَّحْمَٰنِ", transliteration: "Ar-Raḥmāni", translation: "The Entirely Merciful", root: "رحم" },
      { position: 2, arabic: "ٱلرَّحِيمِ", transliteration: "ar-Raḥīm", translation: "the Especially Merciful", root: "رحم", tajweedRule: "madd" }
    ],
    audioUrl: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001003.mp3"
  },
  {
    id: "1:4",
    surahNumber: 1,
    ayahNumber: 4,
    juzNumber: 1,
    pageNumber: 1,
    textUthmani: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
    textSimple: "مالك يوم الدين",
    translationEnglish: "Sovereign of the Day of Recompense.",
    transliteration: "Māliki Yawmid-Dīn",
    words: [
      { position: 1, arabic: "مَٰلِكِ", transliteration: "Māliki", translation: "Sovereign", root: "ملك", tajweedRule: "madd" },
      { position: 2, arabic: "يَوْمِ", transliteration: "Yawmi", translation: "[of the] Day", root: "يوم" },
      { position: 3, arabic: "ٱلدِّينِ", transliteration: "ad-Dīn", translation: "[of] Recompense", root: "دين", tajweedRule: "madd" }
    ],
    audioUrl: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001004.mp3"
  },
  {
    id: "1:5",
    surahNumber: 1,
    ayahNumber: 5,
    juzNumber: 1,
    pageNumber: 1,
    textUthmani: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    textSimple: "إياك نعبد وإياك نستعين",
    translationEnglish: "It is You we worship and You we ask for help.",
    transliteration: "Iyyāka na'budu wa iyyāka nasta'īn",
    words: [
      { position: 1, arabic: "إِيَّاكَ", transliteration: "Iyyāka", translation: "You alone", root: "ايي" },
      { position: 2, arabic: "نَعْبُدُ", transliteration: "na'budu", translation: "we worship", root: "عبد" },
      { position: 3, arabic: "وَإِيَّاكَ", transliteration: "wa iyyāka", translation: "and You alone", root: "ايي" },
      { position: 4, arabic: "نَسْتَعِينُ", transliteration: "nasta'īn", translation: "we ask for help", root: "عون", tajweedRule: "madd" }
    ],
    audioUrl: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001005.mp3"
  },
  {
    id: "1:6",
    surahNumber: 1,
    ayahNumber: 6,
    juzNumber: 1,
    pageNumber: 1,
    textUthmani: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
    textSimple: "اهدنا الصراط المستقيم",
    translationEnglish: "Guide us to the straight path -",
    transliteration: "Ihdinaṣ-ṣirāṭal-mustaqīm",
    words: [
      { position: 1, arabic: "ٱهْدِنَا", transliteration: "Ihdinā", translation: "Guide us", root: "هدي" },
      { position: 2, arabic: "ٱلصِّرَٰطَ", transliteration: "aṣ-ṣirāṭa", translation: "[to] the path", root: "صرط", tajweedRule: "tafkhim" },
      { position: 3, arabic: "ٱلْمُسْتَقِيمَ", transliteration: "al-mustaqīm", translation: "the straight", root: "قوم", tajweedRule: "madd" }
    ],
    audioUrl: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001006.mp3"
  },
  {
    id: "1:7",
    surahNumber: 1,
    ayahNumber: 7,
    juzNumber: 1,
    pageNumber: 1,
    textUthmani: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
    textSimple: "صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين",
    translationEnglish: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
    transliteration: "Ṣirāṭal-ladhīna an'amta 'alayhim ghayril-maghḍūbi 'alayhim wa laḍ-ḍāllīn",
    words: [
      { position: 1, arabic: "صِرَٰطَ", transliteration: "Ṣirāṭa", translation: "The path", root: "صرط", tajweedRule: "tafkhim" },
      { position: 2, arabic: "ٱلَّذِينَ", transliteration: "al-ladhīna", translation: "[of] those", root: "لذ" },
      { position: 3, arabic: "أَنْعَمْتَ", transliteration: "an'amta", translation: "You bestowed favor", root: "نعم" },
      { position: 4, arabic: "عَلَيْهِمْ", transliteration: "'alayhim", translation: "upon them", root: "علي" },
      { position: 5, arabic: "غَيْرِ", transliteration: "ghayri", translation: "not [of]", root: "غير" },
      { position: 6, arabic: "ٱلْمَغْضُوبِ", transliteration: "al-maghḍūbi", translation: "those who evoked anger", root: "غضب", tajweedRule: "tafkhim" },
      { position: 7, arabic: "عَلَيْهِمْ", transliteration: "'alayhim", translation: "upon them", root: "علي" },
      { position: 8, arabic: "وَلَا", transliteration: "wa lā", translation: "and not", root: "لا" },
      { position: 9, arabic: "ٱلضَّآلِّينَ", transliteration: "aḍ-ḍāllīn", translation: "those who are astray", root: "ضلل", tajweedRule: "madd" }
    ],
    audioUrl: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001007.mp3"
  },

  // --- SURAH 112: AL-IKHLAS ---
  {
    id: "112:1",
    surahNumber: 112,
    ayahNumber: 1,
    juzNumber: 30,
    pageNumber: 604,
    textUthmani: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
    textSimple: "قل هو الله أحد",
    translationEnglish: "Say, \"He is Allah, [who is] One,",
    transliteration: "Qul huwa-Llāhu Aḥad",
    words: [
      { position: 1, arabic: "قُلْ", transliteration: "Qul", translation: "Say", root: "قول", tajweedRule: "tafkhim" },
      { position: 2, arabic: "هُوَ", transliteration: "huwa", translation: "He is", root: "هو" },
      { position: 3, arabic: "ٱللَّهُ", transliteration: "Allāhu", translation: "Allah", root: "اله", tajweedRule: "tafkhim" },
      { position: 4, arabic: "أَحَدٌ", transliteration: "Aḥad", translation: "[who is] One", root: "احد", tajweedRule: "qalqalah" }
    ],
    audioUrl: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/112001.mp3"
  },
  {
    id: "112:2",
    surahNumber: 112,
    ayahNumber: 2,
    juzNumber: 30,
    pageNumber: 604,
    textUthmani: "ٱللَّهُ ٱلصَّمَدُ",
    textSimple: "الله الصمد",
    translationEnglish: "Allah, the Eternal Refuge.",
    transliteration: "Allāhuṣ-Ṣamad",
    words: [
      { position: 1, arabic: "ٱللَّهُ", transliteration: "Allāhu", translation: "Allah", root: "اله", tajweedRule: "tafkhim" },
      { position: 2, arabic: "ٱلصَّمَدُ", transliteration: "aṣ-Ṣamad", translation: "the Eternal Refuge", root: "صمد", tajweedRule: "qalqalah" }
    ],
    audioUrl: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/112002.mp3"
  },
  {
    id: "112:3",
    surahNumber: 112,
    ayahNumber: 3,
    juzNumber: 30,
    pageNumber: 604,
    textUthmani: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    textSimple: "لم يلد ولم يولد",
    translationEnglish: "He neither begets nor is born,",
    transliteration: "Lam yalid wa lam yūlad",
    words: [
      { position: 1, arabic: "لَمْ", transliteration: "Lam", translation: "Not", root: "لم" },
      { position: 2, arabic: "يَلِدْ", transliteration: "yalid", translation: "He begets", root: "ولد", tajweedRule: "qalqalah" },
      { position: 3, arabic: "وَلَمْ", transliteration: "wa lam", translation: "and not", root: "لم" },
      { position: 4, arabic: "يُولَدْ", transliteration: "yūlad", translation: "He is born", root: "ولد", tajweedRule: "qalqalah" }
    ],
    audioUrl: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/112003.mp3"
  },
  {
    id: "112:4",
    surahNumber: 112,
    ayahNumber: 4,
    juzNumber: 30,
    pageNumber: 604,
    textUthmani: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
    textSimple: "ولم يكن له كفوا أحد",
    translationEnglish: "Nor is there to Him any equivalent.\"",
    transliteration: "Wa lam yakul-lahū kufuwan aḥad",
    words: [
      { position: 1, arabic: "وَلَمْ", transliteration: "Wa lam", translation: "And not", root: "لم" },
      { position: 2, arabic: "يَكُن", transliteration: "yakul", translation: "is there", root: "كون", tajweedRule: "idgham" },
      { position: 3, arabic: "لَّهُۥ", transliteration: "lahū", translation: "to Him", root: "له" },
      { position: 4, arabic: "كُفُوًا", transliteration: "kufuwan", translation: "an equivalent", root: "كفو" },
      { position: 5, arabic: "أَحَدٌۢ", transliteration: "aḥad", translation: "anyone", root: "احد", tajweedRule: "qalqalah" }
    ],
    audioUrl: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/112004.mp3"
  }
];
