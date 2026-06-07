
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');


exports.getStats = async (req, res, next) => {
  try {
    const totalCars = await Car.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();

    
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


exports.getUsers = async (req, res, next) => {
  try {
    
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


exports.makeUserAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error(`User not found with id ${req.params.id}`);
    }

    
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


exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error(`User not found with id ${req.params.id}`);
    }

    
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own administrative account');
    }

    
    await Booking.deleteMany({ user: user._id });
    
  
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User account and bookings deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
