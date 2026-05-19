const { WorkingConfig } = require('../services/db.service');

exports.getConfig = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    
    let config = await WorkingConfig.findOne({ organizationId }).lean();
    if (!config) {
      config = new WorkingConfig({
        organizationId,
        windowStart: '09:00 AM',
        windowEnd: '06:00 PM',
        requiredHours: 9,
        minPresentMinutes: 500
      });
      await config.save();
      config = config.toObject();
    }
    
    res.json({ ...config, id: config._id.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Config fetch failed', error: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { windowStart, windowEnd, requiredHours, minPresentMinutes } = req.body;
    const organizationId = req.organizationId;

    const config = await WorkingConfig.findOneAndUpdate(
      { organizationId },
      { $set: { windowStart, windowEnd, requiredHours, minPresentMinutes } },
      { new: true, upsert: true }
    ).lean();

    res.json({ message: 'Config updated successfully', config: { ...config, id: config._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};
