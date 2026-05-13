const mongoose = require('mongoose');
const { Schema } = mongoose;

const leaveSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  type: { type: String, enum: ['SICK', 'CASUAL', 'ANNUAL', 'MATERNITY', 'PATERNITY', 'WFH'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  appliedAt: { type: Date, default: Date.now },
  managerId: { type: Schema.Types.ObjectId, ref: 'User' },
  comments: String
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
