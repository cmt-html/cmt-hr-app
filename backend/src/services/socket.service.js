let io;

const init = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-org', (orgId) => {
      socket.join(`org-${orgId}`);
      console.log(`Socket ${socket.id} joined org-${orgId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const notifyOrg = (orgId, event, data) => {
  if (io) {
    io.to(`org-${orgId}`).emit(event, data);
  }
};

const notifyUser = (userId, event, data) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};

module.exports = { init, getIO, notifyOrg, notifyUser };
