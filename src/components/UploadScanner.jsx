import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Camera, Upload, Loader2, Check, X } from 'lucide-react';

export default function UploadScanner({ onScanComplete }) {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg(null);
    try {
      const resizedBase64 = await resizeImage(file);
      setPreview(resizedBase64);
      scanImage(resizedBase64);
    } catch (err) {
      console.error("Error resizing image:", err);
      setErrorMsg("Failed to process image. Please try another one.");
    }
  };

  const scanImage = async (base64Image) => {
    setScanning(true);
    setErrorMsg(null);
    try {
      // Remove data:image/jpeg;base64, prefix
      const base64Data = base64Image.split(',')[1];

      const { data, error } = await supabase.functions.invoke('scan-card', {
        body: { image: base64Data },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        if (data.details) setErrorDetails(data.details);
        throw new Error(data.error);
      }

      setScannedData(data);
    } catch (error) {
      console.error('Error scanning card:', error);
      setErrorMsg(error.message);
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Get user's profile to get organization_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Upload image to storage (optional, skipping for MVP to just store URL as base64 or placeholder)
      // For MVP, we'll just store the base64 or a placeholder URL since we didn't set up Storage buckets explicitly in the plan
      // Ideally we upload to Supabase Storage. I'll assume we can just store the extracted data.
      // But the schema has image_url. I'll use a placeholder or the base64 if it fits (it might be too large).
      // Let's just use a placeholder for now or assume we upload it.
      // I'll skip actual storage upload to keep it simple as per instructions "UploadScanner... inserts result into Supabase".
      
      const { error } = await supabase
        .from('business_cards')
        .insert({
          organization_id: profile.organization_id,
          image_url: preview, // Save the actual image (base64)
          extracted_data: scannedData
        });

      if (error) throw error;

      onScanComplete();
      setPreview(null);
      setScannedData(null);
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Failed to save card: ' + error.message);
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div 
          className="group relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 md:p-12 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-300"
          onClick={() => fileInputRef.current.click()}
        >
          <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
            <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload Business Card</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">Drag and drop or click to capture. We'll extract the details for you.</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="environment"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col md:flex-row">
            <div className="relative w-full md:w-2/5 aspect-video md:aspect-auto bg-slate-100 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 group">
              <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                  onClick={() => { setPreview(null); setScannedData(null); }}
                  className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transform hover:scale-110 transition-all"
                  title="Remove Image"
                  >
                  <X className="w-6 h-6 text-slate-900 dark:text-white" />
                  </button>
              </div>
            </div>

            <div className="flex-1 p-6 md:p-8">
              {scanning && (
                <div className="h-full flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 py-12">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <span className="font-semibold text-lg animate-pulse">Analyzing card details...</span>
                  <p className="text-sm text-slate-400 mt-2">This usually takes a few seconds</p>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3 mb-2 font-bold text-lg">
                      <X className="w-5 h-5" />
                      Scan Failed
                  </div>
                  <p className="text-sm opacity-90">{errorMsg}</p>
                  {errorDetails && (
                    <div className="mt-4 p-3 bg-white/60 dark:bg-slate-900/50 rounded-lg border border-red-100 dark:border-red-800 text-xs font-mono break-all">
                      {errorDetails}
                    </div>
                  )}
                  <button 
                    onClick={() => { setPreview(null); setScannedData(null); }}
                    className="mt-4 text-sm font-semibold underline hover:no-underline"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {scannedData && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500" />
                          Extracted Information
                      </h3>
                      <span className="text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full font-bold uppercase tracking-wide">Success</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                      <label className="block text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Name</label>
                      <div className="font-semibold text-slate-900 dark:text-white">{scannedData.Name || '-'}</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                      <label className="block text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Job Title</label>
                      <div className="font-semibold text-slate-900 dark:text-white">{scannedData["Job Title"] || '-'}</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                      <label className="block text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Company</label>
                      <div className="font-semibold text-slate-900 dark:text-white">{scannedData["Company Name"] || '-'}</div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      onClick={handleSave}
                      className="w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                    >
                      <Check className="w-5 h-5" />
                      Save to Vault
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
