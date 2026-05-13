const Organization = require('../models/Organization');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.registerOrganization = async (req, res) => {
  try {
    const { name, email, phone, address, adminFirstName, adminLastName, adminPassword } = req.body;

    // Check if organization or admin email already exists
    const existingOrg = await Organization.findOne({ email });
    const existingUser = await User.findOne({ email });

    if (existingOrg || existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create organization (status PENDING by default)
    const organization = new Organization({
      name,
      email,
      phone,
      address,
      status: 'PENDING'
    });
    await organization.save();

    // Create the first admin for this organization
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const employeeId = 'ORG_ADMIN_' + Math.floor(1000 + Math.random() * 9000);

    const user = new User({
      email,
      password: hashedPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: 'ADMIN',
      employeeId,
      dateOfJoining: new Date(),
      organizationId: organization._id
    });
    await user.save();

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

    const organizations = await Organization.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'organizationId',
          as: 'users'
        }
      },
      {
        $addFields: {
          _count: { users: { $size: "$users" } }
        }
      },
      {
        $project: {
          users: 0 // Remove the full users array
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

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

    const organization = await Organization.findByIdAndUpdate(
      orgId,
      { status },
      { new: true }
    );

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

    const totalOrgs = await Organization.countDocuments();
    const activeOrgs = await Organization.countDocuments({ status: 'APPROVED' });
    const pendingOrgs = await Organization.countDocuments({ status: 'PENDING' });
    const totalUsers = await User.countDocuments({ role: { $ne: 'SUPER_ADMIN' } });

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
