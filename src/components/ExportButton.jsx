import React from 'react';
import { Download } from 'lucide-react';

export default function ExportButton({ card }) {
  const generateVCard = () => {
    const data = card.extracted_data;
    const name = data.Name || 'Unknown';
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    // Construct vCard string
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

    // Create blob and download link
    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        generateVCard();
      }}
      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
      title="Export to Contacts"
    >
      <Download className="w-4 h-4" />
    </button>
  );
}
