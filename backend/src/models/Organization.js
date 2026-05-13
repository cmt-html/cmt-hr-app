const mongoose = require('mongoose');
const { Schema } = mongoose;

const organizationSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  address: String,
  logo: String,
  branding: {
    primaryColor: { type: String, default: '#007AFF' },
    secondaryColor: { type: String, default: '#5856D6' }
  },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'], default: 'PENDING' },
  subscription: {
    planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    status: { type: String, enum: ['ACTIVE', 'TRIAL', 'EXPIRED', 'PAST_DUE', 'CANCELED'], default: 'TRIAL' },
    trialEndsAt: Date,
    currentPeriodEnd: Date,
    razorpaySubscriptionId: String,
    razorpayCustomerId: String
  },
  settings: {
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    attendance: {
      geoFencing: { type: Boolean, default: false },
      faceRecognition: { type: Boolean, default: false },
      qrAttendance: { type: Boolean, default: false },
      wifiAttendance: { type: Boolean, default: false }
    },
    payroll: {
      taxCalculation: { type: Boolean, default: false },
      autoPayslip: { type: Boolean, default: false }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
