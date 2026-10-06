import { useEffect, useState } from 'react';
import { FolderOpen, RefreshCw, UserRound } from 'lucide-react';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import { listDocuments } from './services/documentApi.js';
import './App.css';

function DocumentWorkspace({ owner }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    listDocuments(owner, controller.signal)
      .then((documents) => {
        if (!controller.signal.aborted) setDocuments(documents);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [owner, revision]);

  function refreshDocuments() {
    setRevision((revision) => revision + 1);
  }

  return (
    <>
      <UploadComponent owner={owner} onUploaded={refreshDocuments} />
      <section aria-labelledby="documents-heading" aria-busy={loading}>
        <div className="section-heading">
          <h2 id="documents-heading">Documentos <span className="document-count">{documents.length}</span></h2>
          <button type="button" className="icon-button" onClick={refreshDocuments} disabled={loading} title="Atualizar lista" aria-label="Atualizar lista">
            <RefreshCw size={18} className={loading ? 'spin' : ''} aria-hidden="true" />
          </button>
        </div>
        <DocumentList documents={documents} owner={owner} loading={loading} error={error} />
      </section>
    </>
  );
}

export default function App() {
  const [owner, setOwner] = useState('usuario-demo');
  const [ownerInput, setOwnerInput] = useState('usuario-demo');

  return (
    <main className="workspace">
      <header className="app-header">
        <div className="brand"><FolderOpen size={32} aria-hidden="true" /><div><h1>DMS</h1><p>Document Management System</p></div></div>
        <form className="owner-form" onSubmit={(event) => {
          event.preventDefault();
          if (ownerInput.trim()) {
            setOwner(ownerInput.trim());
            setOwnerInput(ownerInput.trim());
          }
        }}>
          <label htmlFor="owner"><UserRound size={16} aria-hidden="true" />Usuário</label>
          <div className="owner-controls">
            <input id="owner" value={ownerInput} onChange={(event) => setOwnerInput(event.target.value)} required />
            <button type="submit" disabled={!ownerInput.trim() || ownerInput.trim() === owner}>Aplicar</button>
          </div>
        </form>
      </header>
      <DocumentWorkspace key={owner} owner={owner} />
    </main>
  );
}
