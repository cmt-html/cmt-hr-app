const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const saasRoutes = require('./saas.routes');

const attendanceController = require('../controllers/attendance.controller');
const userController = require('../controllers/user.controller');
const announcementController = require('../controllers/announcement.controller');
const leaveController = require('../controllers/leave.controller');
const configController = require('../controllers/config.controller');
const dashboardController = require('../controllers/dashboard.controller');

// New Zoho Replica Controllers
const performanceController = require('../controllers/performance.controller');
const hiringController = require('../controllers/hiring.controller');
const ticketController = require('../controllers/ticket.controller');
const formBuilderController = require('../controllers/formbuilder.controller');
const documentController = require('../controllers/document.controller');
const timesheetController = require('../controllers/timesheet.controller');
const chatbotController = require('../controllers/chatbot.controller');
const saasController = require('../controllers/saas/saas.controller');

const tenantMiddleware = require('../middleware/tenant');
const planMiddleware = require('../middleware/plan');

// 1. Auth Routes (Public)
router.use('/auth', authRoutes);

// 2. Super Admin Routes
router.use('/super', adminRoutes);

// 3. SaaS & Billing Routes
router.use('/saas', saasRoutes);

// Public webhook route (bypasses tenant token checking, but acts on tenant via body parameters)
router.post('/webhooks/stripe-mock', saasController.handleStripeMock);

// 4. Tenant Protected Routes (Attendance, HR, Employee)
router.use(tenantMiddleware);

// Dashboard
router.get('/dashboard', dashboardController.getDashboardData);

// Attendance
router.post('/attendance/check-in', attendanceController.checkIn);
router.post('/attendance/check-out', attendanceController.checkOut);
router.post('/attendance/regularize', attendanceController.regularize);
router.get('/attendance/report-data', attendanceController.getMonthlyReportData);
router.get('/attendance/report', attendanceController.getMonthlyReport);
router.get('/attendance/history/:userId', attendanceController.getAttendanceHistory);

// Employee Management
router.get('/employees', userController.getAllEmployees);
router.post('/employees', planMiddleware('employee-limit'), userController.createIndividualUser);
router.post('/employees/invite', planMiddleware('employee-limit'), userController.inviteEmployee);
router.get('/employees/invites', userController.getInvites);
router.get('/profile/:userId', userController.getUserProfile);
router.put('/profile/:userId', userController.updateProfile);

// Leave
router.get('/leave/stats/:userId', leaveController.getLeaveStats);
router.get('/leave/history/:userId', leaveController.getUserHistory);
router.post('/leave/apply', leaveController.applyLeave);
router.get('/leave/requests', leaveController.getManagerRequests);
router.put('/leave/approve/:leaveId', leaveController.approveLeave);

// Config
router.get('/config/working-hours', configController.getConfig);
router.put('/config/working-hours', configController.updateConfig);

// Announcements
router.get('/announcements', announcementController.getAnnouncements);
router.post('/announcements', announcementController.createAnnouncement);
router.put('/announcements/:announcementId/like', announcementController.likeAnnouncement);
router.post('/announcements/:announcementId/comment', announcementController.commentAnnouncement);

// ==========================================
//          ZOHO HR NEW ENDPOINTS
// ==========================================

// Performance OKRs & Goals
router.post('/goals', performanceController.createGoal);
router.get('/goals/:userId', performanceController.getGoals);
router.put('/goals/:goalId', performanceController.updateGoalProgress);
router.put('/goals/:goalId/approve', performanceController.approveGoal);

// Performance Reviews
router.post('/reviews', performanceController.createReviewCycle);
router.put('/reviews/:reviewId/self', performanceController.submitSelfReview);
router.put('/reviews/:reviewId/manager', performanceController.submitManagerReview);
router.get('/reviews/:userId', performanceController.getReviews);

// Hiring & Onboarding
router.post('/jobs', hiringController.createJob);
router.get('/jobs', hiringController.getJobs);
router.post('/jobs/apply', hiringController.applyJob);
router.get('/applicants', hiringController.getApplicants);
router.put('/applicants/:applicantId/status', hiringController.updateApplicantStatus);
router.put('/applicants/:applicantId/onboarding-task', hiringController.updateOnboardingTask);

// Separation/Offboarding
router.post('/separations', hiringController.requestSeparation);
router.get('/separations', hiringController.getSeparations);
router.put('/separations/:exitId/status', hiringController.updateExitStatus);
router.put('/separations/:exitId/offboarding-task', hiringController.updateExitTask);

// Help Desk Query Tickets
router.post('/tickets', ticketController.createTicket);
router.get('/tickets', ticketController.getTickets);
router.post('/tickets/:ticketId/comment', ticketController.addComment);
router.put('/tickets/:ticketId/status', ticketController.updateTicketStatus);

// System Custom Form Builder Fields
router.post('/custom-fields', formBuilderController.createCustomField);
router.get('/custom-fields', formBuilderController.getCustomFields);
router.delete('/custom-fields/:fieldId', formBuilderController.deleteCustomField);

// Document Vault
router.post('/documents/upload', documentController.uploadDocument);
router.get('/documents/:userId', documentController.getDocuments);

// Project Timesheets
router.post('/timesheets', timesheetController.logHours);
router.get('/timesheets', timesheetController.getTimesheets);
router.put('/timesheets/:timesheetId/status', timesheetController.updateTimesheetStatus);

// FAQ AI Chatbot Simulation
router.post('/chatbot/ask', chatbotController.askChatbot);

module.exports = router;
