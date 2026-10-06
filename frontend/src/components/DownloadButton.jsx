import { useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import { downloadDocument } from '../services/documentApi.js';

export default function DownloadButton({ document, owner }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setError('');
    try {
      const blob = await downloadDocument(document.id, owner);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      try {
        link.href = url;
        link.download = document.originalName;
        window.document.body.appendChild(link);
        link.click();
      } finally {
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="download-action">
      <button
        className="icon-button"
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        aria-label={`${downloading ? 'Baixando' : 'Baixar'} ${document.originalName}`}
        title={`Baixar ${document.originalName}`}
      >
        {downloading ? <LoaderCircle className="spin" size={18} /> : <Download size={18} />}
      </button>
      {error && <p className="error-message" role="alert">{error}</p>}
    </div>
  );
}