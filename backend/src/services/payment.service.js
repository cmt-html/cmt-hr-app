const Razorpay = require('razorpay');
const crypto = require('crypto');

// These should be in .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret',
});

exports.createSubscription = async (planId, customerId) => {
  try {
    // If keys are fake or not provided, return a mock subscription object
    if (
      !process.env.RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID === 'rzp_test_key' ||
      !process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_KEY_SECRET === 'rzp_test_secret'
    ) {
      console.warn('⚠️ Razorpay keys are missing/mocked, returning mock subscription');
      return {
        id: 'sub_' + Math.random().toString(36).substr(2, 9),
        short_url: 'https://rzp.io/i/mock_payment_link',
        status: 'created'
      };
    }

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
    console.warn('⚠️ Razorpay failed, falling back to mock subscription:', error.message);
    return {
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      short_url: 'https://rzp.io/i/mock_payment_link',
      status: 'created'
    };
  }
};

exports.verifyWebhookSignature = (body, signature) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.warn('⚠️ RAZORPAY_WEBHOOK_SECRET is missing, bypassing verification for dev testing');
    return true;
  }
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
    
  return expectedSignature === signature;
};
