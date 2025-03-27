const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Routes protégées pour les rapports
router.use(authenticate);

// Créer un rapport
router.post('/',
  authorize(['admin', 'member']),
  upload.array('attachments'),
  reportController.createReport
);

// Obtenir tous les rapports
router.get('/',
  authorize(['admin', 'member']),
  reportController.getReports
);

// Obtenir un rapport spécifique
router.get('/:id',
  authorize(['admin', 'member']),
  reportController.getReport
);

// Mettre à jour un rapport
router.put('/:id',
  authorize(['admin', 'member']),
  upload.array('attachments'),
  reportController.updateReport
);

// Supprimer un rapport
router.delete('/:id',
  authorize(['admin']),
  reportController.deleteReport
);

// Réviser un rapport
router.patch('/:id/review',
  authorize(['admin']),
  reportController.reviewReport
);

module.exports = router;
