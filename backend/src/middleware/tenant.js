const jwt = require('jsonwebtoken');
const { Organization } = require('../services/db.service');

const tenantMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_change_this');
    req.user = decoded;

    if (req.user.role === 'SUPER_ADMIN') return next();

    // 1. EXTRACT TENANT SLUG FROM HEADERS OR SUBDOMAIN
    let slug = null;
    const host = req.headers.host || '';

    if (req.headers['x-tenant-slug']) {
      slug = req.headers['x-tenant-slug'];
    } else if (host) {
      const parts = host.split('.');
      if (parts.length > 2 && !host.includes('127.0.0.1')) {
        slug = parts[0];
      }
    }

    let org = null;

    if (slug) {
      // Resolve by slug (MongoDB)
      org = await Organization.findOne({ slug }).lean();
      if (!org) {
        return res.status(404).json({ message: `Organization with subdomain "${slug}" not found` });
      }

      // Enforce user ↔ org membership
      const orgId = org._id.toString();
      const userOrgId = String(req.user.organizationId || '');
      if (userOrgId && orgId !== userOrgId) {
        return res.status(403).json({ message: 'You do not have access to this organization subdomain' });
      }
    } else {
      // Fallback: resolve by organizationId from JWT
      const orgId = req.user.organizationId;
      if (!orgId) {
        return res.status(403).json({ message: 'Organization context missing' });
      }
      org = await Organization.findById(orgId).lean();
    }

    if (!org) return res.status(404).json({ message: 'Organization not found' });
    if (org.status === 'SUSPENDED') {
      return res.status(403).json({ message: 'Organization account is suspended' });
    }

    // 2. SUBSCRIPTION / PAYMENT ENFORCEMENT
    const sub = org.subscription || {};
    const isTrialActive = sub.status === 'TRIAL' && sub.trialEndsAt && new Date(sub.trialEndsAt) > new Date();
    const isPaidActive  = ['ACTIVE', 'APPROVED', 'PAID'].includes(sub.status);
    const isFrozen      = ['PAST_DUE', 'CANCELED', 'EXPIRED'].includes(sub.status);

    const isBillingRoute = req.originalUrl && (
      req.originalUrl.includes('/plans') ||
      req.originalUrl.includes('/checkout') ||
      req.originalUrl.includes('/upgrade') ||
      req.originalUrl.includes('/subscription') ||
      req.originalUrl.includes('/stripe-mock')
    );

    if (isFrozen && req.method !== 'GET' && !isBillingRoute) {
      return res.status(402).json({
        message: 'Your organization subscription is PAST_DUE or CANCELED. Access is frozen in read-only mode. Please complete billing to restore write access.',
        reason: 'SUBSCRIPTION_FROZEN',
        organizationName: org.name
      });
    }

    if (!isTrialActive && !isPaidActive && !isFrozen && !isBillingRoute) {
      return res.status(402).json({
        message: 'Payment Required',
        reason: 'SUBSCRIPTION_EXPIRED',
        organizationName: org.name
      });
    }

    req.organizationId = org._id.toString();
    req.organization   = org;
    next();
  } catch (error) {
    console.error('Tenant Middleware Error:', error);
    return res.status(401).json({ message: 'Invalid token or session expired' });
  }
};

module.exports = tenantMiddleware;
