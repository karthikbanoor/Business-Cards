import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Building2, Mail, Phone, MapPin, Globe, User, LayoutGrid, Download } from 'lucide-react';
import ExportButton from './ExportButton';

export default function SharedFolderView() {
  const { token } = useParams();
  const [folder, setFolder] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFolderData();
  }, [token]);

  const fetchFolderData = async () => {
    try {
      // Fetch folder details
      const { data: folderData, error: folderError } = await supabase
        .rpc('get_shared_folder', { token });
      
      if (folderError) throw folderError;
      if (!folderData || folderData.length === 0) throw new Error('Folder not found');
      
      setFolder(folderData[0]);

      // Fetch cards
      const { data: cardsData, error: cardsError } = await supabase
        .rpc('get_folder_cards', { token });

      if (cardsError) throw cardsError;
      setCards(cardsData || []);
    } catch (error) {
      console.error('Error fetching shared folder:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Folder Not Found</h1>
          <p className="text-slate-500">The link might be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">{folder.name}</h1>
          </div>
          <div className="text-sm text-slate-500">
            Shared via CardVault
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map(card => {
            const data = card.extracted_data || {};
            return (
              <div key={card.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
                <div className="h-48 bg-slate-100 overflow-hidden border-b border-slate-100">
                  {card.image_url ? (
                    <img src={card.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <User className="w-12 h-12 mb-2" />
                      <span className="text-xs font-medium uppercase tracking-widest">No Image</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{data.Name || 'Unknown Name'}</h3>
                    <p className="text-blue-600 font-medium text-sm line-clamp-1">{data["Job Title"]}</p>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 flex-1">
                    {data["Company Name"] && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{data["Company Name"]}</span>
                      </div>
                    )}
                    {data.Email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <a href={`mailto:${data.Email}`} className="hover:text-blue-600 truncate">{data.Email}</a>
                      </div>
                    )}
                    {data.Phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>{data.Phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                    <ExportButton card={card} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
