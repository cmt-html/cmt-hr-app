const express = require('express');
const router = express.Router();
const tenantMiddleware = require('../middleware/tenant');

// This would handle Razorpay subscription creation, etc.
// For now, placeholders for Org Admins to manage their own billing

router.use(tenantMiddleware);

router.get('/subscription', (req, res) => {
  res.json({
    organization: req.organization.name,
    subscription: req.organization.subscription
  });
});

module.exports = router;
