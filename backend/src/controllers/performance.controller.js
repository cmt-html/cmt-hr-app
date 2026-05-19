const { Goal, Review, User } = require('../services/db.service');
const mongoose = require('mongoose');

// ==========================================
//               GOALS (OKRs)
// ==========================================

exports.createGoal = async (req, res) => {
  try {
    const { userId, title, description, targetValue, currentValue, unit, startDate, endDate } = req.body;
    const organizationId = req.organizationId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Valid userId is required.' });
    }

    const goal = new Goal({
      userId,
      organizationId,
      title,
      description,
      targetValue: parseInt(targetValue) || 100,
      currentValue: parseInt(currentValue) || 0,
      unit: unit || '%',
      dueDate: endDate ? new Date(endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'PENDING'
    });
    await goal.save();

    res.status(201).json({ message: 'Goal created successfully', goal: { ...goal.toObject(), id: goal._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create goal', error: error.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Valid userId is required.' });
    }

    const goals = await Goal.find({ userId }).sort({ createdAt: -1 }).lean();

    res.json(goals.map(g => ({ ...g, id: g._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch goals', error: error.message });
  }
};

exports.updateGoalProgress = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { currentValue, status } = req.body;

    if (!mongoose.isValidObjectId(goalId)) {
      return res.status(400).json({ message: 'Invalid goal ID' });
    }

    const updateData = {};
    if (currentValue !== undefined) updateData.currentValue = parseInt(currentValue) || 0;
    if (status !== undefined) updateData.status = status;

    const goal = await Goal.findByIdAndUpdate(
      goalId,
      { $set: updateData },
      { new: true }
    ).lean();

    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    res.json({ message: 'Goal updated successfully', goal: { ...goal, id: goal._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update goal', error: error.message });
  }
};

exports.approveGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    if (!mongoose.isValidObjectId(goalId)) {
      return res.status(400).json({ message: 'Invalid goal ID' });
    }

    const goal = await Goal.findByIdAndUpdate(
      goalId,
      { $set: { status: 'APPROVED' } },
      { new: true }
    ).lean();

    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    res.json({ message: 'Goal approved successfully', goal: { ...goal, id: goal._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve goal', error: error.message });
  }
};

// ==========================================
//            PERFORMANCE REVIEWS
// ==========================================

exports.createReviewCycle = async (req, res) => {
  try {
    const { revieweeId, reviewerId, cycleName } = req.body;
    const organizationId = req.organizationId;

    if (!revieweeId || !reviewerId) {
      return res.status(400).json({ message: 'Reviewee and Reviewer are required.' });
    }

    const review = new Review({
      userId: revieweeId,
      managerId: reviewerId,
      period: cycleName,
      rating: 3,
      selfReview: '',
      managerReview: '',
      status: 'PENDING_SELF',
      organizationId
    });
    await review.save();

    const result = {
      ...review.toObject(),
      id: review._id.toString(),
      revieweeId: review.userId.toString(),
      reviewerId: review.managerId.toString(),
      cycleName: review.period
    };

    res.status(201).json({ message: 'Review cycle created successfully', review: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create review cycle', error: error.message });
  }
};

exports.submitSelfReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { selfReview } = req.body;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $set: { selfReview, status: 'PENDING_MANAGER' } },
      { new: true }
    ).lean();

    if (!review) return res.status(404).json({ message: 'Review not found' });

    const result = {
      ...review,
      id: review._id.toString(),
      revieweeId: review.userId.toString(),
      reviewerId: review.managerId.toString(),
      cycleName: review.period
    };

    res.json({ message: 'Self review submitted successfully', review: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit self review', error: error.message });
  }
};

exports.submitManagerReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comments } = req.body;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $set: { rating: parseInt(rating) || 3, managerReview: comments, status: 'COMPLETED' } },
      { new: true }
    ).lean();

    if (!review) return res.status(404).json({ message: 'Review not found' });

    const result = {
      ...review,
      id: review._id.toString(),
      revieweeId: review.userId.toString(),
      reviewerId: review.managerId.toString(),
      cycleName: review.period
    };

    res.json({ message: 'Manager review completed successfully', review: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete review', error: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Valid userId is required.' });
    }

    const reviews = await Review.find({
      $or: [
        { userId },
        { managerId: userId }
      ]
    }).sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(reviews.map(async (r) => {
      const reviewee = await User.findById(r.userId).select('firstName lastName email designation').lean();
      const reviewer = await User.findById(r.managerId).select('firstName lastName email designation').lean();
      return {
        ...r,
        id: r._id.toString(),
        revieweeId: r.userId.toString(),
        reviewerId: r.managerId.toString(),
        cycleName: r.period,
        reviewee: reviewee ? { ...reviewee, id: reviewee._id.toString() } : null,
        reviewer: reviewer ? { ...reviewer, id: reviewer._id.toString() } : null
      };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};
