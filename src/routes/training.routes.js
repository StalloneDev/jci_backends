const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize(['ADMIN', 'TRAINER']), trainingController.createTraining);
router.get('/:id', trainingController.getTrainingById);
router.put('/:id', authorize(['ADMIN', 'TRAINER']), trainingController.updateTraining);
router.delete('/:id', authorize(['ADMIN']), trainingController.deleteTraining);
router.get('/', trainingController.getAllTrainings);

router.get('/upcoming', trainingController.getUpcomingTrainings);
router.get('/trainers/search', trainingController.searchTrainers);
router.get('/trainers/:id/statistics', trainingController.getTrainerStatistics);

module.exports = router;
