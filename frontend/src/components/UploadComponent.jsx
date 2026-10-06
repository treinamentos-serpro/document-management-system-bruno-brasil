import { useState } from 'react';
import { LoaderCircle, Upload } from 'lucide-react';
import { uploadDocument } from '../services/documentApi.js';

export default function UploadComponent({ owner, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || uploading) return;
    const form = event.currentTarget;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const document = await uploadDocument(file, owner);
      form.reset();
      setFile(null);
      setSuccess(`${document.originalName} enviado com sucesso.`);
      onUploaded(document);
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-heading">
      <h2 id="upload-heading">Enviar documento</h2>
      <form className="upload-form" onSubmit={handleSubmit} aria-busy={uploading}>
        <div className="file-field">
          <label htmlFor="document-file">Arquivo</label>
          <input
            id="document-file"
            type="file"
            required
            disabled={uploading}
            onChange={(event) => {
              setFile(event.target.files[0] || null);
              setError('');
              setSuccess('');
            }}
          />
        </div>
        <button className="primary-button" type="submit" disabled={!file || uploading}>
          {uploading ? <LoaderCircle className="spin" size={18} /> : <Upload size={18} />}
          {uploading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      {error && <p className="error-message" role="alert">{error}</p>}
      {success && <p className="success-message" role="status">{success}</p>}
    </section>
  );
}