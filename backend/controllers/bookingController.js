
const Booking = require('../models/Booking');
const Car = require('../models/Car');


exports.createBooking = async (req, res, next) => {
  try {
    const { carId, startDate, endDate } = req.body;

    if (!carId || !startDate || !endDate) {
      res.status(400);
      throw new Error('Please provide a car, start date, and end date');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    now.setHours(0, 0, 0, 0);

    if (start < now) {
      res.status(400);
      throw new Error('Start date cannot be in the past');
    }

    if (end <= start) {
      res.status(400);
      throw new Error('End date must be after the start date');
    }

    
    const car = await Car.findById(carId);
    if (!car) {
      res.status(404);
      throw new Error('Car not found');
    }

    if (!car.isAvailable) {
      res.status(400);
      throw new Error('This car is currently marked as unavailable by admin');
    }

    
    const conflictingBooking = await Booking.findOne({
      car: carId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start },
        },
      ],
    });

    if (conflictingBooking) {
      res.status(400);
      throw new Error('This car is already booked for the selected dates');
    }

    
    const timeDiff = end.getTime() - start.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1;
    const totalPrice = totalDays * car.pricePerDay;
    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: 'pending', 
    });

   
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('car', 'make model year type pricePerDay imageUrl');

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};


exports.getBookings = async (req, res, next) => {
  try {
    let bookings;

    if (req.user.isAdmin) {
      
      bookings = await Booking.find()
        .populate('user', 'name email licenseImage')
        .populate('car', 'make model year type pricePerDay imageUrl')
        .sort({ createdAt: -1 });
    } else {
      
      bookings = await Booking.find({ user: req.user._id })
        .populate('car', 'make model year type pricePerDay imageUrl')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};


exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email licenseImage')
      .populate('car', 'make model year type pricePerDay imageUrl');

    if (!booking) {
      res.status(404);
      throw new Error(`Booking not found with id ${req.params.id}`);
    }

    
    if (booking.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to view this booking');
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};


exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error(`Booking not found with id ${req.params.id}`);
    }

    
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin;

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to modify this booking');
    }

    
    if (!isAdmin) {
      if (req.body.status && req.body.status !== 'cancelled') {
        res.status(403);
        throw new Error('Users can only change booking status to cancelled');
      }
      booking.status = 'cancelled';
    } else {
     
      if (req.body.status) booking.status = req.body.status;
      if (req.body.pickupLocation) booking.pickupLocation = req.body.pickupLocation;
      if (req.body.startDate) booking.startDate = new Date(req.body.startDate);
      if (req.body.endDate) booking.endDate = new Date(req.body.endDate);
      
      
      if (req.body.startDate || req.body.endDate) {
        const carObj = await Car.findById(booking.car);
        const timeDiff = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1;
        booking.totalPrice = totalDays * carObj.pricePerDay;
      }
    }

    await booking.save();

   
    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('car', 'make model year type pricePerDay imageUrl');

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};


exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error(`Booking not found with id ${req.params.id}`);
    }

    
    if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to delete this booking');
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
