const express = require('express');
const router = express.Router();
const {
  getMonthlyDashboard,
  getYearlySummary,
  getCalendarSummary,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/monthly', getMonthlyDashboard);
router.get('/yearly', getYearlySummary);
router.get('/calendar', getCalendarSummary);

module.exports = router;
