require("dotenv").config();
const express = require("express");
const pool = require("./db/index.db");
const { configservices } = require("./config/config.js");
const passport = require("passport");
const session = require("express-session");
const app = express();
const cors = require("cors");
const path = require("path");
const userRoute = require("./routes/user.routes.js");
const adminRoute = require("./routes/admin.routes.js");

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Database connected");
  }
});

app.use(
  cors({
    origin: "http://localhost:5163",
    credentials: true,
  })
);
app.set("view engine", "ejs");
// Set the directory for views
app.set("views", __dirname + "/views");

// middleware
app.use(express.json());
app.use(passport.initialize());
app.use(
  session({
    secret: configservices.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
    maxAge: 24 * 60 * 60 * 1000,
  })
);

//Initialize passport
app.use(passport.session());

app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

app.use("/auth", userRoute);
app.use("/admin", adminRoute);


app.get("/profile", (req, res) => {
  res.render("profile", { user: req.user });
});
// -----------------------------
const port = configservices.PORT;

app.listen(port, () => {
  console.log(`\x1b[33mServer : http://localhost:${port}\x1b[0m`);
});

// 404 middleware
// app.use((req, res, next) => {
//   res.status(404).json({
//     message: `🔥🔥 404 Not Found 🔥🔥`,
//   });
// });

// // error handling middleware
// app.use((err, req, res, next) => {
//   res
//     .status(500)
//     .json({ message: `🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 + ${err.message}` });
// });
