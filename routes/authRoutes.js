const express = require("express");
const authRoutes = express.Router();
const User = require("../models/User");
const {
  getRegisterPage,
  tryRegister,
  getLoginPage,
  tryLogin,
  tryLogout,
} = require("../controllers/authControllers");

//Render the register page
authRoutes.get("/register", getRegisterPage);

//Register
authRoutes.post("/register", tryRegister);

//Render the login page
authRoutes.get("/login", getLoginPage);

//Login
authRoutes.post("/login", tryLogin);

//Logout
authRoutes.get("/logout", tryLogout);

module.exports = authRoutes;
