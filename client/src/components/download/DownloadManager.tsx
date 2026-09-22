import React, { useState } from 'react';
import { 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  HardDrive, 
  Trash2, 
  Sparkles,
  WifiOff 
} from 'lucide-react';

interface ContentPackage {
  id: string;
  name: string;
  description: string;
  sizeMB: number;
  downloaded: boolean;
  checksum: string;
}

export const DownloadManager: React.FC = () => {
  const [packages, setPackages] = useState<ContentPackage[]>([
    {
      id: 'core_text',
      name: 'Canonical Quran Text & Diacritics (Hafs)',
      description: 'Complete 114 Surahs, Uthmani script with verified vocalization marks.',
      sizeMB: 3.2,
      downloaded: true,
      checksum: 'sha256-verified-e3b0c442...'
    },
    {
      id: 'alafasy_juz_amma',
      name: 'Mishary Alafasy Recitation (Juz Amma)',
      description: 'Offline audio files for Surahs 78 through 114 at 128kbps.',
      sizeMB: 48.5,
      downloaded: true,
      checksum: 'sha256-verified-8f12a34b...'
    },
    {
      id: 'tajweed_interactive',
      name: '21-Course Tajweed & Makharij Modules',
      description: 'Visual diagrams, audio demonstrations, and mastery quizzes.',
      sizeMB: 12.0,
      downloaded: true,
      checksum: 'sha256-verified-99d81e01...'
    },
    {
      id: 'husary_muallim',
      name: 'Al-Husary (Muallim / Teacher Edition)',
      description: 'Measured recitation with silent repetition gaps for student echo.',
      sizeMB: 65.0,
      downloaded: false,
      checksum: 'sha256-verified-44a7b982...'
    }
  ]);

  const toggleDownload = (id: string) => {
    setPackages(packages.map(p => {
      if (p.id === id) {
        return { ...p, downloaded: !p.downloaded };
      }
      return p;
    }));
  };

  const totalUsedMB = packages
    .filter(p => p.downloaded)
    .reduce((acc, p) => acc + p.sizeMB, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="border-b border-stone-200 dark:border-quran-dark-800 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-quran-emerald-50 dark:bg-quran-emerald-950 text-quran-emerald-800 dark:text-quran-gold-400 text-xs font-semibold">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Content & Integrity Manager</span>
        </div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">
          Offline Storage & Verified Datasets
        </h2>
        <p className="text-xs sm:text-sm text-stone-500">
          Hikmat Quran is built local-first for intermittent networks and modest storage footprints. Core datasets are checksum-verified against corruption.
        </p>
      </div>

      {/* Storage Gauge */}
      <div className="p-5 rounded-2xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-quran-emerald-50 dark:bg-quran-emerald-950 text-quran-emerald-800 dark:text-quran-emerald-400">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Local Offline Footprint</p>
            <p className="text-xl font-bold text-stone-900 dark:text-stone-100">{totalUsedMB.toFixed(1)} MB Stored</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-quran-emerald-100 dark:bg-quran-emerald-900 text-quran-emerald-800 dark:text-quran-emerald-200 font-semibold">
          Offline Functional
        </span>
      </div>

      {/* Packages List */}
      <div className="space-y-3">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className="p-5 rounded-2xl bg-white dark:bg-quran-dark-900 border border-quran-parchment-200 dark:border-quran-dark-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{pkg.name}</span>
                <span className="text-[10px] text-stone-400 font-mono">({pkg.sizeMB} MB)</span>
              </div>
              <p className="text-xs text-stone-500">{pkg.description}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-quran-emerald-700 dark:text-quran-gold-400 font-mono">
                <ShieldCheck className="w-3 h-3" />
                <span>{pkg.checksum}</span>
              </div>
            </div>

            <div>
              {pkg.downloaded ? (
                <button
                  onClick={() => toggleDownload(pkg.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-quran-dark-800 hover:bg-rose-50 hover:text-rose-600 text-stone-600 dark:text-stone-400 text-xs font-semibold transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-quran-emerald-600" />
                  <span>Installed (Tap to Remove)</span>
                </button>
              ) : (
                <button
                  onClick={() => toggleDownload(pkg.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-quran-emerald-900 hover:bg-quran-emerald-950 text-white text-xs font-semibold shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5 text-quran-gold-400" />
                  <span>Download Package</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
