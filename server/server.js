require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const redactionRoutes = require('./routes/redactionRoutes');

// Initialize Express App
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON request bodies

// API Routes
app.use('/api', redactionRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  const mongoose = require('mongoose');
  await mongoose.connection.close();
  console.log('MongoDB connection closed. Server shutting down.');
  process.exit(0);
});