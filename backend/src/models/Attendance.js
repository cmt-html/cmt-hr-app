const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Flat Attendance schema — mirrors how the controllers treat attendance records.
 * checkIn and checkOut are plain Date fields (not nested objects).
 */
const attendanceSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  checkIn:        { type: Date, required: true },
  checkOut:       { type: Date, default: null },
  location:       { type: String, default: 'Remote' },
  status:         { type: String, enum: ['PRESENT', 'LATE', 'ABSENT', 'HALF_DAY'], default: 'PRESENT' },
  regularizationStatus: { type: String, enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'], default: 'NONE' },
  regularizationReason: String,
  date:           { type: Date }  // optional — for regularization records that set a past date
}, { timestamps: true });

// One active session per user per day
attendanceSchema.index({ userId: 1, checkIn: 1 });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
