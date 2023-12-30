require("dotenv").config();
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const cors = require("cors");

const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = require('../config/database');



const { PORT, SESSION_SECRET, MODULE_NAME } = process.env;
const port = PORT || 5050;
const moduleName = MODULE_NAME || "general";

const initializeAdmin = require(`../modules/${moduleName}/middlewares/initializeAdmin`);

const app = express();

app.use(cors());

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, `../modules/${moduleName}/views`));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, `../modules/${moduleName}/public`)));
app.use(express.static(path.join(__dirname, `../modules/${moduleName}/uploads`)));


const sessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    name: 'mis.connect.sid',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);


sequelize
.authenticate()
.then(() => {
  sessionStore
  .sync()
  .then(() => {
    app.listen(port, () => {
      initializeAdmin();
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Session store sync error:', error);
  });
})
.catch(() => {
  console.log("Server failure!");
  process.exit(1);
});


app.use("/", require(`../modules/${moduleName}/routes/authRoutes`));
app.use("/auth", require(`../modules/${moduleName}/routes/authRoutes`));
app.use("/admin", require(`../modules/${moduleName}/routes/adminRoutes`));
app.use("/page", require(`../modules/${moduleName}/routes/pageRoutes`));
app.use("/api/v1/", require(`../modules/${moduleName}/routes/apiRoutes`));
app.use("*", (req, res) => res.redirect("/"));