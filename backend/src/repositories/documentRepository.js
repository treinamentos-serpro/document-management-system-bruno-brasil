const { mkdir, unlink, access } = require('node:fs/promises');
const path = require('node:path');

function createDocumentRepository(storageDir) {
  const documents = new Map();
  const directory = path.resolve(storageDir);

  return {
    async prepareStorage() {
      await mkdir(directory, { recursive: true });
      return directory;
    },
    save(document) {
      documents.set(document.id, document);
      return document;
    },
    findById(id) {
      return documents.get(id);
    },
    findByOwner(owner) {
      return [...documents.values()]
        .filter((document) => document.owner === owner)
        .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt));
    },
    async getFilePath(storageKey) {
      const filePath = path.join(directory, storageKey);
      await access(filePath);
      return filePath;
    },
    async removeFile(storageKey) {
      await unlink(path.join(directory, storageKey));
    },
  };
}

module.exports = createDocumentRepository;