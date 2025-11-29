import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import UploadScanner from './UploadScanner';
import Auth from './Auth';
import { Building2, Mail, Phone, MapPin, Globe, User, LogOut, Trash2, Plus, ScanLine, Search, LayoutGrid, Moon, Sun, X, Linkedin, Calendar, List, Tag, Download } from 'lucide-react';
import ManualEntryForm from './ManualEntryForm';
import EditCardForm from './EditCardForm';
import ExportButton from './ExportButton';
import QRCodeGenerator from './QRCodeGenerator';
import Sidebar from './Sidebar';
import CreateFolderModal from './CreateFolderModal';
import MoveCardModal from './MoveCardModal';
import { FolderInput, Share2, Menu } from 'lucide-react'; // Added Share2 for later
import ViewNoteModal from './ViewNoteModal';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const [cards, setCards] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeView, setActiveView] = useState('all'); // 'all' or 'folder'
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [movingCard, setMovingCard] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [showQRCode, setShowQRCode] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchCards();
    } else {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCards([]);
  };

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('name');
      
      if (error) throw error;

      // Deduplicate folders by name (case-insensitive)
      const uniqueFolders = [];
      const seenFolderNames = new Set();

      (data || []).forEach(folder => {
        const normalizedName = folder.name.toLowerCase().trim();
        if (!seenFolderNames.has(normalizedName)) {
          seenFolderNames.add(normalizedName);
          uniqueFolders.push(folder);
        }
      });

      setFolders(uniqueFolders);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchCards = async () => {
    try {
      let query = supabase
        .from('business_cards')
        .select('*')
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (activeView === 'folder' && selectedFolder) {
        query = query.eq('folder_id', selectedFolder.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setCards(data || []);
      
      // Extract unique tags
      // Extract unique tags (case-insensitive)
      const tagsMap = new Map();
      (data || []).forEach(card => {
        if (card.tags && Array.isArray(card.tags)) {
          card.tags.forEach(tag => {
            const normalizedTag = tag.toLowerCase().trim();
            // Store the first variation found, or prefer Title Case if we wanted to be fancy
            if (!tagsMap.has(normalizedTag)) {
              // Capitalize first letter for display consistency
              const displayTag = tag.charAt(0).toUpperCase() + tag.slice(1);
              tagsMap.set(normalizedTag, displayTag);
            }
          });
        }
      });
      setAllTags(Array.from(tagsMap.values()).sort());
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch cards when view changes
  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [activeView, selectedFolder]);

  const handleDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      const { error } = await supabase
        .from('business_cards')
        .delete()
        .eq('id', deleteConfirmation);

      if (error) throw error;

      setCards(cards.filter(c => c.id !== deleteConfirmation));
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card');
    }
  };

  const handleToggleFavorite = async (card) => {
    try {
      const { error } = await supabase
        .from('business_cards')
        .update({ is_favorite: !card.is_favorite })
        .eq('id', card.id);

      if (error) throw error;

      setCards(cards.map(c => 
        c.id === card.id ? { ...c, is_favorite: !c.is_favorite } : c
      ).sort((a, b) => {
        // Sort by favorite then date
        if (a.is_favorite === b.is_favorite) {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        return b.is_favorite ? 1 : -1;
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShareFolder = async () => {
    if (!selectedFolder?.share_token) return;
    const link = `${window.location.origin}/share/folder/${selectedFolder.share_token}`;
    await navigator.clipboard.writeText(link);
    alert('Folder link copied to clipboard!');
  };

  const handleShareCard = async (card) => {
    if (!card.share_token) return;
    const link = `${window.location.origin}/share/card/${card.share_token}`;
    await navigator.clipboard.writeText(link);
    alert('Card link copied to clipboard!');
  };

  const filteredCards = cards.filter(card => {
    if (selectedTag) {
        if (!card.tags || !card.tags.includes(selectedTag)) return false;
    }

    const data = card.extracted_data;
    const search = searchTerm.toLowerCase();
    return (
      (data.Name && data.Name.toLowerCase().includes(search)) ||
      (data["Company Name"] && data["Company Name"].toLowerCase().includes(search)) ||
      (data["Job Title"] && data["Job Title"].toLowerCase().includes(search)) ||
      (card.tags && card.tags.some(tag => tag.toLowerCase().includes(search)))
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCards = filteredCards.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag, viewMode]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading Vault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white transition-colors duration-300 flex">
      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        folders={folders}
        setFolders={setFolders}
        onCreateFolder={() => setShowCreateFolder(true)}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isDesktopOpen={isDesktopSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Glassmorphic Header */}
        <header className="flex-none w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Title / Breadcrumbs */}
              <div className="flex items-center gap-2">
                <button
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setIsMobileMenuOpen(true);
                      } else {
                        setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
                      }
                    }}
                    className="p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeView === 'all' ? 'All Cards' : selectedFolder?.name}
                </h1>
                {activeView === 'folder' && selectedFolder && (
                  <button
                    onClick={handleShareFolder}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Share Folder"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.email}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Administrator</span>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Toolbar - Fixed Position */}
        {/* Toolbar - Fixed Position */}
        <div className="flex-none w-full bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-800/60 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-lg">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      title="Grid View"
                  >
                      <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      title="List View"
                  >
                      <List className="w-4 h-4" />
                  </button>
              </div>
              <span className="hidden sm:inline">My Cards</span> 
              <span className="text-slate-400 dark:text-slate-500 font-normal text-sm">({filteredCards.length})</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search contacts..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all shadow-sm"
                />
              </div>
              <button
                onClick={() => setShowManualEntry(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-slate-200 dark:shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New</span>
              </button>
            </div>
          </div>
        </div>

      <main className="flex-1 overflow-y-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        
        {/* Hero Section / Scanner */}
        <section className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 pointer-events-none"></div>
          <div className="relative p-8 md:p-10">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">Digitalize Your Network</h2>
              <p className="text-slate-500 dark:text-slate-400">Scan business cards instantly with AI-powered extraction. Keep your contacts organized and accessible.</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <UploadScanner onScanComplete={fetchCards} />
            </div>
          </div>
        </section>




        {/* Tags Filter */}
        {allTags.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
                <button
                    onClick={() => setSelectedTag(null)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                        selectedTag === null 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                >
                    All
                </button>
                {allTags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                            selectedTag === tag 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        )}

        {currentCards.length > 0 ? (
          <>
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
              {currentCards.map(card => {
                const data = card.extracted_data || {};
                
                if (viewMode === 'list') {
                  return (
                    <div key={card.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all flex items-center gap-4 group">
                        <div 
                            className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden flex-shrink-0 cursor-pointer"
                            onClick={() => card.image_url && setSelectedImage(card.image_url)}
                        >
                            {card.image_url ? (
                                <img src={card.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <User className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white truncate">{data.Name || 'Unknown Name'}</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400 truncate">{data["Job Title"]}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{data["Company Name"]}</p>
                        </div>

                        <div className="hidden md:block w-1/4">
                             <p className="text-sm text-slate-500 truncate">{data.Email}</p>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setEditingCard(card)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><Plus className="w-4 h-4 rotate-45" /></button>
                            <ExportButton card={card} />
                        </div>
                    </div>
                  );
                }
                
                return (
                  <div key={card.id} className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 transition-all duration-300 flex flex-col h-full">
                  {/* Card Image Area */}
                  <div 
                    className="relative h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden border-b border-slate-100 dark:border-slate-700 group-hover:h-52 transition-all duration-300 cursor-pointer"
                    onClick={() => card.image_url && setSelectedImage(card.image_url)}
                  >
                    {card.image_url ? (
                      <img 
                        src={card.image_url} 
                        alt="Business Card" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600">
                        <User className="w-12 h-12 mb-2" />
                        <span className="text-xs font-medium uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                    
                    {/* Overlay Actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0" onClick={(e) => e.stopPropagation()}>
                       <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmation(card.id);
                          }}
                          className="p-2.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
                          title="Delete Card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Favorite Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(card);
                        }}
                        className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                            card.is_favorite 
                                ? 'bg-yellow-400 text-white shadow-lg scale-110' 
                                : 'bg-white/30 text-white hover:bg-white/50'
                        }`}
                        title={card.is_favorite ? "Unfavorite" : "Favorite"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={card.is_favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </button>

                    {/* QR Code Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowQRCode(card);
                        }}
                        className="absolute bottom-3 right-3 p-2 bg-white/30 text-white hover:bg-white/50 rounded-full backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                        title="Share via QR Code"
                    >
                        <ScanLine className="w-5 h-5" />
                    </button>
                  </div>

                    <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{data.Name || 'Unknown Name'}</h3>
                            <p className="text-blue-600 dark:text-blue-400 font-medium text-sm line-clamp-1">{data["Job Title"]}</p>
                        </div>
                        {card.tags && card.tags.length > 0 && (
                            <div className="flex flex-wrap justify-end gap-1 max-w-[40%]">
                                {card.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md truncate max-w-full">
                                        {tag}
                                    </span>
                                ))}
                                {card.tags.length > 2 && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md">
                                        +{card.tags.length - 2}
                                    </span>
                                )}
                            </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 flex-1">
                      {data["Company Name"] && (
                        <div className="flex items-center gap-3 group/item">
                          <div className="p-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400 group-hover/item:bg-blue-50 dark:group-hover/item:bg-blue-900/20 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors shrink-0">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1">{data["Company Name"]}</span>
                        </div>
                      )}
                      {data.Email && (
                        <div className="flex items-center gap-3 group/item">
                          <div className="p-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400 group-hover/item:bg-blue-50 dark:group-hover/item:bg-blue-900/20 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors shrink-0">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <a href={`mailto:${data.Email}`} className="hover:text-blue-600 dark:hover:text-blue-400 truncate transition-colors">{data.Email}</a>
                        </div>
                      )}
                      {data.Phone && (
                        <div className="flex items-center gap-3 group/item">
                          <div className="p-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400 group-hover/item:bg-blue-50 dark:group-hover/item:bg-blue-900/20 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors shrink-0">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <span>{data.Phone}</span>
                        </div>
                      )}
                      {data.Website && (
                        <div className="flex items-center gap-3 group/item">
                          <div className="p-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400 group-hover/item:bg-blue-50 dark:group-hover/item:bg-blue-900/20 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors shrink-0">
                            <Globe className="w-3.5 h-3.5" />
                          </div>
                          <a href={data.Website.startsWith('http') ? data.Website : `https://${data.Website}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 truncate transition-colors">
                            {data.Website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      {data.Address && (
                        <div className="flex items-start gap-3 group/item">
                          <div className="p-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400 group-hover/item:bg-blue-50 dark:group-hover/item:bg-blue-900/20 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors shrink-0 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.Address)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="line-clamp-2 text-xs leading-relaxed hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {data.Address}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {/* Notes & Actions */}
                    {/* Notes & Actions */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                        {card.notes && (
                            <div 
                                onClick={() => setViewingNote(card.notes)}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group/note"
                                title="Click to view full note"
                            >
                                <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-3 group-hover/note:text-slate-700 dark:group-hover/note:text-slate-300">
                                    "{card.notes}"
                                </p>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 w-full">
                            {/* <a
                                href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(`${data.Name} ${data["Company Name"] || ''}`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Search on LinkedIn"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a> */}
                            <a
                                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting with ${encodeURIComponent(data.Name)}&details=Follow up with ${encodeURIComponent(data.Name)} from ${encodeURIComponent(data["Company Name"] || '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Schedule Follow-up"
                            >
                                <Calendar className="w-4 h-4" />
                            </a>
                            <ExportButton card={card} />
                            <button
                                onClick={() => setMovingCard(card)}
                                className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Move to Folder"
                            >
                                <FolderInput className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleShareCard(card)}
                                className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Share Card"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setEditingCard(card)}
                                className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed transition-colors duration-300">
            <div className="bg-slate-50 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No cards found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchTerm ? `No results found for "${searchTerm}"` : "Get started by scanning a business card or adding one manually."}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-6 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </main>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <ManualEntryForm 
            onClose={() => setShowManualEntry(false)} 
            onSaveComplete={fetchCards} 
        />
      )}

      {/* Edit Card Modal */}
      {editingCard && (
        <EditCardForm 
            card={editingCard}
            onClose={() => setEditingCard(null)} 
            onUpdateComplete={fetchCards} 
        />
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <QRCodeGenerator 
            card={showQRCode}
            onClose={() => setShowQRCode(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100 ring-1 ring-slate-900/5 dark:ring-white/10">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Trash2 className="w-7 h-7 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">Delete Card?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-center text-sm leading-relaxed">Are you sure you want to delete this business card? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-colors shadow-lg shadow-red-200 dark:shadow-red-900/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={selectedImage} 
            alt="Full size business card" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
      {/* Create Folder Modal */}
      {showCreateFolder && (
        <CreateFolderModal
          onClose={() => setShowCreateFolder(false)}
          onCreateComplete={fetchFolders}
        />
      )}
      
      {/* Move Card Modal */}
      {movingCard && (
        <MoveCardModal
          card={movingCard}
          folders={folders}
          onClose={() => setMovingCard(null)}
          onMoveComplete={() => {
            fetchCards();
            setMovingCard(null);
          }}
        />
      )}

      {/* View Note Modal */}
      {viewingNote && (
        <ViewNoteModal
          note={viewingNote}
          onClose={() => setViewingNote(null)}
        />
      )}
    </div>
    </div>
  );
}
