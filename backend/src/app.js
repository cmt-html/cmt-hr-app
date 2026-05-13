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

module.exports = app;
