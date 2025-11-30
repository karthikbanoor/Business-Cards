import React from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

export default function IOSInstallModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Install CardVault
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Install this app on your iPhone or iPad for the best experience.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 text-left">
            <div className="flex-none p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <Share className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Step 1</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap the <span className="font-bold">Share</span> button in the menu bar.
              </p>
            </div>
          </div>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-auto ml-5"></div>

          <div className="flex items-start gap-4 text-left">
            <div className="flex-none p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <PlusSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Step 2</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scroll down and tap <span className="font-bold">Add to Home Screen</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
