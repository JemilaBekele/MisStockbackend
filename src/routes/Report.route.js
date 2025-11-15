const express = require('express');
const { ReportController } = require('../controllers');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/api/trend', ReportController.getSellTrend);
router.get('/api/total-sold', auth, ReportController.getTotalSold);
router.get('/api/trend/all/sell', auth, ReportController.getAllSells);
router.get(
  '/api/reports/sales/rank',
  auth,
  ReportController.generateSalesReportsController,
);

router.get(
  '/api/reports/sales/user/dashboard',
  auth,
  ReportController.getUserDashboardSummary,
);
router.get(
  '/api/reports/sales/user/creator/dashboard',
  auth,
  ReportController.getSalesCreatorDashboardSummary,
);
module.exports = router;
