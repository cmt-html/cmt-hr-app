const mongoose = require('mongoose');
const { Announcement } = require('../services/db.service');

// ── Get Announcements ────────────────────────────────────────────────────────
exports.getAnnouncements = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const announcements = await Announcement.find({ organizationId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(announcements.map(a => ({ ...a, id: a._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: 'Fetch announcements failed', error: error.message });
  }
};

// ── Create Announcement ──────────────────────────────────────────────────────
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, authorId, authorName } = req.body;
    const organizationId = req.organizationId;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const announcement = new Announcement({
      organizationId,
      title,
      content,
      type: type || 'GENERAL',
      authorId: authorId && mongoose.isValidObjectId(authorId) ? authorId : undefined,
      authorName: authorName || 'Admin',
      likes: [],
      comments: []
    });
    await announcement.save();

    res.status(201).json({ ...announcement.toObject(), id: announcement._id.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Create announcement failed', error: error.message });
  }
};

// ── Like / Unlike Announcement ────────────────────────────────────────────────
exports.likeAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { userId } = req.body;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    const userIdStr = String(userId || '');
    const alreadyLiked = announcement.likes.includes(userIdStr);

    if (alreadyLiked) {
      announcement.likes = announcement.likes.filter(id => id !== userIdStr);
    } else {
      announcement.likes.push(userIdStr);
    }
    await announcement.save();

    res.json({ ...announcement.toObject(), id: announcement._id.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Like failed', error: error.message });
  }
};

// ── Comment on Announcement ──────────────────────────────────────────────────
exports.commentAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { userId, userName, text, comment } = req.body;

    const commentText = text || comment;
    if (!commentText) return res.status(400).json({ message: 'Comment text is required.' });

    const announcement = await Announcement.findByIdAndUpdate(
      announcementId,
      {
        $push: {
          comments: {
            userId:    String(userId || ''),
            userName:  userName || 'Anonymous',
            text:      commentText,
            comment:   commentText,  // legacy alias
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).lean();

    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    res.json({ ...announcement, id: announcement._id.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Comment failed', error: error.message });
  }
};
