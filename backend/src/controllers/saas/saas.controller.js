const Organization = require('../../models/Organization');
const Plan = require('../../models/Plan');
const paymentService = require('../../services/payment.service');

exports.getAvailablePlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId, interval } = req.body; // interval: 'monthly' or 'yearly'
    const org = req.organization;
    
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // In a real scenario, you'd create a Razorpay/Stripe session here
    // For now, we'll return a mock session ID
    res.json({
      sessionId: 'mock_session_' + Date.now(),
      amount: interval === 'monthly' ? plan.price.monthly : plan.price.yearly,
      currency: 'INR'
    });
  } catch (error) {
    res.status(500).json({ message: 'Checkout failed', error: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  // Logic to handle Razorpay/Stripe webhooks and update subscription status
  const event = req.body.event;
  console.log('Received SaaS Webhook:', event);
  res.status(200).send('Webhook Received');
};
