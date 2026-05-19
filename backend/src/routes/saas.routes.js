const express = require('express');
const router = express.Router();
const tenantMiddleware = require('../middleware/tenant');
const saasController = require('../controllers/saas/saas.controller');

// Razorpay webhook is public
router.post('/webhook', saasController.handleWebhook);

// All subsequent routes require a valid tenant token
router.use(tenantMiddleware);

router.get('/plans', saasController.getAvailablePlans);
router.post('/checkout', saasController.createCheckoutSession);
router.post('/upgrade', saasController.upgradeSubscription);

router.get('/subscription', (req, res) => {
  res.json({
    organization: req.organization.name,
    subscription: req.organization.subscription
  });
});

module.exports = router;
