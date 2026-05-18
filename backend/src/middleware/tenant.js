const jwt = require('jsonwebtoken');
const prisma = require('../services/prisma.service');
const mockDb = require('../services/mock.service');

const tenantMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (req.user.role === 'SUPER_ADMIN') return next();
    if (!req.user.organizationId) return res.status(403).json({ message: 'Organization context missing' });

    let org;
    try {
      org = await prisma.organization.findUnique({ where: { id: req.user.organizationId } });
    } catch (err) {
      console.warn('⚠️ Prisma error in middleware, using Mock');
      org = mockDb.findOne('organizations', { id: req.user.organizationId });
    }

    if (!org) return res.status(404).json({ message: 'Organization not found' });
    if (org.status === 'SUSPENDED') return res.status(403).json({ message: 'Organization is suspended' });

    // --- PAYMENT ENFORCEMENT ---
    const sub = org.subscription || {};
    const isTrialActive = sub.status === 'TRIAL' && sub.trialEndsAt && new Date(sub.trialEndsAt) > new Date();
    const isPaidActive = sub.status === 'ACTIVE' || sub.status === 'APPROVED' || sub.status === 'PAID';

    if (!isTrialActive && !isPaidActive && req.user.role !== 'SUPER_ADMIN') {
      return res.status(402).json({ 
        message: 'Payment Required', 
        reason: 'SUBSCRIPTION_EXPIRED',
        organizationName: org.name
      });
    }

    req.organizationId = req.user.organizationId;
    req.organization = org;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token or session expired' });
  }
};

module.exports = tenantMiddleware;
