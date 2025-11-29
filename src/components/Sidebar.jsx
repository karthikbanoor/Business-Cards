import React, { useState, useEffect } from 'react';
import { LayoutGrid, Folder, Plus, ChevronRight, ChevronDown, Settings, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Sidebar({ activeView, setActiveView, selectedFolder, setSelectedFolder, folders, setFolders, onCreateFolder, isOpen, onClose, isDesktopOpen = true }) {
  const [isFoldersExpanded, setIsFoldersExpanded] = useState(true);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 h-screen border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out
        md:static md:h-screen md:sticky md:top-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isDesktopOpen ? 'md:w-64 md:translate-x-0' : 'md:w-0 md:-translate-x-full md:overflow-hidden md:border-r-0'}
      `}>
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              CardVault
            </h1>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => {
              setActiveView('all');
              setSelectedFolder(null);
              onClose?.(); // Close sidebar on mobile when item selected
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'all'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            All Cards
          </button>

          {/* Folders Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <button
                onClick={() => setIsFoldersExpanded(!isFoldersExpanded)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300"
              >
                {isFoldersExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Folders
              </button>
              <button
                onClick={onCreateFolder}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-600 transition-colors"
                title="New Folder"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {isFoldersExpanded && (
              <div className="space-y-1">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setActiveView('folder');
                      setSelectedFolder(folder);
                      onClose?.();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeView === 'folder' && selectedFolder?.id === folder.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Folder className="w-4 h-4" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                ))}
                {folders.length === 0 && (
                  <p className="px-3 text-xs text-slate-400 italic">No folders yet</p>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* User Profile / Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>
    </>
  );
}
