const app = require('./app');
const http = require('http');
const socketService = require('./services/socket.service');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cmt-hr-saas';

const server = http.createServer(app);
socketService.init(server);

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB. Ensure your DB is running!');
    console.error(err.message);
    // Continue running so API can respond with 500 instead of being completely unreachable
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SaaS Backend running on port ${PORT}`);
    console.log(`📡 Local: http://localhost:${PORT}`);
  });
};

startServer();
