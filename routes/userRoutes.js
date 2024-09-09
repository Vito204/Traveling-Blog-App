const express = require("express");
const userRoutes = express.Router();
const User = require("../models/User");
const {
  getProfile,
  getEditProfile,
  updateProfile,
  deleteUserAccount,
} = require("../controllers/userControlloers");
const { ensureAuthenticated } = require("../middlewares/auth");
const upload = require("../config/multer");

//Render profile page
userRoutes.get("/profile", ensureAuthenticated, getProfile);

//Render Editable profile page
userRoutes.get("/edit", ensureAuthenticated, getEditProfile);

//Edit the profile
userRoutes.post(
  "/edit",
  ensureAuthenticated,
  upload.single("profilePicture"),
  updateProfile
);

//Delete user account
userRoutes.post("/delete", ensureAuthenticated, deleteUserAccount);

module.exports = userRoutes;
