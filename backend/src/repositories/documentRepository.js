const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

function createDocumentRepository({ storageDir }) {
  const documents = new Map();

  return {
    async create(file, owner) {
      const document = {
        id: randomUUID(),
        originalName: file.originalname,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        owner,
        storageName: file.filename,
        mimeType: file.mimetype || null,
      };

      documents.set(document.id, document);
      return toPublicDocument(document);
    },

    async listByOwner(owner) {
      return [...documents.values()]
        .filter((document) => document.owner === owner)
        .map(toPublicDocument);
    },

    async findByIdAndOwner(id, owner) {
      const document = documents.get(id);
      if (!document || document.owner !== owner) return null;

      return {
        ...toPublicDocument(document),
        storagePath: path.join(storageDir, document.storageName),
        mimeType: document.mimeType,
      };
    },

    async removeStoredFile(storageName) {
      await fs.unlink(path.join(storageDir, storageName)).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
      });
    },
  };
}

function toPublicDocument({ id, originalName, size, uploadedAt, owner }) {
  return { id, originalName, size, uploadedAt, owner };
}

module.exports = { createDocumentRepository };