import { HifzItem } from '../../types/quran';

export type StrengthCategory = 'New' | 'Weak' | 'Developing' | 'Stable' | 'Strong' | 'Excellent';

export function getStrengthCategory(strength: number): StrengthCategory {
  if (strength <= 20) return 'New';
  if (strength <= 40) return 'Weak';
  if (strength <= 60) return 'Developing';
  if (strength <= 80) return 'Stable';
  if (strength <= 95) return 'Strong';
  return 'Excellent';
}

export function getStrengthColor(strength: number): string {
  if (strength <= 20) return 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300';
  if (strength <= 40) return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
  if (strength <= 60) return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
  if (strength <= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (strength <= 95) return 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300';
  return 'bg-quran-gold-500/20 text-quran-gold-700 dark:bg-quran-gold-500/10 dark:text-quran-gold-400 border border-quran-gold-500/30';
}

/**
 * Computes updated SuperMemo-2 spaced repetition state for an Ayah.
 * @param item Existing Hifz item
 * @param grade Performance rating 0 - 5
 */
export function calculateNextReview(item: HifzItem, grade: number): HifzItem {
  let { repetitions, intervalDays, easeFactor, strength } = item;

  // Grade < 3 means failed recall / mistake made
  if (grade < 3) {
    repetitions = 0;
    intervalDays = 1;
    // Lower strength
    strength = Math.max(10, strength - 25);
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 4;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
    // Increase strength based on grade
    const strengthGain = grade === 5 ? 18 : grade === 4 ? 12 : 6;
    strength = Math.min(100, strength + strengthGain);
  }

  // Update Ease Factor (EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)))
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const now = new Date();
  const nextDueDate = new Date(now.getTime() + intervalDays * 86400000).toISOString();

  const updatedHistory = [
    ...(item.history || []),
    {
      date: now.toISOString(),
      grade,
      accuracyScore: Math.round((grade / 5) * 100)
    }
  ];

  return {
    ...item,
    repetitions,
    intervalDays,
    easeFactor: Math.round(easeFactor * 100) / 100,
    lastReviewedDate: now.toISOString(),
    nextDueDate,
    strength,
    history: updatedHistory
  };
}
