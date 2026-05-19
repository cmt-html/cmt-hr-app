const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Organization = require('./src/models/Organization');
const Plan = require('./src/models/Plan');
const WorkingConfig = require('./src/models/WorkingConfig');
const Leave = require('./src/models/Leave');
const Attendance = require('./src/models/Attendance');
const { Announcement, Ticket, Goal, Review, Job, Applicant, CustomField, Timesheet } = require('./src/services/db.service');

const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cmt-hr-saas';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Seeding mock & production-ready data...');

    // Clear all existing data
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Plan.deleteMany({});
    await WorkingConfig.deleteMany({});
    await Leave.deleteMany({});
    await Attendance.deleteMany({});
    await Announcement.deleteMany({});
    await Ticket.deleteMany({});
    await Goal.deleteMany({});
    await Review.deleteMany({});
    await Job.deleteMany({});
    await Applicant.deleteMany({});
    await CustomField.deleteMany({});
    await Timesheet.deleteMany({});

    // 1. Create Subscription Plans
    const plans = await Plan.insertMany([
      {
        name: 'Starter',
        description: 'Basic HR for small teams',
        price: { monthly: 49, yearly: 490 },
        features: ['attendance', 'leave'],
        limits: { maxEmployees: 20, storageGB: 2 },
        isActive: true
      },
      {
        name: 'Pro',
        description: 'Advanced HR with Payroll & ATS',
        price: { monthly: 99, yearly: 990 },
        features: ['attendance', 'leave', 'payroll', 'recruitment'],
        limits: { maxEmployees: 100, storageGB: 10 },
        isActive: true
      },
      {
        name: 'Enterprise',
        description: 'Full SaaS suite with AI & Premium support',
        price: { monthly: 249, yearly: 2490 },
        features: ['attendance', 'leave', 'payroll', 'recruitment', 'ai-assistant', 'analytics'],
        limits: { maxEmployees: 1000, storageGB: 100 },
        isActive: true
      }
    ]);

    // 2. Create Organizations
    const org1 = new Organization({
      name: 'CloudMojo Tech',
      slug: 'cloudmojo',
      email: 'contact@cloudmojo.tech',
      status: 'APPROVED',
      subscription: {
        planId: plans[2]._id, // Enterprise
        status: 'ACTIVE',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      branding: {
        primaryColor: '#6366f1',
        secondaryColor: '#a855f7'
      }
    });
    await org1.save();

    const org2 = new Organization({
      name: 'Free Startup Co',
      slug: 'startup',
      email: 'contact@startup.com',
      status: 'APPROVED',
      subscription: {
        planId: plans[0]._id, // Starter
        status: 'ACTIVE',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });
    await org2.save();

    // 3. Create Working Configurations
    const config1 = new WorkingConfig({
      organizationId: org1._id,
      windowStart: '09:00 AM',
      windowEnd: '06:00 PM',
      requiredHours: 9,
      minPresentMinutes: 500
    });
    await config1.save();

    const config2 = new WorkingConfig({
      organizationId: org2._id,
      windowStart: '09:00 AM',
      windowEnd: '06:00 PM',
      requiredHours: 8,
      minPresentMinutes: 480
    });
    await config2.save();

    // 4. Hashing password for all standard users
    const commonHashedPassword = await bcrypt.hash('password123', 10);
    const hashedSuperAdminPassword = await bcrypt.hash('superadmin123', 10);

    // ── SUPER ADMIN ──
    const superAdmin = new User({
      email: 'superadmin@cmt.com',
      password: hashedSuperAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    });
    await superAdmin.save();

    // ── CLOUDMOJO TECH USERS ──
    const adminUser = new User({
      organizationId: org1._id,
      email: 'admin@cloudmojo.tech',
      password: commonHashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ORG_ADMIN',
      designation: 'System Administrator',
      department: 'Management',
      employeeId: 'CMT-001',
      dateOfJoining: new Date('2022-01-01'),
      status: 'ACTIVE'
    });
    await adminUser.save();

    const hrUser = new User({
      organizationId: org1._id,
      email: 'jane.hr@cloudmojo.tech',
      password: commonHashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'HR_MANAGER',
      designation: 'HR Lead',
      department: 'Human Resources',
      employeeId: 'CMT-002',
      dateOfJoining: new Date('2023-11-01'),
      status: 'ACTIVE'
    });
    await hrUser.save();

    const manager1 = new User({
      organizationId: org1._id,
      email: 'sarah.manager@cloudmojo.tech',
      password: commonHashedPassword,
      firstName: 'Sarah',
      lastName: 'Conner',
      role: 'TEAM_MANAGER',
      designation: 'Engineering Manager',
      department: 'Technology',
      employeeId: 'CMT-003',
      dateOfJoining: new Date('2023-01-15'),
      status: 'ACTIVE'
    });
    await manager1.save();

    const manager2 = new User({
      organizationId: org1._id,
      email: 'michael.manager@cloudmojo.tech',
      password: commonHashedPassword,
      firstName: 'Michael',
      lastName: 'Scott',
      role: 'TEAM_MANAGER',
      designation: 'Sales Manager',
      department: 'Sales',
      employeeId: 'CMT-004',
      dateOfJoining: new Date('2023-03-01'),
      status: 'ACTIVE'
    });
    await manager2.save();

    // The active user from frontend login screenshot!
    const johnDev = new User({
      organizationId: org1._id,
      managerId: manager1._id,
      email: 'john.dev@cloudmojo.tech',
      password: commonHashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'EMPLOYEE',
      designation: 'Senior Developer',
      department: 'Technology',
      employeeId: 'CMT-101',
      dateOfJoining: new Date('2024-01-15'),
      status: 'ACTIVE'
    });
    await johnDev.save();

    const davidDev = new User({
      organizationId: org1._id,
      managerId: manager1._id,
      email: 'david.dev@cloudmojo.tech',
      password: commonHashedPassword,
      firstName: 'David',
      lastName: 'Miller',
      role: 'EMPLOYEE',
      designation: 'Frontend Engineer',
      department: 'Technology',
      employeeId: 'CMT-102',
      dateOfJoining: new Date('2024-05-10'),
      status: 'ACTIVE'
    });
    await davidDev.save();

    const emilyQa = new User({
      organizationId: org1._id,
      managerId: manager1._id,
      email: 'emily.qa@cloudmojo.tech',
      password: commonHashedPassword,
      firstName: 'Emily',
      lastName: 'Watson',
      role: 'EMPLOYEE',
      designation: 'QA Analyst',
      department: 'Technology',
      employeeId: 'CMT-103',
      dateOfJoining: new Date('2024-06-01'),
      status: 'ACTIVE'
    });
    await emilyQa.save();

    // ── FREE STARTUP CO USERS ──
    const org2Admin = new User({
      organizationId: org2._id,
      email: 'admin@org2.com',
      password: commonHashedPassword,
      firstName: 'Alice',
      lastName: 'Green',
      role: 'ORG_ADMIN',
      designation: 'Founder & CEO',
      department: 'Management',
      employeeId: 'ORG2-001',
      dateOfJoining: new Date('2025-01-01'),
      status: 'ACTIVE'
    });
    await org2Admin.save();

    const org2Emp1 = new User({
      organizationId: org2._id,
      managerId: org2Admin._id,
      email: 'emp1@org2.com',
      password: commonHashedPassword,
      firstName: 'Bob',
      lastName: 'Brown',
      role: 'EMPLOYEE',
      designation: 'Developer',
      department: 'Technology',
      employeeId: 'ORG2-101',
      dateOfJoining: new Date('2025-02-01'),
      status: 'ACTIVE'
    });
    await org2Emp1.save();

    // 5. Create Sample Attendances
    await Attendance.insertMany([
      {
        organizationId: org1._id,
        userId: johnDev._id,
        checkIn: new Date(Date.now() - 4 * 60 * 60 * 1000), // checked in 4 hours ago
        checkOut: null,
        location: '12.9716, 77.5946 (Office)',
        status: 'PRESENT'
      },
      {
        organizationId: org1._id,
        userId: davidDev._id,
        checkIn: new Date(Date.now() - 8 * 60 * 60 * 1000),
        checkOut: new Date(Date.now() - 30 * 60 * 1000),
        location: 'Office',
        status: 'PRESENT'
      }
    ]);

    // 6. Create Sample Leaves
    await Leave.insertMany([
      {
        userId: johnDev._id,
        organizationId: org1._id,
        type: 'SICK',
        startDate: new Date('2026-05-10'),
        endDate: new Date('2026-05-11'),
        reason: 'Fever and flu symptoms',
        status: 'APPROVED'
      },
      {
        userId: davidDev._id,
        organizationId: org1._id,
        type: 'CASUAL',
        startDate: new Date('2026-05-20'),
        endDate: new Date('2026-05-22'),
        reason: 'Personal family work',
        status: 'PENDING'
      }
    ]);

    // 7. Create Sample Announcements
    await Announcement.insertMany([
      {
        organizationId: org1._id,
        title: 'Updated Office Policy',
        content: 'We have updated our hybrid work policy. Mandatory office presence is now 3 days a week starting next month. Please sync with your reporting managers.',
        type: 'POLICY',
        authorName: 'Jane Smith (HR)',
        authorId: hrUser._id,
        likes: [johnDev._id.toString(), davidDev._id.toString(), manager1._id.toString()],
        comments: [
          {
            userId: johnDev._id.toString(),
            userName: 'John Doe',
            text: 'Got it, thanks for the update.',
            comment: 'Got it, thanks for the update.'
          }
        ]
      },
      {
        organizationId: org1._id,
        title: 'Congratulations Team!',
        content: 'Amazing work on delivering the SaaS platform before the deadline! Everyone is invited to the lunch buffet at the Orchid Ballroom this Friday.',
        type: 'EVENT',
        authorName: 'Sarah Conner',
        authorId: manager1._id,
        likes: [johnDev._id.toString(), davidDev._id.toString(), emilyQa._id.toString()],
        comments: []
      }
    ]);

    // 8. Create Sample OKR Goals
    await Goal.insertMany([
      {
        userId: johnDev._id,
        organizationId: org1._id,
        title: 'Redesign Core Auth Module',
        description: 'Implement JWT refresh tokens, sanitization and MFA simulation.',
        targetValue: 100,
        currentValue: 80,
        unit: '%',
        dueDate: new Date('2026-05-31'),
        status: 'ACTIVE'
      },
      {
        userId: davidDev._id,
        organizationId: org1._id,
        title: 'Improve Lighthouse Score',
        description: 'Bring the landing page performance score above 90.',
        targetValue: 90,
        currentValue: 65,
        unit: 'points',
        dueDate: new Date('2026-06-10'),
        status: 'ACTIVE'
      }
    ]);

    // 9. Create Sample Reviews
    await Review.insertMany([
      {
        userId: johnDev._id,
        managerId: manager1._id,
        period: 'Q2 2026 Appraisal',
        rating: 4,
        managerReview: 'John has shown outstanding engineering output, especially leading the SaaS migrations.',
        selfReview: 'I accomplished all my engineering OKRs and resolved 15 support tickets.',
        status: 'COMPLETED',
        organizationId: org1._id
      }
    ]);

    // 10. Create Sample Help Desk Tickets
    await Ticket.insertMany([
      {
        organizationId: org1._id,
        userId: johnDev._id,
        title: 'MacBook Pro screen glitching',
        description: 'The bottom half of the secondary monitor shows pink stripes when plugged into the thunderbolt port.',
        category: 'IT',
        priority: 'HIGH',
        status: 'OPEN',
        comments: [
          {
            userId: hrUser._id.toString(),
            userName: 'Jane HR',
            text: 'Hi John, IT support is looking into replacement cables. Standby.'
          }
        ]
      }
    ]);

    // 11. Create Sample Custom Fields
    await CustomField.insertMany([
      {
        organizationId: org1._id,
        name: 'tShirtSize',
        label: 'T-Shirt Size',
        type: 'TEXT',
        required: false,
        options: ['S', 'M', 'L', 'XL', 'XXL'],
        module: 'EMPLOYEE'
      }
    ]);

    // 12. Create Sample Timesheets
    await Timesheet.insertMany([
      {
        organizationId: org1._id,
        userId: johnDev._id,
        projectName: 'CMT SaaS Mobile App',
        task: 'Implemented the executive dashboard frontend components and adjusted HSL color palette.',
        hours: 7.5,
        date: new Date(),
        status: 'APPROVED',
        notes: 'Implemented the executive dashboard frontend components and adjusted HSL color palette.'
      }
    ]);

    console.log('\n🌟 Database seeded successfully with a robust, interactive dataset!');
    console.log('------------------------------------------------------------');
    console.log('🔑 Super Admin: superadmin@cmt.com / superadmin123');
    console.log('🔑 Org Admin:   admin@cloudmojo.tech / password123 (slug: cloudmojo)');
    console.log('🔑 HR Lead:     jane.hr@cloudmojo.tech / password123');
    console.log('🔑 Engineering Manager: sarah.manager@cloudmojo.tech / password123');
    console.log('🔑 Senior Dev:  john.dev@cloudmojo.tech / password123 (Active User!)');
    console.log('🔑 Frontend:    david.dev@cloudmojo.tech / password123');
    console.log('------------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
