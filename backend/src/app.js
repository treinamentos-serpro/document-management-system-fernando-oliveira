const path = require('node:path');
const express = require('express');
const { createDocumentRepository } = require('./repositories/documentRepository');
const { createDocumentService } = require('./services/documentService');
const { createDocumentController } = require('./controllers/documentController');
const { createDocumentRouter } = require('./routes/documentRoutes');

function createApp(options = {}) {
  const storageDir = path.resolve(
    options.storageDir || process.env.STORAGE_DIR || path.join(__dirname, '..', '..', 'storage'),
  );
  const maxFileSizeBytes = Number(
    options.maxFileSizeBytes || process.env.MAX_FILE_SIZE_BYTES || 10 * 1024 * 1024,
  );
  const owner = options.owner || process.env.DMS_DEFAULT_OWNER || 'local-user';
  const repository = options.repository || createDocumentRepository({ storageDir });
  const service = createDocumentService({ repository, owner });
  const controller = createDocumentController({ service });
  const app = express();

  app.use(express.json());
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/', createDocumentRouter({ controller, storageDir, maxFileSizeBytes }));

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: { code: 'FILE_TOO_LARGE', message: 'O arquivo excede o tamanho máximo permitido.' },
      });
    }

    if (error.code === 'DOCUMENT_NOT_FOUND') {
      return res.status(404).json({
        error: { code: error.code, message: 'Documento não encontrado.' },
      });
    }

    const publicErrors = {
      UPLOAD_FAILED: 'Não foi possível enviar o documento.',
      DOCUMENTS_LIST_FAILED: 'Não foi possível listar os documentos.',
      DOWNLOAD_FAILED: 'Não foi possível baixar o documento.',
    };
    if (publicErrors[error.code]) {
      return res.status(500).json({
        error: { code: error.code, message: publicErrors[error.code] },
      });
    }

    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro interno.' },
    });
  });

  return app;
}

const app = createApp();
app.createApp = createApp;

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`DMS backend ouvindo na porta ${port}`);
  });
}

module.exports = app;
