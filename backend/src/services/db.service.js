const mongoose = require('mongoose');

// ── Centralized Mongoose DB service ──────────────────────────────────────────
// Import all models here so controllers only need: const { User, Org, ... } = require('./db.service');

const Organization = require('../models/Organization');
const User         = require('../models/User');
const Plan         = require('../models/Plan');
const Attendance   = require('../models/Attendance');
const Leave        = require('../models/Leave');
const WorkingConfig = require('../models/WorkingConfig');

// Dynamically-created models for collections the app needs but had no schema yet
// (These were previously only stored in mock_db.json)

// ── Announcement ──
const announcementSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  title:      { type: String, required: true },
  content:    { type: String, required: true },
  type:       { type: String, enum: ['GENERAL', 'POLICY', 'EVENT', 'URGENT'], default: 'GENERAL' },
  authorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  likes:      [String],         // array of userId strings
  comments:   [{
    userId:    String,
    userName:  String,
    text:      String,
    comment:   String,          // legacy alias
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

// ── Invitation ──
const invitationSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  email:       { type: String, required: true },
  firstName:   String,
  lastName:    String,
  role:        { type: String, default: 'EMPLOYEE' },
  designation: String,
  department:  String,
  status:      { type: String, enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELED'], default: 'PENDING' }
}, { timestamps: true });

const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);

// ── OKR Goal ──
const goalSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:         { type: String, required: true },
  description:   String,
  targetValue:   { type: Number, default: 100 },
  currentValue:  { type: Number, default: 0 },
  unit:          { type: String, default: '%' },
  dueDate:       Date,
  status:        { type: String, enum: ['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELED', 'APPROVED'], default: 'ACTIVE' },
  managerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);

// ── Review ──
const reviewSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  period:         String,
  selfReview:     String,
  managerReview:  String,
  rating:         Number,
  status:         { type: String, enum: ['PENDING_SELF', 'PENDING_MANAGER', 'COMPLETED'], default: 'PENDING_SELF' }
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

// ── Job Post ──
const jobSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  title:          { type: String, required: true },
  department:     String,
  location:       String,
  type:           { type: String, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'], default: 'FULL_TIME' },
  description:    String,
  requirements:   [String],
  status:         { type: String, enum: ['OPEN', 'CLOSED', 'DRAFT'], default: 'OPEN' },
  postedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

// ── Applicant ──
const applicantSchema = new mongoose.Schema({
  organizationId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  jobId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  name:            { type: String, required: true },
  email:           String,
  phone:           String,
  resumeUrl:       String,
  status:          { type: String, enum: ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'], default: 'APPLIED' },
  onboardingTasks: [{
    id:          String,
    title:       String,
    status:      { type: String, enum: ['PENDING', 'DONE'], default: 'PENDING' }
  }],
  notes:           String
}, { timestamps: true });

const Applicant = mongoose.models.Applicant || mongoose.model('Applicant', applicantSchema);

// ── Separation ──
const separationSchema = new mongoose.Schema({
  organizationId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason:            String,
  lastWorkingDay:    Date,
  status:            { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'], default: 'PENDING' },
  offboardingTasks:  [{
    id:       String,
    title:    String,
    status:   { type: String, enum: ['PENDING', 'DONE'], default: 'PENDING' }
  }]
}, { timestamps: true });

const Separation = mongoose.models.Separation || mongoose.model('Separation', separationSchema);

// ── Help Desk Ticket ──
const ticketSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:          { type: String, required: true },
  description:    String,
  category:       { type: String, default: 'GENERAL' },
  priority:       { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  status:         { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  comments:       [{
    userId:    String,
    userName:  String,
    text:      String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

// ── Custom Form Field ──
const customFieldSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name:           { type: String, required: true },
  label:          String,
  type:           { type: String, enum: ['TEXT', 'NUMBER', 'DATE', 'DROPDOWN', 'CHECKBOX'], default: 'TEXT' },
  required:       { type: Boolean, default: false },
  options:        [String],
  module:         { type: String, default: 'EMPLOYEE' }
}, { timestamps: true });

const CustomField = mongoose.models.CustomField || mongoose.model('CustomField', customFieldSchema);

// ── Document ──
const documentSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:           { type: String, required: true },
  url:            String,
  type:           String,
  sizeKB:         Number
}, { timestamps: true });

const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);

// ── Timesheet ──
const timesheetSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectName:    { type: String, required: true },
  task:           String,
  hours:          { type: Number, required: true },
  date:           { type: Date, required: true },
  status:         { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  notes:          String
}, { timestamps: true });

const Timesheet = mongoose.models.Timesheet || mongoose.model('Timesheet', timesheetSchema);

module.exports = {
  Organization,
  User,
  Plan,
  Attendance,
  Leave,
  WorkingConfig,
  Announcement,
  Invitation,
  Goal,
  Review,
  Job,
  Applicant,
  Separation,
  Ticket,
  CustomField,
  Document,
  Timesheet,
};
