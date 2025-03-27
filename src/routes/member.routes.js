const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize(['ADMIN']), memberController.createMember);
router.get('/:id', memberController.getMemberById);
router.put('/:id', authorize(['ADMIN']), memberController.updateMember);
router.delete('/:id', authorize(['ADMIN']), memberController.deleteMember);
router.get('/', memberController.searchMembers);
router.get('/:id/commissions', memberController.getMemberCommissions);
router.get('/:id/trainings', memberController.getMemberTrainings);

module.exports = router;
