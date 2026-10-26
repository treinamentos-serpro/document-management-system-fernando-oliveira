import DownloadButton from './DownloadButton.jsx';
import { formatDate, formatFileSize } from '../utils/documentFormatters.js';

export default function DocumentList({ documents, loading, onRefresh, onError }) {
  return (
    <>
      <div className="section-heading documents-heading">
        <div>
          <p className="eyebrow">BIBLIOTECA</p>
          <h2 id="documents-title">Documentos</h2>
        </div>
        <div className="list-tools">
          <span className="document-count">{documents.length.toString().padStart(2, '0')} itens</span>
          <button className="refresh-button" type="button" onClick={onRefresh} aria-label="Atualizar lista" title="Atualizar lista">
            <span aria-hidden="true">↻</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="list-state">Carregando documentos…</p>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <span className="empty-mark" aria-hidden="true">—</span>
          <p>Nenhum documento por aqui.</p>
          <span>Os arquivos enviados aparecerão nesta lista.</span>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Enviado em</th>
                <th scope="col">Tamanho</th>
                <th scope="col"><span className="visually-hidden">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td className="name-cell">
                    <span className="document-glyph" aria-hidden="true">DOC</span>
                    <span className="document-name" title={document.originalName}>{document.originalName}</span>
                  </td>
                  <td data-label="Enviado em">{formatDate(document.uploadedAt)}</td>
                  <td data-label="Tamanho">{formatFileSize(document.size)}</td>
                  <td className="action-cell">
                    <DownloadButton document={document} onError={onError} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}