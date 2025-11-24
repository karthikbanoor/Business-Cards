import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import UploadScanner from './UploadScanner';
import Auth from './Auth';
import { Building2, Mail, Phone, MapPin, Globe, User, LogOut, Trash2, Plus, ScanLine, Search, LayoutGrid, Moon, Sun, X } from 'lucide-react';
import ManualEntryForm from './ManualEntryForm';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    checkUser();
  }, []);

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

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('business_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredCards = cards.filter(card => {
    const data = card.extracted_data;
    const search = searchTerm.toLowerCase();
    return (
      data.Name?.toLowerCase().includes(search) ||
      data["Company Name"]?.toLowerCase().includes(search) ||
      data["Job Title"]?.toLowerCase().includes(search)
    );
  });

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white transition-colors duration-300">
      {/* Glassmorphic Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                <ScanLine className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">CardVault</h1>
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Enterprise</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
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

        {/* Toolbar */}
        <div className="sticky top-20 z-30 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-4 -mx-4 px-4 sm:mx-0 sm:px-0 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/60 sm:border-none transition-colors duration-300">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-lg">
            <LayoutGrid className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3>My Cards <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">({filteredCards.length})</span></h3>
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

        {/* Cards Grid */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredCards.map((card) => {
              const data = card.extracted_data;
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
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{data.Name || 'Unknown Name'}</h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium text-sm line-clamp-1">{data["Job Title"]}</p>
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
                          <span className="line-clamp-2 text-xs leading-relaxed">{data.Address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
    </div>
  );
}
