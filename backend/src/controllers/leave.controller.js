const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getLeaveStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const leaves = await prisma.leave.findMany({
      where: { userId },
    });

    const stats = {
      taken: {
        total: leaves.filter(l => l.status === 'APPROVED').length,
        ANNUAL: leaves.filter(l => l.status === 'APPROVED' && l.type === 'ANNUAL').length,
        SICK: leaves.filter(l => l.status === 'APPROVED' && l.type === 'SICK').length,
        CASUAL: leaves.filter(l => l.status === 'APPROVED' && l.type === 'CASUAL').length,
        WFH: leaves.filter(l => l.status === 'APPROVED' && l.type === 'WFH').length,
      },
      pending: {
        total: leaves.filter(l => l.status === 'PENDING').length,
        ANNUAL: leaves.filter(l => l.status === 'PENDING' && l.type === 'ANNUAL').length,
        SICK: leaves.filter(l => l.status === 'PENDING' && l.type === 'SICK').length,
        CASUAL: leaves.filter(l => l.status === 'PENDING' && l.type === 'CASUAL').length,
        WFH: leaves.filter(l => l.status === 'PENDING' && l.type === 'WFH').length,
      },
      available: {
        ANNUAL: 15 - leaves.filter(l => l.status === 'APPROVED' && l.type === 'ANNUAL').length,
        SICK: 10 - leaves.filter(l => l.status === 'APPROVED' && l.type === 'SICK').length,
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.applyLeave = async (req, res) => {
  try {
    const { userId, type, startDate, endDate, reason } = req.body;
    
    // Check balance
    const leaves = await prisma.leave.findMany({
      where: { userId, type, status: { in: ['APPROVED', 'PENDING'] } },
    });
    
    const limit = type === 'ANNUAL' ? 15 : type === 'SICK' ? 10 : 999;
    if (leaves.length >= limit) {
      return res.status(400).json({ message: `Insufficient ${type} leave balance` });
    }

    const leave = await prisma.leave.create({
      data: {
        userId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING'
      }
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Failed to apply leave', error: error.message });
  }
};

exports.getManagerRequests = async (req, res) => {
  try {
    const { managerId } = req.query; // Expecting manager's ID
    
    const requests = await prisma.leave.findMany({
      where: {
        user: {
          managerId: managerId
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body; // APPROVED or REJECTED
    
    const leave = await prisma.leave.update({
      where: { id: leaveId },
      data: { status }
    });

    res.json({ message: `Leave ${status.toLowerCase()} successfully`, leave });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update leave status', error: error.message });
  }
};
exports.getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await prisma.leave.findMany({
      where: { userId },
      orderBy: { appliedAt: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leave history', error: error.message });
  }
};
