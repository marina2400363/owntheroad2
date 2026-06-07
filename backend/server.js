const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to OWN THE ROAD (Car Rental Management System) API Portal',
    version: '1.0.0',
  });
});

app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Endpoint Not Found - ${req.originalUrl}`);
  next(error);
});

const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/own_the_road';

console.log('Establishing connection to MongoDB database...');
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connection established successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running in development mode on port ${PORT}`);
      console.log(`API Base URL: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed! Server shutting down...');
    console.error(err.message);
    process.exit(1);
  });
