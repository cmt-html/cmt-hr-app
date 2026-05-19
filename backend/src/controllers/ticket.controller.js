const { Ticket, User } = require('../services/db.service');
const mongoose = require('mongoose');

exports.createTicket = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const userId = req.body.userId || req.user?.userId;
    const organizationId = req.organizationId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Valid userId is required.' });
    }

    const ticket = new Ticket({
      title,
      description,
      category: category || 'GENERAL',
      priority: priority || 'LOW',
      status: 'OPEN',
      userId,
      organizationId,
      comments: []
    });
    await ticket.save();

    res.status(201).json({ message: 'Ticket opened successfully', ticket: { ...ticket.toObject(), id: ticket._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to open ticket', error: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const { userId } = req.query;

    const query = { organizationId };
    if (userId && mongoose.isValidObjectId(userId)) query.userId = userId;

    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(tickets.map(async (t) => {
      const user = await User.findById(t.userId).select('firstName lastName email designation').lean();
      return {
        ...t,
        id: t._id.toString(),
        user: user ? { ...user, id: user._id.toString() } : { firstName: 'Unknown', lastName: '' }
      };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { authorId, userId, authorName, userName, text } = req.body;

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({ message: 'Invalid ticket ID' });
    }

    const finalUserId = authorId || userId || 'anonymous';
    const finalUserName = authorName || userName || 'Anonymous';

    const comment = {
      userId:    finalUserId,
      userName:  finalUserName,
      text:      text || '',
      createdAt: new Date()
    };

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { $push: { comments: comment } },
      { new: true }
    ).lean();

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    res.json({ message: 'Comment added successfully', ticket: { ...ticket, id: ticket._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({ message: 'Invalid ticket ID' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { $set: { status } },
      { new: true }
    ).lean();

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    res.json({ message: 'Ticket status updated successfully', ticket: { ...ticket, id: ticket._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};
