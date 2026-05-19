const prisma = require('../services/prisma.service');
const mockDb = require('../services/mock.service');

// ==========================================
//               GOALS (OKRs)
// ==========================================

exports.createGoal = async (req, res) => {
  try {
    const { userId, title, description, targetValue, currentValue, unit, startDate, endDate } = req.body;
    const organizationId = req.organizationId;

    try {
      const goal = await prisma.goal.create({
        data: {
          userId,
          organizationId,
          title,
          description,
          targetValue: parseInt(targetValue) || 100,
          currentValue: parseInt(currentValue) || 0,
          unit: unit || '%',
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 'PENDING'
        }
      });
      return res.status(201).json({ message: 'Goal created (Postgres)', goal });
    } catch (dbError) {
      console.warn('⚠️ Postgres Goal Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const goal = mockDb.create('goals', {
      userId,
      organizationId,
      title,
      description,
      targetValue: parseInt(targetValue) || 100,
      currentValue: parseInt(currentValue) || 0,
      unit: unit || '%',
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: 'PENDING'
    });
    res.status(201).json({ message: 'Goal created (Mock)', goal });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create goal', error: error.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const { userId } = req.params;

    try {
      const goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(goals);
    } catch (dbError) {
      console.warn('⚠️ Postgres Goal Get Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const goals = mockDb.find('goals', { userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch goals', error: error.message });
  }
};

exports.updateGoalProgress = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { currentValue, status } = req.body;

    try {
      const goal = await prisma.goal.update({
        where: { id: goalId },
        data: { 
          currentValue: currentValue !== undefined ? parseInt(currentValue) : undefined,
          status 
        }
      });
      return res.json({ message: 'Goal updated (Postgres)', goal });
    } catch (dbError) {
      console.warn('⚠️ Postgres Goal Update Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const goal = mockDb.update('goals', goalId, { 
      currentValue: currentValue !== undefined ? parseInt(currentValue) : undefined,
      status 
    });
    res.json({ message: 'Goal updated (Mock)', goal });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update goal', error: error.message });
  }
};

exports.approveGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    try {
      const goal = await prisma.goal.update({
        where: { id: goalId },
        data: { status: 'APPROVED' }
      });
      return res.json({ message: 'Goal approved (Postgres)', goal });
    } catch (dbError) {
      console.warn('⚠️ Postgres Goal Approve Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const goal = mockDb.update('goals', goalId, { status: 'APPROVED' });
    res.json({ message: 'Goal approved (Mock)', goal });
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

    try {
      const review = await prisma.performanceReview.create({
        data: {
          revieweeId,
          reviewerId,
          cycleName,
          rating: 3,
          status: 'PENDING'
        }
      });
      return res.status(201).json({ message: 'Review cycle created (Postgres)', review });
    } catch (dbError) {
      console.warn('⚠️ Postgres Review Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const review = mockDb.create('reviews', {
      revieweeId,
      reviewerId,
      cycleName,
      rating: 3,
      comments: '',
      selfReview: '',
      status: 'PENDING',
      organizationId
    });
    res.status(201).json({ message: 'Review cycle created (Mock)', review });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create review cycle', error: error.message });
  }
};

exports.submitSelfReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { selfReview } = req.body;

    try {
      const review = await prisma.performanceReview.update({
        where: { id: reviewId },
        data: { 
          selfReview,
          status: 'SELF_COMPLETED'
        }
      });
      return res.json({ message: 'Self review submitted (Postgres)', review });
    } catch (dbError) {
      console.warn('⚠️ Postgres Self Review Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const review = mockDb.update('reviews', reviewId, { 
      selfReview,
      status: 'SELF_COMPLETED'
    });
    res.json({ message: 'Self review submitted (Mock)', review });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit self review', error: error.message });
  }
};

exports.submitManagerReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comments } = req.body;

    try {
      const review = await prisma.performanceReview.update({
        where: { id: reviewId },
        data: { 
          rating: parseInt(rating) || 3,
          comments,
          status: 'FINISHED'
        }
      });
      return res.json({ message: 'Manager review completed (Postgres)', review });
    } catch (dbError) {
      console.warn('⚠️ Postgres Manager Review Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const review = mockDb.update('reviews', reviewId, { 
      rating: parseInt(rating) || 3,
      comments,
      status: 'FINISHED'
    });
    res.json({ message: 'Manager review completed (Mock)', review });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete review', error: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { userId } = req.params; // Can be reviewee or reviewer

    try {
      const reviews = await prisma.performanceReview.findMany({
        where: {
          OR: [
            { revieweeId: userId },
            { reviewerId: userId }
          ]
        },
        include: {
          reviewee: { select: { firstName: true, lastName: true, email: true, designation: true } },
          reviewer: { select: { firstName: true, lastName: true, email: true, designation: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(reviews);
    } catch (dbError) {
      console.warn('⚠️ Postgres Get Reviews Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const reviews = mockDb.find('reviews') || [];
    const userReviews = reviews.filter(r => r.revieweeId === userId || r.reviewerId === userId);
    
    // Enrich with user data
    const enriched = userReviews.map(r => {
      const reviewee = mockDb.findOne('users', { id: r.revieweeId }) || { firstName: 'Unknown', lastName: '' };
      const reviewer = mockDb.findOne('users', { id: r.reviewerId }) || { firstName: 'Unknown', lastName: '' };
      return { ...r, reviewee, reviewer };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};
