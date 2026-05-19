const { Document } = require('../services/db.service');
const mongoose = require('mongoose');

exports.uploadDocument = async (req, res) => {
  try {
    const { name, type, userId } = req.body;
    const organizationId = req.organizationId;
    
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Valid userId is required.' });
    }

    const url = `/mock/uploads/${userId}/${Date.now()}_${name}`;

    const doc = new Document({
      name,
      type,
      url,
      userId,
      organizationId,
      sizeKB: Math.floor(Math.random() * 500) + 10  // mock size
    });
    await doc.save();

    res.status(201).json({ message: 'Document uploaded successfully', document: { ...doc.toObject(), id: doc._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Document upload failed', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Valid userId is required.' });
    }

    const documents = await Document.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(documents.map(d => ({ ...d, id: d._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
  }
};
