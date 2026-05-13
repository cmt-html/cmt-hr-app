const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

exports.registerOrganization = async (req, res) => {
  try {
    const { name, email, phone, address, adminFirstName, adminLastName, adminPassword } = req.body;

    // Check if organization or admin email already exists
    const existingOrg = await prisma.organization.findUnique({ where: { email } });
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingOrg || existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create organization (status PENDING by default)
    const organization = await prisma.organization.create({
      data: {
        name,
        email,
        phone,
        address,
        status: 'PENDING'
      }
    });

    // Create the first admin for this organization
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const employeeId = 'ORG_ADMIN_' + Math.floor(1000 + Math.random() * 9000);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'ADMIN',
        employeeId,
        dateOfJoining: new Date(),
        organizationId: organization.id
      }
    });

    res.status(201).json({
      message: 'Organization registered successfully. Please wait for Super Admin approval.',
      organization
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.getAllOrganizations = async (req, res) => {
  try {
    // Only SUPER_ADMIN should be able to call this
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organizations', error: error.message });
  }
};

exports.updateOrganizationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { orgId } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'DISABLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const organization = await prisma.organization.update({
      where: { id: orgId },
      data: { status }
    });

    res.json({ message: `Organization ${status.toLowerCase()} successfully`, organization });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

exports.getOrganizationStats = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalOrgs = await prisma.organization.count();
    const activeOrgs = await prisma.organization.count({ where: { status: 'APPROVED' } });
    const pendingOrgs = await prisma.organization.count({ where: { status: 'PENDING' } });
    const totalUsers = await prisma.user.count({ where: { NOT: { role: 'SUPER_ADMIN' } } });

    res.json({
      totalOrgs,
      activeOrgs,
      pendingOrgs,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};
