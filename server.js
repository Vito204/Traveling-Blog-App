require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const passportConfig = require("./config/passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");

//PORT
const PORT = process.env.PORT || 3001;

//Middlewares:parsing the data of users
app.use(express.urlencoded({ extended: true }));

//Session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
  })
);

//Method override middleware
app.use(methodOverride("_method"));

//Config the passport
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

//Set EJS as the Template Engines
app.set("view engine", "ejs");

//Home Route
app.get("/", (req, res) => {
  res.render("home", {
    user: req.user,
    title: "Home",
    error: "",
  });
});

//Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/", commentRoutes);
app.use("/user", userRoutes);

//Connect to mongoose and start the server
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("DB connected successfully");
    app.listen(PORT, () => {
      console.log(`The server is running on port ${PORT}`);
    });
  })
  .catch(() => {
    console.log("Sorry, connection failed");
  });
