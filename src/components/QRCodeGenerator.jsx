import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';

export default function QRCodeGenerator({ card, onClose }) {
  const generateVCardString = () => {
    const data = card.extracted_data;
    const name = data.Name || 'Unknown';
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    let vCard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
N:${lastName};${firstName};;;
`;

    if (data["Company Name"]) vCard += `ORG:${data["Company Name"]}\n`;
    if (data["Job Title"]) vCard += `TITLE:${data["Job Title"]}\n`;
    if (data.Phone) vCard += `TEL;TYPE=CELL:${data.Phone}\n`;
    if (data.Email) vCard += `EMAIL;TYPE=WORK:${data.Email}\n`;
    if (data.Website) vCard += `URL:${data.Website}\n`;
    if (data.Address) vCard += `ADR;TYPE=WORK:;;${data.Address.replace(/,/g, ';')};;;;\n`;
    if (card.notes) vCard += `NOTE:${card.notes}\n`;

    vCard += `END:VCARD`;
    return vCard;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100 ring-1 ring-slate-900/5 dark:ring-white/10 text-center" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Scan to Save</h3>
            <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-inner inline-block mb-4">
            <QRCodeSVG 
                value={generateVCardString()} 
                size={200}
                level={"M"}
                includeMargin={true}
            />
        </div>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm">
            Point your phone camera at this QR code to instantly save <strong>{card.extracted_data.Name}</strong> to your contacts.
        </p>
      </div>
    </div>
  );
}
