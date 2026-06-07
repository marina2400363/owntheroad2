// =================================================================
// CONTROLLER: carController.js
// Part of the MVC Controller layer. Handles vehicle inventory queries,
// full CRUD operations (Admin only for modifications), advanced
// searching, filtering, pagination, and car image uploads.
// =================================================================

const Car = require('../models/Car');

// @desc    Get all cars (Paginated, filtered, searched, sorted)
// @route   GET /api/cars
// @access  Public
exports.getCars = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // Build query object
    const query = {};

    // Search filter: Matches make or model
    if (req.query.search) {
      query.$or = [
        { make: { $regex: req.query.search, $options: 'i' } },
        { model: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Category Type filter
    if (req.query.type && req.query.type !== 'All') {
      query.type = req.query.type;
    }

    // Availability filter
    if (req.query.available === 'true') {
      query.isAvailable = true;
    }

    // Sorting options
    let sortOption = { createdAt: -1 }; // Default: Newest first
    if (req.query.sort === 'priceAsc') {
      sortOption = { pricePerDay: 1 };
    } else if (req.query.sort === 'priceDesc') {
      sortOption = { pricePerDay: -1 };
    }

    // Count matching documents
    const totalCars = await Car.countDocuments(query);

    // Fetch matching paginated results
    const cars = await Car.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: cars.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCars / limit),
        totalCars,
        limit,
      },
      cars,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single car details
// @route   GET /api/cars/:id
// @access  Public
exports.getCarById = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      res.status(404);
      throw new Error(`Car not found with id ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      car,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new car
// @route   POST /api/cars
// @access  Private/Admin
exports.createCar = async (req, res, next) => {
  try {
    const { make, model, year, type, pricePerDay, imageUrl } = req.body;

    if (!make || !model || !year || !type || !pricePerDay || !imageUrl) {
      res.status(400);
      throw new Error('Please enter all fields');
    }

    if (Number(pricePerDay) <= 0) {
      res.status(400);
      throw new Error('Price per day must be a positive number');
    }

    const car = await Car.create({
      make,
      model,
      year: Number(year),
      type,
      pricePerDay: Number(pricePerDay),
      imageUrl,
      isAvailable: true,
    });

    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      car,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a car details
// @route   PUT /api/cars/:id
// @access  Private/Admin
exports.updateCar = async (req, res, next) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      res.status(404);
      throw new Error(`Car not found with id ${req.params.id}`);
    }

    // Convert types and perform updates
    if (req.body.year) req.body.year = Number(req.body.year);
    if (req.body.pricePerDay) {
      const price = Number(req.body.pricePerDay);
      if (price <= 0) {
        res.status(400);
        throw new Error('Price per day must be a positive number');
      }
      req.body.pricePerDay = price;
    }

    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      car,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
exports.deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      res.status(404);
      throw new Error(`Car not found with id ${req.params.id}`);
    }

    await car.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload car image file
// @route   POST /api/upload/car-image
// @access  Private/Admin
exports.uploadCarImage = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image file');
    }

    res.status(200).json({
      success: true,
      message: 'Car image uploaded successfully',
      imageUrl: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    next(error);
  }
};
