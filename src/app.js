require("dotenv").config();
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const cors = require("cors");

const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = require('../config/database');

const initializeAdmin = require('./common/middlewares/initializeAdmin');

const app = express();

app.use(cors());
app.set("view engine", "ejs");
// app.set('views', __dirname + '/general/views');
app.set('views', path.join(__dirname, 'general', 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./general/public")));
app.use(express.static(path.join(__dirname, "./general/uploads")));


const { PORT, SESSION_SECRET } = process.env;
const port = PORT || 5050;

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


app.use("/", require("./general/routes/authRoutes"));
app.use("/auth", require("./general/routes/authRoutes"));
app.use("/admin", require("./general/routes/adminRoutes"));
app.use("/page", require("./general/routes/pageRoutes"));
app.use("/api/v1/", require("./general/routes/apiRoutes"));
app.use("*", (req, res) => res.redirect("/"));