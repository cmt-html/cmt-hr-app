const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const dashboardController = require('../controllers/dashboard.controller');
const attendanceController = require('../controllers/attendance.controller');
const userController = require('../controllers/user.controller');
const announcementController = require('../controllers/announcement.controller');
const leaveController = require('../controllers/leave.controller');
const configController = require('../controllers/config.controller');
const organizationController = require('../controllers/organization.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Auth routes
router.post('/auth/login', authController.login);
router.post('/organizations/register', organizationController.registerOrganization);

// Protected Routes (require authentication)
router.use(authMiddleware);

// Organization Management (Super Admin)
router.get('/super/organizations', organizationController.getAllOrganizations);
router.get('/super/stats', organizationController.getOrganizationStats);
router.put('/super/organizations/:orgId/status', organizationController.updateOrganizationStatus);


// Dashboard routes
router.get('/dashboard', dashboardController.getDashboardData);

// Attendance routes
router.post('/attendance/check-in', attendanceController.checkIn);
router.post('/attendance/check-out', attendanceController.checkOut);
router.get('/attendance/report', attendanceController.getMonthlyReport);
router.get('/attendance/report-data', attendanceController.getMonthlyReportData);
router.get('/attendance/history/:userId', attendanceController.getAttendanceHistory);

// User & Directory routes
router.get('/employees', userController.getAllEmployees);
router.post('/employees', userController.createIndividualUser);
router.post('/employees/bulk', userController.bulkUploadUsers);
router.get('/profile/:userId', userController.getUserProfile);
router.put('/profile/:userId', userController.updateProfile);
router.post('/attendance/regularize', attendanceController.regularize);

// Announcement routes
router.get('/announcements', announcementController.getAnnouncements);

// Leave routes
router.get('/leave/stats/:userId', leaveController.getLeaveStats);
router.post('/leave/apply', leaveController.applyLeave);
router.get('/leave/requests', leaveController.getManagerRequests);
router.put('/leave/approve/:leaveId', leaveController.approveLeave);
router.get('/leave/history/:userId', leaveController.getUserHistory);

// Config routes
router.get('/config/working-hours', configController.getConfig);
router.put('/config/working-hours', configController.updateConfig);

module.exports = router;
