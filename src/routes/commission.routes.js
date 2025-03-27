const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize(['ADMIN', 'PRESIDENT']), commissionController.createCommission);
router.get('/:id', commissionController.getCommissionById);
router.put('/:id', authorize(['ADMIN', 'PRESIDENT']), commissionController.updateCommission);
router.delete('/:id', authorize(['ADMIN', 'PRESIDENT']), commissionController.deleteCommission);
router.get('/', commissionController.getAllCommissions);

router.post('/:id/members', authorize(['ADMIN', 'PRESIDENT']), commissionController.addMemberToCommission);
router.delete('/:id/members/:memberId', authorize(['ADMIN', 'PRESIDENT']), commissionController.removeMemberFromCommission);
router.get('/:id/members', commissionController.getCommissionMembers);
router.get('/:id/meetings', commissionController.getCommissionMeetings);

module.exports = router;
