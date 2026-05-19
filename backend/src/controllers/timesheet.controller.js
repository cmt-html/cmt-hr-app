const prisma = require('../services/prisma.service');
const mockDb = require('../services/mock.service');

exports.logHours = async (req, res) => {
  try {
    const { userId, project, date, hoursLogged, description } = req.body;
    const organizationId = req.organizationId;

    try {
      const timesheet = await prisma.timesheet.create({
        data: {
          userId,
          project,
          date: new Date(date),
          hoursLogged: parseFloat(hoursLogged),
          description,
          status: 'SUBMITTED',
          organizationId
        }
      });
      return res.status(201).json({ message: 'Timesheet logged (Postgres)', timesheet });
    } catch (dbError) {
      console.warn('⚠️ Postgres Timesheet Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const timesheet = mockDb.create('timesheets', {
      userId,
      project,
      date: new Date(date).toISOString(),
      hoursLogged: parseFloat(hoursLogged),
      description,
      status: 'SUBMITTED',
      organizationId
    });
    res.status(201).json({ message: 'Timesheet logged (Mock)', timesheet });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log timesheet', error: error.message });
  }
};

exports.getTimesheets = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const { userId } = req.query;

    try {
      const query = { organizationId };
      if (userId) query.userId = userId;

      const timesheets = await prisma.timesheet.findMany({
        where: query,
        include: {
          user: { select: { firstName: true, lastName: true, designation: true } }
        },
        orderBy: { date: 'desc' }
      });
      return res.json(timesheets);
    } catch (dbError) {
      console.warn('⚠️ Postgres Get Timesheets Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const query = { organizationId };
    if (userId) query.userId = userId;

    const timesheets = mockDb.find('timesheets', query) || [];
    const enriched = timesheets.map(t => {
      const user = mockDb.findOne('users', { id: t.userId }) || { firstName: 'Unknown', lastName: '' };
      return { ...t, user };
    });
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch timesheets', error: error.message });
  }
};

exports.updateTimesheetStatus = async (req, res) => {
  try {
    const { timesheetId } = req.params;
    const { status } = req.body; // APPROVED, REJECTED

    try {
      const timesheet = await prisma.timesheet.update({
        where: { id: timesheetId },
        data: { status }
      });
      return res.json({ message: 'Timesheet status updated (Postgres)', timesheet });
    } catch (dbError) {
      console.warn('⚠️ Postgres Timesheet Status Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const timesheet = mockDb.update('timesheets', timesheetId, { status });
    res.json({ message: 'Timesheet status updated (Mock)', timesheet });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update timesheet status', error: error.message });
  }
};
