const User = require('../models/User');

// Middleware function to check if the user is logged in
const requireLogin = (req, res, next) => {
  if (req.session.user) {
      // User is logged in, proceed to the next middleware or route handler
      next();
  } else {
      // User is not logged in, redirect to the login page
      res.redirect('/auth/signin');
  }
};

// Middleware function to check user role
function checkUserRole(role) {
  return async (req, res, next) => {
    const userId = req.user.id; // Assuming you have user information in the request object
    const user = await User.findById(userId);
    
    if (user.role === role) {
      next(); // User has the required role
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  };
}

// // Usage example:
// app.get('/admin', checkUserRole('admin'), (req, res) => {
//   // Only users with the 'admin' role can access this route
//   // Your admin-specific code here
// });

module.exports = {checkUserRole, requireLogin};
