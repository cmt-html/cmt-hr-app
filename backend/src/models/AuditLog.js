const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true }, // e.g., 'EMPLOYEE_CREATED', 'PAYROLL_GENERATED'
  resource: { type: String, required: true }, // e.g., 'User', 'Payroll'
  resourceId: Schema.Types.ObjectId,
  details: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
