import React from 'react';
import { X, StickyNote } from 'lucide-react';

export default function ViewNoteModal({ note, onClose }) {
  if (!note) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400">
              <StickyNote className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Private Note</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
          <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {note}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
