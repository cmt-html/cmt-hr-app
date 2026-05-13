const mockDb = require('../services/mock.service');

const planMiddleware = (requiredFeature) => {
  return async (req, res, next) => {
    try {
      // Super admins bypass plan checks
      if (req.user && req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      const org = req.organization;
      if (!org) return res.status(404).json({ message: 'Organization context missing' });

      // Trial organizations can access everything for now
      if (org.subscription?.status === 'TRIAL') {
        return next();
      }

      // Check for active plan
      if (!org.subscription?.planId) {
        return res.status(403).json({ message: 'No active subscription found. Please upgrade.' });
      }

      const plan = mockDb.findOne('plans', { id: org.subscription.planId });
      
      // If feature check is requested but not present in plan
      if (plan && plan.features && !plan.features.includes(requiredFeature)) {
        // For development/mock purposes, we allow employee-limit if it's not explicitly blocked
        if (requiredFeature === 'employee-limit') return next();
        
        return res.status(403).json({ 
          message: `Your current plan (${plan.name}) does not include the ${requiredFeature} feature.` 
        });
      }

      next();
    } catch (error) {
      console.error('Plan Middleware Error:', error);
      // Fail safe: allow the request but log the error
      next();
    }
  };
};

module.exports = planMiddleware;
