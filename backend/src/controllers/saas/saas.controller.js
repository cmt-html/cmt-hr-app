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

    // 3. Update Organization with Pending Subscription
    try {
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          subscription: {
            planId,
            status: 'PENDING_PAYMENT',
            razorpaySubscriptionId: rzpSubscription.id,
            updatedAt: new Date()
          }
        }
      });
    } catch (e) {
      mockDb.update('organizations', organizationId, {
        subscription: { planId, status: 'PENDING_PAYMENT', razorpaySubscriptionId: rzpSubscription.id }
      });
    }

    res.json({
      subscriptionId: rzpSubscription.id,
      shortUrl: rzpSubscription.short_url,
      message: 'Subscription initiated'
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
