const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock User for demonstration (Replace with DB logic later)
const mockUser = {
  id: '1',
  email: 'admin@cloudmojo.com',
  password: 'hashed_password', // In reality, use bcrypt.hash
  role: 'ADMIN',
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists in DB
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check organization status for non-super admins
    if (user.role !== 'SUPER_ADMIN' && user.organization) {
      if (user.organization.status !== 'APPROVED') {
        return res.status(403).json({ 
          message: `Your organization account is ${user.organization.status.toLowerCase()}. Please contact support.` 
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, organizationId: user.organizationId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        organizationName: user.organization?.name
      },
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
