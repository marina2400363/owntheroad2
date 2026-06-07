
const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: [true, 'Make is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year must be valid'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'Sports', 'Truck', 'Van'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0.01, 'Price per day must be a positive number'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL or file path is required'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Car', CarSchema);
