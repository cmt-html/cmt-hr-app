const mongoose = require('mongoose');
const { Schema } = mongoose;

const configSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true, unique: true, required: true },
  windowStart: { type: String, default: '08:00 AM' },
  windowEnd: { type: String, default: '08:00 PM' },
  requiredHours: { type: Number, default: 9 },
  minPresentMinutes: { type: Number, default: 500 }
}, { timestamps: true });

module.exports = mongoose.model('WorkingConfig', configSchema);
