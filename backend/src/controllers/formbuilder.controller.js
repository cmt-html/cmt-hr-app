const { CustomField } = require('../services/db.service');
const mongoose = require('mongoose');

exports.createCustomField = async (req, res) => {
  try {
    const { fieldName, name, fieldLabel, label, fieldType, type, options, isRequired, required } = req.body;
    const organizationId = req.organizationId;

    const finalName = fieldName || name;
    const finalLabel = fieldLabel || label || finalName;
    const finalType = fieldType || type || 'TEXT';
    const finalRequired = isRequired !== undefined ? !!isRequired : (required !== undefined ? !!required : false);

    const field = new CustomField({
      organizationId,
      name: finalName,
      label: finalLabel,
      type: finalType,
      required: finalRequired,
      options: options || []
    });
    await field.save();

    const normalized = {
      ...field.toObject(),
      id: field._id.toString(),
      fieldName: field.name,
      fieldLabel: field.label,
      fieldType: field.type,
      isRequired: field.required
    };

    res.status(201).json({ message: 'Custom field created successfully', field: normalized });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create custom field', error: error.message });
  }
};

exports.getCustomFields = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const fields = await CustomField.find({ organizationId }).lean();

    const normalized = fields.map(f => ({
      ...f,
      id: f._id.toString(),
      fieldName: f.name,
      fieldLabel: f.label,
      fieldType: f.type,
      isRequired: f.required
    }));

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch custom fields', error: error.message });
  }
};

exports.deleteCustomField = async (req, res) => {
  try {
    const { fieldId } = req.params;
    if (!mongoose.isValidObjectId(fieldId)) {
      return res.status(400).json({ message: 'Invalid custom field ID format' });
    }

    const result = await CustomField.findByIdAndDelete(fieldId);
    if (!result) return res.status(404).json({ message: 'Custom field not found' });

    res.json({ message: 'Custom field deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete custom field', error: error.message });
  }
};
