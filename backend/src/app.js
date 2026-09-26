const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StoreFlow API is running'
  });
});

// Routes
app.use('/api/products', productRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB before starting the HTTP server
    await connectDB();
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`StoreFlow API server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
