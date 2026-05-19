const prisma = require('../services/prisma.service');
const mockDb = require('../services/mock.service');

exports.createCustomField = async (req, res) => {
  try {
    const { fieldName, fieldLabel, fieldType, options, isRequired } = req.body;
    const organizationId = req.organizationId;

    try {
      const field = await prisma.customField.create({
        data: {
          fieldName,
          fieldLabel,
          fieldType,
          options,
          isRequired: !!isRequired,
          organizationId
        }
      });
      return res.status(201).json({ message: 'Custom field created (Postgres)', field });
    } catch (dbError) {
      console.warn('⚠️ Postgres CustomField Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const field = mockDb.create('customFields', {
      fieldName,
      fieldLabel,
      fieldType,
      options,
      isRequired: !!isRequired,
      organizationId
    });
    res.status(201).json({ message: 'Custom field created (Mock)', field });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create custom field', error: error.message });
  }
};

exports.getCustomFields = async (req, res) => {
  try {
    const organizationId = req.organizationId;

    try {
      const fields = await prisma.customField.findMany({
        where: { organizationId }
      });
      return res.json(fields);
    } catch (dbError) {
      console.warn('⚠️ Postgres Get CustomFields Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const fields = mockDb.find('customFields', { organizationId });
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch custom fields', error: error.message });
  }
};

exports.deleteCustomField = async (req, res) => {
  try {
    const { fieldId } = req.params;

    try {
      await prisma.customField.delete({ where: { id: fieldId } });
      return res.json({ message: 'Custom field deleted (Postgres)' });
    } catch (dbError) {
      console.warn('⚠️ Postgres CustomField Delete Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    mockDb.delete('customFields', fieldId);
    res.json({ message: 'Custom field deleted (Mock)' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete custom field', error: error.message });
  }
};
