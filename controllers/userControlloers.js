const cloudinary = require("../config/cloudinary");
const File = require("../models/File");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");

//1 Get Profile
exports.getProfile = async (req, res) => {
  //find the user
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user,
      error: "User not found, please login",
    });
  }
  //fetch all the posts
  const posts = await Post.find({ author: req.user._id }).sort({
    createdAt: -1,
  });
  res.render("profile", {
    title: "Profile",
    user,
    posts,
    error: "",
    postCount: posts.length,
  });
};

//2.1 Get editable profile
exports.getEditProfile = async (req, res) => {
  //find the user
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user,
      error: "User not found, please login",
    });
  }
  //render the editable page
  res.render("editProfile", {
    title: "Edit Profile",
    user,
    error: "",
    success: "",
  });
};

//2.2 Update Profile
exports.updateProfile = async (req, res) => {
  const { username, email, biography } = req.body;
  //find the user
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user,
      error: "User not found, please login",
    });
  }
  //update profile
  user.username = username || user.username;
  user.email = email || user.email;
  user.biography = biography || user.biography;
  if (req.file) {
    if (user.profilePicture && user.profilePicture.public_id) {
      await cloudinary.uploader.destroy(user.profilePicture.public_id);
    }
    const file = await File({
      url: req.file.path,
      public_id: req.file.filename,
      uploaded_by: req.user._id,
    });
    await file.save();
    user.profilePicture = {
      url: file.url,
      public_id: file.public_id,
    };
  }
  await user.save();
  //render the new profile page
  res.render("editProfile", {
    title: "Edit Profile",
    user,
    error: "",
    success: "Profile updated successfully!",
  });
};

//3 Delete user account
exports.deleteUserAccount = async (req, res) => {
  //find the user
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user,
      error: "User not found",
    });
  }
  //delete user's profile picture
  if (user.profilePicture && user.profilePicture.public_id) {
    await cloudinary.uploader.destroy(user.profilePicture.public_id);
  }
  //delete all posts of the user(including images and comments)
  const posts = await Post.find({ author: req.user._id });
  for (const post of posts) {
    for (const image of post.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);
  }
  //delete all comments made by the user
  await Comment.deleteMany({ author: req.user._id });
  //delete files uploaded by the user
  const files = await File.find({ uploaded_by: req.user._id });
  for (const file of files) {
    await cloudinary.uploader.destroy(file.public_id);
  }
  //delete user
  await User.findByIdAndDelete(req.user._id);
  //jump to the register page
  res.redirect("/auth/register");
};
