const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { User, Organization, Plan, Invitation } = require('../../services/db.service');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

// ── Register organization + initial admin ──────────────────────────────────
exports.registerOrganization = async (req, res) => {
  try {
    const { orgName, name, slug, adminEmail, email, adminPassword, password,
            adminFirstName, firstName, adminLastName, lastName } = req.body;

    // Accept both naming conventions (web vs mobile payloads)
    const orgNameFinal   = orgName   || name;
    const emailFinal     = adminEmail || email;
    const passwordFinal  = adminPassword || password;
    const firstNameFinal = adminFirstName || firstName || 'Admin';
    const lastNameFinal  = adminLastName  || lastName  || 'User';

    if (!orgNameFinal || !slug || !emailFinal || !passwordFinal) {
      return res.status(400).json({ message: 'Organization name, slug, email, and password are required.' });
    }

    const existingOrg = await Organization.findOne({ $or: [{ slug }, { email: emailFinal }] });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization slug or email already exists.' });
    }

    const existingUser = await User.findOne({ email: emailFinal });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Get Free plan by default
    const freePlan = await Plan.findOne({ $or: [{ name: 'Starter' }, { name: 'Free Tier' }] });

    const org = new Organization({
      name: orgNameFinal,
      slug,
      email: emailFinal,
      status: 'APPROVED',
      subscription: {
        planId:      freePlan?._id || null,
        status:      'ACTIVE',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });
    await org.save();

    const hashedPassword = await bcrypt.hash(passwordFinal, 10);
    const adminUser = new User({
      organizationId: org._id,
      email:          emailFinal,
      password:       hashedPassword,
      firstName:      firstNameFinal,
      lastName:       lastNameFinal,
      role:           'ORG_ADMIN',
      employeeId:     'ADMIN-' + Date.now().toString().slice(-4),
      dateOfJoining:  new Date(),
      status:         'ACTIVE'
    });
    await adminUser.save();

    return res.status(201).json({
      message: 'Organization registered successfully',
      organization: { id: org._id.toString(), name: org.name, slug: org.slug }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// ── Login ───────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Fetch user WITH password (select: false in schema, so we must add it back)
    const user = await User.findOne({ email }).select('+password').lean();
    if (!user) {
      return res.status(401).json({ message: 'No account found for this email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // Fetch org slug for mobile tenant-slug persistence
    let organizationSlug = '';
    if (user.organizationId) {
      const org = await Organization.findById(user.organizationId).select('slug name status').lean();
      if (org) organizationSlug = org.slug;
    }

    const userId = user._id.toString();
    const orgId  = user.organizationId ? user.organizationId.toString() : null;

    const accessToken = jwt.sign(
      { userId, organizationId: orgId, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token: accessToken,
      refreshToken,
      user: {
        id:               userId,
        email:            user.email,
        firstName:        user.firstName,
        lastName:         user.lastName,
        role:             user.role,
        designation:      user.designation,
        department:       user.department,
        employeeId:       user.employeeId,
        profilePicture:   user.profilePicture,
        organizationId:   orgId,
        organizationSlug  // for mobile AsyncStorage
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// ── Refresh Token ────────────────────────────────────────────────────────────
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required.' });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token.' });
    }

    const user = await User.findById(decoded.userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const newToken = jwt.sign(
      { userId: user._id.toString(), organizationId: user.organizationId?.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(500).json({ message: 'Failed to refresh session', error: error.message });
  }
};

// ── Get Invite Details ───────────────────────────────────────────────────────
exports.getInviteDetails = async (req, res) => {
  try {
    const invite = await Invitation.findById(req.params.inviteId).lean();
    if (!invite) return res.status(404).json({ message: 'Invitation not found' });
    if (invite.status !== 'PENDING') return res.status(400).json({ message: 'This invitation has already been used.' });

    const org = await Organization.findById(invite.organizationId).select('name').lean();
    res.json({ invite, organizationName: org?.name || 'Unknown' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve invitation', error: error.message });
  }
};

// ── Accept Invite ────────────────────────────────────────────────────────────
exports.acceptInvite = async (req, res) => {
  try {
    const { inviteId, password } = req.body;
    if (!inviteId || !password) return res.status(400).json({ message: 'Invite ID and password are required.' });

    const invite = await Invitation.findById(inviteId);
    if (!invite) return res.status(404).json({ message: 'Invitation not found' });
    if (invite.status !== 'PENDING') return res.status(400).json({ message: 'This invitation is no longer active.' });

    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Check employee limit
    const org  = await Organization.findById(invite.organizationId).populate('subscription.planId').lean();
    const plan = org?.subscription?.planId ? await Plan.findById(org.subscription.planId).lean() : null;
    const maxEmployees = plan?.limits?.maxEmployees || 10;
    const currentCount = await User.countDocuments({ organizationId: invite.organizationId, status: 'ACTIVE' });
    if (currentCount >= maxEmployees) {
      return res.status(403).json({
        message: `The organization's employee limit (${maxEmployees}) has been reached. They must upgrade their plan.`
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email:          invite.email,
      password:       hashedPassword,
      firstName:      invite.firstName,
      lastName:       invite.lastName || '',
      role:           invite.role || 'EMPLOYEE',
      designation:    invite.designation,
      department:     invite.department,
      organizationId: invite.organizationId,
      employeeId:     'EMP-' + Date.now().toString().slice(-4),
      dateOfJoining:  new Date(),
      status:         'ACTIVE'
    });
    await newUser.save();

    invite.status = 'ACCEPTED';
    await invite.save();

    res.status(201).json({
      message: 'Invitation accepted! You can now log in.',
      user: { id: newUser._id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName }
    });
  } catch (error) {
    res.status(500).json({ message: 'Accepting invitation failed', error: error.message });
  }
};
