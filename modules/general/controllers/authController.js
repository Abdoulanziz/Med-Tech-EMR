require("dotenv").config();
const Sequelize = require('sequelize');
const models = require('../models');
const bcrypt = require("bcrypt");
const { User } = require('../models');
const { Role } = require('../models');

const createAuditLog = require('../middlewares/auditLogger');


const renderIndex = (req, res) => {
  res.render("pages/index");
};

const renderSignin = (req, res) => {
  res.render("auth/signin");
};

// const handleSignin = async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const user = await User.findOne({ where: { username }});

//     if (!user) {
//       res.redirect("/auth/signin");
//       return;
//     }

//     const isValid = await bcrypt.compare(password, user.password);

//     if (isValid) {
//       req.session.user = user.dataValues;

//       // Modify the session data
//       req.session.lastLogin = new Date();

//       // Create an audit log
//       await createAuditLog('User', user.dataValues.userId, 'SIGNIN SUCCESSFUL', {}, user.dataValues, req.session.user.userId);

//       user.roleId === 1 ? res.redirect("/admin/dashboard") : res.redirect("/page/patients");

//     } else {

//       res.redirect("/auth/signin");
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


const handleSignin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username }});

    if (!user) {
      res.redirect("/auth/signin");
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      // Store the current lastLogin in the session before updating it
      const previousLastLogin = user.lastLogin || new Date();

      // Update lastLogin field
      await user.update({ lastLogin: new Date() });

      // Include lastLogin in the session user data
      req.session.user = {
        ...user.dataValues,
        lastLogin: previousLastLogin,
      };

      // Create an audit log
      await createAuditLog('User', user.dataValues.userId, 'SIGNIN SUCCESSFUL', {}, user.dataValues, req.session.user.userId);

      user.roleId === 1 ? res.redirect("/admin/dashboard") : res.redirect("/page/patients");

    } else {
      res.redirect("/auth/signin");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const handleSignout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Signout error:", error);
      res.status(500).json({ success: false, message: "Signout error" });
    } else {
      res.clearCookie("mis.connect.sid", { path: "/", expires: new Date(1) });
      res.status(200).json({ success: true });
    }
  });
};

module.exports = {
  renderIndex,
  renderSignin,
  handleSignin,
  handleSignout,
};
