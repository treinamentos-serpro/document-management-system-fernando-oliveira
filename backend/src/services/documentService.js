function createDocumentService({ repository, owner }) {
  return {
    async upload(file) {
      if (!file) {
        const error = new Error('Arquivo obrigatório.');
        error.code = 'FILE_REQUIRED';
        throw error;
      }

      try {
        return await repository.create(file, owner);
      } catch (cause) {
        await repository.removeStoredFile(file.filename).catch(() => {});
        const error = new Error('Falha ao registrar o documento.', { cause });
        error.code = 'UPLOAD_FAILED';
        throw error;
      }
    },

    async list() {
      try {
        return await repository.listByOwner(owner);
      } catch (cause) {
        const error = new Error('Falha ao listar documentos.', { cause });
        error.code = 'DOCUMENTS_LIST_FAILED';
        throw error;
      }
    },

    async getDownload(id) {
      const document = await repository.findByIdAndOwner(id, owner);
      if (!document) {
        const error = new Error('Documento não encontrado.');
        error.code = 'DOCUMENT_NOT_FOUND';
        throw error;
      }

      return document;
    },
  };
}

module.exports = { createDocumentService };