const mongoose = require('mongoose');
const { Schema } = mongoose;

const planSchema = new Schema({
  name: { type: String, required: true, unique: true }, // Starter, Pro, Enterprise
  description: String,
  price: {
    monthly: { type: Number, required: true },
    yearly: { type: Number, required: true }
  },
  features: [String], // e.g., ['payroll', 'attendance', 'recruitment', 'ai-assistant']
  limits: {
    maxEmployees: { type: Number, default: 10 },
    storageGB: { type: Number, default: 1 }
  },
  isActive: { type: Boolean, default: true },
  razorpayPlanIdMonthly: String,
  razorpayPlanIdYearly: String
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
