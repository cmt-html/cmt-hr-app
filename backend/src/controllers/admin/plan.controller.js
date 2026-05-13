const Plan = require('../../models/Plan');

exports.createPlan = async (req, res) => {
  try {
    const plan = new Plan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating plan', error: error.message });
  }
};

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await Plan.findByIdAndUpdate(planId, req.body, { new: true });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating plan', error: error.message });
  }
};
