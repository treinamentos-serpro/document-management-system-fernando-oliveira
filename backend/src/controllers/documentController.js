function createDocumentController({ service }) {
  return {
    upload: async (req, res, next) => {
      try {
        const document = await service.upload(req.file);
        res.status(201).json({ document });
      } catch (error) {
        if (error.code === 'FILE_REQUIRED') {
          return res.status(400).json({
            error: { code: error.code, message: 'Selecione um arquivo para enviar.' },
          });
        }
        next(error);
      }
    },

    list: async (req, res, next) => {
      try {
        res.json({ documents: await service.list() });
      } catch (error) {
        next(error);
      }
    },

    download: async (req, res, next) => {
      try {
        const document = await service.getDownload(req.params.id);
        res.type(document.mimeType || 'application/octet-stream');
        res.download(document.storagePath, document.originalName, (error) => {
          if (error && !res.headersSent) {
            if (error.code === 'ENOENT') error.code = 'DOWNLOAD_FAILED';
            next(error);
          }
        });
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = { createDocumentController };