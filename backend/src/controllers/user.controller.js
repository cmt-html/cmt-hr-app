const prisma = require('../services/prisma.service');
const mockDb = require('../services/mock.service');
const bcrypt = require('bcryptjs');

exports.createIndividualUser = async (req, res) => {
  try {
    const { email, firstName, lastName, role, designation, department, employeeId, dateOfJoining, managerId } = req.body;
    const organizationId = req.organizationId;

    if (!organizationId) {
      return res.status(403).json({ message: 'Organization context missing from your session' });
    }

    if (!email || !firstName || !employeeId) {
      return res.status(400).json({ message: 'Required fields missing: Email, First Name, and Employee ID are mandatory.' });
    }

    /*
    // --- PRISMA/POSTGRES MODE ---
    try {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName: lastName || '',
          role: role || 'EMPLOYEE',
          designation,
          department,
          employeeId,
          dateOfJoining: new Date(dateOfJoining || Date.now()),
          organizationId,
          managerId
        }
      });
      return res.status(201).json(user);
    } catch (dbError) {
       console.error('❌ User Database Error:', dbError.message);
       console.warn('⚠️ Falling back to Mock Mode...');
    }
    */

    // --- MOCK MODE FALLBACK ---
    try {
      // Check for duplicate employeeId in Mock
      const existing = mockDb.findOne('users', { employeeId, organizationId });
      if (existing) {
        return res.status(400).json({ message: `Employee ID "${employeeId}" already exists in your organization.` });
      }

      const user = mockDb.create('users', { 
        email, 
        password: 'password123', 
        firstName, 
        lastName: lastName || '', 
        role: role || 'EMPLOYEE', 
        designation, 
        department, 
        employeeId, 
        organizationId,
        managerId
      });
      return res.status(201).json(user);
    } catch (mockError) {
      console.error('❌ Mock DB Error:', mockError);
      throw new Error('Failed to save to local storage: ' + mockError.message);
    }
  } catch (error) {
    console.error('❌ User creation fatal error:', error);
    res.status(500).json({ 
      message: 'CRITICAL_USER_CREATE_ERROR_V4', 
      error: error.message
    });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    
    // --- PRISMA/POSTGRES MODE ---
    try {
      const employees = await prisma.user.findMany({
        where: { organizationId },
        select: { id: true, firstName: true, lastName: true, email: true, designation: true, role: true }
      });
      return res.json(employees);
    } catch (dbError) {
       console.warn('⚠️ User Postgres Error, using Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    const employees = mockDb.find('users', { organizationId });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Fetch employees failed', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // --- PRISMA/POSTGRES MODE ---
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    } catch (dbError) {
       console.warn('⚠️ User Postgres Error, using Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    const user = mockDb.findOne('users', { id: userId });
    if (!user) return res.status(404).json({ message: 'User not found (Mock)' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Profile fetch failed', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, designation, department, emergencyContact, emergencyContactName, profilePicture } = req.body;
    
    // --- PRISMA/POSTGRES MODE ---
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName, phone, designation, department, emergencyContact, emergencyContactName, profilePicture }
      });
      return res.json(updatedUser);
    } catch (dbError) {
       console.warn('⚠️ User Postgres Error, using Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    const updated = mockDb.update('users', userId, { firstName, lastName, phone, designation, department, emergencyContact, emergencyContactName, profilePicture });
    if (!updated) return res.status(404).json({ message: 'User not found (Mock)' });
    
    res.json(updated);
  } catch (error) {
    console.error('❌ Update Profile Fatal Error:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};
