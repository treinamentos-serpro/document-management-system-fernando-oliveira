import { useState } from 'react';
import { downloadDocument } from '../services/documents.js';

export default function DownloadButton({ document, onError }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const file = await downloadDocument(document.id);
      const url = URL.createObjectURL(file);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      onError(error.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button className="download-link" type="button" onClick={handleDownload} disabled={downloading}>
      {downloading ? 'Baixando…' : 'Baixar'} <span aria-hidden="true">↓</span>
    </button>
  );
}