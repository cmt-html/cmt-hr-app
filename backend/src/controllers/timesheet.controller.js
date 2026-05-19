const { Timesheet, User } = require('../services/db.service');
const mongoose = require('mongoose');

exports.logHours = async (req, res) => {
  try {
    const { userId, project, projectName, date, hoursLogged, hours, description, notes } = req.body;
    const organizationId = req.organizationId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Valid userId is required.' });
    }

    const finalProject = project || projectName || 'Default Project';
    const finalHours = parseFloat(hoursLogged !== undefined ? hoursLogged : (hours !== undefined ? hours : 0));
    const finalNotes = description || notes || '';

    const timesheet = new Timesheet({
      userId,
      organizationId,
      projectName: finalProject,
      task: finalNotes,
      hours: finalHours,
      date: date ? new Date(date) : new Date(),
      status: 'PENDING',
      notes: finalNotes
    });
    await timesheet.save();

    const result = {
      ...timesheet.toObject(),
      id: timesheet._id.toString(),
      project: timesheet.projectName,
      hoursLogged: timesheet.hours,
      description: timesheet.notes
    };

    res.status(201).json({ message: 'Timesheet logged successfully', timesheet: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log timesheet', error: error.message });
  }
};

exports.getTimesheets = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const { userId } = req.query;

    const query = { organizationId };
    if (userId && mongoose.isValidObjectId(userId)) query.userId = userId;

    const timesheets = await Timesheet.find(query).sort({ date: -1 }).lean();

    const enriched = await Promise.all(timesheets.map(async (t) => {
      const user = await User.findById(t.userId).select('firstName lastName designation').lean();
      return {
        ...t,
        id: t._id.toString(),
        project: t.projectName,
        hoursLogged: t.hours,
        description: t.notes,
        user: user ? { ...user, id: user._id.toString() } : { firstName: 'Unknown', lastName: '' }
      };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch timesheets', error: error.message });
  }
};

exports.updateTimesheetStatus = async (req, res) => {
  try {
    const { timesheetId } = req.params;
    const { status } = req.body; // APPROVED, REJECTED, PENDING

    if (!mongoose.isValidObjectId(timesheetId)) {
      return res.status(400).json({ message: 'Invalid timesheet ID' });
    }

    const timesheet = await Timesheet.findByIdAndUpdate(
      timesheetId,
      { $set: { status } },
      { new: true }
    ).lean();

    if (!timesheet) return res.status(404).json({ message: 'Timesheet not found' });

    const result = {
      ...timesheet,
      id: timesheet._id.toString(),
      project: timesheet.projectName,
      hoursLogged: timesheet.hours,
      description: timesheet.notes
    };

    res.json({ message: 'Timesheet status updated successfully', timesheet: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update timesheet status', error: error.message });
  }
};
