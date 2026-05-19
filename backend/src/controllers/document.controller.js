const prisma = require('../services/prisma.service');
const mockDb = require('../services/mock.service');

exports.uploadDocument = async (req, res) => {
  try {
    const { name, type, userId } = req.body;
    const organizationId = req.organizationId;
    const url = `/mock/uploads/${userId}/${Date.now()}_${name}`;

    try {
      const document = await prisma.document.create({
        data: {
          name,
          type,
          url,
          userId,
          organizationId
        }
      });
      return res.status(201).json({ message: 'Document uploaded (Postgres)', document });
    } catch (dbError) {
      console.warn('⚠️ Postgres Document Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const document = mockDb.create('documents', {
      name,
      type,
      url,
      userId,
      organizationId
    });
    res.status(201).json({ message: 'Document uploaded (Mock)', document });
  } catch (error) {
    res.status(500).json({ message: 'Document upload failed', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { userId } = req.params;

    try {
      const documents = await prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(documents);
    } catch (dbError) {
      console.warn('⚠️ Postgres Get Documents Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const documents = mockDb.find('documents', { userId });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
  }
};
