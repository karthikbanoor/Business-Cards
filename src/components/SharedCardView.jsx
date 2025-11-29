import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Building2, Mail, Phone, MapPin, Globe, User, ScanLine } from 'lucide-react';
import ExportButton from './ExportButton';

export default function SharedCardView() {
  const { token } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCardData();
  }, [token]);

  const fetchCardData = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_shared_card', { token });
      
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Card not found');
      
      setCard(data[0]);
    } catch (error) {
      console.error('Error fetching shared card:', error);
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

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Card Not Found</h1>
          <p className="text-slate-500">The link might be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const data = card.extracted_data || {};

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">CardVault</h1>
          </div>
          <div className="text-sm text-slate-500">
            Shared Card
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl max-w-md w-full">
             <div className="h-64 bg-slate-100 overflow-hidden border-b border-slate-100 relative">
                  {card.image_url ? (
                    <img src={card.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <User className="w-16 h-16 mb-2" />
                      <span className="text-sm font-medium uppercase tracking-widest">No Image</span>
                    </div>
                  )}
            </div>
            <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">{data.Name || 'Unknown Name'}</h2>
                    <p className="text-blue-600 font-medium text-lg">{data["Job Title"]}</p>
                    <p className="text-slate-500">{data["Company Name"]}</p>
                  </div>

                  <div className="space-y-4 text-slate-600 mb-8">
                    {data.Email && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <a href={`mailto:${data.Email}`} className="hover:text-blue-600 truncate">{data.Email}</a>
                      </div>
                    )}
                    {data.Phone && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                            <Phone className="w-5 h-5" />
                        </div>
                        <span>{data.Phone}</span>
                      </div>
                    )}
                    {data.Website && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                            <Globe className="w-5 h-5" />
                        </div>
                        <a href={data.Website} target="_blank" rel="noreferrer" className="hover:text-blue-600 truncate">{data.Website}</a>
                      </div>
                    )}
                    {data.Address && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 mt-0.5">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <span>{data.Address}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <ExportButton card={card} className="w-full justify-center py-3 text-base" />
                  </div>
            </div>
        </div>
      </main>
    </div>
  );
}
