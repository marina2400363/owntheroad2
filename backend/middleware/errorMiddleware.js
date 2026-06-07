
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
  }
  
  if (err.name === 'CastError') {
    statusCode = 400;
    err.message = 'Resource not found: Invalid database ID format';
  }

  if (err.code === 11000) {
    statusCode = 400;
    err.message = 'Duplicate field value entered. User already exists.';
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
