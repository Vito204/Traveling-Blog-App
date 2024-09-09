const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");

//1.1 Render the register page
exports.getRegisterPage = (req, res) => {
  res.render("register", {
    title: "Register",
    user: req.user,
    error: "",
  });
};

//1.2 Register
exports.tryRegister = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    //check if user already exits
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", {
        title: "Register",
        user: req.user,
        error: "User already exists",
      });
    }
    //hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 9);
    //save the user into Database
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    //jump to the login page
    res.redirect("/auth/login");
  } catch (error) {
    res.render("register", {
      title: "Register",
      user: req.user,
      error: error.message,
    });
  }
};

//2.1 Render the login page
exports.getLoginPage = (req, res) => {
  res.render("login", {
    title: "Login",
    user: req.user,
    error: "",
  });
};

//2.2 Login
exports.tryLogin = async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    //1)error
    if (err) {
      return next(err);
    }
    //2)user not found
    if (!user) {
      return res.render("login", {
        title: "Login",
        user: req.user,
        error: info.message,
      });
    }
    //3)login successfully
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/user/profile");
    });
  })(req, res, next);
};

//3 Logout
exports.tryLogout = (req, res) => {
  req.logout(() => {
    if (typeof error != "undefined" && error) {
      return next(error);
    } else {
      res.redirect("/auth/login");
    }
  });
};
