const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

exports.createIndividualUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, designation, department, employeeId, dateOfJoining } = req.body;
    
    // Check for existing email or employeeId
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { employeeId }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or employee ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        designation,
        department,
        employeeId,
        dateOfJoining: new Date(dateOfJoining),
      },
    });
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

exports.bulkUploadUsers = async (req, res) => {
  try {
    const { users } = req.body; // Expecting array of user objects
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const createdUsers = await Promise.all(
      users.map(user => 
        prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            ...user,
            password: hashedPassword,
            dateOfJoining: new Date(user.dateOfJoining || Date.now()),
          }
        })
      )
    );
    
    res.status(201).json({ count: createdUsers.length, message: 'Bulk upload successful' });
  } catch (error) {
    res.status(500).json({ message: 'Bulk upload failed', error: error.message });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        designation: true,
        department: true,
        employeeId: true,
        role: true,
      },
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { leaves: true, attendances: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, designation, department, emergencyContact, emergencyContactName, profilePicture } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        firstName, 
        lastName, 
        designation, 
        department, 
        emergencyContact, 
        emergencyContactName, 
        profilePicture 
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
