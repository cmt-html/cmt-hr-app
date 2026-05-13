const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock User for demonstration (Replace with DB logic later)
const mockUser = {
  id: '1',
  email: 'admin@cloudmojo.com',
  password: 'hashed_password', // In reality, use bcrypt.hash
  role: 'ADMIN',
};

const User = require('../models/User');
const Organization = require('../models/Organization');

exports.login = async (req, res) => {
  try {
    const email = req.body.email || req.query.email;
    const password = req.body.password || req.query.password;

    // Check if user exists in DB
    const user = await User.findOne({ email }).populate('organizationId');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check organization status for non-super admins
    const organization = user.organizationId; // populated
    if (user.role !== 'SUPER_ADMIN' && organization) {
      if (organization.status !== 'APPROVED') {
        const statusStr = organization.status ? organization.status.toLowerCase() : 'pending';
        return res.status(403).json({ 
          message: `Your organization account is ${statusStr}. Please contact support.` 
        });
      }
    }

    const secret = process.env.JWT_SECRET || 'default_secret';
    const token = jwt.sign(
      { id: user._id, role: user.role, organizationId: organization?._id },
      secret,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: organization?._id,
        organizationName: organization ? organization.name : null
      },
    });

  } catch (error) {
    require('fs').writeFileSync('error.log', error.stack || error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
