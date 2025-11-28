import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { X, Save, Upload, Camera, Loader2 } from 'lucide-react';

export default function ManualEntryForm({ onClose, onSaveComplete }) {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    Name: '',
    "Job Title": '',
    "Company Name": '',
    Email: '',
    Phone: '',
    Website: '',
    Address: '',
    notes: '',
    tags: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1024;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const scanImage = async (base64Image) => {
    setScanning(true);
    try {
      // Remove data:image/jpeg;base64, prefix
      const base64Data = base64Image.split(',')[1];

      const { data, error } = await supabase.functions.invoke('scan-card', {
        body: { image: base64Data },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Autofill form data
      setFormData(prev => ({
        ...prev,
        Name: data.Name || prev.Name,
        "Job Title": data["Job Title"] || prev["Job Title"],
        "Company Name": data["Company Name"] || prev["Company Name"],
        Email: data.Email || prev.Email,
        Phone: data.Phone || prev.Phone,
        Website: data.Website || prev.Website,
        Address: data.Address || prev.Address,
        notes: prev.notes
      }));

    } catch (error) {
      console.error('Error scanning card:', error);
      alert('Failed to scan card automatically. Please enter details manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const resizedBase64 = await resizeImage(file);
      setImagePreview(resizedBase64);
      // Trigger scan immediately
      scanImage(resizedBase64);
    } catch (err) {
      console.error("Error resizing image:", err);
      alert("Failed to process image. Please try another one.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('Organization not found');
      }

      // Use the uploaded image or null
      const imageUrl = imagePreview || null;

      const { error } = await supabase
        .from('business_cards')
        .insert([
          {
            organization_id: profile.organization_id,
            image_url: imageUrl, 
            extracted_data: {
              ...formData,
              notes: undefined // Don't store notes in extracted_data
            },
            notes: formData.notes,
            tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
          }
        ]);

      if (error) throw error;

      onSaveComplete();
      onClose();
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Failed to save card: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all scale-100 ring-1 ring-slate-900/5 dark:ring-white/10">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Business Card</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manually enter details or scan an image</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Card Image (Optional)</label>
            {!imagePreview ? (
              <div 
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 group"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Camera className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Upload & Auto-fill</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click to scan image with AI</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                <button 
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {scanning && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="font-medium">Scanning...</span>
                  </div>
                )}
              </div>
            )}
          </div>

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
                placeholder="e.g. John Doe"
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
                placeholder="e.g. Product Manager"
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
                placeholder="e.g. Acme Inc"
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
                placeholder="john@example.com"
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
                placeholder="+1 (555) 000-0000"
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
                placeholder="example.com"
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
                placeholder="123 Business Ave, Tech City"
                />
            </div>

            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Private Notes</label>
                <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all resize-none placeholder-slate-400"
                placeholder="Add private notes about this contact..."
                />
            </div>

            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tags (comma separated)</label>
                <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all placeholder-slate-400"
                placeholder="Client, Tech, 2024 Event"
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
              {loading ? 'Saving...' : 'Save Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
