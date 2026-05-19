const { Organization, Plan } = require('../../services/db.service');
const paymentService = require('../../services/payment.service');
const mongoose = require('mongoose');

exports.getAvailablePlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).lean();
    res.json(plans.map(p => ({ ...p, id: p._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;
    const organizationId = req.organizationId;

    if (!planId || !mongoose.isValidObjectId(planId)) {
      return res.status(400).json({ message: 'Valid Plan ID is required' });
    }

    const plan = await Plan.findById(planId).lean();
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const rzpSubscription = await paymentService.createSubscription(
      plan.razorpayPlanIdMonthly || plan.razorpayPlanIdYearly || 'plan_mock_123',
      organizationId
    );

    const isMock = !process.env.RAZORPAY_KEY_ID ||
                   process.env.RAZORPAY_KEY_ID === 'rzp_test_key' ||
                   (rzpSubscription.id && rzpSubscription.id.startsWith('sub_'));

    const subscriptionStatus = isMock ? 'ACTIVE' : 'PENDING_PAYMENT';
    const organizationStatus = 'APPROVED';

    const updatedOrg = await Organization.findByIdAndUpdate(
      organizationId,
      {
        $set: {
          status: organizationStatus,
          'subscription.planId': planId,
          'subscription.status': subscriptionStatus,
          'subscription.razorpaySubscriptionId': rzpSubscription.id,
          'subscription.currentPeriodEnd': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      { new: true }
    ).lean();

    res.json({
      subscriptionId: rzpSubscription.id,
      shortUrl: rzpSubscription.short_url,
      message: isMock ? 'Subscription activated (Mock)' : 'Subscription initiated',
      organization: { ...updatedOrg, id: updatedOrg._id.toString() }
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

      if (mongoose.isValidObjectId(orgId)) {
        await Organization.findByIdAndUpdate(orgId, {
          $set: {
            status: 'APPROVED',
            'subscription.status': 'ACTIVE',
            'subscription.razorpaySubscriptionId': rzpSubId
          }
        });
        console.log(`✅ Organization ${orgId} activated via Razorpay webhook`);
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

    if (!planId || !mongoose.isValidObjectId(planId)) {
      return res.status(400).json({ message: 'Valid Plan ID is required' });
    }

    const plan = await Plan.findById(planId).lean();
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const newStatus = simulateFailure ? 'PAST_DUE' : 'ACTIVE';
    const subData = {
      planId,
      status: newStatus,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    const updatedOrg = await Organization.findByIdAndUpdate(
      organizationId,
      { $set: { subscription: subData } },
      { new: true }
    ).lean();

    res.json({
      message: simulateFailure ? 'Payment failed simulation triggered. Organization is now PAST_DUE.' : `Successfully upgraded to ${plan.name} plan!`,
      organization: { ...updatedOrg, id: updatedOrg._id.toString() }
    });
  } catch (error) {
    res.status(500).json({ message: 'Upgrade failed', error: error.message });
  }
};

exports.handleStripeMock = async (req, res) => {
  try {
    const { organizationId, slug, status } = req.body;

    let query = {};
    if (organizationId && mongoose.isValidObjectId(organizationId)) {
      query._id = organizationId;
    } else if (slug) {
      query.slug = slug;
    } else {
      return res.status(400).json({ message: 'organizationId or slug is required' });
    }

    const org = await Organization.findOne(query).lean();
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const newStatus = status ? status.toUpperCase() : 'ACTIVE';

    const updatedOrg = await Organization.findByIdAndUpdate(
      org._id,
      { $set: { 'subscription.status': newStatus } },
      { new: true }
    ).lean();

    res.json({
      message: `Subscription status successfully updated to ${newStatus}`,
      organization: { ...updatedOrg, id: updatedOrg._id.toString() }
    });
  } catch (error) {
    res.status(500).json({ message: 'Mock webhook processing failed', error: error.message });
  }
};
