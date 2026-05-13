const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Add Organization
  const org = await prisma.organization.upsert({
    where: { email: 'contact@cloudmojo.tech' },
    update: {},
    create: {
      name: 'CloudMojo Tech',
      email: 'contact@cloudmojo.tech',
      status: 'APPROVED',
      phone: '+1234567890',
      address: 'Cloud City'
    }
  });

  // Add Super Admin
  await prisma.user.upsert({
    where: { email: 'superadmin@cloudmojo.tech' },
    update: {},
    create: {
      email: 'superadmin@cloudmojo.tech',
      password: hashedPassword,
      firstName: 'Platform',
      lastName: 'Owner',
      role: 'SUPER_ADMIN',
      employeeId: 'SA-001',
      dateOfJoining: new Date('2022-01-01'),
    },
  });

  // Add Managers
  const manager1 = await prisma.user.upsert({
    where: { email: 'sarah.manager@cloudmojo.tech' },
    update: { organizationId: org.id },
    create: {
      email: 'sarah.manager@cloudmojo.tech',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Conner',
      role: 'MANAGER',
      designation: 'Engineering Manager',
      department: 'Technology',
      employeeId: 'CMT-001',
      dateOfJoining: new Date('2023-01-15'),
      organizationId: org.id
    },
  });

  // Add Employees
  const employee1 = await prisma.user.upsert({
    where: { email: 'john.dev@cloudmojo.tech' },
    update: { managerId: manager1.id, organizationId: org.id },
    create: {
      email: 'john.dev@cloudmojo.tech',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'EMPLOYEE',
      designation: 'Senior Developer',
      department: 'Engineering',
      employeeId: 'CMT-102',
      dateOfJoining: new Date('2024-01-15'),
      managerId: manager1.id,
      organizationId: org.id
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'jane.hr@cloudmojo.tech' },
    update: { managerId: manager1.id, organizationId: org.id },
    create: {
      email: 'jane.hr@cloudmojo.tech',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'HR',
      designation: 'HR Specialist',
      department: 'Human Resources',
      employeeId: 'CMT-105',
      dateOfJoining: new Date('2023-11-01'),
      managerId: manager1.id,
      organizationId: org.id
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cloudmojo.tech' },
    update: { organizationId: org.id },
    create: {
      email: 'admin@cloudmojo.tech',
      password: hashedPassword,
      firstName: 'Global',
      lastName: 'Admin',
      role: 'ADMIN',
      designation: 'System Administrator',
      department: 'Management',
      employeeId: 'CMT-000',
      dateOfJoining: new Date('2022-01-01'),
      organizationId: org.id
    },
  });


  // Add mock attendance for May 2026
  const mayRecords = [
    { userId: employee1.id, organizationId: org.id, date: new Date('2026-05-01'), checkIn: new Date('2026-05-01T09:00:00'), checkOut: new Date('2026-05-01T18:00:00'), status: 'PRESENT' },
    { userId: employee1.id, organizationId: org.id, date: new Date('2026-05-02'), checkIn: new Date('2026-05-02T09:45:00'), checkOut: new Date('2026-05-02T18:30:00'), status: 'PRESENT' }, // LATE
    { userId: employee1.id, organizationId: org.id, date: new Date('2026-05-03'), checkIn: new Date('2026-05-03T10:00:00'), checkOut: new Date('2026-05-03T13:00:00'), status: 'PRESENT' }, // HALF_DAY
    { userId: employee2.id, organizationId: org.id, date: new Date('2026-05-01'), checkIn: new Date('2026-05-01T08:50:00'), checkOut: new Date('2026-05-01T17:45:00'), status: 'PRESENT' },
    { userId: employee2.id, organizationId: org.id, date: new Date('2026-05-04'), checkIn: new Date('2026-05-04T09:10:00'), checkOut: new Date('2026-05-04T18:15:00'), status: 'PRESENT' },
  ];


  for (const record of mayRecords) {
    await prisma.attendance.create({ data: record });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
