const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Registration
app.use('/api/auth', require('./routes/auth'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/notifications', require('./routes/notifications'));

// Root path health check
app.get('/', (req, res) => {
  res.json({ message: 'School Facility Condition Reporting & Repair Tracking API is running.' });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Initialize Database & Start Server
const startServer = async () => {
  try {
    await db.connect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error.message);
    process.exit(1);
  }
};

startServer();
