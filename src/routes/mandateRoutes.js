const express = require('express');
const router = express.Router();
const mandateController = require('../controllers/mandateController');
const { cacheMiddleware } = require('../config/cache');
const { authenticate } = require('../middleware/auth');

// Routes avec middleware de cache pour les requêtes GET
router.get(
  '/members/:id/mandates',
  authenticate,
  cacheMiddleware(300), // Cache de 5 minutes
  mandateController.getMemberMandates
);

router.post(
  '/members/:id/mandates',
  authenticate,
  mandateController.addMandate
);

router.put(
  '/members/:id/mandates/:mandateId',
  authenticate,
  mandateController.updateMandate
);

router.delete(
  '/members/:id/mandates/:mandateId',
  authenticate,
  mandateController.deleteMandate
);

module.exports = router;
