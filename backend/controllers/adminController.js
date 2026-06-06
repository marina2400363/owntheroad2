// =================================================================
// CONTROLLER: adminController.js
// Part of the MVC Controller layer. Handles administrative actions:
// retrieval and management of users, administrative toggles, and
// compiling statistics for the Admin Dashboard.
// =================================================================

const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');

// @desc    Get dashboard metrics (Total cars, users, bookings, and revenue)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    const totalCars = await Car.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Calculate total revenue from 'confirmed' bookings
    const revenueStats = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCars,
        totalUsers,
        totalBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    // Return all users, sorting by newest registered first
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Make user an admin or remove admin status
// @route   PUT /api/admin/users/:id/admin
// @access  Private/Admin
exports.makeUserAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error(`User not found with id ${req.params.id}`);
    }

    // Toggle admin state
    user.isAdmin = !user.isAdmin;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User administrative privileges updated. Admin state: ${user.isAdmin}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (CRUD)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error(`User not found with id ${req.params.id}`);
    }

    // Prevent deleting self (currently logged-in admin)
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own administrative account');
    }

    // Remove user bookings as cascade deletion or leave them, let's remove bookings associated with this user
    await Booking.deleteMany({ user: user._id });
    
    // Delete the user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User account and bookings deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
