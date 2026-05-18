const prisma = require('../services/prisma.service');
const mockDb = require('../services/mock.service');

exports.getLeaveStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    let leaves = [];
    try {
      leaves = await prisma.leave.findMany({ where: { userId } });
    } catch (dbError) {
      console.warn('⚠️ Leave Postgres Error, using Mock:', dbError.message);
      leaves = mockDb.find('leaves', { userId }) || [];
    }

    if (!Array.isArray(leaves)) leaves = [];

    const stats = {
      taken: {
        total: leaves.filter(l => l.status === 'APPROVED').length,
        ANNUAL: leaves.filter(l => l.status === 'APPROVED' && l.type === 'ANNUAL').length,
        SICK: leaves.filter(l => l.status === 'APPROVED' && l.type === 'SICK').length,
      },
      pending: {
        total: leaves.filter(l => l.status === 'PENDING').length,
      },
      available: {
        ANNUAL: 15 - leaves.filter(l => l.status === 'APPROVED' && l.type === 'ANNUAL').length,
        SICK: 10 - leaves.filter(l => l.status === 'APPROVED' && l.type === 'SICK').length,
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Stats fetch failed', error: error.message });
  }
};

exports.applyLeave = async (req, res) => {
  try {
    const { userId, type, startDate, endDate, reason } = req.body;
    const organizationId = req.organizationId;

    // --- PRISMA/POSTGRES MODE ---
    try {
      const leave = await prisma.leave.create({
        data: {
          userId,
          organizationId,
          type,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason,
          status: 'PENDING'
        }
      });
      return res.status(201).json(leave);
    } catch (dbError) {
      console.warn('⚠️ Leave Postgres Error, using Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    const leave = mockDb.create('leaves', { 
      userId, organizationId, type, startDate, endDate, reason, status: 'PENDING' 
    });
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Apply leave failed', error: error.message });
  }
};

exports.getManagerRequests = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const { managerId } = req.query;

    const userWhere = managerId ? { managerId } : undefined;

    // --- PRISMA/POSTGRES MODE ---
    try {
      const requests = await prisma.leave.findMany({
        where: {
          organizationId,
          status: 'PENDING',
          ...(userWhere ? { user: userWhere } : {}),
        },
        include: { user: true },
      });
      return res.json(requests);
    } catch (dbError) {
      console.warn('⚠️ Manager Requests Postgres Error, using Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    let requests = mockDb.find('leaves', { organizationId, status: 'PENDING' }) || [];
    if (managerId) {
      requests = requests.filter((l) => {
        const u = mockDb.findOne('users', { id: l.userId });
        return u && String(u.managerId || '') === String(managerId);
      });
    }
    const withUsers = requests.map((l) => ({
      ...l,
      user: mockDb.findOne('users', { id: l.userId }) || {
        firstName: 'Unknown',
        lastName: 'User',
        email: '',
      },
    }));
    res.json(withUsers);
  } catch (error) {
    res.status(500).json({ message: 'Requests fetch failed', error: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    // --- PRISMA/POSTGRES MODE ---
    try {
      const leave = await prisma.leave.update({
        where: { id: leaveId },
        data: { status }
      });
      return res.json({ message: `Leave ${status.toLowerCase()} successfully`, leave });
    } catch (dbError) {
      console.warn('⚠️ Approve Leave Postgres Error, using Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    const leave = mockDb.update('leaves', leaveId, { status });
    res.json({ message: `Leave ${status.toLowerCase()} successfully (Mock)`, leave });
  } catch (error) {
    res.status(500).json({ message: 'Approve failed', error: error.message });
  }
};

exports.getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    let history = [];
    // --- PRISMA/POSTGRES MODE ---
    try {
      history = await prisma.leave.findMany({
        where: { userId },
        orderBy: { appliedAt: 'desc' }
      });
      return res.json(history);
    } catch (dbError) {
       console.warn('⚠️ Leave History Postgres Error, using Mock:', dbError.message);
       history = mockDb.find('leaves', { userId });
    }

    res.json(history.reverse());
  } catch (error) {
    res.status(500).json({ message: 'History fetch failed', error: error.message });
  }
};
