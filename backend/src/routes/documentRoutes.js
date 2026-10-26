const fs = require('node:fs');
const multer = require('multer');
const { randomUUID } = require('node:crypto');
const express = require('express');

function createDocumentRouter({ controller, storageDir, maxFileSizeBytes }) {
  fs.mkdirSync(storageDir, { recursive: true });
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, callback) => callback(null, storageDir),
      filename: (req, file, callback) => callback(null, randomUUID()),
    }),
    limits: { fileSize: maxFileSizeBytes, files: 1 },
  });
  const router = express.Router();

  router.post('/upload', upload.single('file'), controller.upload);
  router.get('/documents', controller.list);
  router.get('/documents/:id/download', controller.download);

  return router;
}

module.exports = { createDocumentRouter };