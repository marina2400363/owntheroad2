
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    next(new Error('Access denied. Administrator privileges required.'));
  }
};

module.exports = { admin };
