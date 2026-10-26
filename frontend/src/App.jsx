import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { getDocuments, uploadDocument } from './services/documents.js';
import './styles.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refreshDocuments() {
    setLoading(true);
    setError('');
    try {
      setDocuments(await getDocuments());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshDocuments();
  }, []);

  async function handleUpload(file) {
    setError('');
    setNotice('');
    await uploadDocument(file);
    setNotice('Documento enviado.');
    await refreshDocuments();
  }

  return (
    <main className="workspace">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Arquivo, início">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>arquivo<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-meta">
          <span className="status-dot" aria-hidden="true" />
          <span>Armazenamento local</span>
        </div>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">ESPAÇO DE TRABALHO</p>
          <h1 id="page-title">Seus documentos,<br /><span>em ordem.</span></h1>
        </div>
        <p className="intro-note">Envie e acesse seus arquivos em um só lugar.</p>
      </section>

      <UploadComponent onUpload={handleUpload} />

      <section className="documents-section" aria-labelledby="documents-title">
        {error && <p className="feedback error-message" role="alert">{error}</p>}
        {notice && <p className="feedback success-message" role="status">{notice}</p>}
        <DocumentList documents={documents} loading={loading} onRefresh={refreshDocuments} onError={setError} />
      </section>

      <footer className="footer">
        <span>ARQUIVO · GESTÃO DE DOCUMENTOS</span>
        <span>Seus arquivos permanecem no armazenamento local.</span>
      </footer>
    </main>
  );
}
