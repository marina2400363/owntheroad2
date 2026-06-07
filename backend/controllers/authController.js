

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET || 'owntheroad_fallback_secret',
    { expiresIn: '30d' }
  );
};


exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please enter all fields');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

   
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          licenseImage: user.licenseImage,
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter email and password');
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.status(200).json({
      success: true,
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        licenseImage: user.licenseImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadLicense = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image file');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.licenseImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Driving license image uploaded successfully',
      imageUrl: user.licenseImage,
    });
  } catch (error) {
    next(error);
  }
};
