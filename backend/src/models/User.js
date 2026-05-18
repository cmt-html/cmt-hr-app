const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER', 'TEAM_MANAGER', 'EMPLOYEE'], 
    default: 'EMPLOYEE' 
  },
  phone: String,
  designation: String,
  department: String,
  employeeId: { type: String, sparse: true },
  dateOfJoining: Date,
  emergencyContact: String,
  emergencyContactName: String,
  profilePicture: String,
  managerId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'], default: 'ACTIVE' }
}, { timestamps: true });

// Ensure emails are unique within the entire system (since it's a login identifier)
// (Index automatically created by unique: true in schema definition)

// Optional: Ensure employee IDs are unique per organization
userSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
