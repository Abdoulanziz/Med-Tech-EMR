const { User } = require('../models');

const requireLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/auth/signin');
  }
};

const checkUserRoleId = (roleId) => {
  return async (req, res, next) => {
    const userId = req.session.user.userId;
    const user = await User.findOne({ where: { userId } });
    
    if (user.roleId === roleId) {
      next();
    } else {
      res.redirect('/page/patients');
    }
  };
}

module.exports = { requireLogin,  checkUserRoleId};
