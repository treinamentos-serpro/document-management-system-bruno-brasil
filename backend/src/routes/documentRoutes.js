const express = require('express');
const createDocumentController = require('../controllers/documentController');

function createDocumentRouter(options) {
  const router = express.Router();
  const controller = createDocumentController(options);

  router.post('/upload', controller.validateOwner, controller.uploadFile, controller.upload);
  router.get('/documents', controller.validateOwner, controller.list);
  router.get('/documents/:id/download', controller.validateOwner, controller.download);
  router.use(controller.handleError);

  return router;
}

module.exports = createDocumentRouter;