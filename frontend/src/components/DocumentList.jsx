import { File, Files, LoaderCircle } from 'lucide-react';
import DownloadButton from './DownloadButton.jsx';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const sizeFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function formatSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${sizeFormatter.format(size / 1024)} KB`;
  return `${sizeFormatter.format(size / (1024 * 1024))} MB`;
}

export default function DocumentList({ documents, owner, loading, error }) {
  if (loading) {
    return <p className="list-state" role="status"><LoaderCircle className="spin" size={22} />Carregando documentos...</p>;
  }
  if (error) return <p className="error-message list-state" role="alert">{error}</p>;
  if (!documents.length) {
    return <p className="list-state" role="status"><Files size={28} />Nenhum documento encontrado.</p>;
  }

  return (
    <>
      <div className="document-header" aria-hidden="true">
        <span>Documento</span><span>Tamanho</span><span>Enviado em</span><span />
      </div>
      <ul className="document-list">
        {documents.map((document) => (
          <li className="document-row" key={document.id}>
            <div className="document-name"><File size={22} aria-hidden="true" /><span>{document.originalName}</span></div>
            <span className="document-size">{formatSize(document.size)}</span>
            <time dateTime={document.uploadedAt}>{dateFormatter.format(new Date(document.uploadedAt))}</time>
            <DownloadButton document={document} owner={owner} />
          </li>
        ))}
      </ul>
    </>
  );
}