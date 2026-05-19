const mongoose = require('mongoose');
const { Leave, User } = require('../services/db.service');

// ── Leave Stats ───────────────────────────────────────────────────────────
exports.getLeaveStats = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const leaves = await Leave.find({ userId }).lean();

    const stats = {
      taken: {
        total:  leaves.filter(l => l.status === 'APPROVED').length,
        ANNUAL: leaves.filter(l => l.status === 'APPROVED' && l.type === 'ANNUAL').length,
        SICK:   leaves.filter(l => l.status === 'APPROVED' && l.type === 'SICK').length,
        CASUAL: leaves.filter(l => l.status === 'APPROVED' && l.type === 'CASUAL').length,
      },
      pending: {
        total: leaves.filter(l => l.status === 'PENDING').length,
      },
      available: {
        ANNUAL: Math.max(0, 15 - leaves.filter(l => l.status === 'APPROVED' && l.type === 'ANNUAL').length),
        SICK:   Math.max(0, 10 - leaves.filter(l => l.status === 'APPROVED' && l.type === 'SICK').length),
        CASUAL: Math.max(0,  6 - leaves.filter(l => l.status === 'APPROVED' && l.type === 'CASUAL').length),
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Stats fetch failed', error: error.message });
  }
};

// ── Apply Leave ─────────────────────────────────────────────────────────────
exports.applyLeave = async (req, res) => {
  try {
    const { userId, type, startDate, endDate, reason } = req.body;
    const organizationId = req.organizationId;

    if (!userId || !type || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'All fields (userId, type, startDate, endDate, reason) are required.' });
    }

    const leave = new Leave({
      userId,
      organizationId,
      type,
      startDate: new Date(startDate),
      endDate:   new Date(endDate),
      reason,
      status: 'PENDING'
    });
    await leave.save();

    res.status(201).json({ ...leave.toObject(), id: leave._id.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Apply leave failed', error: error.message });
  }
};

// ── Manager Requests ────────────────────────────────────────────────────────
exports.getManagerRequests = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const { managerId } = req.query;

    let leaves = await Leave.find({ organizationId, status: 'PENDING' }).lean();

    // Filter by subordinates if managerId provided
    if (managerId && mongoose.isValidObjectId(managerId)) {
      const subordinates = await User.find({ managerId }).select('_id').lean();
      const subIds = subordinates.map(u => u._id.toString());
      leaves = leaves.filter(l => subIds.includes(l.userId.toString()));
    }

    // Enrich with user info
    const withUsers = await Promise.all(leaves.map(async (l) => {
      const user = await User.findById(l.userId).select('firstName lastName email designation').lean();
      return { ...l, id: l._id.toString(), user: user ? { ...user, id: user._id.toString() } : null };
    }));

    res.json(withUsers);
  } catch (error) {
    res.status(500).json({ message: 'Requests fetch failed', error: error.message });
  }
};

// ── Approve / Reject Leave ──────────────────────────────────────────────────
exports.approveLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Status must be APPROVED or REJECTED.' });
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      { $set: { status } },
      { new: true }
    ).lean();

    if (!updatedLeave) return res.status(404).json({ message: 'Leave request not found.' });

    const user = await User.findById(updatedLeave.userId).select('firstName lastName email').lean();

    // Workflow automation log (email would go here in production)
    if (status === 'APPROVED' && user) {
      console.log(`⚡ WORKFLOW: Leave APPROVED for ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Type: ${updatedLeave.type} | ${new Date(updatedLeave.startDate).toLocaleDateString()} → ${new Date(updatedLeave.endDate).toLocaleDateString()}`);
    }

    res.json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave: { ...updatedLeave, id: updatedLeave._id.toString(), user }
    });
  } catch (error) {
    res.status(500).json({ message: 'Approve failed', error: error.message });
  }
};

// ── User Leave History ──────────────────────────────────────────────────────
exports.getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const history = await Leave.find({ userId })
      .sort({ appliedAt: -1 })
      .lean();

    res.json(history.map(l => ({ ...l, id: l._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: 'History fetch failed', error: error.message });
  }
};
