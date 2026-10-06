const express = require('express');
const path = require('node:path');
const createDocumentRouter = require('./routes/documentRoutes');

const PORT = process.env.PORT || 3000;

function createApp({
  storageDir = process.env.STORAGE_DIR || path.join(__dirname, '../storage'),
  maxFileSize = Number(process.env.MAX_FILE_SIZE_BYTES || 10485760),
} = {}) {
  if (!Number.isSafeInteger(maxFileSize) || maxFileSize <= 0) {
    throw new Error('MAX_FILE_SIZE_BYTES deve ser um inteiro positivo.');
  }
  const app = express();
  app.use(express.json());
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  app.use(createDocumentRouter({ storageDir, maxFileSize }));
  return app;
}

const app = createApp();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
