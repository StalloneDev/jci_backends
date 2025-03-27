const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const memberRoutes = require('./member.routes');
const commissionRoutes = require('./commission.routes');
const meetingRoutes = require('./meeting.routes');
const trainingRoutes = require('./training.routes');
const roleRoutes = require('./role.routes');
const reportRoutes = require('./report.routes');
const exportRoutes = require('./export.routes');

// Routes publiques
router.use('/auth', authRoutes);

// Routes protégées
router.use('/members', memberRoutes);
router.use('/commissions', commissionRoutes);
router.use('/meetings', meetingRoutes);
router.use('/trainings', trainingRoutes);
router.use('/roles', roleRoutes);
router.use('/reports', reportRoutes);
router.use('/exports', exportRoutes);

module.exports = router;
