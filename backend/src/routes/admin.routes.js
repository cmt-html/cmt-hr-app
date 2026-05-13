const express = require('express');
const router = express.Router();
const orgController = require('../controllers/admin/organization.controller');
const planController = require('../controllers/admin/plan.controller');
const tenantMiddleware = require('../middleware/tenant');

// Middleware to ensure user is SUPER_ADMIN
const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Super Admin access required' });
  }
};

router.use(tenantMiddleware);
router.use(superAdminOnly);

// Organization Management
router.get('/organizations', orgController.getAllOrganizations);
router.put('/organizations/:orgId/status', orgController.updateOrganizationStatus);
router.get('/analytics', orgController.getOrganizationAnalytics);

// Plan Management
router.post('/plans', planController.createPlan);
router.get('/plans', planController.getAllPlans);
router.put('/plans/:planId', planController.updatePlan);

module.exports = router;
