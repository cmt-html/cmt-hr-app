const prisma = require('../../services/prisma.service');
const mockDb = require('../../services/mock.service');
const paymentService = require('../../services/payment.service');

exports.getAvailablePlans = async (req, res) => {
  try {
    // --- PRISMA/POSTGRES MODE ---
    try {
      const plans = await prisma.plan.findMany({ where: { isActive: true } });
      return res.json(plans);
    } catch (dbError) {
      console.warn('⚠️ Plan Postgres Error, using Mock');
    }

    // --- MOCK MODE FALLBACK ---
    const plans = mockDb.find('plans', { isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;
    const organizationId = req.organizationId;

    // 1. Fetch Plan Details
    let plan;
    try {
      plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (!plan) {
        plan = mockDb.findOne('plans', { id: planId });
      }
    } catch (e) {
      plan = mockDb.findOne('plans', { id: planId });
    }

    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // 2. Create Razorpay Subscription
    // Note: In production, plan.razorpayPlanId would be used
    const rzpSubscription = await paymentService.createSubscription(
      plan.razorpayPlanId || 'plan_mock_123',
      organizationId
    );

    const isMock = !process.env.RAZORPAY_KEY_ID || 
                   process.env.RAZORPAY_KEY_ID === 'rzp_test_key' || 
                   (rzpSubscription.id && rzpSubscription.id.startsWith('sub_'));

    const subscriptionStatus = isMock ? 'ACTIVE' : 'PENDING_PAYMENT';
    const organizationStatus = 'APPROVED';

    // 3. Update Organization
    try {
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          status: organizationStatus,
          subscription: {
            planId,
            status: subscriptionStatus,
            razorpaySubscriptionId: rzpSubscription.id,
            updatedAt: new Date()
          }
        }
      });
    } catch (e) {
      mockDb.update('organizations', organizationId, {
        status: organizationStatus,
        subscription: { planId, status: subscriptionStatus, razorpaySubscriptionId: rzpSubscription.id }
      });
    }

    res.json({
      subscriptionId: rzpSubscription.id,
      shortUrl: rzpSubscription.short_url,
      message: isMock ? 'Subscription activated (Mock)' : 'Subscription initiated'
    });
  } catch (error) {
    res.status(500).json({ message: 'Checkout failed', error: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const isValid = paymentService.verifyWebhookSignature(req.body, signature);

    if (!isValid) return res.status(400).send('Invalid signature');

    const { event, payload } = req.body;

    if (event === 'subscription.authenticated' || event === 'subscription.activated') {
      const rzpSubId = payload.subscription.entity.id;
      const orgId = payload.subscription.entity.notes.customerId;

      // Update Organization to ACTIVE
      try {
        await prisma.organization.update({
          where: { id: orgId },
          data: {
            status: 'APPROVED',
            subscription: {
              ...payload.subscription.entity,
              status: 'ACTIVE'
            }
          }
        });
        console.log(`✅ Organization ${orgId} activated via Payment`);
      } catch (e) {
        mockDb.update('organizations', orgId, { status: 'APPROVED', subscription: { status: 'ACTIVE' } });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(500).send('Webhook Processing Failed');
  }
};

exports.upgradeSubscription = async (req, res) => {
  try {
    const { planId, simulateFailure } = req.body;
    const organizationId = req.organizationId;
    
    if (!planId) return res.status(400).json({ message: 'Plan ID is required' });

    let plan;
    try {
      plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (!plan) {
        plan = mockDb.findOne('plans', { id: planId });
      }
    } catch (e) {
      plan = mockDb.findOne('plans', { id: planId });
    }
    
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    
    const newStatus = simulateFailure ? 'PAST_DUE' : 'ACTIVE';
    const subData = {
      planId,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      billingCycleStart: new Date().toISOString(),
      billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Update organization
    try {
      await prisma.organization.update({
        where: { id: organizationId },
        data: { subscription: subData }
      });
    } catch (e) {
      // ignore, fall back to mock
    }
    
    const updatedOrg = mockDb.update('organizations', organizationId, {
      subscription: subData
    });
    
    res.json({
      message: simulateFailure ? 'Payment failed simulation triggered. Organization is now PAST_DUE.' : `Successfully upgraded to ${plan.name} plan!`,
      organization: updatedOrg
    });
  } catch (error) {
    res.status(500).json({ message: 'Upgrade failed', error: error.message });
  }
};

exports.handleStripeMock = async (req, res) => {
  try {
    const { organizationId, slug, status } = req.body;
    
    let org;
    if (organizationId) {
      org = mockDb.findOne('organizations', { id: organizationId });
    } else if (slug) {
      org = mockDb.findOne('organizations', { slug });
    }
    
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    const validStatuses = ['ACTIVE', 'TRIAL', 'EXPIRED', 'PAST_DUE', 'CANCELED'];
    const newStatus = status ? status.toUpperCase() : 'ACTIVE';
    
    const updatedSub = {
      ...(org.subscription || {}),
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    // update in Postgres if needed
    try {
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          subscription: updatedSub
        }
      });
    } catch (e) {
      // Ignore postgres error, use Mock fallback
    }
    
    const updatedOrg = mockDb.update('organizations', org.id, {
      subscription: updatedSub
    });
    
    res.json({
      message: `Subscription status for organization ${org.name} successfully updated to ${newStatus}`,
      organization: updatedOrg
    });
  } catch (error) {
    res.status(500).json({ message: 'Mock webhook processing failed', error: error.message });
  }
};
