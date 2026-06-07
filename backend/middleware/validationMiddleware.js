
const mongoose = require('mongoose');

const isValidEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(String(email).toLowerCase());
};

exports.validateObjectId = (req, res, next) => {
  const idToCheck = req.params.id || req.body.carId || req.body.userId;
  if (idToCheck && !mongoose.Types.ObjectId.isValid(idToCheck)) {
    res.status(400);
    return next(new Error(`Invalid Object ID syntax: ${idToCheck}`));
  }
  next();
};

exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    return next(new Error('Name is required and cannot be empty'));
  }

  if (!email || !isValidEmail(email)) {
    res.status(400);
    return next(new Error('Please provide a valid email address'));
  }

  if (!password || password.length < 6) {
    res.status(400);
    return next(new Error('Password must be at least 6 characters long'));
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    res.status(400);
    return next(new Error('Please provide a valid email address'));
  }

  if (!password) {
    res.status(400);
    return next(new Error('Password is required'));
  }

  next();
};

exports.validateCar = (req, res, next) => {
  const { make, model, year, type, pricePerDay, imageUrl } = req.body;

  if (!make || !make.trim()) {
    res.status(400);
    return next(new Error('Vehicle make is required'));
  }

  if (!model || !model.trim()) {
    res.status(400);
    return next(new Error('Vehicle model is required'));
  }

  if (!year || isNaN(year) || Number(year) < 1900 || Number(year) > new Date().getFullYear() + 2) {
    res.status(400);
    return next(new Error('Please provide a valid vehicle manufacture year'));
  }

  const allowedTypes = ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'Sports', 'Truck', 'Van'];
  if (!type || !allowedTypes.includes(type)) {
    res.status(400);
    return next(new Error(`Car type must be one of: ${allowedTypes.join(', ')}`));
  }

  if (pricePerDay === undefined || isNaN(pricePerDay) || Number(pricePerDay) <= 0) {
    res.status(400);
    return next(new Error('Price per day must be a positive number greater than 0'));
  }

  if (!imageUrl || !imageUrl.trim()) {
    res.status(400);
    return next(new Error('Vehicle image URL or path is required'));
  }

  next();
};

exports.validateBooking = (req, res, next) => {
  const { carId, startDate, endDate } = req.body;

  if (!carId || !mongoose.Types.ObjectId.isValid(carId)) {
    res.status(400);
    return next(new Error('A valid Car ID is required to book'));
  }

  if (!startDate || isNaN(Date.parse(startDate))) {
    res.status(400);
    return next(new Error('Please provide a valid start date'));
  }

  if (!endDate || isNaN(Date.parse(endDate))) {
    res.status(400);
    return next(new Error('Please provide a valid end date'));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (start < now) {
    res.status(400);
    return next(new Error('Rental start date cannot be in the past'));
  }

  if (end <= start) {
    res.status(400);
    return next(new Error('Rental end date must be after the start date'));
  }

  next();
};
