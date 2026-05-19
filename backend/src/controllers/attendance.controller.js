const mongoose = require('mongoose');
const { Attendance, User } = require('../services/db.service');

// ── Check-In ────────────────────────────────────────────────────────────────
exports.checkIn = async (req, res) => {
  try {
    const { userId, location } = req.body;
    const organizationId = req.organizationId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Valid userId is required.' });
    }

    // Prevent double check-in
    const activeSession = await Attendance.findOne({ userId, checkOut: null });
    if (activeSession) {
      return res.status(400).json({ message: 'Active check-in session already exists.' });
    }

    // Check if user checked out today — allow resume
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay   = new Date(); endOfDay.setHours(23, 59, 59, 999);

    const todaySession = await Attendance.findOne({
      userId,
      checkOut: { $ne: null },
      checkIn:  { $gte: startOfDay, $lte: endOfDay }
    }).sort({ checkIn: -1 });

    if (todaySession) {
      const resumed = await Attendance.findByIdAndUpdate(
        todaySession._id,
        { $set: { checkOut: null } },
        { new: true }
      ).lean();
      return res.status(200).json({ message: 'Resumed session', attendance: { ...resumed, id: resumed._id.toString() } });
    }

    const attendance = new Attendance({
      userId,
      organizationId,
      checkIn: new Date(),
      checkOut: null,
      location: location || 'Remote',
      status: 'PRESENT'
    });
    await attendance.save();

    res.status(201).json({ message: 'Checked in successfully', attendance: { ...attendance.toObject(), id: attendance._id.toString() } });
  } catch (error) {
    console.error('CheckIn Error:', error);
    res.status(500).json({ message: 'Check-in failed', error: error.message });
  }
};

// ── Check-Out ───────────────────────────────────────────────────────────────
exports.checkOut = async (req, res) => {
  try {
    const { userId, location } = req.body;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Valid userId is required.' });
    }

    const attendance = await Attendance.findOne({ userId, checkOut: null }).sort({ checkIn: -1 });
    if (!attendance) {
      return res.status(404).json({ message: 'No active check-in session found.' });
    }

    const checkInLoc       = attendance.location || 'Office';
    const combinedLocation = location ? `${checkInLoc} | ${location}` : checkInLoc;

    const updated = await Attendance.findByIdAndUpdate(
      attendance._id,
      { $set: { checkOut: new Date(), location: combinedLocation, status: 'PRESENT' } },
      { new: true }
    ).lean();

    res.json({ message: 'Checked out successfully', attendance: { ...updated, id: updated._id.toString() } });
  } catch (error) {
    console.error('CheckOut Error:', error);
    res.status(500).json({ message: 'Check-out failed', error: error.message });
  }
};

// ── Attendance History ───────────────────────────────────────────────────────
exports.getAttendanceHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    const history = await Attendance.find({ userId })
      .sort({ checkIn: -1 })
      .limit(60)
      .lean();

    res.json(history.map(r => ({ ...r, id: r._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: 'History fetch failed', error: error.message });
  }
};

// ── Monthly Report Data ──────────────────────────────────────────────────────
exports.getMonthlyReportData = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const month = parseInt(req.query.month, 10);
    const year  = parseInt(req.query.year, 10);

    let dateFilter = {};
    if (Number.isFinite(month) && month >= 1 && month <= 12 && Number.isFinite(year)) {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 0, 23, 59, 59);
      dateFilter  = { checkIn: { $gte: start, $lte: end } };
    }

    const records = await Attendance.find({ organizationId, ...dateFilter })
      .sort({ checkIn: -1 })
      .lean();

    // Enrich with user info
    const enriched = await Promise.all(records.map(async (r) => {
      const user = await User.findById(r.userId).select('firstName lastName department employeeId').lean();
      return {
        ...r,
        id: r._id.toString(),
        date: r.date || r.checkIn,
        detailedStatus: r.status || 'PRESENT',
        user: user ? { ...user, id: user._id.toString() } : { firstName: 'Unknown', lastName: 'User', department: '', employeeId: '' }
      };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Report data failed', error: error.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  res.status(200).send('CSV export placeholder');
};

// ── Regularization ──────────────────────────────────────────────────────────
exports.regularize = async (req, res) => {
  try {
    const { userId, date, checkIn, checkOut, reason } = req.body;
    const organizationId = req.organizationId;

    const attendance = new Attendance({
      userId,
      organizationId,
      date:   date ? new Date(date) : new Date(),
      checkIn: checkIn ? new Date(checkIn) : new Date(),
      checkOut: checkOut ? new Date(checkOut) : null,
      status: 'PRESENT',
      regularizationReason: reason,
      regularizationStatus: 'PENDING'
    });
    await attendance.save();

    res.status(201).json({ ...attendance.toObject(), id: attendance._id.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Regularization failed', error: error.message });
  }
};
