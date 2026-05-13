const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getConfig = async (req, res) => {
  try {
    let config = await prisma.workingConfig.findUnique({
      where: { id: 'default' },
    });

    if (!config) {
      // Create default config if it doesn't exist
      config = await prisma.workingConfig.create({
        data: {
          id: 'default',
          windowStart: '08:00 AM',
          windowEnd: '08:00 PM',
          requiredHours: 9,
          minPresentMinutes: 500,
        },
      });
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { windowStart, windowEnd, requiredHours, minPresentMinutes = 500 } = req.body;

    const config = await prisma.workingConfig.upsert({
      where: { id: 'default' },
      update: {
        windowStart,
        windowEnd,
        requiredHours,
        minPresentMinutes,
      },
      create: {
        id: 'default',
        windowStart,
        windowEnd,
        requiredHours,
        minPresentMinutes,
      },
    });

    res.json({ message: 'Configuration updated successfully', config });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
