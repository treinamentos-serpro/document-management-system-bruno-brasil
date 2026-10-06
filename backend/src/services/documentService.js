const { randomUUID } = require('node:crypto');
const createDocumentRepository = require('../repositories/documentRepository');

function domainError(code) {
  return Object.assign(new Error(code), { code });
}

function publicMetadata(document) {
  const { id, originalName, size, uploadedAt, owner } = document;
  return { id, originalName, size, uploadedAt, owner };
}

function createDocumentService(storageDir) {
  const repository = createDocumentRepository(storageDir);

  return {
    prepareStorage: () => repository.prepareStorage(),
    async upload(file, owner) {
      if (!file) throw domainError('FILE_REQUIRED');
      try {
        const document = repository.save({
          id: randomUUID(),
          originalName: file.originalname,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          owner,
          storageKey: file.filename,
        });
        return publicMetadata(document);
      } catch (error) {
        await repository.removeFile(file.filename).catch(() => {});
        throw error;
      }
    },
    list(owner) {
      return repository.findByOwner(owner).map(publicMetadata);
    },
    async download(id, owner) {
      const document = repository.findById(id);
      if (!document || document.owner !== owner) throw domainError('DOCUMENT_NOT_FOUND');
      return {
        filePath: await repository.getFilePath(document.storageKey),
        originalName: document.originalName,
      };
    },
  };
}

module.exports = createDocumentService;