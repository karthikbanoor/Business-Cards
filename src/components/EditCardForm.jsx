import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, Save, Loader2 } from 'lucide-react';

export default function EditCardForm({ card, onClose, onUpdateComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Name: '',
    "Job Title": '',
    "Company Name": '',
    Email: '',
    Phone: '',
    Website: '',
    Address: ''
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (card) {
      setFormData({
        Name: card.extracted_data.Name || '',
        "Job Title": card.extracted_data["Job Title"] || '',
        "Company Name": card.extracted_data["Company Name"] || '',
        Email: card.extracted_data.Email || '',
        Phone: card.extracted_data.Phone || '',
        Website: card.extracted_data.Website || '',
        Address: card.extracted_data.Address || ''
      });
      setNotes(card.notes || '');
    }
  }, [card]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('business_cards')
        .update({
          extracted_data: formData,
          notes: notes
        })
        .eq('id', card.id);

      if (error) throw error;

      onUpdateComplete();
      onClose();
    } catch (error) {
      console.error('Error updating card:', error);
      alert('Failed to update card: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all scale-100 ring-1 ring-slate-900/5 dark:ring-white/10">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Card</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Update card details and notes</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input
                type="text"
                name="Name"
                required
                value={formData.Name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all placeholder-slate-400"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Job Title</label>
                <input
                type="text"
                name="Job Title"
                value={formData["Job Title"]}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all placeholder-slate-400"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company</label>
                <input
                type="text"
                name="Company Name"
                value={formData["Company Name"]}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all placeholder-slate-400"
                />
            </div>

            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all placeholder-slate-400"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                <input
                type="tel"
                name="Phone"
                value={formData.Phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all placeholder-slate-400"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Website</label>
                <input
                type="text"
                name="Website"
                value={formData.Website}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all placeholder-slate-400"
                />
            </div>

            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
                <textarea
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all resize-none placeholder-slate-400"
                />
            </div>

            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Private Notes</label>
                <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all resize-none placeholder-slate-400"
                placeholder="Add private notes about this contact..."
                />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Updating...' : 'Update Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
