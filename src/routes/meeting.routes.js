const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.post('/', authorize(['ADMIN', 'PRESIDENT']), meetingController.createMeeting);
router.get('/:id', meetingController.getMeetingById);
router.put('/:id', authorize(['ADMIN', 'PRESIDENT']), meetingController.updateMeeting);
router.delete('/:id', authorize(['ADMIN', 'PRESIDENT']), meetingController.deleteMeeting);
router.get('/', meetingController.getAllMeetings);

router.post('/:id/reports', meetingController.addReport);
router.put('/:id/reports/:reportId', meetingController.updateReport);
router.delete('/:id/reports/:reportId', authorize(['ADMIN']), meetingController.deleteReport);

router.post('/:id/reports/:reportId/attachments', upload.single('file'), meetingController.addAttachment);
router.delete('/:id/reports/:reportId/attachments/:attachmentId', meetingController.removeAttachment);

router.get('/statistics', authorize(['ADMIN']), meetingController.getMeetingStatistics);

module.exports = router;
