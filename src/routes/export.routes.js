const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Routes protégées pour les exports
router.use(verifyToken);

// Créer un export
router.post('/',
  checkPermission('exports', 'CREATE'),
  exportController.createExport
);

// Obtenir tous les exports
router.get('/',
  checkPermission('exports', 'READ'),
  exportController.getExports
);

// Obtenir un export spécifique
router.get('/:id',
  checkPermission('exports', 'READ'),
  exportController.getExport
);

// Télécharger un export
router.get('/:id/download',
  checkPermission('exports', 'READ'),
  exportController.downloadExport
);

module.exports = router;
