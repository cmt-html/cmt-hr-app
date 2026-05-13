const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Organization = require('./src/models/Organization');
const Plan = require('./src/models/Plan');
const WorkingConfig = require('./src/models/WorkingConfig');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cmt-hr-saas';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Seeding data...');

    // Clear existing data
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Plan.deleteMany({});
    await WorkingConfig.deleteMany({});

    // 1. Create Subscription Plans
    const plans = await Plan.insertMany([
      {
        name: 'Starter',
        description: 'Basic HR for small teams',
        price: { monthly: 49, yearly: 490 },
        features: ['attendance', 'leave'],
        limits: { maxEmployees: 20, storageGB: 2 }
      },
      {
        name: 'Pro',
        description: 'Advanced HR with Payroll & ATS',
        price: { monthly: 99, yearly: 990 },
        features: ['attendance', 'leave', 'payroll', 'recruitment'],
        limits: { maxEmployees: 100, storageGB: 10 }
      },
      {
        name: 'Enterprise',
        description: 'Full SaaS suite with AI & Premium support',
        price: { monthly: 249, yearly: 2490 },
        features: ['attendance', 'leave', 'payroll', 'recruitment', 'ai-assistant', 'analytics'],
        limits: { maxEmployees: 1000, storageGB: 100 }
      }
    ]);

    // 2. Create Organization
    const organization = new Organization({
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
    await organization.save();

    // 3. Create Working Config
    const config = new WorkingConfig({
      organizationId: organization._id,
      windowStart: '09:00 AM',
      windowEnd: '06:00 PM',
      requiredHours: 9,
      minPresentMinutes: 500
    });
    await config.save();

    // 4. Create Super Admin
    const hashedSuperAdminPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = new User({
      email: 'superadmin@cmt.com',
      password: hashedSuperAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN'
    });
    await superAdmin.save();

    // 5. Create Organization Admin
    const hashedAdminPassword = await bcrypt.hash('password123', 10);
    const admin = new User({
      organizationId: organization._id,
      email: 'admin@cloudmojo.tech',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ORG_ADMIN',
      employeeId: 'EMP001',
      dateOfJoining: new Date()
    });
    await admin.save();

    console.log('Database seeded successfully!');
    console.log('Super Admin: superadmin@cmt.com / superadmin123');
    console.log('Org Admin: admin@cloudmojo.tech / password123 (Org: cloudmojo)');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
