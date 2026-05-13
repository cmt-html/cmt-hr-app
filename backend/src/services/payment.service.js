const Razorpay = require('razorpay');
const crypto = require('crypto');

// These should be in .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret',
});

exports.createSubscription = async (planId, customerId) => {
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // For 1 year monthly
      addons: [],
      notes: {
        customerId
      }
    });
    return subscription;
  } catch (error) {
    throw new Error('Razorpay subscription creation failed: ' + error.message);
  }
};

exports.verifyWebhookSignature = (body, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
    
  return expectedSignature === signature;
};
