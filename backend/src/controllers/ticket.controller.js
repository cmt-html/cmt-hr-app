const prisma = require('../services/prisma.service');
const mockDb = require('../services/mock.service');

exports.createTicket = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const userId = req.body.userId || 'user_employee1'; // safety fallback
    const organizationId = req.organizationId;

    try {
      const ticket = await prisma.ticket.create({
        data: {
          title,
          description,
          category,
          priority: priority || 'LOW',
          status: 'OPEN',
          userId,
          organizationId,
          comments: []
        }
      });
      return res.status(201).json({ message: 'Ticket opened (Postgres)', ticket });
    } catch (dbError) {
      console.warn('⚠️ Postgres Ticket Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const ticket = mockDb.create('tickets', {
      title,
      description,
      category,
      priority: priority || 'LOW',
      status: 'OPEN',
      userId,
      organizationId,
      comments: []
    });
    res.status(201).json({ message: 'Ticket opened (Mock)', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Failed to open ticket', error: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const { userId } = req.query; // If provided, filter for specific employee

    try {
      const query = { organizationId };
      if (userId) query.userId = userId;

      const tickets = await prisma.ticket.findMany({
        where: query,
        include: {
          user: { select: { firstName: true, lastName: true, email: true, designation: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(tickets);
    } catch (dbError) {
      console.warn('⚠️ Postgres Get Tickets Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const query = { organizationId };
    if (userId) query.userId = userId;

    const tickets = mockDb.find('tickets', query) || [];
    
    // Enrich with user data
    const enriched = tickets.map(t => {
      const user = mockDb.findOne('users', { id: t.userId }) || { firstName: 'Unknown', lastName: '' };
      return { ...t, user };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { authorId, authorName, text } = req.body;

    const newComment = {
      authorId,
      authorName,
      text,
      createdAt: new Date().toISOString()
    };

    // Try mock DB updates or Prisma
    const ticket = mockDb.findOne('tickets', { id: ticketId });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const comments = ticket.comments || [];
    comments.push(newComment);

    const updated = mockDb.update('tickets', ticketId, { comments, updatedAt: new Date().toISOString() });
    res.json({ message: 'Comment added', ticket: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    try {
      const ticket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status }
      });
      return res.json({ message: 'Ticket updated (Postgres)', ticket });
    } catch (dbError) {
      console.warn('⚠️ Postgres Ticket Status Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const ticket = mockDb.update('tickets', ticketId, { status, updatedAt: new Date().toISOString() });
    res.json({ message: 'Ticket updated (Mock)', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};
