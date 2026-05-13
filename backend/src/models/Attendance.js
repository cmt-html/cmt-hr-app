const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  date: { type: Date, required: true },
  checkIn: {
    time: Date,
    location: { type: { type: String, default: 'Point' }, coordinates: [Number] },
    selfieUrl: String,
    method: { type: String, enum: ['GPS', 'QR', 'MANUAL', 'FACE'] },
    address: String
  },
  checkOut: {
    time: Date,
    location: { type: { type: String, default: 'Point' }, coordinates: [Number] },
    address: String
  },
  status: { type: String, enum: ['PRESENT', 'LATE', 'ABSENT', 'HALF_DAY'], default: 'PRESENT' },
  overtimeHours: { type: Number, default: 0 },
  regularizationStatus: { type: String, enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'], default: 'NONE' },
  regularizationReason: String
}, { timestamps: true });

// Ensure one attendance record per user per day per organization
attendanceSchema.index({ organizationId: 1, userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
