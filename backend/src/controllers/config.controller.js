const prisma = require('../services/prisma.service');
const mockDb = require('../services/mock.service');

exports.getConfig = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    
    // --- PRISMA/POSTGRES MODE ---
    try {
      let config = await prisma.workingConfig.findUnique({ where: { organizationId } });
      if (!config) {
         config = await prisma.workingConfig.create({
           data: {
             organizationId,
             windowStart: '09:00 AM',
             windowEnd: '06:00 PM',
             requiredHours: 9,
             minPresentMinutes: 500
           }
         });
      }
      return res.json(config);
    } catch (dbError) {
      console.warn('⚠️ Config Postgres Error, using Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    let config = mockDb.findOne('configs', { organizationId });
    if (!config) {
      config = mockDb.create('configs', {
        organizationId,
        windowStart: '09:00 AM',
        windowEnd: '06:00 PM',
        requiredHours: 9,
        minPresentMinutes: 500
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Config fetch failed', error: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { windowStart, windowEnd, requiredHours, minPresentMinutes } = req.body;
    const organizationId = req.organizationId;

    // --- PRISMA/POSTGRES MODE ---
    try {
      const config = await prisma.workingConfig.upsert({
        where: { organizationId },
        update: { windowStart, windowEnd, requiredHours, minPresentMinutes },
        create: { organizationId, windowStart, windowEnd, requiredHours, minPresentMinutes }
      });
      return res.json({ message: 'Config updated (Postgres)', config });
    } catch (dbError) {
      console.warn('⚠️ Config Postgres Error, using Mock:', dbError.message);
    }

    // --- MOCK MODE FALLBACK ---
    const config = mockDb.update('configs', organizationId, { windowStart, windowEnd, requiredHours, minPresentMinutes });
    res.json({ message: 'Config updated (Mock)', config });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};
