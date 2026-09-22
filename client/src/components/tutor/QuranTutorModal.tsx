import React, { useState } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  ShieldAlert, 
  X, 
  BookOpen, 
  Send, 
  ChevronRight,
  ShieldCheck 
} from 'lucide-react';

interface TutorMessage {
  sender: 'user' | 'tutor';
  text: string;
  sourceAttribution?: string;
}

interface QuranTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuranTutorModal: React.FC<QuranTutorModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      sender: 'tutor',
      text: 'Assalamu Alaikum! I am your Quran Study Companion. I can assist with Tajweed explanations, vocabulary roots, and memorization tips grounded strictly in verified sources.',
      sourceAttribution: 'Classical Tajweed & Tafsir Exegesis'
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');

  if (!isOpen) return null;

  const quickPrompts = [
    "What is the difference between Ar-Rahman and Ar-Rahim?",
    "Why are there 5 letters of Qalqalah?",
    "How does the Spaced Repetition (Hifz) scheduler work?",
    "What is the difference between Qaf and Kaf?"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: TutorMessage = { sender: 'user', text };
    let tutorReply: TutorMessage = {
      sender: 'tutor',
      text: 'Please consult a verified Tafsir or a qualified teacher for this specific query.',
      sourceAttribution: 'Scholarly Advisory'
    };

    const lower = text.toLowerCase();
    if (lower.includes('rahman') || lower.includes('rahim')) {
      tutorReply = {
        sender: 'tutor',
        text: 'Linguistically, Ar-Raḥmān denotes vast, encompassing mercy extending to all creations in this world. Ar-Raḥīm denotes continuous, especially bestowed mercy for the believers in the hereafter. Both derive from the root R-Ḥ-M (رحم).',
        sourceAttribution: 'Tafsir Ibn Kathir (Surah Al-Fatihah, 1:1)'
      };
    } else if (lower.includes('qalqalah')) {
      tutorReply = {
        sender: 'tutor',
        text: 'Qalqalah (قلقلة) occurs exclusively on the 5 letters of "Qutb Jad" (ق, ط, ب, ج, د) because their articulation possesses both Shiddah (complete stoppage of sound) and Jahr (stoppage of breath). When in a state of Sukoon, the vocal tract snaps open to prevent phonetic choking, producing the characteristic echo.',
        sourceAttribution: 'Al-Jazariyyah (Tajweed Science)'
      };
    } else if (lower.includes('spaced repetition') || lower.includes('hifz') || lower.includes('scheduler')) {
      tutorReply = {
        sender: 'tutor',
        text: 'Our Hifz coach adapts the SuperMemo-2 algorithm specifically for Quran memorization. Instead of simple calendar intervals, ayahs with repeat pronunciation or substitution mistakes are scheduled for immediate next-day drills, while fluent ayahs expand across increasing intervals (1, 4, 10, 24 days).',
        sourceAttribution: 'Hikmat Quran Adaptive Hifz Engine'
      };
    } else if (lower.includes('qaf') || lower.includes('kaf')) {
      tutorReply = {
        sender: 'tutor',
        text: 'Qaf (ق) articulates from the extreme back of the tongue hitting the soft palate with heavy elevation (Isti’la). Kaf (ك) articulates slightly lower hitting the hard/soft palate with air release (Hams). You can practice their acoustic contrast in the Makharij module.',
        sourceAttribution: 'Makharij al-Huruf (Imam Ibn al-Jazari)'
      };
    }

    setMessages(prev => [...prev, userMsg, tutorReply]);
    setInputQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-quran-dark-900 rounded-3xl p-6 shadow-2xl border border-quran-gold-500/30 space-y-4 animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
        {/* Tutor Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-quran-dark-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-quran-emerald-950 to-quran-emerald-900 p-1 flex items-center justify-center border border-quran-gold-500/40 shadow-sm overflow-hidden">
              <img src="/logo.png" alt="Hikmat Quran" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Quran Study Companion
              </h3>
              <p className="text-[11px] text-quran-emerald-700 dark:text-quran-gold-400 font-medium">
                Grounded in Verified Tajweed & Tafsir Manuscripts
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scholarly Boundary Banner */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Strict Religious Safeguard: This AI companion never generates legal fatwas or fabricates Quranic text. For formal rulings, consult a qualified scholar.
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-quran-emerald-900 text-white dark:bg-quran-emerald-800 dark:text-quran-gold-300 rounded-br-none'
                    : 'bg-stone-100 dark:bg-quran-dark-950 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-quran-dark-800 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              {m.sourceAttribution && (
                <span className="text-[10px] text-stone-400 font-mono mt-1 px-1">
                  Source: {m.sourceAttribution}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Quick Suggested Queries */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-[11px]">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-quran-dark-800 hover:bg-stone-200 dark:hover:bg-quran-dark-700 text-stone-600 dark:text-stone-300 whitespace-nowrap transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-quran-dark-800">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend(inputQuery);
            }}
            placeholder="Ask about Tajweed rules, roots, or vocabulary..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-quran-dark-950 border border-stone-200 dark:border-quran-dark-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-quran-gold-500"
          />
          <button
            onClick={() => handleSend(inputQuery)}
            className="p-2.5 rounded-xl bg-quran-emerald-900 hover:bg-quran-emerald-950 text-quran-gold-400 shadow-sm transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
