const prisma = require('../../services/prisma.service');
const mockDb = require('../../services/mock.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerOrganization = async (req, res) => {
  try {
    const { orgName, slug, adminEmail, adminPassword, adminFirstName, adminLastName } = req.body;

    // --- PRISMA/POSTGRES MODE ---
    try {
      const existingOrg = await prisma.organization.findFirst({
        where: { OR: [{ slug }, { email: adminEmail }] }
      });
      if (existingOrg) return res.status(400).json({ message: 'Org slug or email already exists' });

      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const newOrg = await prisma.organization.create({
        data: {
          name: orgName,
          slug,
          email: adminEmail,
          status: 'APPROVED',
          subscription: { 
            status: 'TRIAL',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) 
          },
          users: {
            create: {
              email: adminEmail,
              password: hashedPassword,
              firstName: adminFirstName,
              lastName: adminLastName,
              role: 'ORG_ADMIN',
              employeeId: 'ADMIN-' + Date.now().toString().slice(-4),
              dateOfJoining: new Date()
            }
          }
        }
      });

      return res.status(201).json({ message: 'Organization registered successfully (Postgres)', orgId: newOrg.id });
    } catch (dbError) {
      console.warn('⚠️ Postgres Error, falling back to Mock:', dbError.message);
      
      // --- MOCK MODE FALLBACK ---
      const existingOrg = mockDb.findOne('organizations', { slug });
      if (existingOrg) return res.status(400).json({ message: 'Org slug already exists (Mock)' });
      
      const newOrg = mockDb.create('organizations', { 
        name: orgName, slug, email: adminEmail, status: 'APPROVED', 
        subscription: { 
          status: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        } 
      });
      mockDb.create('users', { 
        organizationId: newOrg.id, email: adminEmail, password: adminPassword, 
        firstName: adminFirstName, lastName: adminLastName, role: 'ORG_ADMIN' 
      });

      return res.status(201).json({ message: 'Registration successful (Mock Mode)', orgId: newOrg.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- PRISMA/POSTGRES MODE ---
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Incorrect password.' });

        const token = jwt.sign(
          { userId: user.id, organizationId: user.organizationId, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          token,
          user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, organizationId: user.organizationId }
        });
      }
    } catch (dbError) {
      console.warn('⚠️ Postgres Login Error, falling back to Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    const user = mockDb.findOne('users', { email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, organizationId: user.organizationId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, organizationId: user.organizationId }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
