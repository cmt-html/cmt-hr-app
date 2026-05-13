const prisma = require('../services/prisma.service');
const mockDb = require('../services/mock.service');

exports.checkIn = async (req, res) => {
  try {
    const { userId, location } = req.body;
    const organizationId = req.organizationId;

    // --- PRISMA/POSTGRES MODE ---
    try {
      const activeSession = await prisma.attendance.findFirst({
        where: { userId, checkOut: null }
      });
      if (activeSession) return res.status(400).json({ message: 'Active session exists.' });

      const attendance = await prisma.attendance.create({
        data: {
          userId,
          organizationId,
          checkIn: new Date(),
          location,
          status: 'PRESENT'
        }
      });
      return res.status(201).json({ message: 'Checked in (Postgres)', attendance });
    } catch (dbError) {
      console.warn('⚠️ Attendance Postgres Error, using Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    const activeSession = mockDb.findOne('attendances', { userId, checkOut: null });
    if (activeSession) return res.status(400).json({ message: 'Active session exists (Mock).' });

    const attendance = mockDb.create('attendances', { 
      userId, organizationId, checkIn: new Date(), location, status: 'PRESENT', checkOut: null 
    });
    res.status(201).json({ message: 'Checked in (Mock)', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Check-in failed', error: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { userId } = req.body;
    const organizationId = req.organizationId;

    // --- PRISMA/POSTGRES MODE ---
    try {
      const attendance = await prisma.attendance.findFirst({
        where: { userId, checkOut: null },
        orderBy: { checkIn: 'desc' }
      });

      if (!attendance) return res.status(404).json({ message: 'No active session.' });

      const updated = await prisma.attendance.update({
        where: { id: attendance.id },
        data: { checkOut: new Date(), status: 'PRESENT' }
      });
      return res.json({ message: 'Checked out (Postgres)', attendance: updated });
    } catch (dbError) {
       console.warn('⚠️ Attendance Postgres Error, using Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    const attendance = mockDb.findOne('attendances', { userId, checkOut: null });
    if (!attendance) return res.status(404).json({ message: 'No active session (Mock).' });

    const updated = mockDb.update('attendances', attendance.id, { checkOut: new Date(), status: 'PRESENT' });
    res.json({ message: 'Checked out (Mock)', attendance: updated });
  } catch (error) {
    res.status(500).json({ message: 'Check-out failed', error: error.message });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // --- PRISMA/POSTGRES MODE ---
    try {
      const history = await prisma.attendance.findMany({
        where: { userId },
        orderBy: { checkIn: 'desc' },
        take: 30
      });
      return res.json(history);
    } catch (dbError) {
       console.warn('⚠️ Attendance Postgres Error, using Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    const history = mockDb.find('attendances', { userId });
    res.json(history.reverse().slice(0, 30));
  } catch (error) {
    res.status(500).json({ message: 'History fetch failed', error: error.message });
  }
};

exports.getMonthlyReportData = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    
    // --- PRISMA/POSTGRES MODE ---
    try {
      const data = await prisma.attendance.findMany({
        where: { organizationId },
        include: { user: true }
      });
      return res.json(data);
    } catch (dbError) {
       console.warn('⚠️ Report Postgres Error, using Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    const data = mockDb.find('attendances', { organizationId });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Report data failed', error: error.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  res.status(200).send("CSV placeholder");
};

exports.regularize = async (req, res) => {
  try {
    const { userId, date, checkIn, checkOut, reason } = req.body;
    const organizationId = req.organizationId;

    const attendance = mockDb.create('attendances', {
      userId, organizationId, date, checkIn, checkOut, status: 'PRESENT', 
      regularizationReason: reason, regularizationStatus: 'PENDING'
    });
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Regularization failed', error: error.message });
  }
};
