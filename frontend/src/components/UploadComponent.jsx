import { useRef, useState } from 'react';
import { formatFileSize } from '../utils/documentFormatters.js';

export default function UploadComponent({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile || uploading) return;

    setUploading(true);
    setError('');
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      inputRef.current.value = '';
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">ADICIONAR</p>
          <h2 id="upload-title">Enviar documento</h2>
        </div>
        <span className="section-index">01 / 02</span>
      </div>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label className={`file-picker${selectedFile ? ' has-file' : ''}`} htmlFor="document-file">
          <span className="file-symbol" aria-hidden="true">＋</span>
          <span className="file-picker-copy">
            <strong>{selectedFile ? selectedFile.name : 'Escolha um arquivo'}</strong>
            <small>{selectedFile ? formatFileSize(selectedFile.size) : 'ou procure no seu dispositivo'}</small>
          </span>
          <span className="browse-label">Procurar</span>
          <input
            ref={inputRef}
            id="document-file"
            type="file"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
        </label>
        <button className="upload-button" type="submit" disabled={!selectedFile || uploading}>
          {uploading ? 'Enviando…' : 'Enviar arquivo'}
          <span aria-hidden="true">↗</span>
        </button>
      </form>
      {error && <p className="feedback error-message" role="alert">{error}</p>}
      <p className="upload-caption">Os arquivos são armazenados localmente. Limite configurado pelo servidor.</p>
    </section>
  );
}