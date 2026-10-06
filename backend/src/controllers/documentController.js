const multer = require('multer');
const { randomUUID } = require('node:crypto');
const createDocumentService = require('../services/documentService');

const errors = {
  USER_REQUIRED: [400, 'Informe o usuário no cabeçalho X-User-Id.'],
  FILE_REQUIRED: [400, 'Envie um arquivo no campo file.'],
  INVALID_DOCUMENT_ID: [400, 'Identificador de documento inválido.'],
  DOCUMENT_NOT_FOUND: [404, 'Documento não encontrado.'],
  LIMIT_FILE_SIZE: [413, 'O arquivo excede o tamanho máximo permitido.'],
};

function createDocumentController({ storageDir, maxFileSize }) {
  const service = createDocumentService(storageDir);
  const upload = multer({
    storage: multer.diskStorage({
      destination(req, file, callback) {
        service.prepareStorage().then((directory) => callback(null, directory), callback);
      },
      filename(req, file, callback) {
        callback(null, randomUUID());
      },
    }),
    limits: { fileSize: maxFileSize },
  }).single('file');

  return {
    validateOwner(req, res, next) {
      const owner = req.get('X-User-Id')?.trim();
      if (!owner) return next(Object.assign(new Error('USER_REQUIRED'), { code: 'USER_REQUIRED' }));
      res.locals.owner = owner;
      next();
    },
    uploadFile: upload,
    async upload(req, res) {
      res.status(201).json(await service.upload(req.file, res.locals.owner));
    },
    list(req, res) {
      res.json({ documents: service.list(res.locals.owner) });
    },
    async download(req, res, next) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) {
        throw Object.assign(new Error('INVALID_DOCUMENT_ID'), { code: 'INVALID_DOCUMENT_ID' });
      }
      const document = await service.download(req.params.id, res.locals.owner);
      res.download(document.filePath, document.originalName, (error) => {
        if (error) next(error);
      });
    },
    handleError(error, req, res, next) {
      if (res.headersSent) return next(error);
      let code = 'INTERNAL_ERROR';
      let status = 500;
      let message = 'Não foi possível concluir a operação.';
      if (Object.hasOwn(errors, error.code)) {
        code = error.code;
        [status, message] = errors[code];
      } else if (error instanceof multer.MulterError) {
        code = 'INVALID_UPLOAD';
        status = 400;
        message = 'Envie apenas um arquivo no campo file.';
      }
      res.status(status).json({ error: { code, message } });
    },
  };
}

module.exports = createDocumentController;