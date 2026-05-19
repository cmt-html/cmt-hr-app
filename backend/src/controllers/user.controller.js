const bcrypt = require('bcryptjs');
const { User, Invitation, Plan } = require('../services/db.service');
const mongoose = require('mongoose');

// ── Create Employee ────────────────────────────────────────────────────────
exports.createIndividualUser = async (req, res) => {
  try {
    const { email, firstName, lastName, role, designation, department, employeeId, dateOfJoining, managerId } = req.body;
    const organizationId = req.organizationId;

    if (!email || !firstName || !employeeId) {
      return res.status(400).json({ message: 'Email, First Name, and Employee ID are required.' });
    }

    const existing = await User.findOne({ organizationId, employeeId });
    if (existing) {
      return res.status(400).json({ message: `Employee ID "${employeeId}" already exists in your organization.` });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash('Welcome@123', 10);
    const user = new User({
      organizationId,
      email,
      password: hashedPassword,
      firstName,
      lastName: lastName || '',
      role: role || 'EMPLOYEE',
      designation,
      department,
      employeeId,
      dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
      managerId: managerId && mongoose.isValidObjectId(managerId) ? managerId : undefined,
      status: 'ACTIVE'
    });
    await user.save();

    const { password: _, ...safeUser } = user.toObject();
    return res.status(201).json({ ...safeUser, id: user._id.toString() });
  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(500).json({ message: 'Failed to create employee', error: error.message });
  }
};

// ── Get All Employees ──────────────────────────────────────────────────────
exports.getAllEmployees = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const employees = await User.find({ organizationId, status: { $ne: 'TERMINATED' } })
      .select('-password')
      .lean();

    const normalized = employees.map(u => ({ ...u, id: u._id.toString() }));
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Fetch employees failed', error: error.message });
  }
};

// ── Get User Profile ──────────────────────────────────────────────────────
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ ...user, id: user._id.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Profile fetch failed', error: error.message });
  }
};

// ── Update Profile ────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const allowedFields = ['firstName', 'lastName', 'phone', 'designation', 'department',
                           'emergencyContact', 'emergencyContactName', 'profilePicture'];

    const updateData = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password').lean();

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json({ ...updated, id: updated._id.toString() });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

// ── Invite Employee ────────────────────────────────────────────────────────
exports.inviteEmployee = async (req, res) => {
  try {
    const { email, firstName, lastName, role, designation, department } = req.body;
    const organizationId = req.organizationId;

    if (!email || !firstName) {
      return res.status(400).json({ message: 'Email and First Name are required.' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const pendingInvite = await Invitation.findOne({ email, organizationId, status: 'PENDING' });
    if (pendingInvite) {
      return res.status(400).json({ message: 'An active invitation has already been sent to this email.' });
    }

    const invite = new Invitation({
      organizationId,
      email,
      firstName,
      lastName: lastName || '',
      role: role || 'EMPLOYEE',
      designation: designation || '',
      department: department || '',
      status: 'PENDING'
    });
    await invite.save();

    res.status(201).json({
      message: `Invitation created for ${firstName} (${email})`,
      invite: { ...invite.toObject(), id: invite._id.toString() }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to invite employee', error: error.message });
  }
};

// ── Get Invitations ────────────────────────────────────────────────────────
exports.getInvites = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const invites = await Invitation.find({ organizationId }).lean();
    res.json(invites.map(i => ({ ...i, id: i._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invitations', error: error.message });
  }
};
