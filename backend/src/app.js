const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CMT HR API' });
});

// Routes
const apiRoutes = require('./routes/api.routes');
app.use('/api', apiRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('💥 Uncaught Express Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
    stack: err.stack
  });
});

module.exports = app;
