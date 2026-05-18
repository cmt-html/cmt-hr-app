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

const tenantMiddleware = require('../middleware/tenant');
const planMiddleware = require('../middleware/plan');

// 1. Auth Routes (Public)
router.use('/auth', authRoutes);

// 2. Super Admin Routes
router.use('/super', adminRoutes);

// 3. SaaS & Billing Routes
router.use('/saas', saasRoutes);

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

module.exports = router;
