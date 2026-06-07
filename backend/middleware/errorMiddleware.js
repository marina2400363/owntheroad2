// =================================================================
// MIDDLEWARE: errorMiddleware.js
// Catches all synchronous and asynchronous errors throughout the Express
// application pipelines, sending clean JSON responses and status codes.
// =================================================================

const errorHandler = (err, req, res, next) => {
  // If the status code is 200, force it to 500 (since it is an error handler)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Handle specific Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
  }
  
  // Handle Mongoose cast errors (invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    err.message = 'Resource not found: Invalid database ID format';
  }

  // Handle Mongoose duplicate key error (code 11000)
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
// Note: We also handle 404 routes separately in the server.js setup!
