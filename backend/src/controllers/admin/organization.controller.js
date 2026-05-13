const Organization = require('../../models/Organization');
const User = require('../../models/User');

exports.getAllOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find().populate('subscription.planId');
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organizations', error: error.message });
  }
};

exports.updateOrganizationStatus = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { status } = req.body;
    const org = await Organization.findByIdAndUpdate(orgId, { status }, { new: true });
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

exports.getOrganizationAnalytics = async (req, res) => {
  try {
    const totalOrgs = await Organization.countDocuments();
    const activeSubs = await Organization.find({ 'subscription.status': 'ACTIVE' }).populate('subscription.planId');
    const trialOrgs = await Organization.countDocuments({ 'subscription.status': 'TRIAL' });
    
    let totalRevenue = 0;
    activeSubs.forEach(org => {
      if (org.subscription.planId) {
        totalRevenue += org.subscription.planId.price.monthly;
      }
    });

    res.json({
      totalOrgs,
      activeSubs: activeSubs.length,
      trialOrgs,
      totalRevenue,
      totalUsers: await User.countDocuments({ role: { $ne: 'SUPER_ADMIN' } })
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};
