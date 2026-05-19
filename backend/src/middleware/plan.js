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

      // Trial/Approved orgs still need a plan check unless status is TRIAL
      const isTrial = org.subscription?.status === 'TRIAL';
      
      // Get current subscription plan
      const planId = org.subscription?.planId || '1'; // Default to Free plan if none set
      const plan = mockDb.findOne('plans', { id: planId });

      if (!plan && !isTrial) {
        return res.status(403).json({ message: 'No active subscription plan found. Please select a plan.' });
      }

      // 1. Gating by employee limits
      if (requiredFeature === 'employee-limit') {
        const currentCount = mockDb.count('users', { organizationId: org.id });
        const maxEmployees = plan ? plan.maxEmployees : 10;

        if (currentCount >= maxEmployees) {
          return res.status(403).json({
            message: `Employee limit exceeded! Your current plan (${plan?.name || 'Free'}) only allows up to ${maxEmployees} employees. Please upgrade to add more.`,
            limitExceeded: true,
            currentCount,
            maxLimit: maxEmployees
          });
        }
        return next();
      }

      // 2. Feature-specific gating rules
      if (plan) {
        if (requiredFeature === 'custom-form-builder') {
          if (plan.id === '1') {
            return res.status(403).json({ 
              message: 'Custom Form Builder is not available on the Free plan. Please upgrade to Pro.' 
            });
          }
        }

        if (requiredFeature === 'api-access') {
          if (plan.id === '1') {
            return res.status(403).json({ 
              message: 'API access is not available on the Free plan. Please upgrade to Pro.' 
            });
          }
        }

        if (requiredFeature === 'sso') {
          if (plan.id !== '3') {
            return res.status(403).json({ 
              message: 'Single Sign-On (SSO) is exclusive to our Enterprise plan. Please contact sales to upgrade.' 
            });
          }
        }

        if (requiredFeature === 'priority-support') {
          if (plan.id !== '3') {
            return res.status(403).json({ 
              message: 'Priority support is exclusive to our Enterprise plan. Please upgrade.' 
            });
          }
        }
      }

      next();
    } catch (error) {
      console.error('Plan Middleware Error:', error);
      // Fallback
      next();
    }
  };
};

module.exports = planMiddleware;
