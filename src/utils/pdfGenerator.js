// PDF & Printable layout utility helper for ISI-Docs

export const translateDocType = (type) => {
  switch(type) {
    case 'enrollment_certificate': return 'Attestation d\'Inscription';
    case 'transcript': return 'Relevé de Notes';
    case 'internship_certificate': return 'Attestation de Stage';
    case 'report_card': return 'Bulletin de Notes';
    default: return 'Attestation Officielle';
  }
};

export const printDocumentElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Document Officiel ISI</title>
        <style>
          body { font-family: sans-serif; padding: 40px; }
          /* Add essential print styling here */
        </style>
      </head>
      <body onload="window.print();window.close()">
        ${element.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
};
